import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Asset, Transaction, Dividend, AssetSummary, PortfolioStats } from '../types/investment';
import { fetchMultipleStockPrices } from '../services/stockQuotes';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

interface InvestmentContextType {
  assets: Asset[];
  transactions: Transaction[];
  dividends: Dividend[];
  portfolioStats: PortfolioStats;
  isLoadingData: boolean;

  // CRUD Ativos
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // CRUD Transações
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  deleteTransaction: (id: string) => void;

  // CRUD Dividendos
  addDividend: (dividend: Omit<Dividend, 'id' | 'createdAt'>) => Dividend;
  updateDividend: (id: string, updates: Partial<Dividend>) => void;
  deleteDividend: (id: string) => void;

  // Utilidades
  getAssetSummary: (assetId: string) => AssetSummary | null;
  recalculatePortfolio: () => void;
  updateAllPrices: () => Promise<void>;
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
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
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

  // --- Sincronização com o Supabase ---

  const syncAssetToSupabase = useCallback(async (asset: Asset, userId: string) => {
    if (!supabase) return;
    try {
      const payload = {
        id: asset.id,
        user_id: userId,
        ticker: asset.ticker.toUpperCase(),
        name: asset.name || asset.ticker.toUpperCase(),
        type: asset.type,
        quantity: asset.quantity,
        average_price: asset.averagePrice,
        current_price: asset.currentPrice,
        total_invested: asset.totalInvested,
        current_value: asset.currentValue,
        profit_loss: asset.profitLoss,
        profit_loss_percent: asset.profitLossPercent,
        notes: asset.notes || null,
        created_at: asset.createdAt,
        updated_at: asset.updatedAt || new Date().toISOString(),
      };
      await supabase.from('investment_assets').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.error('Erro ao sincronizar ativo no Supabase:', err);
    }
  }, []);

  const deleteAssetFromSupabase = useCallback(async (assetId: string) => {
    if (!supabase) return;
    try {
      await supabase.from('investment_dividends').delete().eq('asset_id', assetId);
      await supabase.from('investment_transactions').delete().eq('asset_id', assetId);
      await supabase.from('investment_assets').delete().eq('id', assetId);
    } catch (err) {
      console.error('Erro ao excluir ativo do Supabase:', err);
    }
  }, []);

  const syncTransactionToSupabase = useCallback(async (tx: Transaction, userId: string) => {
    if (!supabase) return;
    try {
      const payload = {
        id: tx.id,
        user_id: userId,
        asset_id: tx.assetId,
        ticker: tx.ticker.toUpperCase(),
        type: tx.type,
        quantity: tx.quantity,
        price: tx.price,
        total_amount: tx.totalAmount,
        fees: tx.fees || 0,
        date: tx.date,
        notes: tx.notes || null,
        created_at: tx.createdAt,
      };
      await supabase.from('investment_transactions').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.error('Erro ao sincronizar transação no Supabase:', err);
    }
  }, []);

  const deleteTransactionFromSupabase = useCallback(async (txId: string) => {
    if (!supabase) return;
    try {
      await supabase.from('investment_transactions').delete().eq('id', txId);
    } catch (err) {
      console.error('Erro ao excluir transação do Supabase:', err);
    }
  }, []);

  const syncDividendToSupabase = useCallback(async (div: Dividend, userId: string) => {
    if (!supabase) return;
    try {
      const payload = {
        id: div.id,
        user_id: userId,
        asset_id: div.assetId,
        ticker: div.ticker.toUpperCase(),
        type: div.type,
        amount_per_share: div.amountPerShare,
        total_amount: div.totalAmount,
        quantity: div.quantity,
        payment_date: div.paymentDate,
        reference_date: div.referenceDate || null,
        notes: div.notes || null,
        created_at: div.createdAt,
      };
      await supabase.from('investment_dividends').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.error('Erro ao sincronizar dividendo no Supabase:', err);
    }
  }, []);

