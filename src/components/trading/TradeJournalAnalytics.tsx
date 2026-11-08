/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive Trader's Journal & Performance Analytics
 * Equity growth tracking, win-rate breakdown, and 1-Click Profit Sweep to M-Pesa & Savings.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  DollarSign,
  ArrowRight,
  Wallet,
  Sparkles,
  CheckCircle2,
  Filter,
  Download,
  Calendar,
  Layers,
  Percent,
  Send,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export interface JournalTrade {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  openTime: string;
  closeTime: string;
  setupName: string;
  outcome: 'WIN' | 'LOSS';
  sweptToMpesa?: boolean;
}

const INITIAL_TRADES: JournalTrade[] = [
  {
    id: 't-1',
    ticket: 98124501,
    symbol: 'R_75',
    type: 'BUY',
    lots: 0.005,
    openPrice: 426800.0,
    closePrice: 431200.0,
    pnl: 22.00,
    openTime: '08:15 AM',
    closeTime: '09:02 AM',
    setupName: 'FVG Liquidity Sweep Retest',
    outcome: 'WIN',
  },
  {
    id: 't-2',
    ticket: 98124890,
    symbol: 'BOOM1000',
    type: 'BUY',
    lots: 0.20,
    openPrice: 15380.0,
    closePrice: 15465.0,
    pnl: 17.00,
    openTime: '10:30 AM',
    closeTime: '10:45 AM',
    setupName: 'Spike Accumulation Sniper',
    outcome: 'WIN',
  },
  {
    id: 't-3',
    ticket: 98125430,
    symbol: 'CRASH1000',
    type: 'SELL',
    lots: 0.20,
    openPrice: 8780.0,
    closePrice: 8725.0,
    pnl: 11.00,
    openTime: '11:15 AM',
    closeTime: '11:32 AM',
    setupName: 'Drop Rejection Block',
    outcome: 'WIN',
  },
  {
    id: 't-4',
    ticket: 98126110,
    symbol: 'STP',
    type: 'BUY',
    lots: 0.10,
    openPrice: 9130.0,
    closePrice: 9115.0,
    pnl: -6.00,
    openTime: '01:05 PM',
    closeTime: '01:20 PM',
    setupName: 'Step Momentum Breakout',
    outcome: 'LOSS',
  },
  {
    id: 't-5',
    ticket: 98127022,
    symbol: 'BTCUSD',
    type: 'BUY',
    lots: 0.01,
    openPrice: 103200.0,
    closePrice: 104450.0,
    pnl: 12.50,
    openTime: '02:40 PM',
    closeTime: '03:15 PM',
    setupName: '24/7 Weekend Liquidity Run',
    outcome: 'WIN',
  },
];

