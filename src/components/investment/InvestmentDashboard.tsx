import React, { useState, useEffect } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { Asset } from '../../types/investment';
import { Header } from '../layout/Header';
import { Button } from '../common/Button';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit3, Trash2, Percent, Receipt, Wallet, Layers, RefreshCw } from 'lucide-react';
import { AssetFormModal } from './AssetFormModal';
import { DividendFormModal } from './DividendFormModal';
import { DividendListModal } from './DividendListModal';

const isFII = (asset?: { ticker?: string; name?: string; type?: string }) => {
  if (!asset) return false;
  const ticker = (asset.ticker || '').toUpperCase().trim();
  const name = (asset.name || '').toUpperCase().trim();
  const type = asset.type || '';
  if (type === 'fund') return true;
  if (name.includes('FII') || name.includes('FUNDO') || name.includes('IMOBILIÁRIO') || name.includes('IMOBILIARIO')) return true;

  const stockUnits = ['SANB11', 'TAEE11', 'KLBN11', 'ALUP11', 'BPAC11', 'ENGI11', 'TIET11', 'SAPR11', 'SULA11', 'BBDC11', 'BBAS11'];
  if (ticker.endsWith('11') && !stockUnits.includes(ticker)) return true;
  return false;
};

export const InvestmentDashboard: React.FC = () => {
  const { assets, portfolioStats, deleteAsset, getAssetSummary, updateAllPrices } = useInvestment();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
  const [isDividendListModalOpen, setIsDividendListModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [selectedAssetForDividends, setSelectedAssetForDividends] = useState<{ id: string; ticker: string } | null>(null);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  // Atualização de preços via Brapi
  const handleRefreshPrices = async () => {
    if (assets.length === 0 || isUpdatingPrices) return;
    setIsUpdatingPrices(true);
    try {
      await updateAllPrices();
    } catch (err) {
      console.error('Erro ao atualizar cotações:', err);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // Atualizar cotações automaticamente quando a carteira possuir ativos
  useEffect(() => {
    if (assets.length > 0) {
      updateAllPrices();
    }
  }, [assets.length]);

  const handleEditAsset = (asset: Asset) => {
    setAssetToEdit(asset);
    setIsAssetModalOpen(true);
  };

  const handleCloseAssetModal = () => {
    setAssetToEdit(null);
    setIsAssetModalOpen(false);
  };

  const handleDeleteAsset = (asset: Asset) => {
    if (confirm(`Deseja realmente excluir ${asset.ticker} da carteira?`)) {
      deleteAsset(asset.id);
    }
  };

  const handleManageDividends = (asset: Asset) => {
    setSelectedAssetForDividends({ id: asset.id, ticker: asset.ticker });
    setIsDividendListModalOpen(true);
  };

  const handleCloseDividendListModal = () => {
    setSelectedAssetForDividends(null);
    setIsDividendListModalOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col transition-colors">
      <Header
        onOpenNewExpense={() => setIsAssetModalOpen(true)}
        onOpenNewDividend={() => setIsDividendModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Total Investido */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Total Investido</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white truncate">
                {formatCurrency(portfolioStats.totalInvested)}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'}
              </p>
            </div>
          </div>

          {/* Valor Atual */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Valor Atual</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white truncate">
                {formatCurrency(portfolioStats.currentValue)}
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Posição total
              </p>
            </div>
          </div>

          {/* Valorização */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Valorização</span>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                portfolioStats.totalProfitLoss >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}>
                {portfolioStats.totalProfitLoss >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </div>
            </div>
            <div>
              <p className={`text-base sm:text-xl lg:text-2xl font-black truncate ${portfolioStats.totalProfitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {portfolioStats.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalProfitLoss)}
              </p>
              <p className={`text-[10px] sm:text-xs font-semibold mt-0.5 ${portfolioStats.profitLossPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {portfolioStats.profitLossPercent >= 0 ? '+' : ''}{portfolioStats.profitLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Total Dividendos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Proventos</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div>
              <p className="text-base sm:text-xl lg:text-2xl font-black text-teal-600 dark:text-teal-400 truncate">
                {formatCurrency(portfolioStats.totalDividends)}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {portfolioStats.monthDividends && portfolioStats.monthDividends > 0
                  ? `Mês: ${formatCurrency(portfolioStats.monthDividends)}`
                  : 'Total recebido'}
              </p>
            </div>
          </div>

          {/* DY Médio */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">DY Médio</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center flex-shrink-0">
                <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Mensal</span>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {(portfolioStats.monthDividendYield || 0).toFixed(2)}%
                </p>
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Anual</span>
                <p className="text-sm sm:text-lg lg:text-xl font-black text-purple-600 dark:text-purple-400 truncate">
                  {portfolioStats.averageDividendYield.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Ativos */}
        {assets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                Nenhum ativo na carteira
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
                Comece adicionando seus aportes de ações, fundos imobiliários (FIIs) ou outros investimentos.
              </p>
              <Button
                type="button"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAssetModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                Novo Aporte
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                Minha Carteira
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {assets.length}
                </span>
              </h2>

              <button
                type="button"
                onClick={handleRefreshPrices}
                disabled={isUpdatingPrices}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                title="Atualizar cotações em tempo real via Brapi"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isUpdatingPrices ? 'Atualizando Cotações...' : 'Atualizar Cotações'}</span>
                <span className="sm:hidden">{isUpdatingPrices ? '...' : 'Atualizar'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {assets.map(asset => {
                const profitLossColor = asset.profitLoss >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400';

                const summary = getAssetSummary(asset.id);
                const fii = isFII(asset);
                const unitLabel = fii
                  ? (asset.quantity === 1 ? 'cota' : 'cotas')
                  : (asset.quantity === 1 ? 'ação' : 'ações');

                return (
                  <div
                    key={asset.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all space-y-3"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                          {asset.ticker.slice(0, 4)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                              {asset.ticker}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              fii
                                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                            }`}>
                              {fii ? 'FII' : 'Ação'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {asset.quantity} {unitLabel} • <span className="sm:hidden">PM: </span><span className="hidden sm:inline">Preço Médio: </span>{formatCurrency(asset.averagePrice)}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleManageDividends(asset)}
                          className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl border border-slate-200/70 dark:border-slate-800 transition-colors"
                          title="Gerenciar proventos"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl border border-slate-200/70 dark:border-slate-800 transition-colors"
                          title="Editar aporte"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset)}
                          className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-slate-200/70 dark:border-slate-800 transition-colors"
                          title="Excluir ativo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Grade de Indicadores Responsiva */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Preço Atual</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(asset.currentPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Valorização</p>
                        <p className={`text-xs sm:text-sm font-bold ${profitLossColor}`}>
                          {asset.profitLoss >= 0 ? '+' : ''}{formatCurrency(asset.profitLoss)}
                          <span className="text-[10px] ml-1 font-semibold opacity-90">
                            ({asset.profitLossPercent >= 0 ? '+' : ''}{asset.profitLossPercent.toFixed(1)}%)
                          </span>
                        </p>
                      </div>

                      {/* DY do Mês (exibido em todos os ativos) */}
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">DY Mês</p>
                        <p className={`text-xs sm:text-sm font-bold ${
                          summary && summary.monthDividendYield > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {(summary ? summary.monthDividendYield : 0).toFixed(2)}%
                        </p>
                      </div>

                      {/* DY Anual (somatório de todos os proventos do ativo no ano corrente) */}
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">DY Anual</p>
                        <p className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
                          {(summary ? summary.yearDividendYield : 0).toFixed(2)}%
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Proventos Pagos</p>
                        <p className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
                          {summary && summary.totalDividends > 0 ? formatCurrency(summary.totalDividends) : 'R$ 0,00'}
                        </p>
                      </div>
                    </div>

                    {/* Rodapé do Ativo */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] sm:text-xs">Total Investido</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 sm:text-sm">
                          {formatCurrency(asset.totalInvested)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] sm:text-xs">Posição Atual</span>
                        <span className="font-bold text-slate-900 dark:text-white sm:text-sm">
                          {formatCurrency(asset.currentValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <AssetFormModal
        isOpen={isAssetModalOpen}
        onClose={handleCloseAssetModal}
        assetToEdit={assetToEdit}
      />

      <DividendFormModal
        isOpen={isDividendModalOpen}
        onClose={() => setIsDividendModalOpen(false)}
      />

      {selectedAssetForDividends && (
        <DividendListModal
          isOpen={isDividendListModalOpen}
          onClose={handleCloseDividendListModal}
          assetId={selectedAssetForDividends.id}
          assetTicker={selectedAssetForDividends.ticker}
        />
      )}
    </div>
  );
};
