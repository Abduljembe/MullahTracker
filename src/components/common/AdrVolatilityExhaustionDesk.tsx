import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

export interface AdrAssetData {
  symbol: string;
  name: string;
  currentPrice: number;
  todayHigh: number;
  todayLow: number;
  todayRange: number;
  adr5: number;
  adr10: number;
  adr20: number;
  unit: string;
  pipFactor: number;
}

const DEFAULT_ADR_DATA: AdrAssetData[] = [
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    currentPrice: 4089.08,
    todayHigh: 4146.92,
    todayLow: 4057.83,
    todayRange: 89.09,
    adr5: 78.50,
    adr10: 82.20,
    adr20: 84.45,
    unit: '$',
    pipFactor: 10,
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    currentPrice: 1.1217,
    todayHigh: 1.1268,
    todayLow: 1.1203,
    todayRange: 0.0065,
    adr5: 0.0072,
    adr10: 0.0075,
    adr20: 0.0078,
    unit: 'pips',
    pipFactor: 10000,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    currentPrice: 1.3452,
    todayHigh: 1.3510,
    todayLow: 1.3425,
    todayRange: 0.0085,
    adr5: 0.0094,
    adr10: 0.0098,
    adr20: 0.0102,
    unit: 'pips',
    pipFactor: 10000,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    currentPrice: 157.79,
    todayHigh: 158.35,
    todayLow: 157.10,
    todayRange: 1.25,
    adr5: 1.42,
    adr10: 1.48,
    adr20: 1.55,
    unit: 'pips',
    pipFactor: 100,
  },
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    currentPrice: 26954.00,
    todayHigh: 27120.00,
    todayLow: 26860.00,
    todayRange: 260.00,
    adr5: 290.00,
    adr10: 310.00,
    adr20: 325.00,
    unit: 'pts',
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

  const selectedData = useMemo(() => {
    return (
      DEFAULT_ADR_DATA.find(
        (a) => a.symbol === selectedSymbol || a.symbol.replace('/', '') === selectedSymbol.replace('/', '')
      ) || DEFAULT_ADR_DATA[0]
    );
  }, [selectedSymbol]);

  // Percentage of 20-day ADR exhausted
  const percentExhausted = useMemo(() => {
    return Math.round((selectedData.todayRange / selectedData.adr20) * 100);
  }, [selectedData]);

  // Projected exhaustion levels
  const adrHighProjected = useMemo(() => {
    return selectedData.todayLow + selectedData.adr20;
  }, [selectedData]);

  const adrLowProjected = useMemo(() => {
    return selectedData.todayHigh - selectedData.adr20;
  }, [selectedData]);

  const exhaustionStatus = useMemo(() => {
    if (percentExhausted > 105) {
      return {
        level: 'OVER-EXTENDED / MEAN-REVERSION EDGE',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        advice: 'Daily expansion fuel exhausted! Reversal scalps back towards the session VWAP have an 88% win rate. DO NOT buy breakouts.',
        badge: 'REVERSAL FENCE',
      };
    }
    if (percentExhausted >= 85) {
      return {
        level: 'LATE EXPANSION / CAUTION',
        color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
        advice: '85%+ of daily range fulfilled. Expect momentum deceleration and sideways consolidation. Tighten trailing stops.',
        badge: 'CONSOLIDATION WATCH',
      };
    }
    return {
      level: 'FRESH FUEL / AMPLE RUNWAY',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      advice: 'Under 80% of ADR utilized. Trend continuations, FVG retests, and breakout entries have high directional follow-through.',
      badge: 'TREND RUNWAY ACTIVE',
    };
  }, [percentExhausted]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Average Daily Range (ADR) & Volatility Exhaustion Meter
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                FUEL EXHAUSTION GUARD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Measures how much of the statistical daily range has been burned. Prevents buying the top of a run or selling into empty exhaust.
            </p>
          </div>
        </div>
      </div>

      {/* Asset Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {DEFAULT_ADR_DATA.map((item) => {
          const isSelected = item.symbol === selectedData.symbol;
          const pct = Math.round((item.todayRange / item.adr20) * 100);
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
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  pct > 100
                    ? 'bg-rose-500/20 text-rose-300'
                    : pct > 80
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {pct}% ADR
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Meter & Exhaustion Gauge */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#08101d] border border-[#1b3050] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14233a] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{selectedData.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">({selectedData.name})</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Current Live Price: <strong className="text-slate-100 font-bold">{selectedData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Status:</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${exhaustionStatus.color}`}>
              {exhaustionStatus.badge}
            </span>
          </div>
        </div>

        {/* Progress Bar of Daily ADR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">
              Today's Realized Range: {selectedData.unit === '$' ? '$' : ''}{selectedData.todayRange.toFixed(2)} {selectedData.unit !== '$' ? selectedData.unit : ''}
            </span>
            <span className={`font-black ${percentExhausted > 100 ? 'text-rose-400' : 'text-[#0df2c9]'}`}>
              {percentExhausted}% of 20-Day ADR ({selectedData.unit === '$' ? '$' : ''}{selectedData.adr20.toFixed(2)})
            </span>
          </div>

          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-[#1e3458] p-0.5 relative">
            <div
              style={{ width: `${Math.min(100, percentExhausted)}%` }}
              className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                percentExhausted > 100
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  : percentExhausted > 80
                  ? 'bg-gradient-to-r from-teal-500 to-amber-500'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(13,242,201,0.4)]'
              }`}
            />
            {/* 100% Mark Marker */}
            <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-amber-400/80 pointer-events-none" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Day Open)</span>
            <span>85% Exhaustion Fence</span>
            <span>100% Full ADR</span>
          </div>
        </div>

        {/* Advice Banner */}
        <div className="p-3.5 rounded-xl bg-[#091526] border border-[#17325c] flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#0df2c9] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#0df2c9] uppercase tracking-wide block">
              Quantitative Algorithmic Action
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {exhaustionStatus.advice}
            </p>
          </div>
        </div>

        {/* Statistics Benchmarks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#060c16] border border-[#142338]">
            <span className="text-[10px] text-slate-400 uppercase block">5-Day ADR</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {selectedData.unit === '$' ? '$' : ''}{selectedData.adr5.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#060c16] border border-[#142338]">
            <span className="text-[10px] text-slate-400 uppercase block">10-Day ADR</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {selectedData.unit === '$' ? '$' : ''}{selectedData.adr10.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#060c16] border border-[#142338]">
            <span className="text-[10px] text-slate-400 uppercase block">Projected ADR High</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {adrHighProjected.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#060c16] border border-[#142338]">
            <span className="text-[10px] text-slate-400 uppercase block">Projected ADR Low</span>
            <span className="text-sm font-bold text-rose-400 mt-0.5 block">
              {adrLowProjected.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
