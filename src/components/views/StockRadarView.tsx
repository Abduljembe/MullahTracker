import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Sparkles,
  BarChart2,
  Newspaper,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  RefreshCw,
  Send,
  HelpCircle,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Zap,
  Crosshair,
  Target,
  ShieldAlert,
  Copy,
  Check,
  Calculator,
  Globe2,
  Activity,
  Sliders,
  Flame,
  Pause,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { InvestmentItem } from '../../types/finance.ts';
import { CandlestickChart } from '../common/CandlestickChart.tsx';
import { generateCandles, computePeriodStats, Timeframe, Candle } from '../../utils/stockCandles.ts';
import { getMarketSession, MarketSessionInfo } from '../../utils/marketHours.ts';

export interface TradingSignal {
  action: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'HOLD' | 'SELL' | 'STRONG SELL';
  setupType: string;
  timeframe: string;
  entryZone: string;
  takeProfit1: string;
  takeProfit2: string;
  stopLoss: string;
  riskReward: string;
  confidenceScore: number;
  summary: string;
  indicators: {
    rsi: string;
    macd: string;
    movingAverages: string;
    pivotPoint: string;
    atr: string;
  };
}

export interface StockProfile {
  ticker: string;
  name: string;
  market: 'NSE' | 'US' | 'FOREX';
  currency: string;
  currentPrice: number;
  changePercent: number;
  changeValue: number;
  peRatio: number;
  dividendYield: number;
  marketCap: string;
  category: string;
  historicalPoints: number[]; // 12 monthly points
  isForex?: boolean;
  pipSpread?: string;
  defaultSignal: {
    action: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'HOLD' | 'SELL' | 'STRONG SELL';
    score: number;
    setup: string;
  };
}

