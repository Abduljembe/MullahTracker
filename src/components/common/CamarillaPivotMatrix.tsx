import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Target,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Flame,
  Zap,
  Layers,
  Search,
  Filter,
  Copy,
  Check,
  Calculator,
  Crosshair,
} from 'lucide-react';

export interface PivotAsset {
  symbol: string;
  name: string;
  category: 'MAJORS' | 'CROSSES' | 'METALS' | 'INDICES' | 'EXOTICS';
  currentPrice: number;
  prevHigh: number;
  prevLow: number;
  prevClose: number;
  decimals: number;
}

export const ALL_PIVOT_ASSETS: PivotAsset[] = [
  // --- METALS & COMMODITIES ---
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'METALS',
    currentPrice: 4089.08,
    prevHigh: 4146.92,
    prevLow: 4057.83,
    prevClose: 4064.14,
    decimals: 2,
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    category: 'METALS',
    currentPrice: 34.25,
    prevHigh: 34.90,
    prevLow: 33.70,
    prevClose: 33.95,
    decimals: 2,
  },
  {
    symbol: 'WTI/USD',
    name: 'WTI Crude Oil',
    category: 'METALS',
    currentPrice: 78.40,
    prevHigh: 79.50,
    prevLow: 77.20,
    prevClose: 77.50,
    decimals: 2,
  },

  // --- FOREX MAJORS ---
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'MAJORS',
    currentPrice: 1.1217,
    prevHigh: 1.1268,
    prevLow: 1.1203,
    prevClose: 1.1228,
    decimals: 4,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'MAJORS',
    currentPrice: 1.3452,
    prevHigh: 1.3510,
    prevLow: 1.3425,
    prevClose: 1.3440,
    decimals: 4,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'MAJORS',
    currentPrice: 157.79,
    prevHigh: 158.35,
    prevLow: 157.10,
    prevClose: 158.10,
    decimals: 2,
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    category: 'MAJORS',
    currentPrice: 0.8920,
    prevHigh: 0.8955,
    prevLow: 0.8905,
    prevClose: 0.8915,
    decimals: 4,
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'MAJORS',
    currentPrice: 1.3780,
    prevHigh: 1.3825,
    prevLow: 1.3750,
    prevClose: 1.3790,
    decimals: 4,
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'MAJORS',
    currentPrice: 0.6580,
    prevHigh: 0.6620,
    prevLow: 0.6555,
    prevClose: 0.6575,
    decimals: 4,
  },
  {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'MAJORS',
    currentPrice: 0.6025,
    prevHigh: 0.6060,
    prevLow: 0.6005,
    prevClose: 0.6020,
    decimals: 4,
  },

  // --- FOREX CROSSES ---
  {
    symbol: 'EUR/JPY',
    name: 'Euro / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 177.00,
    prevHigh: 177.85,
    prevLow: 176.30,
    prevClose: 177.40,
    decimals: 2,
  },
  {
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 212.25,
    prevHigh: 213.60,
    prevLow: 211.50,
    prevClose: 212.60,
    decimals: 2,
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    category: 'CROSSES',
    currentPrice: 0.8338,
    prevHigh: 0.8365,
    prevLow: 0.8325,
    prevClose: 0.8350,
    decimals: 4,
  },
  {
    symbol: 'AUD/JPY',
    name: 'Australian Dollar / Japanese Yen',
    category: 'CROSSES',
    currentPrice: 103.80,
    prevHigh: 104.55,
    prevLow: 103.20,
    prevClose: 103.95,
    decimals: 2,
  },
  {
    symbol: 'GBP/CAD',
    name: 'British Pound / Canadian Dollar',
    category: 'CROSSES',
    currentPrice: 1.8530,
    prevHigh: 1.8620,
    prevLow: 1.8490,
    prevClose: 1.8540,
    decimals: 4,
  },

  // --- INDICES ---
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    category: 'INDICES',
    currentPrice: 26954.00,
    prevHigh: 27120.00,
    prevLow: 26860.00,
    prevClose: 26920.00,
    decimals: 2,
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average',
    category: 'INDICES',
    currentPrice: 43810.00,
    prevHigh: 44020.00,
    prevLow: 43680.00,
    prevClose: 43750.00,
    decimals: 2,
  },
  {
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'INDICES',
    currentPrice: 6025.50,
    prevHigh: 6048.00,
    prevLow: 6008.00,
    prevClose: 6015.00,
    decimals: 2,
  },

  // --- REGIONAL / EXOTICS ---
  {
    symbol: 'USD/KES',
    name: 'US Dollar / Kenyan Shilling',
    category: 'EXOTICS',
    currentPrice: 129.86,
    prevHigh: 130.40,
    prevLow: 129.50,
    prevClose: 129.80,
    decimals: 2,
  },
];

