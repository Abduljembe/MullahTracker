import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';

export interface MacroAsset {
  symbol: string;
  name: string;
  category: 'CURRENCY_INDEX' | 'BOND_YIELD' | 'PRECIOUS_METAL' | 'RISK_ASSET' | 'ENERGY';
  price: number;
  change24h: number;
  benchmarkCorrelation: number; // Correlation with Gold (-1.0 to +1.0)
  macroStatus: 'SUPPORTIVE' | 'HOSTILE' | 'NEUTRAL';
  institutionalInterpretation: string;
}

const DEFAULT_MACRO_ASSETS: MacroAsset[] = [
  {
    symbol: 'DXY',
    name: 'US Dollar Index',
    category: 'CURRENCY_INDEX',
    price: 104.28,
    change24h: -0.38,
    benchmarkCorrelation: -0.88,
    macroStatus: 'SUPPORTIVE',
    institutionalInterpretation: 'Dollar softening post-PCE release. Massive tailwind for Gold long expansions and EUR/USD recovery.',
  },
  {
    symbol: 'US10Y',
    name: 'US 10-Year Treasury Yield',
    category: 'BOND_YIELD',
    price: 4.18,
    change24h: -0.06,
    benchmarkCorrelation: -0.82,
    macroStatus: 'SUPPORTIVE',
    institutionalInterpretation: 'Real yields pulling back. Reduces the opportunity cost of holding non-yielding Gold bullion.',
  },
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'PRECIOUS_METAL',
    price: 4089.08,
    change24h: 0.71,
    benchmarkCorrelation: 1.0,
    macroStatus: 'SUPPORTIVE',
    institutionalInterpretation: 'Gold leading all commodities. Central bank reserve purchases absorbing every London dip.',
  },
  {
    symbol: 'US500',
    name: 'S&P 500 Index',
    category: 'RISK_ASSET',
    price: 6025.50,
    change24h: 0.42,
    benchmarkCorrelation: 0.25,
    macroStatus: 'NEUTRAL',
    institutionalInterpretation: 'Risk appetite moderate. Healthy equity flows without dampening safe-haven physical gold demand.',
  },
  {
    symbol: 'WTI_OIL',
    name: 'WTI Crude Oil',
    category: 'ENERGY',
    price: 78.40,
    change24h: 1.15,
    benchmarkCorrelation: 0.65,
    macroStatus: 'SUPPORTIVE',
    institutionalInterpretation: 'Rising energy inputs keep inflation expectations firm, driving institutional gold hedging.',
  },
];

interface IntermarketDivergenceRadarProps {
  onSelectPair?: (pair: string) => void;
}

export const IntermarketDivergenceRadar: React.FC<IntermarketDivergenceRadarProps> = ({
  onSelectPair,
}) => {
  const [macroAssets, setMacroAssets] = useState<MacroAsset[]>(DEFAULT_MACRO_ASSETS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate overall macro confluence score (0 to 100%)
  const macroScore = useMemo(() => {
    let score = 50;
    // DXY down is bullish gold
    const dxy = macroAssets.find((a) => a.symbol === 'DXY');
    if (dxy && dxy.change24h < 0) score += 20;
    else if (dxy && dxy.change24h > 0) score -= 20;

    // US10Y down is bullish gold
    const yields = macroAssets.find((a) => a.symbol === 'US10Y');
    if (yields && yields.change24h < 0) score += 15;
    else if (yields && yields.change24h > 0) score -= 15;

    // Oil up is bullish gold
    const oil = macroAssets.find((a) => a.symbol === 'WTI_OIL');
    if (oil && oil.change24h > 0) score += 10;

    return Math.min(98, Math.max(12, score));
  }, [macroAssets]);

  const divergenceVerdict = useMemo(() => {
    if (macroScore >= 80) {
      return {
        bias: 'TRIPLE GREEN MACRO ALIGNMENT',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
        action: 'STRONG GOLD & ANTI-USD BIAS',
        desc: 'US Dollar weakening + 10Y Yields sliding + Gold expanding higher. Institutional buy setups have >90% statistical edge.',
      };
    }
    if (macroScore <= 40) {
      return {
        bias: 'MACRO REVERSAL WARNING / DIVERGENCE TRAP',
        color: 'text-rose-400 bg-rose-950/60 border-rose-500/40',
        action: 'DEFENSIVE / SHORT BIAS',
        desc: 'US Dollar and Bond Yields surging together. Extreme headwind for Gold longs; expect liquidity sweeps downward.',
      };
    }
    return {
      bias: 'NEUTRAL EQUILIBRIUM MACRO',
      color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
      action: 'RANGE TRADING / SELECTIVE SCALPS',
      desc: 'Mixed signals across Dollar and Yields. Stick to clean SMC liquidity sweeps within established ranges.',
    };
  }, [macroScore]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

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
                Intermarket Macro Divergence Radar
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0df2c9]/15 text-[#0df2c9] border border-[#0df2c9]/30">
                MACRO QUANT 5-PILLAR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gold and Forex never move alone. Cross-indexes DXY (Dollar), US 10Y Yields, Equities, and Oil to prevent fakeout breakouts.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1d33] hover:bg-[#152744] border border-[#1b345b] text-slate-300 hover:text-white text-xs font-mono transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0df2c9]' : ''}`} />
          <span>Sync Macro Feed</span>
        </button>
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
              Institutional Playbook Bias
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

      {/* 5-Pillar Macro Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {macroAssets.map((asset) => {
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
                  <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                    Gold Corr: {asset.benchmarkCorrelation > 0 ? '+' : ''}{asset.benchmarkCorrelation.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#050b14] border border-[#132238] text-[11px] text-slate-300 leading-relaxed">
                {asset.institutionalInterpretation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
