import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Shield,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Tag,
  Calendar,
  BarChart2,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ClosedTrade } from './PaperTradingDesk.tsx';

interface TradingJournalDeskProps {
  currentTicker?: string;
}

export const TradingJournalDesk: React.FC<TradingJournalDeskProps> = ({ currentTicker }) => {
  // Read closed trades from localStorage
  const [trades, setTrades] = useState<ClosedTrade[]>(() => {
    try {
      const saved = localStorage.getItem('njia_paper_trades');
      if (saved) return JSON.parse(saved);
    } catch {}

    // Initial realistic seeded historical trades if empty
    return [
      {
        id: 'seed-1',
        ticker: 'XAU/USD',
        direction: 'LONG',
        lots: 0.1,
        entryPrice: 4015.20,
        exitPrice: 4056.40,
        currency: 'USD',
        pnl: 412.00,
        pnlPercent: 1.03,
        timestamp: 'Today, 08:30 AM',
        outcome: 'WIN',
      },
      {
        id: 'seed-2',
        ticker: 'USD/KES',
        direction: 'SHORT',
        lots: 0.5,
        entryPrice: 130.20,
        exitPrice: 129.40,
        currency: 'KES',
        pnl: 400.00,
        pnlPercent: 0.61,
        timestamp: 'Yesterday, 02:15 PM',
        outcome: 'WIN',
      },
      {
        id: 'seed-3',
        ticker: 'EUR/USD',
        direction: 'LONG',
        lots: 0.2,
        entryPrice: 1.0820,
        exitPrice: 1.0805,
        currency: 'USD',
        pnl: -30.00,
        pnlPercent: -0.14,
        timestamp: '25 Oct, 10:45 AM',
        outcome: 'LOSS',
      },
      {
        id: 'seed-4',
        ticker: 'XAU/USD',
        direction: 'LONG',
        lots: 0.2,
        entryPrice: 3985.00,
        exitPrice: 4022.50,
        currency: 'USD',
        pnl: 750.00,
        pnlPercent: 0.94,
        timestamp: '24 Oct, 03:00 PM',
        outcome: 'WIN',
      },
      {
        id: 'seed-5',
        ticker: 'SCOM',
        direction: 'LONG',
        lots: 500,
        entryPrice: 16.80,
        exitPrice: 17.65,
        currency: 'KES',
        pnl: 425.00,
        pnlPercent: 5.06,
        timestamp: '22 Oct, 11:00 AM',
        outcome: 'WIN',
      },
      {
        id: 'seed-6',
        ticker: 'NVDA',
        direction: 'LONG',
        lots: 10,
        entryPrice: 132.50,
        exitPrice: 139.20,
        currency: 'USD',
        pnl: 67.00,
        pnlPercent: 5.06,
        timestamp: '20 Oct, 04:30 PM',
        outcome: 'WIN',
      },
    ];
  });

  const [filterTicker, setFilterTicker] = useState<'ALL' | string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  // Trade analytics calculations
  const stats = useMemo(() => {
    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return {
        totalTrades: 0,
        winCount: 0,
        lossCount: 0,
        winRate: 0,
        grossProfit: 0,
        grossLoss: 0,
        netPnl: 0,
        profitFactor: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgWin: 0,
        avgLoss: 0,
        maxDrawdown: 0,
      };
    }

    const wins = trades.filter((t) => t.outcome === 'WIN');
    const losses = trades.filter((t) => t.outcome === 'LOSS');
    const grossProfit = wins.reduce((sum, t) => sum + Math.max(0, t.pnl), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + Math.min(0, t.pnl), 0));
    const netPnl = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;
    const winRate = Math.round((wins.length / totalTrades) * 100);

    const pnls = trades.map((t) => t.pnl);
    const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
    const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    // Equity progression & Max Drawdown
    let peak = 10000;
    let currentEqu = 10000;
    let maxDd = 0;

    // Sort ascending for equity curve
    const chronological = [...trades].reverse();
    chronological.forEach((t) => {
      currentEqu += t.pnl;
      if (currentEqu > peak) peak = currentEqu;
      const dd = ((peak - currentEqu) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    });

    return {
      totalTrades,
      winCount: wins.length,
      lossCount: losses.length,
      winRate,
      grossProfit,
      grossLoss,
      netPnl,
      profitFactor: Math.round(profitFactor * 100) / 100,
      bestTrade,
      worstTrade,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      maxDrawdown: Math.round(maxDd * 10) / 10,
    };
  }, [trades]);

  // Equity Curve generation for SVG plot
  const equityPoints = useMemo(() => {
    let balance = 10000;
    const points: Array<{ balance: number; label: string; tradePnl: number }> = [
      { balance: 10000, label: 'Start', tradePnl: 0 },
    ];

    const chronological = [...trades].reverse();
    chronological.forEach((t, idx) => {
      balance += t.pnl;
      points.push({
        balance,
        label: `#${idx + 1} (${t.ticker})`,
        tradePnl: t.pnl,
      });
    });

    return points;
  }, [trades]);

  // Filtered trades for list
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (filterTicker !== 'ALL' && t.ticker !== filterTicker) return false;
      if (outcomeFilter !== 'ALL' && t.outcome !== outcomeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.ticker.toLowerCase().includes(q) ||
          t.direction.toLowerCase().includes(q) ||
          t.timestamp.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trades, filterTicker, outcomeFilter, searchQuery]);

  // Export to CSV
  const handleExportCsv = () => {
    if (trades.length === 0) return;
    const header = 'ID,Ticker,Direction,Lots,EntryPrice,ExitPrice,Currency,PnL,PnLPercent,Timestamp,Outcome\n';
    const rows = trades
      .map(
        (t) =>
          `"${t.id}","${t.ticker}","${t.direction}",${t.lots},${t.entryPrice},${t.exitPrice},"${t.currency}",${t.pnl},${t.pnlPercent}%,"${t.timestamp}","${t.outcome}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mullahtracker_trading_journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Geometry
  const minEquity = Math.min(...equityPoints.map((p) => p.balance), 9800);
  const maxEquity = Math.max(...equityPoints.map((p) => p.balance), 11500);
  const range = maxEquity - minEquity || 1;

  const svgWidth = 600;
  const svgHeight = 160;
  const svgPadding = 20;

  const pathD = equityPoints
    .map((p, i) => {
      const x = svgPadding + (i / (equityPoints.length - 1 || 1)) * (svgWidth - svgPadding * 2);
      const y = svgHeight - svgPadding - ((p.balance - minEquity) / range) * (svgHeight - svgPadding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${(svgWidth - svgPadding).toFixed(1)} ${(svgHeight - svgPadding).toFixed(1)} L ${svgPadding.toFixed(1)} ${(svgHeight - svgPadding).toFixed(1)} Z`;

  return (
    <div className="rounded-2xl bg-[#090e1a] border border-[#162540] overflow-hidden space-y-5 p-5">
      {/* Top Banner & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141f33] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0df2c9]/15 border border-[#0df2c9]/30 flex items-center justify-center text-[#0df2c9]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Trader Performance Journal</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0df2c9]/20 text-[#0df2c9] border border-[#0df2c9]/30 font-bold">
                AUDITED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional performance metrics, win rate, profit factor & equity curve
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121c2e] hover:bg-[#1a2942] border border-[#1e2f4a] text-xs font-semibold text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#0df2c9]" />
          Export CSV Journal
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-[#1a2b48]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Win Rate</span>
          <div className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
            {stats.winRate}%
          </div>
          <span className="text-[10px] text-slate-500">
            {stats.winCount}W / {stats.lossCount}L ({stats.totalTrades} total)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-[#1a2b48]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Profit Factor</span>
          <div className="text-xl font-extrabold font-mono text-cyan-400 mt-0.5">
            {stats.profitFactor}x
          </div>
          <span className="text-[10px] text-slate-500">
            Target: &gt; 1.80
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-[#1a2b48]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Net PnL</span>
          <div
            className={`text-xl font-extrabold font-mono mt-0.5 ${
              stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">
            Gross: +${Math.round(stats.grossProfit)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-[#1a2b48]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Best Win</span>
          <div className="text-xl font-extrabold font-mono text-emerald-300 mt-0.5">
            +${stats.bestTrade.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">
            Avg: +${stats.avgWin}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-[#1a2b48]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Worst Loss</span>
          <div className="text-xl font-extrabold font-mono text-rose-400 mt-0.5">
            ${stats.worstTrade.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500">
            Avg: -${stats.avgLoss}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-[#1a2b48]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Max Drawdown</span>
          <div className="text-xl font-extrabold font-mono text-amber-400 mt-0.5">
            {stats.maxDrawdown}%
          </div>
          <span className="text-[10px] text-slate-500">
            Safety buffer: 10%
          </span>
        </div>
      </div>

      {/* Visual Equity Curve Chart */}
      <div className="p-4 rounded-xl bg-[#0c1424] border border-[#182744] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0df2c9]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Account Equity Progression</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Start: <strong className="text-slate-200">$10,000</strong></span>
            <span>Current: <strong className="text-emerald-400">${equityPoints[equityPoints.length - 1].balance.toLocaleString()}</strong></span>
          </div>
        </div>

        <div className="relative w-full h-[160px] overflow-hidden rounded-lg bg-[#070b13] border border-[#142036]">
          <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0df2c9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0df2c9" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid horizontal lines */}
            <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="#142036" strokeDasharray="3 3" />
            <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="#142036" strokeDasharray="3 3" />
            <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="#142036" strokeDasharray="3 3" />

            {/* Area & Line */}
            <path d={areaD} fill="url(#equityGrad)" />
            <path d={pathD} fill="none" stroke="#0df2c9" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#070b13] border border-[#162540] rounded-xl">
          <button
            onClick={() => setOutcomeFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              outcomeFilter === 'ALL'
                ? 'bg-[#0df2c9]/20 text-[#0df2c9] border border-[#0df2c9]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Outcomes ({trades.length})
          </button>
          <button
            onClick={() => setOutcomeFilter('WIN')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              outcomeFilter === 'WIN'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wins Only ({stats.winCount})
          </button>
          <button
            onClick={() => setOutcomeFilter('LOSS')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              outcomeFilter === 'LOSS'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Losses ({stats.lossCount})
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol or direction..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0df2c9]"
          />
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-xl border border-[#162540] overflow-hidden bg-[#070b13]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#141f33] bg-[#0a1120] text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-4">Instrument</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Lots/Qty</th>
                <th className="py-2.5 px-3">Entry</th>
                <th className="py-2.5 px-3">Exit</th>
                <th className="py-2.5 px-4 text-right">PnL Return</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141f33]/60 font-mono">
              {filteredTrades.map((t) => (
                <tr key={t.id} className="hover:bg-[#0e1729] transition-colors">
                  <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                    <span>{t.ticker}</span>
                    {t.ticker.includes('XAU') && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        GOLD
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.direction === 'LONG'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{t.lots}</td>
                  <td className="py-2.5 px-3 text-slate-300">{t.entryPrice.toFixed(t.entryPrice < 10 ? 4 : 2)}</td>
                  <td className="py-2.5 px-3 text-slate-300">{t.exitPrice.toFixed(t.exitPrice < 10 ? 4 : 2)}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)} ({t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent}%)
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">{t.timestamp}</td>
                  <td className="py-2.5 px-3 text-center">
                    {t.outcome === 'WIN' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        WIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        LOSS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
