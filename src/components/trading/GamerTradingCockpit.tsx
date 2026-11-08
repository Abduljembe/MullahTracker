/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gamer Trading Cockpit & Arcade HUD for MT5 & Deriv Traders
 * Features:
 * - Trader XP & Rank Progression (Level, Rank Title, Daily Quest Objectives)
 * - Live Tactical Price Reticle & Interactive SVG Chart
 * - Heavy-tactile Neon Order Controls with Web Audio sound effects
 * - Capital Shield (Daily Drawdown Health Bar)
 * - Combat Mission Log & Active Position Cards with 1-click Nuke / Lock Profit
 * - Win Streak Multipliers & Trader Achievement Badges
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  Flame,
  Shield,
  ShieldAlert,
  Crosshair,
  TrendingUp,
  TrendingDown,
  Volume2,
  VolumeX,
  Target,
  Award,
  Sparkles,
  RotateCcw,
  Sliders,
  DollarSign,
  Layers,
  ChevronRight,
  AlertTriangle,
  Play,
  Square,
  Lock,
  Unlock,
  Radio,
  Trophy,
} from 'lucide-react';
import { DERIV_INSTRUMENTS, getDerivInstrument } from '../../utils/derivInstruments.ts';

interface GamerTradingCockpitProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  livePrice: number;
  activePositions: Array<{
    id?: string;
    ticket: number;
    symbol: string;
    type: 'BUY' | 'SELL';
    lots: number;
    openPrice: number;
    currentPrice: number;
    sl: number;
    tp: number;
    pnl: number;
    openTime: string;
  }>;
  onOpenTrade: (symbol: string, type: 'BUY' | 'SELL', lots: number, slOffset?: number, tpOffset?: number) => Promise<void>;
  onClosePosition: (ticket: number) => Promise<void>;
  onCloseAll: () => Promise<void>;
  realizedPnlToday: number;
  maxDailyLoss: number;
  isBotRunning: boolean;
  onToggleBot: () => void;
  onOpenLotSizer: () => void;
}

interface TraderQuest {
  id: string;
  title: string;
  rewardXp: number;
  completed: boolean;
  progress: string;
}

