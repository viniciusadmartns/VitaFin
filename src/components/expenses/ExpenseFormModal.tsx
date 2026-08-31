import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Expense, PaymentMethod, Category } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import {
  getTodayDateString,
  formatCurrency,
  addMonthsToDate,
  formatDate,
} from '../../utils/formatters';
import { renderCategoryIcon } from '../../utils/icons';
import { CategoryModal } from '../categories/CategoryModal';
import { CategoryManagerModal } from '../categories/CategoryManagerModal';
import {
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
  PlusCircle,
  Sparkles,
  Layers,
  Settings2,
  CalendarRange,
  Calculator,
} from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { categories, addExpense, addInstallmentExpenses, updateExpense, selectedMonth } =
    useFinance();

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');

  // Parcelamento States
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);
  const [installmentInputMode, setInstallmentInputMode] = useState<'total' | 'installment'>('total');
  const [showInstallmentSchedule, setShowInstallmentSchedule] = useState<boolean>(false);

  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    categoryId?: string;
    date?: string;
    installments?: string;
  }>({});

  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmountStr(expenseToEdit.amount.toString().replace('.', ','));
      setDate(expenseToEdit.date);
      setCategoryId(expenseToEdit.categoryId);
      setPaymentMethod(expenseToEdit.paymentMethod || 'pix');
      setNotes(expenseToEdit.notes || '');
      setInstallmentsCount(expenseToEdit.totalInstallments || 2);
      setInstallmentInputMode('installment');
    } else {
      setTitle('');
      setAmountStr('');
      const today = getTodayDateString();
      if (today.startsWith(selectedMonth)) {
        setDate(today);
      } else {
        setDate(`${selectedMonth}-01`);
      }
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setPaymentMethod('pix');
      setNotes('');
      setInstallmentsCount(2);
      setInstallmentInputMode('total');
    }
    setErrors({});
    setShowInstallmentSchedule(false);
  }, [expenseToEdit, isOpen, categories, selectedMonth]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9]*[.,]?[0-9]{0,2}$/.test(val) || val === '') {
      setAmountStr(val);
      if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleSetDateShortcut = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
  };

  // Cálculo das parcelas e total
  const rawInputNumber = parseFloat(amountStr.replace(',', '.')) || 0;
  const isInstallment = paymentMethod === 'installment';

  const computedTotalAmount = isInstallment
    ? installmentInputMode === 'total'
      ? rawInputNumber
      : rawInputNumber * installmentsCount
    : rawInputNumber;

  const computedPerInstallmentAmount = isInstallment
    ? installmentsCount > 0
      ? computedTotalAmount / installmentsCount
      : 0
    : rawInputNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Informe o nome ou descrição do gasto.';
    }

    if (isNaN(rawInputNumber) || rawInputNumber <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero.';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Selecione o tipo de gasto.';
    }

    if (!date) {
      newErrors.date = 'Informe a data do gasto.';
    }

    if (isInstallment && (!installmentsCount || installmentsCount < 2 || installmentsCount > 72)) {
      newErrors.installments = 'Informe entre 2 e 72 parcelas.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        title: title.trim(),
        amount: isInstallment ? computedPerInstallmentAmount : rawInputNumber,
        date,
        categoryId,
        paymentMethod,
        notes: notes.trim() || undefined,
        totalInstallments: isInstallment ? installmentsCount : undefined,
        installmentTotalAmount: isInstallment ? computedTotalAmount : undefined,
      });
    } else {
      if (isInstallment) {
        addInstallmentExpenses(
          {
            title: title.trim(),
            amount: computedPerInstallmentAmount,
            date,
            categoryId,
            paymentMethod: 'installment',
            notes: notes.trim() || undefined,
          },
          installmentsCount,
          computedTotalAmount
        );
      } else {
        addExpense({
          title: title.trim(),
          amount: rawInputNumber,
          date,
          categoryId,
          paymentMethod,
          notes: notes.trim() || undefined,
        });
      }
    }

    onClose();
  };

  const handleCategoryCreated = (newCat: Category) => {
    setCategoryId(newCat.id);
  };

  const quickInstallmentPresets = [2, 3, 4, 5, 6, 10, 12, 18, 24];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={expenseToEdit ? 'Editar Gasto' : 'Novo Lançamento de Gasto'}
        subtitle="Preencha as informações para registrar sua despesa"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Banner de Total em Destaque no Topo (Especial para Parcelamento ou Visão Geral) */}
          {isInstallment && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-4 rounded-2xl text-white shadow-md">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-200" />
                  Cálculo Total do Parcelamento
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                  {installmentsCount}x de {formatCurrency(computedPerInstallmentAmount)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-white/80 block">Valor Total da Compra:</span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    {formatCurrency(computedTotalAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/80 block">Mensalidade:</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-100">
                    {formatCurrency(computedPerInstallmentAmount)} / mês
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Valor do Gasto */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {isInstallment
                  ? installmentInputMode === 'total'
                    ? 'Valor Total da Compra (R$)'
                    : 'Valor da Parcela Mensal (R$)'
                  : 'Valor do Gasto (R$)'}{' '}
                <span className="text-rose-500">*</span>
              </label>

              {isInstallment && !expenseToEdit && (
                <div className="flex items-center gap-1 text-[11px] bg-slate-200/80 dark:bg-slate-700/80 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setInstallmentInputMode('total')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      installmentInputMode === 'total'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Valor Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstallmentInputMode('installment')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                      installmentInputMode === 'installment'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Por Parcela
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                R$
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                autoFocus={!expenseToEdit}
              />
            </div>
            {errors.amount && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'pix', label: 'PIX' },
                  { id: 'credit', label: 'Crédito' },
                  { id: 'debit', label: 'Débito' },
                  { id: 'cash', label: 'Dinheiro' },
                  { id: 'installment', label: 'Parcelado' },
                ] as const
              ).map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {method.id === 'installment' && <Layers className="w-3.5 h-3.5 text-emerald-500" />}
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuração Especial de Parcelamento */}
          {isInstallment && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Número de Parcelas ({installmentsCount}x)
                </label>
                <button
                  type="button"
                  onClick={() => setShowInstallmentSchedule(!showInstallmentSchedule)}
                  className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
                >
                  {showInstallmentSchedule ? 'Ocultar cronograma' : 'Ver cronograma das datas'}
                </button>
              </div>

              {/* Botões rápidos de parcelas */}
              <div className="flex flex-wrap gap-1.5">
                {quickInstallmentPresets.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInstallmentsCount(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      installmentsCount === num
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    {num}x
                  </button>
                ))}

                <div className="flex items-center gap-1.5 pl-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Outro:</span>
                  <input
                    type="number"
                    min={2}
                    max={72}
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(Math.max(2, parseInt(e.target.value, 10) || 2))}
                    className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cronograma visual das parcelas */}
              {showInstallmentSchedule && (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/80">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block mb-2">
                    Lançamentos que serão criados automaticamente mês a mês:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                    {Array.from({ length: Math.min(installmentsCount, 24) }).map((_, idx) => {
                      const installmentDate = addMonthsToDate(date, idx);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900 text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Parcela {idx + 1}/{installmentsCount}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {formatDate(installmentDate)}
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(computedPerInstallmentAmount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {installmentsCount > 24 && (
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      + {installmentsCount - 24} parcelas subsequentes geradas até o término.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nome do Gasto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-400" />
              Nome do Gasto / Descrição <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Ex: Supermercado, Smartphone, Notebook, Gasolina..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
            {errors.title && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Data do Gasto com atalhos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {isInstallment ? 'Data da 1ª Parcela' : 'Data do Gasto'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetDateShortcut(0)}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDateShortcut(1)}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Ontem
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
            {errors.date && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.date}</p>
            )}
          </div>

          {/* Tipo de Gasto (Categoria) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                Tipo de Gasto (Categoria) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                  title="Gerenciar, editar e excluir tipos de gasto"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Gerenciar Tipos
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Novo Tipo
                </button>
              </div>
            </div>

            {/* Visual Category Picker Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      if (errors.categoryId) {
                        setErrors((prev) => ({ ...prev, categoryId: undefined }));
                      }
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-3.5 h-3.5')}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        isSelected
                          ? 'text-emerald-950 dark:text-emerald-200 font-bold'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.categoryId && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.categoryId}</p>
            )}
          </div>

          {/* Observações / Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Observações (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais, garantia, local de compra..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
              {expenseToEdit
                ? 'Salvar Alterações'
                : isInstallment
                ? `Lançar ${installmentsCount} Parcelas`
                : 'Registrar Gasto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sub-modal to create Category on the fly */}
      <CategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onSaved={handleCategoryCreated}
      />

      {/* Sub-modal to manage categories */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
    </>
  );
};
