import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  Expense,
  MonthBudget,
  ExpenseFilter,
  MonthStats,
  CategorySummary,
  DailySummary,
  TransactionType,
} from '../types/finance';
import { DEFAULT_CATEGORIES } from '../utils/defaultData';
import {
  getCurrentYearMonth,
  getPreviousYearMonth,
  getNextYearMonth,
  getDaysInMonth,
  addMonthsToDate,
} from '../utils/formatters';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  // State
  categories: Category[];
  expenses: Expense[];
  budgets: MonthBudget[];
  selectedMonth: string;
  filter: ExpenseFilter;
  theme: 'light' | 'dark';
  isLoadingData: boolean;

  // Derived
  monthExpenses: Expense[];
  filteredExpenses: Expense[];
  stats: MonthStats;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string, reassignCategoryId?: string) => { success: boolean; error?: string };
  getCategoryById: (id: string) => Category | undefined;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  addInstallmentExpenses: (
    baseExpense: Omit<Expense, 'id' | 'createdAt' | 'installmentGroupId' | 'installmentNumber' | 'totalInstallments' | 'installmentTotalAmount'>,
    installmentsCount: number,
    totalAmount: number
  ) => Expense[];
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  deleteInstallmentGroup: (groupId: string) => void;
  duplicateExpense: (id: string) => void;
  clearMonthExpenses: () => void;

  // Budget Actions
  setMonthBudget: (month: string, limit: number) => void;
  getMonthBudget: (month: string) => number | null;

  // Navigation & Filters
  setSelectedMonth: (month: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  setFilter: (updates: Partial<ExpenseFilter>) => void;
  resetFilter: () => void;

  // Theme & App Actions
  toggleTheme: () => void;
  importData: (data: { categories?: Category[]; expenses?: Expense[]; budgets?: MonthBudget[] }) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  CATEGORIES: 'vitafin_categories_v2',
  EXPENSES: 'vitafin_expenses_v2',
  BUDGETS: 'vitafin_budgets_v2',
  THEME: 'vitafin_theme_v2',
};

const DEFAULT_FILTER: ExpenseFilter = {
  search: '',
  type: 'all',
  categoryId: 'all',
  paymentMethod: 'all',
  sortBy: 'date-desc',
};

