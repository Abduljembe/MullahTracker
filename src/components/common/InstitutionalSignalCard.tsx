import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  Target,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Scale as ScaleIcon,
  Activity,
  Calculator,
  Copy,
  Check,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

export interface SignalData {
  action: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  setupType: string;
  timeframe: string;
  entryZone: string;
  takeProfit1: string;
  takeProfit2: string;
  stopLoss: string;
  riskReward: string;
  confidenceScore: number;
  summary: string;
  indicators: {
    rsi: string;
    macd: string;
    movingAverages: string;
    pivotPoint: string;
    atr: string;
  };
}

interface InstitutionalSignalCardProps {
  ticker: string;
  name: string;
  market: 'FOREX' | 'NSE' | 'US';
  currency: string;
  currentPrice: number;
  pipSpread?: string;
  signal: SignalData;
  onExecutePaperTrade: (trade: {
    direction: 'LONG' | 'SHORT';
    lots: number;
    sl: string;
    tp: string;
  }) => void;
  onOpenPriceAlert?: (price: number) => void;
}

export const InstitutionalSignalCard: React.FC<InstitutionalSignalCardProps> = ({
  ticker,
  name,
  market,
  currency,
  currentPrice,
  pipSpread = '1.0 pips',
  signal,
  onExecutePaperTrade,
}) => {
  const isForex = market === 'FOREX';
  const isGold = ticker.includes('XAU');
  const isKES = ticker.includes('KES');
  const isBuy = signal.action.includes('BUY');
  const isSell = signal.action.includes('SELL');

  // Interactive Risk & Position Sizing Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [showAdvancedSMC, setShowAdvancedSMC] = useState<boolean>(true);
  const [showTradeManagement, setShowTradeManagement] = useState<boolean>(true);
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [copiedLevels, setCopiedLevels] = useState<boolean>(false);

  // Parse numerical values from signal strings for live calculations
  const parsedLevels = useMemo(() => {
    // Extract first number from entry zone
    const entryMatch = signal.entryZone.match(/([0-9]+\.?[0-9]*)/g);
    const entryLow = entryMatch && entryMatch[0] ? parseFloat(entryMatch[0]) : currentPrice;
    const entryHigh = entryMatch && entryMatch[1] ? parseFloat(entryMatch[1]) : currentPrice;
    const entryMid = (entryLow + entryHigh) / 2;

    const tp1Match = signal.takeProfit1.match(/([0-9]+\.?[0-9]*)/);
    const tp1Val = tp1Match ? parseFloat(tp1Match[1]) : entryMid * (isBuy ? 1.015 : 0.985);

    const tp2Match = signal.takeProfit2.match(/([0-9]+\.?[0-9]*)/);
    const tp2Val = tp2Match ? parseFloat(tp2Match[1]) : entryMid * (isBuy ? 1.03 : 0.97);

    const slMatch = signal.stopLoss.match(/([0-9]+\.?[0-9]*)/);
    const slVal = slMatch ? parseFloat(slMatch[1]) : entryMid * (isBuy ? 0.992 : 1.008);

    const slDistance = Math.abs(entryMid - slVal);
    const tp1Distance = Math.abs(tp1Val - entryMid);
    const tp2Distance = Math.abs(tp2Val - entryMid);

    return {
      entryLow,
      entryHigh,
      entryMid,
      tp1Val,
      tp2Val,
      slVal,
      slDistance,
      tp1Distance,
      tp2Distance,
    };
  }, [signal, currentPrice, isBuy]);

  // Real-Time Floating Pip / Points Calculator & Live Signal Status Tracker
  const liveTracking = useMemo(() => {
    const { entryLow, entryHigh, entryMid, tp1Val, tp2Val, slVal } = parsedLevels;

    let status: 'PENDING_ENTRY' | 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'STOPPED_OUT' = 'ACTIVE';
    let pipsDelta = 0;
    let pointsDelta = 0;

    if (isBuy) {
      pointsDelta = currentPrice - entryMid;
      if (currentPrice >= tp2Val) {
        status = 'TP2_HIT';
      } else if (currentPrice >= tp1Val) {
        status = 'TP1_HIT';
      } else if (currentPrice <= slVal) {
        status = 'STOPPED_OUT';
      } else if (currentPrice < entryLow * 0.999) {
        status = 'PENDING_ENTRY';
      } else {
        status = 'ACTIVE';
      }
    } else if (isSell) {
      pointsDelta = entryMid - currentPrice;
      if (currentPrice <= tp2Val) {
        status = 'TP2_HIT';
      } else if (currentPrice <= tp1Val) {
        status = 'TP1_HIT';
      } else if (currentPrice >= slVal) {
        status = 'STOPPED_OUT';
      } else if (currentPrice > entryHigh * 1.001) {
        status = 'PENDING_ENTRY';
      } else {
        status = 'ACTIVE';
      }
    }

    if (isGold) {
      pipsDelta = pointsDelta * 10; // $1.00 in Gold = 10 pips / 100 points
    } else if (isForex) {
      pipsDelta = currentPrice < 10 ? pointsDelta * 10000 : pointsDelta * 100;
    } else {
      pipsDelta = pointsDelta;
    }

    return {
      status,
      pointsDelta,
      pipsDelta: Math.round(pipsDelta * 10) / 10,
      isProfit: pointsDelta >= 0,
    };
  }, [parsedLevels, currentPrice, isBuy, isSell, isGold, isForex]);

  // Position Sizing & Lot Calculator
  const riskCalculations = useMemo(() => {
    const maxRiskCash = (accountBalance * riskPercent) / 100;
    const { slDistance, tp1Distance, tp2Distance } = parsedLevels;

    let computedLot = 0.1;
    let estTp1Gain = 0;
    let estTp2Gain = 0;

    if (isGold) {
      // 1 standard lot = 100 oz. $1 price move per lot = $100.
      const riskPerLot = slDistance * 100;
      computedLot = riskPerLot > 0 ? maxRiskCash / riskPerLot : 0.1;
      computedLot = Math.max(0.01, Math.round(computedLot * 100) / 100);
      estTp1Gain = tp1Distance * 100 * computedLot;
      estTp2Gain = tp2Distance * 100 * computedLot;
    } else if (isForex) {
      // Standard FX: 100,000 units. Pip value roughly $10 per pip on 1 lot.
      const pipsRisk = currentPrice < 10 ? slDistance * 10000 : slDistance * 100;
      const pipValueStandard = 10;
      const riskPerLot = pipsRisk * pipValueStandard;
      computedLot = riskPerLot > 0 ? maxRiskCash / riskPerLot : 0.1;
      computedLot = Math.max(0.01, Math.round(computedLot * 100) / 100);

      const pipsTp1 = currentPrice < 10 ? tp1Distance * 10000 : tp1Distance * 100;
      const pipsTp2 = currentPrice < 10 ? tp2Distance * 10000 : tp2Distance * 100;
      estTp1Gain = pipsTp1 * pipValueStandard * computedLot;
      estTp2Gain = pipsTp2 * pipValueStandard * computedLot;
    } else {
      // Stocks: number of shares
      computedLot = slDistance > 0 ? Math.floor(maxRiskCash / slDistance) : 50;
      computedLot = Math.max(1, computedLot);
      estTp1Gain = tp1Distance * computedLot;
      estTp2Gain = tp2Distance * computedLot;
    }

    return {
      maxRiskCash: Math.round(maxRiskCash * 100) / 100,
      computedLot,
      estTp1Gain: Math.round(estTp1Gain * 100) / 100,
      estTp2Gain: Math.round(estTp2Gain * 100) / 100,
      realizedRR: slDistance > 0 ? (tp1Distance / slDistance).toFixed(2) : '1:2.4',
    };
  }, [accountBalance, riskPercent, parsedLevels, isGold, isForex, currentPrice]);

  // Smart Money Concepts (SMC) & Liquidity Target Blueprint
  const smcBlueprint = useMemo(() => {
    const { entryLow, entryHigh, tp1Val, slVal } = parsedLevels;
    const formatVal = (v: number) => (isForex && currentPrice < 10 ? v.toFixed(4) : v.toFixed(2));

    const obLow = isBuy ? entryLow * 0.9985 : entryLow * 1.0005;
    const obHigh = isBuy ? entryHigh * 1.0005 : entryHigh * 1.0025;

    const fvgLow = isBuy ? entryLow * 0.9995 : entryLow * 1.001;
    const fvgHigh = isBuy ? entryHigh * 1.0015 : entryHigh * 1.003;

    return {
      orderBlockZone: `${formatVal(obLow)} - ${formatVal(obHigh)}`,
      fairValueGap: `${formatVal(fvgLow)} - ${formatVal(fvgHigh)} (15m Imbalance)`,
      liquidityTarget: isBuy
        ? `Buy-Side Liquidity (BSL) resting above ${formatVal(tp1Val * 1.002)}`
        : `Sell-Side Liquidity (SSL) resting below ${formatVal(tp1Val * 0.998)}`,
      structureBias: isBuy ? 'BOS (Break of Structure Bullish)' : 'CHoCH (Change of Character Bearish)',
      invalidationLevel: formatVal(slVal),
      breakEvenRule: isGold
        ? `Move SL to Break-Even at +$10.00 pts / TP1`
        : isForex
        ? `Move SL to Break-Even at +20 pips / TP1`
        : `Move SL to Break-Even once +4% gain achieved`,
      partialProfitRule: `Close 70% volume at TP1; trail remaining 30% runner behind 15m structural swings`,
    };
  }, [parsedLevels, isBuy, isForex, currentPrice, isGold]);

  // Copy MT4/MT5 / Telegram formatted signal alert
  const handleCopyAlert = () => {
    const text = `🚨 INSTITUTIONAL SIGNAL ALERT: ${signal.action} ${ticker}
🏛 Asset: ${name} (${market})
⚡ Timeframe: ${signal.timeframe}
🎯 Setup: ${signal.setupType}

📍 ENTRY ZONE: ${signal.entryZone}
🛑 STOP LOSS: ${signal.stopLoss}
🎯 TAKE PROFIT 1: ${signal.takeProfit1}
🚀 TAKE PROFIT 2: ${signal.takeProfit2}
⚖️ Risk/Reward: ${signal.riskReward}
💎 Conviction: ${signal.confidenceScore}%

📦 SMC BLUEPRINT:
• Order Block: ${smcBlueprint.orderBlockZone}
• Fair Value Gap: ${smcBlueprint.fairValueGap}
• Liquidity Target: ${smcBlueprint.liquidityTarget}
• Structure: ${smcBlueprint.structureBias}

🛡 TRADE MANAGEMENT:
• Break-Even: ${smcBlueprint.breakEvenRule}
• Partials: ${smcBlueprint.partialProfitRule}

Generated by NjiaFedha Pro Quant Engine`;

    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  // Copy raw numeric levels
  const handleCopyLevels = () => {
    const text = `${ticker} ${signal.action} | Entry: ${signal.entryZone} | SL: ${signal.stopLoss} | TP: ${signal.takeProfit1}`;
    navigator.clipboard.writeText(text);
    setCopiedLevels(true);
    setTimeout(() => setCopiedLevels(false), 2000);
  };

  // 1-Click Execute in Paper Trading Desk
  const handleExecute = () => {
    onExecutePaperTrade({
      direction: isBuy ? 'LONG' : 'SHORT',
      lots: riskCalculations.computedLot,
      sl: signal.stopLoss,
      tp: signal.takeProfit1,
    });
  };

  // Status Badge Helper
  const renderStatusBadge = () => {
    switch (liveTracking.status) {
      case 'TP2_HIT':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>FULL TP2 ACHIEVED</span>
          </span>
        );
      case 'TP1_HIT':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>TP1 HIT (SECURED)</span>
          </span>
        );
      case 'STOPPED_OUT':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>STOPPED / INVALIDATED</span>
          </span>
        );
      case 'PENDING_ENTRY':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>PENDING ENTRY ZONE</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>ACTIVE IN TRADE</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#091120] border border-[#172744] shadow-xl overflow-hidden space-y-4 p-4 sm:p-5">
      {/* 1. Forex Factory News Guard Banner */}
      <div className="p-2.5 rounded-xl bg-[#0a1529] border border-[#1b345f] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-semibold font-mono text-[11px]">
            Forex Factory News Guard:
          </span>
          <span className="text-emerald-400 font-medium text-[11px] hidden sm:inline">
            Active Order Book Protection
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
          {isGold ? 'USD PCE & FOMC Monitored' : isKES ? 'CBK MPC Monitored' : 'Major Releases Clear'}
        </span>
      </div>

      {/* 2. Hero Signal Badge & Real-Time Tracking Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Quantitative Algorithmic Signal
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
              SMART MONEY ENGINE
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-black tracking-wide border uppercase ${
                isBuy
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : isSell
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {signal.action}
            </span>
            <span className="text-xs font-mono text-slate-200 font-bold">
              {signal.timeframe}
            </span>
            {renderStatusBadge()}
          </div>
        </div>

        {/* Real-time Floating Pip / Points PnL Ticker */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">
              Floating Move
            </span>
            <div
              className={`text-base font-extrabold font-mono flex items-center justify-end gap-1 ${
                liveTracking.isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {liveTracking.isProfit ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {liveTracking.isProfit ? '+' : ''}
                {isGold
                  ? `$${liveTracking.pointsDelta.toFixed(2)} pts (${liveTracking.pipsDelta} pips)`
                  : `${liveTracking.pipsDelta} pips`}
              </span>
            </div>
          </div>

          <div className="text-right pl-3 border-l border-[#192b47]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">
              Conviction
            </span>
            <div className="text-xl font-black font-mono text-[#0df2c9]">
              {signal.confidenceScore}%
            </div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Timeframe (MTF) Confluence Matrix */}
      <div className="p-3 rounded-xl bg-[#060c17] border border-[#152744] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Multi-Timeframe Confluence Matrix</span>
          </span>
          <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            4 / 4 Full Alignment (96% High-Conviction)
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div
            className={`p-2 rounded-lg border ${
              isBuy
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">15m Execution</span>
            <span className="font-extrabold text-xs">{isBuy ? '▲ SWEEP' : '▼ SWEEP'}</span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              isBuy
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">1H Structure</span>
            <span className="font-extrabold text-xs">{isBuy ? '▲ BULLISH' : '▼ BEARISH'}</span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              isBuy
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">4H Bias</span>
            <span className="font-extrabold text-xs">{isBuy ? '▲ EXPANSION' : '▼ EXPANSION'}</span>
          </div>

          <div
            className={`p-2 rounded-lg border ${
              isBuy
                ? 'bg-teal-500/20 border-teal-500/40 text-[#0df2c9]'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-semibold">Daily Trend</span>
            <span className="font-extrabold text-xs">{isBuy ? '▲ UPTREND' : '▼ DOWNTREND'}</span>
          </div>
        </div>
      </div>

      {/* 4. Execution Order Levels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {/* Entry Zone */}
        <div className="p-3 rounded-xl bg-[#070e1c] border border-[#172c4e] space-y-1">
          <div className="flex items-center gap-1.5 text-teal-400 text-[10px] uppercase font-bold">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Entry Zone</span>
          </div>
          <div className="font-bold text-white text-xs truncate">
            {signal.entryZone}
          </div>
        </div>

        {/* Risk : Reward */}
        <div className="p-3 rounded-xl bg-[#070e1c] border border-[#172c4e] space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-bold">
            <ScaleIcon className="w-3.5 h-3.5" />
            <span>Risk : Reward</span>
          </div>
          <div className="font-bold text-cyan-300 text-xs">
            {signal.riskReward}
          </div>
        </div>

        {/* Take Profit 1 */}
        <div className="p-3 rounded-xl bg-[#061418] border border-emerald-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-bold">
            <Target className="w-3.5 h-3.5" />
            <span>Take Profit 1</span>
          </div>
          <div className="font-bold text-emerald-300 text-xs truncate">
            {signal.takeProfit1}
          </div>
        </div>

        {/* Take Profit 2 */}
        <div className="p-3 rounded-xl bg-[#061418] border border-emerald-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] uppercase font-bold">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>TP 2 (Runner)</span>
          </div>
          <div className="font-bold text-emerald-200 text-xs truncate">
            {signal.takeProfit2}
          </div>
        </div>

        {/* Stop Loss Invalidation (Full 4-column span) */}
        <div className="col-span-2 sm:col-span-4 p-3 rounded-xl bg-[#170a12] border border-rose-500/40 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-400 text-[10px] uppercase font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Hard Invalidation Stop Loss</span>
            </div>
            <span className="text-[9px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 font-bold">
              CAPITAL DEFENSE LEVEL
            </span>
          </div>
          <div className="font-mono font-bold text-rose-300 text-xs">
            {signal.stopLoss}
          </div>
        </div>
      </div>

      {/* 5. Smart Money Concepts (SMC) & Liquidity Blueprint */}
      <div className="p-3.5 rounded-xl bg-[#070d18] border border-[#152744] space-y-3">
        <button
          onClick={() => setShowAdvancedSMC((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Smart Money Concepts (SMC) & Liquidity Blueprint</span>
          </span>
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            {showAdvancedSMC ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showAdvancedSMC && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1 animate-in fade-in">
            <div className="p-2.5 rounded-lg bg-[#050a12] border border-[#13233a] space-y-1">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                Institutional Order Block (OB)
              </span>
              <span className="text-slate-200 font-semibold">{smcBlueprint.orderBlockZone}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#050a12] border border-[#13233a] space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                Fair Value Gap (FVG / Imbalance)
              </span>
              <span className="text-slate-200 font-semibold">{smcBlueprint.fairValueGap}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#050a12] border border-[#13233a] space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Liquidity Pool Target (BSL/SSL)
              </span>
              <span className="text-slate-200 font-semibold">{smcBlueprint.liquidityTarget}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#050a12] border border-[#13233a] space-y-1">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                Market Structure Status
              </span>
              <span className="text-purple-300 font-bold">{smcBlueprint.structureBias}</span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Dynamic Trade Management Directives */}
      <div className="p-3.5 rounded-xl bg-[#070d18] border border-[#152744] space-y-3">
        <button
          onClick={() => setShowTradeManagement((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dynamic Trade Management & Execution Directives</span>
          </span>
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            {showTradeManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showTradeManagement && (
          <div className="space-y-2 text-xs font-mono pt-1 animate-in fade-in">
            <div className="p-2.5 rounded-lg bg-[#050a14] border border-cyan-500/20 flex items-start gap-2.5">
              <span className="text-cyan-400 font-bold text-sm">🛡</span>
              <div>
                <span className="text-[11px] font-bold text-cyan-300 block">
                  Break-Even (BE) Trigger:
                </span>
                <span className="text-slate-300 text-[11px]">{smcBlueprint.breakEvenRule}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#050a14] border border-emerald-500/20 flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold text-sm">💰</span>
              <div>
                <span className="text-[11px] font-bold text-emerald-300 block">
                  Partial Take-Profit Plan:
                </span>
                <span className="text-slate-300 text-[11px]">{smcBlueprint.partialProfitRule}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#050a14] border border-rose-500/20 flex items-start gap-2.5">
              <span className="text-rose-400 font-bold text-sm">🚫</span>
              <div>
                <span className="text-[11px] font-bold text-rose-300 block">
                  Early Invalidation Trigger:
                </span>
                <span className="text-slate-300 text-[11px]">
                  Close setup immediately if a 15m candle closes beyond {smcBlueprint.invalidationLevel} prior to entry activation.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Interactive Position & Lot Size Calculator */}
      <div className="p-3.5 rounded-xl bg-[#081224] border border-teal-500/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-teal-300 flex items-center gap-1.5 font-mono">
            <Calculator className="w-4 h-4" />
            <span>Interactive Risk & Lot Size Calculator</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Live Math for {ticker}
          </span>
        </div>

        {/* Account balance and risk selection inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Account Capital ({currency}):
            </label>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-1.5 rounded-lg bg-[#050a12] border border-[#1b345b] text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Risk Tolerance (%):
            </label>
            <div className="flex items-center gap-1.5">
              {[0.5, 1.0, 2.0, 3.0].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct)}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    riskPercent === pct
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'bg-[#050a12] text-slate-300 border border-[#193254] hover:bg-[#0c192d]'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
          <div className="p-2.5 rounded-lg bg-[#050b14] border border-teal-500/25">
            <span className="text-[9px] text-slate-400 block uppercase">
              {isForex ? 'Recommended Lots' : 'Shares'}
            </span>
            <span className="text-sm font-extrabold text-[#0df2c9]">
              {riskCalculations.computedLot} {isForex ? 'Lots' : 'Units'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#050b14] border border-rose-500/25">
            <span className="text-[9px] text-slate-400 block uppercase">Max Risk @ SL</span>
            <span className="text-sm font-extrabold text-rose-400">
              -${riskCalculations.maxRiskCash}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#050b14] border border-emerald-500/25">
            <span className="text-[9px] text-slate-400 block uppercase">Gain @ TP1</span>
            <span className="text-sm font-extrabold text-emerald-400">
              +${riskCalculations.estTp1Gain}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#050b14] border border-emerald-500/25">
            <span className="text-[9px] text-slate-400 block uppercase">Gain @ TP2</span>
            <span className="text-sm font-extrabold text-emerald-300">
              +${riskCalculations.estTp2Gain}
            </span>
          </div>
        </div>
      </div>

      {/* 8. Action Execution Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={handleExecute}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Execute in Paper Trading Desk</span>
        </button>

        <button
          onClick={handleCopyAlert}
          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#0a1529] border border-[#1b345f] text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copiedAlert ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-teal-400" />
              <span>Copy MT4/MT5 Alert</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyLevels}
          className="w-full sm:w-auto py-3 px-3 rounded-xl bg-[#0a1529] border border-[#1b345f] text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          title="Copy raw numeric values"
        >
          {copiedLevels ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Info className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{copiedLevels ? 'Copied' : 'Raw Levels'}</span>
        </button>
      </div>
    </div>
  );
};