interface CamarillaPivotMatrixProps {
  currentTicker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export const CamarillaPivotMatrix: React.FC<CamarillaPivotMatrixProps> = ({
  currentTicker = 'XAU/USD',
  onSelectTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentTicker);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MAJORS' | 'CROSSES' | 'METALS' | 'INDICES'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Trade Simulator Mode: FADE (Mean Reversion) vs BREAKOUT (Expansion)
  const [simulatorMode, setSimulatorMode] = useState<'FADE' | 'BREAKOUT'>('FADE');

  useEffect(() => {
    if (currentTicker) {
      setSelectedSymbol(currentTicker);
    }
  }, [currentTicker]);

  const filteredAssets = useMemo(() => {
    return ALL_PIVOT_ASSETS.filter((a) => {
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchSearch =
        a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  const asset = useMemo(() => {
    return (
      ALL_PIVOT_ASSETS.find(
        (a) =>
          a.symbol === selectedSymbol ||
          a.symbol.replace('/', '') === selectedSymbol.replace('/', '')
      ) || ALL_PIVOT_ASSETS[0]
    );
  }, [selectedSymbol]);

  // Camarilla, Classic Pivots, and Central Pivot Range (CPR)
  const levels = useMemo(() => {
    const H = asset.prevHigh;
    const L = asset.prevLow;
    const C = asset.prevClose;
    const range = H - L;

    // Camarilla Levels
    const h4 = C + (range * 1.1) / 2; // Breakout Buy
    const h3 = C + (range * 1.1) / 4; // Mean Reversion Short
    const h2 = C + (range * 1.1) / 6;
    const h1 = C + (range * 1.1) / 12;

    const l1 = C - (range * 1.1) / 12;
    const l2 = C - (range * 1.1) / 6;
    const l3 = C - (range * 1.1) / 4; // Mean Reversion Buy
    const l4 = C - (range * 1.1) / 2; // Breakout Sell

    // Classic Floor Pivot & CPR
    const pivot = (H + L + C) / 3;
    const bc = (H + L) / 2;
    const tc = pivot * 2 - bc;

    return {
      h4,
      h3,
      h2,
      h1,
      l1,
      l2,
      l3,
      l4,
      pivot,
      tc,
      bc,
    };
  }, [asset]);

  const currentPrice = asset.currentPrice;

  // Active Proximity Text & Action
  const activeZone = useMemo(() => {
    if (currentPrice > levels.h4) {
      return {
        label: 'BULLISH EXPANSION: Trading ABOVE Camarilla H4 Breakout Level',
        badge: 'H4 BREAKOUT ACTIVE',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
        strategy: 'Look for pullbacks to H4 as support for momentum continuations toward uncharted liquidity.',
      };
    }
    if (currentPrice >= levels.h3) {
      return {
        label: 'RESISTANCE FENCE: Testing Camarilla H3 (Prime Fade / Short Fence)',
        badge: 'H3 SHORT REVERSAL ZONE',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        strategy: 'Expect rejection wick. Institutional mean-reversion short targeting Daily Pivot and L3.',
      };
    }
    if (currentPrice <= levels.l4) {
      return {
        label: 'BEARISH EXPANSION: Trading BELOW Camarilla L4 Breakdown Level',
        badge: 'L4 BREAKDOWN ACTIVE',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        strategy: 'Strong institutional selling pressure. Trail stops beneath L4 breakdown candles.',
      };
    }
    if (currentPrice <= levels.l3) {
      return {
        label: 'SUPPORT FENCE: Testing Camarilla L3 (Prime Fade / Long Fence)',
        badge: 'L3 LONG REVERSAL ZONE',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
        strategy: 'Expect liquidity absorption. Prime institutional buy setup targeting Daily Pivot and H3.',
      };
    }
    return {
      label: 'EQUILIBRIUM: Oscillating Inside H3 - L3 Session Value Area',
      badge: 'INSIDE RANGE EQUILIBRIUM',
      color: 'text-teal-400 bg-teal-950/60 border-teal-500/40',
      strategy: 'Wait for price to test either H3 resistance or L3 support before taking high-R:R positions.',
    };
  }, [currentPrice, levels]);

  const handleCopy = (val: number, key: string) => {
    const formatted = val.toLocaleString(undefined, {
      minimumFractionDigits: asset.decimals,
      maximumFractionDigits: asset.decimals,
    });
    navigator.clipboard.writeText(formatted);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatPrice = (p: number) => {
    return p.toLocaleString(undefined, {
      minimumFractionDigits: asset.decimals,
      maximumFractionDigits: asset.decimals,
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shadow-[0_0_12px_rgba(13,242,201,0.3)] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Institutional Camarilla & Central Pivot Range (CPR)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0df2c9]/15 text-[#0df2c9] border border-[#0df2c9]/30">
                ALL PAIRS SUPPORTED ({ALL_PIVOT_ASSETS.length})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional floor traders use H3/L3 as mean-reversion reversal fences and H4/L4 as breakout triggers.
            </p>
          </div>
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
            placeholder="Search pair (e.g. JPY, XAU, GBP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#08101d] border border-[#1b2f4c] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Horizontal Asset Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredAssets.map((item) => {
          const isSelected = item.symbol === asset.symbol;
          return (
            <button
              key={item.symbol}
              onClick={() => {
                setSelectedSymbol(item.symbol);
                if (onSelectTicker) onSelectTicker(item.symbol);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                isSelected
                  ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 shadow-[0_0_12px_rgba(13,242,201,0.2)] font-bold'
                  : 'bg-[#09111e] hover:bg-[#0e1a2f] text-slate-300 border-[#182942]'
              }`}
            >
              <span>{item.symbol}</span>
            </button>
          );
        })}
      </div>

      {/* Active Zone Status & Interactive Directive */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#061628] via-[#091f3a] to-[#071324] border border-[#1d3d6e] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{asset.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">({asset.name})</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-slate-400">Live Spot:</span>
              <span className="text-base font-black font-mono text-[#0df2c9]">
                {formatPrice(currentPrice)}
              </span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border self-start sm:self-auto ${activeZone.color}`}>
            {activeZone.badge}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-[#1b335a] text-xs font-mono text-slate-300 leading-relaxed flex items-start gap-2">
          <Zap className="w-4 h-4 text-[#0df2c9] shrink-0 mt-0.5" />
          <span>{activeZone.strategy}</span>
        </div>
      </div>

      {/* Interactive Simulator Mode Selector */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#080e1b] border border-[#172740] text-xs font-mono">
        <span className="text-slate-300 font-bold flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-teal-400" />
          <span>Institutional Playbook Simulator:</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSimulatorMode('FADE')}
            className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              simulatorMode === 'FADE'
                ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            H3 / L3 Mean Reversion (Fade)
          </button>
          <button
            onClick={() => setSimulatorMode('BREAKOUT')}
            className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              simulatorMode === 'BREAKOUT'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            H4 / L4 Breakout Expansion
          </button>
        </div>
      </div>

      {/* Pivot Level Breakdown Grid with Click-to-Copy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Camarilla Resistance (H4 & H3) */}
        <div className="p-4 rounded-xl bg-[#080e1b] border border-[#1b2b45] space-y-3">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wide block font-mono">
            Camarilla Upper Fences
          </span>
          <div className="space-y-2 text-xs font-mono">
            <button
              onClick={() => handleCopy(levels.h4, 'h4')}
              className="w-full p-2.5 rounded-lg bg-[#0d1728] border border-rose-500/30 hover:border-rose-400 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="text-rose-300 font-bold block">H4 (Breakout Buy):</span>
                <span className="text-[10px] text-slate-400">Expansion trigger</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{formatPrice(levels.h4)}</span>
                {copiedKey === 'h4' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-300" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleCopy(levels.h3, 'h3')}
              className="w-full p-2.5 rounded-lg bg-[#0d1728] border border-amber-500/30 hover:border-amber-400 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="text-amber-300 font-bold block">H3 (Reversal Short):</span>
                <span className="text-[10px] text-slate-400">Fade resistance fence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{formatPrice(levels.h3)}</span>
                {copiedKey === 'h3' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-300" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Central Pivot Range (CPR) */}
        <div className="p-4 rounded-xl bg-[#080e1b] border border-[#1b2b45] space-y-3">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wide block font-mono">
            Central Pivot Range (CPR)
          </span>
          <div className="space-y-2 text-xs font-mono">
            <button
              onClick={() => handleCopy(levels.tc, 'tc')}
              className="w-full p-2 rounded-lg bg-[#0d1728] border border-[#1d3559] hover:border-teal-400 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <span className="text-slate-300">TC (Top Central):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-teal-300">{formatPrice(levels.tc)}</span>
                {copiedKey === 'tc' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-300" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleCopy(levels.pivot, 'pp')}
              className="w-full p-2 rounded-lg bg-[#0d1728] border border-teal-500/40 hover:border-[#0df2c9] transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <span className="text-white font-bold">Daily Pivot (PP):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-[#0df2c9]">{formatPrice(levels.pivot)}</span>
                {copiedKey === 'pp' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#0df2c9]" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleCopy(levels.bc, 'bc')}
              className="w-full p-2 rounded-lg bg-[#0d1728] border border-[#1d3559] hover:border-teal-400 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <span className="text-slate-300">BC (Bottom Central):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-teal-300">{formatPrice(levels.bc)}</span>
                {copiedKey === 'bc' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-300" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Camarilla Support (L3 & L4) */}
        <div className="p-4 rounded-xl bg-[#080e1b] border border-[#1b2b45] space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block font-mono">
            Camarilla Lower Fences
          </span>
          <div className="space-y-2 text-xs font-mono">
            <button
              onClick={() => handleCopy(levels.l3, 'l3')}
              className="w-full p-2.5 rounded-lg bg-[#0d1728] border border-emerald-500/30 hover:border-emerald-400 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="text-emerald-300 font-bold block">L3 (Reversal Long):</span>
                <span className="text-[10px] text-slate-400">Fade support fence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{formatPrice(levels.l3)}</span>
                {copiedKey === 'l3' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-300" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleCopy(levels.l4, 'l4')}
              className="w-full p-2.5 rounded-lg bg-[#0d1728] border border-rose-500/30 hover:border-rose-400 transition-all text-left flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="text-rose-300 font-bold block">L4 (Breakdown Sell):</span>
                <span className="text-[10px] text-slate-400">Expansion breakdown</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{formatPrice(levels.l4)}</span>
                {copiedKey === 'l4' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-300" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
