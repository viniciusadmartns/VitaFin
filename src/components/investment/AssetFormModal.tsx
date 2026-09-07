import React, { useState, useEffect, useRef } from 'react';
import { Asset, AssetType } from '../../types/investment';
import { useInvestment } from '../../context/InvestmentContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DollarSign, Hash, Layers, ArrowUpRight, RefreshCw, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { fetchStockQuoteInfo, StockQuote } from '../../services/stockQuotes';

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

  // Brapi Quote em tempo real
  const [quoteInfo, setQuoteInfo] = useState<StockQuote | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setQuoteInfo(null);
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
      setQuoteInfo(null);
    }
    setErrors({});
  }, [assetToEdit, isOpen]);

  // Buscar cotação em tempo real via Brapi quando o ticker for digitado
  useEffect(() => {
    const cleanTicker = formData.ticker.toUpperCase().trim();

    if (quoteTimeoutRef.current) {
      clearTimeout(quoteTimeoutRef.current);
    }

    if (!cleanTicker || cleanTicker.length < 4) {
      setQuoteInfo(null);
      setIsFetchingQuote(false);
      return;
    }

    quoteTimeoutRef.current = setTimeout(async () => {
      setIsFetchingQuote(true);
      try {
        const quote = await fetchStockQuoteInfo(cleanTicker);
        if (quote && quote.regularMarketPrice > 0) {
          setQuoteInfo(quote);
          const priceFormatted = quote.regularMarketPrice.toFixed(2).replace('.', ',');

          // Atualizar o preço atual internamente com o valor real da API
          setFormData(prev => ({
            ...prev,
            currentPrice: quote.regularMarketPrice,
            name: quote.shortName || quote.longName || prev.name || cleanTicker,
            type: isFII({ ticker: cleanTicker, name: quote.longName }) ? 'fund' : 'stock',
          }));

          // Se o preço de compra estiver vazio, sugerir o preço atual da cotação
          setAveragePriceStr(prev => {
            if (!prev || prev === '0' || prev === '0,00') {
              setFormData(f => ({ ...f, averagePrice: quote.regularMarketPrice }));
              return priceFormatted;
            }
            return prev;
          });
        } else {
          setQuoteInfo(null);
        }
      } catch (err) {
        console.error('Erro ao buscar cotação Brapi:', err);
      } finally {
        setIsFetchingQuote(false);
      }
    }, 450);

    return () => {
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current);
      }
    };
  }, [formData.ticker]);

  // Verificar se o ticker digitado já existe na carteira (quando for novo aporte)
  const normalizedTicker = formData.ticker.toUpperCase().trim();
  const existingAsset = !assetToEdit && normalizedTicker
    ? assets.find(a => a.ticker.toUpperCase().trim() === normalizedTicker)
    : null;

  const isAssetFII = isFII(existingAsset || { ticker: formData.ticker });
  const unitPlural = isAssetFII ? 'cotas' : 'ações';

  const handleTickerBlur = () => {
    if (existingAsset && formData.currentPrice <= 0 && existingAsset.currentPrice > 0) {
      setFormData(prev => ({ ...prev, currentPrice: existingAsset.currentPrice }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const totalInvested = formData.quantity * formData.averagePrice;
    const currentPrice = formData.currentPrice > 0
      ? formData.currentPrice
      : (quoteInfo?.regularMarketPrice && quoteInfo.regularMarketPrice > 0
          ? quoteInfo.regularMarketPrice
          : (existingAsset?.currentPrice && existingAsset.currentPrice > 0
              ? existingAsset.currentPrice
              : formData.averagePrice));

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
  const singleCurrentPrice = formData.currentPrice > 0
    ? formData.currentPrice
    : (quoteInfo?.regularMarketPrice || formData.averagePrice);
  const singleCurrentValue = formData.quantity * singleCurrentPrice;
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
    : (quoteInfo?.regularMarketPrice && quoteInfo.regularMarketPrice > 0
        ? quoteInfo.regularMarketPrice
        : (existingAsset && existingAsset.currentPrice > 0
            ? existingAsset.currentPrice
            : (newAportePrice > 0 ? newAportePrice : consolidatedAveragePrice)));

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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Código do Ativo (Ticker)
            </label>
            {isFetchingQuote && (
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Buscando na Brapi...
              </span>
            )}
          </div>
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

          {/* Feedback da Cotação em Tempo Real via Brapi */}
          {quoteInfo && (
            <div className="mt-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {quoteInfo.logourl ? (
                  <img
                    src={quoteInfo.logourl}
                    alt={quoteInfo.symbol}
                    className="w-5 h-5 rounded-full object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-600 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <span className="font-bold text-slate-900 dark:text-white">{quoteInfo.symbol}</span>
                  {quoteInfo.shortName && (
                    <span className="text-slate-500 dark:text-slate-400 ml-1.5 truncate">
                      {quoteInfo.shortName}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(quoteInfo.regularMarketPrice)}
                </span>
                {quoteInfo.regularMarketChangePercent !== undefined && (
                  <span className={`ml-1 text-[11px] font-semibold ${
                    quoteInfo.regularMarketChangePercent >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {quoteInfo.regularMarketChangePercent >= 0 ? '+' : ''}
                    {quoteInfo.regularMarketChangePercent.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
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

        {/* Quantidade e Preço de Compra */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Valor Atual (Real):</span>
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
                <span className="text-slate-600 dark:text-slate-400">Valor Atual (Real):</span>
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


