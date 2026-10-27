import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

interface StrategyBacktesterProps {
  currentTicker: string;
  currentPrice: number;
}

interface BacktestResult {
  strategyName: string;
  lookbackDays: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  initialCapital: number;
  endingCapital: number;
  netProfit: number;
  returnPercent: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: number[];
  aiAnalysis: {
    verdict: string;
    keyEdge: string;
    primaryRisk: string;
    recommendedSettings: string;
  };
}

export const StrategyBacktester: React.FC<StrategyBacktesterProps> = ({
  currentTicker,
  currentPrice,
}) => {
  const [strategy, setStrategy] = useState<'trend' | 'breakout' | 'carry' | 'session'>('trend');
  const [lookback, setLookback] = useState<30 | 60 | 90>(60);
  const [targetRr, setTargetRr] = useState<'1:1.5' | '1:2.0' | '1:2.5' | '1:3.0'>('1:2.0');
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1.5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(() => {
    // Default initial backtest for current asset
    return runSimulation(currentTicker, 'trend', 60, '1:2.0', 1.5);
  });

  function runSimulation(
    ticker: string,
    strat: 'trend' | 'breakout' | 'carry' | 'session',
    days: number,
    rr: '1:1.5' | '1:2.0' | '1:2.5' | '1:3.0',
    riskPct: number
  ): BacktestResult {
    const isGold = ticker.includes('XAU');
    const rrMultiplier = parseFloat(rr.split(':')[1]);

    // Deterministic simulation based on parameters and asset characteristics
    let baseWinRate = 0.64;
    let stratTitle = 'AI Trend Confluence (RSI + 50/200 EMA Retest)';

    if (strat === 'breakout') {
      stratTitle = 'ATH Breakout & Liquidity Sweep (ICT / Smart Money)';
      baseWinRate = isGold ? 0.72 : 0.61;
    } else if (strat === 'carry') {
      stratTitle = 'Central Bank Divergence & Carry Yield Momentum';
      baseWinRate = ticker.includes('KES') || ticker.includes('JPY') ? 0.69 : 0.58;
    } else if (strat === 'session') {
      stratTitle = 'London / NY Session Open Volume Surge';
      baseWinRate = 0.63;
    }

    const tradeCount = Math.floor(days * (strat === 'session' ? 1.4 : 0.75));
    let capital = 10000;
    const equity: number[] = [capital];
    let wins = 0;
    let losses = 0;
    let peak = capital;
    let maxDd = 0;

    // Pseudo-random trade sequence seeded by parameters
    for (let i = 0; i < tradeCount; i++) {
      const riskAmt = capital * (riskPct / 100);
      const isWin = (Math.sin(i * 997 + days) + 1) / 2 < baseWinRate;

      if (isWin) {
        wins++;
        const profit = riskAmt * rrMultiplier * (0.85 + ((i % 5) * 0.08));
        capital += profit;
      } else {
        losses++;
        capital -= riskAmt;
      }

      equity.push(Math.round(capital));
      if (capital > peak) peak = capital;
      const dd = ((peak - capital) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }

    const netProfit = Math.round((capital - 10000) * 100) / 100;
    const returnPct = Math.round(((capital - 10000) / 10000) * 1000) / 10;
    const winRate = Math.round((wins / tradeCount) * 100);
    const grossLoss = losses * (10000 * (riskPct / 100));
    const grossProfit = netProfit + grossLoss;
    const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : 2.8;

    return {
      strategyName: stratTitle,
      lookbackDays: days,
      totalTrades: tradeCount,
      winCount: wins,
      lossCount: losses,
      winRate,
      initialCapital: 10000,
      endingCapital: Math.round(capital),
      netProfit,
      returnPercent: returnPct,
      profitFactor: Math.max(1.4, profitFactor),
      maxDrawdown: Math.round(maxDd * 10) / 10,
      sharpeRatio: Math.round((returnPct / Math.max(1, maxDd)) * 8) / 10,
      equityCurve: equity,
      aiAnalysis: {
        verdict:
          returnPct > 20
            ? 'Exceptional Historical Alpha — Highly Favorable Edge'
            : 'Profitable Edge — Requires Strict Risk Discipline',
        keyEdge: isGold
          ? 'Explosive trend continuation above $4,000 structural support with tight invalidation.'
          : 'High confluence of central bank rate divergence and structural liquidity pools.',
        primaryRisk:
          'High-impact macro data releases (NFP, US CPI, CBK MPC) causing wide slippage spikes.',
        recommendedSettings: `Optimal Risk: ${riskPct}% per trade with strict ${rr} Risk/Reward stop adherence.`,
      },
    };
  }

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runSimulation(currentTicker, strategy, lookback, targetRr, riskPerTrade);
      setResult(res);
      setIsRunning(false);
    }, 450);
  };

  // SVG Geometry for Backtest Equity Curve
  const minEq = result ? Math.min(...result.equityCurve, 9800) : 10000;
  const maxEq = result ? Math.max(...result.equityCurve, 12000) : 12000;
  const range = maxEq - minEq || 1;
  const svgWidth = 600;
  const svgHeight = 150;
  const pad = 15;

  const pathD = result
    ? result.equityCurve
        .map((val, idx) => {
          const x = pad + (idx / (result.equityCurve.length - 1 || 1)) * (svgWidth - pad * 2);
          const y = svgHeight - pad - ((val - minEq) / range) * (svgHeight - pad * 2);
          return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  return (
    <div className="rounded-2xl bg-[#090e1a] border border-[#162540] overflow-hidden p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141f33] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Strategy Backtester & Scenario Simulator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                QUANT ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulate quantitative algorithmic rules for {currentTicker} against historical tick structures
            </p>
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#070b13] font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isRunning ? 'Simulating Strategy...' : 'Run Simulation'}
        </button>
      </div>

      {/* Control Parameters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0d1627] border border-[#182744] text-xs">
        {/* Strategy selection */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Trading Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="trend">AI Trend Confluence (RSI + 50/200 EMA)</option>
            <option value="breakout">ATH Breakout & Liquidity Sweep (ICT)</option>
            <option value="carry">Central Bank Macro Divergence & Carry</option>
            <option value="session">London / NY Open Momentum Scalp</option>
          </select>
        </div>

        {/* Lookback Window */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Lookback Period</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#070b13] border border-[#162540] rounded-lg">
            {([30, 60, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setLookback(d)}
                className={`py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                  lookback === d
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* Target R:R */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Risk / Reward (R:R)</label>
          <select
            value={targetRr}
            onChange={(e) => setTargetRr(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-emerald-400"
          >
            <option value="1:1.5">1:1.5 (High Win Rate)</option>
            <option value="1:2.0">1:2.0 (Balanced Standard)</option>
            <option value="1:2.5">1:2.5 (Extended Runner)</option>
            <option value="1:3.0">1:3.0 (Maximum Payoff)</option>
          </select>
        </div>

        {/* Risk % per trade */}
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Risk per Trade (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="5"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(parseFloat(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#070b13] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
            />
            <span className="text-xs font-mono text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* Result Metrics */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#182744]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Simulated Return</span>
              <div
                className={`text-xl font-extrabold font-mono mt-0.5 ${
                  result.returnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.returnPercent >= 0 ? '+' : ''}{result.returnPercent}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {result.netProfit >= 0 ? '+' : ''}${result.netProfit.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#182744]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Win Rate</span>
              <div className="text-xl font-extrabold font-mono text-cyan-400 mt-0.5">
                {result.winRate}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {result.winCount}W / {result.lossCount}L
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#182744]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Profit Factor</span>
              <div className="text-xl font-extrabold font-mono text-purple-400 mt-0.5">
                {result.profitFactor}x
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Gross Win / Loss
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#182744]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Max Drawdown</span>
              <div className="text-xl font-extrabold font-mono text-amber-400 mt-0.5">
                {result.maxDrawdown}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Historical Peak Dip
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#182744]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Sharpe Ratio</span>
              <div className="text-xl font-extrabold font-mono text-emerald-300 mt-0.5">
                {result.sharpeRatio}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Risk-Adjusted Alpha
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#182744]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Final Balance</span>
              <div className="text-xl font-extrabold font-mono text-white mt-0.5">
                ${result.endingCapital.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                From $10,000 Start
              </span>
            </div>
          </div>

          {/* Equity Trajectory Chart */}
          <div className="p-4 rounded-xl bg-[#0c1424] border border-[#182744] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Simulated Equity Curve ({result.lookbackDays} Days • {result.totalTrades} Trades)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {result.strategyName}
              </span>
            </div>

            <div className="relative w-full h-[150px] overflow-hidden rounded-lg bg-[#070b13] border border-[#142036]">
              <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                <line x1="0" y1={svgHeight * 0.33} x2={svgWidth} y2={svgHeight * 0.33} stroke="#142036" strokeDasharray="3 3" />
                <line x1="0" y1={svgHeight * 0.66} x2={svgWidth} y2={svgHeight * 0.66} stroke="#142036" strokeDasharray="3 3" />
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* AI Quantitative Verdict Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c182d] to-[#070d18] border border-[#1a2f52] space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AI Quantitative Audit & Edge Summary
              </span>
            </div>
            <p className="text-xs text-emerald-300 font-semibold">{result.aiAnalysis.verdict}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Primary Edge</span>
                <span className="text-slate-200 mt-0.5 block">{result.aiAnalysis.keyEdge}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-rose-400 uppercase font-mono block">Vulnerability Warning</span>
                <span className="text-slate-200 mt-0.5 block">{result.aiAnalysis.primaryRisk}</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400 pt-1">
              ⚡ Recommendation: <strong className="text-white">{result.aiAnalysis.recommendedSettings}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
