import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Target,
  Crosshair,
  CheckCircle2,
  XCircle,
  RotateCcw,
  History,
  Activity,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Position {
  id: string;
  ticker: string;
  name: string;
  currency: string;
  market: 'NSE' | 'US' | 'FOREX';
  direction: 'LONG' | 'SHORT';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

export interface ClosedTrade {
  id: string;
  ticker: string;
  direction: 'LONG' | 'SHORT';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  currency: string;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
  outcome: 'WIN' | 'LOSS';
}

export interface PrefillOrderData {
  direction: 'LONG' | 'SHORT';
  lots: number;
  sl: string;
  tp: string;
  timestamp: number;
}

interface PaperTradingDeskProps {
  ticker: string;
  name: string;
  market: 'NSE' | 'US' | 'FOREX';
  currency: string;
  currentPrice: number;
  defaultSl?: string;
  defaultTp?: string;
  pipSpread?: string;
  prefillOrder?: PrefillOrderData | null;
}

// Simple synthesizer chime via Web Audio API
function playTradeSound(type: 'open' | 'win' | 'loss') {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'open') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'win') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio context not allowed without interaction
  }
}

export const PaperTradingDesk: React.FC<PaperTradingDeskProps> = ({
  ticker,
  name,
  market,
  currency,
  currentPrice,
  defaultSl,
  defaultTp,
  pipSpread: _pipSpread,
  prefillOrder,
}) => {
  // Virtual balance
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('njia_paper_balance');
    return saved ? parseFloat(saved) : 10000;
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('njia_paper_positions');
    return saved ? JSON.parse(saved) : [];
  });

  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>(() => {
    const saved = localStorage.getItem('njia_paper_trades');
    return saved ? JSON.parse(saved) : [];
  });

  // Order inputs
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [orderLots, setOrderLots] = useState<number>(market === 'FOREX' ? 0.1 : 10);
  const [customSl, setCustomSl] = useState<string>('');
  const [customTp, setCustomTp] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'order' | 'positions' | 'history'>('order');

  // React to prefill orders from Institutional Signal card
  useEffect(() => {
    if (prefillOrder) {
      setDirection(prefillOrder.direction);
      if (prefillOrder.lots > 0) setOrderLots(prefillOrder.lots);
      if (prefillOrder.sl) setCustomSl(prefillOrder.sl);
      if (prefillOrder.tp) setCustomTp(prefillOrder.tp);
      setActiveTab('order');
    }
  }, [prefillOrder]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('njia_paper_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('njia_paper_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('njia_paper_trades', JSON.stringify(closedTrades));
  }, [closedTrades]);

  // Update open positions with current live price
  useEffect(() => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        const isForex = pos.market === 'FOREX';
        const isGold = pos.ticker.includes('XAU');
        // Standard gold contract is 100 troy ounces per lot; standard forex is 100,000 units
        const mult = isGold ? 100 * pos.lots : (isForex ? 100000 * pos.lots : pos.lots);
        const diff = pos.direction === 'LONG' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
        const pnl = diff * mult;
        const pnlPercent = (diff / pos.entryPrice) * 100;

        return {
          ...pos,
          currentPrice,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPercent * 100) / 100,
        };
      })
    );
  }, [currentPrice, ticker]);

  // Handle open trade
  const handleExecuteOrder = (dir: 'LONG' | 'SHORT') => {
    const sl = parseFloat(customSl) || (defaultSl ? parseFloat(defaultSl.replace(/[^0-9.]/g, '')) : undefined);
    const tp = parseFloat(customTp) || (defaultTp ? parseFloat(defaultTp.replace(/[^0-9.]/g, '')) : undefined);

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      ticker,
      name,
      currency,
      market,
      direction: dir,
      lots: orderLots,
      entryPrice: currentPrice,
      currentPrice,
      stopLoss: sl,
      takeProfit: tp,
      pnl: 0,
      pnlPercent: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setPositions((prev) => [newPos, ...prev]);
    playTradeSound('open');
    setActiveTab('positions');
  };

  // Close trade
  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const newBalance = Math.round((balance + pos.pnl) * 100) / 100;
    setBalance(newBalance);

    const isWin = pos.pnl >= 0;
    if (isWin) {
      playTradeSound('win');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } else {
      playTradeSound('loss');
    }

    const closed: ClosedTrade = {
      id: `closed-${Date.now()}`,
      ticker: pos.ticker,
      direction: pos.direction,
      lots: pos.lots,
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      currency: pos.currency,
      pnl: pos.pnl,
      pnlPercent: pos.pnlPercent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outcome: isWin ? 'WIN' : 'LOSS',
    };

    setClosedTrades((prev) => [closed, ...prev]);
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  // Reset balance
  const handleResetBalance = () => {
    setBalance(10000);
    setPositions([]);
    setClosedTrades([]);
  };

  // Floating PnL
  const totalFloatingPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const winCount = closedTrades.filter((t) => t.outcome === 'WIN').length;
  const winRate = closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 100) : 0;

  return (
    <div className="rounded-2xl bg-[#0c1322] border border-[#18253b] overflow-hidden">
      {/* Top Header bar */}
      <div className="p-4 border-b border-[#141f33] flex flex-wrap items-center justify-between gap-3 bg-[#080d18]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Live Paper Trading Simulator</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% RISK-FREE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Practice trading {ticker} with live market execution & real-time PnL
            </p>
          </div>
        </div>

        {/* Virtual Account Balance Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Virtual Demo Equity</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-white">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {totalFloatingPnl !== 0 && (
                <span
                  className={`text-xs font-mono font-bold ${
                    totalFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ({totalFloatingPnl >= 0 ? '+' : ''}${totalFloatingPnl.toFixed(2)})
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleResetBalance}
            title="Reset Demo Balance to $10,000"
            className="p-1.5 rounded-lg bg-[#142036] hover:bg-[#1b2b48] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Navigation Tabs */}
      <div className="flex items-center border-b border-[#141f33] px-4 bg-[#0a101d]">
        <button
          onClick={() => setActiveTab('order')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'order'
              ? 'border-[#0df2c9] text-[#0df2c9]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>New Order</span>
        </button>

        <button
          onClick={() => setActiveTab('positions')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'positions'
              ? 'border-[#0df2c9] text-[#0df2c9]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Open Positions ({positions.length})</span>
          {positions.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-[#0df2c9] text-[#0df2c9]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Trade Log ({closedTrades.length})</span>
          {closedTrades.length > 0 && (
            <span className="text-[10px] font-mono text-slate-400">[{winRate}% Win]</span>
          )}
        </button>
      </div>

      {/* Tab 1: New Order Panel */}
      {activeTab === 'order' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1-Click BUY Button */}
            <button
              onClick={() => handleExecuteOrder('LONG')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/60 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  BUY / LONG
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Instant Fill
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-white group-hover:text-emerald-300 transition-colors">
                {currency} {currentPrice.toFixed(market === 'FOREX' && currentPrice < 10 ? 4 : 2)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Profit when {ticker} goes up
              </span>
            </button>

            {/* 1-Click SELL Button */}
            <button
              onClick={() => handleExecuteOrder('SHORT')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-rose-600/30 to-rose-950/60 border border-rose-500/50 hover:border-rose-400 text-left transition-all group cursor-pointer hover:shadow-lg hover:shadow-rose-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  SELL / SHORT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Instant Fill
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-white group-hover:text-rose-300 transition-colors">
                {currency} {currentPrice.toFixed(market === 'FOREX' && currentPrice < 10 ? 4 : 2)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Profit when {ticker} goes down
              </span>
            </button>
          </div>

          {/* Sizing & Risk Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                {market === 'FOREX' ? 'Lot Size (Units)' : 'Number of Shares'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={market === 'FOREX' ? '0.01' : '1'}
                  min={market === 'FOREX' ? '0.01' : '1'}
                  value={orderLots}
                  onChange={(e) => setOrderLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              {market === 'FOREX' && (
                <div className="flex gap-1 mt-1.5">
                  {[0.01, 0.05, 0.1, 0.5, 1.0].map((lot) => (
                    <button
                      key={lot}
                      type="button"
                      onClick={() => setOrderLots(lot)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                        orderLots === lot
                          ? 'bg-teal-500/30 text-[#0df2c9] border border-teal-500/40'
                          : 'bg-[#142036] text-slate-400 hover:text-white'
                      }`}
                    >
                      {lot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1 flex items-center justify-between">
                <span>Take Profit Price</span>
                <span className="text-emerald-400 text-[10px]">{defaultTp || 'Target TP'}</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. ${(currentPrice * 1.015).toFixed(market === 'FOREX' && currentPrice < 10 ? 4 : 2)}`}
                value={customTp}
                onChange={(e) => setCustomTp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1 flex items-center justify-between">
                <span>Stop Loss Price</span>
                <span className="text-rose-400 text-[10px]">{defaultSl || 'Risk SL'}</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. ${(currentPrice * 0.99).toFixed(market === 'FOREX' && currentPrice < 10 ? 4 : 2)}`}
                value={customSl}
                onChange={(e) => setCustomSl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Open Positions Table */}
      {activeTab === 'positions' && (
        <div className="p-4">
          {positions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Open Positions</p>
              <p className="text-xs text-slate-500 mt-1">
                Execute a BUY or SELL order to practice live trading with zero risk.
              </p>
              <button
                onClick={() => setActiveTab('order')}
                className="mt-4 px-4 py-1.5 rounded-lg bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 text-xs font-bold hover:bg-teal-500/30 cursor-pointer"
              >
                Place Your First Trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#162540] text-slate-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">Asset</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Entry</th>
                    <th className="pb-2">Current</th>
                    <th className="pb-2 text-right">Floating P&L</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141f33] font-mono">
                  {positions.map((pos) => {
                    const isProfit = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-[#080d18]/50">
                        <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                          <span>{pos.ticker}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({pos.timestamp})</span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.direction === 'LONG'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {pos.direction}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {pos.lots} {pos.market === 'FOREX' ? 'Lots' : 'shs'}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {pos.entryPrice.toFixed(pos.market === 'FOREX' && pos.entryPrice < 10 ? 4 : 2)}
                        </td>
                        <td className="py-2.5 text-white font-semibold">
                          {pos.currentPrice.toFixed(pos.market === 'FOREX' && pos.currentPrice < 10 ? 4 : 2)}
                        </td>
                        <td className="py-2.5 text-right font-bold">
                          <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                            {pos.pnlPercent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleClosePosition(pos.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#18253b] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-bold text-[10px] transition-all cursor-pointer border border-[#223654]"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Trade History */}
      {activeTab === 'history' && (
        <div className="p-4">
          {closedTrades.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Closed Trades Yet</p>
              <p className="text-xs text-slate-500 mt-1">Closed positions will appear here with win/loss telemetry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#141f33]">
                <span className="text-slate-400">Total Closed: {closedTrades.length}</span>
                <span className="text-emerald-400 font-bold">Win Rate: {winRate}%</span>
                <span className="text-slate-300 font-mono">
                  Net Realized:{' '}
                  <span
                    className={
                      closedTrades.reduce((acc, t) => acc + t.pnl, 0) >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }
                  >
                    ${closedTrades.reduce((acc, t) => acc + t.pnl, 0).toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {closedTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="p-2 rounded-xl bg-[#080d18] border border-[#141f33] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          trade.outcome === 'WIN' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-bold text-white font-mono">{trade.ticker}</span>
                      <span className="text-[10px] text-slate-500">{trade.direction}</span>
                      <span className="text-[10px] text-slate-600">• {trade.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[11px] text-slate-400">
                        {trade.entryPrice.toFixed(trade.entryPrice < 10 ? 4 : 2)} → {trade.exitPrice.toFixed(trade.exitPrice < 10 ? 4 : 2)}
                      </span>
                      <span
                        className={`font-bold ${
                          trade.outcome === 'WIN' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {trade.outcome === 'WIN' ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
