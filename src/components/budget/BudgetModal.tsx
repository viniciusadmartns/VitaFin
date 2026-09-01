import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useFinance } from '../../context/FinanceContext';
import { formatMonthYear } from '../../utils/formatters';
import { Target, Trash2 } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const { selectedMonth, getMonthBudget, setMonthBudget } = useFinance();
  const [budgetStr, setBudgetStr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const current = getMonthBudget(selectedMonth);
    if (current && current > 0) {
      setBudgetStr(current.toString().replace('.', ','));
    } else {
      setBudgetStr('');
    }
    setError('');
  }, [selectedMonth, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetStr.trim()) {
      setError('Por favor, informe um valor de orçamento ou remova o limite.');
      return;
    }

    const numeric = parseFloat(budgetStr.replace(',', '.'));
    if (isNaN(numeric) || numeric <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    setMonthBudget(selectedMonth, numeric);
    onClose();
  };

  const handleRemoveBudget = () => {
    setMonthBudget(selectedMonth, 0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meta / Orçamento Mensal"
      subtitle={`Defina um limite de gastos para ${formatMonthYear(selectedMonth)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/50">
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 mb-1.5 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Teto de Gastos Desejado (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
              R$
            </span>
            <input
              type="text"
              value={budgetStr}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*[.,]?[0-9]{0,2}$/.test(val) || val === '') {
                  setBudgetStr(val);
                  if (error) setError('');
                }
              }}
              placeholder="Ex: 3500,00"
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>
          {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          O aplicativo calculará o percentual consumido e alertará visualmente caso seus gastos se aproximem ou ultrapassem este valor.
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {getMonthBudget(selectedMonth) ? (
            <button
              type="button"
              onClick={handleRemoveBudget}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover Meta
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Orçamento
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