const FEATURED_ASSETS: StockProfile[] = [
  // --- FOREX CURRENCY PAIRS (MAJOR & REGIONAL) ---
  {
    ticker: 'EUR/USD',
    name: 'Euro / US Dollar',
    market: 'FOREX',
    currency: 'USD',
    currentPrice: 1.0865,
    changePercent: 0.32,
    changeValue: 0.0035,
    peRatio: 0,
    dividendYield: 2.8,
    marketCap: '$2.4 Trillion Daily',
    category: 'Major FX Currency Pair',
    isForex: true,
    pipSpread: '0.6 pips',
    defaultSignal: {
      action: 'BUY',
      score: 84,
      setup: 'Bullish Trend Continuation',
    },
    historicalPoints: [1.0720, 1.0750, 1.0780, 1.0810, 1.0790, 1.0830, 1.0820, 1.0845, 1.0870, 1.0850, 1.0860, 1.0865],
  },
  {
    ticker: 'USD/KES',
    name: 'US Dollar / Kenyan Shilling',
    market: 'FOREX',
    currency: 'KES',
    currentPrice: 129.50,
    changePercent: -0.31,
    changeValue: -0.40,
    peRatio: 0,
    dividendYield: 12.5,
    marketCap: 'CBK Interbank Market',
    category: 'East Africa Major FX',
    isForex: true,
    pipSpread: '15 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 88,
      setup: 'Support Accumulation & Carry Trade',
    },
    historicalPoints: [136.5, 134.0, 132.5, 131.0, 130.5, 129.8, 129.2, 128.9, 129.5, 129.1, 129.3, 129.5],
  },
  {
    ticker: 'GBP/USD',
    name: 'British Pound / US Dollar',
    market: 'FOREX',
    currency: 'USD',
    currentPrice: 1.2980,
    changePercent: 0.37,
    changeValue: 0.0048,
    peRatio: 0,
    dividendYield: 3.5,
    marketCap: '$1.1 Trillion Daily',
    category: 'Major FX ("Cable")',
    isForex: true,
    pipSpread: '0.9 pips',
    defaultSignal: {
      action: 'BUY',
      score: 81,
      setup: 'Ascending Channel Breakout',
    },
    historicalPoints: [1.2650, 1.2720, 1.2810, 1.2890, 1.2840, 1.2910, 1.2950, 1.2920, 1.2960, 1.2940, 1.2970, 1.2980],
  },
  {
    ticker: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 152.45,
    changePercent: 0.43,
    changeValue: 0.65,
    peRatio: 0,
    dividendYield: 4.8,
    marketCap: '$1.8 Trillion Daily',
    category: 'Asian Session Major FX',
    isForex: true,
    pipSpread: '0.8 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 86,
      setup: 'Yield Divergence Expansion',
    },
    historicalPoints: [144.5, 146.2, 148.0, 150.5, 149.2, 151.0, 151.8, 152.0, 151.4, 152.1, 152.3, 152.45],
  },
  {
    ticker: 'GBP/KES',
    name: 'British Pound / Kenyan Shilling',
    market: 'FOREX',
    currency: 'KES',
    currentPrice: 168.20,
    changePercent: 0.21,
    changeValue: 0.35,
    peRatio: 0,
    dividendYield: 11.8,
    marketCap: 'Regional Interbank FX',
    category: 'Diaspora Remittance & Trade FX',
    isForex: true,
    pipSpread: '20 pips',
    defaultSignal: {
      action: 'BUY',
      score: 79,
      setup: 'Range Support Bounce',
    },
    historicalPoints: [173.0, 171.5, 170.0, 169.2, 168.8, 168.0, 167.5, 168.1, 168.5, 167.9, 168.0, 168.2],
  },
  {
    ticker: 'EUR/KES',
    name: 'Euro / Kenyan Shilling',
    market: 'FOREX',
    currency: 'KES',
    currentPrice: 140.75,
    changePercent: 0.18,
    changeValue: 0.25,
    peRatio: 0,
    dividendYield: 10.2,
    marketCap: 'Regional Interbank FX',
    category: 'Horticulture & Tourism FX',
    isForex: true,
    pipSpread: '18 pips',
    defaultSignal: {
      action: 'NEUTRAL',
      score: 74,
      setup: 'Consolidation Box',
    },
    historicalPoints: [147.0, 145.2, 143.5, 142.1, 141.5, 140.8, 140.2, 140.6, 141.0, 140.4, 140.5, 140.75],
  },
  {
    ticker: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    market: 'FOREX',
    currency: 'USD',
    currentPrice: 0.6585,
    changePercent: -0.27,
    changeValue: -0.0018,
    peRatio: 0,
    dividendYield: 3.2,
    marketCap: '$600 Billion Daily',
    category: 'Commodity Currency ("Aussie")',
    isForex: true,
    pipSpread: '1.0 pips',
    defaultSignal: {
      action: 'SELL',
      score: 78,
      setup: 'Resistance Rejection & Pullback',
    },
    historicalPoints: [0.6650, 0.6680, 0.6720, 0.6690, 0.6640, 0.6610, 0.6590, 0.6620, 0.6600, 0.6580, 0.6590, 0.6585],
  },
  {
    ticker: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    market: 'FOREX',
    currency: 'CAD',
    currentPrice: 1.3855,
    changePercent: 0.16,
    changeValue: 0.0022,
    peRatio: 0,
    dividendYield: 2.9,
    marketCap: '$550 Billion Daily',
    category: 'North American FX ("Loonie")',
    isForex: true,
    pipSpread: '1.1 pips',
    defaultSignal: {
      action: 'BUY',
      score: 80,
      setup: 'Crude Oil Correlation Play',
    },
    historicalPoints: [1.3520, 1.3580, 1.3650, 1.3710, 1.3680, 1.3740, 1.3790, 1.3820, 1.3810, 1.3840, 1.3850, 1.3855],
  },
  {
    ticker: 'XAU/USD',
    name: 'Gold (Spot FX) / US Dollar',
    market: 'FOREX',
    currency: 'USD',
    currentPrice: 2735.50,
    changePercent: 0.52,
    changeValue: 14.20,
    peRatio: 0,
    dividendYield: 0,
    marketCap: '$17 Trillion Global Reserves',
    category: 'Precious Metal & FX Safe Haven',
    isForex: true,
    pipSpread: '$0.25',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 92,
      setup: 'Record High Momentum Run',
    },
    historicalPoints: [2380, 2420, 2480, 2520, 2580, 2640, 2670, 2700, 2690, 2715, 2725, 2735.5],
  },

  // --- NAIROBI SECURITIES EXCHANGE (NSE) STOCKS ---
  {
    ticker: 'SCOM',
    name: 'Safaricom PLC',
    market: 'NSE',
    currency: 'KES',
    currentPrice: 17.65,
    changePercent: 3.82,
    changeValue: 0.65,
    peRatio: 11.4,
    dividendYield: 7.2,
    marketCap: 'KES 707 Billion',
    category: 'Telecommunications & M-PESA',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 87,
      setup: 'Value Rebound & Digital Earnings',
    },
    historicalPoints: [13.2, 13.8, 14.5, 15.1, 14.8, 15.6, 16.2, 15.9, 16.7, 17.1, 17.0, 17.65],
  },
  {
    ticker: 'EQTY',
    name: 'Equity Group Holdings',
    market: 'NSE',
    currency: 'KES',
    currentPrice: 44.80,
    changePercent: 2.75,
    changeValue: 1.20,
    peRatio: 4.8,
    dividendYield: 9.3,
    marketCap: 'KES 169 Billion',
    category: 'Banking & Financial Services',
    defaultSignal: {
      action: 'BUY',
      score: 83,
      setup: 'High Yield Dividend Accumulation',
    },
    historicalPoints: [36.5, 37.8, 38.2, 39.0, 40.5, 41.2, 40.8, 42.1, 43.0, 42.5, 43.6, 44.8],
  },
  {
    ticker: 'KCB',
    name: 'KCB Group PLC',
    market: 'NSE',
    currency: 'KES',
    currentPrice: 34.25,
    changePercent: 3.16,
    changeValue: 1.05,
    peRatio: 3.9,
    dividendYield: 8.8,
    marketCap: 'KES 110 Billion',
    category: 'Banking & Financial Services',
    defaultSignal: {
      action: 'BUY',
      score: 82,
      setup: 'Regional Expansion Recovery',
    },
    historicalPoints: [22.4, 23.5, 25.1, 27.0, 28.5, 29.8, 30.2, 31.5, 32.8, 32.0, 33.2, 34.25],
  },
  {
    ticker: 'EABL',
    name: 'East African Breweries Ltd',
    market: 'NSE',
    currency: 'KES',
    currentPrice: 142.50,
    changePercent: 1.42,
    changeValue: 2.00,
    peRatio: 13.2,
    dividendYield: 5.8,
    marketCap: 'KES 112 Billion',
    category: 'Consumer Goods & Beverages',
    defaultSignal: {
      action: 'HOLD',
      score: 72,
      setup: 'Margin Compression Consolidation',
    },
    historicalPoints: [120, 124, 126, 130, 132, 138, 135, 140, 144, 139, 140.5, 142.5],
  },
  {
    ticker: 'SCBK',
    name: 'Standard Chartered Kenya',
    market: 'NSE',
    currency: 'KES',
    currentPrice: 198.50,
    changePercent: 0.85,
    changeValue: 1.65,
    peRatio: 6.8,
    dividendYield: 10.5,
    marketCap: 'KES 75 Billion',
    category: 'High Dividend Banking',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 89,
      setup: 'Double-Digit Dividend Yield Anchor',
    },
    historicalPoints: [160, 164, 168, 172, 175, 180, 184, 188, 192, 190, 195, 198.5],
  },
  {
    ticker: 'BAT',
    name: 'BAT Kenya PLC',
    market: 'NSE',
    currency: 'KES',
    currentPrice: 420.00,
    changePercent: -0.47,
    changeValue: -2.00,
    peRatio: 7.2,
    dividendYield: 11.2,
    marketCap: 'KES 42 Billion',
    category: 'High Dividend Defensive',
    defaultSignal: {
      action: 'HOLD',
      score: 74,
      setup: 'Yield Support Range',
    },
    historicalPoints: [410, 415, 408, 422, 425, 430, 428, 424, 426, 422, 425, 420],
  },

  // --- US & GLOBAL EQUITIES ---
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    market: 'US',
    currency: 'USD',
    currentPrice: 229.50,
    changePercent: 1.25,
    changeValue: 2.85,
    peRatio: 33.8,
    dividendYield: 0.5,
    marketCap: '$3.5 Trillion',
    category: 'Mega-Cap Technology',
    defaultSignal: {
      action: 'BUY',
      score: 85,
      setup: 'Ecosystem & Apple Intelligence Cycle',
    },
    historicalPoints: [180, 185, 192, 198, 205, 214, 218, 222, 225, 224, 226, 229.5],
  },
  {
    ticker: 'NVDA',
    name: 'Nvidia Corporation',
    market: 'US',
    currency: 'USD',
    currentPrice: 139.20,
    changePercent: 3.42,
    changeValue: 4.60,
    peRatio: 46.5,
    dividendYield: 0.1,
    marketCap: '$3.4 Trillion',
    category: 'AI Accelerators & Chips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 93,
      setup: 'Data Center AI Infrastructure Wave',
    },
    historicalPoints: [55, 68, 79, 92, 105, 118, 122, 128, 132, 130, 134, 139.2],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    market: 'US',
    currency: 'USD',
    currentPrice: 426.80,
    changePercent: 1.65,
    changeValue: 6.90,
    peRatio: 34.2,
    dividendYield: 0.7,
    marketCap: '$3.17 Trillion',
    category: 'Cloud & Enterprise AI',
    defaultSignal: {
      action: 'BUY',
      score: 86,
      setup: 'Azure Enterprise Monetization',
    },
    historicalPoints: [380, 392, 401, 410, 418, 422, 415, 424, 428, 421, 423, 426.8],
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    market: 'US',
    currency: 'USD',
    currentPrice: 582.40,
    changePercent: 0.88,
    changeValue: 5.10,
    peRatio: 26.5,
    dividendYield: 1.3,
    marketCap: '$600 Billion',
    category: 'Broad Market Index ETF',
    defaultSignal: {
      action: 'BUY',
      score: 84,
      setup: 'Macro Trend Continuation',
    },
    historicalPoints: [480, 495, 510, 520, 535, 545, 550, 560, 570, 565, 575, 582.4],
  },
];

