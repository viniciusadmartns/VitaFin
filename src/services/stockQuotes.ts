// Serviço para buscar cotações em tempo real via Brapi
// API para ações e FIIs brasileiros: https://brapi.dev

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  shortName?: string;
  longName?: string;
  currency?: string;
  marketTime?: string;
  logourl?: string;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

export const BRAPI_TOKEN = '1q6gaDhHXjak6gjYzawdry';
const BRAPI_BASE_URL = 'https://brapi.dev/api/quote';

// Cache em memória para evitar requisições redundantes (TTL de 60 segundos)
const quotesCache: Map<string, { price: number; quote?: StockQuote; timestamp: number }> = new Map();
const CACHE_TTL_MS = 60 * 1000;

export async function fetchStockQuoteInfo(ticker: string): Promise<StockQuote | null> {
  if (!ticker || !ticker.trim()) return null;
  const cleanTicker = ticker.toUpperCase().trim();

  // Verificar cache
  const cached = quotesCache.get(cleanTicker);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS && cached.quote) {
    return cached.quote;
  }

  try {
    const url = `${BRAPI_BASE_URL}/${cleanTicker}?token=${BRAPI_TOKEN}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[Brapi] Erro ao buscar cotação de ${cleanTicker}: status ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const quote: StockQuote = {
        symbol: result.symbol || cleanTicker,
        regularMarketPrice: Number(result.regularMarketPrice || 0),
        shortName: result.shortName,
        longName: result.longName,
        currency: result.currency,
        marketTime: result.regularMarketTime,
        logourl: result.logourl,
        regularMarketChange: result.regularMarketChange,
        regularMarketChangePercent: result.regularMarketChangePercent,
      };

      if (quote.regularMarketPrice > 0) {
        quotesCache.set(cleanTicker, {
          price: quote.regularMarketPrice,
          quote,
          timestamp: Date.now(),
        });
      }

      return quote;
    }

    return null;
  } catch (error) {
    console.error(`[Brapi] Erro ao buscar cotação de ${cleanTicker}:`, error);
    return null;
  }
}

export async function fetchStockPrice(ticker: string): Promise<number | null> {
  const info = await fetchStockQuoteInfo(ticker);
  return info && info.regularMarketPrice > 0 ? info.regularMarketPrice : null;
}

export async function fetchMultipleStockPrices(tickers: string[]): Promise<Record<string, number>> {
  if (!tickers || tickers.length === 0) return {};

  const cleanTickers = Array.from(
    new Set(tickers.map(t => t.toUpperCase().trim()).filter(Boolean))
  );

  const prices: Record<string, number> = {};
  const tickersToFetch: string[] = [];

  // Checar cache primeiro
  cleanTickers.forEach(ticker => {
    const cached = quotesCache.get(ticker);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      prices[ticker] = cached.price;
    } else {
      tickersToFetch.push(ticker);
    }
  });

  if (tickersToFetch.length === 0) {
    return prices;
  }

  try {
    const tickersParam = tickersToFetch.join(',');
    const url = `${BRAPI_BASE_URL}/${tickersParam}?token=${BRAPI_TOKEN}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[Brapi] Erro ao buscar cotações múltiplas: status ${response.status}`);
      return prices;
    }

    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((result: any) => {
        if (result.symbol && result.regularMarketPrice) {
          const sym = result.symbol.toUpperCase().trim();
          const price = Number(result.regularMarketPrice || 0);
          if (price > 0) {
            prices[sym] = price;
            quotesCache.set(sym, {
              price,
              quote: {
                symbol: sym,
                regularMarketPrice: price,
                shortName: result.shortName,
                longName: result.longName,
                logourl: result.logourl,
              },
              timestamp: Date.now(),
            });
          }
        }
      });
    }

    return prices;
  } catch (error) {
    console.error('[Brapi] Erro ao buscar cotações múltiplas:', error);
    return prices;
  }
}
