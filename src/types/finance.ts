export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'installment';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
  budgetLimit?: number; // Optional limit for this category
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // Stored as standard number, e.g., 150.50 (valor desta parcela ou valor único)
  date: string; // ISO format 'YYYY-MM-DD'
  categoryId: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt?: string;

  // Parcelamento
  installmentGroupId?: string;
  installmentNumber?: number; // ex: 1
  totalInstallments?: number; // ex: 6
  installmentTotalAmount?: number; // ex: 1200.00
}

export interface MonthBudget {
  month: string; // 'YYYY-MM'
  limit: number;
}

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc'
  | 'title-asc'
  | 'title-desc';

export interface ExpenseFilter {
  search: string;
  categoryId: string; // 'all' or category ID
  paymentMethod: string; // 'all' or payment method
  sortBy: SortOption;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface DailySummary {
  date: string;
  day: number;
  dayName: string;
  total: number;
}

export interface MonthStats {
  total: number;
  count: number;
  averagePerDay: number;
  highestExpense: Expense | null;
  lowestExpense: Expense | null;
  categorySummaries: CategorySummary[];
  dailySummaries: DailySummary[];
  budget: number | null;
  budgetUsedPercentage: number | null;
  remainingBudget: number | null;
}
