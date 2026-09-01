// Serviço para buscar cotações em tempo real via Brapi
// API gratuita para ações brasileiras: https://brapi.dev

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  shortName: string;
  currency: string;
  marketTime: string;
}

const BRAPI_BASE_URL = 'https://brapi.dev/api/quote';

export async function fetchStockPrice(ticker: string): Promise<number | null> {
  try {
    const response = await fetch(`${BRAPI_BASE_URL}/${ticker}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Erro ao buscar cotação de ${ticker}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].regularMarketPrice || null;
    }

    return null;
  } catch (error) {
    console.error(`Erro ao buscar cotação de ${ticker}:`, error);
    return null;
  }
}

export async function fetchMultipleStockPrices(tickers: string[]): Promise<Record<string, number>> {
  try {
    // Brapi permite múltiplos tickers separados por vírgula
    const tickersParam = tickers.join(',');
    const response = await fetch(`${BRAPI_BASE_URL}/${tickersParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Erro ao buscar cotações: ${response.status}`);
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    if (data.results) {
      data.results.forEach((quote: StockQuote) => {
        if (quote.regularMarketPrice) {
          prices[quote.symbol] = quote.regularMarketPrice;
        }
      });
    }

    return prices;
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return {};
  }
}
