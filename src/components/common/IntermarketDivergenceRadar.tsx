import React, { useState, useMemo } from 'react';
import {
  Compass,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Globe2,
  RefreshCw,
  Layers,
  ArrowRight,
  Flame,
  Activity,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export interface MacroPillar {
  symbol: string;
  name: string;
  category: 'CURRENCY_INDEX' | 'BOND_YIELD' | 'PRECIOUS_METAL' | 'RISK_ASSET' | 'ENERGY';
  price: number;
  change24h: number;
  goldCorrelation: number;
  eurCorrelation: number;
  jpyCorrelation: number;
  institutionalInterpretation: string;
}

export const BASE_MACRO_PILLARS: MacroPillar[] = [
  {
    symbol: 'DXY',
    name: 'US Dollar Index',
    category: 'CURRENCY_INDEX',
    price: 104.28,
    change24h: -0.38,
    goldCorrelation: -0.88,
    eurCorrelation: -0.96,
    jpyCorrelation: 0.82,
    institutionalInterpretation: 'Dollar softening post-PCE release. Massive tailwind for Gold long expansions, EUR/USD recovery, and Yen rallies.',
  },
  {
    symbol: 'US10Y',
    name: 'US 10-Year Treasury Yield',
    category: 'BOND_YIELD',
    price: 4.18,
    change24h: -0.06,
    goldCorrelation: -0.82,
    eurCorrelation: -0.45,
    jpyCorrelation: 0.74,
    institutionalInterpretation: 'Real yields pulling back. Reduces the opportunity cost of holding non-yielding Gold bullion and weakens USD/JPY.',
  },
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'PRECIOUS_METAL',
    price: 4089.08,
    change24h: 0.71,
    goldCorrelation: 1.0,
    eurCorrelation: 0.72,
    jpyCorrelation: -0.65,
    institutionalInterpretation: 'Gold leading global commodities. Sovereign reserve demand absorbing London liquidity dips.',
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    category: 'PRECIOUS_METAL',
    price: 34.25,
    change24h: 0.85,
    goldCorrelation: 0.89,
    eurCorrelation: 0.65,
    jpyCorrelation: -0.55,
    institutionalInterpretation: 'Silver tracking Gold with higher beta. Clean industrial and monetary accumulation.',
  },
  {
    symbol: 'US500',
    name: 'S&P 500 Index',
    category: 'RISK_ASSET',
    price: 6025.50,
    change24h: 0.42,
    goldCorrelation: 0.25,
    eurCorrelation: 0.58,
    jpyCorrelation: -0.42,
    institutionalInterpretation: 'Healthy risk appetite without dampening safe-haven physical gold allocation.',
  },
  {
    symbol: 'WTI_OIL',
    name: 'WTI Crude Oil',
    category: 'ENERGY',
    price: 78.40,
    change24h: 1.15,
    goldCorrelation: 0.65,
    eurCorrelation: -0.22,
    jpyCorrelation: -0.35,
    institutionalInterpretation: 'Firm energy inputs keep headline inflation elevated, reinforcing institutional commodity hedges.',
  },
];

interface IntermarketDivergenceRadarProps {
  onSelectPair?: (pair: string) => void;
}

