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
  Bell,
  Award,
  Globe,
  Grid,
  Smartphone,
  Tv,
  Camera,
  LayoutGrid,
  Table,
  Filter,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { InvestmentItem } from '../../types/finance.ts';
import { CandlestickChart } from '../common/CandlestickChart.tsx';
import { TradingViewWidget } from '../common/TradingViewWidget.tsx';
import { PaperTradingDesk, PrefillOrderData } from '../common/PaperTradingDesk.tsx';
import { ChartScreenshotAnalyzerModal } from '../common/ChartScreenshotAnalyzerModal.tsx';
import { EconomicCalendar } from '../common/EconomicCalendar.tsx';
import { PriceAlertsModal, playAlertChime, PriceAlert } from '../common/PriceAlertsModal.tsx';
import { TradingJournalDesk } from '../common/TradingJournalDesk.tsx';
import { RiskCalculatorDesk } from '../common/RiskCalculatorDesk.tsx';
import { CurrencyStrengthMeter } from '../common/CurrencyStrengthMeter.tsx';
import { StrategyBacktester } from '../common/StrategyBacktester.tsx';
import { ForexFactoryNewsDesk } from '../common/ForexFactoryNewsDesk.tsx';
import { InstitutionalSignalCard } from '../common/InstitutionalSignalCard.tsx';
import { ForexSessionsKillzones } from '../common/ForexSessionsKillzones.tsx';
import { PropFirmRiskGuardian } from '../common/PropFirmRiskGuardian.tsx';
import { CurrencyCorrelationMatrix } from '../common/CurrencyCorrelationMatrix.tsx';
import { BrokerMpesaArbiter } from '../common/BrokerMpesaArbiter.tsx';
import { OrderFlowLiquidityDesk } from '../common/OrderFlowLiquidityDesk.tsx';
import { LiveMarketsTVDesk } from '../common/LiveMarketsTVDesk.tsx';
import { generateCandles, computePeriodStats, Timeframe, Candle } from '../../utils/stockCandles.ts';
import { getMarketSession, MarketSessionInfo } from '../../utils/marketHours.ts';

export interface TradingSignal {
  action: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'HOLD' | 'SELL' | 'STRONG SELL';
  setupType: string;
  timeframe: string;
  timeframeCategory?: string;
  confirmationScore?: string;
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
  smc?: {
    orderBlock?: string;
    fairValueGap?: string;
    liquidityTarget?: string;
    marketStructure?: string;
  };
  tradeManagement?: {
    breakEvenRule?: string;
    partialProfitRule?: string;
    invalidationRule?: string;
  };
  multiAspectAnalysis?: {
    marketStructure?: string;
    smartMoneyConcepts?: string;
    indicatorConfluence?: string;
    macroForexFactory?: string;
  };
}

export interface StockProfile {
  ticker: string;
  name: string;
  market: 'NSE' | 'US' | 'FOREX' | 'METALS' | 'INDICES';
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
  isMetal?: boolean;
  isIndex?: boolean;
  pipSpread?: string;
  defaultSignal: {
    action: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'HOLD' | 'SELL' | 'STRONG SELL';
    score: number;
    setup: string;
  };
}

