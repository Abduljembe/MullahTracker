import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Zap,
  Info,
  CheckCircle2,
  Crosshair,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';

export interface SentimentAsset {
  symbol: string;
  name: string;
  category: 'MAJORS' | 'CROSSES' | 'METALS' | 'INDICES' | 'EXOTICS';
  retailLongPct: number;
  retailShortPct: number;
  change24h: number;
  currentPrice: number;
  institutionalBias: 'STRONG FADE (SHORT)' | 'STRONG FADE (BUY)' | 'BALANCED / NEUTRAL';
  trapWarning: string;
  stopLossClusterHigh: number;
  stopLossClusterLow: number;
  totalPositionsSampled: string;
  decimals: number;
}

export const ALL_SENTIMENT_ASSETS: SentimentAsset[] = [
  // --- METALS & COMMODITIES ---
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'METALS',
    retailLongPct: 82,
    retailShortPct: 18,
    change24h: 0.71,
    currentPrice: 4089.08,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Extreme Retail Long Crowding. Institutions have primed Sell-Side Liquidity sweeps below 4,057 to trigger retail stops before any true upside continuation.',
    stopLossClusterHigh: 4148.50,
    stopLossClusterLow: 4055.00,
    totalPositionsSampled: '48,290 retail lots',
    decimals: 2,
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    category: 'METALS',
    retailLongPct: 78,
    retailShortPct: 22,
    change24h: 0.85,
    currentPrice: 34.25,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Retail crowd buying late breakouts. High risk of a fast liquidity shakeout beneath 33.70.',
    stopLossClusterHigh: 34.95,
    stopLossClusterLow: 33.65,
    totalPositionsSampled: '19,400 retail lots',
    decimals: 2,
  },
  {
    symbol: 'WTI/USD',
    name: 'WTI Crude Oil',
    category: 'METALS',
    retailLongPct: 44,
    retailShortPct: 56,
    change24h: 1.15,
    currentPrice: 78.40,
    institutionalBias: 'BALANCED / NEUTRAL',
    trapWarning: 'Slight retail short bias. Institutional order flow driven primarily by Middle East headlines and inventory draws.',
    stopLossClusterHigh: 79.80,
    stopLossClusterLow: 76.90,
    totalPositionsSampled: '15,800 retail lots',
    decimals: 2,
  },

  // --- FOREX MAJORS ---
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'MAJORS',
    retailLongPct: 34,
    retailShortPct: 66,
    change24h: -0.10,
    currentPrice: 1.1217,
    institutionalBias: 'STRONG FADE (BUY)',
    trapWarning: 'Heavy Retail Short consensus. Institutional market makers targeting Buy-Side Liquidity above 1.1270 to squeeze retail breakout shorts.',
    stopLossClusterHigh: 1.1275,
    stopLossClusterLow: 1.1190,
    totalPositionsSampled: '32,150 retail lots',
    decimals: 4,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'MAJORS',
    retailLongPct: 41,
    retailShortPct: 59,
    change24h: 0.15,
    currentPrice: 1.3452,
    institutionalBias: 'STRONG FADE (BUY)',
    trapWarning: 'Moderate Short imbalance. Potential squeeze of retail shorts during London/NY overlap session.',
    stopLossClusterHigh: 1.3520,
    stopLossClusterLow: 1.3380,
    totalPositionsSampled: '24,800 retail lots',
    decimals: 4,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'MAJORS',
    retailLongPct: 74,
    retailShortPct: 26,
    change24h: -0.32,
    currentPrice: 157.79,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Retail buying dips into resistance. High probability of BoJ jawboning liquidity sweep downward.',
    stopLossClusterHigh: 158.40,
    stopLossClusterLow: 156.80,
    totalPositionsSampled: '29,400 retail lots',
    decimals: 2,
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    category: 'MAJORS',
    retailLongPct: 68,
    retailShortPct: 32,
    change24h: 0.05,
    currentPrice: 0.8920,
    institutionalBias: 'BALANCED / NEUTRAL',
    trapWarning: 'Retail long tilt. Swiss National Bank reserve intervention risk elevated near 0.8950 resistance.',
    stopLossClusterHigh: 0.8960,
    stopLossClusterLow: 0.8890,
    totalPositionsSampled: '11,200 retail lots',
    decimals: 4,
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'MAJORS',
    retailLongPct: 28,
    retailShortPct: 72,
    change24h: -0.15,
    currentPrice: 1.3780,
    institutionalBias: 'STRONG FADE (BUY)',
    trapWarning: 'Heavy retail selling into oil rallies. Prime institutional accumulation setup targeting 1.3830 stops.',
    stopLossClusterHigh: 1.3835,
    stopLossClusterLow: 1.3740,
    totalPositionsSampled: '18,500 retail lots',
    decimals: 4,
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'MAJORS',
    retailLongPct: 62,
    retailShortPct: 38,
    change24h: 0.20,
    currentPrice: 0.6580,
    institutionalBias: 'BALANCED / NEUTRAL',
    trapWarning: 'Moderate long bias. Commodity currency flows dependent on Chinese stimulus updates.',
    stopLossClusterHigh: 0.6630,
    stopLossClusterLow: 0.6540,
    totalPositionsSampled: '14,300 retail lots',
    decimals: 4,
  },

  // --- FOREX CROSSES ---
  {
    symbol: 'EUR/JPY',
    name: 'Euro / Japanese Yen',
    category: 'CROSSES',
    retailLongPct: 79,
    retailShortPct: 21,
    change24h: -0.45,
    currentPrice: 177.00,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Retail carry-trade longs trapped near historic highs. High probability of violent liquidation cascading down to 175.50.',
    stopLossClusterHigh: 178.10,
    stopLossClusterLow: 175.80,
    totalPositionsSampled: '21,900 retail lots',
    decimals: 2,
  },
  {
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    category: 'CROSSES',
    retailLongPct: 76,
    retailShortPct: 24,
    change24h: -0.20,
    currentPrice: 212.25,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Retail crowd refusing to sell the dragon. Institutional order book primed for rapid 150-pip stop cascades.',
    stopLossClusterHigh: 213.70,
    stopLossClusterLow: 210.80,
    totalPositionsSampled: '26,400 retail lots',
    decimals: 2,
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    category: 'CROSSES',
    retailLongPct: 47,
    retailShortPct: 53,
    change24h: -0.05,
    currentPrice: 0.8338,
    institutionalBias: 'BALANCED / NEUTRAL',
    trapWarning: 'Balanced retail distribution. Pure technical play within 0.8320 - 0.8360 range.',
    stopLossClusterHigh: 0.8375,
    stopLossClusterLow: 0.8315,
    totalPositionsSampled: '9,800 retail lots',
    decimals: 4,
  },

  // --- INDICES ---
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    category: 'INDICES',
    retailLongPct: 76,
    retailShortPct: 24,
    change24h: 0.85,
    currentPrice: 26954.00,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Euphoric retail call-buying. Smart money distributing into high-volume liquidity pools.',
    stopLossClusterHigh: 27150.00,
    stopLossClusterLow: 26780.00,
    totalPositionsSampled: '18,920 retail contracts',
    decimals: 2,
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average',
    category: 'INDICES',
    retailLongPct: 48,
    retailShortPct: 52,
    change24h: 0.22,
    currentPrice: 43810.00,
    institutionalBias: 'BALANCED / NEUTRAL',
    trapWarning: 'Equilibrium zone. No extreme retail crowding detected; follow pure technical price action.',
    stopLossClusterHigh: 44100.00,
    stopLossClusterLow: 43500.00,
    totalPositionsSampled: '14,200 retail contracts',
    decimals: 2,
  },
];

