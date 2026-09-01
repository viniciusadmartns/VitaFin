import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  Expense,
  MonthBudget,
  ExpenseFilter,
  MonthStats,
  CategorySummary,
  DailySummary,
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
  categoryId: 'all',
  paymentMethod: 'all',
  sortBy: 'date-desc',
};

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
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
          // Remover qualquer gasto de exemplo/fictício que tenha ficado salvo
          const cleanExpenses = parsed.filter((e: Expense) => !e.id?.startsWith('sample-'));
          // Se limpou itens fictícios, atualiza o storage imediatamente
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

  // Sync to/from Supabase when user is authenticated
  const loadSupabaseData = useCallback(async (userId: string) => {
    if (!supabase) return;
    setIsLoadingData(true);

    try {
      // 1. Carregar Categorias
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (catError) {
        console.error('Erro ao buscar categorias do Supabase:', catError);
      } else if (catData && catData.length > 0) {
        const mappedCategories: Category[] = catData.map((c: Record<string, unknown>) => ({
          id: String(c.id),
          name: String(c.name),
          color: String(c.color),
          icon: String(c.icon),
          isDefault: Boolean(c.is_default),
          budgetLimit: c.budget_limit ? Number(c.budget_limit) : undefined,
        }));
        setCategories(mappedCategories);
      } else {
        // Se usuário não tiver categorias salvas no Supabase, envia as categorias padrão
        const initialCategories = DEFAULT_CATEGORIES.map((c) => ({
          id: c.id,
          user_id: userId,
          name: c.name,
          color: c.color,
          icon: c.icon,
          is_default: Boolean(c.isDefault),
        }));
        await supabase.from('categories').insert(initialCategories);
        setCategories(DEFAULT_CATEGORIES);
      }

      // 2. Carregar Despesas
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (expError) {
        console.error('Erro ao buscar despesas do Supabase:', expError);
      } else if (expData) {
        const mappedExpenses: Expense[] = expData.map((e: Record<string, unknown>) => ({
          id: String(e.id),
          title: String(e.title),
          amount: Number(e.amount),
          date: String(e.date),
          categoryId: String(e.category_id),
          paymentMethod: (e.payment_method as Expense['paymentMethod']) || 'credit',
          notes: e.notes ? String(e.notes) : undefined,
          installmentGroupId: e.installment_group_id ? String(e.installment_group_id) : undefined,
          installmentNumber: e.installment_number ? Number(e.installment_number) : undefined,
          totalInstallments: e.total_installments ? Number(e.total_installments) : undefined,
          installmentTotalAmount: e.installment_total_amount ? Number(e.installment_total_amount) : undefined,
          createdAt: String(e.created_at || new Date().toISOString()),
          updatedAt: e.updated_at ? String(e.updated_at) : undefined,
        }));
        setExpenses(mappedExpenses);
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
  }, []);

  useEffect(() => {
    if (user && supabase) {
      loadSupabaseData(user.id);
    } else if (!user) {
      // Carregar localStorage caso saia da conta
      try {
        const savedExp = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        if (savedExp) {
          const parsed = JSON.parse(savedExp);
          if (Array.isArray(parsed)) {
            const cleanExpenses = parsed.filter((e: Expense) => !e.id?.startsWith('sample-'));
            setExpenses(cleanExpenses);
          }
        }
        const savedCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        if (savedCat) setCategories(JSON.parse(savedCat));
      } catch (e) {
        console.error('Erro ao restaurar dados locais:', e);
      }
    }
  }, [user, loadSupabaseData]);

  // Sync to localStorage as local backup
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      } catch (e) {
        console.error('Erro ao salvar categorias:', e);
      }
    }
  }, [categories, user]);

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      } catch (e) {
        console.error('Erro ao salvar gastos:', e);
      }
    }
  }, [expenses, user]);

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      } catch (e) {
        console.error('Erro ao salvar orçamentos:', e);
      }
    }
  }, [budgets, user]);

  // Actions for Category
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCategory]);

    if (user && supabase) {
      supabase.from('categories').insert({
        id: newCategory.id,
        user_id: user.id,
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon,
        is_default: false,
        budget_limit: newCategory.budgetLimit || null,
      }).then(({ error }) => {
        if (error) console.error('Erro ao salvar categoria no Supabase:', error);
      });
    }

    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );

    if (user && supabase) {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.budgetLimit !== undefined) payload.budget_limit = updates.budgetLimit;

      supabase.from('categories').update(payload).eq('id', id).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao atualizar categoria no Supabase:', error);
      });
    }
  };

  const deleteCategory = (id: string, reassignCategoryId?: string): { success: boolean; error?: string } => {
    const linkedExpenses = expenses.filter((e) => e.categoryId === id);

    if (linkedExpenses.length > 0) {
      if (!reassignCategoryId) {
        return {
          success: false,
          error: `Existem ${linkedExpenses.length} despesa(s) nesta categoria. Selecione outra categoria para reatribuí-las antes de excluir.`,
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

  // Actions for Expenses
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);

    if (user && supabase) {
      supabase.from('expenses').insert({
        id: newExpense.id,
        user_id: user.id,
        title: newExpense.title,
        amount: newExpense.amount,
        date: newExpense.date,
        category_id: newExpense.categoryId,
        payment_method: newExpense.paymentMethod || 'credit',
        notes: newExpense.notes || null,
        created_at: newExpense.createdAt,
      }).then(({ error }) => {
        if (error) console.error('Erro ao inserir despesa no Supabase:', error);
      });
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
    const supabasePayloads: Record<string, unknown>[] = [];

    for (let i = 1; i <= count; i++) {
      const installmentDate = addMonthsToDate(baseExpense.date, i - 1);
      const currentAmount = i === count ? Number((baseInstallmentAmount + remainder).toFixed(2)) : baseInstallmentAmount;

      const item: Expense = {
        ...baseExpense,
        id: `exp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        title: `${baseExpense.title} (${i}/${count})`,
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
        supabasePayloads.push({
          id: item.id,
          user_id: user.id,
          title: item.title,
          amount: item.amount,
          date: item.date,
          category_id: item.categoryId,
          payment_method: 'installment',
          notes: item.notes || null,
          installment_group_id: groupId,
          installment_number: i,
          total_installments: count,
          installment_total_amount: totalAmount,
          created_at: nowIso,
        });
      }
    }

    setExpenses((prev) => [...newExpenses, ...prev]);

    if (user && supabase && supabasePayloads.length > 0) {
      supabase.from('expenses').insert(supabasePayloads).then(({ error }) => {
        if (error) console.error('Erro ao inserir parcelas no Supabase:', error);
      });
    }

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

    if (user && supabase) {
      const payload: Record<string, unknown> = { updated_at: updatedAt };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.amount !== undefined) payload.amount = updates.amount;
      if (updates.date !== undefined) payload.date = updates.date;
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
      if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) payload.notes = updates.notes;

      supabase.from('expenses').update(payload).eq('id', id).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao atualizar despesa no Supabase:', error);
      });
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (user && supabase) {
      supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Erro ao excluir despesa no Supabase:', error);
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
      supabase.from('expenses').insert({
        id: duplicated.id,
        user_id: user.id,
        title: duplicated.title,
        amount: duplicated.amount,
        date: duplicated.date,
        category_id: duplicated.categoryId,
        payment_method: duplicated.paymentMethod || 'credit',
        notes: duplicated.notes || null,
        created_at: duplicated.createdAt,
      }).then(({ error }) => {
        if (error) console.error('Erro ao duplicar no Supabase:', error);
      });
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
      result = result.filter((e) => e.paymentMethod === filter.paymentMethod);
    }

    // Sort
    result.sort((a, b) => {
      switch (filter.sortBy) {
        case 'date-desc':
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        case 'date-asc':
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
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

  // Computed Statistics for Selected Month
  const stats = useMemo<MonthStats>(() => {
    const total = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
    const count = monthExpenses.length;
    const daysInMonth = getDaysInMonth(selectedMonth);
    const averagePerDay = daysInMonth > 0 ? total / daysInMonth : 0;

    let highestExpense: Expense | null = null;
    let lowestExpense: Expense | null = null;

    if (monthExpenses.length > 0) {
      highestExpense = [...monthExpenses].sort((a, b) => b.amount - a.amount)[0] || null;
      lowestExpense = [...monthExpenses].sort((a, b) => a.amount - b.amount)[0] || null;
    }

    // Category summaries
    const categoryTotalsMap = new Map<string, { total: number; count: number }>();
    monthExpenses.forEach((exp) => {
      const current = categoryTotalsMap.get(exp.categoryId) || { total: 0, count: 0 };
      categoryTotalsMap.set(exp.categoryId, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    });

    const categorySummaries: CategorySummary[] = categories
      .map((category) => {
        const data = categoryTotalsMap.get(category.id) || { total: 0, count: 0 };
        const percentage = total > 0 ? (data.total / total) * 100 : 0;
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
    const dailyMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, 0);
    }

    monthExpenses.forEach((exp) => {
      const dayNum = parseInt(exp.date.split('-')[2], 10);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= daysInMonth) {
        dailyMap.set(dayNum, (dailyMap.get(dayNum) || 0) + exp.amount);
      }
    });

    const dailySummaries: DailySummary[] = Array.from(dailyMap.entries()).map(([day, dayTotal]) => {
      const [y, m] = selectedMonth.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, day);
      const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      return {
        date: `${selectedMonth}-${String(day).padStart(2, '0')}`,
        day,
        dayName,
        total: dayTotal,
      };
    });

    const currentBudget = getMonthBudget(selectedMonth);
    const budgetUsedPercentage = currentBudget && currentBudget > 0 ? (total / currentBudget) * 100 : null;
    const remainingBudget = currentBudget !== null ? currentBudget - total : null;

    return {
      total,
      count,
      averagePerDay,
      highestExpense,
      lowestExpense,
      categorySummaries,
      dailySummaries,
      budget: currentBudget,
      budgetUsedPercentage,
      remainingBudget,
    };
  }, [monthExpenses, categories, selectedMonth, budgets]);

  return (
    <FinanceContext.Provider
      value={{
        categories,
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

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser utilizado dentro de um FinanceProvider');
  }
  return context;
};
