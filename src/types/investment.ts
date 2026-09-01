// Tipos completos para o sistema VitaInvest

export type AssetType =
  | 'stock'           // Ações
  | 'fund'            // Fundos Imobiliários (FIIs)
  | 'fixed-income'    // Renda Fixa
  | 'crypto'          // Criptomoedas
  | 'reit'            // REITs
  | 'etf'             // ETFs
  | 'other';          // Outros

export type DividendType =
  | 'dividend'        // Dividendo
  | 'jcp'             // Juros sobre Capital Próprio
  | 'income'          // Rendimento (FIIs)
  | 'bonus';          // Bonificação

// Representa um ativo na carteira (ação, fundo, etc)
export interface Asset {
  id: string;
  ticker: string;              // Código do ativo (ex: PETR4, MXRF11)
  name: string;                // Nome completo
  type: AssetType;             // Tipo de ativo
  quantity: number;            // Quantidade de cotas/ações
  averagePrice: number;        // Preço médio de compra
  currentPrice: number;        // Preço atual (última cotação)
  totalInvested: number;       // Total investido (quantity * averagePrice)
  currentValue: number;        // Valor atual (quantity * currentPrice)
  profitLoss: number;          // Lucro/prejuízo (currentValue - totalInvested)
  profitLossPercent: number;   // % de lucro/prejuízo
  createdAt: string;           // Data de criação
  updatedAt?: string;          // Última atualização
  notes?: string;              // Observações
}

// Representa uma transação (compra/venda)
export interface Transaction {
  id: string;
  assetId: string;             // ID do ativo
  ticker: string;              // Código do ativo
  type: 'buy' | 'sell';        // Tipo de transação
  quantity: number;            // Quantidade
  price: number;               // Preço unitário
  totalAmount: number;         // Valor total (quantity * price + fees)
  fees?: number;               // Taxas (corretagem, etc)
  date: string;                // Data da transação (YYYY-MM-DD)
  notes?: string;              // Observações
  createdAt: string;
}

// Representa um provento recebido (dividendo, JCP, rendimento)
export interface Dividend {
  id: string;
  assetId: string;             // ID do ativo
  ticker: string;              // Código do ativo
  type: DividendType;          // Tipo de provento
  amountPerShare: number;      // Valor por ação/cota
  totalAmount: number;         // Valor total recebido
  quantity: number;            // Quantidade de ações na data
  paymentDate: string;         // Data do pagamento (YYYY-MM-DD)
  referenceDate?: string;      // Data com (para cálculo de posição)
  notes?: string;              // Observações
  createdAt: string;
}

// Resumo de um ativo com seus proventos
export interface AssetSummary {
  asset: Asset;
  totalDividends: number;      // Total de proventos recebidos
  dividendYield: number;       // DY% = (totalDividends / totalInvested) * 100
  transactions: Transaction[]; // Histórico de transações
  dividends: Dividend[];       // Histórico de proventos
}

// Estatísticas da carteira
export interface PortfolioStats {
  totalInvested: number;       // Total investido
  currentValue: number;        // Valor atual da carteira
  totalProfitLoss: number;     // Lucro/prejuízo total
  profitLossPercent: number;   // % de lucro/prejuízo
  totalDividends: number;      // Total de proventos recebidos
  averageDividendYield: number;// DY% médio da carteira
  assetsCount: number;         // Quantidade de ativos
  assetsSummaries: AssetSummary[]; // Resumo por ativo
}

// Distribuição por tipo de ativo
export interface AssetTypeDistribution {
  type: AssetType;
  typeName: string;            // Nome legível do tipo
  totalInvested: number;       // Total investido neste tipo
  currentValue: number;        // Valor atual neste tipo
  percentage: number;          // % do portfólio
  count: number;               // Quantidade de ativos deste tipo
}

// Histórico mensal de proventos
export interface MonthlyDividends {
  month: string;               // 'YYYY-MM'
  total: number;               // Total recebido no mês
  count: number;               // Quantidade de proventos
  byAsset: {                   // Por ativo
    ticker: string;
    amount: number;
  }[];
}
