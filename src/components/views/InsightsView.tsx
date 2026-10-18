import React from 'react';
import {
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  PieChart,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const InsightsView: React.FC = () => {
  const {
    formatCurrency,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    savingsThisMonth,
    savingsRate,
    totalInvestments,
    totalEmergencyFund,
    totalDebt,
    emergencyFund,
    expenses,
    financialHealth,
    setActiveTab,
  } = useFinance();

  // 50/30/20 Rule Analysis
  // Needs: Rent, Food, Utilities, Transport, Healthcare
  // Wants: Entertainment, Shopping, Dining
  // Savings: Savings + Investments
  const needsCategories = ['Rent & Housing', 'Food & Groceries', 'Transport & Fuel', 'Utilities & Bills', 'Healthcare', 'Education'];
  const wantsCategories = ['Entertainment & Dining', 'Shopping', 'Other'];

  const needsSpent = expenses
    .filter((e) => needsCategories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const wantsSpent = expenses
    .filter((e) => wantsCategories.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const savingsAllocated = Math.max(0, savingsThisMonth);

  const totalConsidered = totalMonthlyIncome > 0 ? totalMonthlyIncome : (needsSpent + wantsSpent + savingsAllocated) || 1;

  const needsPct = Math.round((needsSpent / totalConsidered) * 100);
  const wantsPct = Math.round((wantsSpent / totalConsidered) * 100);
  const savingsPct = Math.round((savingsAllocated / totalConsidered) * 100);

  const monthsRunway = emergencyFund.monthlyEssentialExpenses > 0
    ? (totalEmergencyFund / emergencyFund.monthlyEssentialExpenses).toFixed(1)
    : totalMonthlyExpenses > 0
    ? (totalEmergencyFund / totalMonthlyExpenses).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1c30] to-[#0a1626] border border-teal-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Financial Diagnostic & Insights</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated financial assessment based on your income streams, spending patterns, and wealth trajectory.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 50/30/20 Rule and Emergency Buffer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 50/30/20 Budget Rule */}
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#162237]">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">The 50 / 30 / 20 Benchmark</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Standard Rule</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The classic budgeting benchmark recommends spending 50% on essentials, 30% on lifestyle wants, and 20% on future savings & debt paydown.
          </p>

          <div className="space-y-4">
            {/* Needs */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Needs & Essentials (Target: 50%)</span>
                <span className="font-mono text-teal-400 font-semibold">{needsPct}% ({formatCurrency(needsSpent)})</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${needsPct <= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, needsPct)}%` }}
                />
              </div>
            </div>

            {/* Wants */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Lifestyle & Wants (Target: 30%)</span>
                <span className="font-mono text-amber-400 font-semibold">{wantsPct}% ({formatCurrency(wantsSpent)})</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${wantsPct <= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, wantsPct)}%` }}
                />
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Savings & Investments (Target: 20%)</span>
                <span className="font-mono text-cyan-400 font-semibold">{savingsPct}% ({formatCurrency(savingsAllocated)})</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${savingsPct >= 20 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, savingsPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Runway & Safety Buffer */}
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#162237]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Emergency Runway Analysis</h3>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40">
              {monthsRunway} Months
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Financial advisors in Kenya suggest maintaining 3 to 6 months of essential living expenses parked in a safe, interest-bearing Money Market Fund.
          </p>

          <div className="p-4 rounded-xl bg-[#121d30] border border-[#1e2f4c] space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Emergency Reserve:</span>
              <span className="text-white font-mono font-bold">{formatCurrency(totalEmergencyFund)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Monthly Essential Expenses:</span>
              <span className="text-slate-300 font-mono">
                {formatCurrency(emergencyFund.monthlyEssentialExpenses || totalMonthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">6-Month Target Buffer:</span>
              <span className="text-teal-400 font-mono font-bold">
                {formatCurrency((emergencyFund.monthlyEssentialExpenses || totalMonthlyExpenses || 35000) * 6)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('emergency')}
            className="w-full py-2.5 rounded-xl bg-[#13233c] hover:bg-[#182d4d] border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Adjust Emergency Fund Target</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* East African & Kenyan Localized Best Practices */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Smart Wealth Accelerators
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#121c2e] border border-[#1a2840] space-y-2">
            <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Money Market Funds (MMF)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn 12% - 15% compounded daily annual returns on liquidity vs letting cash sit idle in zero-interest bank accounts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121c2e] border border-[#1a2840] space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              SACCO Power (Dividends + Leverage)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deposit-taking SACCOs often yield 10% - 12% in annual dividends and grant access to low-interest loans up to 3x your savings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121c2e] border border-[#1a2840] space-y-2">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tax-Free Infrastructure Bonds
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Central Bank of Kenya (CBK DhowCSD) Infrastructure Bonds offer completely tax-exempt coupon payments paid semi-annually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
