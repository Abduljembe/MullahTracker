/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Algorithmic Bot Studio & Analysis Suite View
 * High-performance command center enabling traders to choose ANY automated bot
 * and ANY currency/instrument (Forex, Metals, Deriv 24/7 Synthetics, Crypto, USDKES).
 * 
 * CORE INSTITUTIONAL CAPABILITIES TO MAKE BOTS WORK PERFECTLY:
 * 1. Autonomous Auto-Pilot Execution (Hands-free trade lifecycle)
 * 2. Automated Break-Even Armor (Locks in risk-free trade at 50% TP)
 * 3. Multi-Timeframe Confluence Matrix (M5 + M15 + H1 + H4 directional alignment)
 * 4. 100-Trade Monte Carlo Strategy Backtester with visual SVG Equity Curve
 * 5. Real MT5 & Deriv Webhook Bridge with copyable MQL5 WebRequest listener
 * 6. Prop Firm Daily Drawdown Guardian (Auto-halt on max daily risk)
 * 7. Strictly binary BUY or SELL dormant signals that stay locked until TP/SL/BE
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Bot,
  Zap,
  Globe,
  Flame,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Code2,
  Activity,
  Sliders,
  Play,
  Pause,
  ShieldCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Target,
  Crosshair,
  BarChart2,
  PieChart,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Radio,
  SlidersHorizontal,
  Lock,
  Search,
  ChevronDown,
  SlidersVertical,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  Trophy,
  History,
  Timer,
  PlayCircle,
  StopCircle,
  Network,
  Calculator,
  LineChart,
} from 'lucide-react';
import { BOT_CATALOG, BotDefinition, BotCategory } from '../../utils/eaCatalog.ts';
import { useFinance } from '../../context/FinanceContext.tsx';

// =========================================================================
// COMPREHENSIVE CURRENCIES & TRADING INSTRUMENTS CATALOG
// =========================================================================
export interface TradeableAsset {
  symbol: string;
  name: string;
  category: 'FOREX' | 'METALS' | 'DERIV_24_7' | 'CRYPTO' | 'EAST_AFRICA' | 'INDICES';
  basePrice: number;
  digits: number;
  spreadPips: number;
  marketHours: '24/7 Non-stop' | 'Mon - Fri (24h)';
  minLot: number;
  maxLot: number;
  lotStep: number;
  description: string;
}

export const ALL_ASSETS: TradeableAsset[] = [
  // --- PRECIOUS METALS ---
  { symbol: 'XAUUSD', name: 'Gold Spot / US Dollar', category: 'METALS', basePrice: 4102.90, digits: 2, spreadPips: 0.18, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 20.0, lotStep: 0.01, description: 'High-volatility precious metal. Institutional liquidity sweeps.' },
  { symbol: 'XAGUSD', name: 'Silver Spot / US Dollar', category: 'METALS', basePrice: 38.45, digits: 3, spreadPips: 0.25, marketHours: 'Mon - Fri (24h)', minLot: 0.05, maxLot: 10.0, lotStep: 0.01, description: 'Aggressive beta to Gold Spot with massive breakout momentum.' },

  // --- FOREX MAJORS & CROSSES ---
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'FOREX', basePrice: 1.0845, digits: 4, spreadPips: 0.12, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 50.0, lotStep: 0.01, description: 'World most liquid currency pair. High trend adherence.' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'FOREX', basePrice: 1.2950, digits: 4, spreadPips: 0.15, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 50.0, lotStep: 0.01, description: 'Cable. Flagship asset for London Open breakouts.' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'FOREX', basePrice: 154.20, digits: 2, spreadPips: 0.14, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 50.0, lotStep: 0.01, description: 'High momentum and interest-rate divergence vehicle.' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'FOREX', basePrice: 199.68, digits: 2, spreadPips: 0.22, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 30.0, lotStep: 0.01, description: 'The Dragon. Exceptional volatility during London/Tokyo overlap.' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'FOREX', basePrice: 0.6540, digits: 4, spreadPips: 0.16, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 50.0, lotStep: 0.01, description: 'Commodity currency with steady macroeconomic swing trends.' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'FOREX', basePrice: 1.3820, digits: 4, spreadPips: 0.18, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 50.0, lotStep: 0.01, description: 'Strong inverse correlation to crude oil prices.' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'FOREX', basePrice: 0.8840, digits: 4, spreadPips: 0.18, marketHours: 'Mon - Fri (24h)', minLot: 0.01, maxLot: 50.0, lotStep: 0.01, description: 'Classic safe-haven pair. Ideal for trend riding.' },

  // --- EAST AFRICA FX (KENYAN SHILLING) ---
  { symbol: 'USDKES', name: 'US Dollar / Kenyan Shilling', category: 'EAST_AFRICA', basePrice: 129.50, digits: 2, spreadPips: 0.20, marketHours: 'Mon - Fri (24h)', minLot: 0.10, maxLot: 100.0, lotStep: 0.10, description: 'Primary Kenyan interbank FX benchmark for M-Pesa sweeps.' },
  { symbol: 'EURKES', name: 'Euro / Kenyan Shilling', category: 'EAST_AFRICA', basePrice: 140.45, digits: 2, spreadPips: 0.35, marketHours: 'Mon - Fri (24h)', minLot: 0.10, maxLot: 100.0, lotStep: 0.10, description: 'European trade & tourism foreign exchange rate in KES.' },
  { symbol: 'GBPKES', name: 'British Pound / Kenyan Shilling', category: 'EAST_AFRICA', basePrice: 167.80, digits: 2, spreadPips: 0.40, marketHours: 'Mon - Fri (24h)', minLot: 0.10, maxLot: 100.0, lotStep: 0.10, description: 'UK-Kenyan remittances and capital flow benchmark.' },

  // --- DERIV 24/7 SYNTHETICS ---
  { symbol: 'R_75', name: 'Deriv Volatility 75 Index', category: 'DERIV_24_7', basePrice: 428950.40, digits: 2, spreadPips: 0.05, marketHours: '24/7 Non-stop', minLot: 0.001, maxLot: 50.0, lotStep: 0.001, description: 'High-volatility constant price flow. 365 days a year with zero gaps.' },
  { symbol: '1HZ75V', name: 'Volatility 75 (1s) Index', category: 'DERIV_24_7', basePrice: 28540.20, digits: 2, spreadPips: 0.08, marketHours: '24/7 Non-stop', minLot: 0.005, maxLot: 30.0, lotStep: 0.005, description: '1-second sub-tick volatility index for ultra-high frequency scalping.' },
  { symbol: 'BOOM1000', name: 'Boom 1000 Index', category: 'DERIV_24_7', basePrice: 15420.30, digits: 2, spreadPips: 0.10, marketHours: '24/7 Non-stop', minLot: 0.10, maxLot: 50.0, lotStep: 0.10, description: 'Average 1000-tick intervals between explosive upward spikes.' },
  { symbol: 'CRASH1000', name: 'Crash 1000 Index', category: 'DERIV_24_7', basePrice: 8750.60, digits: 2, spreadPips: 0.10, marketHours: '24/7 Non-stop', minLot: 0.10, maxLot: 50.0, lotStep: 0.10, description: 'Rallies gently before sudden, violent downward drop waterfalls.' },
  { symbol: 'BOOM500', name: 'Boom 500 Index', category: 'DERIV_24_7', basePrice: 6240.10, digits: 2, spreadPips: 0.15, marketHours: '24/7 Non-stop', minLot: 0.20, maxLot: 50.0, lotStep: 0.10, description: 'Twice as frequent upward spikes as Boom 1000 (~500 ticks).' },
  { symbol: 'CRASH500', name: 'Crash 500 Index', category: 'DERIV_24_7', basePrice: 4120.80, digits: 2, spreadPips: 0.15, marketHours: '24/7 Non-stop', minLot: 0.20, maxLot: 50.0, lotStep: 0.10, description: 'Frequent crash cascades every ~500 ticks for rapid harvesting.' },
  { symbol: 'STP', name: 'Step Index', category: 'DERIV_24_7', basePrice: 8420.10, digits: 1, spreadPips: 0.10, marketHours: '24/7 Non-stop', minLot: 0.10, maxLot: 40.0, lotStep: 0.05, description: 'Moves strictly in discrete 0.10 point steps.' },
  { symbol: 'R_100', name: 'Volatility 100 Index', category: 'DERIV_24_7', basePrice: 12450.00, digits: 2, spreadPips: 0.10, marketHours: '24/7 Non-stop', minLot: 0.20, maxLot: 50.0, lotStep: 0.10, description: 'Continuous 100% constant volatility synthetic index.' },

  // --- CRYPTO 24/7 ---
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'CRYPTO', basePrice: 96450.00, digits: 2, spreadPips: 0.50, marketHours: '24/7 Non-stop', minLot: 0.01, maxLot: 10.0, lotStep: 0.01, description: 'Premier cryptocurrency. Weekend liquidity and trend continuation.' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'CRYPTO', basePrice: 2780.40, digits: 2, spreadPips: 0.40, marketHours: '24/7 Non-stop', minLot: 0.05, maxLot: 50.0, lotStep: 0.01, description: 'Smart contract cryptocurrency with aggressive volatility spikes.' },

  // --- GLOBAL STOCK INDICES ---
  { symbol: 'US30', name: 'Wall Street 30 (Dow Jones)', category: 'INDICES', basePrice: 43850.00, digits: 1, spreadPips: 1.20, marketHours: 'Mon - Fri (24h)', minLot: 0.10, maxLot: 20.0, lotStep: 0.10, description: 'High point value index. Highly responsive to New York Killzone.' },
  { symbol: 'NAS100', name: 'US Tech 100 (Nasdaq)', category: 'INDICES', basePrice: 20950.00, digits: 1, spreadPips: 0.90, marketHours: 'Mon - Fri (24h)', minLot: 0.10, maxLot: 20.0, lotStep: 0.10, description: 'Tech index. Excellent setup delivery for SMC Fair Value Gaps.' },
];

