import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense, TransactionType } from '../../types/finance';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseFormModal } from './ExpenseFormModal';
import { Button } from '../common/Button';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { exportExpensesToCSV } from '../../utils/export';
import {
  Plus,
  Download,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface ExpenseListProps {
  onOpenNewExpense: (type?: TransactionType) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ onOpenNewExpense }) => {
  const { filteredExpenses, monthExpenses, categories, selectedMonth, stats } = useFinance();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleExportCSV = () => {
    const monthLabel = formatMonthYear(selectedMonth);
    exportExpensesToCSV(filteredExpenses, categories, monthLabel);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Section Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            Extrato de Lançamentos
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Entradas: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(stats.totalIncome)}</strong> • Saídas: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(stats.totalExpenses)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
          {filteredExpenses.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              onClick={handleExportCSV}
              title="Exportar planilha Excel/CSV dos lançamentos filtrados"
              className="text-xs px-2.5 sm:px-3 py-1.5"
            >
              <span className="hidden xs:inline">Exportar</span> CSV
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />}
            onClick={() => onOpenNewExpense('income')}
            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs px-2.5 sm:px-3 py-1.5 font-semibold"
          >
            + Receita
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            onClick={() => onOpenNewExpense('expense')}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-xs px-3 sm:px-3.5 py-1.5 font-semibold"
          >
            + Despesa
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ExpenseFilters />

      {/* Expense Items List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-2.5 sm:space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-10 sm:py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
            <Receipt className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1">
            Nenhum lançamento encontrado
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            {monthExpenses.length > 0
              ? 'Nenhum lançamento corresponde aos filtros aplicados. Tente limpar os filtros de busca.'
              : `Você ainda não cadastrou receitas ou despesas para ${formatMonthYear(selectedMonth)}.`}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
              onClick={() => onOpenNewExpense('income')}
              className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
            >
              Adicionar Receita
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<TrendingDown className="w-4 h-4" />}
              onClick={() => onOpenNewExpense('expense')}
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            >
              Cadastrar Despesa
            </Button>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        expenseToEdit={editingExpense}
      />
    </div>
  );
};
