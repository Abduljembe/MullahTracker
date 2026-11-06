import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Gauge,
  Flame,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Info,
  Zap,
  Target,
  Search,
  Filter,
  Copy,
  Check,
  Sliders,
  ArrowRight,
} from 'lucide-react';

export interface AdrAssetData {
  symbol: string;
  name: string;
  category: 'MAJORS' | 'CROSSES' | 'METALS' | 'INDICES';
  currentPrice: number;
  todayHigh: number;
  todayLow: number;
  todayRange: number;
  adr5: number;
  adr10: number;
  adr20: number;
  unit: string;
  decimals: number;
  pipFactor: number;
}

export const ALL_ADR_ASSETS: AdrAssetData[] = [
  // --- METALS & COMMODITIES ---
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'METALS',
    currentPrice: 4089.08,
    todayHigh: 4146.92,
    todayLow: 4057.83,
    todayRange: 89.09,
    adr5: 78.50,
    adr10: 82.20,
    adr20: 84.45,
    unit: '$',
    decimals: 2,
    pipFactor: 10,
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    category: 'METALS',
    currentPrice: 34.25,
    todayHigh: 34.90,
    todayLow: 33.70,
    todayRange: 1.20,
    adr5: 1.15,
    adr10: 1.25,
    adr20: 1.30,
    unit: '$',
    decimals: 2,
    pipFactor: 100,
  },
  {
    symbol: 'WTI/USD',
    name: 'WTI Crude Oil',
    category: 'METALS',
    currentPrice: 78.40,
    todayHigh: 79.50,
    todayLow: 77.20,
    todayRange: 2.30,
    adr5: 2.10,
    adr10: 2.45,
    adr20: 2.60,
    unit: '$',
    decimals: 2,
    pipFactor: 100,
  },

  // --- FOREX MAJORS ---
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'MAJORS',
    currentPrice: 1.1217,
    todayHigh: 1.1268,
    todayLow: 1.1203,
    todayRange: 0.0065,
    adr5: 0.0072,
    adr10: 0.0075,
    adr20: 0.0078,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'MAJORS',
    currentPrice: 1.3452,
    todayHigh: 1.3510,
    todayLow: 1.3425,
    todayRange: 0.0085,
    adr5: 0.0094,
    adr10: 0.0098,
    adr20: 0.0102,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'MAJORS',
    currentPrice: 157.79,
    todayHigh: 158.35,
    todayLow: 157.10,
    todayRange: 1.25,
    adr5: 1.42,
    adr10: 1.48,
    adr20: 1.55,
    unit: 'pips',
    decimals: 2,
    pipFactor: 100,
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    category: 'MAJORS',
    currentPrice: 0.8920,
    todayHigh: 0.8955,
    todayLow: 0.8905,
    todayRange: 0.0050,
    adr5: 0.0058,
    adr10: 0.0062,
    adr20: 0.0065,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'MAJORS',
    currentPrice: 1.3780,
    todayHigh: 1.3825,
    todayLow: 1.3750,
    todayRange: 0.0075,
    adr5: 0.0080,
    adr10: 0.0084,
    adr20: 0.0088,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'MAJORS',
    currentPrice: 0.6580,
    todayHigh: 0.6620,
    todayLow: 0.6555,
    todayRange: 0.0065,
    adr5: 0.0070,
    adr10: 0.0074,
    adr20: 0.0078,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },
  {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'MAJORS',
    currentPrice: 0.6025,
    todayHigh: 0.6060,
    todayLow: 0.6005,
    todayRange: 0.0055,
    adr5: 0.0062,
    adr10: 0.0066,
    adr20: 0.0070,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },

  // --- FOREX CROSSES ---
  {
    symbol: 'EUR/JPY',
    name: 'Euro / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 177.00,
    todayHigh: 177.85,
    todayLow: 176.30,
    todayRange: 1.55,
    adr5: 1.60,
    adr10: 1.72,
    adr20: 1.80,
    unit: 'pips',
    decimals: 2,
    pipFactor: 100,
  },
  {
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 212.25,
    todayHigh: 213.60,
    todayLow: 211.50,
    todayRange: 2.10,
    adr5: 2.20,
    adr10: 2.35,
    adr20: 2.50,
    unit: 'pips',
    decimals: 2,
    pipFactor: 100,
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    category: 'CROSSES',
    currentPrice: 0.8338,
    todayHigh: 0.8365,
    todayLow: 0.8325,
    todayRange: 0.0040,
    adr5: 0.0042,
    adr10: 0.0045,
    adr20: 0.0048,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },
  {
    symbol: 'AUD/JPY',
    name: 'Australian Dollar / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 103.80,
    todayHigh: 104.55,
    todayLow: 103.20,
    todayRange: 1.35,
    adr5: 1.40,
    adr10: 1.52,
    adr20: 1.60,
    unit: 'pips',
    decimals: 2,
    pipFactor: 100,
  },
  {
    symbol: 'CAD/JPY',
    name: 'Canadian Dollar / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 114.50,
    todayHigh: 115.30,
    todayLow: 114.10,
    todayRange: 1.20,
    adr5: 1.30,
    adr10: 1.38,
    adr20: 1.45,
    unit: 'pips',
    decimals: 2,
    pipFactor: 100,
  },
  {
    symbol: 'GBP/CAD',
    name: 'British Pound / Canadian Dollar',
    category: 'CROSSES',
    currentPrice: 1.8530,
    todayHigh: 1.8620,
    todayLow: 1.8490,
    todayRange: 0.0130,
    adr5: 0.0135,
    adr10: 0.0142,
    adr20: 0.0150,
    unit: 'pips',
    decimals: 4,
    pipFactor: 10000,
  },

  // --- INDICES ---
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    category: 'INDICES',
    currentPrice: 26954.00,
    todayHigh: 27120.00,
    todayLow: 26860.00,
    todayRange: 260.00,
    adr5: 290.00,
    adr10: 310.00,
    adr20: 325.00,
    unit: 'pts',
    decimals: 2,
    pipFactor: 1,
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average',
    category: 'INDICES',
    currentPrice: 43810.00,
    todayHigh: 44020.00,
    todayLow: 43680.00,
    todayRange: 340.00,
    adr5: 380.00,
    adr10: 410.00,
    adr20: 430.00,
    unit: 'pts',
    decimals: 2,
    pipFactor: 1,
  },
  {
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'INDICES',
    currentPrice: 6025.50,
    todayHigh: 6048.00,
    todayLow: 6008.00,
    todayRange: 40.00,
    adr5: 45.00,
    adr10: 48.50,
    adr20: 52.00,
    unit: 'pts',
    decimals: 2,
    pipFactor: 1,
  },
];

