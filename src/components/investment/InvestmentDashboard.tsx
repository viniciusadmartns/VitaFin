import React, { useState } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { Asset } from '../../types/investment';
import { Header } from '../layout/Header';
import { Button } from '../common/Button';
import { Plus, TrendingUp, DollarSign, RefreshCw, Edit3, Trash2, Percent, Receipt } from 'lucide-react';
import { AssetFormModal } from './AssetFormModal';
import { DividendFormModal } from './DividendFormModal';
import { DividendListModal } from './DividendListModal';

export const InvestmentDashboard: React.FC = () => {
  const { assets, portfolioStats, updateAllPrices, deleteAsset, getAssetSummary } = useInvestment();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
  const [isDividendListModalOpen, setIsDividendListModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [selectedAssetForDividends, setSelectedAssetForDividends] = useState<{ id: string; ticker: string } | null>(null);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  const handleUpdatePrices = async () => {
    setIsUpdatingPrices(true);
    await updateAllPrices();
    setIsUpdatingPrices(false);
  };

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
      <Header onOpenNewExpense={() => setIsAssetModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Investido</span>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(portfolioStats.totalInvested)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Valor Atual</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(portfolioStats.currentValue)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Valorização</span>
              <Percent className="w-5 h-5 text-purple-500" />
            </div>
            <p className={`text-2xl font-bold ${portfolioStats.totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {portfolioStats.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalProfitLoss)}
            </p>
            <p className={`text-sm ${portfolioStats.profitLossPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {portfolioStats.profitLossPercent >= 0 ? '+' : ''}{portfolioStats.profitLossPercent.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Dividendos</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(portfolioStats.totalDividends)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Dividend Yield</span>
              <Percent className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {portfolioStats.averageDividendYield.toFixed(2)}%
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              DY médio
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 flex-wrap">
          <Button
            type="button"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAssetModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Adicionar Ativo
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={() => setIsDividendModalOpen(true)}
            disabled={assets.length === 0}
          >
            Registrar Dividendo
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<RefreshCw className={`w-4 h-4 ${isUpdatingPrices ? 'animate-spin' : ''}`} />}
            onClick={handleUpdatePrices}
            disabled={assets.length === 0 || isUpdatingPrices}
            className="ml-auto"
          >
            {isUpdatingPrices ? 'Atualizando...' : 'Atualizar Cotações'}
          </Button>
        </div>

        {/* Lista de Ativos */}
        {assets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
            <div className="max-w-md mx-auto">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Nenhum ativo na carteira
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Comece adicionando suas ações, fundos imobiliários ou outros investimentos
              </p>
              <Button
                type="button"
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAssetModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Primeiro Ativo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Minha Carteira</h2>
            <div className="grid grid-cols-1 gap-4">
              {assets.map(asset => {
                const profitLossColor = asset.profitLoss >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-rose-600 dark:text-rose-400';

                const summary = getAssetSummary(asset.id);
                const assetDY = summary ? summary.dividendYield : 0;

                return (
                  <div
                    key={asset.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {asset.ticker}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{asset.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {asset.type === 'fund' ? 'FII' : asset.type}
                        </span>
                        <button
                          onClick={() => handleManageDividends(asset)}
                          className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50 rounded-lg transition-colors"
                          title="Gerenciar dividendos"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="Editar ativo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Excluir ativo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Quantidade</p>
                        <p className="font-bold text-slate-900 dark:text-white">{asset.quantity}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Preço Médio</p>
                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(asset.averagePrice)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Preço Atual</p>
                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(asset.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Valorização</p>
                        <p className={`font-bold ${profitLossColor}`}>
                          {asset.profitLoss >= 0 ? '+' : ''}{formatCurrency(asset.profitLoss)}
                          <span className="block text-xs">
                            ({asset.profitLossPercent >= 0 ? '+' : ''}{asset.profitLossPercent.toFixed(2)}%)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">DY%</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {assetDY.toFixed(2)}%
                          {summary && summary.totalDividends > 0 && (
                            <span className="block text-xs text-slate-600 dark:text-slate-400">
                              {formatCurrency(summary.totalDividends)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total Investido</p>
                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(asset.totalInvested)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Valor Atual</p>
                        <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(asset.currentValue)}</p>
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
