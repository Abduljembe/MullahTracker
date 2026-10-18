import React from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  Scale,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const HealthScoreModal: React.FC = () => {
  const {
    isHealthModalOpen,
    setIsHealthModalOpen,
    financialHealth,
    currentPeriod,
    setActiveTab,
  } = useFinance();

  if (!isHealthModalOpen) return null;

  const {
    score,
    status,
    color,
    savingsRateScore,
    emergencyScore,
    debtScore,
    budgetScore,
    tips,
  } = financialHealth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e1626] border border-[#1e2d48] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#162237] bg-[#0b121f]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" style={{ color }} />
            <h3 className="text-base font-bold text-white">Financial Health Breakdown</h3>
          </div>
          <button
            onClick={() => setIsHealthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Big Score Hero */}
          <div className="p-5 rounded-2xl bg-[#111c2e] border border-[#1d2d47] text-center space-y-2">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Assessment for {currentPeriod}
            </div>

            <div className="text-4xl md:text-5xl font-extrabold font-mono" style={{ color }}>
              {score}
              <span className="text-lg text-slate-500 font-sans"> / 100</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${color}20`, color }}>
              <span>Status: {status}</span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto pt-1">
              Your financial health score evaluates your savings discipline, liquidity runway, debt leverage, and long-term asset accumulation.
            </p>
          </div>

          {/* 4 Pillars Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Scoring Pillars
            </h4>

            {/* Pillar 1 */}
            <div className="p-3.5 rounded-xl bg-[#121c2d] border border-[#1b2b44] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Monthly Savings Rate (Goal: 20%+)
                </span>
                <span className="font-mono text-emerald-400 font-bold">{savingsRateScore} / 30 pts</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(savingsRateScore / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-3.5 rounded-xl bg-[#121c2d] border border-[#1b2b44] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Emergency Buffer (Goal: 3-6 Months)
                </span>
                <span className="font-mono text-indigo-400 font-bold">{emergencyScore} / 25 pts</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${(emergencyScore / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-3.5 rounded-xl bg-[#121c2d] border border-[#1b2b44] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-400" />
                  Debt-to-Income Manageability
                </span>
                <span className="font-mono text-rose-400 font-bold">{debtScore} / 25 pts</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${(debtScore / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-3.5 rounded-xl bg-[#121c2d] border border-[#1b2b44] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Investment & Growth Assets
                </span>
                <span className="font-mono text-amber-400 font-bold">{budgetScore} / 20 pts</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(budgetScore / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Tailored Steps to Reach 80+ (Excellent)
            </h4>

            <div className="space-y-2 text-xs">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0c1424] border border-[#17253a] flex items-start gap-2.5 text-slate-300"
                >
                  <span className="text-teal-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#162237] bg-[#0b121f] flex justify-between items-center">
          <button
            onClick={() => {
              setIsHealthModalOpen(false);
              setActiveTab('insights');
            }}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
          >
            <span>View Full Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsHealthModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
