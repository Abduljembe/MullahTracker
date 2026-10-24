import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sliders,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const CashflowForecastView: React.FC = () => {
  const {
    totalMonthlyIncome,
    totalMonthlyExpenses,
    totalInvestments,
    totalEmergencyFund,
    totalDebt,
    debts,
    chamas,
    formatCurrency,
  } = useFinance();

  // Scenario Simulator controls
  const [incomeVariance, setIncomeVariance] = useState<number>(0); // -30% to +30%
  const [expenseInflation, setExpenseInflation] = useState<number>(0); // 0% to +20%
  const [investmentYield, setInvestmentYield] = useState<number>(12); // 12% default East Africa MMF/SACCO

  // Monthly debt obligation
  const monthlyDebtPayment = debts.reduce((sum, d) => sum + d.minimumMonthlyPayment, 0);

  // Monthly Chama commitments
  const monthlyChama = chamas.reduce((sum, c) => {
    if (c.frequency === 'monthly') return sum + c.contributionAmount;
    if (c.frequency === 'weekly') return sum + c.contributionAmount * 4;
    return sum + c.contributionAmount * 2;
  }, 0);

  // Generate 12 months forecast
  const forecastMonths = useMemo(() => {
    const list = [];
    const now = new Date();

    // Baseline monthly numbers
    const baseIncome = totalMonthlyIncome > 0 ? totalMonthlyIncome : 65000;
    const baseExpenses = totalMonthlyExpenses > 0 ? totalMonthlyExpenses : 38000;

    let rollingLiquid = Math.max(0, totalEmergencyFund);
    let rollingInvestments = totalInvestments;
    let rollingDebt = totalDebt;

    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = futureDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      // Apply scenario variations
      const adjustedIncome = Math.round(baseIncome * (1 + incomeVariance / 100));
      const adjustedExpenses = Math.round(baseExpenses * (1 + expenseInflation / 100)) + monthlyChama;

      // Debt reduction
      const actualDebtPaid = Math.min(rollingDebt, monthlyDebtPayment || 2000);
      rollingDebt = Math.max(0, rollingDebt - actualDebtPaid);

      // Monthly investment yield compounding (annual rate / 12)
      const monthlyYield = Math.round((rollingInvestments * (investmentYield / 100)) / 12);
      rollingInvestments += monthlyYield;

      // Monthly cashflow surplus / deficit
      const netCashflow = adjustedIncome - adjustedExpenses - actualDebtPaid;
      rollingLiquid += netCashflow;

      const totalProjectedNetWorth = rollingLiquid + rollingInvestments - rollingDebt;

      list.push({
        monthIndex: i,
        monthLabel,
        income: adjustedIncome,
        expenses: adjustedExpenses + actualDebtPaid,
        netCashflow,
        endingLiquid: Math.round(rollingLiquid),
        endingInvestments: Math.round(rollingInvestments),
        endingDebt: Math.round(rollingDebt),
        netWorth: Math.round(totalProjectedNetWorth),
      });
    }

    return list;
  }, [
    totalMonthlyIncome,
    totalMonthlyExpenses,
    totalInvestments,
    totalEmergencyFund,
    totalDebt,
    monthlyDebtPayment,
    monthlyChama,
    incomeVariance,
    expenseInflation,
    investmentYield,
  ]);

  const endingMonth = forecastMonths[11];
  const netWorthDelta = endingMonth.netWorth - (totalEmergencyFund + totalInvestments - totalDebt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">12-Month Future Cash Flow Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predict your balance trajectory, stress-test your cashflow with scenario toggles, and see when you hit net worth milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0e1626] border border-[#19273f] rounded-xl px-4 py-2">
          <Calendar className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-slate-300 font-medium">12-Month Forward Outlook</span>
        </div>
      </div>

      {/* Interactive Scenario Controls Banner */}
      <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Sliders className="w-4 h-4 text-[#0df2c9]" />
            <span>Interactive Scenario Stress-Testing</span>
          </div>
          <button
            onClick={() => {
              setIncomeVariance(0);
              setExpenseInflation(0);
              setInvestmentYield(12);
            }}
            className="text-[11px] text-teal-400 hover:text-teal-300"
          >
            Reset Scenarios
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Slider 1: Income Variance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Income Variance</span>
              <span
                className={`font-mono font-bold ${
                  incomeVariance > 0
                    ? 'text-emerald-400'
                    : incomeVariance < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {incomeVariance > 0 ? `+${incomeVariance}%` : `${incomeVariance}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={incomeVariance}
              onChange={(e) => setIncomeVariance(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-[#0a101d] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-30% (Job cut)</span>
              <span>0% (Steady)</span>
              <span>+30% (Bonus/Raise)</span>
            </div>
          </div>

          {/* Slider 2: Expense Inflation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cost of Living Inflation</span>
              <span className="font-mono font-bold text-amber-400">+{expenseInflation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={expenseInflation}
              onChange={(e) => setExpenseInflation(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#0a101d] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Stable)</span>
              <span>+10%</span>
              <span>+20% (High Inflation)</span>
            </div>
          </div>

          {/* Slider 3: Investment Yield */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Annual Investment Yield</span>
              <span className="font-mono font-bold text-teal-300">{investmentYield}% p.a.</span>
            </div>
            <input
              type="range"
              min="6"
              max="18"
              step="1"
              value={investmentYield}
              onChange={(e) => setInvestmentYield(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-[#0a101d] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>6% (Conservative)</span>
              <span>12% (Standard MMF)</span>
              <span>18% (SACCO/Bonds)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projected End State Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">12-Month Net Worth Target</div>
          <div className="text-2xl font-extrabold text-[#0df2c9] font-mono mt-2">
            {formatCurrency(endingMonth.netWorth)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Projected Growth: +{formatCurrency(Math.max(0, netWorthDelta))}</span>
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Cumulative Liquid Buffer</div>
          <div className="text-2xl font-extrabold text-teal-300 font-mono mt-2">
            {formatCurrency(endingMonth.endingLiquid)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Available bank & M-Pesa reserves</div>
        </div>

        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Debt Obligations in 12 Months</div>
          <div
            className={`text-2xl font-extrabold font-mono mt-2 ${
              endingMonth.endingDebt === 0 ? 'text-emerald-400' : 'text-slate-200'
            }`}
          >
            {formatCurrency(endingMonth.endingDebt)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {endingMonth.endingDebt === 0 ? '🎉 100% Debt Free in 12 months!' : 'Scheduled amortization'}
          </div>
        </div>
      </div>

      {/* Visual Month-by-Month Trajectory Table & Timeline */}
      <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#141e30] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            12-Month Cashflow Trajectory Breakdown
          </span>
          <span className="text-[11px] text-slate-400">All amounts projected in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#141e30] bg-[#0a101d] text-slate-400 font-medium">
                <th className="p-3.5">Month</th>
                <th className="p-3.5">Inflows</th>
                <th className="p-3.5">Outflows</th>
                <th className="p-3.5">Net Monthly</th>
                <th className="p-3.5">Liquid Reserves</th>
                <th className="p-3.5">Investments</th>
                <th className="p-3.5">Remaining Debt</th>
                <th className="p-3.5 text-right font-bold text-slate-300">Projected Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141e30]">
              {forecastMonths.map((m) => (
                <tr key={m.monthIndex} className="hover:bg-[#121c2e] transition-colors">
                  <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    <span>{m.monthLabel}</span>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400">+{formatCurrency(m.income)}</td>
                  <td className="p-3.5 font-mono text-rose-400">-{formatCurrency(m.expenses)}</td>
                  <td className="p-3.5 font-mono font-semibold">
                    <span className={m.netCashflow >= 0 ? 'text-teal-300' : 'text-rose-400'}>
                      {m.netCashflow >= 0 ? '+' : ''}
                      {formatCurrency(m.netCashflow)}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-200">{formatCurrency(m.endingLiquid)}</td>
                  <td className="p-3.5 font-mono text-amber-300">{formatCurrency(m.endingInvestments)}</td>
                  <td className="p-3.5 font-mono text-rose-300">
                    {formatCurrency(m.endingDebt)}
                  </td>
                  <td className="p-3.5 font-mono font-extrabold text-right text-[#0df2c9]">
                    {formatCurrency(m.netWorth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