export const TradeJournalAnalytics: React.FC = () => {
  const { addIncome, depositToEmergencyFund, depositToGoal, savingsGoals, exchangeRates } = useFinance();
  const [trades, setTrades] = useState<JournalTrade[]>(() => {
    const saved = localStorage.getItem('mullah_journal_trades');
    return saved ? JSON.parse(saved) : INITIAL_TRADES;
  });
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Profit Sweep Modal State
  const [isSweepOpen, setIsSweepOpen] = useState<boolean>(false);
  const [sweepAmountUsd, setSweepAmountUsd] = useState<number>(25.00);
  const [sweepTarget, setSweepTarget] = useState<'MPESA' | 'EMERGENCY' | 'SAVINGS'>('MPESA');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(savingsGoals[0]?.id || '');
  const [sweepSuccessMessage, setSweepSuccessMessage] = useState<string | null>(null);

  // Key performance calculations
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.outcome === 'WIN');
  const losingTrades = trades.filter((t) => t.outcome === 'LOSS');
  const winRate = totalTrades > 0 ? Math.round((winningTrades.length / totalTrades) * 100) : 0;

  const totalGrossWin = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
  const totalGrossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
  const netPnl = Math.round((totalGrossWin - totalGrossLoss) * 100) / 100;
  const profitFactor = totalGrossLoss > 0 ? (totalGrossWin / totalGrossLoss).toFixed(2) : '∞';

  const bestTrade = winningTrades.length > 0 ? Math.max(...winningTrades.map((t) => t.pnl)) : 0;
  const avgTrade = totalTrades > 0 ? Math.round((netPnl / totalTrades) * 100) / 100 : 0;

  // Rate conversion for sweeping
  const kesRate = exchangeRates.KES || 129.20;
  const sweepAmountKes = Math.round(sweepAmountUsd * kesRate);

  // Handle Profit Sweep execution into FinanceContext
  const handleExecuteSweep = () => {
    if (sweepAmountUsd <= 0) return;

    if (sweepTarget === 'MPESA') {
      addIncome({
        source: 'Deriv / Forex Trading Profit Sweep',
        amount: sweepAmountKes,
        date: new Date().toISOString().split('T')[0],
        category: 'Side Hustle',
        frequency: 'one-time',
        paymentMethod: 'M-Pesa',
        notes: `Profit sweep of $${sweepAmountUsd.toFixed(2)} from Deriv / Scalper Studio`,
      });
      setSweepSuccessMessage(
        `Swept $${sweepAmountUsd.toFixed(2)} (${sweepAmountKes.toLocaleString()} KES) into M-Pesa Wallet!`
      );
    } else if (sweepTarget === 'EMERGENCY') {
      depositToEmergencyFund(sweepAmountKes);
      setSweepSuccessMessage(
        `Swept $${sweepAmountUsd.toFixed(2)} (${sweepAmountKes.toLocaleString()} KES) into Emergency Fund Reserve!`
      );
    } else if (sweepTarget === 'SAVINGS' && selectedGoalId) {
      depositToGoal(selectedGoalId, sweepAmountKes);
      setSweepSuccessMessage(
        `Swept $${sweepAmountUsd.toFixed(2)} (${sweepAmountKes.toLocaleString()} KES) into Savings Goal!`
      );
    }

    setIsSweepOpen(false);
    setTimeout(() => setSweepSuccessMessage(null), 5000);
  };

  const filteredTrades = trades.filter((t) => {
    if (filterCategory === 'DERIV') return t.symbol.startsWith('R_') || t.symbol.includes('BOOM') || t.symbol.includes('CRASH') || t.symbol === 'STP';
    if (filterCategory === 'CRYPTO') return t.symbol.includes('BTC') || t.symbol.includes('ETH') || t.symbol.includes('SOL');
    if (filterCategory === 'GOLD_FX') return t.symbol.includes('XAU') || t.symbol.includes('EUR') || t.symbol.includes('GBP');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Profit Sweep Launcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#091220] to-[#070b14] border border-[#17253b] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[#0df2c9]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Trader's Journal & Real Wealth Analytics
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PROFIT SWEEP ENABLED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Track win-rate metrics, evaluate setups, and sweep realized trading gains into your M-Pesa wallet.
            </p>
          </div>
        </div>

        {/* Sweep Profits Button */}
        <button
          onClick={() => {
            setSweepAmountUsd(Math.max(5, Math.min(netPnl > 0 ? netPnl : 25, 100)));
            setIsSweepOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <Wallet className="w-4 h-4" />
          <span>Sweep Profit to M-Pesa / Savings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {sweepSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{sweepSuccessMessage}</span>
        </div>
      )}

      {/* Analytics KPI Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0a1220] border border-[#17253b]">
          <div className="text-[10px] font-mono text-slate-400">NET REALIZED P&L</div>
          <div className={`mt-1 text-lg font-mono font-bold ${netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            ≈ {(netPnl * kesRate).toLocaleString('en-US', { maximumFractionDigits: 0 })} KES
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a1220] border border-[#17253b]">
          <div className="text-[10px] font-mono text-slate-400">WIN RATE</div>
          <div className="mt-1 text-lg font-mono font-bold text-teal-400">
            {winRate}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {winningTrades.length}W / {losingTrades.length}L
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a1220] border border-[#17253b]">
          <div className="text-[10px] font-mono text-slate-400">PROFIT FACTOR</div>
          <div className="mt-1 text-lg font-mono font-bold text-amber-300">
            {profitFactor}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Target: &gt; 1.80
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a1220] border border-[#17253b]">
          <div className="text-[10px] font-mono text-slate-400">TOTAL EXECUTED</div>
          <div className="mt-1 text-lg font-mono font-bold text-white">
            {totalTrades} Trades
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Avg: ${avgTrade.toFixed(2)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a1220] border border-[#17253b]">
          <div className="text-[10px] font-mono text-slate-400">BEST WIN</div>
          <div className="mt-1 text-lg font-mono font-bold text-emerald-400">
            +${bestTrade.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            R_75 FVG Scalp
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a1220] border border-[#17253b]">
          <div className="text-[10px] font-mono text-slate-400">MAX DRAWDOWN</div>
          <div className="mt-1 text-lg font-mono font-bold text-slate-300">
            -2.4%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
            Under 5% Shield
          </div>
        </div>
      </div>

      {/* Trade Log & Filters */}
      <div className="p-5 rounded-2xl bg-[#0a1220] border border-[#17253b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">Trading Execution History</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">
              {filteredTrades.length} logged
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Pairs' },
              { id: 'DERIV', label: 'Deriv Synthetics' },
              { id: 'CRYPTO', label: '24/7 Crypto' },
              { id: 'GOLD_FX', label: 'Gold & Forex' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === f.id
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                    : 'bg-[#070d18] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="py-2.5 px-3">Ticket / Symbol</th>
                <th className="py-2.5 px-3">Type & Lots</th>
                <th className="py-2.5 px-3">Strategy Setup</th>
                <th className="py-2.5 px-3">Entry → Exit</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Net P&L ($)</th>
                <th className="py-2.5 px-3 text-right">Local (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTrades.map((t) => {
                const isWin = t.outcome === 'WIN';
                const kesValue = Math.round(t.pnl * kesRate);
                return (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{t.symbol}</div>
                      <div className="text-[10px] text-slate-500 font-sans">#{t.ticket}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {t.type} {t.lots}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{t.setupName}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {t.openPrice.toFixed(2)} → {t.closePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[10px]">
                      {t.openTime} – {t.closeTime}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isWin ? '+' : ''}${t.pnl.toFixed(2)}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${isWin ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {isWin ? '+' : ''}{kesValue.toLocaleString()} KES
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profit Sweep Modal */}
      {isSweepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0a1220] border border-[#17253b] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Sweep Profits to Personal Wealth</h3>
              </div>
              <button
                onClick={() => setIsSweepOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Lock in your trading gains by transferring them directly into your Kenyan Shilling financial buckets.
            </p>

            {/* Amount Input */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-300">USD Amount to Sweep</label>
                <span className="font-mono text-emerald-400">
                  ≈ {sweepAmountKes.toLocaleString()} KES (@ {kesRate.toFixed(2)})
                </span>
              </div>
              <input
                type="number"
                value={sweepAmountUsd}
                onChange={(e) => setSweepAmountUsd(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d18] border border-slate-700 font-mono font-bold text-base text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Destination Target */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-300">Destination Bucket</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSweepTarget('MPESA')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    sweepTarget === 'MPESA'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-[#070d18] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">M-Pesa</div>
                  <div className="text-[10px] text-slate-500">Wallet</div>
                </button>

                <button
                  onClick={() => setSweepTarget('EMERGENCY')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    sweepTarget === 'EMERGENCY'
                      ? 'bg-teal-500/20 border-teal-500/60 text-[#0df2c9]'
                      : 'bg-[#070d18] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Emergency</div>
                  <div className="text-[10px] text-slate-500">Fund</div>
                </button>

                <button
                  onClick={() => setSweepTarget('SAVINGS')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    sweepTarget === 'SAVINGS'
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-[#070d18] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">SACCO/MMF</div>
                  <div className="text-[10px] text-slate-500">Goal</div>
                </button>
              </div>
            </div>

            {sweepTarget === 'SAVINGS' && savingsGoals.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300">Select Savings Goal</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-white font-mono"
                >
                  {savingsGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.currentAmount.toLocaleString()} / {g.targetAmount.toLocaleString()} KES)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setIsSweepOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSweep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>Confirm Sweep (${sweepAmountUsd})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