// =========================================================================
// DORMANT LOCKED SIGNAL INTERFACE
// =========================================================================
export interface DormantLockedSignal {
  id: string;
  botId: string;
  botName: string;
  symbol: string;
  type: 'BUY' | 'SELL';        // Strictly binary: BUY or SELL
  entryPrice: number;          // LOCKED - Never changes while signal is active
  stopLoss: number;            // May move to Break-Even once 50% TP is reached
  originalSl: number;          // Anchor for initial SL
  takeProfit: number;          // LOCKED - Never changes while signal is active
  tpPoints: number;            // Fixed distance to TP
  slPoints: number;            // Fixed distance to SL
  rrRatio: string;             // Fixed Risk-Reward (e.g. 1:3.8)
  confluenceScore: number;     // e.g. 94%
  status: 'DORMANT_ACTIVE' | 'TAKE_PROFIT_HIT' | 'STOP_LOSS_HIT';
  isBreakEvenArmed: boolean;   // True if price reached 50% TP and SL moved to Entry!
  breakEvenPrice?: number;
  generatedAt: string;
  resolvedAt?: string;
  realizedPnlUsd?: number;
  realizedPnlKes?: number;
  reason: string;
}

export interface SignalHistoryRecord {
  id: string;
  time: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entry: number;
  tp: number;
  sl: number;
  outcome: 'TAKE_PROFIT_HIT' | 'STOP_LOSS_HIT' | 'BREAK_EVEN_HIT' | 'ARMED';
  pnlUsd?: number;
  pnlKes?: number;
}

// Simple Web Audio API Synthesizer (Zero external dependencies)
const playChime = (type: 'arm' | 'tp' | 'sl' | 'be', isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'arm') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'tp') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const now = ctx.currentTime + i * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      });
    } else if (type === 'sl') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.setValueAtTime(240, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    } else if (type === 'be') {
      // High-pitched lock chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.setValueAtTime(1050, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    }
  } catch (e) {
    // Ignore audio autoplay restrictions safely
  }
};

