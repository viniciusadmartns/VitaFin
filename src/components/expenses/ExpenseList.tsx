import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Expense } from '../../types/finance';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseFormModal } from './ExpenseFormModal';
import { Button } from '../common/Button';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { exportExpensesToCSV } from '../../utils/export';
import { Plus, Download, Receipt } from 'lucide-react';

interface ExpenseListProps {
  onOpenNewExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ onOpenNewExpense }) => {
  const { filteredExpenses, monthExpenses, categories, selectedMonth } = useFinance();
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

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Section Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Lançamentos de Gastos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total filtrado: <strong className="text-slate-900 dark:text-white">{formatCurrency(totalFilteredAmount)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredExpenses.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
              title="Exportar planilha Excel/CSV dos gastos filtrados"
            >
              Exportar CSV
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenNewExpense}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          >
            Novo Gasto
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ExpenseFilters />

      {/* Expense Items List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3.5">
            <Receipt className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Nenhum gasto encontrado
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            {monthExpenses.length > 0
              ? 'Nenhum gasto corresponde aos filtros aplicados. Tente limpar os filtros de busca.'
              : `Você ainda não cadastrou despesas para ${formatMonthYear(selectedMonth)}.`}
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenNewExpense}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          >
            Cadastrar Primeiro Gasto
          </Button>
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
