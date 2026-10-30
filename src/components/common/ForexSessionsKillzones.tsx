import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Globe2,
  Zap,
  Activity,
  Flame,
  ArrowRight,
  ShieldCheck,
  Compass,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface SessionData {
  id: string;
  name: string;
  city: string;
  region: string;
  openUtcHour: number;
  openUtcMin: number;
  closeUtcHour: number;
  closeUtcMin: number;
  killzoneName?: string;
  killzoneStartUtcHour?: number;
  killzoneEndUtcHour?: number;
  expectedVol: 'Low' | 'Moderate' | 'High' | 'Extreme';
  avgPips: number;
  bestPairs: string[];
  description: string;
}

const FOREX_SESSIONS: SessionData[] = [
  {
    id: 'asia',
    name: 'Asian / Tokyo Session',
    city: 'Tokyo & Sydney',
    region: 'Asia-Pacific',
    openUtcHour: 0,
    openUtcMin: 0,
    closeUtcHour: 9,
    closeUtcMin: 0,
    killzoneName: 'Tokyo Open Sweep',
    killzoneStartUtcHour: 0,
    killzoneEndUtcHour: 3,
    expectedVol: 'Moderate',
    avgPips: 35,
    bestPairs: ['USD/JPY', 'AUD/USD', 'NZD/USD', 'EUR/JPY'],
    description: 'Consolidation, liquidity accumulation, and range-building before European open.',
  },
  {
    id: 'london',
    name: 'London Session',
    city: 'London & Frankfurt',
    region: 'Europe',
    openUtcHour: 7,
    openUtcMin: 0,
    closeUtcHour: 16,
    closeUtcMin: 0,
    killzoneName: 'London Open Killzone',
    killzoneStartUtcHour: 7,
    killzoneEndUtcHour: 10,
    expectedVol: 'High',
    avgPips: 75,
    bestPairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP', 'XAU/USD'],
    description: 'Judas swings, false breakouts sweeping Asian liquidity, and main trend inception.',
  },
  {
    id: 'newyork',
    name: 'New York Session',
    city: 'New York',
    region: 'Americas',
    openUtcHour: 12,
    openUtcMin: 0,
    closeUtcHour: 21,
    closeUtcMin: 0,
    killzoneName: 'NY Open / Overlap Killzone',
    killzoneStartUtcHour: 12,
    killzoneEndUtcHour: 16,
    expectedVol: 'Extreme',
    avgPips: 110,
    bestPairs: ['EUR/USD', 'GBP/USD', 'USD/CAD', 'XAU/USD', 'USD/JPY'],
    description: 'Maximum global volume, London-NY overlap, institutional macroeconomic releases (CPI, NFP, FOMC).',
  },
  {
    id: 'cbk',
    name: 'Nairobi CBK Interbank Window',
    city: 'Nairobi',
    region: 'East Africa',
    openUtcHour: 6,
    openUtcMin: 0,
    closeUtcHour: 13,
    closeUtcMin: 0,
    killzoneName: 'CBK Interbank Fixing',
    killzoneStartUtcHour: 8,
    killzoneEndUtcHour: 11,
    expectedVol: 'Moderate',
    avgPips: 45,
    bestPairs: ['USD/KES', 'GBP/KES', 'EUR/KES'],
    description: 'Commercial bank foreign exchange clearing, diaspora remittance flows, and corporate import settlement.',
  },
];

interface ForexSessionsKillzonesProps {
  currentTicker?: string;
  onSelectPair?: (pair: string) => void;
}

