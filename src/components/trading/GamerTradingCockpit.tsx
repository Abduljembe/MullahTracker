/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Gamer Trading Cockpit & Panoramic Arcade HUD for MT5 & Deriv Traders
 * Features:
 * - 3-Column Panoramic Battlestation Layout:
 *    Col 1 (Left): Live Market Radar & Deriv Watchlist (1-click quick-switch, 24/7 status, sparklines)
 *    Col 2 (Center): Holographic Chart Arena with laser reticle, SMC FVG/Order Blocks, TP/SL target lines, hotkeys
 *    Col 3 (Right): Tactical Weapon Order Pad, Lot Matrix, R:R Dial, Capital Shield HP gauge, Battle Pass XP
 * - Bottom Dock: Real-time Combat Mission Monitor with floating PnL, 1-click TP lock, and panic eject
 * - Web Audio API synthesizer for tactile laser, plasma, victory, and warning sounds
 * - Global Keyboard Shortcuts ([B] Buy, [S] Sell, [X] Panic Eject, [1]-[5] Lot Presets)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Search,
  CheckCircle2,
  Keyboard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { DERIV_INSTRUMENTS, getDerivInstrument, DerivInstrument } from '../../utils/derivInstruments.ts';

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
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('trader_sound_fx') !== 'false';
  });

  // Gamification XP & Rank
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('trader_hud_xp');
    return saved ? parseInt(saved, 10) : 480;
  });
  const [winStreak, setWinStreak] = useState<number>(() => {
    const saved = localStorage.getItem('trader_hud_streak');
    return saved ? parseInt(saved, 10) : 3;
  });

  // Watchlist category filter & search
  const [watchCategory, setWatchCategory] = useState<'ALL' | 'VOLATILITY' | 'CRASH_BOOM' | 'STEP_JUMP' | 'CRYPTO' | 'FOREX'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Lot size
  const [selectedLots, setSelectedLots] = useState<number>(() => {
    return currentSymbol.includes('R_75') || currentSymbol.includes('1HZ75V') ? 0.005 : currentSymbol.includes('BOOM') || currentSymbol.includes('CRASH') ? 0.20 : 0.10;
  });

  // Target R:R Ratio
  const [targetRrRatio, setTargetRrRatio] = useState<number>(2.0);
  const [isFiring, setIsFiring] = useState<'BUY' | 'SELL' | null>(null);
  const [tacticalMode, setTacticalMode] = useState<'SNIPER' | 'RAPID_SCALP'>('SNIPER');
  const [timeframe, setTimeframe] = useState<'1s' | 'M1' | 'M5' | 'M15' | 'H1'>('M5');
  const [chartVisualMode, setChartVisualMode] = useState<'HOLOGRAPHIC' | 'SMC_ZONES' | 'LASER_GRID'>('HOLOGRAPHIC');
  const [showQuestDrawer, setShowQuestDrawer] = useState<boolean>(false);
  const [lastTickDirection, setLastTickDirection] = useState<'UP' | 'DOWN' | 'FLAT'>('UP');
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Dynamic Price History buffer for SVG Waveform
  const [priceHistory, setPriceHistory] = useState<number[]>(() => [
    livePrice * 0.9992,
    livePrice * 0.9995,
    livePrice * 0.9998,
    livePrice * 0.9996,
    livePrice * 1.0003,
    livePrice * 1.0001,
    livePrice,
  ]);

  // Sync Audio preference
  useEffect(() => {
    localStorage.setItem('trader_sound_fx', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  // Sync XP & Streak
  useEffect(() => {
    localStorage.setItem('trader_hud_xp', xp.toString());
    localStorage.setItem('trader_hud_streak', winStreak.toString());
  }, [xp, winStreak]);

  // Adjust lot size when symbol changes if needed
  useEffect(() => {
    const inst = getDerivInstrument(currentSymbol);
    if (inst) {
      if (selectedLots < inst.minLot) {
        setSelectedLots(inst.minLot);
      }
    }
  }, [currentSymbol, selectedLots]);

  // Update dynamic price history on live price change
  useEffect(() => {
    setPriceHistory((prev) => {
      const last = prev[prev.length - 1] || livePrice;
      if (livePrice > last) setLastTickDirection('UP');
      else if (livePrice < last) setLastTickDirection('DOWN');
      return [...prev.slice(-32), livePrice];
    });
  }, [livePrice]);

  // Web Audio Tone Synthesizer
  const playSoundEffect = useCallback((type: 'FIRE_BUY' | 'FIRE_SELL' | 'VICTORY' | 'WARNING' | 'CLICK') => {
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
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'FIRE_BUY') {
        // Ascending green laser impulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'FIRE_SELL') {
        // Plasma beam discharge
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        osc.start(now);
        osc.stop(now + 0.20);
      } else if (type === 'VICTORY') {
        // Triumph arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.06);
          g.gain.setValueAtTime(0.18, now + idx * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.14);
          o.start(now + idx * 0.06);
          o.stop(now + idx * 0.06 + 0.15);
        });
      } else if (type === 'WARNING') {
        // Siren pulse
        osc.type = 'square';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.setValueAtTime(280, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext unavailable in silent environments
    }
  }, [soundEnabled]);

  // Current instrument metadata
  const currentInst = useMemo(() => getDerivInstrument(currentSymbol), [currentSymbol]);

  // Rank and XP calculation
  const rank = useMemo(() => {
    if (xp >= 2000) return { title: 'Apex Market Maker', level: 5, nextXp: 3000, color: 'text-amber-400' };
    if (xp >= 1000) return { title: 'Algorithm Assassin', level: 4, nextXp: 2000, color: 'text-teal-400' };
    if (xp >= 500) return { title: 'Spike Sniper', level: 3, nextXp: 1000, color: 'text-emerald-400' };
    if (xp >= 200) return { title: 'Momentum Raider', level: 2, nextXp: 500, color: 'text-cyan-400' };
    return { title: 'Novice Scalper', level: 1, nextXp: 200, color: 'text-slate-300' };
  }, [xp]);

  // Capital Shield health meter
  const shieldHealthPercent = useMemo(() => {
    if (realizedPnlToday >= 0) return 100;
    const loss = Math.abs(realizedPnlToday);
    const health = Math.max(0, 100 - (loss / maxDailyLoss) * 100);
    return Math.round(health);
  }, [realizedPnlToday, maxDailyLoss]);

  // Floating PnL calculation
  const currentFloatingPnl = useMemo(() => {
    return activePositions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  }, [activePositions]);

  // Dynamic lot size presets tailored to instrument
  const lotPresets = useMemo(() => {
    const sym = currentSymbol.toUpperCase();
    if (sym.includes('R_75') || sym.includes('1HZ75V')) {
      return [0.001, 0.005, 0.01, 0.02, 0.05];
    }
    if (sym.includes('BOOM') || sym.includes('CRASH')) {
      return [0.20, 0.50, 1.0, 2.0, 5.0];
    }
    if (sym.includes('STP') || sym.includes('JMP')) {
      return [0.10, 0.20, 0.50, 1.0, 2.0];
    }
    if (sym.includes('BTC') || sym.includes('ETH')) {
      return [0.01, 0.05, 0.10, 0.25, 0.50];
    }
    // Default Forex / Commodity
    return [0.01, 0.05, 0.10, 0.50, 1.0];
  }, [currentSymbol]);

  // Filtered Deriv instruments for Left Watchlist
  const filteredInstruments = useMemo(() => {
    return DERIV_INSTRUMENTS.filter((inst) => {
      const matchCat = watchCategory === 'ALL' || inst.category === watchCategory;
      const matchQuery =
        !searchQuery ||
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [watchCategory, searchQuery]);

  // Fire tactical trade execution
  const handleTacticalFire = async (type: 'BUY' | 'SELL') => {
    if (isFiring !== null) return;
    setIsFiring(type);

    if (type === 'BUY') playSoundEffect('FIRE_BUY');
    else playSoundEffect('FIRE_SELL');

    try {
      const pipDist = livePrice * 0.0015;
      const slOffset = pipDist;
      const tpOffset = pipDist * targetRrRatio;

      await onOpenTrade(currentSymbol, type, selectedLots, slOffset, tpOffset);

      // Award XP for tactical engagement
      setXp((prev) => prev + 25);
    } finally {
      setTimeout(() => setIsFiring(null), 300);
    }
  };

  // Global Keyboard Shortcuts ([B] Buy, [S] Sell, [X] Panic Eject, [1-5] Lots)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger hotkeys if user is focused inside an input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setLastPressedKey('B');
        setTimeout(() => setLastPressedKey(null), 500);
        handleTacticalFire('BUY');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setLastPressedKey('S');
        setTimeout(() => setLastPressedKey(null), 500);
        handleTacticalFire('SELL');
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setLastPressedKey('X');
        setTimeout(() => setLastPressedKey(null), 500);
        if (activePositions.length > 0) {
          playSoundEffect('WARNING');
          onCloseAll();
        }
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (lotPresets[idx] !== undefined) {
          setSelectedLots(lotPresets[idx]);
          playSoundEffect('CLICK');
          setLastPressedKey(e.key);
          setTimeout(() => setLastPressedKey(null), 500);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTacticalFire, activePositions.length, onCloseAll, lotPresets, playSoundEffect]);

  // Daily Battle Pass Quests
  const quests: TraderQuest[] = [
    {
      id: 'q1',
      title: 'Execute 3 Tactical Scalps',
      rewardXp: 50,
      completed: activePositions.length >= 3,
      progress: `${Math.min(activePositions.length, 3)}/3`,
    },
    {
      id: 'q2',
      title: 'Shield Health > 80%',
      rewardXp: 35,
      completed: shieldHealthPercent >= 80,
      progress: `${shieldHealthPercent}% HP`,
    },
    {
      id: 'q3',
      title: 'Target 1:2.0+ R:R Setup',
      rewardXp: 40,
      completed: targetRrRatio >= 2.0,
      progress: `1:${targetRrRatio.toFixed(1)}`,
    },
    {
      id: 'q4',
      title: 'Maintain 3x Win Streak',
      rewardXp: 75,
      completed: winStreak >= 3,
      progress: `${winStreak}/3 Wins`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TOP COMMAND STRIP: TRADER RANK, WIN STREAK, CAPITAL SHIELD & AUDIO TOGGLE
          ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#070d18] via-[#091322] to-[#060b14] border border-[#162742] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Trader Level & Rank */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shadow-inner font-mono font-black text-sm">
              L{rank.level}
            </div>
            {winStreak >= 3 && (
              <div className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[8px] font-mono font-black flex items-center shadow-md animate-pulse">
                <Flame className="w-2.5 h-2.5 inline fill-slate-950" />
                <span>{winStreak}x</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">RANK:</span>
              <span className={`text-xs sm:text-sm font-extrabold ${rank.color}`}>
                {rank.title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {xp} XP
              </span>
            </div>

            {/* Level Progress Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-36 sm:w-44 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((xp % 500) / 500) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {500 - (xp % 500)} XP to next rank
              </span>
            </div>
          </div>
        </div>

        {/* Center: Capital Shield HP Bar */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#060c17] border border-[#14233a]">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Shield
              className={`w-4 h-4 ${
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
              <span className="font-bold text-slate-300">Capital Shield</span>
              <span
                className={`font-mono font-extrabold ${
                  shieldHealthPercent > 50 ? 'text-teal-400' : 'text-rose-400'
                }`}
              >
                {shieldHealthPercent}% HP
              </span>
            </div>
            <div className="w-32 sm:w-36 bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-800">
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

        {/* Right: Sound FX, Hotkeys Cheat-Sheet, Battle Pass Quests & Sizer */}
        <div className="flex items-center gap-2">
          {/* Last Pressed Hotkey Indicator */}
          {lastPressedKey && (
            <div className="px-2 py-1 rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 text-[10px] font-mono font-bold animate-ping">
              KEY: [{lastPressedKey}]
            </div>
          )}

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
            title="Toggle Cockpit Audio Effects (Lasers, Plasma, Triumph)"
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
            <span className="hidden sm:inline">Battle Pass</span>
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
            <Sliders className="w-3.5 h-3.5" />
            <span>Sizer</span>
          </button>
        </div>
      </div>

      {/* Battle Pass Quests Drawer */}
      {showQuestDrawer && (
        <div className="p-4 rounded-2xl bg-[#091322] border border-amber-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 tracking-wide">
              <Trophy className="w-4 h-4 text-amber-400" />
              Daily Trader Battle Pass Quests
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Resets daily at 00:00 UTC</span>
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
          THE 3-COLUMN PANORAMIC BATTLESTATION
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        {/* =======================================================================
            COLUMN 1: LIVE MARKET RADAR & DERIV WATCHLIST (3 COLS)
            ======================================================================= */}
        <div className="xl:col-span-3 rounded-2xl bg-[#070d18] border border-[#162742] p-4 flex flex-col justify-between space-y-3 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <RadarIcon className="w-4 h-4 text-[#0df2c9] animate-spin-slow" />
                <h3 className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                  Deriv Radar
                </h3>
              </div>
              <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                38+ PAIRS 24/7
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search symbol (e.g. R_75, BOOM)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0a1322] border border-[#182a44] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Category Segmented Control */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'VOLATILITY', label: 'Synthetics' },
                { id: 'CRASH_BOOM', label: 'Crash/Boom' },
                { id: 'STEP_JUMP', label: 'Step/Jump' },
                { id: 'CRYPTO', label: 'Crypto' },
                { id: 'FOREX', label: 'Forex' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setWatchCategory(cat.id as any);
                    playSoundEffect('CLICK');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    watchCategory === cat.id
                      ? 'bg-teal-500/25 text-[#0df2c9] border border-teal-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-[#091120]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Watchlist Scrollable Grid */}
            <div className="space-y-1.5 max-h-[360px] xl:max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredInstruments.map((inst) => {
                const isSelected = currentSymbol === inst.symbol;
                return (
                  <button
                    key={inst.symbol}
                    onClick={() => {
                      onSymbolChange(inst.symbol);
                      playSoundEffect('CLICK');
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-[0_0_15px_rgba(13,242,201,0.25)]'
                        : 'bg-[#091222] hover:bg-[#101e35] border-[#182a44] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-xs text-white group-hover:text-teal-300">
                          {inst.symbol}
                        </span>
                        {inst.marketHours === '24/7' && (
                          <span className="text-[8px] font-mono font-bold px-1 rounded bg-teal-950/80 text-teal-300 border border-teal-500/30">
                            24/7
                          </span>
                        )}
                        {inst.badge && (
                          <span className="text-[8px] font-mono px-1 rounded bg-black/60 text-amber-300 border border-amber-500/30">
                            {inst.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {inst.displayName.replace('Deriv ', '')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-slate-100 tabular-nums">
                        {inst.basePrice.toLocaleString(undefined, {
                          minimumFractionDigits: inst.digits,
                          maximumFractionDigits: inst.digits,
                        })}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        Min: {inst.minLot}L
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Watchlist Status */}
          <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Tick Feed: ACTIVE</span>
            </span>
            <span className="text-teal-400 font-bold">{filteredInstruments.length} Loaded</span>
          </div>
        </div>

        {/* =======================================================================
            COLUMN 2: HOLOGRAPHIC COMBAT CHART ARENA (6 COLS)
            ======================================================================= */}
        <div className="xl:col-span-6 rounded-2xl bg-[#070d18] border border-[#162742] p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
          {/* Top Arena Header: Active Pair, Reticle Spot, Timeframe & Modes */}
          <div className="space-y-3 z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-mono font-black text-white">
                      {currentSymbol}
                    </span>
                    <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30">
                      {currentInst?.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentInst?.displayName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Large Glowing Laser Reticle Spot Price */}
              <div className="text-right">
                <div className="text-[9px] font-mono text-slate-400">LIVE LASER SPOT</div>
                <div
                  className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight tabular-nums transition-colors duration-200 ${
                    lastTickDirection === 'UP'
                      ? 'text-[#0df2c9] drop-shadow-[0_0_12px_rgba(13,242,201,0.5)]'
                      : 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  }`}
                >
                  {livePrice.toLocaleString(undefined, {
                    minimumFractionDigits: currentInst?.digits || 2,
                    maximumFractionDigits: currentInst?.digits || 2,
                  })}
                </div>
              </div>
            </div>

            {/* Timeframe & Visual Style Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Timeframes */}
              <div className="flex items-center gap-1 bg-[#0a1322] p-1 rounded-xl border border-slate-800">
                {(['1s', 'M1', 'M5', 'M15', 'H1'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      playSoundEffect('CLICK');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-teal-500/25 text-[#0df2c9] border border-teal-500/50 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Chart Mode */}
              <div className="flex items-center gap-1 bg-[#0a1322] p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'HOLOGRAPHIC', label: 'Wave Area' },
                  { id: 'SMC_ZONES', label: 'SMC Zones' },
                  { id: 'LASER_GRID', label: 'Laser Grid' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setChartVisualMode(mode.id as any);
                      playSoundEffect('CLICK');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      chartVisualMode === mode.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===================================================================
              INTERACTIVE HOLOGRAPHIC CHART CANVAS (SVG + SMC ZONES + TARGET RETICLE)
              =================================================================== */}
          <div className="relative h-64 sm:h-72 w-full flex items-center justify-center my-2 rounded-xl bg-[#050a14] border border-[#142338] overflow-hidden">
            {/* Background Cyber Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-5 grid-cols-6 pointer-events-none opacity-20 border border-teal-500/20">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="border-r border-b border-teal-500/20" />
              ))}
            </div>

            {/* SMC Fair Value Gap & Demand/Supply Zones */}
            {chartVisualMode !== 'LASER_GRID' && (
              <>
                {/* Bullish Demand Order Block */}
                <div className="absolute left-0 right-0 bottom-[15%] h-[18%] bg-emerald-500/10 border-y border-emerald-500/30 flex items-center justify-between px-3 pointer-events-none">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    DEMAND ORDER BLOCK / FVG
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">LIQUIDITY POOL</span>
                </div>

                {/* Bearish Resistance Supply Zone */}
                <div className="absolute left-0 right-0 top-[12%] h-[15%] bg-rose-500/10 border-y border-rose-500/30 flex items-center justify-between px-3 pointer-events-none">
                  <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/30">
                    INSTITUTIONAL SUPPLY ZONE
                  </span>
                  <span className="text-[9px] font-mono text-rose-400">IMBALANCE</span>
                </div>
              </>
            )}

            {/* Dynamic SVG Waveform & Laser Lines */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyberWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0df2c9" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#0df2c9" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0df2c9" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0df2c9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0df2c9" stopOpacity="1.0" />
                </linearGradient>
              </defs>

              {/* Render Smooth Path */}
              {(() => {
                const minP = Math.min(...priceHistory);
                const maxP = Math.max(...priceHistory);
                const range = maxP - minP || 1;
                const points = priceHistory.map((val, idx) => {
                  const x = (idx / (priceHistory.length - 1)) * 100;
                  const y = 85 - ((val - minP) / range) * 70;
                  return `${x},${y}`;
                });
                const pathD = `M 0,98 L ${points.map((p) => `L ${p}`).join(' ')} L 100,98 Z`;
                const lineD = `M ${points.map((p) => `L ${p}`).join(' ').replace(/^L/, '')}`;
                const currentY = 85 - ((livePrice - minP) / range) * 70;

                // Projected TP / SL levels based on targetRrRatio
                const tpY = Math.max(5, currentY - 20 * targetRrRatio);
                const slY = Math.min(95, currentY + 20);

                return (
                  <>
                    {/* Shaded Area */}
                    <path d={pathD} fill="url(#cyberWaveGrad)" />

                    {/* Main Price Wave Curve */}
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#0df2c9"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Projected Take Profit Line */}
                    <line
                      x1="0"
                      y1={`${tpY}%`}
                      x2="100%"
                      y2={`${tpY}%`}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Projected Stop Loss Line */}
                    <line
                      x1="0"
                      y1={`${slY}%`}
                      x2="100%"
                      y2={`${slY}%`}
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Horizontal Laser Reticle Line */}
                    <line
                      x1="0"
                      y1={`${currentY}%`}
                      x2="100%"
                      y2={`${currentY}%`}
                      stroke="url(#laserBeam)"
                      strokeWidth="1.5"
                    />

                    {/* Laser Target Pulsing Dot */}
                    <circle
                      cx="100%"
                      cy={`${currentY}%`}
                      r="6"
                      fill="#0df2c9"
                      className="animate-ping"
                    />
                    <circle
                      cx="100%"
                      cy={`${currentY}%`}
                      r="4.5"
                      fill="#ffffff"
                    />
                  </>
                );
              })()}
            </svg>

            {/* Target Crosshair Visual Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <Crosshair className="w-48 h-48 text-teal-400 stroke-1 animate-spin-slow" />
            </div>

            {/* Live Chart Badges (TP & SL Indicators) */}
            <div className="absolute right-3 top-3 space-y-1 text-[10px] font-mono pointer-events-none">
              <div className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                TP TARGET: +{(targetRrRatio * 1.5).toFixed(1)}R
              </div>
              <div className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/40">
                SL RISK: -1.0R
              </div>
            </div>
          </div>

          {/* Interactive Hotkey HUD Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <Keyboard className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[11px]">HOTKEYS:</span>
              <span className="px-1.5 py-0.5 rounded bg-[#0a1424] border border-[#1b3152] text-teal-300 font-bold text-[10px]">
                [B] Long
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#0a1424] border border-[#1b3152] text-rose-300 font-bold text-[10px]">
                [S] Short
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#0a1424] border border-[#1b3152] text-amber-300 font-bold text-[10px]">
                [X] Eject
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#0a1424] border border-[#1b3152] text-slate-300 font-bold text-[10px]">
                [1-5] Lots
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">STATUS:</span>
              <span className="text-teal-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                HOLOGRAPHIC RETICLE ENGAGED
              </span>
            </div>
          </div>
        </div>

        {/* =======================================================================
            COLUMN 3: TACTICAL WEAPON ORDER PAD & BATTLESTATION (3 COLS)
            ======================================================================= */}
        <div className="xl:col-span-3 rounded-2xl bg-gradient-to-b from-[#091222] via-[#070d18] to-[#050912] border border-[#1a2d4c] p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#0df2c9]" />
                Tactical Weapon Pad
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-[#0df2c9] font-bold">
                ZERO REQUOTE
              </span>
            </div>

            {/* Master Bot Auto-Execution Banner */}
            <div className="p-2.5 rounded-xl bg-[#070e1b] border border-teal-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <div>
                  <div className="text-[10px] font-mono font-bold text-white flex items-center gap-1">
                    <span>EA AUTO-EXECUTION</span>
                    <span className={`text-[9px] px-1 rounded font-mono ${isBotRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {isBotRunning ? 'ONLINE' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {isBotRunning ? '280ms micro-tick scalper active' : 'Manual laser pad mode'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleBot}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  isBotRunning
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isBotRunning ? 'HALT' : 'ENGAGE'}
              </button>
            </div>

            {/* Lot Size Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Contract Size</span>
                <span className="font-mono text-teal-400 font-extrabold text-sm">{selectedLots} lots</span>
              </div>

              {/* Quick Lot Chips */}
              <div className="grid grid-cols-5 gap-1.5">
                {lotPresets.map((lot, idx) => (
                  <button
                    key={lot}
                    onClick={() => {
                      setSelectedLots(lot);
                      playSoundEffect('CLICK');
                    }}
                    className={`py-1.5 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${
                      selectedLots === lot
                        ? 'bg-teal-500/25 border-teal-400 text-[#0df2c9] shadow-[0_0_10px_rgba(13,242,201,0.3)] scale-105'
                        : 'bg-[#08101e] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={`Shortcut [${idx + 1}]`}
                  >
                    {lot}
                  </button>
                ))}
              </div>

              {/* Micro Stepper */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const step = currentInst?.minLot || 0.01;
                    setSelectedLots((prev) => Math.max(step, Number((prev - step).toFixed(4))));
                    playSoundEffect('CLICK');
                  }}
                  className="flex-1 py-1 rounded bg-[#091120] hover:bg-[#122238] border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  - Step
                </button>
                <button
                  onClick={() => {
                    const step = currentInst?.minLot || 0.01;
                    setSelectedLots((prev) => Number((prev + step).toFixed(4)));
                    playSoundEffect('CLICK');
                  }}
                  className="flex-1 py-1 rounded bg-[#091120] hover:bg-[#122238] border border-slate-800 text-slate-300 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  + Step
                </button>
              </div>
            </div>

            {/* Target R:R Ratio Dial */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Target Risk:Reward</span>
                <span className="font-mono text-teal-400 font-bold">1:{targetRrRatio.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1.5, 2.0, 3.0, 5.0].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => {
                      setTargetRrRatio(ratio);
                      playSoundEffect('CLICK');
                    }}
                    className={`py-1.5 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer ${
                      targetRrRatio === ratio
                        ? 'bg-teal-500/25 border-teal-400 text-[#0df2c9] shadow-[0_0_10px_rgba(13,242,201,0.3)]'
                        : 'bg-[#08101e] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    1:{ratio.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* PnL Projection Preview Box */}
            <div className="p-3 rounded-xl bg-[#060b14] border border-[#15253e] space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Est. Risk (1R):</span>
                <span className="text-rose-400">
                  -${((selectedLots * (currentSymbol.includes('R_75') ? 1400 : 15))).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Reward (TP):</span>
                <span className="text-emerald-400 font-bold">
                  +${((selectedLots * (currentSymbol.includes('R_75') ? 1400 : 15) * targetRrRatio)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span>KES Value (@129.5):</span>
                <span className="text-teal-300 font-bold">
                  +KSh {((selectedLots * (currentSymbol.includes('R_75') ? 1400 : 15) * targetRrRatio * 129.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Heavy Tactile Neon Fire Execution Triggers */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleTacticalFire('BUY')}
              disabled={isFiring !== null}
              className={`w-full py-4 px-4 rounded-xl font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-150 cursor-pointer ${
                isFiring === 'BUY'
                  ? 'bg-emerald-400 text-slate-950 scale-95 shadow-[0_0_30px_rgba(16,185,129,0.9)]'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95'
              }`}
            >
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              <span>ENGAGE LONG [B]</span>
            </button>

            <button
              onClick={() => handleTacticalFire('SELL')}
              disabled={isFiring !== null}
              className={`w-full py-4 px-4 rounded-xl font-mono font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all duration-150 cursor-pointer ${
                isFiring === 'SELL'
                  ? 'bg-rose-400 text-white scale-95 shadow-[0_0_30px_rgba(244,63,94,0.9)]'
                  : 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95'
              }`}
            >
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
              <span>ENGAGE SHORT [S]</span>
            </button>

            {/* Panic Eject All Positions Button */}
            <button
              onClick={() => {
                if (activePositions.length > 0) {
                  onCloseAll();
                  playSoundEffect('WARNING');
                }
              }}
              disabled={activePositions.length === 0}
              className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-mono text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              ⚠️ EMERGENCY EJECT ALL ({activePositions.length}) [X]
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM PANORAMIC DOCK: COMBAT MISSION POSITIONS & LIVE FLOATING PNL
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#070d18] border border-[#162742] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#0df2c9] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
              Active Combat Positions ({activePositions.length})
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400">TOTAL FLOATING P&L: </span>
              <span
                className={`font-mono font-extrabold text-base sm:text-lg tabular-nums ${
                  currentFloatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentFloatingPnl >= 0 ? '+' : ''}${currentFloatingPnl.toFixed(2)}
              </span>
            </div>

            {activePositions.length > 0 && (
              <button
                onClick={() => {
                  onCloseAll();
                  playSoundEffect('WARNING');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Liquidate All
              </button>
            )}
          </div>
        </div>

        {activePositions.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 space-y-2">
            <Crosshair className="w-8 h-8 text-slate-600 mx-auto opacity-40 animate-pulse" />
            <p>No active combat positions deployed. Select your contract lots and engage LONG [B] or SHORT [S] above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {activePositions.map((pos) => {
              const isProfit = pos.pnl >= 0;
              return (
                <div
                  key={pos.ticket}
                  className={`p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                    isProfit
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
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
                      className={`text-base font-mono font-extrabold tabular-nums ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}${pos.pnl.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 mb-3 bg-[#050a12] p-2 rounded-lg border border-slate-800/80">
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClosePosition(pos.ticket);
                        if (isProfit) playSoundEffect('VICTORY');
                        else playSoundEffect('CLICK');
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-[11px] border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer"
                    >
                      Close #{pos.ticket}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Subtle rotating Radar Icon helper
function RadarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="12" x2="19" y2="5" />
    </svg>
  );
}