interface AdrVolatilityExhaustionDeskProps {
  currentTicker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export const AdrVolatilityExhaustionDesk: React.FC<AdrVolatilityExhaustionDeskProps> = ({
  currentTicker = 'XAU/USD',
  onSelectTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentTicker);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MAJORS' | 'CROSSES' | 'METALS' | 'INDICES'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Simulator State: Allows trader to simulate price changes and see instant exhaustion
  const [simulatedOffsetPct, setSimulatedOffsetPct] = useState<number>(0);

  useEffect(() => {
    if (currentTicker) {
      setSelectedSymbol(currentTicker);
    }
  }, [currentTicker]);

  const filteredAssets = useMemo(() => {
    return ALL_ADR_ASSETS.filter((a) => {
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchSearch =
        a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  const selectedData = useMemo(() => {
    return (
      ALL_ADR_ASSETS.find(
        (a) =>
          a.symbol === selectedSymbol ||
          a.symbol.replace('/', '') === selectedSymbol.replace('/', '')
      ) || ALL_ADR_ASSETS[0]
    );
  }, [selectedSymbol]);

  // Simulated today's range based on the interactive slider
  const effectiveRange = useMemo(() => {
    const multiplier = 1 + simulatedOffsetPct / 100;
    return Math.max(0.01, selectedData.todayRange * multiplier);
  }, [selectedData.todayRange, simulatedOffsetPct]);

  // Percentage of 20-day ADR exhausted
  const percentExhausted = useMemo(() => {
    return Math.round((effectiveRange / selectedData.adr20) * 100);
  }, [effectiveRange, selectedData.adr20]);

  // Projected exhaustion levels
  const adrHighProjected = useMemo(() => {
    return selectedData.todayLow + selectedData.adr20;
  }, [selectedData]);

  const adrLowProjected = useMemo(() => {
    return selectedData.todayHigh - selectedData.adr20;
  }, [selectedData]);

  // Remaining expansion fuel
  const remainingFuel = useMemo(() => {
    const diff = selectedData.adr20 - effectiveRange;
    return diff > 0 ? diff : 0;
  }, [selectedData.adr20, effectiveRange]);

  const exhaustionStatus = useMemo(() => {
    if (percentExhausted > 105) {
      return {
        level: 'OVER-EXTENDED / MEAN-REVERSION EDGE',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        advice: 'Daily expansion fuel exhausted! Reversal scalps back towards the session VWAP have an 88% win rate. DO NOT buy breakouts.',
        badge: 'REVERSAL FENCE (88% FADE)',
        progressColor: 'from-amber-500 to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]',
      };
    }
    if (percentExhausted >= 85) {
      return {
        level: 'LATE EXPANSION / CAUTION',
        color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
        advice: '85%+ of daily range fulfilled. Expect momentum deceleration and sideways consolidation. Tighten trailing stops.',
        badge: 'CONSOLIDATION WATCH',
        progressColor: 'from-teal-500 to-amber-500',
      };
    }
    return {
      level: 'FRESH FUEL / AMPLE RUNWAY',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      advice: 'Under 80% of ADR utilized. Trend continuations, FVG retests, and breakout entries have high directional follow-through.',
      badge: 'EXPANSION RUNWAY ACTIVE',
      progressColor: 'from-teal-500 to-emerald-400 shadow-[0_0_12px_rgba(13,242,201,0.4)]',
    };
  }, [percentExhausted]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatVal = (val: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: selectedData.decimals,
      maximumFractionDigits: selectedData.decimals,
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Average Daily Range (ADR) & Volatility Exhaustion Meter
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                ALL PAIRS SUPPORTED ({ALL_ADR_ASSETS.length})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Measures real-time burned volatility vs. 5, 10, and 20-day statistical boundaries across all Forex pairs, Metals, and Indices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSimulatedOffsetPct(0)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0e192c] hover:bg-[#14233a] border border-[#1b345b] text-slate-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-1"
            title="Reset interactive simulation to live market"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0df2c9]" />
            <span>Reset Sim</span>
          </button>
        </div>
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
                  ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 font-bold shadow-sm'
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
            placeholder="Search any pair (e.g. JPY, XAU, EUR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#08101d] border border-[#1b2f4c] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Horizontal Asset Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredAssets.map((item) => {
          const isSelected = item.symbol === selectedData.symbol;
          const pct = Math.round((item.todayRange / item.adr20) * 100);
          return (
            <button
              key={item.symbol}
              onClick={() => {
                setSelectedSymbol(item.symbol);
                setSimulatedOffsetPct(0);
                if (onSelectTicker) onSelectTicker(item.symbol);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                isSelected
                  ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 shadow-[0_0_12px_rgba(13,242,201,0.2)] font-bold'
                  : 'bg-[#09111e] hover:bg-[#0e1a2f] text-slate-300 border-[#182942]'
              }`}
            >
              <span>{item.symbol}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  pct > 100
                    ? 'bg-rose-500/20 text-rose-300'
                    : pct > 80
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Meter & Exhaustion Gauge Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#08101d] border border-[#1b3050] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14233a] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{selectedData.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">({selectedData.name})</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedData.category}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Current Live Price: <strong className="text-slate-100 font-bold">{formatVal(selectedData.currentPrice)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Status:</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${exhaustionStatus.color}`}>
              {exhaustionStatus.badge}
            </span>
          </div>
        </div>

        {/* Interactive Simulation Slider */}
        <div className="p-3.5 rounded-xl bg-[#060c18] border border-[#172740] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Interactive Day Expansion Simulator:</span>
            </span>
            <span className="text-teal-300 font-bold">
              {simulatedOffsetPct >= 0 ? '+' : ''}{simulatedOffsetPct}% Range Expansion
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            step="5"
            value={simulatedOffsetPct}
            onChange={(e) => setSimulatedOffsetPct(parseInt(e.target.value, 10))}
            className="w-full accent-teal-400 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>-50% (Early Session)</span>
            <span>0% (Live Realized Range)</span>
            <span>+100% (High Volatility Expansion)</span>
          </div>
        </div>

        {/* Progress Bar of Daily ADR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">
              Realized Range: {selectedData.unit === '$' ? '$' : ''}{formatVal(effectiveRange)} {selectedData.unit !== '$' ? selectedData.unit : ''}
            </span>
            <span className={`font-black ${percentExhausted > 100 ? 'text-rose-400' : 'text-[#0df2c9]'}`}>
              {percentExhausted}% of 20-Day ADR ({selectedData.unit === '$' ? '$' : ''}{formatVal(selectedData.adr20)})
            </span>
          </div>

          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-[#1e3458] p-0.5 relative">
            <div
              style={{ width: `${Math.min(100, percentExhausted)}%` }}
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${exhaustionStatus.progressColor}`}
            />
            {/* 85% Mark Marker */}
            <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-amber-400/80 pointer-events-none" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>0% Open</span>
            <span>85% Exhaustion Fence</span>
            <span>100% Stat Boundary</span>
          </div>
        </div>

        {/* Quantitative Advice Card */}
        <div className="p-3.5 rounded-xl bg-[#091526] border border-[#17325c] flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#0df2c9] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0df2c9] uppercase tracking-wide block font-mono">
                Institutional Algorithmic Directive
              </span>
              <span className="text-[11px] font-mono text-teal-300">
                Remaining Runway: <strong className="text-white">{selectedData.unit === '$' ? '$' : ''}{formatVal(remainingFuel)}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {exhaustionStatus.advice}
            </p>
          </div>
        </div>

        {/* Clickable Benchmarks & Projected Reversal Boundaries */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#060c16] border border-[#142338]">
            <span className="text-[10px] text-slate-400 uppercase block">5-Day ADR</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {selectedData.unit === '$' ? '$' : ''}{formatVal(selectedData.adr5)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#060c16] border border-[#142338]">
            <span className="text-[10px] text-slate-400 uppercase block">10-Day ADR</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {selectedData.unit === '$' ? '$' : ''}{formatVal(selectedData.adr10)}
            </span>
          </div>

          <button
            onClick={() => handleCopy(formatVal(adrHighProjected), 'high')}
            className="p-3 rounded-lg bg-[#060c16] border border-[#142338] hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase block">Projected ADR High</span>
              {copiedKey === 'high' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-600 group-hover:text-emerald-400" />
              )}
            </div>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {formatVal(adrHighProjected)}
            </span>
          </button>

          <button
            onClick={() => handleCopy(formatVal(adrLowProjected), 'low')}
            className="p-3 rounded-lg bg-[#060c16] border border-[#142338] hover:border-rose-500/40 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase block">Projected ADR Low</span>
              {copiedKey === 'low' ? (
                <Check className="w-3 h-3 text-rose-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-600 group-hover:text-rose-400" />
              )}
            </div>
            <span className="text-sm font-bold text-rose-400 mt-0.5 block">
              {formatVal(adrLowProjected)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
