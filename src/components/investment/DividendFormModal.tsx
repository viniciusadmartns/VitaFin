import React, { useState, useEffect } from 'react';
import { Dividend, DividendType } from '../../types/investment';
import { useInvestment } from '../../context/InvestmentContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Calendar, DollarSign } from 'lucide-react';
import { getTodayDateString, formatCurrency } from '../../utils/formatters';

interface DividendFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dividendToEdit?: Dividend | null;
}

type CalculationMode = 'per-share' | 'total';

// Função para identificar se um ativo é FII
const isFII = (asset?: { ticker?: string; name?: string; type?: string }) => {
  if (!asset) return false;
  const ticker = (asset.ticker || '').toUpperCase().trim();
  const name = (asset.name || '').toUpperCase().trim();
  const type = asset.type || '';
  if (type === 'fund') return true;
  if (name.includes('FII') || name.includes('FUNDO') || name.includes('IMOBILIÁRIO') || name.includes('IMOBILIARIO')) return true;

  // Tickers que terminam em 11 (exceto units de ações conhecidas)
  const stockUnits = ['SANB11', 'TAEE11', 'KLBN11', 'ALUP11', 'BPAC11', 'ENGI11', 'TIET11', 'SAPR11', 'SULA11', 'BBDC11', 'BBAS11'];
  if (ticker.endsWith('11') && !stockUnits.includes(ticker)) return true;
  return false;
};

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
    paymentDate: getTodayDateString(),
    referenceDate: '',
    notes: '',
  });

  // String states para inputs decimais
  const [amountPerShareStr, setAmountPerShareStr] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
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
    } else {
      // Resetar quando abrir modal vazio
      setFormData({
        assetId: '',
        type: 'dividend' as DividendType,
        amountPerShare: 0,
        totalAmount: 0,
        quantity: 0,
        paymentDate: getTodayDateString(),
        referenceDate: '',
        notes: '',
      });
      setAmountPerShareStr('');
      setTotalAmountStr('');
      setCalculationMode('per-share');
    }
    setErrors({});
  }, [dividendToEdit, isOpen]);

  // Atualizar quantidade e tipo de provento automaticamente ao selecionar ativo
  useEffect(() => {
    if (formData.assetId) {
      const selectedAsset = assets.find(a => a.id === formData.assetId);
      if (selectedAsset) {
        const fii = isFII(selectedAsset);
        const qty = dividendToEdit ? (dividendToEdit.quantity || selectedAsset.quantity) : selectedAsset.quantity;

        setFormData(prev => {
          let newType = prev.type;
          if (fii) {
            newType = 'income';
          } else if (prev.type === 'income') {
            newType = 'dividend';
          }

          let newTotal = prev.totalAmount;
          let newPerShare = prev.amountPerShare;

          if (calculationMode === 'per-share' && prev.amountPerShare > 0 && qty > 0) {
            newTotal = prev.amountPerShare * qty;
            setTotalAmountStr(newTotal.toFixed(2).replace('.', ','));
          } else if (calculationMode === 'total' && prev.totalAmount > 0 && qty > 0) {
            newPerShare = prev.totalAmount / qty;
            setAmountPerShareStr(newPerShare.toFixed(4).replace('.', ','));
          }

          return {
            ...prev,
            quantity: qty,
            type: newType,
            totalAmount: newTotal,
            amountPerShare: newPerShare,
          };
        });
      }
    }
  }, [formData.assetId, assets, dividendToEdit, calculationMode]);

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
      // Recalcular total baseado na quantidade do ativo selecionado
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
      // Recalcular por ação baseado na quantidade do ativo selecionado
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

  const selectedAsset = assets.find(a => a.id === formData.assetId);
  const isSelectedFII = selectedAsset ? isFII(selectedAsset) : false;

  // Rótulos dinâmicos: "Cota" / "Cotas" para FIIs e "Ação" / "Ações" para Ações
  const unitSingular = selectedAsset
    ? (isSelectedFII ? 'cota' : 'ação')
    : 'ação/cota';

  const unitSingularCap = selectedAsset
    ? (isSelectedFII ? 'Cota' : 'Ação')
    : 'Ação/Cota';

  const unitPlural = selectedAsset
    ? (isSelectedFII ? 'cotas' : 'ações')
    : 'ações/cotas';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetId) {
      newErrors.assetId = 'Selecione um ativo';
    }
    if (formData.amountPerShare <= 0) {
      newErrors.amountPerShare = `Valor por ${unitSingular} deve ser maior que zero`;
    }
    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Valor total deve ser maior que zero';
    }
    if (formData.quantity <= 0) {
      newErrors.assetId = `O ativo selecionado não possui ${unitPlural} na carteira`;
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

    const currentSelectedAsset = assets.find(a => a.id === formData.assetId);
    if (!currentSelectedAsset) return;

    const dividendData = {
      assetId: formData.assetId,
      type: formData.type,
      amountPerShare: formData.amountPerShare,
      totalAmount: formData.totalAmount,
      quantity: formData.quantity || currentSelectedAsset.quantity,
      paymentDate: formData.paymentDate,
      referenceDate: formData.referenceDate,
      notes: formData.notes,
      ticker: currentSelectedAsset.ticker,
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

  // Obter tipos de proventos dinamicamente de acordo com o tipo de ativo (FII vs Ações)
  const getAvailableDividendTypes = (): { value: DividendType; label: string }[] => {
    if (!selectedAsset) {
      return [
        { value: 'dividend', label: 'Dividendos' },
        { value: 'jcp', label: 'JCP' },
        { value: 'income', label: 'Rendimentos' },
      ];
    }

    if (isFII(selectedAsset)) {
      return [
        { value: 'income', label: 'Rendimentos' },
      ];
    }

    // Ações ou outros ativos
    return [
      { value: 'dividend', label: 'Dividendos' },
      { value: 'jcp', label: 'JCP' },
    ];
  };

  const availableDividendTypes = getAvailableDividendTypes();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dividendToEdit ? 'Editar Provento' : 'Novo Provento'}
      subtitle="Registre proventos recebidos na sua carteira"
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
                {asset.ticker} - {asset.name} ({asset.quantity} {isFII(asset) ? 'cotas' : 'ações'})
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
            {availableDividendTypes.map(type => (
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
              Valor por {unitSingularCap}
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
              {/* Valor por Cota/Ação (Principal) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Valor por {unitSingularCap}
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

              {/* Total Calculado */}
              {formData.amountPerShare > 0 && formData.quantity > 0 && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Total Recebido:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(formData.totalAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formData.quantity} {unitPlural} × {formatCurrency(formData.amountPerShare)}
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

              {/* Valor por Cota/Ação Calculado */}
              {formData.totalAmount > 0 && formData.quantity > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Valor por {unitSingularCap}:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(formData.amountPerShare)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatCurrency(formData.totalAmount)} ÷ {formData.quantity} {unitPlural}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Data de Pagamento */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data de Pagamento
          </label>
          <input
            type="date"
            value={formData.paymentDate}
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
