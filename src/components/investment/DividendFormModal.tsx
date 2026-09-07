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
  const { assets, dividends, addDividend, updateDividend } = useInvestment();

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

  // String state para input decimal do valor total
  const [totalAmountStr, setTotalAmountStr] = useState('');

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
      setTotalAmountStr('');
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

          const newPerShare = qty > 0 && prev.totalAmount > 0 ? prev.totalAmount / qty : prev.amountPerShare;

          return {
            ...prev,
            quantity: qty,
            type: newType,
            amountPerShare: newPerShare,
          };
        });
      }
    }
  }, [formData.assetId, assets, dividendToEdit]);

  const parseDecimal = (value: string): number => {
    if (!value) return 0;
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleTotalAmountChange = (value: string) => {
    setTotalAmountStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => {
      const perShare = prev.quantity > 0 ? numValue / prev.quantity : 0;
      return {
        ...prev,
        totalAmount: numValue,
        amountPerShare: perShare,
      };
    });
    if (errors.totalAmount) {
      setErrors(prev => ({ ...prev, totalAmount: '' }));
    }
  };

  const selectedAsset = assets.find(a => a.id === formData.assetId);
  const isSelectedFII = selectedAsset ? isFII(selectedAsset) : false;

  // Rótulos dinâmicos: "Cota" / "Cotas" para FIIs e "Ação" / "Ações" para Ações
  const unitSingularCap = selectedAsset
    ? (isSelectedFII ? 'Cota' : 'Ação')
    : 'Ação/Cota';

  const unitPlural = selectedAsset
    ? (isSelectedFII ? 'cotas' : 'ações')
    : 'ações/cotas';

  const targetYear = formData.paymentDate ? formData.paymentDate.substring(0, 4) : '';

  // Verificar se já existe provento cadastrado para o ativo no mesmo ano selecionado
  const existingDividend = !dividendToEdit && formData.assetId && targetYear
    ? dividends.find(
        d => (d.assetId === formData.assetId || (selectedAsset && d.ticker.toUpperCase().trim() === selectedAsset.ticker.toUpperCase().trim())) &&
             d.paymentDate &&
             d.paymentDate.startsWith(targetYear)
      )
    : null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetId) {
      newErrors.assetId = 'Selecione um ativo';
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

    const qty = formData.quantity || currentSelectedAsset.quantity;
    const amountPerShare = qty > 0 ? formData.totalAmount / qty : formData.amountPerShare;

    const dividendData = {
      assetId: formData.assetId,
      type: formData.type,
      amountPerShare,
      totalAmount: formData.totalAmount,
      quantity: qty,
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

        {/* Valor Total Recebido */}
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

        {/* Valor por Cota/Ação Calculado (Informativo) */}
        {formData.totalAmount > 0 && formData.quantity > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Equivalente por {unitSingularCap}:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(formData.amountPerShare)}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal ml-1">
                ({formatCurrency(formData.totalAmount)} ÷ {formData.quantity} {unitPlural})
              </span>
            </span>
          </div>
        )}

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

        {/* Resumo Consolidado (Quando já existe provento neste ano) */}
        {existingDividend && formData.totalAmount > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-emerald-200/70 dark:border-emerald-800/70 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Proventos já registrados em {targetYear}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Já acumulado no ano: {formatCurrency(existingDividend.totalAmount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Lançamento Adicional:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(formData.totalAmount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Novo Total no Ano:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {formatCurrency(existingDividend.totalAmount + formData.totalAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Novo Valor por {unitSingularCap}:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(
                    (existingDividend.totalAmount + formData.totalAmount) /
                    (formData.quantity || existingDividend.quantity || (selectedAsset?.quantity || 1))
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

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
            {dividendToEdit ? 'Salvar Alterações' : (existingDividend ? 'Somar ao Provento Existente' : 'Registrar Provento')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
