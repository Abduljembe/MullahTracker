import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  ArrowRight,
  Flame,
  Globe,
  RotateCcw,
} from 'lucide-react';

interface CurrencyScore {
  code: string;
  name: string;
  score: number; // 0 to 10
  change24h: number;
  bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  status: 'Strong' | 'Moderate' | 'Weak';
}

interface CurrencyStrengthMeterProps {
  onSelectPair?: (pairTicker: string) => void;
}

export const CurrencyStrengthMeter: React.FC<CurrencyStrengthMeterProps> = ({ onSelectPair }) => {
  // Live dynamic currency scores
  const [currencies, setCurrencies] = useState<CurrencyScore[]>([
    { code: 'USD', name: 'US Dollar', score: 8.6, change24h: 0.42, bias: 'BULLISH', status: 'Strong' },
    { code: 'KES', name: 'Kenyan Shilling', score: 7.8, change24h: 0.28, bias: 'BULLISH', status: 'Strong' },
    { code: 'GBP', name: 'British Pound', score: 6.4, change24h: 0.15, bias: 'NEUTRAL', status: 'Moderate' },
    { code: 'CAD', name: 'Canadian Dollar', score: 5.7, change24h: -0.05, bias: 'NEUTRAL', status: 'Moderate' },
    { code: 'AUD', name: 'Australian Dollar', score: 4.8, change24h: -0.22, bias: 'NEUTRAL', status: 'Moderate' },
    { code: 'EUR', name: 'Euro', score: 3.5, change24h: -0.38, bias: 'BEARISH', status: 'Weak' },
    { code: 'JPY', name: 'Japanese Yen', score: 2.4, change24h: -0.65, bias: 'BEARISH', status: 'Weak' },
  ]);

  // Micro-fluctuations every 6s to simulate live liquidity flows
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrencies((prev) =>
        prev.map((c) => {
          const delta = (Math.random() - 0.48) * 0.15;
          const newScore = Math.max(1.0, Math.min(9.9, Math.round((c.score + delta) * 10) / 10));
          const bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH' =
            newScore >= 7.0 ? 'BULLISH' : newScore >= 4.5 ? 'NEUTRAL' : 'BEARISH';
          const status: 'Strong' | 'Moderate' | 'Weak' =
            newScore >= 7.0 ? 'Strong' : newScore >= 4.5 ? 'Moderate' : 'Weak';
          return {
            ...c,
            score: newScore,
            status,
            bias,
          };
        }).sort((a, b) => b.score - a.score)
      );
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // Cross-Pair Heatmap Matrix data
  const heatmapPairs = [
    { pair: 'XAU/USD', change: '+0.85%', bias: 'STRONG BUY', category: 'Precious Metals' },
    { pair: 'USD/KES', change: '-0.31%', bias: 'STRONG BUY', category: 'East Africa FX' },
    { pair: 'EUR/USD', change: '+0.32%', bias: 'BUY', category: 'Major FX' },
    { pair: 'GBP/USD', change: '+0.37%', bias: 'BUY', category: 'Major FX' },
    { pair: 'USD/JPY', change: '+0.43%', bias: 'STRONG BUY', category: 'Asian Session' },
    { pair: 'GBP/KES', change: '+0.21%', bias: 'BUY', category: 'Diaspora FX' },
    { pair: 'EUR/KES', change: '+0.18%', bias: 'NEUTRAL', category: 'Regional FX' },
    { pair: 'AUD/USD', change: '-0.27%', bias: 'SELL', category: 'Commodity FX' },
    { pair: 'USD/CAD', change: '+0.16%', bias: 'BUY', category: 'North American FX' },
  ];

  return (
    <div className="rounded-2xl bg-[#090e1a] border border-[#162540] overflow-hidden p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141f33] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Currency Strength Meter & Forex Heatmap
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                LIVE INTERBANK
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Institutional relative currency momentum across London, New York & Nairobi trading sessions
            </p>
          </div>
        </div>

        {/* Synergy Highlight Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 self-start sm:self-auto">
          <Flame className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-emerald-300">
            Top Setup: USD Strong vs JPY Weak (USD/JPY Long)
          </span>
        </div>
      </div>

      {/* Currency Strength Bars Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Relative Strength Rankings (Score 0 to 10)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {currencies.map((c) => {
            const isStrong = c.score >= 7.0;
            const isWeak = c.score < 4.5;

            return (
              <div
                key={c.code}
                className={`p-3 rounded-xl border transition-all ${
                  isStrong
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isWeak
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-[#0d1627] border-[#182744]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold text-white">{c.code}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isStrong
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isWeak
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {c.score.toFixed(1)}/10
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#070b13] overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isStrong
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isWeak
                        ? 'bg-gradient-to-r from-rose-500 to-orange-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${(c.score / 10) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{c.name}</span>
                  <span
                    className={`font-mono font-bold ${
                      c.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {c.change24h >= 0 ? '+' : ''}{c.change24h}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Currency Heatmap Matrix */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Active Cross Heatmap Matrix</span>
          <span className="text-[10px] text-slate-500 font-normal">Click any pair to load chart & signals</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
          {heatmapPairs.map((p) => {
            const isPos = p.change.startsWith('+');
            return (
              <button
                key={p.pair}
                onClick={() => onSelectPair && onSelectPair(p.pair)}
                className="p-3 rounded-xl bg-[#0c1424] hover:bg-[#121c2e] border border-[#182744] hover:border-cyan-500/40 text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.pair}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">[{p.category}]</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Signal: <strong className={p.bias.includes('BUY') ? 'text-emerald-400' : 'text-rose-400'}>{p.bias}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-extrabold font-mono block ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {p.change}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all inline-block mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
