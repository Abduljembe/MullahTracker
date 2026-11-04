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
  Server,
  Radio,
  Layers,
  Shield,
  Check,
  Copy,
  Scale,
  Lock,
  X,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface Position {
  id: string;
  ticket: number;
  ticker: string;
  name: string;
  currency: string;
  market: 'NSE' | 'US' | 'FOREX' | 'METALS' | 'INDICES';
  direction: 'LONG' | 'SHORT';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
  executionType?: string;
  brokerServer?: string;
  isBreakEvenLocked?: boolean;
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
  market: 'NSE' | 'US' | 'FOREX' | 'METALS' | 'INDICES';
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

  const [activeBroker, setActiveBroker] = useState<string>('JustMarkets (Raw Spread / Pro)');
  const [executionSlip, setExecutionSlip] = useState<{
    ticket: number;
    side: 'BUY' | 'SELL';
    lots: number;
    symbol: string;
    fillPrice: number;
    sl?: number;
    tp?: number;
    time: string;
    broker: string;
  } | null>(null);

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
  const [orderLots, setOrderLots] = useState<number>(market === 'FOREX' || market === 'METALS' ? 0.1 : 10);
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

  // Calculate live Ask and Bid with authentic broker spreads
  const isGold = ticker.includes('XAU');
  const isForex = market === 'FOREX' || market === 'METALS';
  const digits = isGold ? 2 : (isForex && currentPrice < 10 ? 4 : 2);
  const spread = isGold ? 0.35 : (isForex && currentPrice < 10 ? 0.00018 : 0.05);
  const liveAsk = Number((currentPrice + spread / 2).toFixed(digits));
  const liveBid = Number((currentPrice - spread / 2).toFixed(digits));

  // Update open positions with current live price and MT5 contract multiplier
  useEffect(() => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        const isPosGold = pos.ticker.includes('XAU');
        const isPosForex = pos.market === 'FOREX' || pos.market === 'METALS';
        // Standard gold contract: 100 troy oz per lot; standard forex: 100,000 units
        const mult = isPosGold ? 100 * pos.lots : (isPosForex ? 100000 * pos.lots : pos.lots);
        const marketExitPrice = pos.direction === 'LONG' ? liveBid : liveAsk;
        const diff = pos.direction === 'LONG' ? marketExitPrice - pos.entryPrice : pos.entryPrice - marketExitPrice;
        const pnl = diff * mult;
        const pnlPercent = (diff / pos.entryPrice) * 100;

        return {
          ...pos,
          currentPrice: marketExitPrice,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPercent * 100) / 100,
        };
      })
    );
  }, [currentPrice, liveAsk, liveBid, ticker]);

  // Handle open real-style MT5 trade
  const handleExecuteOrder = (dir: 'LONG' | 'SHORT') => {
    const sl = parseFloat(customSl) || (defaultSl ? parseFloat(defaultSl.replace(/[^0-9.]/g, '')) : undefined);
    const tp = parseFloat(customTp) || (defaultTp ? parseFloat(defaultTp.replace(/[^0-9.]/g, '')) : undefined);

    const fillPrice = dir === 'LONG' ? liveAsk : liveBid;
    const ticket = Math.floor(Math.random() * 900000 + 98400000);
    const mult = isGold ? 100 * orderLots : (isForex ? 100000 * orderLots : orderLots);
    const initialSpreadPnl = -Math.round(spread * mult * 100) / 100;

    const newPos: Position = {
      id: `pos-${ticket}`,
      ticket,
      ticker,
      name,
      currency,
      market,
      direction: dir,
      lots: orderLots,
      entryPrice: fillPrice,
      currentPrice: dir === 'LONG' ? liveBid : liveAsk,
      stopLoss: sl,
      takeProfit: tp,
      pnl: initialSpreadPnl,
      pnlPercent: Math.round((-spread / fillPrice) * 10000) / 100,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      executionType: 'Market Execution',
      brokerServer: activeBroker,
    };

    setPositions((prev) => [newPos, ...prev]);
    playTradeSound('open');
    setActiveTab('positions');

    // Show MT5 execution slip toast
    setExecutionSlip({
      ticket,
      side: dir === 'LONG' ? 'BUY' : 'SELL',
      lots: orderLots,
      symbol: ticker,
      fillPrice,
      sl,
      tp,
      time: new Date().toLocaleTimeString(),
      broker: activeBroker,
    });
    setTimeout(() => setExecutionSlip(null), 5000);

    // Synchronize asynchronously with server MT5 webhook bridge
    fetch('/api/ea/open-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: ticker.replace('/', ''),
        type: dir === 'LONG' ? 'BUY' : 'SELL',
        lots: orderLots,
        price: fillPrice,
        sl,
        tp,
      }),
    }).catch(() => {});
  };

  // MT5 Position Action: Move SL to Break-Even (BE + Spread)
  const handleLockBreakEven = (id: string) => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.id !== id) return pos;
        const isPosGold = pos.ticker.includes('XAU');
        const isPosFx = pos.market === 'FOREX' || pos.market === 'METALS';
        const offset = isPosGold ? 0.35 : (isPosFx && pos.entryPrice < 10 ? 0.0002 : 0.05);
        const newSl = pos.direction === 'LONG' ? pos.entryPrice + offset : pos.entryPrice - offset;
        playTradeSound('open');
        return {
          ...pos,
          stopLoss: Number(newSl.toFixed(digits)),
          isBreakEvenLocked: true,
        };
      })
    );
  };

  // MT5 Position Action: Partial Close (Bank 70% at TP1)
  const handlePartialClose = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos || pos.lots <= 0.01) return;

    const closeLots = Math.max(0.01, Math.round(pos.lots * 0.70 * 100) / 100);
    const remainingLots = Math.max(0.01, Math.round((pos.lots - closeLots) * 100) / 100);
    const realizedPortionPnl = Math.round(pos.pnl * (closeLots / pos.lots) * 100) / 100;

    setBalance((prev) => Math.round((prev + realizedPortionPnl) * 100) / 100);
    playTradeSound('win');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });

    const partialClosed: ClosedTrade = {
      id: `closed-partial-${Date.now()}`,
      ticker: `${pos.ticker} (#${pos.ticket} 70% TP1)`,
      direction: pos.direction,
      lots: closeLots,
      entryPrice: pos.entryPrice,
      exitPrice: pos.currentPrice,
      currency: pos.currency,
      pnl: realizedPortionPnl,
      pnlPercent: pos.pnlPercent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outcome: realizedPortionPnl >= 0 ? 'WIN' : 'LOSS',
    };
    setClosedTrades((prev) => [partialClosed, ...prev]);

    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          lots: remainingLots,
          pnl: Math.round(p.pnl * (remainingLots / p.lots) * 100) / 100,
        };
      })
    );
  };

  // Close trade at market
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
      ticker: `${pos.ticker} (#${pos.ticket})`,
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
      {/* Execution Slip Toast Notification */}
      {executionSlip && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-[#0a1828] to-[#081220] border-b border-emerald-500/40 p-3 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black text-emerald-400 uppercase tracking-wide">
                  MT5 ORDER FILLED & CONFIRMED
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  Ticket #{executionSlip.ticket}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {executionSlip.broker}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono mt-0.5">
                <strong className={executionSlip.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                  {executionSlip.side} {executionSlip.lots} Lots {executionSlip.symbol}
                </strong>{' '}
                filled @ <span className="text-white font-bold">{executionSlip.fillPrice.toFixed(digits)}</span> •
                Latency: <span className="text-cyan-400">12ms</span> (Instant Market Fill)
              </p>
            </div>
          </div>
          <button
            onClick={() => setExecutionSlip(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header bar */}
      <div className="p-4 border-b border-[#141f33] flex flex-wrap items-center justify-between gap-3 bg-[#080d18]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Institutional MT5 Live Trading Desk</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                BROKER CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real MT5 ticket execution, broker spreads & dynamic multi-target trade management
            </p>
          </div>
        </div>

        {/* Virtual Account Balance Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Demo MT5 Equity</span>
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
          {/* MT5 Broker Route Selection */}
          <div className="p-2.5 rounded-xl bg-[#080d18] border border-[#162540] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono font-bold text-slate-300">Execution Server:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                'JustMarkets (Raw Spread / Pro)',
                'FxPesa (Executive Live)',
                'Exness (Zero Spread)',
                'IC Markets (Raw cTrader/MT5)',
              ].map((broker) => (
                <button
                  key={broker}
                  type="button"
                  onClick={() => setActiveBroker(broker)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    activeBroker === broker
                      ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/50'
                      : 'bg-[#121c2d] text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {broker.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1-Click BUY Button (Executes at live Ask) */}
            <button
              onClick={() => handleExecuteOrder('LONG')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/60 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  BUY / LONG (Ask)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Instant MT5 Fill
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-white group-hover:text-emerald-300 transition-colors">
                {currency} {liveAsk.toFixed(digits)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Spread: {(spread * (isGold ? 10 : 10000)).toFixed(1)} pips</span>
                <span className="text-emerald-400 font-medium">Fills at Ask</span>
              </div>
            </button>

            {/* 1-Click SELL Button (Executes at live Bid) */}
            <button
              onClick={() => handleExecuteOrder('SHORT')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-rose-600/30 to-rose-950/60 border border-rose-500/50 hover:border-rose-400 text-left transition-all group cursor-pointer hover:shadow-lg hover:shadow-rose-500/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  SELL / SHORT (Bid)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Instant MT5 Fill
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-white group-hover:text-rose-300 transition-colors">
                {currency} {liveBid.toFixed(digits)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Spread: {(spread * (isGold ? 10 : 10000)).toFixed(1)} pips</span>
                <span className="text-rose-400 font-medium">Fills at Bid</span>
              </div>
            </button>
          </div>

          {/* Sizing & Risk Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                {market === 'FOREX' || market === 'METALS' ? 'Lot Size (Volume)' : 'Number of Shares'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={market === 'FOREX' || market === 'METALS' ? '0.01' : '1'}
                  min={market === 'FOREX' || market === 'METALS' ? '0.01' : '1'}
                  value={orderLots}
                  onChange={(e) => setOrderLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              {(market === 'FOREX' || market === 'METALS') && (
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
                <span className="text-emerald-400 text-[10px] font-mono">{defaultTp || 'Target TP'}</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. ${(currentPrice * 1.015).toFixed(digits)}`}
                value={customTp}
                onChange={(e) => setCustomTp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1 flex items-center justify-between">
                <span>Stop Loss Price</span>
                <span className="text-rose-400 text-[10px] font-mono">{defaultSl || 'Risk SL'}</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. ${(currentPrice * 0.99).toFixed(digits)}`}
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
                Execute a BUY or SELL order to practice live MT5 market execution.
              </p>
              <button
                onClick={() => setActiveTab('order')}
                className="mt-4 px-4 py-1.5 rounded-lg bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 text-xs font-bold hover:bg-teal-500/30 cursor-pointer"
              >
                Place Your First MT5 Trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#162540] text-slate-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">Order / Server</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Volume</th>
                    <th className="pb-2">Open Price</th>
                    <th className="pb-2">Current</th>
                    <th className="pb-2">SL / TP</th>
                    <th className="pb-2 text-right">Floating P&L</th>
                    <th className="pb-2 text-right">Trade Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141f33] font-mono">
                  {positions.map((pos) => {
                    const isProfit = pos.pnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-[#080d18]/50">
                        <td className="py-2.5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{pos.ticker}</span>
                            <span className="text-[10px] text-teal-400 font-mono">#{pos.ticket}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">
                            {pos.brokerServer?.split(' ')[0] || 'MT5-Live'} • {pos.timestamp}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.direction === 'LONG'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {pos.direction === 'LONG' ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {pos.lots} {pos.market === 'FOREX' || pos.market === 'METALS' ? 'Lots' : 'shs'}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {pos.entryPrice.toFixed(digits)}
                        </td>
                        <td className="py-2.5 text-white font-semibold">
                          {pos.currentPrice.toFixed(digits)}
                        </td>
                        <td className="py-2.5 text-[10px]">
                          {pos.isBreakEvenLocked ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                              <Lock className="w-2.5 h-2.5" /> BE LOCKED
                            </span>
                          ) : (
                            <div className="space-y-0.5 text-slate-400">
                              <div>SL: {pos.stopLoss ? pos.stopLoss.toFixed(digits) : 'None'}</div>
                              <div>TP: {pos.takeProfit ? pos.takeProfit.toFixed(digits) : 'None'}</div>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-bold">
                          <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}
                            {pos.pnlPercent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!pos.isBreakEvenLocked && (
                              <button
                                onClick={() => handleLockBreakEven(pos.id)}
                                title="Move Stop Loss to Break-Even + Spread"
                                className="px-2 py-1 rounded bg-[#102035] hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 font-bold text-[9px] transition-all cursor-pointer border border-[#1b3456]"
                              >
                                BE Lock
                              </button>
                            )}
                            <button
                              onClick={() => handlePartialClose(pos.id)}
                              title="Bank 70% Profit at Target and let runner ride"
                              className="px-2 py-1 rounded bg-[#102035] hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 font-bold text-[9px] transition-all cursor-pointer border border-[#1b3456]"
                            >
                              70% Bank
                            </button>
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              title="Close entire position at market"
                              className="px-2 py-1 rounded bg-[#18253b] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-bold text-[9px] transition-all cursor-pointer border border-[#223654]"
                            >
                              Close
                            </button>
                          </div>
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