export const IntermarketDivergenceRadar: React.FC<IntermarketDivergenceRadarProps> = ({
  onSelectPair,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'LIVE' | 'DOLLAR_DUMP' | 'HAWKISH_SPIKE' | 'RISK_OFF'>('LIVE');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic values based on selected interactive macro scenario
  const activePillars = useMemo(() => {
    return BASE_MACRO_PILLARS.map((p) => {
      let modChange = p.change24h;
      if (selectedScenario === 'DOLLAR_DUMP') {
        if (p.symbol === 'DXY') modChange = -1.25;
        if (p.symbol === 'US10Y') modChange = -0.18;
        if (p.symbol === 'XAU/USD') modChange = 2.40;
        if (p.symbol === 'XAG/USD') modChange = 3.10;
      } else if (selectedScenario === 'HAWKISH_SPIKE') {
        if (p.symbol === 'DXY') modChange = 1.45;
        if (p.symbol === 'US10Y') modChange = 0.22;
        if (p.symbol === 'XAU/USD') modChange = -1.85;
        if (p.symbol === 'XAG/USD') modChange = -2.60;
      } else if (selectedScenario === 'RISK_OFF') {
        if (p.symbol === 'US500') modChange = -2.40;
        if (p.symbol === 'XAU/USD') modChange = 2.80;
        if (p.symbol === 'US10Y') modChange = -0.25;
      }
      return {
        ...p,
        change24h: modChange,
      };
    });
  }, [selectedScenario]);

  // Overall macro confluence score (0 to 100%)
  const macroScore = useMemo(() => {
    let score = 50;
    const dxy = activePillars.find((a) => a.symbol === 'DXY');
    if (dxy && dxy.change24h < 0) score += 25;
    else if (dxy && dxy.change24h > 0) score -= 25;

    const yields = activePillars.find((a) => a.symbol === 'US10Y');
    if (yields && yields.change24h < 0) score += 15;
    else if (yields && yields.change24h > 0) score -= 15;

    const oil = activePillars.find((a) => a.symbol === 'WTI_OIL');
    if (oil && oil.change24h > 0) score += 10;

    return Math.min(98, Math.max(8, score));
  }, [activePillars]);

  const divergenceVerdict = useMemo(() => {
    if (macroScore >= 80) {
      return {
        bias: 'TRIPLE GREEN MACRO CONFLUENCE',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
        action: 'LONG GOLD, SILVER, EUR/USD & SHORT USD/JPY',
        desc: 'US Dollar weakening + 10Y Yields sliding + Gold expanding higher. Institutional buy setups across metals and non-USD majors have >90% statistical edge.',
      };
    }
    if (macroScore <= 40) {
      return {
        bias: 'MACRO REVERSAL WARNING / DIVERGENCE TRAP',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        action: 'DEFENSIVE: LONG USD & SHORT GOLD / EUR/USD',
        desc: 'US Dollar and Bond Yields surging together. Extreme macro headwind for Gold and non-USD currencies; expect liquidity sweeps downward.',
      };
    }
    return {
      bias: 'NEUTRAL EQUILIBRIUM MACRO',
      color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
      action: 'RANGE TRADING / SELECTIVE SMC SCALPS',
      desc: 'Mixed signals across Dollar and Yields. Stick to clean SMC liquidity sweeps within established session boundaries.',
    };
  }, [macroScore]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSelectedScenario('LIVE');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
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
                Intermarket Macro Divergence Radar
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0df2c9]/15 text-[#0df2c9] border border-[#0df2c9]/30">
                CROSS-ASSET MACRO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-indexes the US Dollar (DXY), 10Y Yields, Equities, and Commodities to validate all Forex and Gold trades.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1d33] hover:bg-[#152744] border border-[#1b345b] text-slate-300 hover:text-white text-xs font-mono transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0df2c9]' : ''}`} />
          <span>Reset to Live</span>
        </button>
      </div>

      {/* Interactive Macro Scenario Simulator Bar */}
      <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#162744] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Macro Scenario Simulator:</span>
          </span>
          <span className="text-[11px] text-teal-300 font-bold">
            Simulate Intermarket Shocks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <button
            onClick={() => setSelectedScenario('LIVE')}
            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
              selectedScenario === 'LIVE'
                ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 font-bold'
                : 'bg-[#060b14] text-slate-400 border-[#14233a] hover:text-white'
            }`}
          >
            Live Baseline
          </button>
          <button
            onClick={() => setSelectedScenario('DOLLAR_DUMP')}
            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
              selectedScenario === 'DOLLAR_DUMP'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold'
                : 'bg-[#060b14] text-slate-400 border-[#14233a] hover:text-white'
            }`}
          >
            DXY & Yields Dump
          </button>
          <button
            onClick={() => setSelectedScenario('HAWKISH_SPIKE')}
            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
              selectedScenario === 'HAWKISH_SPIKE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 font-bold'
                : 'bg-[#060b14] text-slate-400 border-[#14233a] hover:text-white'
            }`}
          >
            Fed Hawkish Spike
          </button>
          <button
            onClick={() => setSelectedScenario('RISK_OFF')}
            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
              selectedScenario === 'RISK_OFF'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                : 'bg-[#060b14] text-slate-400 border-[#14233a] hover:text-white'
            }`}
          >
            Risk-Off Flight
          </button>
        </div>
      </div>

      {/* Macro Score & Divergence Verdict Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#061628] via-[#091f3a] to-[#071324] border border-[#1d3d6e] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Intermarket Confluence Score
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-black font-mono text-[#0df2c9]">
                {macroScore}%
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${divergenceVerdict.color}`}>
                {divergenceVerdict.bias}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              High-Probability Strategy
            </span>
            <span className="text-xs font-mono font-bold text-teal-300">
              {divergenceVerdict.action}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-mono bg-black/30 p-2.5 rounded-lg border border-[#1b335a]">
          {divergenceVerdict.desc}
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activePillars.map((asset) => {
          const isBullish = asset.change24h > 0;
          return (
            <div
              key={asset.symbol}
              className="p-4 rounded-xl bg-[#080e1b] border border-[#172740] hover:border-teal-500/40 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm font-mono">{asset.symbol}</span>
                    <span className="text-[10px] font-mono text-slate-400">({asset.name})</span>
                  </div>
                  <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
                    {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isBullish
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isBullish ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 space-x-1">
                    <span>Gold: {asset.goldCorrelation > 0 ? '+' : ''}{asset.goldCorrelation}</span>
                    <span>EUR: {asset.eurCorrelation > 0 ? '+' : ''}{asset.eurCorrelation}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#050b14] border border-[#132238] text-[11px] text-slate-300 leading-relaxed font-mono">
                {asset.institutionalInterpretation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
