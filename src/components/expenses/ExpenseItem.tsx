import React, { useState } from 'react';
import { Expense } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '../../utils/formatters';
import { renderCategoryIcon } from '../../utils/icons';
import { Edit3, Trash2, Copy, MoreVertical, FileText, Layers, TrendingUp } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit }) => {
  const { getCategoryById, deleteExpense, deleteInstallmentGroup, duplicateExpense } = useFinance();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isInstallmentDeleteModalOpen, setIsInstallmentDeleteModalOpen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isIncome = expense.type === 'income';

  const category = getCategoryById(expense.categoryId) || {
    id: 'unknown',
    name: isIncome ? 'Outras Receitas' : 'Geral',
    color: isIncome ? '#10B981' : '#64748b',
    icon: isIncome ? 'banknote' : 'more-horizontal',
  };

  const paymentInfo = expense.paymentMethod
    ? PAYMENT_METHOD_LABELS[expense.paymentMethod]
    : null;

  const isInstallment = !!expense.installmentGroupId;

  const displayTitle = isInstallment && expense.installmentNumber
    ? expense.title.replace(/\s*\(\d+\/\d+\)$/, '')
    : expense.title;

  const handleDeleteClick = () => {
    if (isInstallment) {
      setIsInstallmentDeleteModalOpen(true);
    } else {
      setIsDeleteConfirmOpen(true);
    }
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/60 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 transition-all duration-150 shadow-sm hover:shadow">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Left side: Category Icon & Details */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Category Icon Badge */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: category.color }}
            >
              {renderCategoryIcon(category.icon, 'w-4 h-4 sm:w-6 sm:h-6')}
            </div>

            {/* Title, Category & Date */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-base truncate max-w-[140px] xs:max-w-xs sm:max-w-md">
                  {displayTitle}
                </h4>

                {/* Income Badge */}
                {isIncome && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    Receita
                  </span>
                )}

                {/* Parcelamento Badge */}
                {isInstallment && expense.installmentNumber && expense.totalInstallments && (
                  <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 dark:text-indigo-400" />
                    {expense.installmentNumber}/{expense.totalInstallments}
                  </span>
                )}

                {/* Payment Method Badge (apenas para despesas) */}
                {paymentInfo && !isInstallment && !isIncome && (
                  <span className="inline-flex items-center text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {paymentInfo.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span
                  className="font-medium inline-flex items-center gap-1 truncate max-w-[110px] sm:max-w-none"
                  style={{ color: category.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
                <span>•</span>
                <span className="flex-shrink-0">{formatDate(expense.date)}</span>

                {isInstallment && expense.installmentTotalAmount && (
                  <>
                    <span className="hidden xs:inline">•</span>
                    <span className="text-slate-400 dark:text-slate-500 hidden xs:inline">
                      Total: {formatCurrency(expense.installmentTotalAmount)}
                    </span>
                  </>
                )}

                {expense.notes && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {showNotes ? 'Ocultar' : 'Nota'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Amount & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <span
              className={`font-black text-xs sm:text-base lg:text-lg tabular-nums ${
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isIncome ? '+ ' : '- '}
              {formatCurrency(expense.amount)}
            </span>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => duplicateExpense(expense.id)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                title={isIncome ? 'Duplicar receita' : 'Duplicar gasto'}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                title={isIncome ? 'Editar receita' : 'Editar gasto'}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                title={isIncome ? 'Excluir receita' : 'Excluir gasto'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className="sm:hidden relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg active:bg-slate-100 dark:active:bg-slate-800"
                title="Opções"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20 bg-slate-900/10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 divide-y divide-slate-100 dark:divide-slate-700 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(expense);
                      }}
                      className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 active:bg-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        duplicateExpense(expense.id);
                      }}
                      className="w-full px-3 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 active:bg-slate-200"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleDeleteClick();
                      }}
                      className="w-full px-3 py-2.5 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 active:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Notes Section */}
        {showNotes && expense.notes && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 sm:p-3 rounded-xl">
            <span className="font-semibold text-slate-400 block mb-0.5">Nota:</span>
            {expense.notes}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => deleteExpense(expense.id)}
        title={isIncome ? 'Excluir Receita' : 'Excluir Gasto'}
        message={`Deseja realmente remover ${isIncome ? 'a receita' : 'o gasto'} "${expense.title}" no valor de ${formatCurrency(expense.amount)}?`}
        confirmText={isIncome ? 'Excluir Receita' : 'Excluir Gasto'}
      />

      {/* Delete Modal for Installment Purchases */}
      {isInstallment && (
        <Modal
          isOpen={isInstallmentDeleteModalOpen}
          onClose={() => setIsInstallmentDeleteModalOpen(false)}
          title="Excluir Gasto Parcelado"
          subtitle={`Este gasto faz parte de uma compra em ${expense.totalInstallments}x de ${formatCurrency(expense.amount)}.`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Você deseja remover apenas esta parcela do mês atual ou cancelar e excluir <strong>todas as parcelas</strong> vinculadas a esta compra?
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  deleteExpense(expense.id);
                  setIsInstallmentDeleteModalOpen(false);
                }}
                className="w-full p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Excluir apenas esta parcela ({expense.installmentNumber}/{expense.totalInstallments})
                </span>
                <span className="block text-[11px] text-slate-500">
                  As demais parcelas nos outros meses continuarão salvas.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (expense.installmentGroupId) {
                    deleteInstallmentGroup(expense.installmentGroupId);
                  }
                  setIsInstallmentDeleteModalOpen(false);
                }}
                className="w-full p-3 text-left rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors"
              >
                <span className="block text-xs font-bold text-rose-700 dark:text-rose-300">
                  Excluir TODAS as parcelas da compra
                </span>
                <span className="block text-[11px] text-rose-600/80 dark:text-rose-400/80">
                  Remove todas as {expense.totalInstallments} parcelas de todos os meses.
                </span>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsInstallmentDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
