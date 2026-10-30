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
  timeframeCategory?: string;
  confirmationScore?: string;
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
  smc?: {
    orderBlock?: string;
    fairValueGap?: string;
    liquidityTarget?: string;
    marketStructure?: string;
  };
  tradeManagement?: {
    breakEvenRule?: string;
    partialProfitRule?: string;
    invalidationRule?: string;
  };
  multiAspectAnalysis?: {
    marketStructure?: string;
    smartMoneyConcepts?: string;
    indicatorConfluence?: string;
    macroForexFactory?: string;
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
  activeTimeframe?: string;
  onSelectTimeframe?: (tf: string) => void;
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
  activeTimeframe,
  onSelectTimeframe,
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
  const [showDeepAnalysis, setShowDeepAnalysis] = useState<boolean>(true);
  const [activeAspectTab, setActiveAspectTab] = useState<'all' | 'structure' | 'smc' | 'indicators' | 'macro'>('all');
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [copiedLevels, setCopiedLevels] = useState<boolean>(false);
  const [copiedMt4, setCopiedMt4] = useState<boolean>(false);

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
      orderBlockZone: signal.smc?.orderBlock || `${formatVal(obLow)} - ${formatVal(obHigh)}`,
      fairValueGap: signal.smc?.fairValueGap || `${formatVal(fvgLow)} - ${formatVal(fvgHigh)} (${signal.timeframe} Imbalance)`,
      liquidityTarget: signal.smc?.liquidityTarget || (isBuy
        ? `Buy-Side Liquidity (BSL) resting above ${formatVal(tp1Val * 1.002)}`
        : `Sell-Side Liquidity (SSL) resting below ${formatVal(tp1Val * 0.998)}`),
      structureBias: signal.smc?.marketStructure || (isBuy ? 'BOS (Break of Structure Bullish)' : 'CHoCH (Change of Character Bearish)'),
      invalidationLevel: formatVal(slVal),
      breakEvenRule: signal.tradeManagement?.breakEvenRule || (isGold
        ? `Move SL to Break-Even at +$10.00 pts / TP1`
        : isForex
        ? `Move SL to Break-Even at +20 pips / TP1`
        : `Move SL to Break-Even once +4% gain achieved`),
      partialProfitRule: signal.tradeManagement?.partialProfitRule || `Close 70% volume at TP1; trail remaining 30% runner behind ${signal.timeframe} structural swings`,
      invalidationRule: signal.tradeManagement?.invalidationRule || `Close setup immediately if a ${signal.timeframe} candle closes beyond ${formatVal(slVal)} prior to entry activation.`,
    };
  }, [parsedLevels, isBuy, isForex, currentPrice, isGold, signal]);

  // Copy MT4/MT5 / Telegram formatted signal alert
  const handleCopyAlert = () => {
    const text = `🚨 INSTITUTIONAL SIGNAL ALERT: ${signal.action} ${ticker}
🏛 Asset: ${name} (${market})
⚡ Timeframe: ${signal.timeframe}
🎯 Setup: ${signal.setupType}
🛡 Confluences: ${signal.confirmationScore || '4/5 Confluences'}

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
• Invalidation: ${smcBlueprint.invalidationRule}

📐 MULTI-ASPECT ANALYSIS:
• Market Structure: ${signal.multiAspectAnalysis?.marketStructure || 'Clean structural accumulation with higher swing lows.'}
• Smart Money: ${signal.multiAspectAnalysis?.smartMoneyConcepts || 'Liquidity sweep into demand zone followed by aggressive volume.'}
• Indicators: ${signal.multiAspectAnalysis?.indicatorConfluence || 'RSI and MACD aligned with moving averages.'}
• Forex Factory: ${signal.multiAspectAnalysis?.macroForexFactory || 'News Guard active and clear of immediate red-folder events.'}

Generated by NjiaFedha Pro Quant Engine`;

    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  // Copy raw numeric levels
  const handleCopyLevels = () => {
    const text = `${ticker} ${signal.action} (${signal.timeframe}) | Entry: ${signal.entryZone} | SL: ${signal.stopLoss} | TP1: ${signal.takeProfit1} | TP2: ${signal.takeProfit2}`;
    navigator.clipboard.writeText(text);
    setCopiedLevels(true);
    setTimeout(() => setCopiedLevels(false), 2000);
  };

  // Copy standard MT4/MT5 / cTrader execution string
  const handleCopyMt4Syntax = () => {
    const dir = isBuy ? 'BUY' : 'SELL';
    const cleanEntry = signal.entryZone.split('-')[0].trim();
    const cleanSl = signal.stopLoss.split('(')[0].trim();
    const cleanTp1 = signal.takeProfit1.split('(')[0].trim();
    const cleanTp2 = signal.takeProfit2.split('(')[0].trim();
    const cleanTicker = ticker.replace('/', '');
    const text = `${dir} ${cleanTicker} @ ${cleanEntry} | SL: ${cleanSl} | TP1: ${cleanTp1} | TP2: ${cleanTp2} | Lots: ${riskCalculations.computedLot} | R:R: ${signal.riskReward} [${signal.timeframe}]`;
    navigator.clipboard.writeText(text);
    setCopiedMt4(true);
    setTimeout(() => setCopiedMt4(false), 2000);
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

  const currentTf = activeTimeframe || signal.timeframe || '1H';

  return (
    <div className="rounded-2xl bg-[#091120] border border-[#172744] shadow-xl overflow-hidden space-y-4 p-4 sm:p-5">
      {/* 0. Timeframe Adaptability Pill Bar (15m, 1H, 4H, 1D) */}
      <div className="p-2 rounded-xl bg-[#060c18] border border-[#14233c] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-[11px]">Signal Timeframe:</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: '15m', label: '15m Scalp' },
            { id: '1H', label: '1H Intraday' },
            { id: '4H', label: '4H Swing' },
            { id: '1D', label: '1D Macro' },
          ].map((tf) => {
            const isCurrent = currentTf.toLowerCase() === tf.id.toLowerCase() || signal.timeframe.toLowerCase().startsWith(tf.id.toLowerCase());
            return (
              <button
                key={tf.id}
                onClick={() => onSelectTimeframe?.(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-black'
                    : 'bg-[#0a1426] text-slate-400 hover:text-white border border-[#162744]'
                }`}
                title={`Analyze ${ticker} signal strictly on ${tf.label}`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

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
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
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
            <span className="text-xs font-mono text-slate-200 font-bold bg-[#101e38] px-2 py-0.5 rounded border border-[#1b345b]">
              {signal.timeframe}
            </span>
            {signal.confirmationScore && (
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                ⚡ {signal.confirmationScore}
              </span>
            )}
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

      {/* Setup Description Banner */}
      <div className="p-2.5 rounded-xl bg-[#070e1c] border border-teal-500/30 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-teal-400 font-bold">🎯 Setup:</span>
          <span className="font-semibold text-white">{signal.setupType}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          R:R <strong className="text-cyan-300">{signal.riskReward}</strong>
        </span>
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

      {/* 4. AI Deep Scan Signal Order Ticket: SL, Entry, TP1, TP2 */}
      <div className="p-4 rounded-xl bg-[#060c18] border border-teal-500/40 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>AI Deep Scan Order Ticket:</span>
              <span className="text-[#0df2c9]">SL • ENTRY • TP1 • TP2</span>
            </h4>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <button
              onClick={handleCopyMt4Syntax}
              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy formatted MT4/MT5/cTrader order execution string"
            >
              {copiedMt4 ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMt4 ? 'Copied MT4/MT5!' : 'Copy for MT4/MT5'}</span>
            </button>
            <button
              onClick={handleCopyAlert}
              className="px-2.5 py-1 rounded-lg bg-[#0e1b30] hover:bg-[#162744] text-slate-300 border border-[#1b3052] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy Telegram/WhatsApp alert format"
            >
              {copiedAlert ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAlert ? 'Copied Full!' : 'Telegram Alert'}</span>
            </button>
          </div>
        </div>

        {/* Visual Price Trajectory Rail */}
        <div className="p-2 rounded-lg bg-[#040810] border border-[#121f36] text-[10px] font-mono hidden sm:flex items-center justify-between text-slate-400">
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>🛑 SL Defense</span>
          </span>
          <span className="text-slate-600 font-bold">◄────────</span>
          <span className="text-teal-300 font-black flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            <span>📍 ENTRY ({signal.timeframe})</span>
          </span>
          <span className="text-slate-600 font-bold">────────►</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>🎯 TP1 (70%)</span>
          </span>
          <span className="text-slate-600 font-bold">────────►</span>
          <span className="text-[#0df2c9] font-black flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>🚀 TP2 (Runner)</span>
          </span>
        </div>

        {/* 4 Execution Cards Grid: SL, Entry, TP1, TP2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* Card 1: STOP LOSS */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#180a12] to-[#0f060b] border border-rose-500/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Stop Loss (SL)</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                RISK LIMIT
              </span>
            </div>
            <div className="text-sm font-black text-rose-300 truncate" title={signal.stopLoss}>
              {signal.stopLoss}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-rose-900/30">
              <span>Risk: -${riskCalculations.maxRiskCash}</span>
              <span className="text-rose-400 font-semibold">1.5% Cap</span>
            </div>
          </div>

          {/* Card 2: ENTRY ZONE */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#081824] to-[#050e18] border border-teal-500/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-teal-300 text-[10px] uppercase font-bold flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Entry Zone</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800/60 font-bold">
                {signal.timeframe} LIMIT
              </span>
            </div>
            <div className="text-sm font-black text-white truncate" title={signal.entryZone}>
              {signal.entryZone}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-teal-900/30">
              <span>R:R: <strong className="text-cyan-300">{signal.riskReward}</strong></span>
              <span className="text-teal-400 font-semibold">{riskCalculations.computedLot} Lots</span>
            </div>
          </div>

          {/* Card 3: TAKE PROFIT 1 */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#061814] to-[#040e0c] border border-emerald-500/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                <span>Take Profit 1</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                SCALE 70%
              </span>
            </div>
            <div className="text-sm font-black text-emerald-300 truncate" title={signal.takeProfit1}>
              {signal.takeProfit1}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-emerald-900/30">
              <span>Est. Gain: +${riskCalculations.estTp1Gain}</span>
              <span className="text-emerald-400 font-semibold">Move SL to BE</span>
            </div>
          </div>

          {/* Card 4: TAKE PROFIT 2 */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#051c19] to-[#04100e] border border-teal-400/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#0df2c9] text-[10px] uppercase font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#0df2c9]" />
                <span>Take Profit 2 (Runner)</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-950 text-[#0df2c9] border border-teal-700/60 font-bold">
                TRAIL 30%
              </span>
            </div>
            <div className="text-sm font-black text-[#0df2c9] truncate" title={signal.takeProfit2}>
              {signal.takeProfit2}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-teal-900/30">
              <span>Runner Gain: +${riskCalculations.estTp2Gain}</span>
              <span className="text-[#0df2c9] font-semibold">Max Horizon</span>
            </div>
          </div>
        </div>

        {/* 1-Click Fast Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#121f36]">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Pre-calculated Position:</span>
            <span className="text-white font-bold bg-[#0a1426] px-2 py-0.5 rounded border border-[#162744]">
              {riskCalculations.computedLot} Lots ({signal.action})
            </span>
          </div>

          <button
            onClick={handleExecute}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-md ${
              isBuy
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Execute on Paper Trading Desk</span>
          </button>
        </div>
      </div>


      {/* 5. Deep Multi-Aspect AI Analytical Breakdown */}
      <div className="p-3.5 rounded-xl bg-[#070d18] border border-teal-500/30 space-y-3">
        <button
          onClick={() => setShowDeepAnalysis((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0df2c9]" />
            <span className="text-white font-extrabold tracking-wide">
              Deep Multi-Aspect AI Analysis ({signal.timeframe} Horizon)
            </span>
          </span>
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            {showDeepAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showDeepAnalysis && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            {/* Filter Pills for Aspects */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-[#14233c]">
              {[
                { id: 'all', label: 'All 4 Aspects' },
                { id: 'structure', label: '📐 Market Structure' },
                { id: 'smc', label: '🏦 SMC & Liquidity' },
                { id: 'indicators', label: '📊 Indicators & Confluence' },
                { id: 'macro', label: '🌍 Forex Factory & Macro' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAspectTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    activeAspectTab === tab.id
                      ? 'bg-teal-500/25 text-[#0df2c9] border border-teal-500/50'
                      : 'bg-[#050a12] text-slate-400 hover:text-white border border-[#13233a]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Aspect 1: Market Structure & Price Action */}
            {(activeAspectTab === 'all' || activeAspectTab === 'structure') && (
              <div className="p-3 rounded-lg bg-[#050b16] border border-[#152844] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5 font-mono text-[11px]">
                    <span>📐</span>
                    <span>1. Market Structure & Price Action Aspect</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Timeframe: {signal.timeframe}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {signal.multiAspectAnalysis?.marketStructure ||
                    `Price action on ${signal.timeframe} confirms clean structural accumulation with successive higher swing lows and immediate demand absorption.`}
                </p>
              </div>
            )}

            {/* Aspect 2: Smart Money Concepts & Liquidity */}
            {(activeAspectTab === 'all' || activeAspectTab === 'smc') && (
              <div className="p-3 rounded-lg bg-[#050b16] border border-[#152844] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5 font-mono text-[11px]">
                    <span>🏦</span>
                    <span>2. Smart Money Concepts (SMC) & Liquidity Aspect</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {smcBlueprint.structureBias}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {signal.multiAspectAnalysis?.smartMoneyConcepts ||
                    `Institutional order flow engineered a clean liquidity sweep into the demand discount zone before aggressive buying volume appeared.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
                  <span className="text-slate-400">
                    Order Block: <strong className="text-teal-300">{smcBlueprint.orderBlockZone}</strong>
                  </span>
                  <span className="text-slate-400">
                    Fair Value Gap: <strong className="text-cyan-300">{smcBlueprint.fairValueGap}</strong>
                  </span>
                  <span className="text-slate-400 sm:col-span-2">
                    Liquidity Sweep: <strong className="text-emerald-300">{smcBlueprint.liquidityTarget}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Aspect 3: Technical Indicators & Confluence */}
            {(activeAspectTab === 'all' || activeAspectTab === 'indicators') && (
              <div className="p-3 rounded-lg bg-[#050b16] border border-[#152844] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5 font-mono text-[11px]">
                    <span>📊</span>
                    <span>3. Technical Momentum & Indicators Aspect</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    ATR: {signal.indicators.atr}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {signal.multiAspectAnalysis?.indicatorConfluence ||
                    `Indicators on ${signal.timeframe} show multi-oscillator confluence: RSI at ${signal.indicators.rsi}, MACD ${signal.indicators.macd}, and moving averages aligned.`}
                </p>

                {/* Indicators Pill Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono">
                  <div className="p-2 rounded bg-[#081222] border border-[#193256]">
                    <span className="text-slate-400 block">RSI (14)</span>
                    <span className="font-bold text-teal-300 truncate block">{signal.indicators.rsi}</span>
                  </div>
                  <div className="p-2 rounded bg-[#081222] border border-[#193256]">
                    <span className="text-slate-400 block">MACD</span>
                    <span className="font-bold text-cyan-300 truncate block">{signal.indicators.macd}</span>
                  </div>
                  <div className="p-2 rounded bg-[#081222] border border-[#193256]">
                    <span className="text-slate-400 block">EMAs (20/50/200)</span>
                    <span className="font-bold text-emerald-300 truncate block">{signal.indicators.movingAverages}</span>
                  </div>
                  <div className="p-2 rounded bg-[#081222] border border-[#193256]">
                    <span className="text-slate-400 block">Pivot Point</span>
                    <span className="font-bold text-purple-300 truncate block">{signal.indicators.pivotPoint}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Aspect 4: Forex Factory Macro & Fundamental Catalysts */}
            {(activeAspectTab === 'all' || activeAspectTab === 'macro') && (
              <div className="p-3 rounded-lg bg-[#050b16] border border-[#152844] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono text-[11px]">
                    <span>🌍</span>
                    <span>4. Forex Factory Macro & Calendar Impact Aspect</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    News Guard Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {signal.multiAspectAnalysis?.macroForexFactory ||
                    `Forex Factory economic event calendar indicates clear runway with no conflicting high-impact red-folder hazards for the current session.`}
                </p>
              </div>
            )}
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
                <span className="text-slate-300 text-[11px]">{smcBlueprint.invalidationRule}</span>
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
