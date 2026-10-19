import React from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Wallet,
  SlidersHorizontal,
  Shield,
  ShieldCheck,
  TrendingUp,
  Target,
  CreditCard,
  Users,
  Crown,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';

const ICON_MAP: Record<string, React.ElementType> = {
  Wallet,
  SlidersHorizontal,
  Shield,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Target,
  CreditCard,
  Users,
  Award,
  Crown,
};

export const MilestonesView: React.FC = () => {
  const { badges, setActiveTab } = useFinance();

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const overallPercentage = Math.round((unlockedCount / badges.length) * 100);

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const getActionForBadge = (badgeId: string) => {
    switch (badgeId) {
      case 'first-entry':
        return { label: 'Log Transaction', tab: 'income' as const };
      case 'budget-disciplined':
        return { label: 'Set Budgets', tab: 'budget' as const };
      case 'emergency-starter':
      case 'financial-fortress':
        return { label: 'Top Up Emergency', tab: 'emergency' as const };
      case 'active-investor':
        return { label: 'Add Investment', tab: 'investments' as const };
      case 'goal-crusher':
        return { label: 'View Goals', tab: 'savings' as const };
      case 'debt-slayer':
        return { label: 'Manage Debt', tab: 'debt' as const };
      case 'chama-champion':
        return { label: 'Join Chama', tab: 'chama' as const };
      case 'centurion':
      case 'mullah-millionaire':
        return { label: 'View Net Worth', tab: 'reports' as const };
      default:
        return { label: 'View Dashboard', tab: 'dashboard' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Financial Milestones & Badges</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track your journey from first shilling to millionaire status with gamified real-time achievements.
          </p>
        </div>

        {unlockedCount > 0 && (
          <button
            onClick={handleCelebrate}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] font-bold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Milestones</span>
          </button>
        )}
      </div>

      {/* Journey Completion Hero Card */}
      <div className="bg-gradient-to-r from-[#0c1c2e] via-[#0e2238] to-[#0c1828] border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Mullah Journey Progress
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              {unlockedCount} of {badges.length} Badges Unlocked ({overallPercentage}%)
            </div>
            <p className="text-xs text-slate-400">
              Each milestone represents a permanent foundation stone of your financial freedom.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9] text-2xl font-mono font-extrabold shadow-inner">
              {overallPercentage}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 w-full bg-[#080d17] rounded-full h-2.5 overflow-hidden">
          <div
            style={{ width: `${overallPercentage}%` }}
            className="bg-gradient-to-r from-teal-400 to-[#0df2c9] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#0df2c9]"
          />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const Icon = ICON_MAP[badge.icon] || Award;
          const action = getActionForBadge(badge.id);

          return (
            <div
              key={badge.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-[#0e192c] border-teal-500/40 shadow-lg shadow-teal-500/5'
                  : 'bg-[#0a0f1a] border-[#152033] opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      badge.unlocked
                        ? 'bg-teal-500/20 border-teal-500/40 text-[#0df2c9] shadow-[0_0_15px_rgba(13,242,201,0.2)]'
                        : 'bg-[#121c2d] border-[#1b2b42] text-slate-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      badge.unlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {badge.unlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    {badge.title}
                    {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-[#0df2c9]" />}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#141e30] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Milestone Progress</span>
                  <span className="font-mono text-slate-300 font-semibold">{badge.progress}%</span>
                </div>

                <div className="w-full bg-[#070b14] h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${badge.progress}%` }}
                    className={`h-full rounded-full transition-all ${
                      badge.unlocked ? 'bg-[#0df2c9]' : 'bg-slate-600'
                    }`}
                  />
                </div>

                {!badge.unlocked && (
                  <button
                    onClick={() => setActiveTab(action.tab)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#213554] text-teal-300 text-xs font-medium transition-colors"
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