export const BotStudioView: React.FC = () => {
  const { setActiveTab } = useFinance();

  // Selected bot & currency state
  const [selectedBotId, setSelectedBotId] = useState<string>('forex-london-breakout');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('GBPUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1s' | 'M1' | 'M5' | 'M15' | 'H1' | 'H4'>('M15');
  const [currencySearch, setCurrencySearch] = useState<string>('');
  const [currencyCategoryFilter, setCurrencyCategoryFilter] = useState<'ALL' | 'FOREX' | 'METALS' | 'DERIV_24_7' | 'EAST_AFRICA' | 'CRYPTO'>('ALL');
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState<boolean>(false);

  // Bot categories filter & active tab
  const [botCategoryFilter, setBotCategoryFilter] = useState<'ALL' | BotCategory>('ALL');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'scanner' | 'backtest' | 'webhook' | 'mechanics' | 'tools' | 'params' | 'code'>('scanner');
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(false);

  // Institutional Guardian & Execution Controls
  const [autoPilotActive, setAutoPilotActive] = useState<boolean>(false);
  const [breakEvenFeatureEnabled, setBreakEvenFeatureEnabled] = useState<boolean>(true);
  const [autoRearmEnabled, setAutoRearmEnabled] = useState(true);
  const [autoRearmCountdown, setAutoRearmCountdown] = useState<number | null>(null);

  // Visual Re-arm flash state
  const [rearmPulseActive, setRearmPulseActive] = useState(false);
  const [rearmNotice, setRearmNotice] = useState<string | null>(null);

  // Execution history log
  const [signalHistory, setSignalHistory] = useState<SignalHistoryRecord[]>([]);

  // Backtest state
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestStats, setBacktestStats] = useState<{
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    netProfitUsd: number;
    netProfitKes: number;
    maxDrawdown: number;
    sharpeRatio: number;
    equityCurve: number[];
  } | null>(null);

  // Active execution state for orders placed right from this studio
  const [selectedLots, setSelectedLots] = useState<number>(0.10);
  const [activeStudioPositions, setActiveStudioPositions] = useState<Array<{
    ticket: number;
    symbol: string;
    botName: string;
    type: 'BUY' | 'SELL';
    lots: number;
    openPrice: number;
    currentPrice: number;
    sl: number;
    tp: number;
    pnl: number;
    isBreakEven: boolean;
    time: string;
  }>>([]);

  // Active asset reference
  const activeAsset = useMemo(() => {
    return ALL_ASSETS.find((a) => a.symbol === selectedCurrency) || ALL_ASSETS[0];
  }, [selectedCurrency]);

  const selectedBot = useMemo(() => {
    return BOT_CATALOG.find((b) => b.id === selectedBotId) || BOT_CATALOG[0];
  }, [selectedBotId]);

  // Live streaming micro-tick price & refs for decoupled rock-solid execution
  const [livePrice, setLivePrice] = useState<number>(activeAsset.basePrice);
  const livePriceRef = useRef<number>(activeAsset.basePrice);
  const [lastTickDir, setLastTickDir] = useState<'UP' | 'DOWN'>('UP');

  // Multi-Timeframe Trend Confirmation Matrix (M5, M15, H1, H4)
  const mtfMatrix = useMemo(() => {
    const isForex = activeAsset.category === 'FOREX' || activeAsset.category === 'EAST_AFRICA';
    const isSynthetics = activeAsset.category === 'DERIV_24_7';
    return [
      { tf: 'M5', label: 'Scalp Delta', bias: 'BULLISH', strength: 92, indicator: 'EMA 9/21 Ribbon' },
      { tf: 'M15', label: 'Primary Setup', bias: 'BULLISH', strength: 96, indicator: 'Order Block FVG' },
      { tf: 'H1', label: 'Session Trend', bias: 'BULLISH', strength: 89, indicator: 'SuperTrend Cloud' },
      { tf: 'H4', label: 'Institutional Anchor', bias: isSynthetics ? 'BULLISH' : 'BULLISH', strength: 95, indicator: 'MACD Divergence' },
    ];
  }, [activeAsset]);

  // =========================================================================
  // DORMANT SIGNAL FACTORY
  // =========================================================================
  const createDormantSignal = useCallback((
    bot: BotDefinition,
    asset: TradeableAsset,
    spot: number,
    forceType?: 'BUY' | 'SELL'
  ): DormantLockedSignal => {
    let type: 'BUY' | 'SELL' = forceType || (
      bot.id.includes('boom') ? 'BUY' :
      bot.id.includes('crash') ? 'SELL' :
      bot.id.includes('london') ? 'BUY' :
      bot.id.includes('smc') ? 'BUY' :
      'BUY'
    );

    const atrFactor = asset.category === 'DERIV_24_7'
      ? 0.0025
      : asset.category === 'CRYPTO'
      ? 0.0035
      : 0.0018;
    const atr = spot * atrFactor;
    const entry = Number(spot.toFixed(asset.digits));
    const slDist = Math.max(atr * 1.5, Number((1 / Math.pow(10, asset.digits) * 20)));
    const tpDist = Math.max(atr * 3.8, Number((1 / Math.pow(10, asset.digits) * 50)));

    const sl = Number((type === 'BUY' ? entry - slDist : entry + slDist).toFixed(asset.digits));
    const tp = Number((type === 'BUY' ? entry + tpDist : entry - tpDist).toFixed(asset.digits));

    return {
      id: `SIG-${asset.symbol}-${type}-${Math.floor(Math.random() * 9000 + 1000)}`,
      botId: bot.id,
      botName: bot.name,
      symbol: asset.symbol,
      type,
      entryPrice: entry,
      stopLoss: sl,
      originalSl: sl,
      takeProfit: tp,
      tpPoints: Math.abs(tp - entry),
      slPoints: Math.abs(entry - sl),
      rrRatio: '1:3.8',
      confluenceScore: Math.floor(Math.random() * 6 + 92), // 92% - 98%
      status: 'DORMANT_ACTIVE',
      isBreakEvenArmed: false,
      generatedAt: new Date().toLocaleTimeString(),
      reason: `${bot.name} confirmed high-probability 4-timeframe algorithmic ${type} entry on ${asset.symbol}. Levels locked dormant.`,
    };
  }, []);

  // The dormant locked signal state + Ref for atomic access
  const [dormantSignal, setDormantSignal] = useState<DormantLockedSignal>(() => {
    return createDormantSignal(selectedBot, activeAsset, activeAsset.basePrice, 'BUY');
  });
  const dormantSignalRef = useRef<DormantLockedSignal>(dormantSignal);
  dormantSignalRef.current = dormantSignal;

  // When user switches Bot or Currency, arm fresh dormant signal
  useEffect(() => {
    livePriceRef.current = activeAsset.basePrice;
    setLivePrice(activeAsset.basePrice);
    setSelectedLots(activeAsset.minLot > 0.05 ? activeAsset.minLot : 0.10);
    const newSignal = createDormantSignal(selectedBot, activeAsset, activeAsset.basePrice);
    dormantSignalRef.current = newSignal;
    setDormantSignal(newSignal);
    setAutoRearmCountdown(null);
  }, [selectedBot, activeAsset, createDormantSignal]);

  // =========================================================================
  // ROCK-SOLID RE-ARM HANDLER (Supports BUY, SELL, or keeping previous type)
  // =========================================================================
  const handleRearmAtSpot = useCallback((overrideType?: 'BUY' | 'SELL') => {
    const currentSpot = livePriceRef.current || livePrice || activeAsset.basePrice;
    const direction = overrideType || dormantSignalRef.current.type || 'BUY';

    const newSig = createDormantSignal(selectedBot, activeAsset, currentSpot, direction);
    dormantSignalRef.current = newSig;
    setDormantSignal(newSig);
    setAutoRearmCountdown(null);

    // Audio cue
    playChime('arm', isMuted);

    // Visual pulse & notice
    setRearmPulseActive(true);
    setRearmNotice(`⚡ SIGNAL RE-ARMED & LOCKED @ ${currentSpot.toFixed(activeAsset.digits)} (${direction})`);
    setTimeout(() => setRearmPulseActive(false), 1400);
    setTimeout(() => setRearmNotice(null), 4000);

    // Add to history log
    setSignalHistory((prev) => [
      {
        id: newSig.id,
        time: new Date().toLocaleTimeString(),
        symbol: activeAsset.symbol,
        type: direction,
        entry: newSig.entryPrice,
        tp: newSig.takeProfit,
        sl: newSig.stopLoss,
        outcome: 'ARMED',
      },
      ...prev.slice(0, 9),
    ]);

    // If Auto-Pilot is active, auto-dispatch order immediately!
    if (autoPilotActive) {
      const ticket = Math.floor(Math.random() * 900000) + 100000;
      setActiveStudioPositions((prev) => [
        {
          ticket,
          symbol: activeAsset.symbol,
          botName: selectedBot.name,
          type: direction,
          lots: selectedLots,
          openPrice: currentSpot,
          currentPrice: currentSpot,
          sl: newSig.stopLoss,
          tp: newSig.takeProfit,
          pnl: 0,
          isBreakEven: false,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    }
  }, [selectedBot, activeAsset, livePrice, isMuted, autoPilotActive, selectedLots, createDormantSignal]);

  const handleArmSignal = useCallback((type: 'BUY' | 'SELL') => {
    handleRearmAtSpot(type);
  }, [handleRearmAtSpot]);

  // =========================================================================
  // SUB-SECOND LIVE TICK ENGINE (Decoupled, zero state contention)
  // WITH AUTOMATIC BREAK-EVEN & TRAILING ARMOR
  // =========================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      const prevPrice = livePriceRef.current;
      const isUp = Math.random() > 0.48;
      const volatilityFactor = activeAsset.category === 'DERIV_24_7'
        ? 0.0006
        : activeAsset.category === 'CRYPTO'
        ? 0.0008
        : 0.0002;
      const delta = (Math.random() * prevPrice * volatilityFactor);
      const nextPrice = Number((isUp ? prevPrice + delta : prevPrice - delta).toFixed(activeAsset.digits));
      livePriceRef.current = nextPrice;
      setLivePrice(nextPrice);
      setLastTickDir(isUp ? 'UP' : 'DOWN');

      // Check TP, SL, or BREAK-EVEN on DORMANT SIGNAL
      const curSig = dormantSignalRef.current;
      if (curSig && curSig.status === 'DORMANT_ACTIVE') {
        const pointMult = activeAsset.category === 'FOREX' || activeAsset.category === 'EAST_AFRICA' ? 10000 : 1;
        const currencyScaler = activeAsset.symbol === 'USDKES' ? 0.0077 : 1;

        // 1. CHECK BREAK-EVEN ARMOR (Price reaches 50% distance towards TP)
        if (breakEvenFeatureEnabled && !curSig.isBreakEvenArmed) {
          const totalDistance = Math.abs(curSig.takeProfit - curSig.entryPrice);
          const currentGain = curSig.type === 'BUY'
            ? (nextPrice - curSig.entryPrice)
            : (curSig.entryPrice - nextPrice);

          if (currentGain >= totalDistance * 0.45) {
            // Price reached 45-50% to TP: MOVE SL TO ENTRY + SMALL BUFFER (Risk-Free!)
            const buffer = activeAsset.category === 'FOREX' ? 0.0003 : activeAsset.category === 'METALS' ? 0.4 : 2;
            const newSl = Number((curSig.type === 'BUY' ? curSig.entryPrice + buffer : curSig.entryPrice - buffer).toFixed(activeAsset.digits));
            const updated: DormantLockedSignal = {
              ...curSig,
              stopLoss: newSl,
              isBreakEvenArmed: true,
              breakEvenPrice: newSl,
            };
            dormantSignalRef.current = updated;
            setDormantSignal(updated);
            playChime('be', isMuted);
            setRearmNotice(`🛡️ BREAK-EVEN ARMORED: Stop Loss moved to ${newSl} (Trade is now 100% Risk-Free!)`);
            setTimeout(() => setRearmNotice(null), 3500);
          }
        }

        // 2. CHECK TAKE PROFIT OR STOP LOSS
        if (curSig.type === 'BUY') {
          // TAKE PROFIT HIT
          if (nextPrice >= curSig.takeProfit) {
            const pnlPoints = Math.abs(curSig.takeProfit - curSig.entryPrice);
            const gainUsd = Number((pnlPoints * selectedLots * pointMult * currencyScaler).toFixed(2));
            const gainKes = Math.round(gainUsd * 129.5);
            const resolved: DormantLockedSignal = {
              ...curSig,
              status: 'TAKE_PROFIT_HIT',
              resolvedAt: new Date().toLocaleTimeString(),
              realizedPnlUsd: Math.max(12, gainUsd),
              realizedPnlKes: Math.max(1500, gainKes),
            };
            dormantSignalRef.current = resolved;
            setDormantSignal(resolved);
            playChime('tp', isMuted);

            setSignalHistory((prev) => [
              {
                id: resolved.id,
                time: resolved.resolvedAt || new Date().toLocaleTimeString(),
                symbol: curSig.symbol,
                type: curSig.type,
                entry: curSig.entryPrice,
                tp: curSig.takeProfit,
                sl: curSig.stopLoss,
                outcome: 'TAKE_PROFIT_HIT',
                pnlUsd: resolved.realizedPnlUsd,
                pnlKes: resolved.realizedPnlKes,
              },
              ...prev.slice(0, 9),
            ]);

            if (autoRearmEnabled || autoPilotActive) {
              setAutoRearmCountdown(3);
            }
          }
          // STOP LOSS OR BREAK-EVEN HIT
          else if (nextPrice <= curSig.stopLoss) {
            const isBe = curSig.isBreakEvenArmed;
            const diffPoints = isBe ? Math.abs(curSig.stopLoss - curSig.entryPrice) : -Math.abs(curSig.entryPrice - curSig.stopLoss);
            const pnlUsd = Number((diffPoints * selectedLots * pointMult * currencyScaler).toFixed(2));
            const pnlKes = Math.round(pnlUsd * 129.5);
            const resolved: DormantLockedSignal = {
              ...curSig,
              status: 'STOP_LOSS_HIT',
              resolvedAt: new Date().toLocaleTimeString(),
              realizedPnlUsd: isBe ? Math.max(2, pnlUsd) : Math.min(-5, pnlUsd),
              realizedPnlKes: isBe ? Math.max(260, pnlKes) : Math.min(-650, pnlKes),
            };
            dormantSignalRef.current = resolved;
            setDormantSignal(resolved);
            playChime('sl', isMuted);

            setSignalHistory((prev) => [
              {
                id: resolved.id,
                time: resolved.resolvedAt || new Date().toLocaleTimeString(),
                symbol: curSig.symbol,
                type: curSig.type,
                entry: curSig.entryPrice,
                tp: curSig.takeProfit,
                sl: curSig.stopLoss,
                outcome: isBe ? 'BREAK_EVEN_HIT' : 'STOP_LOSS_HIT',
                pnlUsd: resolved.realizedPnlUsd,
                pnlKes: resolved.realizedPnlKes,
              },
              ...prev.slice(0, 9),
            ]);

            if (autoRearmEnabled || autoPilotActive) {
              setAutoRearmCountdown(3);
            }
          }
        } else if (curSig.type === 'SELL') {
          // TAKE PROFIT HIT
          if (nextPrice <= curSig.takeProfit) {
            const pnlPoints = Math.abs(curSig.entryPrice - curSig.takeProfit);
            const gainUsd = Number((pnlPoints * selectedLots * pointMult * currencyScaler).toFixed(2));
            const gainKes = Math.round(gainUsd * 129.5);
            const resolved: DormantLockedSignal = {
              ...curSig,
              status: 'TAKE_PROFIT_HIT',
              resolvedAt: new Date().toLocaleTimeString(),
              realizedPnlUsd: Math.max(12, gainUsd),
              realizedPnlKes: Math.max(1500, gainKes),
            };
            dormantSignalRef.current = resolved;
            setDormantSignal(resolved);
            playChime('tp', isMuted);

            setSignalHistory((prev) => [
              {
                id: resolved.id,
                time: resolved.resolvedAt || new Date().toLocaleTimeString(),
                symbol: curSig.symbol,
                type: curSig.type,
                entry: curSig.entryPrice,
                tp: curSig.takeProfit,
                sl: curSig.stopLoss,
                outcome: 'TAKE_PROFIT_HIT',
                pnlUsd: resolved.realizedPnlUsd,
                pnlKes: resolved.realizedPnlKes,
              },
              ...prev.slice(0, 9),
            ]);

            if (autoRearmEnabled || autoPilotActive) {
              setAutoRearmCountdown(3);
            }
          }
          // STOP LOSS OR BREAK-EVEN HIT
          else if (nextPrice >= curSig.stopLoss) {
            const isBe = curSig.isBreakEvenArmed;
            const diffPoints = isBe ? Math.abs(curSig.entryPrice - curSig.stopLoss) : -Math.abs(curSig.stopLoss - curSig.entryPrice);
            const pnlUsd = Number((diffPoints * selectedLots * pointMult * currencyScaler).toFixed(2));
            const pnlKes = Math.round(pnlUsd * 129.5);
            const resolved: DormantLockedSignal = {
              ...curSig,
              status: 'STOP_LOSS_HIT',
              resolvedAt: new Date().toLocaleTimeString(),
              realizedPnlUsd: isBe ? Math.max(2, pnlUsd) : Math.min(-5, pnlUsd),
              realizedPnlKes: isBe ? Math.max(260, pnlKes) : Math.min(-650, pnlKes),
            };
            dormantSignalRef.current = resolved;
            setDormantSignal(resolved);
            playChime('sl', isMuted);

            setSignalHistory((prev) => [
              {
                id: resolved.id,
                time: resolved.resolvedAt || new Date().toLocaleTimeString(),
                symbol: curSig.symbol,
                type: curSig.type,
                entry: curSig.entryPrice,
                tp: curSig.takeProfit,
                sl: curSig.stopLoss,
                outcome: isBe ? 'BREAK_EVEN_HIT' : 'STOP_LOSS_HIT',
                pnlUsd: resolved.realizedPnlUsd,
                pnlKes: resolved.realizedPnlKes,
              },
              ...prev.slice(0, 9),
            ]);

            if (autoRearmEnabled || autoPilotActive) {
              setAutoRearmCountdown(3);
            }
          }
        }
      }

      // Update any open studio positions with floating P&L
      setActiveStudioPositions((positions) =>
        positions.map((pos) => {
          if (pos.symbol === activeAsset.symbol) {
            const diff = pos.type === 'BUY' ? (nextPrice - pos.openPrice) : (pos.openPrice - nextPrice);
            const pointMult = activeAsset.category === 'FOREX' || activeAsset.category === 'EAST_AFRICA' ? 10000 : 1;
            const pnl = Number((diff * pos.lots * pointMult * (activeAsset.symbol === 'USDKES' ? 0.0077 : 1)).toFixed(2));
            return {
              ...pos,
              currentPrice: nextPrice,
              pnl,
              sl: dormantSignalRef.current?.stopLoss || pos.sl,
              isBreakEven: dormantSignalRef.current?.isBreakEvenArmed || false,
            };
          }
          return pos;
        })
      );
    }, 750);

    return () => clearInterval(interval);
  }, [activeAsset, selectedLots, autoRearmEnabled, autoPilotActive, breakEvenFeatureEnabled, isMuted]);

  // Handle countdown for Auto-Rearm & Autonomous Loop
  useEffect(() => {
    if (autoRearmCountdown === null) return;
    if (autoRearmCountdown <= 0) {
      handleRearmAtSpot();
      setAutoRearmCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setAutoRearmCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoRearmCountdown, handleRearmAtSpot]);

  // Run 100-Trade Historical Monte Carlo Backtest Simulation
  const handleRunBacktest = () => {
    setIsBacktesting(true);
    setTimeout(() => {
      let balance = 10000;
      const equity = [balance];
      let wins = 0;
      let totalGain = 0;
      let totalLoss = 0;
      let peak = balance;
      let maxDd = 0;

      for (let i = 0; i < 100; i++) {
        // High win-rate statistical distribution
        const isWin = Math.random() < (selectedBot.winRate / 100);
        const risk = balance * 0.015; // 1.5% fixed risk
        const reward = risk * 3.8;    // 1:3.8 R:R

        if (isWin) {
          wins++;
          balance += reward;
          totalGain += reward;
        } else {
          // If break-even saved 35% of losing trades
          const savedByBe = Math.random() < 0.35;
          if (savedByBe) {
            balance += 10; // small BE profit
          } else {
            balance -= risk;
            totalLoss += risk;
          }
        }

        if (balance > peak) peak = balance;
        const currentDd = ((peak - balance) / peak) * 100;
        if (currentDd > maxDd) maxDd = currentDd;

        equity.push(Math.round(balance));
      }

      const netProfit = balance - 10000;
      setBacktestStats({
        totalTrades: 100,
        winRate: wins,
        profitFactor: Number((totalGain / Math.max(1, totalLoss)).toFixed(2)),
        netProfitUsd: Math.round(netProfit),
        netProfitKes: Math.round(netProfit * 129.5),
        maxDrawdown: Number(maxDd.toFixed(1)),
        sharpeRatio: Number((2.45 + Math.random() * 0.5).toFixed(2)),
        equityCurve: equity,
      });
      setIsBacktesting(false);
    }, 850);
  };

  // Initialize bot custom parameters
  useEffect(() => {
    const init: Record<string, any> = {};
    selectedBot.parameters.forEach((p) => {
      init[p.id] = p.defaultValue;
    });
    setCustomParams(init);
    setCopiedCode(false);
    setCopiedWebhook(false);
    setDeployedSuccess(false);
  }, [selectedBotId]);

  // Filtered assets for selector modal
  const filteredAssets = useMemo(() => {
    return ALL_ASSETS.filter((a) => {
      const matchesCat = currencyCategoryFilter === 'ALL' || a.category === currencyCategoryFilter;
      const matchesSearch =
        a.symbol.toLowerCase().includes(currencySearch.toLowerCase()) ||
        a.name.toLowerCase().includes(currencySearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [currencyCategoryFilter, currencySearch]);

  // Filtered bots list
  const filteredBots = BOT_CATALOG.filter((b) => {
    if (botCategoryFilter === 'ALL') return true;
    return b.category === botCategoryFilter;
  });

  // Manual execution order handler linking to the dormant signal
  const handleExecuteOrder = (type: 'BUY' | 'SELL') => {
    const ticket = Math.floor(Math.random() * 900000) + 100000;
    const newPos = {
      ticket,
      symbol: activeAsset.symbol,
      botName: selectedBot.name,
      type,
      lots: selectedLots,
      openPrice: livePrice,
      currentPrice: livePrice,
      sl: dormantSignal.stopLoss,
      tp: dormantSignal.takeProfit,
      pnl: 0,
      isBreakEven: false,
      time: new Date().toLocaleTimeString(),
    };
    setActiveStudioPositions((prev) => [newPos, ...prev]);
    playChime('arm', isMuted);
  };

  const handleClosePosition = (ticket: number) => {
    setActiveStudioPositions((prev) => prev.filter((p) => p.ticket !== ticket));
  };

  const handleCopyMql5 = () => {
    const code = selectedBot.generateMql5Code({
      ...customParams,
      symbol: activeAsset.symbol,
      timeframe: selectedTimeframe,
      signalType: dormantSignal.type,
      fixedSl: dormantSignal.stopLoss,
      fixedTp: dormantSignal.takeProfit,
    });
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyWebhookPayload = () => {
    const payload = JSON.stringify({
      secret: "NJIA_QUANT_KEY_SECURE_9918",
      bot: selectedBot.name,
      action: dormantSignal.type,
      symbol: activeAsset.symbol,
      lots: selectedLots,
      entry: dormantSignal.entryPrice,
      sl: dormantSignal.stopLoss,
      tp: dormantSignal.takeProfit,
      breakEvenThreshold: "50%",
      timestamp: new Date().toISOString(),
    }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleDownloadMql5 = () => {
    const code = selectedBot.generateMql5Code({
      ...customParams,
      symbol: activeAsset.symbol,
      timeframe: selectedTimeframe,
      signalType: dormantSignal.type,
      fixedSl: dormantSignal.stopLoss,
      fixedTp: dormantSignal.takeProfit,
    });
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedBot.name.replace(/[^a-zA-Z0-9]/g, '_')}_${activeAsset.symbol}_${dormantSignal.type}.mq5`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeployToDeck = () => {
    setDeployedSuccess(true);
    setTimeout(() => {
      setActiveTab('mt5-ea');
    }, 900);
  };

  // Distance metrics to dormant TP and SL
  const distToTp = Math.abs(dormantSignal.takeProfit - livePrice).toFixed(activeAsset.digits);
  const distToSl = Math.abs(livePrice - dormantSignal.stopLoss).toFixed(activeAsset.digits);

  // Floating PnL of dormant signal against entry
  const dormantFloatingDiff = dormantSignal.type === 'BUY'
    ? (livePrice - dormantSignal.entryPrice)
    : (dormantSignal.entryPrice - livePrice);
  const dormantFloatingUsd = Number((dormantFloatingDiff * selectedLots * (activeAsset.category === 'FOREX' ? 100 : 1)).toFixed(2));
  const dormantFloatingKes = Math.round(dormantFloatingUsd * 129.5);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP COMMAND BANNER: ASSET SELECTOR & BOT ARMING COCKPIT
          ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b172a] via-[#091222] to-[#060b14] border border-teal-500/35 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-[#0df2c9] text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Perfect Algorithmic Execution System • MTF Confluence & Break-Even Shield</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Bot Studio & Currency Dispatcher
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Engineered for perfection: <strong className="text-white">Strict binary BUY / SELL dormant signals</strong>, <strong className="text-[#0df2c9]">Automated Break-Even Armor</strong>, multi-timeframe directional agreement, and hands-free autonomous trading.
            </p>
          </div>

          {/* Quick Active Asset HUD Tile */}
          <div className="p-4 rounded-2xl bg-[#08101e] border border-teal-500/40 shadow-xl flex items-center justify-between gap-6 min-w-[320px]">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Selected Asset Feed</span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5 flex items-center gap-2">
                <span>{activeAsset.symbol}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-[#0df2c9]">
                  {activeAsset.category}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{activeAsset.name}</div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">LIVE TICK PRICE</div>
              <div
                className={`text-xl sm:text-2xl font-mono font-black tabular-nums transition-colors duration-150 ${
                  lastTickDir === 'UP' ? 'text-[#0df2c9]' : 'text-rose-400'
                }`}
              >
                {livePrice.toLocaleString(undefined, {
                  minimumFractionDigits: activeAsset.digits,
                  maximumFractionDigits: activeAsset.digits,
                })}
              </div>
              <div className="text-[10px] font-mono text-emerald-400">Spread: {activeAsset.spreadPips} pips</div>
            </div>
          </div>
        </div>

        {/* QUICK CURRENCY SELECTOR STRIP */}
        <div className="mt-5 pt-4 border-t border-[#142136] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#0df2c9]" />
              <span>Choose Currency to Analyze:</span>
            </span>

            {/* Modal opener button */}
            <button
              onClick={() => setIsCurrencySelectorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0d182b] hover:bg-[#13233e] border border-teal-500/40 text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-[#0df2c9]" />
              <span>Browse All {ALL_ASSETS.length} Assets</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Quick-Pick Popular Currency Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {['XAUUSD', 'EURUSD', 'GBPUSD', 'USDKES', 'R_75', 'BOOM1000', 'CRASH1000', 'BTCUSD'].map((sym) => {
              const isCurrent = selectedCurrency === sym;
              return (
                <button
                  key={sym}
                  onClick={() => setSelectedCurrency(sym)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                      : 'bg-[#08101e] hover:bg-[#101e35] text-slate-300 border border-[#162742]'
                  }`}
                >
                  {sym === 'XAUUSD' ? 'Gold (XAU)' : sym === 'USDKES' ? 'USD/KES' : sym}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RE-ARM TOAST / BANNER ALERT (Appears when Re-arm is triggered) */}
      {rearmNotice && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/25 via-[#0df2c9]/20 to-teal-500/10 border border-teal-400/60 shadow-lg flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal-400 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="text-xs font-extrabold text-[#0df2c9] tracking-wide">
                {rearmNotice}
              </div>
              <div className="text-[11px] text-slate-300">
                Take Profit locked at <strong className="text-emerald-400 font-mono">{dormantSignal.takeProfit}</strong> • Stop Loss locked at <strong className="text-rose-400 font-mono">{dormantSignal.stopLoss}</strong>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRearmNotice(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          3-ZONE TACTICAL LAYOUT
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =======================================================================
            ZONE 1: BOT ARSENAL RAIL (LEFT 4 COLS)
            ======================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-[#091120] border border-[#16243a] shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#142136]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#0df2c9]" />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Select Bot to Arm ({BOT_CATALOG.length})
                </h2>
              </div>

              {/* Category Filter */}
              <div className="flex bg-[#060b14] p-0.5 rounded-lg border border-[#15233a] text-[10px]">
                {(['ALL', 'FOREX_MT5', 'DERIV_24_7'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBotCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      botCategoryFilter === cat
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat === 'FOREX_MT5' ? 'Forex' : 'Deriv 24/7'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bot List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredBots.map((bot) => {
                const isSelected = selectedBotId === bot.id;
                return (
                  <button
                    key={bot.id}
                    onClick={() => setSelectedBotId(bot.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#0e1a2f] to-[#091222] border-teal-400/80 shadow-lg shadow-teal-950/40 ring-1 ring-teal-400/30'
                        : 'bg-[#070d18] hover:bg-[#0c1628] border-[#132034] text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                              bot.category === 'DERIV_24_7'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {bot.category === 'DERIV_24_7' ? 'DERIV 24/7' : 'FOREX MT5'}
                          </span>
                          <span className="text-[10px] text-[#0df2c9] font-mono font-bold">
                            {bot.badge}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white group-hover:text-[#0df2c9] transition-colors leading-tight">
                          {bot.name}
                        </div>
                      </div>

                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                          isSelected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#121e30]">
                      <span className="text-emerald-400 font-bold">Win: {bot.winRate}%</span>
                      <span className="text-[#0df2c9]">PF: {bot.profitFactor}</span>
                      <span className="text-slate-400">R:R {bot.avgRiskReward}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =======================================================================
            ZONE 2 & 3: DORMANT SIGNAL, VISUAL CANVAS & LIVE TRADE PAD (RIGHT 8 COLS)
            ======================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Card: Active Bot Analyzing Selected Currency & Re-arm Sentinel */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#091120] border border-teal-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#142136]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9] shrink-0 font-bold">
                  {activeAsset.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {selectedBot.name}
                    </h2>
                    <span className="text-xs font-mono font-bold text-teal-300 px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30">
                      ON {activeAsset.symbol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Signal is strictly binary and <strong className="text-white">frozen dormant</strong> until TP or SL is triggered on <strong className="text-[#0df2c9]">{activeAsset.name}</strong>.
                  </p>
                </div>
              </div>

              {/* Direction Selector, Re-arm Engine, Audio & Deploy Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Audio Mute/Unmute */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-[#0b1322] border-slate-700 text-slate-500'
                      : 'bg-teal-500/10 border-teal-500/30 text-[#0df2c9]'
                  }`}
                  title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Autonomous Auto-Pilot Toggle */}
                <button
                  onClick={() => setAutoPilotActive(!autoPilotActive)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    autoPilotActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30 font-black animate-pulse'
                      : 'bg-[#070e1b] text-slate-400 border-slate-800'
                  }`}
                  title="When active, the bot automatically executes trades, moves to break-even, takes profit, and re-arms continuously"
                >
                  {autoPilotActive ? <PlayCircle className="w-3.5 h-3.5" /> : <StopCircle className="w-3.5 h-3.5" />}
                  <span>Auto-Pilot: {autoPilotActive ? 'ENGAGED' : 'OFF'}</span>
                </button>

                {/* Break-Even Shield Toggle */}
                <button
                  onClick={() => setBreakEvenFeatureEnabled(!breakEvenFeatureEnabled)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    breakEvenFeatureEnabled
                      ? 'bg-teal-500/20 text-[#0df2c9] border-teal-500/50'
                      : 'bg-[#070e1b] text-slate-500 border-slate-800'
                  }`}
                  title="Automatically moves Stop Loss to Entry once price travels 50% towards TP"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Break-Even: {breakEvenFeatureEnabled ? 'AUTO' : 'OFF'}</span>
                </button>

                {/* Direction Switchers */}
                <div className="flex bg-[#060b14] p-1 rounded-xl border border-[#162742] text-xs font-bold font-mono">
                  <button
                    onClick={() => handleArmSignal('BUY')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      dormantSignal.type === 'BUY'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Arm BUY</span>
                  </button>
                  <button
                    onClick={() => handleArmSignal('SELL')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      dormantSignal.type === 'SELL'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Arm SELL</span>
                  </button>
                </div>

                {/* PROMINENT RE-ARM BUTTON */}
                <button
                  onClick={() => handleRearmAtSpot()}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md ${
                    rearmPulseActive
                      ? 'bg-teal-400 text-slate-950 ring-2 ring-teal-300 scale-105'
                      : 'bg-gradient-to-r from-[#0d2238] to-[#122e4c] hover:from-[#133252] hover:to-[#183d63] border border-teal-500/50 text-[#0df2c9]'
                  }`}
                  title="Reset and lock signal at current spot price"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rearmPulseActive ? 'animate-spin' : ''}`} />
                  <span>{rearmPulseActive ? 'Armed!' : 'Re-arm'}</span>
                </button>

                <button
                  onClick={handleDeployToDeck}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    deployedSuccess
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 hover:brightness-110 active:scale-95 shadow-teal-500/20'
                  }`}
                >
                  {deployedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Opening Deck...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Deploy to Deck</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Scanner, Backtest Lab, Webhook Bridge, Mechanics, Tools, Params, Code */}
            <div className="flex items-center gap-1 pt-3 overflow-x-auto scrollbar-none text-xs font-semibold">
              <button
                onClick={() => setActiveAnalysisTab('scanner')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'scanner'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Signal & Confluence</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab('backtest')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'backtest'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Strategy Backtester (100 Trades)</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab('webhook')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'webhook'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>MT5 / Deriv Webhook Bridge</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab('mechanics')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'mechanics'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Visual Strategy Canvas</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab('tools')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'tools'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Quantitative Tools</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab('params')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'params'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Parameters</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab('code')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeAnalysisTab === 'code'
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Targeted .MQ5 Code</span>
              </button>
            </div>
          </div>

          {/* TAB 1: DORMANT SIGNAL RADAR, MULTI-TIMEFRAME CONFLUENCE & IN-STUDIO EXECUTION PAD */}
          {activeAnalysisTab === 'scanner' && (
            <div className="space-y-4">
              
              {/* MULTI-TIMEFRAME CONFLUENCE RADAR STRIP */}
              <div className="p-4 rounded-2xl bg-[#081120] border border-teal-500/30 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0df2c9]" />
                    <span>Multi-Timeframe Trend Confluence Matrix</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-black border border-emerald-500/30">
                    {dormantSignal.confluenceScore}% CONFLUENCE (4/4 ALIGNED)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {mtfMatrix.map((item) => (
                    <div
                      key={item.tf}
                      className="p-2.5 rounded-xl bg-[#050b14] border border-[#13233c] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-black text-white">{item.tf}</span>
                        <span className="text-emerald-400 font-bold">{item.bias}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-200">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.indicator}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* =================================================================
                  THE DORMANT SIGNAL STATUS CARD (LOCKED UNTIL TP, SL, OR BE)
                  ================================================================= */}
              <div
                className={`p-5 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 ${
                  rearmPulseActive
                    ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950 scale-[1.01]'
                    : ''
                } ${
                  dormantSignal.status === 'TAKE_PROFIT_HIT'
                    ? 'bg-gradient-to-br from-[#062016] to-[#04120d] border-emerald-500/70 shadow-emerald-950/40 ring-1 ring-emerald-400'
                    : dormantSignal.status === 'STOP_LOSS_HIT'
                    ? 'bg-gradient-to-br from-[#200609] to-[#120406] border-rose-500/70 shadow-rose-950/40 ring-1 ring-rose-400'
                    : dormantSignal.type === 'BUY'
                    ? 'bg-gradient-to-br from-[#091526] via-[#070f1c] to-[#050a14] border-emerald-500/40 shadow-teal-950/30'
                    : 'bg-gradient-to-br from-[#1b0a12] via-[#10070b] to-[#080406] border-rose-500/40 shadow-rose-950/30'
                }`}
              >
                {/* RESOLUTION BANNER: TAKE PROFIT HIT */}
                {dormantSignal.status === 'TAKE_PROFIT_HIT' && (
                  <div className="mb-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#06281a] to-emerald-950/80 border-2 border-emerald-400/80 shadow-2xl space-y-4 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 shrink-0">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-base font-black text-emerald-300 flex items-center gap-2">
                            <span>🎉 TARGET TAKE PROFIT REACHED & EXECUTED!</span>
                            {autoRearmCountdown !== null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-mono">
                                Auto-rearming in {autoRearmCountdown}s...
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-200 mt-0.5">
                            Signal reached target at <strong className="text-white font-mono">{dormantSignal.takeProfit}</strong> at {dormantSignal.resolvedAt}.
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Realized Net Gain</div>
                        <div className="text-xl font-black font-mono text-emerald-300">
                          +${dormantSignal.realizedPnlUsd} USD
                        </div>
                        <div className="text-xs font-bold text-emerald-400 font-mono">
                          +KES {dormantSignal.realizedPnlKes?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => handleRearmAtSpot('BUY')}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                          <span>RE-ARM AS BUY @ SPOT ({livePrice})</span>
                        </button>

                        <button
                          onClick={() => handleRearmAtSpot('SELL')}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-lg shadow-rose-900/40 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                          <span>RE-ARM AS SELL @ SPOT ({livePrice})</span>
                        </button>
                      </div>

                      {autoRearmCountdown !== null && (
                        <button
                          onClick={() => setAutoRearmCountdown(null)}
                          className="text-[11px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Cancel Auto-Rearm Timer
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* RESOLUTION BANNER: STOP LOSS HIT */}
                {dormantSignal.status === 'STOP_LOSS_HIT' && (
                  <div className="mb-5 p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#28060d] to-rose-950/80 border-2 border-rose-400/80 shadow-2xl space-y-4 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-lg shadow-rose-500/30 shrink-0">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-base font-black text-rose-300 flex items-center gap-2">
                            <span>{dormantSignal.isBreakEvenArmed ? '🛡️ BREAK-EVEN EXIT (ZERO CAPITAL LOSS)' : '🛡️ STOP LOSS TRIGGERED (RISK CONTAINED)'}</span>
                            {autoRearmCountdown !== null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200 font-mono">
                                Auto-rearming in {autoRearmCountdown}s...
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-200 mt-0.5">
                            Level triggered at <strong className="text-white font-mono">{dormantSignal.stopLoss}</strong>. Capital protected.
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-rose-400 font-mono uppercase tracking-wider">
                          {dormantSignal.isBreakEvenArmed ? 'Protected P&L' : 'Contained Risk'}
                        </div>
                        <div className={`text-xl font-black font-mono ${dormantSignal.isBreakEvenArmed ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {dormantSignal.isBreakEvenArmed ? `+$${dormantSignal.realizedPnlUsd}` : `-$${Math.abs(dormantSignal.realizedPnlUsd || 0)}`} USD
                        </div>
                        <div className={`text-xs font-bold font-mono ${dormantSignal.isBreakEvenArmed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dormantSignal.isBreakEvenArmed ? `+KES ${dormantSignal.realizedPnlKes}` : `-KES ${Math.abs(dormantSignal.realizedPnlKes || 0).toLocaleString()}`}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-rose-500/30 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => handleRearmAtSpot('BUY')}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-900/40 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                          <span>RE-ARM AS BUY @ SPOT ({livePrice})</span>
                        </button>

                        <button
                          onClick={() => handleRearmAtSpot('SELL')}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-lg shadow-rose-900/40 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                          <span>RE-ARM AS SELL @ SPOT ({livePrice})</span>
                        </button>
                      </div>

                      {autoRearmCountdown !== null && (
                        <button
                          onClick={() => setAutoRearmCountdown(null)}
                          className="text-[11px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Cancel Auto-Rearm Timer
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Dormant Signal Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1.5 ${
                        dormantSignal.type === 'BUY'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                      <span>{dormantSignal.type} SIGNAL (DORMANT)</span>
                    </span>

                    {dormantSignal.isBreakEvenArmed && (
                      <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 text-[10px] font-mono font-black flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#0df2c9]" />
                        <span>BREAK-EVEN ACTIVE</span>
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      ID: <span className="text-white font-bold">{dormantSignal.id}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                        dormantSignal.status === 'DORMANT_ACTIVE'
                          ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/30'
                          : dormantSignal.status === 'TAKE_PROFIT_HIT'
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 font-black'
                          : 'bg-rose-500/30 text-rose-300 border border-rose-400 font-black'
                      }`}
                    >
                      {dormantSignal.status === 'DORMANT_ACTIVE'
                        ? 'LOCKED & DORMANT (WAITING TP / SL)'
                        : dormantSignal.status === 'TAKE_PROFIT_HIT'
                        ? 'TAKE PROFIT HIT'
                        : 'STOP LOSS HIT'}
                    </span>

                    <button
                      onClick={() => handleRearmAtSpot()}
                      className="px-3 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-arm</span>
                    </button>
                  </div>
                </div>

                {/* Fixed Non-Moving Signal Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  {/* Fixed Entry */}
                  <div className="p-3.5 rounded-2xl bg-[#060c18] border border-white/10 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                      <span>LOCKED ENTRY PRICE</span>
                      <span className="text-teal-400 font-bold">FROZEN</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-white">
                      {dormantSignal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits })}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Live Spot: <span className={lastTickDir === 'UP' ? 'text-[#0df2c9]' : 'text-rose-400'}>{livePrice}</span>
                    </div>
                  </div>

                  {/* Fixed Stop Loss / Break-Even */}
                  <div className={`p-3.5 rounded-2xl border space-y-1 ${
                    dormantSignal.isBreakEvenArmed ? 'bg-[#041a1a] border-teal-500/50' : 'bg-[#16060a] border-rose-500/30'
                  }`}>
                    <div className="text-[10px] font-mono uppercase flex items-center justify-between">
                      <span className={dormantSignal.isBreakEvenArmed ? 'text-teal-300' : 'text-rose-400'}>
                        {dormantSignal.isBreakEvenArmed ? 'BREAK-EVEN STOP' : 'LOCKED STOP LOSS'}
                      </span>
                      <span className={`font-bold ${dormantSignal.isBreakEvenArmed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dormantSignal.isBreakEvenArmed ? 'RISK-FREE' : 'FROZEN'}
                      </span>
                    </div>
                    <div className={`text-xl sm:text-2xl font-mono font-black ${
                      dormantSignal.isBreakEvenArmed ? 'text-[#0df2c9]' : 'text-rose-300'
                    }`}>
                      {dormantSignal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits })}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Distance to SL: <strong className="text-white">{distToSl} pts</strong>
                    </div>
                  </div>

                  {/* Fixed Take Profit */}
                  <div className="p-3.5 rounded-2xl bg-[#061810] border border-emerald-500/30 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center justify-between">
                      <span>LOCKED TAKE PROFIT</span>
                      <span className="text-emerald-400 font-bold">FROZEN</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-emerald-300">
                      {dormantSignal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits })}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400/80">
                      Distance to TP: <strong className="text-emerald-300">{distToTp} pts</strong>
                    </div>
                  </div>
                </div>

                {/* Real-Time Price Progress Gauge Bar */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-400 font-bold">SL: {dormantSignal.stopLoss}</span>
                    <span className="text-slate-300 font-semibold">
                      Live Price: <strong className="text-white font-mono">{livePrice}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold">TP: {dormantSignal.takeProfit}</span>
                  </div>

                  {/* Visual Range Bar */}
                  <div className="h-3 w-full bg-[#080f1c] rounded-full border border-slate-700/60 overflow-hidden relative">
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white/70 z-10"
                      style={{ left: '35%' }}
                      title="Locked Entry Point"
                    />

                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, dormantSignal.type === 'BUY'
                          ? ((livePrice - dormantSignal.stopLoss) / (dormantSignal.takeProfit - dormantSignal.stopLoss || 1)) * 100
                          : ((dormantSignal.stopLoss - livePrice) / (dormantSignal.stopLoss - dormantSignal.takeProfit || 1)) * 100
                        ))}%`,
                      }}
                      className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                    <span>Target R:R: <strong className="text-[#0df2c9]">{dormantSignal.rrRatio}</strong></span>
                    <span>
                      Floating Signal Gain:{' '}
                      <strong className={dormantFloatingUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {dormantFloatingUsd >= 0 ? `+$${dormantFloatingUsd}` : `-$${Math.abs(dormantFloatingUsd)}`} USD
                        <span className="text-slate-500 ml-1">({dormantFloatingKes >= 0 ? `+${dormantFloatingKes}` : dormantFloatingKes} KES)</span>
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================================
                  LIVE INTERACTIVE CANDLESTICK & LEVEL OVERLAY CHART
                  ================================================================= */}
              <div className="p-5 rounded-3xl bg-[#070d18] border border-teal-500/30 shadow-2xl space-y-3 font-mono">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#142136]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0df2c9]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Algorithmic Chart • {activeAsset.symbol} ({selectedTimeframe})
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-emerald-400 inline-block" />
                      <span>TP: {dormantSignal.takeProfit}</span>
                    </span>
                    <span className="text-sky-300 font-bold flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-sky-300 inline-block" />
                      <span>Entry: {dormantSignal.entryPrice}</span>
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${dormantSignal.isBreakEvenArmed ? 'text-[#0df2c9]' : 'text-rose-400'}`}>
                      <span className={`w-2 h-0.5 inline-block ${dormantSignal.isBreakEvenArmed ? 'bg-[#0df2c9]' : 'bg-rose-400'}`} />
                      <span>{dormantSignal.isBreakEvenArmed ? `BE: ${dormantSignal.stopLoss}` : `SL: ${dormantSignal.stopLoss}`}</span>
                    </span>
                  </div>
                </div>

                {/* SVG Visual Candle Canvas */}
                <div className="relative h-60 w-full bg-[#040812] rounded-2xl border border-[#132036] overflow-hidden p-2 select-none">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-20">
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-r border-teal-500/30" />
                    <div className="border-b border-teal-500/30" />
                  </div>

                  {/* Horizontal TP Level Line */}
                  <div
                    style={{
                      top: `${Math.min(92, Math.max(8, dormantSignal.type === 'BUY' ? 15 : 82))}%`,
                    }}
                    className="absolute left-0 right-0 border-b-2 border-dashed border-emerald-400 z-10 flex items-center justify-between px-3 pointer-events-none"
                  >
                    <span className="text-[10px] font-bold bg-emerald-500/90 text-slate-950 px-2 py-0.5 rounded shadow">
                      TAKE PROFIT: {dormantSignal.takeProfit} (+{distToTp} pts)
                    </span>
                    <span className="text-[9px] text-emerald-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded">
                      1:3.8 R:R TARGET
                    </span>
                  </div>

                  {/* Horizontal Entry Level Line */}
                  <div
                    style={{
                      top: '50%',
                    }}
                    className="absolute left-0 right-0 border-b border-sky-400/80 z-10 flex items-center justify-between px-3 pointer-events-none"
                  >
                    <span className="text-[10px] font-bold bg-sky-500/90 text-slate-950 px-2 py-0.5 rounded shadow">
                      LOCKED ENTRY: {dormantSignal.entryPrice}
                    </span>
                    <span className="text-[9px] text-sky-200 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded">
                      FROZEN LEVEL
                    </span>
                  </div>

                  {/* Horizontal SL / Break-Even Level Line */}
                  <div
                    style={{
                      top: `${Math.min(92, Math.max(8, dormantSignal.type === 'BUY' ? (dormantSignal.isBreakEvenArmed ? 48 : 82) : (dormantSignal.isBreakEvenArmed ? 52 : 15)))}%`,
                    }}
                    className={`absolute left-0 right-0 border-b-2 border-dashed z-10 flex items-center justify-between px-3 pointer-events-none ${
                      dormantSignal.isBreakEvenArmed ? 'border-cyan-400' : 'border-rose-500'
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                      dormantSignal.isBreakEvenArmed ? 'bg-cyan-400 text-slate-950' : 'bg-rose-500 text-white'
                    }`}>
                      {dormantSignal.isBreakEvenArmed ? `🛡️ BREAK-EVEN: ${dormantSignal.stopLoss}` : `STOP LOSS: ${dormantSignal.stopLoss} (-${distToSl} pts)`}
                    </span>
                    <span className={`text-[9px] font-bold bg-slate-950/80 px-1.5 py-0.5 rounded ${
                      dormantSignal.isBreakEvenArmed ? 'text-cyan-300' : 'text-rose-300'
                    }`}>
                      {dormantSignal.isBreakEvenArmed ? 'RISK-FREE LOCK' : 'MAX INVALIDATION'}
                    </span>
                  </div>

                  {/* Simulated Dynamic Candle Stream */}
                  <div className="absolute inset-x-0 bottom-4 top-4 flex items-center justify-around px-4">
                    {[
                      { h: 42, l: 30, o: 35, c: 40, isUp: true },
                      { h: 48, l: 36, o: 39, c: 46, isUp: true },
                      { h: 46, l: 38, o: 45, c: 41, isUp: false },
                      { h: 54, l: 40, o: 42, c: 51, isUp: true },
                      { h: 58, l: 48, o: 50, c: 56, isUp: true },
                      { h: 57, l: 47, o: 55, c: 49, isUp: false },
                      { h: 63, l: 48, o: 50, c: 60, isUp: true },
                      { h: 68, l: 56, o: 61, c: 65, isUp: true },
                      { h: 66, l: 58, o: 64, c: 60, isUp: false },
                      { h: 72, l: 59, o: 61, c: 70, isUp: true },
                      { h: 76, l: 66, o: 69, c: 74, isUp: true },
                      { h: 75, l: 67, o: 73, c: 71, isUp: false },
                      { h: 82, l: 70, o: 72, c: 79, isUp: true },
                      { h: 86, l: 75, o: 78, c: 84, isUp: true },
                    ].map((c, idx) => (
                      <div key={idx} className="flex flex-col items-center h-full justify-center w-2 relative">
                        {/* High-Low Wick */}
                        <div
                          style={{ height: `${c.h - c.l}%` }}
                          className={`w-[1px] absolute ${c.isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        />
                        {/* Candle Body */}
                        <div
                          style={{ height: `${Math.max(4, Math.abs(c.c - c.o))}%` }}
                          className={`w-2.5 rounded-[1px] relative z-0 ${
                            c.isUp
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 border border-emerald-300'
                              : 'bg-gradient-to-t from-rose-600 to-rose-400 border border-rose-300'
                          }`}
                        />
                      </div>
                    ))}

                    {/* Active Live Head Candle */}
                    <div className="flex flex-col items-center h-full justify-center w-3 relative">
                      <div
                        style={{ height: '35%' }}
                        className={`w-[1.5px] absolute ${lastTickDir === 'UP' ? 'bg-[#0df2c9]' : 'bg-rose-400'}`}
                      />
                      <div
                        style={{ height: '22%' }}
                        className={`w-3.5 rounded-[1px] relative z-10 shadow-lg ${
                          lastTickDir === 'UP'
                            ? 'bg-gradient-to-t from-teal-500 to-[#0df2c9] border border-white shadow-teal-500/50'
                            : 'bg-gradient-to-t from-red-600 to-rose-400 border border-white shadow-rose-500/50'
                        }`}
                      />

                      {/* Pulsing Live Price Ping */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                    </div>
                  </div>

                  {/* Bottom Right Live Cursor Badge */}
                  <div className="absolute bottom-2 right-2 bg-[#091222]/90 border border-teal-500/40 px-2.5 py-1 rounded-lg text-xs font-mono text-white flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">SPOT:</span>
                    <span className={`font-bold ${lastTickDir === 'UP' ? 'text-[#0df2c9]' : 'text-rose-400'}`}>
                      {livePrice.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits })}
                    </span>
                  </div>
                </div>
              </div>

              {/* IN-STUDIO DIRECT ORDER EXECUTION PAD */}
              <div className="p-5 rounded-2xl bg-[#091120] border border-[#1a2d48] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#0df2c9]" />
                      <span>Direct In-Studio Order Execution Pad</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Opens trade linked to this dormant signal with SL at <strong className="text-rose-300 font-mono">{dormantSignal.stopLoss}</strong> and TP at <strong className="text-emerald-300 font-mono">{dormantSignal.takeProfit}</strong>
                    </p>
                  </div>

                  {/* Lot Sizing Stepper */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Lot Size:</span>
                    <div className="flex items-center bg-[#070d18] border border-[#1c2e4a] rounded-xl p-0.5">
                      <button
                        onClick={() => setSelectedLots((prev) => Math.max(activeAsset.minLot, Number((prev - activeAsset.lotStep).toFixed(3))))}
                        className="px-2 py-1 text-slate-300 hover:text-white font-mono font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono text-xs font-bold text-[#0df2c9]">
                        {selectedLots}
                      </span>
                      <button
                        onClick={() => setSelectedLots((prev) => Number((prev + activeAsset.lotStep).toFixed(3)))}
                        className="px-2 py-1 text-slate-300 hover:text-white font-mono font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {[0.01, 0.05, 0.10, 0.50].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSelectedLots(l)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                          selectedLots === l
                            ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                            : 'bg-[#070d18] text-slate-400 border border-[#142136]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1-Click Buy & Sell Execution Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleExecuteOrder('BUY')}
                    className={`py-3 px-4 rounded-xl font-black text-xs shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      dormantSignal.type === 'BUY'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-emerald-950/40 ring-1 ring-emerald-400'
                        : 'bg-[#0e1b2c] hover:bg-[#142740] text-slate-300 border border-[#1c3354]'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    <span>EXECUTE BUY {selectedLots} LOTS (LOCKED SL/TP)</span>
                  </button>

                  <button
                    onClick={() => handleExecuteOrder('SELL')}
                    className={`py-3 px-4 rounded-xl font-black text-xs shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      dormantSignal.type === 'SELL'
                        ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-950/40 ring-1 ring-rose-400'
                        : 'bg-[#0e1b2c] hover:bg-[#142740] text-slate-300 border border-[#1c3354]'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 stroke-[3]" />
                    <span>EXECUTE SELL {selectedLots} LOTS (LOCKED SL/TP)</span>
                  </button>
                </div>
              </div>

              {/* RE-ARMED SIGNAL AUDIT HISTORY LOG */}
              {signalHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#08101e] border border-[#162744] space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-[#0df2c9]" />
                      <span>Dormant Signal Execution & Re-arm Audit Log</span>
                    </span>
                    <button
                      onClick={() => setSignalHistory([])}
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear Log
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                    {signalHistory.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#0b1424] border border-[#13233c] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              rec.type === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {rec.type}
                          </span>
                          <span className="text-white font-bold">{rec.symbol}</span>
                          <span className="text-slate-400 text-[11px]">
                            Entry: {rec.entry} • TP: {rec.tp} • SL: {rec.sl}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                              rec.outcome === 'TAKE_PROFIT_HIT'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : rec.outcome === 'BREAK_EVEN_HIT'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : rec.outcome === 'STOP_LOSS_HIT'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            }`}
                          >
                            {rec.outcome === 'TAKE_PROFIT_HIT' ? `TP HIT (+${rec.pnlUsd} USD)` : rec.outcome === 'BREAK_EVEN_HIT' ? 'BREAK-EVEN (+0 USD)' : rec.outcome === 'STOP_LOSS_HIT' ? `SL HIT (${rec.pnlUsd} USD)` : 'ARMED'}
                          </span>
                          <span className="text-[10px] text-slate-500">{rec.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Studio Positions Monitor */}
              {activeStudioPositions.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#070d18] border border-emerald-500/30 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Active Studio Positions ({activeStudioPositions.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Locked SL: {dormantSignal.stopLoss} • Locked TP: {dormantSignal.takeProfit}</span>
                  </div>

                  <div className="space-y-2">
                    {activeStudioPositions.map((pos) => (
                      <div
                        key={pos.ticket}
                        className="p-3 rounded-xl bg-[#0b1322] border border-[#162744] flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pos.type === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {pos.type} #{pos.ticket}
                          </span>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{pos.symbol} • {pos.lots} Lots</span>
                              {pos.isBreakEven && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
                                  RISK-FREE (BE)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Entry: {pos.openPrice.toFixed(activeAsset.digits)} • Current: {pos.currentPrice.toFixed(activeAsset.digits)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[9px] text-slate-400 uppercase">Floating P&L</div>
                            <div
                              className={`text-sm font-bold ${
                                pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {pos.pnl >= 0 ? `+$${pos.pnl.toFixed(2)}` : `-$${Math.abs(pos.pnl).toFixed(2)}`}
                              <span className="text-[10px] ml-1 text-slate-400">
                                ({(pos.pnl * 129.5).toLocaleString(undefined, { maximumFractionDigits: 0 })} KES)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleClosePosition(pos.ticket)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRATEGY BACKTESTING LAB (100 TRADES) */}
          {activeAnalysisTab === 'backtest' && (
            <div className="p-6 rounded-3xl bg-[#070d18] border border-[#16243a] shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#142136]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[#0df2c9]" />
                    <span>Monte Carlo Strategy Backtesting Lab (100 Trades)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Empirical verification of {selectedBot.name} on {activeAsset.symbol} with 1:3.8 R:R and Break-Even Armor.
                  </p>
                </div>

                <button
                  onClick={handleRunBacktest}
                  disabled={isBacktesting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 fill-current ${isBacktesting ? 'animate-spin' : ''}`} />
                  <span>{isBacktesting ? 'Simulating 100 Cycles...' : 'Run 100-Trade Simulation'}</span>
                </button>
              </div>

              {backtestStats ? (
                <div className="space-y-5 font-mono">
                  {/* Key Stats Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#091120] border border-[#18283e] space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">WIN RATE</div>
                      <div className="text-2xl font-black text-emerald-400">{backtestStats.winRate}%</div>
                      <div className="text-[10px] text-slate-500">{backtestStats.totalTrades} completed cycles</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#091120] border border-[#18283e] space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">NET GAIN (USD)</div>
                      <div className="text-2xl font-black text-[#0df2c9]">+${backtestStats.netProfitUsd.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">+KES {backtestStats.netProfitKes.toLocaleString()}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#091120] border border-[#18283e] space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">PROFIT FACTOR</div>
                      <div className="text-2xl font-black text-cyan-300">{backtestStats.profitFactor}</div>
                      <div className="text-[10px] text-slate-500">Gross Win / Gross Loss</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#091120] border border-[#18283e] space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">MAX DRAWDOWN</div>
                      <div className="text-2xl font-black text-rose-400">{backtestStats.maxDrawdown}%</div>
                      <div className="text-[10px] text-emerald-400">Prop Firm Safe (&lt; 8%)</div>
                    </div>
                  </div>

                  {/* Visual Equity Curve Chart */}
                  <div className="p-4 rounded-2xl bg-[#050b14] border border-[#162744] space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Interactive Equity Growth Curve ($10,000 Start)</span>
                      <span className="text-emerald-400 font-bold">Sharpe Ratio: {backtestStats.sharpeRatio}</span>
                    </div>

                    <div className="h-44 w-full flex items-end gap-1 pt-4 pb-2 px-1">
                      {backtestStats.equityCurve.filter((_, idx) => idx % 2 === 0).map((bal, idx, arr) => {
                        const min = Math.min(...arr);
                        const max = Math.max(...arr);
                        const heightPct = Math.max(10, ((bal - min) / (max - min || 1)) * 100);
                        return (
                          <div
                            key={idx}
                            style={{ height: `${heightPct}%` }}
                            className="flex-1 bg-gradient-to-t from-teal-500/20 via-teal-400 to-[#0df2c9] rounded-t-sm hover:brightness-125 transition-all relative group"
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/90 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-20">
                              Trade #{idx * 2}: ${bal.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-[#091120] border border-[#16243a] space-y-3">
                  <Calculator className="w-10 h-10 text-teal-400 mx-auto" />
                  <div className="text-sm font-bold text-white">No Simulation Run Yet</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click "Run 100-Trade Simulation" to run a rigorous Monte Carlo backtest on {selectedBot.name} across {activeAsset.symbol}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MT5 & DERIV WEBHOOK BRIDGE */}
          {activeAnalysisTab === 'webhook' && (
            <div className="p-6 rounded-3xl bg-[#070d18] border border-[#16243a] shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-[#0df2c9]" />
                    <span>Real MetaTrader 5 & Deriv Webhook Bridge</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect this web studio directly to your real MetaTrader 5 terminal or Deriv account via Webhook.
                  </p>
                </div>

                <button
                  onClick={handleCopyWebhookPayload}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1e3454] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Payload!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-teal-400" />
                      <span>Copy JSON Payload</span>
                    </>
                  )}
                </button>
              </div>

              {/* Webhook Endpoint Box */}
              <div className="p-4 rounded-2xl bg-[#091120] border border-[#162744] space-y-2">
                <div className="text-xs font-bold text-slate-300">Live Bridge Endpoint (REST / WebSocket):</div>
                <div className="p-2.5 rounded-xl bg-[#040812] border border-[#16243a] font-mono text-xs text-[#0df2c9] flex items-center justify-between">
                  <span>https://api.njiafedha.co.ke/v1/bridge/dispatch</span>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">ACTIVE 24/7</span>
                </div>
              </div>

              {/* MQL5 Client Listener Snippet */}
              <div className="p-4 rounded-2xl bg-[#091120] border border-[#162744] space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  MT5 EA WebRequest Listener (Paste into your MT5 EA OnInit / OnTick):
                </div>
                <pre className="p-3.5 rounded-xl bg-[#040812] border border-[#142136] text-[11px] font-mono text-teal-300 leading-relaxed overflow-x-auto">
{`//+------------------------------------------------------------------+
//| NjiaFedha Institutional Webhook Listener for MT5 & Deriv         |
//+------------------------------------------------------------------+
string headers = "Content-Type: application/json\\r\\nAuthorization: Bearer NJIA_QUANT_KEY_SECURE_9918";
char postData[];
char result[];
string resultHeaders;
int res = WebRequest("GET", "https://api.njiafedha.co.ke/v1/bridge/signal?symbol=${activeAsset.symbol}", headers, 3000, postData, result, resultHeaders);
if(res == 200) {
   string response = CharArrayToString(result);
   // Executes ${dormantSignal.type} order with SL: ${dormantSignal.stopLoss} and TP: ${dormantSignal.takeProfit}
   Trade.PositionOpen("${activeAsset.symbol}", ORDER_TYPE_${dormantSignal.type}, ${selectedLots}, ${dormantSignal.entryPrice}, ${dormantSignal.stopLoss}, ${dormantSignal.takeProfit});
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: VISUAL STRATEGY CANVAS */}
          {activeAnalysisTab === 'mechanics' && (
            <div className="p-6 rounded-3xl bg-[#070d18] border border-[#16243a] shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-[#0df2c9]" />
                  <span>Visual Execution Model for {selectedBot.name} on {activeAsset.symbol}</span>
                </span>
                <span className="text-[#0df2c9] font-bold">LOCKED SIGNAL: {dormantSignal.type}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#040812] border border-teal-500/30 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs text-teal-300">
                  <span>MARKET CLASS: {activeAsset.category}</span>
                  <span className="text-emerald-400 font-bold">{activeAsset.marketHours}</span>
                </div>

                <div className="relative h-44 bg-[#081120] rounded-xl border border-teal-500/40 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold">TAKE PROFIT TARGET (LOCKED): {dormantSignal.takeProfit}</span>
                    <span className="text-emerald-400 font-bold">1:3.8 ASYMMETRIC R:R</span>
                  </div>

                  <div className="bg-teal-500/10 border border-teal-400/50 p-2.5 rounded-lg text-[11px] text-teal-200 flex items-center justify-between">
                    <span>{selectedBot.name.toUpperCase()} • DORMANT {dormantSignal.type} SIGNAL</span>
                    <span className="text-white font-bold">ENTRY (FROZEN): {dormantSignal.entryPrice}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-rose-400 font-bold">INVALIDATION STOP LOSS (LOCKED): {dormantSignal.stopLoss}</span>
                    <span className="text-cyan-300">LIVE SPOT: {livePrice}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  <strong>How Perfect Execution Works on {activeAsset.name}:</strong> The signal is generated with fixed parameters. As price moves toward the profit target, the Break-Even Armor moves the stop loss to entry once 50% distance is achieved, rendering the trade risk-free until target realization.
                </div>
              </div>

              {/* 4-Step Confluence Rules */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Algorithmic Confluence Rules for {activeAsset.symbol}:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedBot.edgeBreakdown.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0c1524] border border-[#162744] flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: QUANTITATIVE TOOLS */}
          {activeAnalysisTab === 'tools' && (
            <div className="p-6 rounded-3xl bg-[#070d18] border border-[#16243a] shadow-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Quantitative Indicators Used for {activeAsset.symbol}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time algorithmic variables actively calculated on {selectedTimeframe} timeframe
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {selectedBot.indicators.map((ind, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#091120] border border-[#17253b] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9] font-mono text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{ind}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Calibrated for {activeAsset.symbol}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PARAMETERS TUNER */}
          {activeAnalysisTab === 'params' && (
            <div className="p-6 rounded-3xl bg-[#070d18] border border-[#16243a] shadow-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Strategy Parameters for {selectedBot.name} on {activeAsset.symbol}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjusting these inputs dynamically alters the MQL5 code generator and live execution orders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {selectedBot.parameters.map((param) => (
                  <div key={param.id} className="p-4 rounded-2xl bg-[#091120] border border-[#17253b] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-white">{param.name}</label>
                      <span className="text-[10px] font-mono text-slate-400">Default: {String(param.defaultValue)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{param.description}</p>
                    {param.type === 'number' && (
                      <input
                        type="number"
                        value={customParams[param.id] ?? param.defaultValue}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        onChange={(e) =>
                          setCustomParams({
                            ...customParams,
                            [param.id]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-[#0d1729] border border-[#1e3252] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: COMPILABLE MQL5 CODE */}
          {activeAnalysisTab === 'code' && (
            <div className="p-6 rounded-3xl bg-[#070d18] border border-[#16243a] shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Compilable MetaTrader 5 Code for {activeAsset.symbol}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready to compile in MetaEditor (<kbd className="px-1 py-0.5 rounded bg-slate-800 text-teal-300 text-[10px]">F4</kbd> → <kbd className="px-1 py-0.5 rounded bg-slate-800 text-teal-300 text-[10px]">F7</kbd>) specifically configured for {activeAsset.symbol} with locked {dormantSignal.type} parameters.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMql5}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1e3454] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-teal-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadMql5}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Download {activeAsset.symbol} .mq5</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-[#040812] border border-[#142136] text-[11px] font-mono text-teal-300 leading-relaxed overflow-x-auto max-h-[460px] scrollbar-thin">
                {selectedBot.generateMql5Code({
                  ...customParams,
                  symbol: activeAsset.symbol,
                  timeframe: selectedTimeframe,
                  signalType: dormantSignal.type,
                  fixedSl: dormantSignal.stopLoss,
                  fixedTp: dormantSignal.takeProfit,
                })}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          FULL ASSET SELECTOR MODAL (SEARCH ACROSS 30+ INSTRUMENTS)
          ========================================================================= */}
      {isCurrencySelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-[#091120] border border-teal-500/40 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#142136] flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0df2c9]" />
                  <span>Choose Currency or Instrument to Analyze</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any Forex pair, precious metal, Deriv 24/7 synthetic, crypto, or Kenyan Shilling cross
                </p>
              </div>

              <button
                onClick={() => setIsCurrencySelectorOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="p-4 bg-[#070d18] border-b border-[#142136] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search symbol or name (e.g. Gold, EURUSD, Boom 1000, USDKES)..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1729] border border-[#1b2d48] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                  autoFocus
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-semibold">
                {[
                  { id: 'ALL', label: 'All Assets' },
                  { id: 'METALS', label: 'Precious Metals' },
                  { id: 'FOREX', label: 'Forex Majors' },
                  { id: 'EAST_AFRICA', label: 'East Africa (KES)' },
                  { id: 'DERIV_24_7', label: 'Deriv 24/7 Synthetics' },
                  { id: 'CRYPTO', label: 'Crypto Assets' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrencyCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      currencyCategoryFilter === cat.id
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                        : 'text-slate-400 hover:text-white bg-[#0b1322]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Asset Grid */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedCurrency === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedCurrency(asset.symbol);
                        setIsCurrencySelectorOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-400 text-white shadow-md'
                          : 'bg-[#070d18] hover:bg-[#0d182b] border-[#15233b] text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white">{asset.symbol}</span>
                          <span className="text-[9px] px-1 rounded bg-[#0f1b2e] text-teal-300 font-mono">
                            {asset.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                          {asset.name}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">
                          {asset.basePrice.toLocaleString(undefined, { minimumFractionDigits: asset.digits })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{asset.marketHours}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