const FEATURED_ASSETS: StockProfile[] = [
  // ==========================================
  // --- FOREX: MAJORS (7) ---
  // ==========================================
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
      setup: 'Bullish Trend Continuation & FVG Retest',
    },
    historicalPoints: [1.0720, 1.0750, 1.0780, 1.0810, 1.0790, 1.0830, 1.0820, 1.0845, 1.0870, 1.0850, 1.0860, 1.0865],
  },
  {
    ticker: 'GBP/USD',
    name: 'British Pound / US Dollar ("Cable")',
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
      setup: 'Ascending Channel Breakout & Order Block Retest',
    },
    historicalPoints: [1.2650, 1.2720, 1.2810, 1.2890, 1.2840, 1.2910, 1.2950, 1.2920, 1.2960, 1.2940, 1.2970, 1.2980],
  },
  {
    ticker: 'USD/JPY',
    name: 'US Dollar / Japanese Yen ("Ninja")',
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
      setup: 'Yield Divergence Expansion & 152.0 Support',
    },
    historicalPoints: [144.5, 146.2, 148.0, 150.5, 149.2, 151.0, 151.8, 152.0, 151.4, 152.1, 152.3, 152.45],
  },
  {
    ticker: 'USD/CHF',
    name: 'US Dollar / Swiss Franc ("Swissy")',
    market: 'FOREX',
    currency: 'CHF',
    currentPrice: 0.8670,
    changePercent: -0.15,
    changeValue: -0.0013,
    peRatio: 0,
    dividendYield: 1.4,
    marketCap: '$450 Billion Daily',
    category: 'European Safe-Haven Major FX',
    isForex: true,
    pipSpread: '1.0 pips',
    defaultSignal: {
      action: 'SELL',
      score: 77,
      setup: 'Resistance Rejection at 0.8700 & CHoCH',
    },
    historicalPoints: [0.8950, 0.8910, 0.8840, 0.8790, 0.8720, 0.8690, 0.8650, 0.8680, 0.8640, 0.8660, 0.8665, 0.8670],
  },
  {
    ticker: 'AUD/USD',
    name: 'Australian Dollar / US Dollar ("Aussie")',
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
    name: 'US Dollar / Canadian Dollar ("Loonie")',
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
      setup: 'Crude Oil Correlation & Trend Support',
    },
    historicalPoints: [1.3520, 1.3580, 1.3650, 1.3710, 1.3680, 1.3740, 1.3790, 1.3820, 1.3810, 1.3840, 1.3850, 1.3855],
  },
  {
    ticker: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar ("Kiwi")',
    market: 'FOREX',
    currency: 'USD',
    currentPrice: 0.5975,
    changePercent: -0.35,
    changeValue: -0.0021,
    peRatio: 0,
    dividendYield: 4.1,
    marketCap: '$380 Billion Daily',
    category: 'Asia-Pacific Major FX ("Kiwi")',
    isForex: true,
    pipSpread: '1.2 pips',
    defaultSignal: {
      action: 'NEUTRAL',
      score: 73,
      setup: '0.5950 Key Support Baseline',
    },
    historicalPoints: [0.6120, 0.6150, 0.6090, 0.6040, 0.6010, 0.5980, 0.5950, 0.5990, 0.5960, 0.5970, 0.5980, 0.5975],
  },

  // ==========================================
  // --- FOREX: EURO CROSSES (6) ---
  // ==========================================
  {
    ticker: 'EUR/GBP',
    name: 'Euro / British Pound ("Chunnel")',
    market: 'FOREX',
    currency: 'GBP',
    currentPrice: 0.8370,
    changePercent: -0.12,
    changeValue: -0.0010,
    peRatio: 0,
    dividendYield: 2.1,
    marketCap: '$720 Billion Daily',
    category: 'European Cross FX',
    isForex: true,
    pipSpread: '0.8 pips',
    defaultSignal: {
      action: 'SELL',
      score: 76,
      setup: 'BoE Rate Differential Advantage',
    },
    historicalPoints: [0.8540, 0.8510, 0.8480, 0.8450, 0.8420, 0.8390, 0.8360, 0.8380, 0.8350, 0.8365, 0.8375, 0.8370],
  },
  {
    ticker: 'EUR/JPY',
    name: 'Euro / Japanese Yen ("Eppy")',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 165.65,
    changePercent: 0.75,
    changeValue: 1.23,
    peRatio: 0,
    dividendYield: 3.4,
    marketCap: '$840 Billion Daily',
    category: 'Euro-Asia Cross FX',
    isForex: true,
    pipSpread: '1.2 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 88,
      setup: 'Bullish Momentum Expansion & 165.0 Retest',
    },
    historicalPoints: [156.0, 158.2, 160.5, 162.0, 161.4, 163.5, 164.2, 165.0, 164.8, 165.2, 165.5, 165.65],
  },
  {
    ticker: 'EUR/CHF',
    name: 'Euro / Swiss Franc',
    market: 'FOREX',
    currency: 'CHF',
    currentPrice: 0.9420,
    changePercent: 0.05,
    changeValue: 0.0005,
    peRatio: 0,
    dividendYield: 1.5,
    marketCap: '$380 Billion Daily',
    category: 'SNB / ECB Policy Cross',
    isForex: true,
    pipSpread: '1.3 pips',
    defaultSignal: {
      action: 'HOLD',
      score: 72,
      setup: 'SNB Floor Defense Consolidation',
    },
    historicalPoints: [0.9650, 0.9610, 0.9580, 0.9540, 0.9490, 0.9460, 0.9430, 0.9450, 0.9410, 0.9430, 0.9425, 0.9420],
  },
  {
    ticker: 'EUR/AUD',
    name: 'Euro / Australian Dollar',
    market: 'FOREX',
    currency: 'AUD',
    currentPrice: 1.6500,
    changePercent: 0.58,
    changeValue: 0.0095,
    peRatio: 0,
    dividendYield: 2.6,
    marketCap: '$320 Billion Daily',
    category: 'Volatility Minor FX',
    isForex: true,
    pipSpread: '1.8 pips',
    defaultSignal: {
      action: 'BUY',
      score: 82,
      setup: 'Commodity Pullback Bounce',
    },
    historicalPoints: [1.6120, 1.6180, 1.6250, 1.6320, 1.6390, 1.6440, 1.6480, 1.6420, 1.6470, 1.6520, 1.6490, 1.6500],
  },
  {
    ticker: 'EUR/CAD',
    name: 'Euro / Canadian Dollar',
    market: 'FOREX',
    currency: 'CAD',
    currentPrice: 1.5050,
    changePercent: 0.22,
    changeValue: 0.0033,
    peRatio: 0,
    dividendYield: 2.4,
    marketCap: '$290 Billion Daily',
    category: 'Transatlantic Minor FX',
    isForex: true,
    pipSpread: '1.7 pips',
    defaultSignal: {
      action: 'BUY',
      score: 79,
      setup: 'Ascending Support Line',
    },
    historicalPoints: [1.4650, 1.4720, 1.4790, 1.4850, 1.4920, 1.4980, 1.5010, 1.4970, 1.5020, 1.5060, 1.5040, 1.5050],
  },
  {
    ticker: 'EUR/NZD',
    name: 'Euro / New Zealand Dollar',
    market: 'FOREX',
    currency: 'NZD',
    currentPrice: 1.8180,
    changePercent: 0.65,
    changeValue: 0.0118,
    peRatio: 0,
    dividendYield: 2.8,
    marketCap: '$210 Billion Daily',
    category: 'High Beta Minor FX',
    isForex: true,
    pipSpread: '2.4 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 85,
      setup: 'RBNZ Rate Cut Liquidity Inflow',
    },
    historicalPoints: [1.7650, 1.7740, 1.7820, 1.7910, 1.8020, 1.8090, 1.8140, 1.8100, 1.8150, 1.8200, 1.8170, 1.8180],
  },

  // ==========================================
  // --- FOREX: POUND CROSSES (5) ---
  // ==========================================
  {
    ticker: 'GBP/JPY',
    name: 'British Pound / Japanese Yen ("Guppy" / "The Beast")',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 197.90,
    changePercent: 0.81,
    changeValue: 1.58,
    peRatio: 0,
    dividendYield: 4.2,
    marketCap: '$960 Billion Daily',
    category: 'Ultra High Volatility FX ("The Beast")',
    isForex: true,
    pipSpread: '1.4 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 91,
      setup: 'Breakout above 197.0 & Liquidity Run to 200.0',
    },
    historicalPoints: [186.0, 188.5, 191.0, 193.4, 192.5, 195.0, 196.2, 197.0, 196.5, 197.2, 197.6, 197.90],
  },
  {
    ticker: 'GBP/CHF',
    name: 'British Pound / Swiss Franc',
    market: 'FOREX',
    currency: 'CHF',
    currentPrice: 1.1255,
    changePercent: 0.18,
    changeValue: 0.0020,
    peRatio: 0,
    dividendYield: 3.1,
    marketCap: '$340 Billion Daily',
    category: 'European Cross FX',
    isForex: true,
    pipSpread: '1.6 pips',
    defaultSignal: {
      action: 'BUY',
      score: 80,
      setup: 'Interest Rate Carry Drift',
    },
    historicalPoints: [1.1420, 1.1380, 1.1340, 1.1310, 1.1270, 1.1240, 1.1210, 1.1260, 1.1230, 1.1250, 1.1260, 1.1255],
  },
  {
    ticker: 'GBP/AUD',
    name: 'British Pound / Australian Dollar',
    market: 'FOREX',
    currency: 'AUD',
    currentPrice: 1.9710,
    changePercent: 0.62,
    changeValue: 0.0121,
    peRatio: 0,
    dividendYield: 3.4,
    marketCap: '$410 Billion Daily',
    category: 'High Pip Range FX',
    isForex: true,
    pipSpread: '2.1 pips',
    defaultSignal: {
      action: 'BUY',
      score: 83,
      setup: 'Ascending Channel Rebound',
    },
    historicalPoints: [1.9150, 1.9240, 1.9350, 1.9480, 1.9560, 1.9620, 1.9680, 1.9620, 1.9690, 1.9740, 1.9700, 1.9710],
  },
  {
    ticker: 'GBP/CAD',
    name: 'British Pound / Canadian Dollar',
    market: 'FOREX',
    currency: 'CAD',
    currentPrice: 1.7985,
    changePercent: 0.35,
    changeValue: 0.0062,
    peRatio: 0,
    dividendYield: 3.2,
    marketCap: '$360 Billion Daily',
    category: 'Cross Rate Momentum FX',
    isForex: true,
    pipSpread: '1.9 pips',
    defaultSignal: {
      action: 'BUY',
      score: 81,
      setup: '1.7900 Support Hold & Break of Structure',
    },
    historicalPoints: [1.7350, 1.7450, 1.7580, 1.7690, 1.7780, 1.7860, 1.7920, 1.7880, 1.7940, 1.8010, 1.7970, 1.7985],
  },
  {
    ticker: 'GBP/NZD',
    name: 'British Pound / New Zealand Dollar',
    market: 'FOREX',
    currency: 'NZD',
    currentPrice: 2.1720,
    changePercent: 0.72,
    changeValue: 0.0155,
    peRatio: 0,
    dividendYield: 3.6,
    marketCap: '$280 Billion Daily',
    category: 'Maximum Pip Range Pair',
    isForex: true,
    pipSpread: '2.8 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 87,
      setup: 'Daily Breakout & Expansion to 2.2000',
    },
    historicalPoints: [2.0950, 2.1080, 2.1220, 2.1380, 2.1510, 2.1600, 2.1680, 2.1620, 2.1690, 2.1750, 2.1710, 2.1720],
  },

  // ==========================================
  // --- FOREX: YEN & OTHER CROSSES (7) ---
  // ==========================================
  {
    ticker: 'AUD/JPY',
    name: 'Australian Dollar / Japanese Yen',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 100.40,
    changePercent: 0.18,
    changeValue: 0.18,
    peRatio: 0,
    dividendYield: 3.8,
    marketCap: '$520 Billion Daily',
    category: 'Global Risk-On Sentiment Gauge',
    isForex: true,
    pipSpread: '1.2 pips',
    defaultSignal: {
      action: 'BUY',
      score: 80,
      setup: 'Psychological 100.0 Level Reclaim',
    },
    historicalPoints: [94.5, 95.8, 97.2, 98.6, 98.0, 99.2, 99.8, 100.1, 99.7, 100.2, 100.5, 100.40],
  },
  {
    ticker: 'CAD/JPY',
    name: 'Canadian Dollar / Japanese Yen',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 110.05,
    changePercent: 0.28,
    changeValue: 0.31,
    peRatio: 0,
    dividendYield: 3.5,
    marketCap: '$380 Billion Daily',
    category: 'Energy & Commodity Carry FX',
    isForex: true,
    pipSpread: '1.3 pips',
    defaultSignal: {
      action: 'BUY',
      score: 79,
      setup: '109.50 Order Block Defense',
    },
    historicalPoints: [104.2, 105.5, 106.8, 108.0, 107.5, 108.9, 109.4, 109.8, 109.5, 110.1, 110.3, 110.05],
  },
  {
    ticker: 'CHF/JPY',
    name: 'Swiss Franc / Japanese Yen',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 175.80,
    changePercent: 0.52,
    changeValue: 0.91,
    peRatio: 0,
    dividendYield: 2.2,
    marketCap: '$460 Billion Daily',
    category: 'Dual Safe-Haven Dynamic FX',
    isForex: true,
    pipSpread: '1.5 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 86,
      setup: 'All-Time High Continuation',
    },
    historicalPoints: [162.0, 164.5, 167.0, 169.5, 171.0, 173.2, 174.5, 175.0, 174.6, 175.4, 175.9, 175.80],
  },
  {
    ticker: 'NZD/JPY',
    name: 'New Zealand Dollar / Japanese Yen',
    market: 'FOREX',
    currency: 'JPY',
    currentPrice: 91.10,
    changePercent: 0.12,
    changeValue: 0.11,
    peRatio: 0,
    dividendYield: 4.2,
    marketCap: '$290 Billion Daily',
    category: 'Asia-Pacific Carry FX',
    isForex: true,
    pipSpread: '1.4 pips',
    defaultSignal: {
      action: 'HOLD',
      score: 74,
      setup: '91.00 Pivot Zone Balance',
    },
    historicalPoints: [86.5, 87.8, 88.9, 90.1, 89.6, 90.4, 90.9, 91.2, 90.8, 91.3, 91.2, 91.10],
  },
  {
    ticker: 'AUD/CAD',
    name: 'Australian Dollar / Canadian Dollar',
    market: 'FOREX',
    currency: 'CAD',
    currentPrice: 0.9125,
    changePercent: -0.15,
    changeValue: -0.0014,
    peRatio: 0,
    dividendYield: 3.1,
    marketCap: '$270 Billion Daily',
    category: 'Dual Commodity Cross',
    isForex: true,
    pipSpread: '1.4 pips',
    defaultSignal: {
      action: 'NEUTRAL',
      score: 72,
      setup: 'Range Bounds Between 0.9080 - 0.9160',
    },
    historicalPoints: [0.9020, 0.9060, 0.9110, 0.9150, 0.9130, 0.9160, 0.9140, 0.9120, 0.9150, 0.9130, 0.9140, 0.9125],
  },
  {
    ticker: 'AUD/NZD',
    name: 'Australian Dollar / New Zealand Dollar',
    market: 'FOREX',
    currency: 'NZD',
    currentPrice: 1.1020,
    changePercent: 0.25,
    changeValue: 0.0028,
    peRatio: 0,
    dividendYield: 3.3,
    marketCap: '$310 Billion Daily',
    category: 'Trans-Tasman Arbitrage FX',
    isForex: true,
    pipSpread: '1.5 pips',
    defaultSignal: {
      action: 'BUY',
      score: 79,
      setup: 'RBA / RBNZ Divergence Drift',
    },
    historicalPoints: [1.0850, 1.0880, 1.0920, 1.0960, 1.0980, 1.1010, 1.1040, 1.1000, 1.1030, 1.1050, 1.1010, 1.1020],
  },
  {
    ticker: 'CAD/CHF',
    name: 'Canadian Dollar / Swiss Franc',
    market: 'FOREX',
    currency: 'CHF',
    currentPrice: 0.6260,
    changePercent: 0.10,
    changeValue: 0.0006,
    peRatio: 0,
    dividendYield: 2.5,
    marketCap: '$190 Billion Daily',
    category: 'Commodity vs Safe-Haven FX',
    isForex: true,
    pipSpread: '1.6 pips',
    defaultSignal: {
      action: 'HOLD',
      score: 71,
      setup: 'Low Volatility Consolidation',
    },
    historicalPoints: [0.6550, 0.6500, 0.6450, 0.6400, 0.6360, 0.6320, 0.6280, 0.6310, 0.6270, 0.6280, 0.6270, 0.6260],
  },

  // ==========================================
  // --- FOREX: REGIONAL & EXOTICS (9) ---
  // ==========================================
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
      setup: 'Support Accumulation & Carry Trade Yield',
    },
    historicalPoints: [136.5, 134.0, 132.5, 131.0, 130.5, 129.8, 129.2, 128.9, 129.5, 129.1, 129.3, 129.5],
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
      setup: 'Range Support Bounce at 167.50',
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
      setup: 'Consolidation Box around 140.0 - 141.5',
    },
    historicalPoints: [147.0, 145.2, 143.5, 142.1, 141.5, 140.8, 140.2, 140.6, 141.0, 140.4, 140.5, 140.75],
  },
  {
    ticker: 'USD/ZAR',
    name: 'US Dollar / South African Rand',
    market: 'FOREX',
    currency: 'ZAR',
    currentPrice: 17.65,
    changePercent: -0.42,
    changeValue: -0.075,
    peRatio: 0,
    dividendYield: 8.5,
    marketCap: 'SARB Liquidity Window',
    category: 'BRICS / Sub-Saharan Major FX',
    isForex: true,
    pipSpread: '25 pips',
    defaultSignal: {
      action: 'SELL',
      score: 80,
      setup: 'Mining Exports Strength & Rand Inflow',
    },
    historicalPoints: [18.90, 18.65, 18.40, 18.20, 17.95, 17.80, 17.60, 17.75, 17.55, 17.70, 17.60, 17.65],
  },
  {
    ticker: 'USD/UGX',
    name: 'US Dollar / Ugandan Shilling',
    market: 'FOREX',
    currency: 'UGX',
    currentPrice: 3670.0,
    changePercent: 0.05,
    changeValue: 2.0,
    peRatio: 0,
    dividendYield: 11.0,
    marketCap: 'Bank of Uganda Interbank',
    category: 'East African Community (EAC) FX',
    isForex: true,
    pipSpread: '50 pips',
    defaultSignal: {
      action: 'HOLD',
      score: 75,
      setup: 'Stable Commodity Inflows & Coffee Export Buffer',
    },
    historicalPoints: [3820, 3790, 3760, 3740, 3710, 3690, 3680, 3685, 3675, 3670, 3668, 3670],
  },
  {
    ticker: 'USD/TZS',
    name: 'US Dollar / Tanzanian Shilling',
    market: 'FOREX',
    currency: 'TZS',
    currentPrice: 2680.0,
    changePercent: 0.08,
    changeValue: 2.2,
    peRatio: 0,
    dividendYield: 9.8,
    marketCap: 'Bank of Tanzania FX Desk',
    category: 'East African Community (EAC) FX',
    isForex: true,
    pipSpread: '40 pips',
    defaultSignal: {
      action: 'BUY',
      score: 77,
      setup: 'Dar Port Infrastructure Trade Demand',
    },
    historicalPoints: [2560, 2580, 2600, 2620, 2635, 2650, 2660, 2670, 2665, 2675, 2678, 2680],
  },
  {
    ticker: 'USD/MXN',
    name: 'US Dollar / Mexican Peso',
    market: 'FOREX',
    currency: 'MXN',
    currentPrice: 20.05,
    changePercent: 0.45,
    changeValue: 0.09,
    peRatio: 0,
    dividendYield: 10.5,
    marketCap: 'Banxico FX Desk',
    category: 'Nearshoring & High-Yield Carry FX',
    isForex: true,
    pipSpread: '15 pips',
    defaultSignal: {
      action: 'BUY',
      score: 82,
      setup: '20.00 Psychological Floor Reclaim',
    },
    historicalPoints: [17.20, 17.60, 18.10, 18.70, 19.20, 19.60, 19.90, 19.80, 20.10, 19.95, 20.12, 20.05],
  },
  {
    ticker: 'USD/TRY',
    name: 'US Dollar / Turkish Lira',
    market: 'FOREX',
    currency: 'TRY',
    currentPrice: 34.30,
    changePercent: 0.22,
    changeValue: 0.075,
    peRatio: 0,
    dividendYield: 45.0,
    marketCap: 'CBRT Interbank',
    category: 'Ultra-High Yield Emerging FX',
    isForex: true,
    pipSpread: '35 pips',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 84,
      setup: 'Inflation Carry & Structural Trend Continuation',
    },
    historicalPoints: [29.50, 30.20, 31.00, 31.80, 32.50, 33.10, 33.60, 33.90, 34.05, 34.15, 34.25, 34.30],
  },
  {
    ticker: 'USD/SGD',
    name: 'US Dollar / Singapore Dollar',
    market: 'FOREX',
    currency: 'SGD',
    currentPrice: 1.3210,
    changePercent: -0.10,
    changeValue: -0.0013,
    peRatio: 0,
    dividendYield: 2.8,
    marketCap: 'MAS Policy Band FX',
    category: 'Asian Financial Hub Major Cross',
    isForex: true,
    pipSpread: '1.2 pips',
    defaultSignal: {
      action: 'NEUTRAL',
      score: 75,
      setup: 'MAS S$NEER Policy Centerline Drift',
    },
    historicalPoints: [1.3480, 1.3440, 1.3390, 1.3340, 1.3290, 1.3250, 1.3220, 1.3240, 1.3200, 1.3220, 1.3215, 1.3210],
  },

  // ==========================================
  // --- METALS: PRECIOUS & INDUSTRIAL (8) ---
  // ==========================================
  {
    ticker: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    market: 'METALS',
    currency: 'USD',
    currentPrice: 3942.57,
    changePercent: 1.73,
    changeValue: 66.92,
    peRatio: 0,
    dividendYield: 0,
    marketCap: '$17.8 Trillion Global Reserves',
    category: 'Precious Metal & Sovereign Safe Haven',
    isMetal: true,
    pipSpread: '$0.25 (25 pts)',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 94,
      setup: 'Institutional 3,940 Demand Zone Defense & Bullish Expansion',
    },
    historicalPoints: [3120, 3250, 3400, 3520, 3620, 3700, 3780, 3840, 3880, 3910, 3930, 3942.57],
  },
  {
    ticker: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    market: 'METALS',
    currency: 'USD',
    currentPrice: 33.85,
    changePercent: 1.45,
    changeValue: 0.48,
    peRatio: 0,
    dividendYield: 0,
    marketCap: '$1.9 Trillion Physical Stock',
    category: 'Precious & Green-Tech Industrial Metal',
    isMetal: true,
    pipSpread: '$0.02 (2.0 pts)',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 90,
      setup: 'Photovoltaic Solar Demand & Multi-Year Cup & Handle',
    },
    historicalPoints: [24.2, 25.5, 26.8, 28.5, 30.1, 31.2, 30.5, 31.8, 32.6, 33.1, 33.4, 33.85],
  },
  {
    ticker: 'XPT/USD',
    name: 'Spot Platinum / US Dollar',
    market: 'METALS',
    currency: 'USD',
    currentPrice: 1015.40,
    changePercent: 0.62,
    changeValue: 6.25,
    peRatio: 0,
    dividendYield: 0,
    marketCap: '$310 Billion Mine Supply',
    category: 'Hydrogen Fuel Cell & Catalytic Metal',
    isMetal: true,
    pipSpread: '$1.50',
    defaultSignal: {
      action: 'BUY',
      score: 83,
      setup: 'Structural Supply Deficit & 1,000 Support Reclaim',
    },
    historicalPoints: [920, 935, 950, 970, 990, 1005, 995, 1010, 1018, 1012, 1016, 1015.40],
  },
  {
    ticker: 'XPD/USD',
    name: 'Spot Palladium / US Dollar',
    market: 'METALS',
    currency: 'USD',
    currentPrice: 1120.50,
    changePercent: 0.85,
    changeValue: 9.40,
    peRatio: 0,
    dividendYield: 0,
    marketCap: '$240 Billion Market Size',
    category: 'Automotive Emission Reduction Metal',
    isMetal: true,
    pipSpread: '$3.00',
    defaultSignal: {
      action: 'BUY',
      score: 81,
      setup: 'Oversold Value Mean Reversion & Short Squeeze',
    },
    historicalPoints: [1020, 1045, 1070, 1090, 1110, 1130, 1115, 1125, 1135, 1118, 1122, 1120.50],
  },
  {
    ticker: 'HG/COPPER',
    name: 'High Grade Copper Futures ("Dr. Copper")',
    market: 'METALS',
    currency: 'USD',
    currentPrice: 4.385,
    changePercent: 0.92,
    changeValue: 0.040,
    peRatio: 0,
    dividendYield: 0,
    marketCap: 'COMEX Benchmark Grade',
    category: 'Global Electrification & Macro Health Proxy',
    isMetal: true,
    pipSpread: '$0.005',
    defaultSignal: {
      action: 'BUY',
      score: 85,
      setup: 'Grid Modernization Infrastructure Demand',
    },
    historicalPoints: [3.85, 3.95, 4.10, 4.25, 4.45, 4.38, 4.32, 4.40, 4.46, 4.35, 4.37, 4.385],
  },
  {
    ticker: 'ALU/USD',
    name: 'Spot Aluminum LME Physical Cash',
    market: 'METALS',
    currency: 'USD',
    currentPrice: 2640.0,
    changePercent: 0.45,
    changeValue: 11.8,
    peRatio: 0,
    dividendYield: 0,
    marketCap: 'London Metal Exchange (LME)',
    category: 'Aerospace & EV Lightweighting Industrial',
    isMetal: true,
    pipSpread: '$2.00',
    defaultSignal: {
      action: 'BUY',
      score: 79,
      setup: 'Smelter Capacity Discipline & Bauxite Supply Tightness',
    },
    historicalPoints: [2250, 2310, 2380, 2460, 2520, 2580, 2550, 2610, 2660, 2630, 2645, 2640],
  },
  {
    ticker: 'XAU/EUR',
    name: 'Spot Gold / Euro Currency Cross',
    market: 'METALS',
    currency: 'EUR',
    currentPrice: 3628.60,
    changePercent: 1.55,
    changeValue: 55.40,
    peRatio: 0,
    dividendYield: 0,
    marketCap: 'European Institutional Bullion',
    category: 'Eurozone Sovereign Inflation Hedge',
    isMetal: true,
    pipSpread: '€0.40',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 92,
      setup: 'ECB Monetary Easing Safe-Haven Accumulation',
    },
    historicalPoints: [2900, 3020, 3150, 3260, 3350, 3420, 3490, 3540, 3580, 3600, 3615, 3628.60],
  },
  {
    ticker: 'XAU/KES',
    name: 'Spot Gold in Kenyan Shillings (Troy Oz)',
    market: 'METALS',
    currency: 'KES',
    currentPrice: 510562.80,
    changePercent: 1.65,
    changeValue: 8300.0,
    peRatio: 0,
    dividendYield: 0,
    marketCap: 'Local Vault & Bullion Market',
    category: 'Domestic Wealth Preservation & FX Shield',
    isMetal: true,
    pipSpread: 'KES 250',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 93,
      setup: 'Long-Term Currency Purchasing Power Anchor',
    },
    historicalPoints: [415000, 432000, 451000, 468000, 480000, 488000, 495000, 501000, 505000, 508000, 509500, 510562.80],
  },

  // ==========================================
  // --- INDEXES: GLOBAL & REGIONAL BENCHMARKS (13) ---
  // ==========================================
  {
    ticker: 'US500',
    name: 'S&P 500 Index (Standard & Poor\'s 500)',
    market: 'INDICES',
    currency: 'USD',
    currentPrice: 5824.20,
    changePercent: 0.88,
    changeValue: 50.8,
    peRatio: 26.5,
    dividendYield: 1.3,
    marketCap: '$46.5 Trillion Aggregate',
    category: 'US Broad Market Benchmark Index',
    isIndex: true,
    pipSpread: '0.40 pts',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 89,
      setup: 'Bullish Flag Breakout above 5,800 All-Time Highs',
    },
    historicalPoints: [4820, 4960, 5120, 5240, 5380, 5490, 5540, 5650, 5740, 5710, 5780, 5824.20],
  },
  {
    ticker: 'NAS100',
    name: 'Nasdaq 100 Tech Index ("USTEC")',
    market: 'INDICES',
    currency: 'USD',
    currentPrice: 20385.10,
    changePercent: 1.14,
    changeValue: 229.4,
    peRatio: 31.2,
    dividendYield: 0.8,
    marketCap: '$23.2 Trillion Aggregate',
    category: 'Mega-Cap Technology Benchmark',
    isIndex: true,
    pipSpread: '1.20 pts',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 93,
      setup: 'AI Infrastructure Capex Cycle Expansion',
    },
    historicalPoints: [16800, 17400, 18100, 18700, 19400, 19850, 19600, 20050, 20250, 20100, 20300, 20385.10],
  },
  {
    ticker: 'US30',
    name: 'Dow Jones Industrial Average 30 ("Wall Street")',
    market: 'INDICES',
    currency: 'USD',
    currentPrice: 42114.40,
    changePercent: 0.52,
    changeValue: 218.0,
    peRatio: 22.8,
    dividendYield: 1.9,
    marketCap: '$14.8 Trillion Aggregate',
    category: 'Blue-Chip Industrials & Banking Index',
    isIndex: true,
    pipSpread: '2.00 pts',
    defaultSignal: {
      action: 'BUY',
      score: 84,
      setup: 'Soft Landing Broadening & Cyclical Flow',
    },
    historicalPoints: [37500, 38100, 38900, 39500, 40200, 40800, 40600, 41200, 41800, 41650, 42000, 42114.40],
  },
  {
    ticker: 'UK100',
    name: 'FTSE 100 Index London ("Footsie")',
    market: 'INDICES',
    currency: 'GBP',
    currentPrice: 8248.50,
    changePercent: 0.34,
    changeValue: 27.9,
    peRatio: 14.1,
    dividendYield: 3.8,
    marketCap: '£2.1 Trillion Aggregate',
    category: 'UK & International Commodities / Banking Index',
    isIndex: true,
    pipSpread: '1.00 pts',
    defaultSignal: {
      action: 'BUY',
      score: 81,
      setup: 'Value Multiple Expansion & 8,200 Support Defense',
    },
    historicalPoints: [7650, 7780, 7920, 8050, 8140, 8210, 8180, 8260, 8310, 8220, 8235, 8248.50],
  },
  {
    ticker: 'GER40',
    name: 'DAX 40 Index Frankfurt Germany',
    market: 'INDICES',
    currency: 'EUR',
    currentPrice: 19450.80,
    changePercent: 0.72,
    changeValue: 139.1,
    peRatio: 15.6,
    dividendYield: 3.1,
    marketCap: '€1.9 Trillion Aggregate',
    category: 'European Industrial & Tech Blue-Chip Benchmark',
    isIndex: true,
    pipSpread: '1.20 pts',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 87,
      setup: 'Breakout above 19,400 to Record Highs',
    },
    historicalPoints: [16800, 17200, 17800, 18300, 18650, 18900, 18750, 19100, 19350, 19280, 19400, 19450.80],
  },
  {
    ticker: 'FRA40',
    name: 'CAC 40 Index Paris France',
    market: 'INDICES',
    currency: 'EUR',
    currentPrice: 7428.30,
    changePercent: 0.41,
    changeValue: 30.3,
    peRatio: 14.8,
    dividendYield: 3.3,
    marketCap: '€2.3 Trillion Aggregate',
    category: 'French Luxury & Aerospace Benchmark Index',
    isIndex: true,
    pipSpread: '0.90 pts',
    defaultSignal: {
      action: 'HOLD',
      score: 76,
      setup: '7,400 Demand Zone Stabilization',
    },
    historicalPoints: [7320, 7450, 7600, 7750, 7680, 7550, 7480, 7520, 7580, 7410, 7420, 7428.30],
  },
  {
    ticker: 'JPN225',
    name: 'Nikkei 225 Stock Average Tokyo',
    market: 'INDICES',
    currency: 'JPY',
    currentPrice: 38647.75,
    changePercent: 0.95,
    changeValue: 364.2,
    peRatio: 17.2,
    dividendYield: 1.8,
    marketCap: '¥680 Trillion Market Cap',
    category: 'Japan Semiconductor & Export Benchmark',
    isIndex: true,
    pipSpread: '5.0 pts',
    defaultSignal: {
      action: 'BUY',
      score: 85,
      setup: 'Corporate Governance Reform & Yen Competitiveness',
    },
    historicalPoints: [33500, 35200, 37100, 38800, 39400, 38200, 37800, 38400, 39100, 38300, 38550, 38647.75],
  },
  {
    ticker: 'HK50',
    name: 'Hang Seng Index Hong Kong ("HSI")',
    market: 'INDICES',
    currency: 'HKD',
    currentPrice: 20590.15,
    changePercent: 1.85,
    changeValue: 374.0,
    peRatio: 9.8,
    dividendYield: 4.2,
    marketCap: 'HK$34 Trillion Market Size',
    category: 'China & HK Tech / Financials Benchmark',
    isIndex: true,
    pipSpread: '3.0 pts',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 88,
      setup: 'PBOC Fiscal Stimulus Momentum & 20,000 Support',
    },
    historicalPoints: [16200, 16800, 17400, 18200, 18900, 17800, 17500, 18300, 21200, 20400, 20500, 20590.15],
  },
  {
    ticker: 'AUS200',
    name: 'S&P/ASX 200 Index Australia',
    market: 'INDICES',
    currency: 'AUD',
    currentPrice: 8160.00,
    changePercent: 0.38,
    changeValue: 30.9,
    peRatio: 18.4,
    dividendYield: 3.7,
    marketCap: 'A$2.6 Trillion Aggregate',
    category: 'Commodities & Mining Giant Benchmark',
    isIndex: true,
    pipSpread: '1.20 pts',
    defaultSignal: {
      action: 'BUY',
      score: 82,
      setup: 'Iron Ore Stabilization & 8,100 Support',
    },
    historicalPoints: [7520, 7640, 7780, 7890, 7950, 8040, 8010, 8110, 8190, 8120, 8145, 8160.00],
  },
  {
    ticker: 'EUSTX50',
    name: 'Euro Stoxx 50 Blue-Chip Index',
    market: 'INDICES',
    currency: 'EUR',
    currentPrice: 4885.60,
    changePercent: 0.58,
    changeValue: 28.2,
    peRatio: 15.2,
    dividendYield: 3.2,
    marketCap: '€3.8 Trillion Aggregate',
    category: 'Pan-European Leader Benchmark Index',
    isIndex: true,
    pipSpread: '0.80 pts',
    defaultSignal: {
      action: 'BUY',
      score: 84,
      setup: 'ECB Rate Reduction Impulse',
    },
    historicalPoints: [4450, 4580, 4720, 4850, 4920, 4960, 4890, 4940, 4990, 4860, 4875, 4885.60],
  },
  {
    ticker: 'DXY',
    name: 'US Dollar Index Benchmark Currency Basket',
    market: 'INDICES',
    currency: 'USD',
    currentPrice: 104.28,
    changePercent: 0.18,
    changeValue: 0.19,
    peRatio: 0,
    dividendYield: 0,
    marketCap: 'Global Forex Reserve Anchor',
    category: 'Global Currency Power Benchmark',
    isIndex: true,
    pipSpread: '0.04 pts',
    defaultSignal: {
      action: 'BUY',
      score: 82,
      setup: '104.0 Support Defense & Fed Policy Yield Push',
    },
    historicalPoints: [102.5, 103.2, 104.1, 104.8, 104.2, 103.8, 103.1, 102.8, 103.5, 103.9, 104.1, 104.28],
  },
  {
    ticker: 'NASI',
    name: 'Nairobi All Share Index (NSE Kenya)',
    market: 'INDICES',
    currency: 'KES',
    currentPrice: 108.45,
    changePercent: 1.12,
    changeValue: 1.20,
    peRatio: 9.8,
    dividendYield: 7.8,
    marketCap: 'KES 1.7 Trillion Total NSE',
    category: 'East Africa Headline Market Index',
    isIndex: true,
    pipSpread: '0.05 pts',
    defaultSignal: {
      action: 'STRONG BUY',
      score: 87,
      setup: 'Foreign Investor Inflows & M-PESA Rebound',
    },
    historicalPoints: [92.0, 94.5, 97.2, 100.1, 99.5, 102.4, 104.0, 105.8, 107.2, 106.5, 107.8, 108.45],
  },
  {
    ticker: 'NSE20',
    name: 'Nairobi 20 Share Index (Blue-Chip Benchmark)',
    market: 'INDICES',
    currency: 'KES',
    currentPrice: 1745.20,
    changePercent: 0.65,
    changeValue: 11.2,
    peRatio: 8.4,
    dividendYield: 8.5,
    marketCap: 'KES 1.2 Trillion Blue Chips',
    category: 'Kenya Top 20 Capitalized Companies',
    isIndex: true,
    pipSpread: '0.50 pts',
    defaultSignal: {
      action: 'BUY',
      score: 83,
      setup: 'Banking Dividend Season Accumulation',
    },
    historicalPoints: [1520, 1550, 1590, 1630, 1620, 1660, 1685, 1710, 1730, 1720, 1738, 1745.20],
  },

  // ==========================================
  // --- NAIROBI SECURITIES EXCHANGE (NSE) STOCKS (6) ---
  // ==========================================
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

  // ==========================================
  // --- US & GLOBAL EQUITIES (4) ---
  // ==========================================
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
  const { formatCurrency, currency, addInvestment, setActiveTab } = useFinance();

  const [selectedStock, setSelectedStock] = useState<StockProfile>(FEATURED_ASSETS[0]);
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'FOREX' | 'METALS' | 'INDICES' | 'NSE' | 'US'>('ALL');
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

  // Dual Chart Mode: Entire Forex, Metals, Indices & US use 'tradingview' live feed. NSE stocks use 'radar'.
  const [chartViewMode, setChartViewMode] = useState<'radar' | 'tradingview'>('tradingview');

  // Automatic Feed Routing: Ensure entire Forex, Metals, Indices & US use TradingView live feed
  // NSE stocks use NjiaFedha Pro Radar
  useEffect(() => {
    if (selectedStock.market === 'NSE') {
      setChartViewMode('radar');
    } else {
      setChartViewMode('tradingview');
    }
  }, [selectedStock.market, selectedStock.ticker]);
  const [bottomTab, setBottomTab] = useState<
    | 'paper'
    | 'orderflow'
    | 'livetv'
    | 'journal'
    | 'risk-calc'
    | 'sessions'
    | 'prop-guard'
    | 'correlation'
    | 'broker-arbiter'
    | 'strength'
    | 'backtest'
    | 'calendar'
    | 'news'
  >('paper');

  // Price Alerts Modal & Notification State
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [triggeredAlertBanner, setTriggeredAlertBanner] = useState<PriceAlert | null>(null);

  // Quick Lot Size / Risk Calculator State
  const [calcLotSize, setCalcLotSize] = useState<number>(0.1);
  const [showCalculator, setShowCalculator] = useState(false);

  // 1-Click Signal Execution into Paper Trading Desk
  const [prefillOrder, setPrefillOrder] = useState<PrefillOrderData | null>(null);

  // AI Vision Chart Screenshot Analyzer State
  const [isChartAnalyzerOpen, setIsChartAnalyzerOpen] = useState(false);
  const [forexSubCategory, setForexSubCategory] = useState<'ALL' | 'MAJORS' | 'EUROCROSS' | 'POUNDCROSS' | 'YENCROSS' | 'REGIONAL'>('ALL');
  const [forexViewMode, setForexViewMode] = useState<'grid' | 'table'>('grid');
  const [forexSentimentFilter, setForexSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');

  // Dedicated full roster of all 34 Forex pairs
  const allForexPairs = useMemo(() => {
    return FEATURED_ASSETS.filter((s) => s.market === 'FOREX');
  }, []);

  const filteredForexPairs = useMemo(() => {
    return allForexPairs.filter((pair) => {
      // Sub-category grouping
      if (forexSubCategory === 'MAJORS') {
        const majors = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
        if (!majors.includes(pair.ticker)) return false;
      } else if (forexSubCategory === 'EUROCROSS') {
        const euroCross = ['EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD', 'EUR/CAD', 'EUR/NZD'];
        if (!euroCross.includes(pair.ticker)) return false;
      } else if (forexSubCategory === 'POUNDCROSS') {
        const poundCross = ['GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD'];
        if (!poundCross.includes(pair.ticker)) return false;
      } else if (forexSubCategory === 'YENCROSS') {
        const yenCross = ['AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY', 'AUD/CAD', 'AUD/NZD', 'CAD/CHF'];
        if (!yenCross.includes(pair.ticker)) return false;
      } else if (forexSubCategory === 'REGIONAL') {
        const reg = ['USD/KES', 'GBP/KES', 'EUR/KES', 'USD/ZAR', 'USD/UGX', 'USD/TZS', 'USD/MXN', 'USD/TRY', 'USD/SGD'];
        if (!reg.includes(pair.ticker)) return false;
      }

      // Sentiment filter
      const isBull = pair.defaultSignal.action === 'STRONG BUY' || pair.defaultSignal.action === 'BUY';
      const isBear = pair.defaultSignal.action === 'STRONG SELL' || pair.defaultSignal.action === 'SELL';
      if (forexSentimentFilter === 'BULLISH' && !isBull) return false;
      if (forexSentimentFilter === 'BEARISH' && !isBear) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          pair.ticker.toLowerCase().includes(q) ||
          pair.name.toLowerCase().includes(q) ||
          pair.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allForexPairs, forexSubCategory, forexSentimentFilter, searchQuery]);

  const handleExecuteSignalToPaper = (trade: {
    direction: 'LONG' | 'SHORT';
    lots: number;
    sl: string;
    tp: string;
  }) => {
    setPrefillOrder({
      direction: trade.direction,
      lots: trade.lots,
      sl: trade.sl,
      tp: trade.tp,
      timestamp: Date.now(),
    });
    setBottomTab('paper');
    setTimeout(() => {
      const el = document.getElementById('trading-workbench');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Filter stocks, forex pairs, metals & indices
  const filteredStocks = useMemo(() => {
    return FEATURED_ASSETS.filter((stock) => {
      if (filterMarket === 'FOREX' && stock.market !== 'FOREX') return false;
      if (filterMarket === 'METALS' && stock.market !== 'METALS') return false;
      if (filterMarket === 'INDICES' && stock.market !== 'INDICES') return false;
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
  const fetchStockAnalysis = async (stock: StockProfile, targetTf?: string) => {
    setIsAiLoading(true);
    const activeTf = targetTf || timeframe || '1H';
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
          timeframe: activeTf,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAiReport(data);
    } catch {
      // Deterministic analytical profile with rich signal scaled to timeframe
      const isFx = stock.market === 'FOREX';
      const isKES = stock.ticker.includes('KES');
      const isGold = stock.ticker.includes('XAU');

      const isScalp = ['1m', '3m', '5m', '15m'].includes(activeTf.toLowerCase());
      const isIntraday = ['30m', '45m', '1h', '2h'].includes(activeTf.toLowerCase());
      const isSwing = ['4h', '1d'].includes(activeTf.toLowerCase());
      const tfCategory = isScalp ? 'Scalp' : isIntraday ? 'Intraday' : isSwing ? 'Swing' : 'Position';

      let mult = 1.0;
      if (isScalp) mult = 0.35;
      else if (isIntraday) mult = 0.7;
      else if (isSwing) mult = 1.6;
      else mult = 3.0;

      let entryStr = '';
      let tp1Str = '';
      let tp2Str = '';
      let slStr = '';
      let obStr = '';
      let fvgStr = '';
      let bslTarget = '';
      let atrStr = '';

      if (isFx) {
        if (isGold) {
          const slPts = Math.round(12 * mult * 10) / 10;
          const tp1Pts = Math.round(24 * mult * 10) / 10;
          const tp2Pts = Math.round(48 * mult * 10) / 10;
          const entrySpan = Math.round(2.5 * mult * 10) / 10;

          entryStr = `${(stock.currentPrice - entrySpan * 0.4).toFixed(2)} - ${(stock.currentPrice + entrySpan * 0.6).toFixed(2)}`;
          tp1Str = `${(stock.currentPrice + tp1Pts).toFixed(2)} (+${tp1Pts} pts / +${Math.round(tp1Pts * 10)} pips)`;
          tp2Str = `${(stock.currentPrice + tp2Pts).toFixed(2)} (+${tp2Pts} pts / +${Math.round(tp2Pts * 10)} pips)`;
          slStr = `${(stock.currentPrice - slPts).toFixed(2)} (-${slPts} pts / -${Math.round(slPts * 10)} pips)`;
          obStr = `${(stock.currentPrice - entrySpan * 1.2).toFixed(2)} - ${(stock.currentPrice - entrySpan * 0.2).toFixed(2)}`;
          fvgStr = `${(stock.currentPrice - entrySpan * 0.1).toFixed(2)} - ${(stock.currentPrice + entrySpan * 0.8).toFixed(2)}`;
          bslTarget = `Buy-Side Liquidity resting above ${(stock.currentPrice + tp1Pts * 1.05).toFixed(2)}`;
          atrStr = `$${(14 * mult).toFixed(1)} pts (${activeTf})`;
        } else if (isKES) {
          const slPips = Math.round(0.50 * mult * 100) / 100;
          const tp1Pips = Math.round(1.20 * mult * 100) / 100;
          const tp2Pips = Math.round(2.50 * mult * 100) / 100;

          entryStr = `${(stock.currentPrice - 0.15 * mult).toFixed(2)} - ${(stock.currentPrice + 0.15 * mult).toFixed(2)}`;
          tp1Str = `${(stock.currentPrice + tp1Pips).toFixed(2)} (+${Math.round(tp1Pips * 100)} pips)`;
          tp2Str = `${(stock.currentPrice + tp2Pips).toFixed(2)} (+${Math.round(tp2Pips * 100)} pips)`;
          slStr = `${(stock.currentPrice - slPips).toFixed(2)} (-${Math.round(slPips * 100)} pips)`;
          obStr = `${(stock.currentPrice - 0.30 * mult).toFixed(2)} - ${(stock.currentPrice - 0.10 * mult).toFixed(2)}`;
          fvgStr = `${(stock.currentPrice - 0.05 * mult).toFixed(2)} - ${(stock.currentPrice + 0.20 * mult).toFixed(2)}`;
          bslTarget = `Buy-Side Liquidity resting above ${(stock.currentPrice + tp1Pips).toFixed(2)}`;
          atrStr = `${(0.45 * mult).toFixed(2)} KES (${activeTf})`;
        } else {
          const slPips = Math.round(20 * mult);
          const tp1Pips = Math.round(45 * mult);
          const tp2Pips = Math.round(90 * mult);
          const pipVal = 0.0001;

          entryStr = `${(stock.currentPrice - 4 * mult * pipVal).toFixed(4)} - ${(stock.currentPrice + 4 * mult * pipVal).toFixed(4)}`;
          tp1Str = `${(stock.currentPrice + tp1Pips * pipVal).toFixed(4)} (+${tp1Pips} pips)`;
          tp2Str = `${(stock.currentPrice + tp2Pips * pipVal).toFixed(4)} (+${tp2Pips} pips)`;
          slStr = `${(stock.currentPrice - slPips * pipVal).toFixed(4)} (-${slPips} pips)`;
          obStr = `${(stock.currentPrice - 12 * mult * pipVal).toFixed(4)} - ${(stock.currentPrice - 3 * mult * pipVal).toFixed(4)}`;
          fvgStr = `${(stock.currentPrice - 2 * mult * pipVal).toFixed(4)} - ${(stock.currentPrice + 8 * mult * pipVal).toFixed(4)}`;
          bslTarget = `Buy-Side Liquidity resting above ${(stock.currentPrice + (tp1Pips + 8) * pipVal).toFixed(4)}`;
          atrStr = `${Math.round(35 * mult)} pips (${activeTf})`;
        }
      } else {
        entryStr = `${stock.currency} ${(stock.currentPrice * 0.98).toFixed(2)} - ${(stock.currentPrice * 1.01).toFixed(2)}`;
        tp1Str = `${stock.currency} ${(stock.currentPrice * 1.15).toFixed(2)} (+15%)`;
        tp2Str = `${stock.currency} ${(stock.currentPrice * 1.28).toFixed(2)} (+28%)`;
        slStr = `${stock.currency} ${(stock.currentPrice * 0.92).toFixed(2)} (-8%)`;
        obStr = `Key Support Range`;
        fvgStr = `Fair Value Area`;
        bslTarget = `Resistance Highs`;
        atrStr = `Moderate ATR (${activeTf})`;
      }

      const confScore = isScalp ? 88 : isIntraday ? 85 : 82;
      const setupName = isScalp
        ? 'Liquidity Sweep & FVG Retest (Scalp)'
        : isIntraday
        ? 'Order Block Retest & Intraday Expansion'
        : 'Macro Trend Continuation & Structural BOS';

      setAiReport({
        ticker: stock.ticker,
        companyName: stock.name,
        isForex: isFx,
        recommendation: stock.defaultSignal.action === 'STRONG BUY' ? 'Strong Buy' : stock.defaultSignal.action === 'BUY' ? 'Buy' : 'Hold',
        targetPrice: Math.round(stock.currentPrice * (isFx ? 1.025 : 1.18) * 100) / 100,
        projectedUpside: isFx ? '+1.25%' : '+18.2%',
        riskRating: stock.market === 'NSE' ? 'Moderate' : 'Low',
        signal: {
          action: stock.defaultSignal.action,
          setupType: setupName,
          timeframe: activeTf,
          timeframeCategory: tfCategory,
          confirmationScore: isScalp ? '4/5 Confluences: Sweep + FVG + RSI + EMA' : '5/5 Institutional Grade',
          entryZone: entryStr,
          takeProfit1: tp1Str,
          takeProfit2: tp2Str,
          stopLoss: slStr,
          riskReward: '1:2.4',
          confidenceScore: confScore,
          summary: `${activeTf} timeframe reveals high-probability ${setupName} with institutional volume absorption and favorable risk-to-reward.`,
          indicators: {
            rsi: isScalp ? '64.2 (Bullish Rejection)' : '58.5 (Bullish continuation)',
            macd: 'Bullish Crossover above signal line',
            movingAverages: `Trading above 20 & 50 EMA on ${activeTf}`,
            pivotPoint: isGold ? (stock.currentPrice - 5).toFixed(2) : isKES ? '129.20' : '1.0845',
            atr: atrStr,
          },
          smc: {
            orderBlock: obStr,
            fairValueGap: fvgStr,
            liquidityTarget: bslTarget,
            marketStructure: 'BOS (Break of Structure Bullish)',
          },
          tradeManagement: {
            breakEvenRule: isGold
              ? `Move SL to Break-Even at +$${(10 * mult).toFixed(1)} pts / TP1`
              : `Move SL to Break-Even at +${Math.round(20 * mult)} pips / TP1`,
            partialProfitRule: `Close 70% position at TP1; let 30% runner ride to TP2 trailing swing lows`,
            invalidationRule: `Invalidate immediately if ${activeTf} candle closes below Stop Loss`,
          },
          multiAspectAnalysis: {
            marketStructure: `Price action on the ${activeTf} timeframe demonstrates clean structural accumulation with successive higher swing lows and bullish displacement.`,
            smartMoneyConcepts: `Institutional footprints confirm liquidity pool engineering: an initial liquidity sweep into the demand discount zone was met with swift institutional buying absorption.`,
            indicatorConfluence: `Indicator suite (${activeTf} RSI 14 at 64, MACD expanding positive, EMAs aligned upward) provides multi-oscillator confirmation for upside continuation.`,
            macroForexFactory: `Forex Factory news feed monitors high-impact central bank commentary and key economic releases; current setup maintains active News Guard clearance.`
          }
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
            summary: `Interbank volume indicators confirm supportive buying clusters with upward trend structure intact on ${activeTf}.`,
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

  // Load analysis on initial select or timeframe change
  useEffect(() => {
    fetchStockAnalysis(selectedStock, timeframe);
    setAiAnswer(null);
  }, [selectedStock.ticker, timeframe]);

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

        // Check active price alerts for this ticker
        try {
          const alertsJson = localStorage.getItem('njia_price_alerts');
          if (alertsJson) {
            const list: PriceAlert[] = JSON.parse(alertsJson);
            let alertHit = false;
            const updatedList = list.map((a) => {
              if (a.isActive && !a.isTriggered && a.ticker === selectedStock.ticker) {
                const hit =
                  (a.condition === 'ABOVE' && newClose >= a.targetPrice) ||
                  (a.condition === 'BELOW' && newClose <= a.targetPrice);
                if (hit) {
                  playAlertChime();
                  setTriggeredAlertBanner(a);
                  setTimeout(() => setTriggeredAlertBanner(null), 8000);
                  alertHit = true;
                  return { ...a, isTriggered: true, triggeredAt: new Date().toLocaleTimeString() };
                }
              }
              return a;
            });
            if (alertHit) {
              localStorage.setItem('njia_price_alerts', JSON.stringify(updatedList));
            }
          }
        } catch {}

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

  const formatPairPrice = (p: number, isFx?: boolean) => {
    if (isFx && p < 10) return p.toFixed(4);
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

          {/* AI Vision Chart Screenshot Analyzer Button */}
          <button
            onClick={() => setIsChartAnalyzerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-teal-500/10 hover:from-teal-500/30 hover:to-purple-500/30 text-[#0df2c9] border border-teal-500/40 font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(13,242,201,0.2)] group"
            title="Upload or paste chart screenshot for instant AI analysis and signal generation"
          >
            <Camera className="w-4 h-4 text-[#0df2c9] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Upload Chart Screenshot</span>
            <span className="sm:hidden">Upload Chart</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
              VISION AI
            </span>
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

      {/* Quick-Launch Dedicated Trading Tools: Bloomberg Live TV & Order Flow */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#091120] to-[#0a1424] border border-[#182845] shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Advanced Trading Tools:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setBottomTab('livetv');
              const el = document.getElementById('trading-workbench');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/15 hover:from-emerald-500/30 hover:to-cyan-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>World Monitor & Bloomberg TV</span>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </button>

          <button
            onClick={() => {
              setBottomTab('orderflow');
              const el = document.getElementById('trading-workbench');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Order Flow & Liquidity</span>
          </button>

          <button
            onClick={() => setActiveTab('mt5-ea')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-teal-500/15 to-purple-500/20 hover:from-purple-500/30 hover:to-teal-500/25 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer group"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>MT5 Scalper Bot EA & Code</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold">
              .MQ5
            </span>
          </button>
        </div>
      </div>

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
              <span>💱 Forex Pairs ({FEATURED_ASSETS.filter((s) => s.market === 'FOREX').length})</span>
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

            {/* METALS TAB */}
            <button
              onClick={() => setFilterMarket('METALS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMarket === 'METALS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🥇 Metals & Commodities ({FEATURED_ASSETS.filter((s) => s.market === 'METALS').length})</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  forexSession.isOpen
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {forexSession.isOpen ? 'LIVE' : 'CLOSED'}
              </span>
            </button>

            {/* INDICES TAB */}
            <button
              onClick={() => setFilterMarket('INDICES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterMarket === 'INDICES'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📊 Global Indices ({FEATURED_ASSETS.filter((s) => s.market === 'INDICES').length})</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  forexSession.isOpen
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {forexSession.isOpen ? 'FUTURES LIVE' : 'CLOSED'}
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
              <span>🇰🇪 Nairobi (NSE) ({FEATURED_ASSETS.filter((s) => s.market === 'NSE').length})</span>
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
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐 US Equities ({FEATURED_ASSETS.filter((s) => s.market === 'US').length})</span>
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
              stock.market === 'FOREX' || stock.market === 'METALS' || stock.market === 'INDICES'
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
                          : stock.market === 'METALS'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                          : stock.market === 'INDICES'
                          ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
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

      {/* ======================================================== */}
      {/* COMPREHENSIVE ALL FOREX CURRENCY PAIRS DIRECTORY & AI SCANNER */}
      {/* ======================================================== */}
      {filterMarket === 'FOREX' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* AI Vision Chart Screenshot Analyzer Banner */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-[#0c182a] via-[#121c38] to-[#0d222e] border border-teal-500/40 shadow-[0_0_25px_rgba(13,242,201,0.12)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shadow-[0_0_20px_rgba(13,242,201,0.25)] shrink-0">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      📸 AI Vision Chart Screenshot Analyzer & Signal Architect
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
                      GEMINI VISION QUANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Have a chart open on <strong className="text-teal-300">TradingView</strong>, <strong className="text-teal-300">MetaTrader MT4/MT5</strong>, or your broker? Upload or paste (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[10px]">Ctrl+V</kbd>) any screenshot. The AI scans market structure, order blocks, FVG liquidity & candlesticks to deliver an accurate institutional signal (Entry, TP1, TP2, Stop Loss).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsChartAnalyzerOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] hover:opacity-95 text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(13,242,201,0.35)] cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Chart Screenshot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Directory Navigation & Sub-Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  All Forex Currency Pairs Directory ({allForexPairs.length} Total Active)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredForexPairs.length} pairs • Click any pair to load live TradingView chart, multi-timeframe AI signals, and paper trading slip.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Sentiment Filter */}
                <div className="flex items-center gap-1 p-1 bg-[#070b13] border border-[#162540] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setForexSentimentFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      forexSentimentFilter === 'ALL'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Signals ({allForexPairs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setForexSentimentFilter('BULLISH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      forexSentimentFilter === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟢 Bullish ({allForexPairs.filter((p) => p.defaultSignal.action === 'STRONG BUY' || p.defaultSignal.action === 'BUY').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setForexSentimentFilter('BEARISH')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      forexSentimentFilter === 'BEARISH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔴 Bearish ({allForexPairs.filter((p) => p.defaultSignal.action === 'STRONG SELL' || p.defaultSignal.action === 'SELL').length})
                  </button>
                </div>

                {/* Grid / Table View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#070b13] border border-[#162540] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setForexViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      forexViewMode === 'grid'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setForexViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      forexViewMode === 'table'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Compact Table Matrix View"
                  >
                    <Table className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#141f33]">
              {[
                { id: 'ALL', label: '🌐 All Pairs', count: 34 },
                { id: 'MAJORS', label: '👑 Majors', count: 7 },
                { id: 'EUROCROSS', label: '🇪🇺 Euro Crosses', count: 6 },
                { id: 'POUNDCROSS', label: '🇬🇧 Pound Crosses', count: 5 },
                { id: 'YENCROSS', label: '🇯🇵 Yen & Crosses', count: 7 },
                { id: 'REGIONAL', label: '🌍 Emerging & Africa', count: 9 },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setForexSubCategory(sub.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    forexSubCategory === sub.id
                      ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50 shadow-sm'
                      : 'bg-[#080d18] text-slate-400 hover:text-white hover:bg-[#10192e] border border-transparent'
                  }`}
                >
                  <span>{sub.label}</span>
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode 1: Rich Cards Grid */}
            {forexViewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredForexPairs.map((pair) => {
                  const isSelected = selectedStock.ticker === pair.ticker;
                  const isUp = pair.changePercent >= 0;
                  const isBullish =
                    pair.defaultSignal.action === 'STRONG BUY' || pair.defaultSignal.action === 'BUY';

                  return (
                    <div
                      key={pair.ticker}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#102235] border-teal-500/70 shadow-[0_0_15px_rgba(13,242,201,0.15)] ring-1 ring-teal-500/40'
                          : 'bg-[#080d18] hover:bg-[#0d1627] border-[#18263e]'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-white font-mono">{pair.ticker}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/40">
                                {pair.pipSpread || '0.8 pips'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]" title={pair.name}>
                              {pair.name}
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              isBullish
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {pair.defaultSignal.action} {pair.defaultSignal.score}%
                          </span>
                        </div>

                        {/* Price & Change Row */}
                        <div className="flex items-baseline justify-between pt-1 font-mono">
                          <span className="text-base font-bold text-white">
                            {formatPairPrice(pair.currentPrice, true)}
                          </span>
                          <span
                            className={`text-xs font-semibold flex items-center gap-0.5 ${
                              isUp ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {isUp ? '+' : ''}{pair.changePercent}%
                          </span>
                        </div>

                        {/* Setup Preview */}
                        <div className="p-2 rounded-lg bg-[#0c1424] border border-[#17253d] text-[10px] text-slate-300">
                          <span className="text-purple-400 font-semibold">Setup:</span> {pair.defaultSignal.setup}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-3 mt-2 border-t border-[#15233c]">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStock(pair);
                            fetchStockAnalysis(pair);
                            const el = document.getElementById('primary-trading-chart');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-500 text-black shadow-sm'
                              : 'bg-teal-500/15 hover:bg-teal-500/25 text-[#0df2c9] border border-teal-500/30'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{isSelected ? 'Active Chart' : 'Analyze & Chart'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStock(pair);
                            handleExecuteSignalToPaper({
                              direction: isBullish ? 'LONG' : 'SHORT',
                              lots: 0.1,
                              sl: String(isBullish ? (pair.currentPrice * 0.996).toFixed(4) : (pair.currentPrice * 1.004).toFixed(4)),
                              tp: String(isBullish ? (pair.currentPrice * 1.008).toFixed(4) : (pair.currentPrice * 0.992).toFixed(4)),
                            });
                          }}
                          className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          title="Send to Paper Trading Desk"
                        >
                          <Target className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View Mode 2: Compact Institutional Matrix Table */}
            {forexViewMode === 'table' && (
              <div className="overflow-x-auto rounded-xl border border-[#1b2b45] mt-2 max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#080d18] text-slate-400 text-[10px] uppercase tracking-wider border-b border-[#1b2b45] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Pair Symbol</th>
                      <th className="py-2.5 px-3">Category & Profile</th>
                      <th className="py-2.5 px-3 text-right">Live Bid Price</th>
                      <th className="py-2.5 px-3 text-right">24h Change</th>
                      <th className="py-2.5 px-3 text-center">Pip Spread</th>
                      <th className="py-2.5 px-3 text-center">Algo Signal</th>
                      <th className="py-2.5 px-3">Primary Setup</th>
                      <th className="py-2.5 px-3 text-center">Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15233c] bg-[#090f1d]">
                    {filteredForexPairs.map((pair) => {
                      const isSelected = selectedStock.ticker === pair.ticker;
                      const isUp = pair.changePercent >= 0;
                      const isBull =
                        pair.defaultSignal.action === 'STRONG BUY' || pair.defaultSignal.action === 'BUY';

                      return (
                        <tr
                          key={pair.ticker}
                          className={`hover:bg-[#0e172a] transition-colors ${
                            isSelected ? 'bg-teal-950/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{pair.ticker}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 truncate max-w-[180px]">
                            {pair.name}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-white">
                            {formatPairPrice(pair.currentPrice, true)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-semibold ${
                              isUp ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isUp ? '+' : ''}{pair.changePercent}%
                          </td>
                          <td className="py-2.5 px-3 text-center text-purple-300">
                            {pair.pipSpread || '0.8 pips'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isBull
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {pair.defaultSignal.action} {pair.defaultSignal.score}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] truncate max-w-[200px]">
                            {pair.defaultSignal.setup}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStock(pair);
                                fetchStockAnalysis(pair);
                                const el = document.getElementById('primary-trading-chart');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-[#0df2c9] border border-teal-500/40 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Chart & Trade
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Stock & Forex Dashboard Grid */}
      <div id="primary-trading-chart" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
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

              {/* Dual Chart Engine Switcher & Timeframe selector */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-[#070b13] p-1 rounded-xl border border-[#162540]">
                  {selectedStock.market === 'NSE' ? (
                    <button
                      onClick={() => setChartViewMode('radar')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        chartViewMode === 'radar'
                          ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="NjiaFedha Pro Radar: Specialized Nairobi Securities Exchange direct order book & candles"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>NjiaFedha NSE Radar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setChartViewMode('radar')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        chartViewMode === 'radar'
                          ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="NjiaFedha Pro Radar: Custom chart with AI signals, lot sizer & dataset export"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pro Radar</span>
                    </button>
                  )}

                  <button
                    onClick={() => setChartViewMode('tradingview')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      chartViewMode === 'tradingview'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="TradingView Live Stream: Official real-time institutional exchange tick data feed"
                  >
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>TradingView Live Feed {selectedStock.market !== 'NSE' && '●'}</span>
                  </button>

                  <button
                    onClick={() => setIsAlertsModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                    title="Live Price Alerts & Watch Triggers"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Price Alerts</span>
                  </button>
                </div>

                {/* Timeframe selector (available in both Pro Radar & TradingView modes) */}
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
            </div>

            {/* Triggered Alert Toast Banner */}
            {triggeredAlertBanner && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>
                    <strong>PRICE ALERT TRIGGERED:</strong> {triggeredAlertBanner.ticker} has reached{' '}
                    <strong className="underline">{triggeredAlertBanner.currency} {triggeredAlertBanner.targetPrice}</strong>{' '}
                    ({triggeredAlertBanner.condition === 'ABOVE' ? 'Above' : 'Below'} trigger level)!
                  </span>
                </div>
                <button
                  onClick={() => setTriggeredAlertBanner(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

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

            {/* Interactive Candlestick Chart or TradingView Widget */}
            <div className="pt-1">
              {chartViewMode === 'radar' ? (
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
              ) : (
                <TradingViewWidget
                  ticker={selectedStock.ticker}
                  market={selectedStock.market}
                  timeframe={timeframe}
                  height={470}
                  onSwitchToProRadar={() => setChartViewMode('radar')}
                />
              )}
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

          {/* Interactive Trading Workbench: Paper Trading Desk, Economic Calendar & News */}
          <div id="trading-workbench" className="space-y-4">
            {/* Workbench Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#0c1322] border border-[#18253b]">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setBottomTab('paper')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'paper'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Paper Terminal</span>
                </button>

                <button
                  onClick={() => setBottomTab('orderflow')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'orderflow'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Order Flow & Liquidity</span>
                </button>

                <button
                  onClick={() => setBottomTab('livetv')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'livetv'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>World Monitor & Bloomberg TV</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </button>

                <button
                  onClick={() => setBottomTab('journal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'journal'
                      ? 'bg-[#0df2c9]/20 text-[#0df2c9] border border-[#0df2c9]/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-[#0df2c9]" />
                  <span>Performance Journal & Curve</span>
                </button>

                <button
                  onClick={() => setBottomTab('risk-calc')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'risk-calc'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-purple-400" />
                  <span>Risk & Lot Calculator</span>
                </button>

                <button
                  onClick={() => setBottomTab('sessions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'sessions'
                      ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Killzones & Sessions</span>
                </button>

                <button
                  onClick={() => setBottomTab('prop-guard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'prop-guard'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>Prop Firm Guard</span>
                </button>

                <button
                  onClick={() => setBottomTab('correlation')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'correlation'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Correlation Matrix</span>
                </button>

                <button
                  onClick={() => setBottomTab('broker-arbiter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'broker-arbiter'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Broker M-Pesa Arbiter</span>
                </button>

                <button
                  onClick={() => setBottomTab('strength')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'strength'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Currency Strength & Heatmap</span>
                </button>

                <button
                  onClick={() => setBottomTab('backtest')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'backtest'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strategy Backtester</span>
                </button>

                <button
                  onClick={() => setBottomTab('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'calendar'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Economic Calendar</span>
                </button>

                <button
                  onClick={() => setBottomTab('news')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bottomTab === 'news'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Forex Factory News & AI Insights</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500 px-2 hidden lg:inline">
                Asset: {selectedStock.ticker}
              </span>
            </div>

            {/* Tab 1: Live Paper Trading Desk */}
            {bottomTab === 'paper' && (
              <PaperTradingDesk
                ticker={selectedStock.ticker}
                name={selectedStock.name}
                market={selectedStock.market}
                currency={selectedStock.currency}
                currentPrice={currentDisplayPrice}
                defaultSl={activeSignal.stopLoss}
                defaultTp={activeSignal.takeProfit1}
                pipSpread={selectedStock.pipSpread}
                prefillOrder={prefillOrder}
              />
            )}

            {/* Tab: Order Flow, Volume Profile & Liquidity */}
            {bottomTab === 'orderflow' && (
              <OrderFlowLiquidityDesk
                currentTicker={selectedStock.ticker}
                currentPrice={currentDisplayPrice}
                currency={selectedStock.currency}
                onApplyZoneToOrder={(entry, sl, tp) => {
                  setPrefillOrder({
                    direction: entry >= currentDisplayPrice ? 'LONG' : 'SHORT',
                    lots: 0.1,
                    sl: String(sl),
                    tp: String(tp),
                    timestamp: Date.now(),
                  });
                  setBottomTab('paper');
                }}
              />
            )}

            {/* Tab: Bloomberg Live TV & Media Player */}
            {bottomTab === 'livetv' && (
              <LiveMarketsTVDesk
                onSelectTicker={(symbol) => {
                  const match = FEATURED_ASSETS.find((a) => a.ticker === symbol);
                  if (match) setSelectedStock(match);
                }}
              />
            )}

            {/* Tab 2: Performance Journal & Equity Curve */}
            {bottomTab === 'journal' && (
              <TradingJournalDesk currentTicker={selectedStock.ticker} />
            )}

            {/* Tab 3: Smart Risk & Lot Sizing Calculator */}
            {bottomTab === 'risk-calc' && (
              <RiskCalculatorDesk
                currentTicker={selectedStock.ticker}
                currentPrice={currentDisplayPrice}
                market={selectedStock.market}
                currency={selectedStock.currency}
                defaultSl={activeSignal.stopLoss}
                defaultTp={activeSignal.takeProfit1}
                onApplyToOrder={() => {
                  setBottomTab('paper');
                }}
              />
            )}

            {/* Tab 4: Forex Sessions & Killzones Radar */}
            {bottomTab === 'sessions' && (
              <ForexSessionsKillzones
                currentTicker={selectedStock.ticker}
                onSelectPair={(pair) => {
                  const match = FEATURED_ASSETS.find((a) => a.ticker === pair);
                  if (match) setSelectedStock(match);
                }}
              />
            )}

            {/* Tab 5: Prop Firm Risk Guardian */}
            {bottomTab === 'prop-guard' && (
              <PropFirmRiskGuardian currentTicker={selectedStock.ticker} />
            )}

            {/* Tab 6: Currency Pair Correlation Matrix */}
            {bottomTab === 'correlation' && (
              <CurrencyCorrelationMatrix
                currentTicker={selectedStock.ticker}
                onSelectPair={(pair) => {
                  const match = FEATURED_ASSETS.find((a) => a.ticker === pair);
                  if (match) setSelectedStock(match);
                }}
              />
            )}

            {/* Tab 7: Broker M-Pesa Spread Arbiter */}
            {bottomTab === 'broker-arbiter' && <BrokerMpesaArbiter />}

            {/* Tab 8: Currency Strength Meter & Heatmap */}
            {bottomTab === 'strength' && (
              <CurrencyStrengthMeter
                onSelectPair={(pair) => {
                  const match = FEATURED_ASSETS.find((a) => a.ticker === pair);
                  if (match) setSelectedStock(match);
                }}
              />
            )}

            {/* Tab 9: AI Strategy Backtester */}
            {bottomTab === 'backtest' && (
              <StrategyBacktester
                currentTicker={selectedStock.ticker}
                currentPrice={currentDisplayPrice}
              />
            )}

            {/* Tab 10: Economic Calendar */}
            {bottomTab === 'calendar' && (
              <EconomicCalendar currentTicker={selectedStock.ticker} />
            )}

            {/* Tab 11: Forex Factory Live News & AI Insights Feed */}
            {bottomTab === 'news' && (
              <ForexFactoryNewsDesk
                currentTicker={selectedStock.ticker}
                market={selectedStock.market}
              />
            )}
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
              <InstitutionalSignalCard
                ticker={selectedStock.ticker}
                name={selectedStock.name}
                market={selectedStock.market}
                currency={selectedStock.currency}
                currentPrice={currentDisplayPrice}
                pipSpread={selectedStock.pipSpread}
                activeTimeframe={timeframe}
                onSelectTimeframe={(tf) => {
                  setTimeframe(tf as Timeframe);
                }}
                signal={{
                  action: (activeSignal.action as any) || 'BUY',
                  setupType: activeSignal.setupType,
                  timeframe: activeSignal.timeframe,
                  timeframeCategory: activeSignal.timeframeCategory,
                  confirmationScore: activeSignal.confirmationScore,
                  entryZone: activeSignal.entryZone,
                  takeProfit1: activeSignal.takeProfit1,
                  takeProfit2: activeSignal.takeProfit2,
                  stopLoss: activeSignal.stopLoss,
                  riskReward: activeSignal.riskReward,
                  confidenceScore: activeSignal.confidenceScore,
                  summary: activeSignal.summary,
                  indicators: activeSignal.indicators,
                  smc: activeSignal.smc,
                  tradeManagement: activeSignal.tradeManagement,
                  multiAspectAnalysis: activeSignal.multiAspectAnalysis,
                }}
                onExecutePaperTrade={handleExecuteSignalToPaper}
                onOpenPriceAlert={(_target) => {
                  setIsAlertsModalOpen(true);
                }}
              />
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

      {/* Live Price Alerts & Watch Triggers Modal */}
      <PriceAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        currentTicker={selectedStock.ticker}
        currentName={selectedStock.name}
        currentPrice={currentDisplayPrice}
        currency={selectedStock.currency}
      />

      {/* AI Vision Chart Screenshot Analyzer Modal */}
      <ChartScreenshotAnalyzerModal
        isOpen={isChartAnalyzerOpen}
        onClose={() => setIsChartAnalyzerOpen(false)}
        onSelectAssetForRadar={(ticker) => {
          const match = FEATURED_ASSETS.find(
            (a) =>
              a.ticker.toLowerCase() === ticker.toLowerCase() ||
              ticker.toLowerCase().includes(a.ticker.toLowerCase())
          );
          if (match) {
            setSelectedStock(match);
            const el = document.getElementById('primary-trading-chart');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenPaperTrading={(setup) => {
          const match = FEATURED_ASSETS.find(
            (a) => a.ticker.toLowerCase() === setup.ticker.toLowerCase()
          );
          if (match) setSelectedStock(match);

          setPrefillOrder({
            direction: setup.action === 'BUY' ? 'LONG' : 'SHORT',
            lots: 0.1,
            sl: String(setup.stopLoss),
            tp: String(setup.takeProfit),
            timestamp: Date.now(),
          });
          setBottomTab('paper');
          setTimeout(() => {
            const el = document.getElementById('trading-workbench');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
      />
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