export const ForexSessionsKillzones: React.FC<ForexSessionsKillzonesProps> = ({
  currentTicker = 'EUR/USD',
  onSelectPair,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format UTC and Local times
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  const currentUtcDecimal = utcHours + utcMinutes / 60 + utcSeconds / 3600;

  // Nairobi EAT is UTC+3
  const eatHours = (utcHours + 3) % 24;
  const eatMinutes = utcMinutes;

  // Session statuses
  const sessionStates = useMemo(() => {
    return FOREX_SESSIONS.map((session) => {
      const openTime = session.openUtcHour + session.openUtcMin / 60;
      const closeTime = session.closeUtcHour + session.closeUtcMin / 60;

      let isOpen = false;
      if (openTime <= closeTime) {
        isOpen = currentUtcDecimal >= openTime && currentUtcDecimal < closeTime;
      } else {
        // Crosses midnight
        isOpen = currentUtcDecimal >= openTime || currentUtcDecimal < closeTime;
      }

      // Check Killzone
      let inKillzone = false;
      if (session.killzoneStartUtcHour !== undefined && session.killzoneEndUtcHour !== undefined) {
        inKillzone =
          currentUtcDecimal >= session.killzoneStartUtcHour &&
          currentUtcDecimal < session.killzoneEndUtcHour;
      }

      // Compute time remaining until open or close
      let remainingMinutes = 0;
      let label = '';
      if (isOpen) {
        let diff = closeTime - currentUtcDecimal;
        if (diff < 0) diff += 24;
        remainingMinutes = Math.floor(diff * 60);
        const h = Math.floor(remainingMinutes / 60);
        const m = remainingMinutes % 60;
        label = `Closes in ${h}h ${m}m`;
      } else {
        let diff = openTime - currentUtcDecimal;
        if (diff < 0) diff += 24;
        remainingMinutes = Math.floor(diff * 60);
        const h = Math.floor(remainingMinutes / 60);
        const m = remainingMinutes % 60;
        label = `Opens in ${h}h ${m}m`;
      }

      return {
        ...session,
        isOpen,
        inKillzone,
        timeLabel: label,
      };
    });
  }, [currentUtcDecimal]);

  // Overall Market Volatility State
  const activeSessionsCount = sessionStates.filter((s) => s.isOpen).length;
  const inLondonNyOverlap =
    currentUtcDecimal >= 12 && currentUtcDecimal < 16; // 12:00 - 16:00 UTC

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#091120] border border-[#162744] shadow-xl space-y-4">
      {/* Header with Live UTC & EAT clocks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
              Forex Liquidity Engine
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
              LIVE KILLZONES
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>Forex Market Sessions & Killzones Radar</span>
          </h3>
        </div>

        {/* Clocks */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#060c18] border border-[#14223a] text-center">
            <span className="text-[9px] text-slate-400 block uppercase">UTC Time</span>
            <span className="text-sm font-black text-cyan-300">
              {String(utcHours).padStart(2, '0')}:{String(utcMinutes).padStart(2, '0')}:{String(utcSeconds).padStart(2, '0')}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#060c18] border border-[#14223a] text-center">
            <span className="text-[9px] text-slate-400 block uppercase">Nairobi (EAT / UTC+3)</span>
            <span className="text-sm font-black text-emerald-400">
              {String(eatHours).padStart(2, '0')}:{String(eatMinutes).padStart(2, '0')}:{String(utcSeconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* London / NY Overlap Highlight Banner */}
      {inLondonNyOverlap ? (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-cyan-950/80 border border-emerald-500/50 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-black text-emerald-300 block">
                🔥 LONDON-NEW YORK OVERLAP KILLZONE ACTIVE
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                Highest global liquidity window (15:00 - 19:00 EAT). Tightest spreads and optimal SMC institutional order flow.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500 text-slate-950">
            PEAK VOLUME
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-[#060c18] border border-[#14223a] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Market Status:</span>
            <span className="text-emerald-400 font-bold">
              {activeSessionsCount} of 4 Major Sessions Active
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Next Peak Overlap: 15:00 EAT (12:00 UTC)
          </span>
        </div>
      )}

      {/* 4 Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sessionStates.map((session) => (
          <div
            key={session.id}
            className={`p-3.5 rounded-xl border transition-all ${
              session.inKillzone
                ? 'bg-[#0a1a2e] border-teal-500/60 shadow-lg shadow-teal-500/10'
                : session.isOpen
                ? 'bg-[#091526] border-emerald-500/40'
                : 'bg-[#060d19] border-[#14233c] opacity-80'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-1 mb-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {session.city}
                </span>
                <h4 className="text-xs font-bold text-white">{session.name}</h4>
              </div>

              {session.inKillzone ? (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black font-mono bg-teal-400 text-slate-950 animate-pulse">
                  ⚡ KILLZONE
                </span>
              ) : session.isOpen ? (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  OPEN
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold font-mono bg-slate-800 text-slate-400">
                  CLOSED
                </span>
              )}
            </div>

            {/* Time badge */}
            <div className="p-2 rounded-lg bg-[#050b14] border border-[#111e33] text-[11px] font-mono space-y-1 mb-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>EAT Hours:</span>
                <span className="text-white font-semibold">
                  {String((session.openUtcHour + 3) % 24).padStart(2, '0')}:00 -{' '}
                  {String((session.closeUtcHour + 3) % 24).padStart(2, '0')}:00
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Countdown:</span>
                <span
                  className={
                    session.isOpen ? 'text-emerald-400 font-bold' : 'text-amber-400 font-semibold'
                  }
                >
                  {session.timeLabel}
                </span>
              </div>
            </div>

            {/* Expected Volatility & Pips */}
            <div className="flex items-center justify-between text-xs font-mono mb-2.5 pb-2 border-b border-[#14233c]">
              <span className="text-[10px] text-slate-400">Expected Vol:</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  session.expectedVol === 'Extreme'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : session.expectedVol === 'High'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {session.expectedVol} (~{session.avgPips} pips)
              </span>
            </div>

            {/* Best Pairs */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-mono block">
                Top Active Pairs:
              </span>
              <div className="flex flex-wrap gap-1">
                {session.bestPairs.map((pair) => (
                  <button
                    key={pair}
                    onClick={() => onSelectPair?.(pair)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      currentTicker === pair
                        ? 'bg-teal-500 text-slate-950 font-black'
                        : 'bg-[#0f1d33] text-slate-300 hover:text-white hover:bg-[#182c4d]'
                    }`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SMC Session Playbook Tip */}
      <div className="p-3 rounded-xl bg-[#060c18] border border-[#14233c] flex items-start gap-2.5 text-xs text-slate-300">
        <Compass className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold text-white text-[11px]">
            Institutional Session Playbook (ICT / SMC):
          </span>
          <p className="text-slate-400 text-[11px]">
            The <strong className="text-white">Asian Session</strong> builds the range (Equal Highs & Lows). The{' '}
            <strong className="text-white">London Open Killzone (10:00 - 13:00 EAT)</strong> engineers the liquidity manipulation sweep (Judas Swing) to grab Asian stop losses. The{' '}
            <strong className="text-white">New York Session (15:00 - 19:00 EAT)</strong> expands the true institutional trend or creates a key market structure shift (MSS).
          </p>
        </div>
      </div>
    </div>
  );
};