// Helper to determine if category is income by icon/id/name heuristics if type is missing
function inferCategoryType(cat: { id?: string; name?: string; icon?: string; type?: string }): TransactionType {
  if (cat.type === 'income' || cat.type === 'expense') return cat.type;
  const incomeIcons = ['banknote', 'briefcase', 'trending-up', 'gift', 'wallet', 'coins', 'badge-dollar-sign'];
  if (cat.icon && incomeIcons.includes(cat.icon)) return 'income';
  const idLower = (cat.id || '').toLowerCase();
  if (idLower.includes('salario') || idLower.includes('freelance') || idLower.includes('invest') || idLower.includes('vendas') || idLower.includes('bonus') || idLower.includes('income') || idLower.includes('receita')) {
    return 'income';
  }
  return 'expense';
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('omnifinancas_theme_v1');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || localStorage.getItem('omnifinancas_categories_v1');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasIncomeCats = parsed.some((c: Category) => c.type === 'income' || inferCategoryType(c) === 'income');
          let combinedList: Category[] = parsed.map((c: Category) => ({
            ...c,
            type: (c.type || inferCategoryType(c)) as TransactionType,
          }));

          if (!hasIncomeCats) {
            const defaultIncomeCats = DEFAULT_CATEGORIES.filter((c) => c.type === 'income');
            combinedList = [...combinedList, ...defaultIncomeCats];
          }

          return combinedList.sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
          );
        }
      }
    } catch (e) {
      console.error('Erro ao carregar categorias do localStorage:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES) || localStorage.getItem('omnifinancas_expenses_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleanExpenses = parsed
            .filter((e: Expense) => !e.id?.startsWith('sample-'))
            .map((e: Expense) => ({
              ...e,
              type: e.type || 'expense',
            }));

          if (cleanExpenses.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(cleanExpenses));
          }
          return cleanExpenses;
        }
      }
    } catch (e) {
      console.error('Erro ao carregar despesas do localStorage:', e);
    }
    return [];
  });

  // Budgets state
  const [budgets, setBudgets] = useState<MonthBudget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS) || localStorage.getItem('omnifinancas_budgets_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Erro ao carregar orçamentos:', e);
    }
    return [];
  });

  // Navigation & Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth);
  const [filter, setFilterState] = useState<ExpenseFilter>(DEFAULT_FILTER);

  // Sync to localStorage ALWAYS (resilient offline backup & instant retrieval)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      if (user) {
        localStorage.setItem(`${STORAGE_KEYS.CATEGORIES}_${user.id}`, JSON.stringify(categories));
      }
    } catch (e) {
      console.error('Erro ao salvar categorias no storage:', e);
    }
  }, [categories, user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      if (user) {
        localStorage.setItem(`${STORAGE_KEYS.EXPENSES}_${user.id}`, JSON.stringify(expenses));
      }
    } catch (e) {
      console.error('Erro ao salvar despesas no storage:', e);
    }
  }, [expenses, user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      if (user) {
        localStorage.setItem(`${STORAGE_KEYS.BUDGETS}_${user.id}`, JSON.stringify(budgets));
      }
    } catch (e) {
      console.error('Erro ao salvar orçamentos no storage:', e);
    }
  }, [budgets, user]);

  // Safe Supabase Operations with Auto-fallback if schema lacks 'type' column
  const syncExpenseToSupabase = useCallback(async (exp: Expense, userId: string) => {
    if (!supabase) return;
    const payload: Record<string, unknown> = {
      id: exp.id,
      user_id: userId,
      title: exp.title,
      amount: exp.amount,
      date: exp.date,
      category_id: exp.categoryId || null,
      type: exp.type || 'expense',
      payment_method: exp.paymentMethod || 'pix',
      notes: exp.notes || null,
      installment_group_id: exp.installmentGroupId || null,
      installment_number: exp.installmentNumber || null,
      total_installments: exp.totalInstallments || null,
      installment_total_amount: exp.installmentTotalAmount || null,
      created_at: exp.createdAt,
    };

    const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
    if (error && (error.message?.includes('type') || error.code === 'PGRST204' || error.code === '42703')) {
      const { type: _, ...fallbackPayload } = payload;
      await supabase.from('expenses').upsert(fallbackPayload, { onConflict: 'id' });
    }
  }, []);

  const syncCategoryToSupabase = useCallback(async (cat: Category, userId: string) => {
    if (!supabase) return;
    const payload: Record<string, unknown> = {
      id: cat.id,
      user_id: userId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type || 'expense',
      is_default: Boolean(cat.isDefault),
      budget_limit: cat.budgetLimit || null,
    };

    const { error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' });
    if (error && (error.message?.includes('type') || error.code === 'PGRST204' || error.code === '42703')) {
      const { type: _, ...fallbackPayload } = payload;
      await supabase.from('categories').upsert(fallbackPayload, { onConflict: 'id' });
    }
  }, []);

  // Sync to/from Supabase when user is authenticated
  const loadSupabaseData = useCallback(async (userId: string) => {
    if (!supabase) return;
    setIsLoadingData(true);

    try {
      // 1. Carregar Categorias do Supabase
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      let currentCategories: Category[] = [];

      if (catError) {
        console.error('Erro ao buscar categorias do Supabase:', catError);
      } else if (catData && catData.length > 0) {
        const mappedCategories: Category[] = catData.map((c: Record<string, unknown>) => {
          const inferType = inferCategoryType({
            id: String(c.id),
            name: String(c.name),
            icon: String(c.icon),
            type: c.type as string | undefined,
          });
          return {
            id: String(c.id),
            name: String(c.name),
            color: String(c.color),
            icon: String(c.icon),
            type: ((c.type as Category['type']) || inferType) as TransactionType,
            isDefault: Boolean(c.is_default),
            budgetLimit: c.budget_limit ? Number(c.budget_limit) : undefined,
          };
        }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

        // Se o usuário ainda não tiver categorias de receita no Supabase, adiciona as padrões
        const hasIncome = mappedCategories.some((c) => c.type === 'income');
        if (!hasIncome) {
          const defaultIncomeCats = DEFAULT_CATEGORIES.filter((c) => c.type === 'income');
          const toInsert = defaultIncomeCats.map((c) => ({
            id: `${c.id}-${userId.slice(0, 8)}`,
            user_id: userId,
            name: c.name,
            color: c.color,
            icon: c.icon,
            type: 'income',
            is_default: true,
          }));

          const { error: insertErr } = await supabase.from('categories').insert(toInsert);
          if (insertErr && (insertErr.message?.includes('type') || insertErr.code === 'PGRST204' || insertErr.code === '42703')) {
            const fallbackInsert = toInsert.map(({ type: _, ...rest }) => rest);
            await supabase.from('categories').insert(fallbackInsert);
          }

          const newDefaultCats: Category[] = defaultIncomeCats.map((c) => ({
            ...c,
            id: `${c.id}-${userId.slice(0, 8)}`,
          }));
          currentCategories = [...mappedCategories, ...newDefaultCats].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        } else {
          currentCategories = mappedCategories;
        }

        setCategories(currentCategories);
      } else {
        // Se usuário não tiver categorias salvas no Supabase, envia as categorias padrão
        const initialCategories = DEFAULT_CATEGORIES.map((c) => ({
          id: `${c.id}-${userId.slice(0, 8)}`,
          user_id: userId,
          name: c.name,
          color: c.color,
          icon: c.icon,
          type: c.type || 'expense',
          is_default: Boolean(c.isDefault),
        }));

        const { error: insertErr } = await supabase.from('categories').insert(initialCategories);
        if (insertErr && (insertErr.message?.includes('type') || insertErr.code === 'PGRST204' || insertErr.code === '42703')) {
          const fallbackInsert = initialCategories.map(({ type: _, ...rest }) => rest);
          await supabase.from('categories').insert(fallbackInsert);
        }

        currentCategories = DEFAULT_CATEGORIES.map((c) => ({
          ...c,
          id: `${c.id}-${userId.slice(0, 8)}`,
        }));
        setCategories(currentCategories);
      }

      // 2. Carregar Despesas e Receitas do Supabase
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (expError) {
        console.error('Erro ao buscar lançamentos do Supabase:', expError);
      } else if (expData) {
        const catMap = new Map<string, Category>(currentCategories.map((c) => [c.id, c]));

        const mappedExpenses: Expense[] = expData.map((e: Record<string, unknown>) => {
          let itemType: TransactionType = (e.type as TransactionType);
          if (!itemType || (itemType !== 'expense' && itemType !== 'income')) {
            const linkedCat = catMap.get(String(e.category_id));
            if (linkedCat?.type === 'income') {
              itemType = 'income';
            } else {
              itemType = 'expense';
            }
          }

          return {
            id: String(e.id),
            title: String(e.title),
            amount: Number(e.amount),
            date: String(e.date),
            categoryId: String(e.category_id),
            type: itemType,
            paymentMethod: (e.payment_method as Expense['paymentMethod']) || 'pix',
            notes: e.notes ? String(e.notes) : undefined,
            installmentGroupId: e.installment_group_id ? String(e.installment_group_id) : undefined,
            installmentNumber: e.installment_number ? Number(e.installment_number) : undefined,
            totalInstallments: e.total_installments ? Number(e.total_installments) : undefined,
            installmentTotalAmount: e.installment_total_amount ? Number(e.installment_total_amount) : undefined,
            createdAt: String(e.created_at || new Date().toISOString()),
            updatedAt: e.updated_at ? String(e.updated_at) : undefined,
          };
        });

        // Mesclar com lançamentos locais pendentes (para não perder nada caso esteja recém adicionado)
        setExpenses((prevLocal) => {
          const dbIds = new Set(mappedExpenses.map((m) => m.id));
          const pendingLocal = prevLocal.filter((loc) => !dbIds.has(loc.id));

          // Sincronizar itens pendentes para o Supabase
          if (pendingLocal.length > 0) {
            pendingLocal.forEach((pend) => {
              syncExpenseToSupabase(pend, userId);
            });
          }

          return [...pendingLocal, ...mappedExpenses];
        });
      }

      // 3. Carregar Orçamentos
      const { data: bgData, error: bgError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (bgError) {
        console.error('Erro ao buscar orçamentos do Supabase:', bgError);
      } else if (bgData) {
        const mappedBudgets: MonthBudget[] = bgData.map((b: Record<string, unknown>) => ({
          month: String(b.month),
          limit: Number(b.limit_amount),
        }));
        setBudgets(mappedBudgets);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [syncExpenseToSupabase]);

  // Carregar dados na inicialização ou login do usuário
  useEffect(() => {
    if (user && supabase) {
      loadSupabaseData(user.id);
    } else if (!user) {
      // Carregar dados salvos do localStorage
      try {
        const savedExp = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        if (savedExp) {
          const parsed = JSON.parse(savedExp);
          if (Array.isArray(parsed)) {
            const cleanExpenses = parsed
              .filter((e: Expense) => !e.id?.startsWith('sample-'))
              .map((e: Expense) => ({ ...e, type: e.type || 'expense' }));
            setExpenses(cleanExpenses);
          }
        }
        const savedCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        if (savedCat) {
          const parsedCat = JSON.parse(savedCat);
          if (Array.isArray(parsedCat) && parsedCat.length > 0) {
            setCategories(parsedCat);
          }
        }
      } catch (e) {
        console.error('Erro ao restaurar dados locais:', e);
      }
    }
  }, [user, loadSupabaseData]);

  // Actions for Category
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCategory: Category = {
      ...categoryData,
      type: categoryData.type || 'expense',
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCategory]);

    if (user && supabase) {
      syncCategoryToSupabase(newCategory, user.id);
    }

    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );

    const client = supabase;
    if (user && client) {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.budgetLimit !== undefined) payload.budget_limit = updates.budgetLimit;

      client
        .from('categories')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .then(async ({ error }) => {
          if (error && (error.message?.includes('type') || error.code === 'PGRST204' || error.code === '42703')) {
            const { type: _, ...fallbackPayload } = payload;
            await client.from('categories').update(fallbackPayload).eq('id', id).eq('user_id', user.id);
          }
        });
    }
  };

  const deleteCategory = (id: string, reassignCategoryId?: string): { success: boolean; error?: string } => {
    const linkedExpenses = expenses.filter((e) => e.categoryId === id);

    if (linkedExpenses.length > 0) {
      if (!reassignCategoryId) {
        return {
          success: false,
          error: `Existem ${linkedExpenses.length} lançamento(s) nesta categoria. Selecione outra categoria para reatribuí-los antes de excluir.`,
        };
      }
      // Reassign linked expenses
      setExpenses((prev) =>
        prev.map((e) => (e.categoryId === id ? { ...e, categoryId: reassignCategoryId } : e))
      );

      if (user && supabase) {
        supabase
          .from('expenses')
          .update({ category_id: reassignCategoryId })
          .eq('category_id', id)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Erro ao reatribuir despesas no Supabase:', error);
          });
      }
    }

    setCategories((prev) => prev.filter((cat) => cat.id !== id));

    if (user && supabase) {
      supabase.from('categories').delete().eq('id', id).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao excluir categoria no Supabase:', error);
      });
    }

    return { success: true };
  };

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id);
  };

  // Actions for Expenses & Incomes
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      type: expenseData.type || 'expense',
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);

    if (user && supabase) {
      syncExpenseToSupabase(newExpense, user.id);
    }

    return newExpense;
  };

  const addInstallmentExpenses = (
    baseExpense: Omit<Expense, 'id' | 'createdAt' | 'installmentGroupId' | 'installmentNumber' | 'totalInstallments' | 'installmentTotalAmount'>,
    installmentsCount: number,
    totalAmount: number
  ): Expense[] => {
    const groupId = `inst-grp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const nowIso = new Date().toISOString();
    const count = Math.max(2, installmentsCount);

    const baseInstallmentAmount = Math.floor((totalAmount / count) * 100) / 100;
    const remainder = Math.round((totalAmount - baseInstallmentAmount * count) * 100) / 100;

    const newExpenses: Expense[] = [];

    for (let i = 1; i <= count; i++) {
      const installmentDate = addMonthsToDate(baseExpense.date, i);
      const currentAmount = i === count ? Number((baseInstallmentAmount + remainder).toFixed(2)) : baseInstallmentAmount;

      const item: Expense = {
        ...baseExpense,
        type: 'expense',
        id: `exp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        title: baseExpense.title,
        amount: currentAmount,
        date: installmentDate,
        paymentMethod: 'installment',
        installmentGroupId: groupId,
        installmentNumber: i,
        totalInstallments: count,
        installmentTotalAmount: totalAmount,
        createdAt: nowIso,
      };
      newExpenses.push(item);

      if (user && supabase) {
        syncExpenseToSupabase(item, user.id);
      }
    }

    setExpenses((prev) => [...newExpenses, ...prev]);
    return newExpenses;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updatedAt = new Date().toISOString();
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updates,
              updatedAt,
            }
          : e
      )
    );

    const client = supabase;
    if (user && client) {
      const payload: Record<string, unknown> = { updated_at: updatedAt };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      client
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .then(async ({ error }) => {
          if (error && (error.message?.includes('type') || error.code === 'PGRST204' || error.code === '42703')) {
            const { type: _, ...fallbackPayload } = payload;
            await client.from('expenses').update(fallbackPayload).eq('id', id).eq('user_id', user.id);
          }
        });
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (user && supabase) {
      supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao excluir lançamento no Supabase:', error);
      });
    }
  };

  const deleteInstallmentGroup = (groupId: string) => {
    setExpenses((prev) => prev.filter((e) => e.installmentGroupId !== groupId));

    if (user && supabase) {
      supabase.from('expenses').delete().eq('installment_group_id', groupId).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao excluir grupo de parcelas no Supabase:', error);
      });
    }
  };

  const duplicateExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;
    const duplicated: Expense = {
      ...target,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `${target.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      installmentGroupId: undefined,
      installmentNumber: undefined,
      totalInstallments: undefined,
      installmentTotalAmount: undefined,
    };
    setExpenses((prev) => [duplicated, ...prev]);

    if (user && supabase) {
      syncExpenseToSupabase(duplicated, user.id);
    }
  };

  const clearMonthExpenses = () => {
    const idsToDelete = expenses.filter((e) => e.date.startsWith(selectedMonth)).map((e) => e.id);
    setExpenses((prev) => prev.filter((e) => !e.date.startsWith(selectedMonth)));

    if (user && supabase && idsToDelete.length > 0) {
      supabase.from('expenses').delete().in('id', idsToDelete).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao limpar mês no Supabase:', error);
      });
    }
  };

  // Actions for Budget
  const setMonthBudget = (month: string, limit: number) => {
    const budgetId = `bgt-${month}-${user?.id || 'local'}`;
    setBudgets((prev) => {
      const existing = prev.find((b) => b.month === month);
      if (existing) {
        return prev.map((b) => (b.month === month ? { ...b, limit } : b));
      }
      return [...prev, { month, limit }];
    });

    if (user && supabase) {
      supabase.from('budgets').upsert({
        id: budgetId,
        user_id: user.id,
        month,
        limit_amount: limit,
      }, { onConflict: 'user_id,month' }).then(({ error }) => {
        if (error) console.error('Erro ao salvar orçamento no Supabase:', error);
      });
    }
  };

  const getMonthBudget = (month: string): number | null => {
    const found = budgets.find((b) => b.month === month);
    return found ? found.limit : null;
  };

  // Navigation
  const goToPreviousMonth = () => setSelectedMonth(getPreviousYearMonth(selectedMonth));
  const goToNextMonth = () => setSelectedMonth(getNextYearMonth(selectedMonth));
  const goToCurrentMonth = () => setSelectedMonth(getCurrentYearMonth());

  // Filter actions
  const setFilter = (updates: Partial<ExpenseFilter>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilter = () => {
    setFilterState(DEFAULT_FILTER);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const importData = (data: {
    categories?: Category[];
    expenses?: Expense[];
    budgets?: MonthBudget[];
  }) => {
    if (data.categories && data.categories.length > 0) {
      setCategories(data.categories);
    }
    if (data.expenses) {
      setExpenses(data.expenses);
    }
    if (data.budgets) {
      setBudgets(data.budgets);
    }
  };

  const resetToDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    setExpenses([]);
    setBudgets([]);
    setSelectedMonth(getCurrentYearMonth());
    setFilterState(DEFAULT_FILTER);
  };

  // Filtered by selected month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Filtered and Sorted for display
  const filteredExpenses = useMemo(() => {
    let result = [...monthExpenses];

    // Filter by type (all / expense / income)
    if (filter.type && filter.type !== 'all') {
      result = result.filter((e) => (e.type || 'expense') === filter.type);
    }

    // Filter by search text
    if (filter.search.trim()) {
      const searchLower = filter.search.toLowerCase().trim();
      result = result.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(searchLower);
        const notesMatch = (e.notes || '').toLowerCase().includes(searchLower);
        const category = categories.find((c) => c.id === e.categoryId);
        const catMatch = category?.name.toLowerCase().includes(searchLower) || false;
        return titleMatch || notesMatch || catMatch;
      });
    }

    // Filter by category
    if (filter.categoryId !== 'all') {
      result = result.filter((e) => e.categoryId === filter.categoryId);
    }

    // Filter by payment method
    if (filter.paymentMethod !== 'all') {
      result = result.filter((e) => {
        if (filter.paymentMethod === 'pix') {
          return e.paymentMethod === 'pix' || e.paymentMethod === 'debit';
        }
        return e.paymentMethod === filter.paymentMethod;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (filter.sortBy) {
        case 'date-desc':
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        case 'date-asc':
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(a.createdAt);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'title-asc':
          return a.title.localeCompare(b.title, 'pt-BR');
        case 'title-desc':
          return b.title.localeCompare(a.title, 'pt-BR');
        default:
          return 0;
      }
    });

    return result;
  }, [monthExpenses, filter, categories]);

  // Categorias sempre ordenadas em ordem alfabética (A a Z)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    );
  }, [categories]);

  // Computed Statistics for Selected Month
  const stats = useMemo<MonthStats>(() => {
    const expensesList = monthExpenses.filter((e) => (e.type || 'expense') === 'expense');
    const incomeList = monthExpenses.filter((e) => e.type === 'income');

    const totalExpenses = expensesList.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = incomeList.reduce((sum, item) => sum + item.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    const count = monthExpenses.length;
    const expenseCount = expensesList.length;
    const incomeCount = incomeList.length;

    const daysInMonth = getDaysInMonth(selectedMonth);
    const averagePerDay = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;

    let highestExpense: Expense | null = null;
    let lowestExpense: Expense | null = null;
    let highestIncome: Expense | null = null;

    if (expensesList.length > 0) {
      highestExpense = [...expensesList].sort((a, b) => b.amount - a.amount)[0] || null;
      lowestExpense = [...expensesList].sort((a, b) => a.amount - b.amount)[0] || null;
    }

    if (incomeList.length > 0) {
      highestIncome = [...incomeList].sort((a, b) => b.amount - a.amount)[0] || null;
    }

    // Category summaries for expenses
    const categoryTotalsMap = new Map<string, { total: number; count: number }>();
    expensesList.forEach((exp) => {
      const current = categoryTotalsMap.get(exp.categoryId) || { total: 0, count: 0 };
      categoryTotalsMap.set(exp.categoryId, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    });

    const categorySummaries: CategorySummary[] = sortedCategories
      .filter((c) => (c.type || 'expense') === 'expense')
      .map((category) => {
        const data = categoryTotalsMap.get(category.id) || { total: 0, count: 0 };
        const percentage = totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;
        return {
          category,
          total: data.total,
          percentage,
          count: data.count,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    // Category summaries for incomes
    const incomeCategoryTotalsMap = new Map<string, { total: number; count: number }>();
    incomeList.forEach((exp) => {
      const current = incomeCategoryTotalsMap.get(exp.categoryId) || { total: 0, count: 0 };
      incomeCategoryTotalsMap.set(exp.categoryId, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    });

    const incomeCategorySummaries: CategorySummary[] = sortedCategories
      .filter((c) => c.type === 'income')
      .map((category) => {
        const data = incomeCategoryTotalsMap.get(category.id) || { total: 0, count: 0 };
        const percentage = totalIncome > 0 ? (data.total / totalIncome) * 100 : 0;
        return {
          category,
          total: data.total,
          percentage,
          count: data.count,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    // Daily summaries for chart
    const dailyMap = new Map<number, { expenses: number; income: number }>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { expenses: 0, income: 0 });
    }

    monthExpenses.forEach((exp) => {
      const dayNum = parseInt(exp.date.split('-')[2], 10);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= daysInMonth) {
        const current = dailyMap.get(dayNum) || { expenses: 0, income: 0 };
        if (exp.type === 'income') {
          current.income += exp.amount;
        } else {
          current.expenses += exp.amount;
        }
        dailyMap.set(dayNum, current);
      }
    });

    const dailySummaries: DailySummary[] = Array.from(dailyMap.entries()).map(([day, val]) => {
      const [y, m] = selectedMonth.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, day);
      const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      return {
        date: `${selectedMonth}-${String(day).padStart(2, '0')}`,
        day,
        dayName,
        total: val.expenses,
        expenses: val.expenses,
        income: val.income,
      };
    });

    const currentBudget = getMonthBudget(selectedMonth);
    const budgetUsedPercentage = currentBudget && currentBudget > 0 ? (totalExpenses / currentBudget) * 100 : null;
    const remainingBudget = currentBudget !== null ? currentBudget - totalExpenses : null;

    return {
      total: totalExpenses,
      totalExpenses,
      totalIncome,
      netBalance,
      savingsRate,
      count,
      expenseCount,
      incomeCount,
      averagePerDay,
      highestExpense,
      lowestExpense,
      highestIncome,
      categorySummaries,
      incomeCategorySummaries,
      dailySummaries,
      budget: currentBudget,
      budgetUsedPercentage,
      remainingBudget,
    };
  }, [monthExpenses, sortedCategories, selectedMonth, budgets]);

  return (
    <FinanceContext.Provider
      value={{
        categories: sortedCategories,
        expenses,
        budgets,
        selectedMonth,
        filter,
        theme,
        isLoadingData,
        monthExpenses,
        filteredExpenses,
        stats,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        addExpense,
        addInstallmentExpenses,
        updateExpense,
        deleteExpense,
        deleteInstallmentGroup,
        duplicateExpense,
        clearMonthExpenses,
        setMonthBudget,
        getMonthBudget,
        setSelectedMonth,
        goToPreviousMonth,
        goToNextMonth,
        goToCurrentMonth,
        setFilter,
        resetFilter,
        toggleTheme,
        importData,
        resetToDefaults,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
};