interface RetailSentimentDeskProps {
  currentTicker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export const RetailSentimentDesk: React.FC<RetailSentimentDeskProps> = ({
  currentTicker = 'XAU/USD',
  onSelectTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentTicker);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MAJORS' | 'CROSSES' | 'METALS' | 'INDICES'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Simulator: Lets trader slide retail crowding and see how smart money trap levels change
  const [crowdingMultiplier, setCrowdingMultiplier] = useState<number>(0);

  useEffect(() => {
    if (currentTicker) {
      setSelectedSymbol(currentTicker);
    }
  }, [currentTicker]);

  const filteredAssets = useMemo(() => {
    return ALL_SENTIMENT_ASSETS.filter((a) => {
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchSearch =
        a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  const selectedAsset = useMemo(() => {
    return (
      ALL_SENTIMENT_ASSETS.find(
        (a) =>
          a.symbol === selectedSymbol ||
          a.symbol.replace('/', '') === selectedSymbol.replace('/', '')
      ) || ALL_SENTIMENT_ASSETS[0]
    );
  }, [selectedSymbol]);

  // Simulated effective Long % based on interactive crowding slider
  const effectiveLongPct = useMemo(() => {
    const raw = selectedAsset.retailLongPct + crowdingMultiplier;
    return Math.min(95, Math.max(5, raw));
  }, [selectedAsset.retailLongPct, crowdingMultiplier]);

  const effectiveShortPct = 100 - effectiveLongPct;

  const dynamicTrapStatus = useMemo(() => {
    if (effectiveLongPct >= 75) {
      return {
        bias: 'EXTREME RETAIL LONG CROWDING (FADE SHORT)',
        badge: 'SELL-SIDE SWEEP RISK ⚠️',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        message: 'Over 75% of retail accounts are Long. Smart money market makers are actively absorbing liquidity and preparing a swift breakdown to wipe out retail stop losses.',
      };
    }
    if (effectiveShortPct >= 75) {
      return {
        bias: 'EXTREME RETAIL SHORT CROWDING (FADE BUY)',
        badge: 'BUY-SIDE SQUEEZE RISK ⚠️',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
        message: 'Over 75% of retail accounts are Short. Institutional algorithms will trigger a violent short squeeze above previous swing highs.',
      };
    }
    return {
      bias: 'BALANCED RETAIL EQUILIBRIUM',
      badge: 'NO CROWD BIAS',
      color: 'text-teal-400 bg-teal-950/60 border-teal-500/40',
      message: 'Retail positioning is reasonably balanced (within 40-60%). Institutional order hunting risk is low; follow higher-timeframe technical structure.',
    };
  }, [effectiveLongPct, effectiveShortPct]);

  const handleCopy = (val: number, key: string) => {
    const formatted = val.toLocaleString(undefined, {
      minimumFractionDigits: selectedAsset.decimals,
      maximumFractionDigits: selectedAsset.decimals,
    });
    navigator.clipboard.writeText(formatted);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: selectedAsset.decimals,
      maximumFractionDigits: selectedAsset.decimals,
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Retail vs. Institutional Sentiment & Order Book Ratio
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                ALL PAIRS ({ALL_SENTIMENT_ASSETS.length})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              When 75%+ of retail traders pile into one direction, institutional market makers hunt their stop clusters. Trade with the smart money, not the crowd.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCrowdingMultiplier(0)}
          className="px-2.5 py-1.5 rounded-xl bg-[#0e192c] hover:bg-[#14233a] border border-[#1b345b] text-slate-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto"
          title="Reset sentiment simulator to live broker readings"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0df2c9]" />
          <span>Reset Sim</span>
        </button>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {(['ALL', 'MAJORS', 'CROSSES', 'METALS', 'INDICES'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 font-bold shadow-sm'
                  : 'bg-[#09111e] text-slate-400 hover:text-white border-[#182942]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pair (e.g. JPY, XAU, GBP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#08101d] border border-[#1b2f4c] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Horizontal Asset Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredAssets.map((item) => {
          const isSelected = item.symbol === selectedAsset.symbol;
          const isExtreme = item.retailLongPct >= 75 || item.retailShortPct >= 75;
          return (
            <button
              key={item.symbol}
              onClick={() => {
                setSelectedSymbol(item.symbol);
                setCrowdingMultiplier(0);
                if (onSelectTicker) onSelectTicker(item.symbol);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                isSelected
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)] font-bold'
                  : 'bg-[#09111e] hover:bg-[#0e1a2f] text-slate-300 border-[#182942]'
              }`}
            >
              <span>{item.symbol}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  item.retailLongPct > 50
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {item.retailLongPct}% L
              </span>
              {isExtreme && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Asset Focus Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#08101d] border border-[#1b3050] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14233a] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{selectedAsset.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">({selectedAsset.name})</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedAsset.category}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Sampled Broker Order Book: <strong className="text-slate-200">{selectedAsset.totalPositionsSampled}</strong>
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border self-start sm:self-auto ${dynamicTrapStatus.color}`}>
            {dynamicTrapStatus.badge}
          </span>
        </div>

        {/* Interactive Crowding Shift Slider */}
        <div className="p-3.5 rounded-xl bg-[#060c18] border border-[#172740] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Interactive Retail Sentiment Simulator:</span>
            </span>
            <span className="text-purple-300 font-bold">
              {crowdingMultiplier >= 0 ? '+' : ''}{crowdingMultiplier}% Crowding Shift
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="2"
            value={crowdingMultiplier}
            onChange={(e) => setCrowdingMultiplier(parseInt(e.target.value, 10))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>More Retail Selling (-30%)</span>
            <span>Live Broker Baseline (0%)</span>
            <span>More Retail Buying (+30%)</span>
          </div>
        </div>

        {/* Visual Bar Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              RETAIL LONG: {effectiveLongPct}%
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              RETAIL SHORT: {effectiveShortPct}%
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-[#1e3458] p-0.5">
            <div
              style={{ width: `${effectiveLongPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
            <div
              style={{ width: `${effectiveShortPct}%` }}
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            />
          </div>
        </div>

        {/* Institutional Liquidity Trap Warning */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block font-mono">
              Smart Money Order Book Analysis
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {dynamicTrapStatus.message}
            </p>
          </div>
        </div>

        {/* Clickable Liquidity Pools & Stop Clusters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleCopy(selectedAsset.stopLossClusterHigh, 'bsl')}
            className="p-3 rounded-lg bg-[#0a1526] border border-[#172d4c] hover:border-emerald-500/40 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Buy-Side Stop Clustered (BSL):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">
                  {formatPrice(selectedAsset.stopLossClusterHigh)}
                </span>
                {copiedKey === 'bsl' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Retail shorts have protective buy-stops clustered here. Market makers wick into this level to sweep liquidity.
            </span>
          </button>

          <button
            onClick={() => handleCopy(selectedAsset.stopLossClusterLow, 'ssl')}
            className="p-3 rounded-lg bg-[#0a1526] border border-[#172d4c] hover:border-rose-500/40 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Sell-Side Stop Clustered (SSL):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-400 font-bold">
                  {formatPrice(selectedAsset.stopLossClusterLow)}
                </span>
                {copiedKey === 'ssl' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400" />
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Retail longs placed stops beneath this swing low. Prime target for institutional accumulation before an upside run.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
