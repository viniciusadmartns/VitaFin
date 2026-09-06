import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Expense, PaymentMethod, Category, TransactionType } from '../../types/finance';
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
  PlusCircle,
  Sparkles,
  Layers,
  Settings2,
  CalendarRange,
  Calculator,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  defaultType?: TransactionType;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  defaultType = 'expense',
}) => {
  const { categories, addExpense, addInstallmentExpenses, updateExpense, selectedMonth } =
    useFinance();

  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Parcelamento States (exclusivo para despesas)
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

  // Categorias filtradas pelo tipo da transação atual
  const availableCategories = categories.filter(
    (c) => (c.type || 'expense') === transactionType
  );

  const prevIsOpenRef = React.useRef(false);
  const prevExpenseToEditIdRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    const changedExpense = expenseToEdit?.id !== prevExpenseToEditIdRef.current;

    prevIsOpenRef.current = isOpen;
    prevExpenseToEditIdRef.current = expenseToEdit?.id;

    if (justOpened || (isOpen && changedExpense)) {
      if (expenseToEdit) {
        const type = expenseToEdit.type || 'expense';
        setTransactionType(type);
        setTitle(expenseToEdit.title);
        setAmountStr(expenseToEdit.amount.toString().replace('.', ','));
        setDate(expenseToEdit.date);
        setCategoryId(expenseToEdit.categoryId);
        setPaymentMethod(expenseToEdit.paymentMethod || 'pix');
        setInstallmentsCount(expenseToEdit.totalInstallments || 2);
        setInstallmentInputMode('installment');
      } else {
        setTransactionType(defaultType);
        setTitle('');
        setAmountStr('');
        const today = getTodayDateString();
        if (today.startsWith(selectedMonth)) {
          setDate(today);
        } else {
          setDate(`${selectedMonth}-01`);
        }
        const initialCat = categories.find((c) => (c.type || 'expense') === defaultType);
        setCategoryId(initialCat ? initialCat.id : (categories[0]?.id || ''));
        setPaymentMethod('pix');
        setInstallmentsCount(2);
        setInstallmentInputMode('total');
      }
      setErrors({});
      setShowInstallmentSchedule(false);
    }
  }, [expenseToEdit, isOpen, defaultType, selectedMonth, categories]);

  // Se a categoria selecionada ficar incompatível ou vazia ao carregar, seleciona a primeira do tipo
  useEffect(() => {
    if (!isOpen) return;
    const matching = categories.filter((c) => (c.type || 'expense') === transactionType);
    if (matching.length > 0 && (!categoryId || !matching.some((c) => c.id === categoryId))) {
      setCategoryId(matching[0].id);
    }
  }, [isOpen, categories, transactionType, categoryId]);

  // Ao alternar o tipo (Despesa / Receita), seleciona a primeira categoria compatível se a atual for incompatível
  const handleTypeChange = (newType: TransactionType) => {
    setTransactionType(newType);
    if (newType === 'income') {
      if (paymentMethod === 'installment' || paymentMethod === 'credit' || paymentMethod === 'debit') {
        setPaymentMethod('pix');
      }
    }
    const currentCatObj = categories.find((c) => c.id === categoryId);
    if (!currentCatObj || (currentCatObj.type || 'expense') !== newType) {
      const firstMatching = categories.find((c) => (c.type || 'expense') === newType);
      if (firstMatching) {
        setCategoryId(firstMatching.id);
      }
    }
    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: undefined }));
    }
  };

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
  const isInstallment = transactionType === 'expense' && paymentMethod === 'installment';

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
      newErrors.title = transactionType === 'income'
        ? 'Informe a descrição ou fonte da receita.'
        : 'Informe o nome ou descrição do gasto.';
    }

    if (isNaN(rawInputNumber) || rawInputNumber <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero.';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Selecione uma categoria.';
    }

    if (!date) {
      newErrors.date = 'Informe a data do lançamento.';
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
        type: transactionType,
        paymentMethod: isIncome ? undefined : paymentMethod,
        notes: expenseToEdit.notes,
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
            type: 'expense',
            paymentMethod: 'installment',
          },
          installmentsCount,
          computedTotalAmount
        );
      } else {
        addExpense({
          title: title.trim(),
          amount: rawInputNumber,
          date: (!isIncome && paymentMethod === 'credit') ? addMonthsToDate(date, 1) : date,
          categoryId,
          type: transactionType,
          paymentMethod: isIncome ? undefined : paymentMethod,
        });
      }
    }

    onClose();
  };

  const handleCategoryCreated = (newCat: Category) => {
    setCategoryId(newCat.id);
  };

  const quickInstallmentPresets = [2, 3, 4, 5, 6, 10, 12];

  const expensePaymentMethods: { id: PaymentMethod; label: string }[] = [
    { id: 'pix', label: 'Pix/Débito' },
    { id: 'credit', label: 'Cartão' },
    { id: 'installment', label: 'Parcelamento' },
  ];

  const isIncome = transactionType === 'income';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          expenseToEdit
            ? isIncome ? 'Editar Receita' : 'Editar Gasto'
            : isIncome ? 'Nova Receita / Entrada' : 'Novo Lançamento de Gasto'
        }
        subtitle={
          isIncome
            ? 'Registre salários, rendimentos, freelances ou outras entradas'
            : 'Preencha as informações para registrar sua despesa do mês'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Segmented Switch: Despesa vs Receita */}
          {!expenseToEdit && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  !isIncome
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span>Despesa (Saída)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isIncome
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Receita (Entrada)</span>
              </button>
            </div>
          )}

          {/* Banner de Total em Destaque no Topo (Especial para Parcelamento) */}
          {isInstallment && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-3.5 sm:p-4 rounded-2xl text-white shadow-md">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-200" />
                  Cálculo do Parcelamento
                </span>
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                  {installmentsCount}x de {formatCurrency(computedPerInstallmentAmount)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[11px] sm:text-xs text-white/80 block">Valor Total:</span>
                  <span className="text-xl sm:text-3xl font-black tracking-tight">
                    {formatCurrency(computedTotalAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] sm:text-xs text-white/80 block">Mensalidade:</span>
                  <span className="text-sm sm:text-lg font-bold text-emerald-100">
                    {formatCurrency(computedPerInstallmentAmount)} / mês
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Valor da Transação */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <DollarSign className={`w-4 h-4 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`} />
                {isIncome
                  ? 'Valor Recebido (R$)'
                  : isInstallment
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
                    Total
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
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base sm:text-lg font-bold text-slate-400">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0,00"
                className={`w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 shadow-inner ${
                  isIncome ? 'focus:ring-emerald-500 text-emerald-600 dark:text-emerald-400' : 'focus:ring-indigo-500'
                }`}
                autoFocus={!expenseToEdit}
              />
            </div>
            {errors.amount && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Forma de Pagamento (Exclusivo para Despesas) */}
          {!isIncome && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {expensePaymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1 min-h-[38px] ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {method.id === 'installment' && <Layers className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                      <span>{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Configuração Especial de Parcelamento */}
          {isInstallment && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                  Número de Parcelas ({installmentsCount}x)
                </label>
                <button
                  type="button"
                  onClick={() => setShowInstallmentSchedule(!showInstallmentSchedule)}
                  className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
                >
                  {showInstallmentSchedule ? 'Ocultar datas' : 'Ver datas'}
                </button>
              </div>

              {/* Botões rápidos de parcelas com campo Outro no lugar do 18x/24x */}
              <div className="flex flex-wrap items-center gap-1.5">
                {quickInstallmentPresets.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInstallmentsCount(num)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all min-w-[36px] ${
                      installmentsCount === num
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    {num}x
                  </button>
                ))}

                <div className="flex items-center gap-1.5 pl-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Outro:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={2}
                    max={72}
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(Math.max(2, parseInt(e.target.value, 10) || 2))}
                    className="w-14 sm:w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cronograma visual das parcelas */}
              {showInstallmentSchedule && (
                <div className="mt-2.5 pt-2.5 border-t border-emerald-200 dark:border-emerald-800/80">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block mb-2">
                    Lançamentos gerados a partir do próximo mês:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
                    {Array.from({ length: Math.min(installmentsCount, 24) }).map((_, idx) => {
                      const installmentDate = addMonthsToDate(date, idx + 1);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900 text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {idx + 1}ª ({idx + 1}/{installmentsCount})
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

          {/* Nome do Lançamento */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              {isIncome ? 'Nome da Receita' : 'Nome do Gasto'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder={
                isIncome
                  ? 'Ex: Salário empresa, Dividendos FII, Freelance consultoria, Venda...'
                  : 'Ex: Supermercado, Smartphone, Notebook, Gasolina...'
              }
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm transition-all"
            />
            {errors.title && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Data do Lançamento com atalhos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                {isInstallment
                  ? 'Data da Compra'
                  : isIncome
                  ? 'Data do Recebimento'
                  : paymentMethod === 'credit'
                  ? 'Data da Compra'
                  : 'Data do Gasto'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetDateShortcut(0)}
                  className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDateShortcut(1)}
                  className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
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
              className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm transition-all cursor-pointer"
            />
            {/* Informação visual de vencimento / lançamento no mês seguinte */}
            {!isIncome && paymentMethod === 'credit' && (
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium flex items-center gap-1">
                <span>💳 Lançamento na fatura do mês seguinte:</span>
                <strong>{formatDate(addMonthsToDate(date, 1))}</strong>
              </p>
            )}
            {!isIncome && isInstallment && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
                <span>🗓️ 1ª parcela lançada no mês seguinte:</span>
                <strong>{formatDate(addMonthsToDate(date, 1))}</strong>
              </p>
            )}
            {errors.date && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.date}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                {isIncome ? 'Categoria de Receita' : 'Categoria de Despesa'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                  title="Gerenciar categorias"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Gerenciar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Nova</span>
                </button>
              </div>
            </div>

            {/* Visual Category Picker Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-44 overflow-y-auto p-1 custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl">
              {availableCategories.map((cat) => {
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
                    className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl text-left border transition-all min-h-[42px] ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-3 h-3 sm:w-3.5 sm:h-3.5')}
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={isIncome ? 'success' : 'primary'}
              size="sm"
              className={
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }
            >
              {expenseToEdit
                ? 'Salvar Alterações'
                : isIncome
                ? 'Registrar Receita'
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
        initialType={transactionType}
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
