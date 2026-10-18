import React, { useState } from 'react';
import {
  Calculator,
  Flame,
  TrendingUp,
  Sparkles,
  Calendar,
  Percent,
  Compass,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const FFCalculatorView: React.FC = () => {
  const { formatCurrency, totalMonthlyExpenses, totalInvestments, savingsThisMonth } = useFinance();

  const [currentAge, setCurrentAge] = useState(29);
  const [targetAge, setTargetAge] = useState(48);
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    totalMonthlyExpenses > 0 ? totalMonthlyExpenses : 50000
  );
  const [currentNetWorth, setCurrentNetWorth] = useState(
    totalInvestments > 0 ? totalInvestments : 0
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    savingsThisMonth > 0 ? savingsThisMonth : 0
  );
  const [expectedReturn, setExpectedReturn] = useState(12.5); // 12.5% p.a. average Kenya MMF / Bond
  const [inflationRate, setInflationRate] = useState(5.5); // 5.5% Kenya CPI inflation
  const [withdrawalRate, setWithdrawalRate] = useState(4.0); // 4% Trinity study rule

  // Real return = (1 + return) / (1 + inflation) - 1
  const realAnnualReturnRate = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
  const realMonthlyReturnRate = Math.pow(1 + realAnnualReturnRate, 1 / 12) - 1;

  // FIRE Number = (Monthly Expenses * 12) / (withdrawalRate / 100)
  const annualExpenses = monthlyExpenses * 12;
  const fireNumber = withdrawalRate > 0 ? annualExpenses / (withdrawalRate / 100) : 0;
  const leanFireNumber = fireNumber * 0.75;
  const fatFireNumber = fireNumber * 1.5;

  // Calculate Years to FIRE via compound growth
  let monthsToFire = 0;
  let simulatedNetWorth = currentNetWorth;
  const maxMonths = 600; // 50 years max

  while (simulatedNetWorth < fireNumber && monthsToFire < maxMonths) {
    simulatedNetWorth = simulatedNetWorth * (1 + realMonthlyReturnRate) + monthlyContribution;
    monthsToFire++;
  }

  const yearsToFire = (monthsToFire / 12).toFixed(1);
  const projectedFireAge = currentAge + Math.round(monthsToFire / 12);

  // Coast FIRE: Amount needed right now to grow to FIRE number at targetAge with zero extra contributions
  const yearsToTarget = Math.max(1, targetAge - currentAge);
  const coastFireNumber = fireNumber / Math.pow(1 + realAnnualReturnRate, yearsToTarget);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d1f35] to-[#0a1626] border border-teal-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Financial Freedom (FIRE) Calculator
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-[#0df2c9] border border-teal-500/30 font-normal">
                FIRE Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Determine your Financial Independence number and calculate the exact age you can retire in Kenya.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Freedom Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-teal-500/30 rounded-2xl p-5 shadow-lg shadow-teal-950/20">
          <div className="text-xs text-teal-400 font-semibold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-teal-400" />
            Your FIRE Number
          </div>
          <div className="text-2xl md:text-3xl font-extrabold font-mono text-white mt-2">
            {formatCurrency(fireNumber)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Generates {formatCurrency(annualExpenses)} / year passively
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Estimated Time to Financial Freedom</div>
          <div className="text-2xl md:text-3xl font-extrabold font-mono text-[#00d2ff] mt-2">
            {yearsToFire} Years
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Projected freedom age: <strong className="text-white">Age {projectedFireAge}</strong>
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Coast FIRE Target Today</div>
          <div className="text-2xl md:text-3xl font-extrabold font-mono text-amber-400 mt-2">
            {formatCurrency(coastFireNumber)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Reaches {formatCurrency(fireNumber)} by age {targetAge} without saving more
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Milestone Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form & Sliders */}
        <div className="lg:col-span-2 bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-[#162237]">
            Financial Parameters & Assumptions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Current Age: <strong className="text-white font-mono">{currentAge}</strong>
              </label>
              <input
                type="range"
                min="18"
                max="70"
                value={currentAge}
                onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Retirement Age: <strong className="text-white font-mono">{targetAge}</strong>
              </label>
              <input
                type="range"
                min={currentAge + 1}
                max="80"
                value={targetAge}
                onChange={(e) => setTargetAge(parseInt(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Monthly Living Expenses (KES)
              </label>
              <input
                type="number"
                step="1000"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Current Invested Net Worth (KES)
              </label>
              <input
                type="number"
                step="10000"
                value={currentNetWorth}
                onChange={(e) => setCurrentNetWorth(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Monthly Future Savings Contribution (KES)
              </label>
              <input
                type="number"
                step="1000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Safe Annual Withdrawal Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Expected Investment Return (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
              <span className="text-[10px] text-slate-500">e.g. Kenya MMFs & IFB Bonds (12% - 15%)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Long-Term Inflation Estimate (% p.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-400"
              />
              <span className="text-[10px] text-slate-500">Kenya historical CPI is ~5% - 6%</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: FIRE Archetypes */}
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            FIRE Milestone Tiers
          </h3>

          <div className="space-y-3">
            {/* Lean FIRE */}
            <div className="p-3.5 rounded-xl bg-[#121c2e] border border-[#1a2942] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span>Lean FIRE</span>
                <span className="font-mono text-white">{formatCurrency(leanFireNumber)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Covers bare essential needs (75% of current expenses) for total basic independence.
              </p>
            </div>

            {/* Standard FIRE */}
            <div className="p-3.5 rounded-xl bg-[#122336] border border-teal-500/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#0df2c9]">
                <span>Standard FIRE</span>
                <span className="font-mono text-white">{formatCurrency(fireNumber)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Maintains 100% of your current standard of living in perpetuity.
              </p>
            </div>

            {/* Fat FIRE */}
            <div className="p-3.5 rounded-xl bg-[#121c2e] border border-[#1a2942] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Fat FIRE</span>
                <span className="font-mono text-white">{formatCurrency(fatFireNumber)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Luxurious retirement lifestyle with abundant travel and generous discretionary spending (150%).
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 leading-relaxed border-t border-[#162237]">
            💡 <strong>The 25x Rule:</strong> Having 25 times your annual expenses invested allows you to withdraw 4% annually adjusted for inflation without depleting your principal.
          </div>
        </div>
      </div>
    </div>
  );
};