  const deleteDividendFromSupabase = useCallback(async (divId: string) => {
    if (!supabase) return;
    try {
      await supabase.from('investment_dividends').delete().eq('id', divId);
    } catch (err) {
      console.error('Erro ao excluir dividendo do Supabase:', err);
    }
  }, []);

  // Carregar dados do Supabase
  const loadSupabaseData = useCallback(async (userId: string) => {
    if (!supabase) return;
    setIsLoadingData(true);

    try {
      // 1. Carregar Ativos
      const { data: assetData, error: assetError } = await supabase
        .from('investment_assets')
        .select('*')
        .eq('user_id', userId);

      let mappedAssets: Asset[] = [];
      if (assetError) {
        console.error('Erro ao buscar ativos do Supabase:', assetError);
      } else if (assetData) {
        mappedAssets = assetData.map((a: Record<string, unknown>) => ({
          id: String(a.id),
          ticker: String(a.ticker),
          name: String(a.name || a.ticker),
          type: (a.type as Asset['type']) || 'stock',
          quantity: Number(a.quantity || 0),
          averagePrice: Number(a.average_price || 0),
          currentPrice: Number(a.current_price || 0),
          totalInvested: Number(a.total_invested || 0),
          currentValue: Number(a.current_value || 0),
          profitLoss: Number(a.profit_loss || 0),
          profitLossPercent: Number(a.profit_loss_percent || 0),
          notes: a.notes ? String(a.notes) : undefined,
          createdAt: String(a.created_at || new Date().toISOString()),
          updatedAt: a.updated_at ? String(a.updated_at) : undefined,
        }));
      }

      // 2. Carregar Transações
      const { data: txData, error: txError } = await supabase
        .from('investment_transactions')
        .select('*')
        .eq('user_id', userId);

      let mappedTransactions: Transaction[] = [];
      if (txError) {
        console.error('Erro ao buscar transações de investimento do Supabase:', txError);
      } else if (txData) {
        mappedTransactions = txData.map((t: Record<string, unknown>) => ({
          id: String(t.id),
          assetId: String(t.asset_id),
          ticker: String(t.ticker),
          type: (t.type as Transaction['type']) || 'buy',
          quantity: Number(t.quantity || 0),
          price: Number(t.price || 0),
          totalAmount: Number(t.total_amount || 0),
          fees: t.fees ? Number(t.fees) : undefined,
          date: String(t.date),
          notes: t.notes ? String(t.notes) : undefined,
          createdAt: String(t.created_at || new Date().toISOString()),
        }));
      }

      // 3. Carregar Proventos / Dividendos
      const { data: divData, error: divError } = await supabase
        .from('investment_dividends')
        .select('*')
        .eq('user_id', userId);

      let mappedDividends: Dividend[] = [];
      if (divError) {
        console.error('Erro ao buscar proventos de investimento do Supabase:', divError);
      } else if (divData) {
        mappedDividends = divData.map((d: Record<string, unknown>) => ({
          id: String(d.id),
          assetId: String(d.asset_id),
          ticker: String(d.ticker),
          type: (d.type as Dividend['type']) || 'dividend',
          amountPerShare: Number(d.amount_per_share || 0),
          totalAmount: Number(d.total_amount || 0),
          quantity: Number(d.quantity || 0),
          paymentDate: String(d.payment_date),
          referenceDate: d.reference_date ? String(d.reference_date) : undefined,
          notes: d.notes ? String(d.notes) : undefined,
          createdAt: String(d.created_at || new Date().toISOString()),
        }));
      }

      // Mesclar dados locais pendentes (criados offline ou antes do sync)
      setAssets((prevLocal) => {
        const dbIds = new Set(mappedAssets.map(a => a.id));
        const pendingLocal = prevLocal.filter(loc => !dbIds.has(loc.id));
        if (pendingLocal.length > 0) {
          pendingLocal.forEach(p => syncAssetToSupabase(p, userId));
        }
        return [...pendingLocal, ...mappedAssets];
      });

      setTransactions((prevLocal) => {
        const dbIds = new Set(mappedTransactions.map(t => t.id));
        const pendingLocal = prevLocal.filter(loc => !dbIds.has(loc.id));
        if (pendingLocal.length > 0) {
          pendingLocal.forEach(p => syncTransactionToSupabase(p, userId));
        }
        return [...pendingLocal, ...mappedTransactions];
      });

      setDividends((prevLocal) => {
        const dbIds = new Set(mappedDividends.map(d => d.id));
        const pendingLocal = prevLocal.filter(loc => !dbIds.has(loc.id));
        if (pendingLocal.length > 0) {
          pendingLocal.forEach(p => syncDividendToSupabase(p, userId));
        }
        return [...pendingLocal, ...mappedDividends];
      });

    } catch (err) {
      console.error('Erro geral ao carregar dados do Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [syncAssetToSupabase, syncTransactionToSupabase, syncDividendToSupabase]);

  // Carregar dados na inicialização ou login
  useEffect(() => {
    if (user && supabase) {
      loadSupabaseData(user.id);
    } else if (!user) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setAssets(data.assets || []);
          setTransactions(data.transactions || []);
          setDividends(data.dividends || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados locais do VitaInvest:', error);
      }
    }
  }, [user, loadSupabaseData]);

  // Salvar cache no localStorage sempre que os dados mudarem
  useEffect(() => {
    try {
      const data = { assets, transactions, dividends };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error);
    }
  }, [assets, transactions, dividends]);

  // --- CRUD Ativos ---

  const addAsset = (assetData: Omit<Asset, 'id' | 'createdAt'>): Asset => {
    const cleanTicker = assetData.ticker.toUpperCase().trim();
    const existingAsset = assets.find(a => a.ticker.toUpperCase().trim() === cleanTicker);

    // Se o ativo já existe na carteira, somar ao existente calculando o novo preço médio ponderado
    if (existingAsset) {
      const addedQuantity = Number(assetData.quantity || 0);
      const addedPrice = Number(assetData.averagePrice || 0);
      const addedTotal = assetData.totalInvested ?? (addedQuantity * addedPrice);

      const existingQuantity = Number(existingAsset.quantity || 0);
      const existingTotalInvested = Number(
        existingAsset.totalInvested || (existingQuantity * (existingAsset.averagePrice || 0))
      );

      const totalQuantity = existingQuantity + addedQuantity;
      const totalInvested = existingTotalInvested + addedTotal;
      const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

      // Se foi informado novo preço atual, usar ele; senão manter o preço atual existente ou o preço da nova compra
      const currentPrice = assetData.currentPrice > 0
        ? assetData.currentPrice
        : (existingAsset.currentPrice > 0 ? existingAsset.currentPrice : (addedPrice > 0 ? addedPrice : averagePrice));

      const currentValue = totalQuantity * currentPrice;
      const profitLoss = currentValue - totalInvested;
      const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

      const updatedAsset: Asset = {
        ...existingAsset,
        name: assetData.name && assetData.name !== cleanTicker ? assetData.name : existingAsset.name,
        type: assetData.type || existingAsset.type,
        quantity: totalQuantity,
        averagePrice,
        currentPrice,
        totalInvested,
        currentValue,
        profitLoss,
        profitLossPercent,
        notes: assetData.notes
          ? (existingAsset.notes ? `${existingAsset.notes}\n${assetData.notes}` : assetData.notes)
          : existingAsset.notes,
        updatedAt: new Date().toISOString(),
      };

      setAssets(prev => prev.map(a => a.id === existingAsset.id ? updatedAsset : a));

      if (user && supabase) {
        syncAssetToSupabase(updatedAsset, user.id);
      }

      return updatedAsset;
    }

    // Se for novo ativo, criar novo registro
    const totalInvested = assetData.totalInvested ?? (assetData.quantity * assetData.averagePrice);
    const currentPrice = assetData.currentPrice || assetData.averagePrice;
    const currentValue = assetData.currentValue ?? (assetData.quantity * currentPrice);
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    const newAsset: Asset = {
      ...assetData,
      ticker: cleanTicker,
      name: assetData.name ? assetData.name.trim() : cleanTicker,
      totalInvested,
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercent,
      id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    setAssets(prev => [...prev, newAsset]);

    if (user && supabase) {
      syncAssetToSupabase(newAsset, user.id);
    }

    return newAsset;
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev =>
      prev.map(asset => {
        if (asset.id === id) {
          const quantity = updates.quantity !== undefined ? updates.quantity : asset.quantity;
          const averagePrice = updates.averagePrice !== undefined ? updates.averagePrice : asset.averagePrice;
          const currentPrice = updates.currentPrice !== undefined ? updates.currentPrice : asset.currentPrice;

          const totalInvested = updates.totalInvested !== undefined ? updates.totalInvested : (quantity * averagePrice);
          const currentValue = updates.currentValue !== undefined ? updates.currentValue : (quantity * currentPrice);
          const profitLoss = currentValue - totalInvested;
          const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

          const updated: Asset = {
            ...asset,
            ...updates,
            ticker: updates.ticker ? updates.ticker.toUpperCase().trim() : asset.ticker,
            quantity,
            averagePrice,
            currentPrice,
            totalInvested,
            currentValue,
            profitLoss,
            profitLossPercent,
            updatedAt: new Date().toISOString(),
          };

          if (user && supabase) {
            syncAssetToSupabase(updated, user.id);
          }

          return updated;
        }
        return asset;
      })
    );
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setTransactions(prev => prev.filter(t => t.assetId !== id));
    setDividends(prev => prev.filter(d => d.assetId !== id));

    if (user && supabase) {
      deleteAssetFromSupabase(id);
    }
  };

  // --- CRUD Transações ---

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTransaction: Transaction = {
      ...transactionData,
      ticker: transactionData.ticker.toUpperCase().trim(),
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);

    if (user && supabase) {
      syncTransactionToSupabase(newTransaction, user.id);
    }

    // Atualizar o ativo após a transação
    updateAssetFromTransactions(transactionData.assetId);

    return newTransaction;
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (user && supabase) {
        deleteTransactionFromSupabase(id);
      }
      updateAssetFromTransactions(transaction.assetId);
    }
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
        totalInvested -= (t.quantity * (totalInvested / Math.max(1, totalQuantity + t.quantity)));
      }
    });

    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

    updateAsset(assetId, {
      quantity: totalQuantity,
      averagePrice,
      totalInvested,
    });
  };

  // --- CRUD Dividendos ---

  const addDividend = (dividendData: Omit<Dividend, 'id' | 'createdAt'>): Dividend => {
    const newDividend: Dividend = {
      ...dividendData,
      ticker: dividendData.ticker.toUpperCase().trim(),
      id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    setDividends(prev => [newDividend, ...prev]);

    if (user && supabase) {
      syncDividendToSupabase(newDividend, user.id);
    }

    return newDividend;
  };

  const updateDividend = (id: string, updates: Partial<Dividend>) => {
    setDividends(prev =>
      prev.map(div => {
        if (div.id === id) {
          const updated: Dividend = {
            ...div,
            ...updates,
            ticker: updates.ticker ? updates.ticker.toUpperCase().trim() : div.ticker,
          };

          if (user && supabase) {
            syncDividendToSupabase(updated, user.id);
          }

          return updated;
        }
        return div;
      })
    );
  };

  const deleteDividend = (id: string) => {
    setDividends(prev => prev.filter(d => d.id !== id));

    if (user && supabase) {
      deleteDividendFromSupabase(id);
    }
  };

  // --- Utilidades e Cálculos ---

  const getAssetSummary = useCallback((assetId: string): AssetSummary | null => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return null;

    const now = new Date();
    const currentYear = String(now.getFullYear());
    const currentYearMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const assetTransactions = transactions.filter(t => t.assetId === assetId);
    const assetDividends = dividends.filter(d => d.assetId === assetId);
    const totalDividends = assetDividends.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    // Proventos do ano corrente para cálculo do DY Anual
    const assetYearDividends = assetDividends.filter(
      d => d.paymentDate && d.paymentDate.startsWith(currentYear)
    );
    const yearDividends = assetYearDividends.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const yearDividendYield = asset.totalInvested > 0
      ? (yearDividends / asset.totalInvested) * 100
      : 0;

    // Proventos do mês corrente para cálculo do DY do Mês
    const assetMonthDividends = assetDividends.filter(
      d => d.paymentDate && d.paymentDate.startsWith(currentYearMonth)
    );
    const monthDividends = assetMonthDividends.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
    const monthDividendYield = asset.totalInvested > 0
      ? (monthDividends / asset.totalInvested) * 100
      : 0;
    const hasMonthDividends = assetMonthDividends.length > 0 && monthDividends > 0;

    return {
      asset,
      totalDividends,
      dividendYield: yearDividendYield,
      yearDividends,
      yearDividendYield,
      monthDividends,
      monthDividendYield,
      hasMonthDividends,
      transactions: assetTransactions,
      dividends: assetDividends,
    };
  }, [assets, transactions, dividends]);

  const recalculatePortfolio = useCallback(() => {
    const now = new Date();
    const currentYear = String(now.getFullYear());
    const currentYearMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalInvested = assets.reduce((sum, a) => sum + (a.totalInvested || 0), 0);
    const currentValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
    const totalProfitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

    const totalDividends = dividends.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    // Proventos do ano corrente
    const yearDividends = dividends
      .filter(d => d.paymentDate && d.paymentDate.startsWith(currentYear))
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    const averageDividendYield = totalInvested > 0
      ? (yearDividends / totalInvested) * 100
      : 0;

    // Proventos do mês corrente
    const monthDividends = dividends
      .filter(d => d.paymentDate && d.paymentDate.startsWith(currentYearMonth))
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    const monthDividendYield = totalInvested > 0
      ? (monthDividends / totalInvested) * 100
      : 0;

    const assetsSummaries = assets
      .map(asset => getAssetSummary(asset.id))
      .filter((s): s is AssetSummary => s !== null);

    setPortfolioStats({
      totalInvested,
      currentValue,
      totalProfitLoss,
      profitLossPercent,
      totalDividends,
      averageDividendYield,
      monthDividends,
      monthDividendYield,
      yearDividends,
      assetsCount: assets.length,
      assetsSummaries,
    });
  }, [assets, dividends, getAssetSummary]);

  // Recalcular sempre que assets ou dividends mudarem
  useEffect(() => {
    recalculatePortfolio();
  }, [assets, dividends, recalculatePortfolio]);

  // Atualizar preços em tempo real
  const updateAllPrices = async () => {
    if (assets.length === 0) return;

    const tickers = assets.map(a => a.ticker);
    const prices = await fetchMultipleStockPrices(tickers);

    setAssets(prev =>
      prev.map(asset => {
        const newPrice = prices[asset.ticker];
        if (newPrice && newPrice > 0) {
          const currentValue = asset.quantity * newPrice;
          const profitLoss = currentValue - asset.totalInvested;
          const profitLossPercent = asset.totalInvested > 0
            ? (profitLoss / asset.totalInvested) * 100
            : 0;

          const updated: Asset = {
            ...asset,
            currentPrice: newPrice,
            currentValue,
            profitLoss,
            profitLossPercent,
            updatedAt: new Date().toISOString(),
          };

          if (user && supabase) {
            syncAssetToSupabase(updated, user.id);
          }

          return updated;
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
        isLoadingData,
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
