import React, { useState, useEffect } from 'react';
import { Dividend, DividendType } from '../../types/investment';
import { useInvestment } from '../../context/InvestmentContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface DividendFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dividendToEdit?: Dividend | null;
}

const DIVIDEND_TYPES: { value: DividendType; label: string }[] = [
  { value: 'dividend', label: 'Dividendo' },
  { value: 'jcp', label: 'Juros sobre Capital Próprio (JCP)' },
  { value: 'income', label: 'Rendimento (FII)' },
  { value: 'bonus', label: 'Bonificação' },
];

type CalculationMode = 'per-share' | 'total';

export const DividendFormModal: React.FC<DividendFormModalProps> = ({
  isOpen,
  onClose,
  dividendToEdit,
}) => {
  const { assets, addDividend, updateDividend } = useInvestment();

  const [formData, setFormData] = useState({
    assetId: '',
    type: 'dividend' as DividendType,
    amountPerShare: 0,
    totalAmount: 0,
    quantity: 0,
    paymentDate: '',
    referenceDate: '',
    notes: '',
  });

  // String states para inputs decimais
  const [amountPerShareStr, setAmountPerShareStr] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [quantityStr, setQuantityStr] = useState('');
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('per-share');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dividendToEdit) {
      setFormData({
        assetId: dividendToEdit.assetId,
        type: dividendToEdit.type,
        amountPerShare: dividendToEdit.amountPerShare,
        totalAmount: dividendToEdit.totalAmount,
        quantity: dividendToEdit.quantity,
        paymentDate: dividendToEdit.paymentDate,
        referenceDate: dividendToEdit.referenceDate || '',
        notes: dividendToEdit.notes || '',
      });
      setAmountPerShareStr(dividendToEdit.amountPerShare.toFixed(2).replace('.', ','));
      setTotalAmountStr(dividendToEdit.totalAmount.toFixed(2).replace('.', ','));
      setQuantityStr(dividendToEdit.quantity.toString());
    } else {
      // Resetar quando abrir modal vazio
      setFormData({
        assetId: '',
        type: 'dividend' as DividendType,
        amountPerShare: 0,
        totalAmount: 0,
        quantity: 0,
        paymentDate: '',
        referenceDate: '',
        notes: '',
      });
      setAmountPerShareStr('');
      setTotalAmountStr('');
      setQuantityStr('');
      setCalculationMode('per-share');
    }
    setErrors({});
  }, [dividendToEdit, isOpen]);

  // Atualizar quantidade automaticamente ao selecionar ativo
  useEffect(() => {
    if (!dividendToEdit && formData.assetId) {
      const selectedAsset = assets.find(a => a.id === formData.assetId);
      if (selectedAsset) {
        setFormData(prev => ({ ...prev, quantity: selectedAsset.quantity }));
        setQuantityStr(selectedAsset.quantity.toString());
      }
    }
  }, [formData.assetId, assets, dividendToEdit]);

  const parseDecimal = (value: string): number => {
    if (!value) return 0;
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleAmountPerShareChange = (value: string) => {
    setAmountPerShareStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => {
      const newData = { ...prev, amountPerShare: numValue };
      // Recalcular total
      if (calculationMode === 'per-share' && prev.quantity > 0) {
        newData.totalAmount = numValue * prev.quantity;
        setTotalAmountStr((numValue * prev.quantity).toFixed(2).replace('.', ','));
      }
      return newData;
    });
    if (errors.amountPerShare) {
      setErrors(prev => ({ ...prev, amountPerShare: '' }));
    }
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmountStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => {
      const newData = { ...prev, totalAmount: numValue };
      // Recalcular por ação
      if (calculationMode === 'total' && prev.quantity > 0) {
        newData.amountPerShare = numValue / prev.quantity;
        setAmountPerShareStr((numValue / prev.quantity).toFixed(4).replace('.', ','));
      }
      return newData;
    });
    if (errors.totalAmount) {
      setErrors(prev => ({ ...prev, totalAmount: '' }));
    }
  };

  const handleQuantityChange = (value: string) => {
    setQuantityStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => {
      const newData = { ...prev, quantity: numValue };
      // Recalcular o campo dependente
      if (calculationMode === 'per-share' && prev.amountPerShare > 0) {
        newData.totalAmount = prev.amountPerShare * numValue;
        setTotalAmountStr((prev.amountPerShare * numValue).toFixed(2).replace('.', ','));
      } else if (calculationMode === 'total' && prev.totalAmount > 0) {
        newData.amountPerShare = prev.totalAmount / numValue;
        setAmountPerShareStr((prev.totalAmount / numValue).toFixed(4).replace('.', ','));
      }
      return newData;
    });
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetId) {
      newErrors.assetId = 'Selecione um ativo';
    }
    if (formData.amountPerShare <= 0) {
      newErrors.amountPerShare = 'Valor por ação/cota deve ser maior que zero';
    }
    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Valor total deve ser maior que zero';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Data de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const selectedAsset = assets.find(a => a.id === formData.assetId);
    if (!selectedAsset) return;

    const dividendData = {
      assetId: formData.assetId,
      type: formData.type,
      amountPerShare: formData.amountPerShare,
      totalAmount: formData.totalAmount,
      quantity: formData.quantity,
      paymentDate: formData.paymentDate,
      referenceDate: formData.referenceDate,
      notes: formData.notes,
      ticker: selectedAsset.ticker,
    };

    if (dividendToEdit) {
      updateDividend(dividendToEdit.id, dividendData);
    } else {
      addDividend(dividendData);
    }

    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedAsset = assets.find(a => a.id === formData.assetId);

  // Data padrão (hoje)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dividendToEdit ? 'Editar Provento' : 'Registrar Provento'}
      subtitle="Registre dividendos, JCP, rendimentos e bonificações recebidos"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de Ativo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Ativo
          </label>
          <select
            value={formData.assetId}
            onChange={(e) => handleChange('assetId', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.assetId
                ? 'border-rose-300 dark:border-rose-700'
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          >
            <option value="">Selecione um ativo</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.ticker} - {asset.name} ({asset.quantity} cotas/ações)
              </option>
            ))}
          </select>
          {errors.assetId && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.assetId}</p>
          )}
        </div>

        {/* Tipo de Provento */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Tipo de Provento
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as DividendType)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {DIVIDEND_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Modo de Cálculo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Forma de Registro
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCalculationMode('per-share')}
              className={`px-4 py-2.5 rounded-xl border transition-all font-medium text-sm ${
                calculationMode === 'per-share'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              Valor por Ação/Cota
            </button>
            <button
              type="button"
              onClick={() => setCalculationMode('total')}
              className={`px-4 py-2.5 rounded-xl border transition-all font-medium text-sm ${
                calculationMode === 'total'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              Valor Total Recebido
            </button>
          </div>
        </div>

        {/* Campos de Entrada baseados no modo */}
        <div className="space-y-4">
          {calculationMode === 'per-share' ? (
            <>
              {/* Valor por Ação (Principal) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Valor por Ação/Cota
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountPerShareStr}
                  onChange={(e) => handleAmountPerShareChange(e.target.value)}
                  placeholder="R$ 0,50"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.amountPerShare
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.amountPerShare && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.amountPerShare}</p>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Quantidade de Ações/Cotas
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={quantityStr}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="100"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.quantity
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.quantity}</p>
                )}
                {selectedAsset && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Posição atual: {selectedAsset.quantity} cotas/ações
                  </p>
                )}
              </div>

              {/* Total Calculado */}
              {formData.amountPerShare > 0 && formData.quantity > 0 && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Total Recebido:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      R$ {formData.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formData.quantity} × R$ {formData.amountPerShare.toFixed(2)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Valor Total (Principal) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Valor Total Recebido
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={totalAmountStr}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  placeholder="R$ 50,00"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.totalAmount
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.totalAmount && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.totalAmount}</p>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Quantidade de Ações/Cotas
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={quantityStr}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="100"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.quantity
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.quantity}</p>
                )}
                {selectedAsset && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Posição atual: {selectedAsset.quantity} cotas/ações
                  </p>
                )}
              </div>

              {/* Valor por Ação Calculado */}
              {formData.totalAmount > 0 && formData.quantity > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Valor por Ação/Cota:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      R$ {formData.amountPerShare.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    R$ {formData.totalAmount.toFixed(2)} ÷ {formData.quantity}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data de Pagamento *
            </label>
            <input
              type="date"
              value={formData.paymentDate || today}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.paymentDate
                  ? 'border-rose-300 dark:border-rose-700'
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
            {errors.paymentDate && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.paymentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Data Com (opcional)
            </label>
            <input
              type="date"
              value={formData.referenceDate}
              onChange={(e) => handleChange('referenceDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Data em que precisava ter a ação
            </p>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Ex: Dividendos referente ao 1º trimestre..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {dividendToEdit ? 'Salvar Alterações' : 'Registrar Provento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