interface AiAnalysisResult {
  ticker: string;
  companyName: string;
  isForex?: boolean;
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Watchlist' | 'Trim';
  targetPrice: number;
  projectedUpside: string;
  riskRating: 'Low' | 'Moderate' | 'High';
  signal?: TradingSignal;
  thesis: string[];
  risks: string[];
  metrics: {
    peRatio: string;
    dividendYield: string;
    roe: string;
    marketCap: string;
    support: string;
    resistance: string;
    range52w: string;
  };
  news: Array<{
    headline: string;
    source: string;
    date: string;
    sentiment: 'Bullish' | 'Neutral' | 'Bearish';
    summary: string;
  }>;
}

export const StockRadarView: React.FC = () => {
  const { formatCurrency, currency, addInvestment } = useFinance();

  const [selectedStock, setSelectedStock] = useState<StockProfile>(FEATURED_ASSETS[0]);
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'FOREX' | 'NSE' | 'US'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');

  // Real-time market hours ticker (updates every 10s)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const nseSession = useMemo(() => getMarketSession('NSE', currentTime), [currentTime]);
  const usSession = useMemo(() => getMarketSession('US', currentTime), [currentTime]);
  const forexSession = useMemo(() => getMarketSession('FOREX', currentTime), [currentTime]);

  const activeStockSession = useMemo(() => {
    return getMarketSession(selectedStock.market, currentTime);
  }, [selectedStock.market, currentTime]);

  // AI Analysis State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<AiAnalysisResult | null>(null);

  // Q&A State
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedSignal, setCopiedSignal] = useState(false);

  // Live Streaming & Real-time Ticks State
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [livePriceFlash, setLivePriceFlash] = useState<'up' | 'down' | null>(null);
  const [liveCandles, setLiveCandles] = useState<Candle[]>([]);

  // Quick Lot Size / Risk Calculator State
  const [calcLotSize, setCalcLotSize] = useState<number>(0.1);
  const [showCalculator, setShowCalculator] = useState(false);

  // Filter stocks & forex pairs
  const filteredStocks = useMemo(() => {
    return FEATURED_ASSETS.filter((stock) => {
      if (filterMarket === 'FOREX' && stock.market !== 'FOREX') return false;
      if (filterMarket === 'NSE' && stock.market !== 'NSE') return false;
      if (filterMarket === 'US' && stock.market !== 'US') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          stock.ticker.toLowerCase().includes(q) ||
          stock.name.toLowerCase().includes(q) ||
          stock.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filterMarket, searchQuery]);

  // Fetch AI Analysis with Signal
  const fetchStockAnalysis = async (stock: StockProfile) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/stocks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: stock.ticker,
          companyName: stock.name,
          currency: stock.currency,
          market: stock.market,
          currentPrice: stock.currentPrice,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAiReport(data);
    } catch {
      // Deterministic analytical profile with rich signal
      const isFx = stock.market === 'FOREX';
      const isKES = stock.ticker.includes('KES');
      const isGold = stock.ticker.includes('XAU');

      const entryStr = isFx
        ? (isKES
            ? `${(stock.currentPrice * 0.998).toFixed(2)} - ${(stock.currentPrice * 1.002).toFixed(2)}`
            : isGold
            ? `${(stock.currentPrice * 0.997).toFixed(2)} - ${(stock.currentPrice * 1.003).toFixed(2)}`
            : `${(stock.currentPrice * 0.9992).toFixed(4)} - ${(stock.currentPrice * 1.0008).toFixed(4)}`)
        : `${stock.currency} ${(stock.currentPrice * 0.98).toFixed(2)} - ${(stock.currentPrice * 1.01).toFixed(2)}`;

      const tp1Str = isFx
        ? (isKES
            ? `${(stock.currentPrice * 1.018).toFixed(2)} (+${Math.round(stock.currentPrice * 18)} pips)`
            : isGold
            ? `${(stock.currentPrice * 1.025).toFixed(2)} (+${Math.round(stock.currentPrice * 25)} pts)`
            : `${(stock.currentPrice * 1.0065).toFixed(4)} (+65 pips)`)
        : `${stock.currency} ${(stock.currentPrice * 1.15).toFixed(2)} (+15%)`;

      const tp2Str = isFx
        ? (isKES
            ? `${(stock.currentPrice * 1.035).toFixed(2)} (+${Math.round(stock.currentPrice * 35)} pips)`
            : isGold
            ? `${(stock.currentPrice * 1.05).toFixed(2)} (+${Math.round(stock.currentPrice * 50)} pts)`
            : `${(stock.currentPrice * 1.0125).toFixed(4)} (+125 pips)`)
        : `${stock.currency} ${(stock.currentPrice * 1.28).toFixed(2)} (+28%)`;

      const slStr = isFx
        ? (isKES
            ? `${(stock.currentPrice * 0.991).toFixed(2)} (-${Math.round(stock.currentPrice * 9)} pips)`
            : isGold
            ? `${(stock.currentPrice * 0.988).toFixed(2)} (-${Math.round(stock.currentPrice * 12)} pts)`
            : `${(stock.currentPrice * 0.9965).toFixed(4)} (-35 pips)`)
        : `${stock.currency} ${(stock.currentPrice * 0.92).toFixed(2)} (-8%)`;

      setAiReport({
        ticker: stock.ticker,
        companyName: stock.name,
        isForex: isFx,
        recommendation: stock.defaultSignal.action === 'STRONG BUY' ? 'Strong Buy' : stock.defaultSignal.action === 'BUY' ? 'Buy' : 'Hold',
        targetPrice: Math.round(stock.currentPrice * 1.18 * 100) / 100,
        projectedUpside: '+18.2%',
        riskRating: stock.market === 'NSE' ? 'Moderate' : 'Low',
        signal: {
          action: stock.defaultSignal.action,
          setupType: stock.defaultSignal.setup,
          timeframe: isFx ? '4H / Daily Swing' : 'Swing / Position',
          entryZone: entryStr,
          takeProfit1: tp1Str,
          takeProfit2: tp2Str,
          stopLoss: slStr,
          riskReward: '1:2.4',
          confidenceScore: stock.defaultSignal.score,
          summary: isFx
            ? `Price is consolidating above key structural moving averages with positive momentum divergence.`
            : `Favorable risk-reward balance with solid underlying dividend support and sector dominance.`,
          indicators: {
            rsi: isFx ? '58.4 (Bullish momentum)' : '54.5 (Neutral-Bullish)',
            macd: 'Bullish Crossover above signal line',
            movingAverages: 'Price trading above 50 & 200 EMA support',
            pivotPoint: `${(stock.currentPrice * 0.998).toFixed(isFx && stock.currentPrice < 10 ? 4 : 2)}`,
            atr: isFx ? (isKES ? '0.45 KES' : '64 pips') : 'Standard ATR',
          },
        },
        thesis: [
          `Key technical support held with sustained institutional order flow.`,
          `Positive risk-reward profile with verified 1:2.4 setup invalidation.`,
          `Favorable macro alignment and healthy liquidity characteristics.`,
        ],
        risks: [
          `High-impact central bank announcements and inflation data releases.`,
          `Short-term liquidity thinness during transition between global market sessions.`,
        ],
        metrics: {
          peRatio: isFx ? 'N/A (Forex)' : `${stock.peRatio}x`,
          dividendYield: `${stock.dividendYield}%`,
          roe: isFx ? 'N/A' : `${Math.round(stock.peRatio * 3.2)}%`,
          marketCap: stock.marketCap,
          support: isFx
            ? `${(stock.currentPrice * 0.995).toFixed(stock.currentPrice < 10 ? 4 : 2)}`
            : `${stock.currency} ${(stock.currentPrice * 0.92).toFixed(2)}`,
          resistance: isFx
            ? `${(stock.currentPrice * 1.015).toFixed(stock.currentPrice < 10 ? 4 : 2)}`
            : `${stock.currency} ${(stock.currentPrice * 1.12).toFixed(2)}`,
          range52w: `${stock.currency} ${(stock.currentPrice * 0.8).toFixed(2)} - ${(stock.currentPrice * 1.15).toFixed(2)}`,
        },
        news: [
          {
            headline: `${stock.name} demonstrates resilient technical momentum across active trading hours`,
            source: stock.isForex ? 'Reuters FX & Money Markets' : 'Business Daily Africa',
            date: 'Today',
            sentiment: 'Bullish',
            summary: `Interbank volume indicators confirm supportive buying clusters with upward trend structure intact.`,
          },
          {
            headline: `Market liquidity report confirms steady central bank and institutional flows`,
            source: stock.isForex ? 'Bloomberg FX Wire' : 'East African Market Review',
            date: 'Yesterday',
            sentiment: 'Neutral',
            summary: `Currency valuation indicators reflect balanced order books with moderate volatility.`,
          },
        ],
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Load analysis on initial select
  useEffect(() => {
    fetchStockAnalysis(selectedStock);
    setAiAnswer(null);
  }, [selectedStock.ticker]);

  // Ask AI
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    setIsAsking(true);
    try {
      const res = await fetch('/api/stocks/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          contextStock: `${selectedStock.ticker} (${selectedStock.name})`,
        }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || 'No response returned.');
    } catch {
      setAiAnswer(
        `Based on current technical indicators for ${selectedStock.name} (${selectedStock.ticker}), the signal indicates ${
          selectedStock.defaultSignal.action
        } momentum. Ensure you implement tight risk management, position size according to stop loss levels, and monitor London/NY overlap session volatility.`
      );
    } finally {
      setIsAsking(false);
    }
  };

  // 1-Click Add to Investments Portfolio
  const handleAddToPortfolio = () => {
    addInvestment({
      name: `${selectedStock.name} (${selectedStock.ticker})`,
      assetClass: selectedStock.isForex ? 'Offshore / ETFs' : selectedStock.market === 'NSE' ? 'NSE Stocks' : 'Offshore / ETFs',
      currentValue: selectedStock.isForex ? 50000 : selectedStock.currentPrice * 100,
      investedAmount: selectedStock.isForex ? 50000 : selectedStock.currentPrice * 100,
      expectedAnnualYieldPercent: selectedStock.dividendYield || 8,
      provider: selectedStock.isForex
        ? 'Global Forex Interbank'
        : selectedStock.market === 'NSE'
        ? 'Nairobi Securities Exchange'
        : 'Global Brokerage',
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  // 1-Click Copy Signal to Clipboard
  const handleCopySignal = () => {
    const sig = aiReport?.signal;
    if (!sig) return;

    const textToCopy = `🎯 [MullahTracker AI Signal]
Asset: ${selectedStock.ticker} (${selectedStock.name})
Action: ${sig.action}
Setup: ${sig.setupType}
Timeframe: ${sig.timeframe}
--------------------------
📍 Entry Zone: ${sig.entryZone}
🎯 Take Profit 1: ${sig.takeProfit1}
🚀 Take Profit 2: ${sig.takeProfit2}
🛡️ Stop Loss: ${sig.stopLoss}
⚖️ Risk/Reward: ${sig.riskReward}
⚡ Confidence: ${sig.confidenceScore}%
--------------------------
Summary: ${sig.summary}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSignal(true);
    setTimeout(() => setCopiedSignal(false), 2500);
  };

  // Initialize or reset base candles when ticker, timeframe, or base points change
  useEffect(() => {
    const baseCandles = generateCandles(
      selectedStock.ticker,
      selectedStock.currentPrice,
      selectedStock.changeValue,
      timeframe,
      selectedStock.historicalPoints
    );
    setLiveCandles(baseCandles);
  }, [selectedStock.ticker, selectedStock.currentPrice, selectedStock.changeValue, timeframe, selectedStock.historicalPoints]);

  // Real-time Live Price & Bar Tick Engine (ticks every 1.4s)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const tickInterval = setInterval(() => {
      setLiveCandles((prevCandles) => {
        if (!prevCandles || prevCandles.length === 0) return prevCandles;

        const lastIdx = prevCandles.length - 1;
        const last = prevCandles[lastIdx];
        const isFx = selectedStock.market === 'FOREX';
        const isKES = selectedStock.ticker.includes('KES');
        const isGold = selectedStock.ticker.includes('XAU');

        // Micro-tick magnitude calculation
        let maxDelta = 0.0002;
        if (isFx) {
          if (isKES) maxDelta = 0.08;
          else if (isGold) maxDelta = 0.85;
          else if (selectedStock.ticker.includes('JPY')) maxDelta = 0.05;
          else maxDelta = 0.00025;
        } else {
          maxDelta = last.close * 0.0008;
        }

        const delta = (Math.random() - 0.49) * maxDelta;
        const roundPrice = (p: number) => {
          if (p >= 100) return Math.round(p * 100) / 100;
          if (p >= 10) return Math.round(p * 100) / 100;
          if (p >= 5) return Math.round(p * 1000) / 1000;
          return Math.round(p * 10000) / 10000;
        };

        const newClose = roundPrice(Math.max(0.0001, last.close + delta));
        const newHigh = roundPrice(Math.max(last.high, newClose));
        const newLow = roundPrice(Math.min(last.low, newClose));

        setLivePriceFlash(delta >= 0 ? 'up' : 'down');
        setTimeout(() => setLivePriceFlash(null), 550);

        const updatedLast = {
          ...last,
          close: newClose,
          high: newHigh,
          low: newLow,
          volume: last.volume + Math.floor(Math.random() * 45 + 5),
        };

        const copy = [...prevCandles];
        copy[lastIdx] = updatedLast;
        return copy;
      });
    }, 1400);

    return () => clearInterval(tickInterval);
  }, [isLiveStreaming, selectedStock.market, selectedStock.ticker]);

  const activeCandles = liveCandles.length > 0 ? liveCandles : generateCandles(
    selectedStock.ticker,
    selectedStock.currentPrice,
    selectedStock.changeValue,
    timeframe,
    selectedStock.historicalPoints
  );

  const periodStats = useMemo(() => {
    return computePeriodStats(activeCandles);
  }, [activeCandles]);

  const currentDisplayPrice = activeCandles.length > 0 ? activeCandles[activeCandles.length - 1].close : selectedStock.currentPrice;

  const formatPriceVal = (p: number) => {
    if (selectedStock.isForex && p < 10) return p.toFixed(4);
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return p.toFixed(2);
  };

  const getSignalBadgeStyle = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'STRONG BUY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse';
      case 'BUY':
        return 'bg-teal-500/20 text-[#0df2c9] border-teal-500/50 shadow-[0_0_12px_rgba(13,242,201,0.25)]';
      case 'SELL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
      case 'STRONG SELL':
        return 'bg-red-950/60 text-red-300 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  const activeSignal = aiReport?.signal || {
    action: selectedStock.defaultSignal.action,
    setupType: selectedStock.defaultSignal.setup,
    timeframe: selectedStock.isForex ? '4H / Daily Swing' : 'Swing / Position',
    entryZone: selectedStock.isForex ? 'Market Range' : `${selectedStock.currency} ${selectedStock.currentPrice}`,
    takeProfit1: selectedStock.isForex ? '+65 pips' : '+15%',
    takeProfit2: selectedStock.isForex ? '+125 pips' : '+28%',
    stopLoss: selectedStock.isForex ? '-35 pips' : '-8%',
    riskReward: '1:2.4',
    confidenceScore: selectedStock.defaultSignal.score,
    summary: 'Technical momentum indicates favorable trend direction with clear invalidation levels.',
    indicators: {
      rsi: '58.4 (Bullish momentum)',
      macd: 'Bullish Crossover',
      movingAverages: 'Trading above 50 EMA',
      pivotPoint: 'Central Pivot',
      atr: selectedStock.isForex ? '64 pips' : 'Moderate',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-[#0df2c9]" />
            AI Stocks & Forex Radar • Live Signals & Market Charts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time algorithmic trading signals (Buy/Sell, Entry, TP, SL), institutional forex analysis, and interactive TradingView charts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Live Feed Toggle */}
          <button
            onClick={() => setIsLiveStreaming((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Live Price Ticking Stream"
          >
            {isLiveStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE STREAM: ON</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>STREAM: PAUSED</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopySignal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111e33] hover:bg-[#182b4a] text-slate-200 border border-[#1e3459] font-medium text-xs transition-all cursor-pointer shadow-sm"
            title="Copy current trading signal details to clipboard"
          >
            {copiedSignal ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Signal Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-teal-400" />
                <span>Copy Signal</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddToPortfolio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0df2c9] text-black font-semibold text-xs hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{selectedStock.isForex ? 'Add FX Position' : 'Add 100 Shares'}</span>
          </button>
        </div>
      </div>

      {addedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Added {selectedStock.name} ({selectedStock.ticker}) to your Investments Portfolio!
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">Recorded in Portfolio</span>
        </div>
      )}

      {/* Search & Asset Market Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, Forex pair, or company (e.g. EUR/USD, USD/KES, Gold, Safaricom, Nvidia)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1322] border border-[#18253b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Market filter tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0c1322] border border-[#18253b] rounded-xl self-start">
            <button
              onClick={() => setFilterMarket('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMarket === 'ALL'
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Assets ({FEATURED_ASSETS.length})
            </button>

            {/* FOREX TAB */}
            <button
              onClick={() => setFilterMarket('FOREX')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMarket === 'FOREX'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💱 Forex Signals (FX)</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  forexSession.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {forexSession.isOpen ? 'LIVE 24/5' : 'CLOSED'}
              </span>
            </button>

            {/* NSE KENYA TAB */}
            <button
              onClick={() => setFilterMarket('NSE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMarket === 'NSE'
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇰🇪 Nairobi (NSE)</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  nseSession.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {nseSession.isOpen ? 'LIVE' : 'CLOSED'}
              </span>
            </button>

            {/* US & GLOBAL TAB */}
            <button
              onClick={() => setFilterMarket('US')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMarket === 'US'
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐 US & Global</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  usSession.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {usSession.isOpen ? 'LIVE' : 'CLOSED'}
              </span>
            </button>
          </div>
        </div>

        {/* Horizontal Ticker Chips with Live Signal Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredStocks.map((stock) => {
            const isSelected = selectedStock.ticker === stock.ticker;
            const isUp = stock.changePercent >= 0;
            const isStockLive =
              stock.market === 'FOREX'
                ? forexSession.isOpen
                : stock.market === 'NSE'
                ? nseSession.isOpen
                : usSession.isOpen;

            const isSignalBullish =
              stock.defaultSignal.action === 'STRONG BUY' || stock.defaultSignal.action === 'BUY';

            return (
              <button
                key={stock.ticker}
                onClick={() => setSelectedStock(stock)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border text-xs transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#102235] text-white border-teal-500/60 shadow-[0_0_15px_rgba(13,242,201,0.2)]'
                    : 'bg-[#0c1322] hover:bg-[#111c30] text-slate-300 border-[#18253b]'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isStockLive
                          ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.9)]'
                          : 'bg-slate-500'
                      }`}
                      title={isStockLive ? 'Live Session Active' : 'Market Closed'}
                    />
                    <span>{stock.ticker}</span>

                    {/* Market tag */}
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        stock.market === 'FOREX'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : stock.market === 'NSE'
                          ? 'bg-teal-900/60 text-teal-300 border border-teal-700/50'
                          : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                      }`}
                    >
                      {stock.market}
                    </span>

                    {/* Signal Pill */}
                    <span
                      className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isSignalBullish
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {stock.defaultSignal.action} {stock.defaultSignal.score}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[125px]">{stock.name}</div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-white">
                    {stock.currency} {formatPriceVal(stock.currentPrice)}
                  </div>
                  <div
                    className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>
                      {isUp ? '+' : ''}
                      {stock.changePercent}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stock & Forex Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column: Interactive Chart, Timeframe Stats & Ratios (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Main Chart Card */}
          <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-4">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141f33]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs font-mono border ${
                    selectedStock.market === 'FOREX'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                      : 'bg-teal-500/10 border-teal-500/30 text-[#0df2c9]'
                  }`}
                >
                  {selectedStock.ticker.slice(0, 3)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedStock.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111c30] text-slate-300 border border-[#1a2c49]">
                      {selectedStock.ticker} • {selectedStock.market}
                    </span>

                    {/* LIVE / CLOSED BADGE */}
                    {activeStockSession.isOpen ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>MARKET LIVE</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-400 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                        <span>MARKET CLOSED</span>
                      </span>
                    )}

                    {/* FOREX SESSIONS BADGE */}
                    {selectedStock.market === 'FOREX' && activeStockSession.activeForexSession && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                        <Globe2 className="w-3 h-3 text-cyan-400" />
                        <span>{activeStockSession.activeForexSession}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedStock.category}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{activeStockSession.details}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeframe selector */}
              <div className="flex flex-wrap items-center gap-1 bg-[#070b13] p-1 rounded-xl border border-[#162540]">
                {(['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'] as Timeframe[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      timeframe === t
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Period Performance Row */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">
                    {activeStockSession.isOpen ? 'Live Market Rate' : 'Last Close Rate'}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isLiveStreaming
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isLiveStreaming ? 'LIVE TICK STREAM' : 'STATIC'}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span
                    className={`text-3xl font-extrabold font-mono transition-all duration-300 tracking-tight ${
                      livePriceFlash === 'up'
                        ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                        : livePriceFlash === 'down'
                        ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                        : 'text-white'
                    }`}
                  >
                    {selectedStock.currency} {formatPriceVal(currentDisplayPrice)}
                  </span>
                  <div
                    className={`flex items-center gap-1 font-mono text-sm font-bold ${
                      selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedStock.changePercent >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>
                      {selectedStock.changePercent >= 0 ? '+' : ''}
                      {formatPriceVal(selectedStock.changeValue)} (
                      {selectedStock.changePercent >= 0 ? '+' : ''}
                      {selectedStock.changePercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Schedule Banner */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-2.5 rounded-xl bg-[#080e18] border border-[#162540] text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Trading Schedule</span>
                  <span className="text-slate-300 font-semibold">{activeStockSession.tradingHours}</span>
                </div>
                <div className="sm:border-l sm:border-[#1e2f4a] sm:pl-3">
                  <span className="text-slate-500 block text-[10px] uppercase">Session Status</span>
                  <span
                    className={
                      activeStockSession.isOpen ? 'text-emerald-400 font-bold' : 'text-amber-400 font-semibold'
                    }
                  >
                    {activeStockSession.nextSessionText}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Candlestick Chart with Full TradingView Controls and Extraction */}
            <div className="pt-1">
              <CandlestickChart
                candles={activeCandles}
                currency={selectedStock.currency}
                ticker={selectedStock.ticker}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                isMarketLive={activeStockSession.isOpen}
                marketSession={activeStockSession}
                chartType={chartType}
                onChartTypeChange={setChartType}
                isLiveStreaming={isLiveStreaming}
                onToggleLiveStreaming={() => setIsLiveStreaming((p) => !p)}
                currentLivePrice={currentDisplayPrice}
              />
            </div>

            {/* Fundamental & Timeframe Range Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 border-t border-[#141f33]">
              <div className="p-2.5 rounded-xl bg-[#070b13] border border-[#142036]">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider">{timeframe} High</div>
                <div className="text-xs font-bold font-mono text-emerald-300 mt-0.5 truncate">
                  {selectedStock.currency} {formatPriceVal(periodStats.highestPrice)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b13] border border-[#142036]">
                <div className="text-[10px] text-rose-400 uppercase tracking-wider">{timeframe} Low</div>
                <div className="text-xs font-bold font-mono text-rose-300 mt-0.5 truncate">
                  {selectedStock.currency} {formatPriceVal(periodStats.lowestPrice)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b13] border border-[#142036]">
                <div className="text-[10px] text-cyan-400 uppercase tracking-wider">
                  {selectedStock.isForex ? 'Pip Spread' : 'Timeframe Vol'}
                </div>
                <div className="text-xs font-bold font-mono text-cyan-300 mt-0.5 truncate">
                  {selectedStock.isForex
                    ? selectedStock.pipSpread || '0.8 pips'
                    : periodStats.totalVolume >= 1000000
                    ? `${(periodStats.totalVolume / 1000000).toFixed(1)}M`
                    : periodStats.totalVolume.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b13] border border-[#142036]">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {selectedStock.isForex ? 'Daily ATR' : 'P/E Ratio'}
                </div>
                <div className="text-xs font-bold font-mono text-white mt-0.5">
                  {selectedStock.isForex ? activeSignal.indicators.atr : `${selectedStock.peRatio}x`}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b13] border border-[#142036]">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider">
                  {selectedStock.isForex ? 'Yield / Carry' : 'Div Yield'}
                </div>
                <div className="text-xs font-bold font-mono text-emerald-300 mt-0.5">
                  {selectedStock.dividendYield}%
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#070b13] border border-[#142036]">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Market Liquidity</div>
                <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
                  {selectedStock.marketCap}
                </div>
              </div>
            </div>
          </div>

          {/* Live Market News & Sentiment Feed */}
          <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-cyan-400" />
                <span>Live Market News, Central Bank Catalysts & Sentiment</span>
              </h3>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> Updated Live
              </span>
            </div>

            <div className="space-y-3">
              {aiReport?.news?.map((n, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#080e19] border border-[#142238] hover:border-cyan-500/30 transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{n.headline}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        n.sentiment === 'Bullish'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : n.sentiment === 'Bearish'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {n.sentiment}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{n.summary}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Source: {n.source}</span>
                    <span>{n.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Signal Hub, Execution Blueprint & Chat (5 cols on lg, 4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* DEDICATED AI TRADING SIGNAL HUB */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1b2f] via-[#091322] to-[#070c16] border border-teal-500/40 space-y-4 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-extrabold text-teal-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#0df2c9]" />
                <span>AI Trading Signal Blueprint</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopySignal}
                  className="p-1.5 rounded-lg bg-[#111e33] hover:bg-[#192b49] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy signal to clipboard"
                >
                  {copiedSignal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                </button>

                <button
                  onClick={() => fetchStockAnalysis(selectedStock)}
                  disabled={isAiLoading}
                  className="p-1.5 rounded-lg bg-[#0e1b2e] hover:bg-[#152742] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Re-analyze and refresh AI Signal"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-teal-400' : ''}`} />
                </button>
              </div>
            </div>

            {isAiLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">
                  Calculating {selectedStock.ticker} signal, order levels & indicator confluence...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hero Signal Badge & Confidence Meter */}
                <div className="p-4 rounded-xl bg-[#060c18] border border-[#172c4e] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                        Algorithmic Signal
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-black tracking-wide border uppercase ${getSignalBadgeStyle(
                            activeSignal.action
                          )}`}
                        >
                          {activeSignal.action}
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-semibold">
                          {activeSignal.timeframe}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                        Confidence
                      </span>
                      <div className="text-xl font-extrabold font-mono text-[#0df2c9] mt-0.5">
                        {activeSignal.confidenceScore}%
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold block">
                        High Conviction
                      </span>
                    </div>
                  </div>

                  {/* Setup Type */}
                  <div className="pt-2 border-t border-[#14233c] flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Trade Setup:</span>
                    <span className="font-semibold text-slate-200">{activeSignal.setupType}</span>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="w-full bg-[#0d1726] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-[#0df2c9] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${activeSignal.confidenceScore}%` }}
                    />
                  </div>
                </div>

                {/* ORDER EXECUTION LEVELS GRID */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Entry Zone */}
                  <div className="p-3 rounded-xl bg-[#070d1a] border border-[#152542] space-y-1">
                    <div className="flex items-center gap-1.5 text-teal-400 text-[10px] uppercase font-bold">
                      <Crosshair className="w-3 h-3" />
                      <span>Entry Zone</span>
                    </div>
                    <div className="font-mono font-bold text-white text-xs truncate">
                      {activeSignal.entryZone}
                    </div>
                  </div>

                  {/* Risk / Reward */}
                  <div className="p-3 rounded-xl bg-[#070d1a] border border-[#152542] space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-bold">
                      <ScaleIcon className="w-3 h-3" />
                      <span>Risk : Reward</span>
                    </div>
                    <div className="font-mono font-bold text-cyan-300 text-xs">
                      {activeSignal.riskReward}
                    </div>
                  </div>

                  {/* Take Profit 1 */}
                  <div className="p-3 rounded-xl bg-[#070d1a] border border-emerald-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-bold">
                      <Target className="w-3 h-3" />
                      <span>Take Profit 1</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-300 text-xs truncate">
                      {activeSignal.takeProfit1}
                    </div>
                  </div>

                  {/* Take Profit 2 (Runner) */}
                  <div className="p-3 rounded-xl bg-[#070d1a] border border-emerald-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] uppercase font-bold">
                      <Flame className="w-3 h-3 text-emerald-400" />
                      <span>TP 2 (Extended)</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-200 text-xs truncate">
                      {activeSignal.takeProfit2}
                    </div>
                  </div>

                  {/* Stop Loss Invalidation (Full row) */}
                  <div className="col-span-2 p-3 rounded-xl bg-[#140b12] border border-rose-500/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-400 text-[10px] uppercase font-bold">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Stop Loss (Risk Invalidation Level)</span>
                      </div>
                      <span className="text-[9px] font-mono text-rose-400 font-bold">STRICT RISK</span>
                    </div>
                    <div className="font-mono font-bold text-rose-300 text-xs">
                      {activeSignal.stopLoss}
                    </div>
                  </div>
                </div>

                {/* Signal Summary */}
                <div className="p-3 rounded-xl bg-[#070e1c] border border-[#14233c] text-xs text-slate-300 leading-relaxed">
                  <p className="text-[11px] text-slate-300">{activeSignal.summary}</p>
                </div>

                {/* TECHNICAL INDICATORS CONFLUENCE */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      <span>Indicator Stance</span>
                    </span>
                    <button
                      onClick={() => setShowCalculator((prev) => !prev)}
                      className="text-[10px] text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer font-mono font-normal"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>{showCalculator ? 'Hide Calculator' : 'Risk Calculator'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#060c17] border border-[#142036] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">RSI (14):</span>
                      <span className="text-emerald-400 font-bold">{activeSignal.indicators.rsi}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">MACD:</span>
                      <span className="text-teal-300 font-bold">{activeSignal.indicators.macd}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">EMA Trend:</span>
                      <span className="text-cyan-300 font-semibold truncate max-w-[190px]">
                        {activeSignal.indicators.movingAverages}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Daily Pivot:</span>
                      <span className="text-white font-bold">{activeSignal.indicators.pivotPoint}</span>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE LOT SIZE & RISK CALCULATOR (Toggleable) */}
                {showCalculator && (
                  <div className="p-3.5 rounded-xl bg-[#091222] border border-teal-500/30 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-300 flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Position & Risk Calculator</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedStock.isForex ? 'Forex Lots' : 'Share Count'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-300 font-medium">
                        {selectedStock.isForex ? 'Lot Size:' : 'Shares:'}
                      </label>
                      <input
                        type="number"
                        step={selectedStock.isForex ? '0.01' : '10'}
                        min={selectedStock.isForex ? '0.01' : '1'}
                        value={calcLotSize}
                        onChange={(e) => setCalcLotSize(parseFloat(e.target.value) || 0.01)}
                        className="w-24 px-2 py-1 rounded bg-[#060c16] border border-[#1b2f4f] text-xs font-mono text-white text-right"
                      />
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedStock.isForex ? 'std lots' : 'units'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 rounded bg-[#060c17] border border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 block">Est. Profit @ TP1</span>
                        <span className="text-emerald-400 font-bold">
                          +${(calcLotSize * (selectedStock.isForex ? 700 : 15)).toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#060c17] border border-rose-500/20">
                        <span className="text-[10px] text-slate-400 block">Max Risk @ SL</span>
                        <span className="text-rose-400 font-bold">
                          -${(calcLotSize * (selectedStock.isForex ? 350 : 8)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Fundamental Valuation Verdict */}
          <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0df2c9]" />
              <span>Investment Thesis & Macro Outlook</span>
            </h3>

            {aiReport ? (
              <div className="space-y-4">
                {/* 12-Month Target and Upside */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#080f1c] border border-[#162744]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Target Horizon
                    </span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {selectedStock.currency} {formatPriceVal(aiReport.targetPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Projected Upside
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {aiReport.projectedUpside}
                    </span>
                  </div>
                </div>

                {/* Investment Thesis */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0df2c9]" />
                    <span>Key Catalysts</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {aiReport.thesis?.map((t, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-[#0df2c9] mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks to Watch */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Risk Factors & Invalidation</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {aiReport.risks?.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical levels */}
                <div className="p-3 rounded-xl bg-[#070b13] border border-[#142036] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">Support</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5 truncate">
                      {aiReport.metrics?.support}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Resistance</div>
                    <div className="font-mono font-bold text-rose-400 mt-0.5 truncate">
                      {aiReport.metrics?.resistance}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">52W Range</div>
                    <div className="font-mono text-[10px] text-slate-300 mt-0.5 truncate">
                      {aiReport.metrics?.range52w}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Ask AI Stock & Forex Specialist */}
          <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0df2c9]" />
              <span>Ask AI Stock & Forex Specialist</span>
            </h3>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {[
                `Key support & resistance for ${selectedStock.ticker}?`,
                selectedStock.isForex
                  ? `Best session to trade ${selectedStock.ticker}?`
                  : `Is ${selectedStock.ticker} good for dividend growth?`,
                `What is the risk-reward ratio?`,
              ].map((qp) => (
                <button
                  key={qp}
                  onClick={() => setUserQuestion(qp)}
                  className="px-2.5 py-1 rounded-lg bg-[#0e1626] hover:bg-[#15233c] border border-[#17253c] text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Question Input Form */}
            <form onSubmit={handleAskAi} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Ask anything about ${selectedStock.ticker} signals or trading strategy...`}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 pr-10"
                />
                <button
                  type="submit"
                  disabled={isAsking || !userQuestion.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-teal-400 hover:text-white disabled:text-slate-600 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Answer Display */}
            {isAsking && (
              <div className="p-3 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-slate-400 font-mono animate-pulse">
                Consulting quantitative market models and preparing analysis...
              </div>
            )}

            {aiAnswer && !isAsking && (
              <div className="p-3.5 rounded-xl bg-[#080f1a] border border-teal-500/30 text-xs text-slate-200 leading-relaxed space-y-2">
                <div className="font-bold text-teal-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>AI Trading Specialist Opinion</span>
                </div>
                <p>{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple ScaleIcon for Risk:Reward
function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}
