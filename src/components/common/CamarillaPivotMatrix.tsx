import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

export interface PivotAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  prevHigh: number;
  prevLow: number;
  prevClose: number;
}

const DEFAULT_PIVOT_ASSETS: PivotAsset[] = [
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    currentPrice: 4089.08,
    prevHigh: 4146.92,
    prevLow: 4057.83,
    prevClose: 4064.14,
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    currentPrice: 1.1217,
    prevHigh: 1.1268,
    prevLow: 1.1203,
    prevClose: 1.1228,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    currentPrice: 1.3452,
    prevHigh: 1.3510,
    prevLow: 1.3425,
    prevClose: 1.3440,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    currentPrice: 157.79,
    prevHigh: 158.35,
    prevLow: 157.10,
    prevClose: 158.10,
  },
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    currentPrice: 26954.00,
    prevHigh: 27120.00,
    prevLow: 26860.00,
    prevClose: 26920.00,
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

  const asset = useMemo(() => {
    return (
      DEFAULT_PIVOT_ASSETS.find(
        (a) => a.symbol === selectedSymbol || a.symbol.replace('/', '') === selectedSymbol.replace('/', '')
      ) || DEFAULT_PIVOT_ASSETS[0]
    );
  }, [selectedSymbol]);

  // Calculations for Camarilla, Standard Floor Pivots, and Central Pivot Range (CPR)
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

    // Classic Pivot & CPR
    const pivot = (H + L + C) / 3;
    const bc = (H + L) / 2;
    const tc = pivot * 2 - bc;

    // Fibonacci Retracements of previous day
    const fib382 = H - range * 0.382;
    const fib500 = H - range * 0.5;
    const fib618 = H - range * 0.618;

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
      fib382,
      fib500,
      fib618,
    };
  }, [asset]);

  // Proximity to levels
  const currentPrice = asset.currentPrice;
  const activeZoneText = useMemo(() => {
    if (currentPrice > levels.h4) return 'BULLISH EXPANSION: Trading ABOVE Camarilla H4 Breakout Level';
    if (currentPrice >= levels.h3) return 'RESISTANCE FENCE: Testing Camarilla H3 (Prime Fade / Short Zone)';
    if (currentPrice <= levels.l4) return 'BEARISH EXPANSION: Trading BELOW Camarilla L4 Breakdown Level';
    if (currentPrice <= levels.l3) return 'SUPPORT FENCE: Testing Camarilla L3 (Prime Fade / Long Zone)';
    return 'EQUILIBRIUM: Oscillating between H3 and L3 Session Range';
  }, [currentPrice, levels]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shadow-[0_0_12px_rgba(13,242,201,0.3)]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Institutional Camarilla & Central Pivot Range (CPR)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0df2c9]/15 text-[#0df2c9] border border-[#0df2c9]/30">
                FLOOR PIVOTS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional floor traders use H3/L3 as reversal fences and H4/L4 as breakout triggers.
            </p>
          </div>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {DEFAULT_PIVOT_ASSETS.map((item) => {
          const isSelected = item.symbol === asset.symbol;
          return (
            <button
              key={item.symbol}
              onClick={() => {
                setSelectedSymbol(item.symbol);
                if (onSelectTicker) onSelectTicker(item.symbol);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
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

      {/* Active Zone Status */}
      <div className="p-3.5 rounded-xl bg-[#091424] border border-[#173052] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#0df2c9]" />
          <span className="text-slate-300 font-bold">{activeZoneText}</span>
        </div>
        <span className="text-teal-300 font-bold">
          Spot: {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </span>
      </div>

      {/* Pivot Level Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Camarilla Resistance (H4 & H3) */}
        <div className="p-4 rounded-xl bg-[#080e1b] border border-[#1b2b45] space-y-3">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wide block font-mono">
            Camarilla Upper Fences
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-rose-300 font-bold block">H4 (Breakout Long):</span>
                <span className="text-[10px] text-slate-400">Expansion trigger</span>
              </div>
              <span className="text-sm font-bold text-white">{levels.h4.toFixed(2)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-amber-300 font-bold block">H3 (Reversal Short):</span>
                <span className="text-[10px] text-slate-400">Fade resistance fence</span>
              </div>
              <span className="text-sm font-bold text-white">{levels.h3.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Central Pivot Range (CPR) */}
        <div className="p-4 rounded-xl bg-[#080e1b] border border-[#1b2b45] space-y-3">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wide block font-mono">
            Central Pivot Range (CPR)
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-[#1d3559] flex items-center justify-between">
              <span className="text-slate-300">TC (Top Central):</span>
              <span className="text-sm font-bold text-teal-300">{levels.tc.toFixed(2)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-teal-500/40 flex items-center justify-between">
              <span className="text-white font-bold">Daily Pivot (PP):</span>
              <span className="text-sm font-black text-[#0df2c9]">{levels.pivot.toFixed(2)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-[#1d3559] flex items-center justify-between">
              <span className="text-slate-300">BC (Bottom Central):</span>
              <span className="text-sm font-bold text-teal-300">{levels.bc.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Camarilla Support (L3 & L4) */}
        <div className="p-4 rounded-xl bg-[#080e1b] border border-[#1b2b45] space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block font-mono">
            Camarilla Lower Fences
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-emerald-300 font-bold block">L3 (Reversal Long):</span>
                <span className="text-[10px] text-slate-400">Fade support fence</span>
              </div>
              <span className="text-sm font-bold text-white">{levels.l3.toFixed(2)}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1728] border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-rose-300 font-bold block">L4 (Breakdown Short):</span>
                <span className="text-[10px] text-slate-400">Expansion breakdown</span>
              </div>
              <span className="text-sm font-bold text-white">{levels.l4.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
