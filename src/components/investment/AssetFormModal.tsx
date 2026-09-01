import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../../types/investment';
import { useInvestment } from '../../context/InvestmentContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TrendingUp, DollarSign, Hash } from 'lucide-react';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'stock', label: 'Ação' },
  { value: 'fund', label: 'FII' },
  { value: 'etf', label: 'ETF' },
  { value: 'fixed-income', label: 'Renda Fixa' },
  { value: 'crypto', label: 'Criptomoeda' },
  { value: 'reit', label: 'REIT' },
  { value: 'other', label: 'Outro' },
];

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
}) => {
  const { addAsset, updateAsset } = useInvestment();

  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    type: 'stock' as AssetType,
    quantity: 0,
    averagePrice: 0,
    currentPrice: 0,
    notes: '',
  });

  // String states para inputs decimais
  const [quantityStr, setQuantityStr] = useState('');
  const [averagePriceStr, setAveragePriceStr] = useState('');
  const [currentPriceStr, setCurrentPriceStr] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        ticker: assetToEdit.ticker,
        name: assetToEdit.name,
        type: assetToEdit.type,
        quantity: assetToEdit.quantity,
        averagePrice: assetToEdit.averagePrice,
        currentPrice: assetToEdit.currentPrice,
        notes: assetToEdit.notes || '',
      });
      setQuantityStr(assetToEdit.quantity.toString());
      setAveragePriceStr(assetToEdit.averagePrice.toFixed(2).replace('.', ','));
      setCurrentPriceStr(assetToEdit.currentPrice.toFixed(2).replace('.', ','));
    } else {
      setFormData({
        ticker: '',
        name: '',
        type: 'stock',
        quantity: 0,
        averagePrice: 0,
        currentPrice: 0,
        notes: '',
      });
      setQuantityStr('');
      setAveragePriceStr('');
      setCurrentPriceStr('');
    }
    setErrors({});
  }, [assetToEdit, isOpen]);

  const parseDecimal = (value: string): number => {
    if (!value) return 0;
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleQuantityChange = (value: string) => {
    setQuantityStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => ({ ...prev, quantity: numValue }));
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: '' }));
    }
  };

  const handleAveragePriceChange = (value: string) => {
    setAveragePriceStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => ({ ...prev, averagePrice: numValue }));
    if (errors.averagePrice) {
      setErrors(prev => ({ ...prev, averagePrice: '' }));
    }
  };

  const handleCurrentPriceChange = (value: string) => {
    setCurrentPriceStr(value);
    const numValue = parseDecimal(value);
    setFormData(prev => ({ ...prev, currentPrice: numValue }));
    if (errors.currentPrice) {
      setErrors(prev => ({ ...prev, currentPrice: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Código do ativo é obrigatório';
    }
    // Nome agora é opcional
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    if (formData.averagePrice <= 0) {
      newErrors.averagePrice = 'Preço médio deve ser maior que zero';
    }
    if (formData.currentPrice < 0) {
      newErrors.currentPrice = 'Preço atual não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const totalInvested = formData.quantity * formData.averagePrice;
    const currentValue = formData.quantity * formData.currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    const assetData = {
      ...formData,
      ticker: formData.ticker.toUpperCase(),
      name: formData.name.trim() || formData.ticker.toUpperCase(), // Se nome vazio, usar ticker
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercent,
      updatedAt: new Date().toISOString(),
    };

    if (assetToEdit) {
      updateAsset(assetToEdit.id, assetData);
    } else {
      addAsset(assetData);
    }

    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalInvested = formData.quantity * formData.averagePrice;
  const currentValue = formData.quantity * formData.currentPrice;
  const profitLoss = currentValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? 'Editar Ativo' : 'Adicionar Ativo'}
      subtitle="Preencha os dados do ativo para adicionar à sua carteira"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ticker */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Código do Ativo (Ticker) *
          </label>
          <input
            type="text"
            value={formData.ticker}
            onChange={(e) => handleChange('ticker', e.target.value)}
            placeholder="Ex: PETR4, MXRF11, BTC"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.ticker
                ? 'border-rose-300 dark:border-rose-700'
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase`}
          />
          {errors.ticker && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.ticker}</p>
          )}
        </div>

        {/* Nome - OPCIONAL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Nome do Ativo (opcional)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Petrobras PN, Maxi Renda FII"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Deixe em branco para usar o ticker como nome
          </p>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Tipo de Ativo
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as AssetType)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {ASSET_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quantidade e Preços */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Quantidade
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Preço Médio
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={averagePriceStr}
              onChange={(e) => handleAveragePriceChange(e.target.value)}
              placeholder="R$ 25,50"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.averagePrice
                  ? 'border-rose-300 dark:border-rose-700'
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
            {errors.averagePrice && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.averagePrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Preço Atual
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentPriceStr}
              onChange={(e) => handleCurrentPriceChange(e.target.value)}
              placeholder="R$ 28,00"
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.currentPrice
                  ? 'border-rose-300 dark:border-rose-700'
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
            {errors.currentPrice && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.currentPrice}</p>
            )}
          </div>
        </div>

        {/* Resumo dos Cálculos */}
        {formData.quantity > 0 && formData.averagePrice > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total Investido:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                R$ {totalInvested.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Valor Atual:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                R$ {currentValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-blue-200 dark:border-blue-800 pt-2">
              <span className="text-slate-600 dark:text-slate-400">Lucro/Prejuízo:</span>
              <span className={`font-bold ${profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {profitLoss >= 0 ? '+' : ''}R$ {profitLoss.toFixed(2)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Ex: Dividendos mensais, foco em crescimento..."
            rows={3}
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
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {assetToEdit ? 'Salvar Alterações' : 'Adicionar Ativo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
