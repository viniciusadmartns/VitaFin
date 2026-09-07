import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../../types/investment';
import { useInvestment } from '../../context/InvestmentContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TrendingUp, DollarSign, Hash, Layers, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

const isFII = (assetOrTicker?: { ticker?: string; name?: string; type?: string } | string) => {
  if (!assetOrTicker) return false;
  const ticker = (typeof assetOrTicker === 'string' ? assetOrTicker : assetOrTicker.ticker || '').toUpperCase().trim();
  const name = (typeof assetOrTicker === 'string' ? '' : assetOrTicker.name || '').toUpperCase().trim();
  const type = typeof assetOrTicker === 'string' ? '' : assetOrTicker.type || '';
  if (type === 'fund') return true;
  if (name.includes('FII') || name.includes('FUNDO') || name.includes('IMOBILIÁRIO') || name.includes('IMOBILIARIO')) return true;
  const stockUnits = ['SANB11', 'TAEE11', 'KLBN11', 'ALUP11', 'BPAC11', 'ENGI11', 'TIET11', 'SAPR11', 'SULA11', 'BBDC11', 'BBAS11'];
  if (ticker.endsWith('11') && !stockUnits.includes(ticker)) return true;
  return false;
};

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
}) => {
  const { assets, addAsset, updateAsset } = useInvestment();

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

  // Verificar se o ticker digitado já existe na carteira (quando for novo aporte)
  const normalizedTicker = formData.ticker.toUpperCase().trim();
  const existingAsset = !assetToEdit && normalizedTicker
    ? assets.find(a => a.ticker.toUpperCase().trim() === normalizedTicker)
    : null;

  const isAssetFII = isFII(existingAsset || { ticker: formData.ticker });
  const unitPlural = isAssetFII ? 'cotas' : 'ações';

  // Ao identificar ativo existente, se preço atual não foi digitado, sugerir
  const handleTickerBlur = () => {
    if (existingAsset) {
      if (!currentPriceStr && existingAsset.currentPrice > 0) {
        setCurrentPriceStr(existingAsset.currentPrice.toFixed(2).replace('.', ','));
        setFormData(prev => ({ ...prev, currentPrice: existingAsset.currentPrice }));
      }
    }
  };

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
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    if (formData.averagePrice <= 0) {
      newErrors.averagePrice = 'Preço de compra deve ser maior que zero';
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
    const currentPrice = formData.currentPrice || formData.averagePrice;
    const currentValue = formData.quantity * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    const assetData = {
      ...formData,
      ticker: formData.ticker.toUpperCase().trim(),
      name: formData.name.trim() || formData.ticker.toUpperCase().trim(),
      totalInvested,
      currentPrice,
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

  // Cálculos para exibição
  const singleTotalInvested = formData.quantity * formData.averagePrice;
  const singleCurrentValue = formData.quantity * (formData.currentPrice || formData.averagePrice);
  const singleProfitLoss = singleCurrentValue - singleTotalInvested;
  const singleProfitLossPercent = singleTotalInvested > 0 ? (singleProfitLoss / singleTotalInvested) * 100 : 0;

  // Cálculos consolidados (se o ativo já existir)
  const existingQuantity = existingAsset ? existingAsset.quantity : 0;
  const existingAveragePrice = existingAsset ? existingAsset.averagePrice : 0;
  const existingTotalInvested = existingAsset
    ? (existingAsset.totalInvested || (existingQuantity * existingAveragePrice))
    : 0;

  const newAporteQuantity = formData.quantity;
  const newAportePrice = formData.averagePrice;
  const newAporteTotal = newAporteQuantity * newAportePrice;

  const consolidatedQuantity = existingQuantity + newAporteQuantity;
  const consolidatedTotalInvested = existingTotalInvested + newAporteTotal;
  const consolidatedAveragePrice = consolidatedQuantity > 0
    ? consolidatedTotalInvested / consolidatedQuantity
    : 0;

  const effectiveCurrentPrice = formData.currentPrice > 0
    ? formData.currentPrice
    : (existingAsset && existingAsset.currentPrice > 0
        ? existingAsset.currentPrice
        : (newAportePrice > 0 ? newAportePrice : consolidatedAveragePrice));

  const consolidatedCurrentValue = consolidatedQuantity * effectiveCurrentPrice;
  const consolidatedProfitLoss = consolidatedCurrentValue - consolidatedTotalInvested;
  const consolidatedProfitLossPercent = consolidatedTotalInvested > 0
    ? (consolidatedProfitLoss / consolidatedTotalInvested) * 100
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assetToEdit ? 'Editar Aporte' : 'Novo Aporte'}
      subtitle={
        existingAsset
          ? `Adicionando novo aporte ao ativo ${existingAsset.ticker}`
          : 'Preencha os dados do investimento para sua carteira'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ticker */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Código do Ativo (Ticker)
          </label>
          <input
            type="text"
            list="portfolio-assets-list"
            value={formData.ticker}
            onChange={(e) => handleChange('ticker', e.target.value)}
            onBlur={handleTickerBlur}
            placeholder="Ex: PETR4, MXRF11, BTC"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.ticker
                ? 'border-rose-300 dark:border-rose-700'
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase`}
          />
          {/* Autocomplete com ativos existentes na carteira */}
          {!assetToEdit && assets.length > 0 && (
            <datalist id="portfolio-assets-list">
              {assets.map(a => (
                <option key={a.id} value={a.ticker}>
                  {a.name && a.name !== a.ticker ? `${a.ticker} - ${a.name}` : a.ticker}
                </option>
              ))}
            </datalist>
          )}
          {errors.ticker && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.ticker}</p>
          )}
        </div>

        {/* Aviso de ativo existente na carteira */}
        {existingAsset && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex items-start gap-3">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <p className="font-semibold text-blue-800 dark:text-blue-300">
                Ativo já existente na carteira ({existingAsset.ticker})
              </p>
              <p className="mt-0.5 text-blue-700 dark:text-blue-300/80">
                Posição atual: <strong>{existingQuantity} {unitPlural}</strong> com preço médio de{' '}
                <strong>{formatCurrency(existingAveragePrice)}</strong>. As novas {unitPlural} serão somadas e o preço médio recalculado automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Quantidade e Preços */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              {existingAsset ? 'Qtd. deste Aporte' : 'Quantidade'}
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
              Preço Compra
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

        {/* Resumo dos Cálculos - Modo Consolidado (Ativo existente) */}
        {existingAsset && formData.quantity > 0 && formData.averagePrice > 0 ? (
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                Nova Posição Consolidada
              </span>
              <span>{existingAsset.ticker}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 border-b border-emerald-200/70 dark:border-emerald-800/70 pb-2.5">
              <div>
                <span className="text-[11px] block">Posição anterior:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {existingQuantity} {unitPlural} × {formatCurrency(existingAveragePrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] block text-emerald-700 dark:text-emerald-400">+ Novo aporte:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  +{formData.quantity} {unitPlural} × {formatCurrency(formData.averagePrice)} ({formatCurrency(newAporteTotal)})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm pt-0.5">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Nova Quantidade:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">{consolidatedQuantity} {unitPlural}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Novo Preço Médio:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-base">{formatCurrency(consolidatedAveragePrice)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Total Investido:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(consolidatedTotalInvested)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Valor Atual:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(consolidatedCurrentValue)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-800/70 flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Lucro / Prejuízo Projetado:</span>
              <span className={`font-bold ${consolidatedProfitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {consolidatedProfitLoss >= 0 ? '+' : ''}{formatCurrency(consolidatedProfitLoss)} ({consolidatedProfitLossPercent >= 0 ? '+' : ''}{consolidatedProfitLossPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ) : (
          /* Resumo Padrão (Novo ativo individual) */
          formData.quantity > 0 && formData.averagePrice > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Total Investido:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(singleTotalInvested)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Valor Atual:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(singleCurrentValue)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-blue-200 dark:border-blue-800 pt-2">
                <span className="text-slate-600 dark:text-slate-400">Lucro/Prejuízo:</span>
                <span className={`font-bold ${singleProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {singleProfitLoss >= 0 ? '+' : ''}{formatCurrency(singleProfitLoss)} ({singleProfitLossPercent >= 0 ? '+' : ''}{singleProfitLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          )
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
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {assetToEdit ? 'Salvar Alterações' : (existingAsset ? 'Somar ao Aporte Existente' : 'Salvar Aporte')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

