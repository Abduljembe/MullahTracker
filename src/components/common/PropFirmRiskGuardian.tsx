import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingDown,
  Percent,
  CheckCircle2,
  DollarSign,
  Heart,
  Timer,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PropFirmRiskGuardianProps {
  currentTicker?: string;
  onAlertTriggered?: (msg: string) => void;
}

export const PropFirmRiskGuardian: React.FC<PropFirmRiskGuardianProps> = ({
  currentTicker = 'EUR/USD',
  onAlertTriggered,
}) => {
  // Account settings
  const [accountSize, setAccountSize] = useState<number>(() => {
    try {
      const s = localStorage.getItem('prop_account_size');
      return s ? parseFloat(s) : 10000;
    } catch {
      return 10000;
    }
  });

  const [currentEquity, setCurrentEquity] = useState<number>(() => {
    try {
      const s = localStorage.getItem('prop_current_equity');
      return s ? parseFloat(s) : 10000;
    } catch {
      return 10000;
    }
  });

  const [dailyStartingEquity, setDailyStartingEquity] = useState<number>(() => {
    try {
      const s = localStorage.getItem('prop_daily_start_equity');
      return s ? parseFloat(s) : 10000;
    } catch {
      return 10000;
    }
  });

  // Limits
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState<number>(4.0); // FTMO style 4-5%
  const [maxTotalLossPercent, setMaxTotalLossPercent] = useState<number>(8.0); // 8-10% total max loss
  const [riskPerTradeLimitPercent, setRiskPerTradeLimitPercent] = useState<number>(1.5);

  // Consecutive losses & Tilt state
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(() => {
    try {
      const s = localStorage.getItem('prop_consecutive_losses');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [tiltLockExpiresAt, setTiltLockExpiresAt] = useState<number | null>(() => {
    try {
      const s = localStorage.getItem('prop_tilt_expires');
      return s ? parseInt(s, 10) : null;
    } catch {
      return null;
    }
  });

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);

  // Pre-flight Trade Checklist
  const [checklist, setChecklist] = useState({
    htfBias: false,
    liquiditySweep: false,
    fvgOrderBlock: false,
    riskUnderLimit: false,
    noNewsWithin30m: false,
    hardStopLossPlaced: false,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('prop_account_size', String(accountSize));
    localStorage.setItem('prop_current_equity', String(currentEquity));
    localStorage.setItem('prop_daily_start_equity', String(dailyStartingEquity));
    localStorage.setItem('prop_consecutive_losses', String(consecutiveLosses));
    if (tiltLockExpiresAt) {
      localStorage.setItem('prop_tilt_expires', String(tiltLockExpiresAt));
    } else {
      localStorage.removeItem('prop_tilt_expires');
    }
  }, [accountSize, currentEquity, dailyStartingEquity, consecutiveLosses, tiltLockExpiresAt]);

  // Countdown timer for tilt lockout
  useEffect(() => {
    if (!tiltLockExpiresAt) {
      setTimeRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((tiltLockExpiresAt - now) / 1000));
      setTimeRemainingSeconds(diff);
      if (diff <= 0) {
        setTiltLockExpiresAt(null);
        setConsecutiveLosses(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tiltLockExpiresAt]);

  // Drawdown Calculations
  const dailyPnL = currentEquity - dailyStartingEquity;
  const dailyPnLPercent = (dailyPnL / dailyStartingEquity) * 100;
  const maxDailyAllowedLossCash = (dailyStartingEquity * maxDailyLossPercent) / 100;
  const remainingDailyLossBuffer = maxDailyAllowedLossCash + dailyPnL; // e.g. 400 + (-150) = 250 left

  const totalPnL = currentEquity - accountSize;
  const totalPnLPercent = (totalPnL / accountSize) * 100;
  const maxTotalAllowedLossCash = (accountSize * maxTotalLossPercent) / 100;
  const remainingTotalLossBuffer = maxTotalAllowedLossCash + totalPnL;

  // Breach Warnings
  const isDailyBreached = dailyPnL <= -maxDailyAllowedLossCash;
  const isTotalBreached = totalPnL <= -maxTotalAllowedLossCash;
  const isDailyWarning = !isDailyBreached && remainingDailyLossBuffer <= maxDailyAllowedLossCash * 0.3;

  // Activate Tilt Lock (e.g. 30 minutes cooldown)
  const handleTriggerTiltLock = (minutes: number = 30) => {
    const expires = Date.now() + minutes * 60 * 1000;
    setTiltLockExpiresAt(expires);
    onAlertTriggered?.(
      `🛡️ Anti-Tilt Circuit Breaker Activated! Trading locked for ${minutes} minutes to protect your capital.`
    );
  };

  const handleSimulateTradeResult = (pnl: number) => {
    const nextEquity = Math.round((currentEquity + pnl) * 100) / 100;
    setCurrentEquity(nextEquity);

    if (pnl < 0) {
      const nextLosses = consecutiveLosses + 1;
      setConsecutiveLosses(nextLosses);
      if (nextLosses >= 3 && !tiltLockExpiresAt) {
        handleTriggerTiltLock(30);
      }
    } else {
      setConsecutiveLosses(0);
    }
  };

  const isLocked = Boolean(tiltLockExpiresAt && timeRemainingSeconds > 0) || isDailyBreached || isTotalBreached;

  const checklistCount = Object.values(checklist).filter(Boolean).length;
  const isChecklistComplete = checklistCount === 6;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#091120] border border-[#162744] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
              Capital Preservation Sentinel
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              FTMO / MFF READY
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Prop Firm Risk Guardian & Anti-Tilt Lockout</span>
          </h3>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-black font-mono flex items-center gap-1.5 animate-pulse">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>TERMINAL LOCKED (COOLDOWN)</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black font-mono flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>RISK GUARD CLEAR</span>
            </span>
          )}
        </div>
      </div>

      {/* Tilt Lockout Active Banner */}
      {tiltLockExpiresAt && timeRemainingSeconds > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-red-950/60 to-purple-950/80 border border-rose-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-rose-400 animate-ping" />
            <div>
              <span className="text-xs font-black text-rose-200 block uppercase">
                🛡️ Emotional Tilt Circuit Breaker Engaged!
              </span>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                3 consecutive losses detected. Step away from the screen, breathe, and avoid revenge trading.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-rose-500/40 text-center font-mono">
              <span className="text-[9px] text-slate-400 block uppercase">Cooldown Left</span>
              <span className="text-base font-extrabold text-rose-400">
                {Math.floor(timeRemainingSeconds / 60)}:
                {String(timeRemainingSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => {
                setTiltLockExpiresAt(null);
                setConsecutiveLosses(0);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-[10px] font-mono text-rose-200 cursor-pointer"
            >
              Manual Override
            </button>
          </div>
        </div>
      )}

      {/* Drawdown Metrics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Metric 1: Account Equity */}
        <div className="p-3 rounded-xl bg-[#060c18] border border-[#14233c] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Account Equity</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-base font-black text-white">
            ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400">
            Initial: ${accountSize.toLocaleString()}
          </div>
        </div>

        {/* Metric 2: Daily Drawdown Guard */}
        <div
          className={`p-3 rounded-xl border space-y-1 ${
            isDailyBreached
              ? 'bg-rose-950/40 border-rose-500/60'
              : isDailyWarning
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-[#060c18] border-[#14233c]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold">
            <span className={isDailyBreached ? 'text-rose-400' : 'text-slate-400'}>
              Daily Loss ({maxDailyLossPercent}%)
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                dailyPnL >= 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {dailyPnL >= 0 ? '+' : ''}
              {dailyPnLPercent.toFixed(2)}%
            </span>
          </div>
          <div
            className={`text-base font-black ${
              dailyPnL >= 0
                ? 'text-emerald-400'
                : isDailyBreached
                ? 'text-rose-400'
                : 'text-rose-300'
            }`}
          >
            {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">
            Buffer Left:{' '}
            <strong className={remainingDailyLossBuffer <= 100 ? 'text-rose-400' : 'text-emerald-400'}>
              ${Math.max(0, remainingDailyLossBuffer).toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Metric 3: Total Trailing Drawdown */}
        <div
          className={`p-3 rounded-xl border space-y-1 ${
            isTotalBreached
              ? 'bg-rose-950/40 border-rose-500/60'
              : 'bg-[#060c18] border-[#14233c]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Total DD ({maxTotalLossPercent}%)</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                totalPnL >= 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {totalPnL >= 0 ? '+' : ''}
              {totalPnLPercent.toFixed(2)}%
            </span>
          </div>
          <div
            className={`text-base font-black ${
              totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-300'
            }`}
          >
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">
            Max Loss Limit: -${maxTotalAllowedLossCash.toFixed(0)}
          </div>
        </div>

        {/* Metric 4: Risk Per Trade Limit */}
        <div className="p-3 rounded-xl bg-[#060c18] border border-[#14233c] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Max Risk / Trade</span>
            <span className="text-[9px] text-purple-400 font-bold">{riskPerTradeLimitPercent}% Rule</span>
          </div>
          <div className="text-base font-black text-purple-300">
            ${((currentEquity * riskPerTradeLimitPercent) / 100).toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">
            Consecutive Losses:{' '}
            <strong className={consecutiveLosses >= 2 ? 'text-rose-400' : 'text-slate-300'}>
              {consecutiveLosses} / 3 max
            </strong>
          </div>
        </div>
      </div>

      {/* Pre-Flight Trade Execution Checklist */}
      <div className="p-3.5 rounded-xl bg-[#060c18] border border-[#14233c] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Pre-Flight Execution Checklist ({checklistCount}/6 Verified)
            </h4>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isChecklistComplete
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isChecklistComplete ? 'READY TO EXECUTE' : 'UNVERIFIED RISKS'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {[
            {
              id: 'htfBias',
              label: '1. Higher Timeframe (4H/Daily) Trend Aligned',
              desc: 'Trade direction matches macro institutional order flow',
            },
            {
              id: 'liquiditySweep',
              label: '2. Liquidity Sweep / Stop Hunt Confirmed',
              desc: 'Equal highs/lows or Asian range swept prior to entry',
            },
            {
              id: 'fvgOrderBlock',
              label: '3. Tap into Fair Value Gap or Order Block',
              desc: 'Entry price is resting at institutional discount/premium',
            },
            {
              id: 'riskUnderLimit',
              label: `4. Risk ≤ ${riskPerTradeLimitPercent}% ($${((currentEquity * riskPerTradeLimitPercent) / 100).toFixed(0)})`,
              desc: 'Calculated lot size will not exceed maximum loss allowance',
            },
            {
              id: 'noNewsWithin30m',
              label: '5. No High-Impact Red Folder News in 30m',
              desc: 'Forex Factory calendar checked for CPI, NFP, or FOMC',
            },
            {
              id: 'hardStopLossPlaced',
              label: '6. Hard Structural Invalidation Stop Loss Placed',
              desc: 'Never trade without a predefined hard broker stop loss',
            },
          ].map((item) => {
            const key = item.id as keyof typeof checklist;
            const checked = checklist[key];
            return (
              <button
                key={item.id}
                onClick={() => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  checked
                    ? 'bg-teal-950/40 border-teal-500/50 text-white'
                    : 'bg-[#080f1d] border-[#14223a] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    checked
                      ? 'bg-teal-500 border-teal-400 text-slate-950'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className={`text-[11px] font-bold block ${checked ? 'text-teal-200' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator / Reset Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#14233c] text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">Quick Trade Simulator:</span>
          <button
            onClick={() => handleSimulateTradeResult(150)}
            className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 text-[10px] cursor-pointer"
          >
            +$150 Win
          </button>
          <button
            onClick={() => handleSimulateTradeResult(-100)}
            className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-300 text-[10px] cursor-pointer"
          >
            -$100 Loss
          </button>
          <button
            onClick={() => handleTriggerTiltLock(15)}
            className="px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-purple-300 text-[10px] cursor-pointer"
          >
            Test 15m Tilt Lock
          </button>
        </div>

        <button
          onClick={() => {
            setCurrentEquity(accountSize);
            setDailyStartingEquity(accountSize);
            setConsecutiveLosses(0);
            setTiltLockExpiresAt(null);
            setChecklist({
              htfBias: false,
              liquiditySweep: false,
              fvgOrderBlock: false,
              riskUnderLimit: false,
              noNewsWithin30m: false,
              hardStopLossPlaced: false,
            });
          }}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Day Stats</span>
        </button>
      </div>
    </div>
  );
};