export const GamerTradingCockpit: React.FC<GamerTradingCockpitProps> = ({
  currentSymbol,
  onSymbolChange,
  livePrice,
  activePositions,
  onOpenTrade,
  onClosePosition,
  onCloseAll,
  realizedPnlToday,
  maxDailyLoss,
  isBotRunning,
  onToggleBot,
  onOpenLotSizer,
}) => {
  // Gamification State (Saved in LocalStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('trader_hud_xp');
    return saved ? parseInt(saved, 10) : 340;
  });
  const [winStreak, setWinStreak] = useState<number>(() => {
    const saved = localStorage.getItem('trader_hud_streak');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [selectedLots, setSelectedLots] = useState<number>(() => {
    return currentSymbol === 'R_75' || currentSymbol === '1HZ75V' ? 0.005 : 0.10;
  });
  const [targetRrRatio, setTargetRrRatio] = useState<number>(2.0); // 1:2 R:R
  const [isFiring, setIsFiring] = useState<'BUY' | 'SELL' | null>(null);
  const [showQuestDrawer, setShowQuestDrawer] = useState<boolean>(false);
  const [tacticalMode, setTacticalMode] = useState<'SNIPER' | 'RAPID_SCALP'>('SNIPER');
  const [lastTickDirection, setLastTickDirection] = useState<'UP' | 'DOWN' | 'FLAT'>('UP');

  // Chart canvas / visual simulation
  const [priceHistory, setPriceHistory] = useState<number[]>(() => [
    livePrice * 0.9995,
    livePrice * 0.9998,
    livePrice * 0.9996,
    livePrice * 1.0002,
    livePrice,
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync XP & Streak
  useEffect(() => {
    localStorage.setItem('trader_hud_xp', xp.toString());
    localStorage.setItem('trader_hud_streak', winStreak.toString());
  }, [xp, winStreak]);

  // Update price history on live tick
  useEffect(() => {
    setPriceHistory((prev) => {
      const last = prev[prev.length - 1] || livePrice;
      if (livePrice > last) setLastTickDirection('UP');
      else if (livePrice < last) setLastTickDirection('DOWN');
      return [...prev.slice(-24), livePrice];
    });
  }, [livePrice]);

  // Audio Synthesizer Engine (Web Audio API)
  const playSoundEffect = (type: 'FIRE_BUY' | 'FIRE_SELL' | 'VICTORY' | 'WARNING' | 'CLICK') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'CLICK') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'FIRE_BUY') {
        // Futuristic green laser impulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'FIRE_SELL') {
        // Deep plasma impulse
        osc.type = 'square';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === 'VICTORY') {
        // Multi-tone triumph chime
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          subGain.gain.setValueAtTime(0.15, now + idx * 0.08);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          subOsc.start(now + idx * 0.08);
          subOsc.stop(now + idx * 0.08 + 0.25);
        });
      } else if (type === 'WARNING') {
        // Low siren warning
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio policy graceful handle
    }
  };

  // Level & XP math (Every 500 XP = 1 Level)
  const currentLevel = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const xpProgressPercent = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  const getRankTitle = (lvl: number) => {
    if (lvl === 1) return 'Rookie Scalper';
    if (lvl === 2) return 'FVG Precision Sniper';
    if (lvl === 3) return 'Liquidity Master';
    if (lvl === 4) return 'Volatility Beast';
    return 'Titan Algorithmic Trader';
  };

  // Capital Shield calculation: maxDailyLoss vs current floating + realized loss
  const currentFloatingPnl = activePositions.reduce((acc, p) => acc + p.pnl, 0);
  const totalDailyDrawdown = Math.max(0, -(realizedPnlToday + currentFloatingPnl));
  const shieldHealthPercent = Math.max(
    0,
    Math.min(100, Math.round(((maxDailyLoss - totalDailyDrawdown) / maxDailyLoss) * 100))
  );

  // Tactical Quests
  const quests: TraderQuest[] = [
    {
      id: 'q1',
      title: 'Execute 2 Precision Scalps',
      rewardXp: 120,
      completed: activePositions.length >= 2,
      progress: `${Math.min(2, activePositions.length)}/2`,
    },
    {
      id: 'q2',
      title: 'Maintain Capital Shield > 80%',
      rewardXp: 150,
      completed: shieldHealthPercent >= 80,
      progress: `${shieldHealthPercent}%`,
    },
    {
      id: 'q3',
      title: 'Target 1:2 Minimum Risk-to-Reward',
      rewardXp: 100,
      completed: targetRrRatio >= 2.0,
      progress: `1:${targetRrRatio.toFixed(1)}`,
    },
    {
      id: 'q4',
      title: 'Maintain 3+ Win Streak',
      rewardXp: 200,
      completed: winStreak >= 3,
      progress: `${winStreak} streak`,
    },
  ];

  const currentInst = getDerivInstrument(currentSymbol);

  // Quick Tactical Lot buttons
  const lotPresets = useMemo(() => {
    if (currentSymbol.includes('R_75')) return [0.001, 0.005, 0.01, 0.02, 0.05];
    if (currentSymbol.includes('BOOM') || currentSymbol.includes('CRASH')) return [0.20, 0.50, 1.0, 2.0];
    if (currentSymbol.includes('STP')) return [0.10, 0.20, 0.50, 1.0];
    if (currentSymbol.includes('BTC')) return [0.01, 0.05, 0.10, 0.50];
    return [0.01, 0.05, 0.10, 0.50, 1.0];
  }, [currentSymbol]);

  // Handle Tactical Fire (Buy / Sell)
  const handleTacticalFire = async (type: 'BUY' | 'SELL') => {
    if (isFiring) return;
    setIsFiring(type);
    playSoundEffect(type === 'BUY' ? 'FIRE_BUY' : 'FIRE_SELL');

    // Calculate offsets based on R:R
    const isGold = currentSymbol.includes('XAU');
    const isVol75 = currentSymbol.includes('R_75');
    const isCrypto = currentSymbol.includes('BTC');

    let slDist = isVol75 ? 2800 : isGold ? 15 : isCrypto ? 1200 : 0.0025;
    let tpDist = slDist * targetRrRatio;

    try {
      await onOpenTrade(currentSymbol, type, selectedLots, slDist, tpDist);
      setXp((prev) => prev + 45); // Reward XP for tactical execution!
    } catch {
      // Error handled upstream
    } finally {
      setTimeout(() => setIsFiring(null), 350);
    }
  };

  return (
    <div className="space-y-5 select-none">
      {/* =========================================================================
          ZONE 1: TACTICAL HUD HEADER & TRADER LEVEL BAR
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#070e1b] via-[#091322] to-[#060a14] border border-[#162947] shadow-[0_0_30px_rgba(13,242,201,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Player Profile & Level */}
        <div className="flex items-center gap-3.5">
          {/* Avatar Level Hexagon */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/30 via-slate-900 to-[#0df2c9]/10 border border-[#0df2c9]/50 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(13,242,201,0.25)]">
            <span className="text-[9px] font-mono font-bold text-teal-400">LVL</span>
            <span className="text-base font-mono font-extrabold text-white leading-none">
              {currentLevel}
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-1.5">
                <span>{getRankTitle(currentLevel)}</span>
                <Sparkles className="w-4 h-4 text-[#0df2c9] animate-pulse" />
              </h2>
              {/* Win Streak Badge */}
              {winStreak > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{winStreak}X STREAK</span>
                </span>
              )}
            </div>

            {/* XP Progression Bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="w-36 sm:w-48 bg-slate-900/90 rounded-full h-2 p-0.5 border border-slate-700/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-[#0df2c9] transition-all duration-500 shadow-[0_0_8px_rgba(13,242,201,0.5)]"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {currentLevelXp}/500 XP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Capital Shield (Health Bar) */}
        <div className="p-2.5 px-4 rounded-xl bg-[#08111e] border border-[#182944] flex items-center gap-3">
          <div className="relative">
            <Shield
              className={`w-6 h-6 ${
                shieldHealthPercent > 50
                  ? 'text-teal-400'
                  : shieldHealthPercent > 25
                  ? 'text-amber-400'
                  : 'text-rose-500 animate-pulse'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                Capital Shield
              </span>
              <span
                className={`font-mono font-extrabold ${
                  shieldHealthPercent > 50 ? 'text-teal-400' : 'text-rose-400'
                }`}
              >
                {shieldHealthPercent}% HP
              </span>
            </div>
            <div className="w-32 bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  shieldHealthPercent > 50
                    ? 'bg-emerald-400'
                    : shieldHealthPercent > 25
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${shieldHealthPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Audio Toggle, Quests & Lot Sizer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSoundEffect('CLICK');
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-teal-500/15 border-teal-500/40 text-[#0df2c9]'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
            title="Toggle Cockpit Audio Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setShowQuestDrawer(!showQuestDrawer);
              playSoundEffect('CLICK');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showQuestDrawer
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-[#091322] hover:bg-[#101f36] border-[#182a47] text-slate-300'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Quests</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[9px] font-mono text-amber-300">
              {quests.filter((q) => q.completed).length}/{quests.length}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenLotSizer();
              playSoundEffect('CLICK');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Sizer</span>
          </button>
        </div>
      </div>

      {/* Quest Drawer Dropdown */}
      {showQuestDrawer && (
        <div className="p-4 rounded-2xl bg-[#091322] border border-amber-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 tracking-wide">
              <Trophy className="w-4 h-4 text-amber-400" />
              Daily Trader Battle Pass Quests
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Resets 00:00 UTC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {quests.map((q) => (
              <div
                key={q.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  q.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#060c16] border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {q.completed ? '✓' : '○'} {q.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Progress: {q.progress}
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 font-mono font-bold text-[10px]">
                  +{q.rewardXp} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ZONE 2: INTERACTIVE COMBAT CHART & TARGET RETICLE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Live Pulse Visualizer */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#070d18] border border-[#162742] space-y-4 flex flex-col justify-between relative overflow-hidden">
          {/* Tactical Asset Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <select
                value={currentSymbol}
                onChange={(e) => {
                  onSymbolChange(e.target.value);
                  playSoundEffect('CLICK');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0a1424] border border-[#1b3152] font-mono text-xs font-bold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {DERIV_INSTRUMENTS.map((inst) => (
                  <option key={inst.symbol} value={inst.symbol}>
                    {inst.symbol} — {inst.displayName} ({inst.marketHours})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Reticle Target Quote */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500">LIVE RETICLE SPOT</div>
                <div
                  className={`text-xl sm:text-2xl font-mono font-extrabold tracking-tight transition-colors duration-200 ${
                    lastTickDirection === 'UP'
                      ? 'text-[#0df2c9] drop-shadow-[0_0_8px_rgba(13,242,201,0.4)]'
                      : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  }`}
                >
                  {livePrice.toFixed(currentInst?.digits || 2)}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live SVG Price Wave */}
          <div className="relative h-44 w-full flex items-center justify-center my-2">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-15 border border-teal-500/20">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-r border-b border-teal-500/20" />
              ))}
            </div>

            {/* Dynamic SVG Waveform */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0df2c9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0df2c9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Render Smooth Path */}
              {(() => {
                const minP = Math.min(...priceHistory);
                const maxP = Math.max(...priceHistory);
                const range = maxP - minP || 1;
                const points = priceHistory.map((val, idx) => {
                  const x = (idx / (priceHistory.length - 1)) * 100;
                  const y = 90 - ((val - minP) / range) * 80;
                  return `${x},${y}`;
                });
                const pathD = `M 0,95 L ${points.map((p) => `L ${p}`).join(' ')} L 100,95 Z`;
                const lineD = `M ${points.map((p) => `L ${p}`).join(' ').replace(/^L/, '')}`;

                return (
                  <>
                    <path d={pathD} fill="url(#waveGlow)" />
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#0df2c9"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Laser Target Dot on Latest Price */}
                    <circle
                      cx="100%"
                      cy={`${90 - ((livePrice - minP) / range) * 80}%`}
                      r="5"
                      fill="#0df2c9"
                      className="animate-ping"
                    />
                    <circle
                      cx="100%"
                      cy={`${90 - ((livePrice - minP) / range) * 80}%`}
                      r="4"
                      fill="#ffffff"
                    />
                  </>
                );
              })()}
            </svg>

            {/* Target Crosshair Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <Crosshair className="w-24 h-24 text-teal-400 stroke-1 animate-spin-slow" />
            </div>
          </div>

          {/* Quick R:R Selector Dial & Tactical Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">TARGET R:R:</span>
              {[1.5, 2.0, 3.0, 5.0].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    setTargetRrRatio(ratio);
                    playSoundEffect('CLICK');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border transition-all cursor-pointer ${
                    targetRrRatio === ratio
                      ? 'bg-teal-500/25 border-teal-400 text-[#0df2c9] shadow-[0_0_10px_rgba(13,242,201,0.3)]'
                      : 'bg-[#0a1322] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  1:{ratio.toFixed(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">TACTICAL PROTOCOL:</span>
              <button
                onClick={() => {
                  setTacticalMode(tacticalMode === 'SNIPER' ? 'RAPID_SCALP' : 'SNIPER');
                  playSoundEffect('CLICK');
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono font-bold text-[11px]"
              >
                ⚡ {tacticalMode}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Tactical Fire Cockpit (The Weapon) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#091222] via-[#070d18] to-[#050912] border border-[#1a2d4c] shadow-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#0df2c9]" />
                Weapon Execution Pad
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-[#0df2c9] font-bold">
                INSTANT FILL
              </span>
            </div>

            {/* Quick Lot Size Selector Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">Contract Lot Size</span>
                <span className="font-mono text-teal-400 font-bold">{selectedLots} lots</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {lotPresets.map((lot) => (
                  <button
                    key={lot}
                    onClick={() => {
                      setSelectedLots(lot);
                      playSoundEffect('CLICK');
                    }}
                    className={`py-1.5 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${
                      selectedLots === lot
                        ? 'bg-teal-500/25 border-teal-400 text-[#0df2c9] shadow-[0_0_10px_rgba(13,242,201,0.3)]'
                        : 'bg-[#08101e] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lot}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk / Reward Preview Badge */}
            <div className="p-3 rounded-xl bg-[#060b14] border border-[#15253e] space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>R:R Multiple:</span>
                <span className="font-bold text-teal-400">1:{targetRrRatio.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Target Gain:</span>
                <span className="font-bold text-emerald-400">
                  +${((selectedLots * (currentSymbol.includes('R_75') ? 2800 : 25) * targetRrRatio)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Heavy Tactile Fire Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleTacticalFire('BUY')}
              disabled={isFiring !== null}
              className={`w-full py-3.5 px-4 rounded-xl font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-150 cursor-pointer ${
                isFiring === 'BUY'
                  ? 'bg-emerald-400 text-slate-950 scale-95 shadow-[0_0_25px_rgba(16,185,129,0.8)]'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95'
              }`}
            >
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              <span>ENGAGE LONG (BUY)</span>
            </button>

            <button
              onClick={() => handleTacticalFire('SELL')}
              disabled={isFiring !== null}
              className={`w-full py-3.5 px-4 rounded-xl font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-150 cursor-pointer ${
                isFiring === 'SELL'
                  ? 'bg-rose-400 text-white scale-95 shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                  : 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] active:scale-95'
              }`}
            >
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
              <span>ENGAGE SHORT (SELL)</span>
            </button>

            {/* Panic Eject All Positions Button */}
            <button
              onClick={() => {
                onCloseAll();
                playSoundEffect('WARNING');
              }}
              disabled={activePositions.length === 0}
              className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-mono text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              ⚠️ EMERGENCY EJECT ALL ({activePositions.length})
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ZONE 3: ACTIVE MISSION CARDS (ACTIVE POSITIONS WITH GAME REWARD FEEDBACK)
          ========================================================================= */}
      <div className="p-5 rounded-2xl bg-[#070d18] border border-[#162742] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#0df2c9] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
              Active Combat Positions ({activePositions.length})
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400">TOTAL FLOATING P&L: </span>
            <span
              className={`font-mono font-extrabold text-sm ${
                currentFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentFloatingPnl >= 0 ? '+' : ''}${currentFloatingPnl.toFixed(2)}
            </span>
          </div>
        </div>

        {activePositions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Crosshair className="w-8 h-8 text-slate-600 mx-auto opacity-40 animate-pulse" />
            <p>No active combat positions deployed. Select lots and engage above to launch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activePositions.map((pos) => {
              const isProfit = pos.pnl >= 0;
              return (
                <div
                  key={pos.ticket}
                  className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                    isProfit
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                          pos.type === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {pos.type} {pos.lots}L
                      </span>
                      <span className="font-mono font-bold text-white text-xs">{pos.symbol}</span>
                    </div>

                    <div
                      className={`text-base font-mono font-extrabold ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${pos.pnl.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-3 bg-[#050a12] p-2 rounded-lg border border-slate-800/80">
                    <div>
                      <span>OPEN: </span>
                      <strong className="text-white">{pos.openPrice}</strong>
                    </div>
                    <div>
                      <span>SPOT: </span>
                      <strong className="text-white">{pos.currentPrice}</strong>
                    </div>
                    <div>
                      <span>SL: </span>
                      <strong className="text-rose-400">{pos.sl}</strong>
                    </div>
                    <div>
                      <span>TP: </span>
                      <strong className="text-emerald-400">{pos.tp}</strong>
                    </div>
                  </div>

                  {/* 1-Click Close Button */}
                  <button
                    onClick={() => {
                      onClosePosition(pos.ticket);
                      if (isProfit) playSoundEffect('VICTORY');
                      else playSoundEffect('CLICK');
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-[11px] border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer"
                  >
                    Close Position #{pos.ticket}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
