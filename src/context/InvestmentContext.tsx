import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset, Transaction, Dividend, AssetSummary, PortfolioStats } from '../types/investment';
import { fetchMultipleStockPrices } from '../services/stockQuotes';

interface InvestmentContextType {
  assets: Asset[];
  transactions: Transaction[];
  dividends: Dividend[];
  portfolioStats: PortfolioStats;

  // CRUD Ativos
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // CRUD Transações
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  // CRUD Dividendos
  addDividend: (dividend: Omit<Dividend, 'id' | 'createdAt'>) => void;
  updateDividend: (id: string, updates: Partial<Dividend>) => void;
  deleteDividend: (id: string) => void;

  // Utilidades
  getAssetSummary: (assetId: string) => AssetSummary | null;
  recalculatePortfolio: () => void;
  updateAllPrices: () => Promise<void>; // Nova função para atualizar cotações
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment deve ser usado dentro de InvestmentProvider');
  }
  return context;
};

const STORAGE_KEY = 'vitainvest-data';

export const InvestmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvested: 0,
    currentValue: 0,
    totalProfitLoss: 0,
    profitLossPercent: 0,
    totalDividends: 0,
    averageDividendYield: 0,
    assetsCount: 0,
    assetsSummaries: [],
  });

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setAssets(data.assets || []);
        setTransactions(data.transactions || []);
        setDividends(data.dividends || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    try {
      const data = { assets, transactions, dividends };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      recalculatePortfolio();
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }, [assets, transactions, dividends]);

  const addAsset = (assetData: Omit<Asset, 'id' | 'createdAt'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.id === id
          ? { ...asset, ...updates, updatedAt: new Date().toISOString() }
          : asset
      )
    );
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setTransactions(prev => prev.filter(t => t.assetId !== id));
    setDividends(prev => prev.filter(d => d.assetId !== id));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);

    // Atualizar o ativo após a transação
    updateAssetFromTransactions(transactionData.assetId);
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      updateAssetFromTransactions(transaction.assetId);
    }
  };

  const addDividend = (dividendData: Omit<Dividend, 'id' | 'createdAt'>) => {
    const newDividend: Dividend = {
      ...dividendData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setDividends(prev => [...prev, newDividend]);
  };

  const updateDividend = (id: string, updates: Partial<Dividend>) => {
    setDividends(prev =>
      prev.map(div =>
        div.id === id ? { ...div, ...updates } : div
      )
    );
  };

  const deleteDividend = (id: string) => {
    setDividends(prev => prev.filter(d => d.id !== id));
  };

  const updateAssetFromTransactions = (assetId: string) => {
    const assetTransactions = transactions.filter(t => t.assetId === assetId);

    if (assetTransactions.length === 0) return;

    let totalQuantity = 0;
    let totalInvested = 0;

    assetTransactions.forEach(t => {
      if (t.type === 'buy') {
        totalQuantity += t.quantity;
        totalInvested += t.totalAmount;
      } else {
        totalQuantity -= t.quantity;
        totalInvested -= (t.quantity * (totalInvested / totalQuantity));
      }
    });

    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

    updateAsset(assetId, {
      quantity: totalQuantity,
      averagePrice,
      totalInvested,
    });
  };

  const getAssetSummary = (assetId: string): AssetSummary | null => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return null;

    const assetTransactions = transactions.filter(t => t.assetId === assetId);
    const assetDividends = dividends.filter(d => d.assetId === assetId);
    const totalDividends = assetDividends.reduce((sum, d) => sum + d.totalAmount, 0);
    const dividendYield = asset.totalInvested > 0
      ? (totalDividends / asset.totalInvested) * 100
      : 0;

    return {
      asset,
      totalDividends,
      dividendYield,
      transactions: assetTransactions,
      dividends: assetDividends,
    };
  };

  const recalculatePortfolio = () => {
    const totalInvested = assets.reduce((sum, a) => sum + a.totalInvested, 0);
    const currentValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalProfitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

    const totalDividends = dividends.reduce((sum, d) => sum + d.totalAmount, 0);
    const averageDividendYield = totalInvested > 0
      ? (totalDividends / totalInvested) * 100
      : 0;

    const assetsSummaries = assets.map(asset => getAssetSummary(asset.id)!).filter(Boolean);

    setPortfolioStats({
      totalInvested,
      currentValue,
      totalProfitLoss,
      profitLossPercent,
      totalDividends,
      averageDividendYield,
      assetsCount: assets.length,
      assetsSummaries,
    });
  };

  // Atualizar preços em tempo real
  const updateAllPrices = async () => {
    if (assets.length === 0) return;

    const tickers = assets.map(a => a.ticker);
    const prices = await fetchMultipleStockPrices(tickers);

    // Atualizar cada ativo com o novo preço
    setAssets(prev =>
      prev.map(asset => {
        const newPrice = prices[asset.ticker];
        if (newPrice && newPrice > 0) {
          const currentValue = asset.quantity * newPrice;
          const profitLoss = currentValue - asset.totalInvested;
          const profitLossPercent = asset.totalInvested > 0
            ? (profitLoss / asset.totalInvested) * 100
            : 0;

          return {
            ...asset,
            currentPrice: newPrice,
            currentValue,
            profitLoss,
            profitLossPercent,
            updatedAt: new Date().toISOString(),
          };
        }
        return asset;
      })
    );
  };

  return (
    <InvestmentContext.Provider
      value={{
        assets,
        transactions,
        dividends,
        portfolioStats,
        addAsset,
        updateAsset,
        deleteAsset,
        addTransaction,
        deleteTransaction,
        addDividend,
        updateDividend,
        deleteDividend,
        getAssetSummary,
        recalculatePortfolio,
        updateAllPrices,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};
