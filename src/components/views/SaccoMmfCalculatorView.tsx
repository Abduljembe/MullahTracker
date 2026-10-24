import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Landmark,
  Calculator,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

interface MmfPreset {
  name: string;
  nominalYield: number; // annual percentage
  managementFeePercent?: number;
  provider: string;
  currency: 'KES' | 'USD';
  minDeposit: number;
}

const TOP_MMF_PRESETS: MmfPreset[] = [
  { name: 'Kuza Asset Management MMF', nominalYield: 15.5, provider: 'Kuza Asset Management', currency: 'KES', minDeposit: 1000 },
  { name: 'Lofty-Corban MMF', nominalYield: 15.2, provider: 'Lofty-Corban Investments', currency: 'KES', minDeposit: 1000 },
  { name: 'Etica Wealth MMF', nominalYield: 14.8, provider: 'Etica Capital', currency: 'KES', minDeposit: 500 },
  { name: 'Cytonn Money Market Fund', nominalYield: 14.5, provider: 'Cytonn Asset Managers', currency: 'KES', minDeposit: 1000 },
  { name: 'Britam Money Market Fund', nominalYield: 13.8, provider: 'Britam Asset Managers', currency: 'KES', minDeposit: 1000 },
  { name: 'CIC Money Market Fund', nominalYield: 12.8, provider: 'CIC Asset Management', currency: 'KES', minDeposit: 5000 },
  { name: 'Sanlam Kenya MMF', nominalYield: 12.2, provider: 'Sanlam Investments', currency: 'KES', minDeposit: 2500 },
  { name: 'Offshore USD Treasury MMF', nominalYield: 5.35, provider: 'Global Fixed Income', currency: 'USD', minDeposit: 100 },
];

const SACCO_PRESETS = [
  { name: 'Stima DT SACCO', shareDiv: 15.0, depositRebate: 11.0 },
  { name: 'Kenya Police DT SACCO', shareDiv: 17.0, depositRebate: 11.2 },
  { name: 'Safaricom SACCO', shareDiv: 16.0, depositRebate: 11.5 },
  { name: 'Harambee SACCO', shareDiv: 12.0, depositRebate: 8.5 },
  { name: 'Hazina DT SACCO', shareDiv: 15.5, depositRebate: 10.5 },
];

export const SaccoMmfCalculatorView: React.FC = () => {
  const { formatCurrency, currency, addInvestment, addIncome } = useFinance();

  const [activeTab, setActiveTab] = useState<'mmf' | 'sacco'>('mmf');

  // --- MMF Simulator Inputs ---
  const [mmfInitialDeposit, setMmfInitialDeposit] = useState<number>(50000);
  const [mmfMonthlyContribution, setMmfMonthlyContribution] = useState<number>(10000);
  const [mmfAnnualRate, setMmfAnnualRate] = useState<number>(14.5);
  const [mmfDurationYears, setMmfDurationYears] = useState<number>(3);
  const [deductMmfWht, setDeductMmfWht] = useState<boolean>(true); // 15% Kenya WHT
  const [compoundingFreq, setCompoundingFreq] = useState<'daily' | 'monthly'>('daily');
  const [selectedMmfName, setSelectedMmfName] = useState<string>('Custom MMF');

  // --- SACCO Estimator Inputs ---
  const [saccoName, setSaccoName] = useState<string>('Stima DT SACCO');
  const [shareCapital, setShareCapital] = useState<number>(100000); // KES or active currency
  const [shareDividendRate, setShareDividendRate] = useState<number>(15.0); // %
  const [memberDeposits, setMemberDeposits] = useState<number>(600000); // BOSA Deposits
  const [depositRebateRate, setDepositRebateRate] = useState<number>(11.0); // %
  const [deductSaccoWht, setDeductSaccoWht] = useState<boolean>(true); // 5% Kenya SACCO WHT

  // --- MMF Calculations ---
  const mmfResults = useMemo(() => {
    const P = Math.max(0, mmfInitialDeposit);
    const PMT = Math.max(0, mmfMonthlyContribution);
    const grossRate = Math.max(0, mmfAnnualRate) / 100;
    // Withholding tax in Kenya on MMF interest is 15%
    const netAnnualRate = deductMmfWht ? grossRate * 0.85 : grossRate;
    const months = Math.max(1, Math.round(mmfDurationYears * 12));

    const periodsPerYear = compoundingFreq === 'daily' ? 365 : 12;
    const ratePerPeriod = netAnnualRate / periodsPerYear;
    const periodsPerMonth = periodsPerYear / 12;

    let balance = P;
    let totalInvested = P;

    const yearlyData: Array<{ year: number; balance: number; invested: number; interest: number }> = [];

    for (let m = 1; m <= months; m++) {
      // compound for this month
      for (let p = 0; p < periodsPerMonth; p++) {
        balance += balance * ratePerPeriod;
      }
      // add monthly deposit at month end
      balance += PMT;
      totalInvested += PMT;

      if (m % 12 === 0 || m === months) {
        yearlyData.push({
          year: Math.ceil(m / 12),
          balance: Math.round(balance),
          invested: Math.round(totalInvested),
          interest: Math.round(balance - totalInvested),
        });
      }
    }

    const finalBalance = balance;
    const totalPrincipal = totalInvested;
    const netInterest = finalBalance - totalPrincipal;
    const grossInterest = deductMmfWht ? netInterest / 0.85 : netInterest;
    const whtAmount = grossInterest - netInterest;

    return {
      finalBalance,
      totalPrincipal,
      netInterest,
      grossInterest,
      whtAmount,
      yearlyData,
    };
  }, [mmfInitialDeposit, mmfMonthlyContribution, mmfAnnualRate, mmfDurationYears, deductMmfWht, compoundingFreq]);

  // --- SACCO Calculations ---
  const saccoResults = useMemo(() => {
    const sc = Math.max(0, shareCapital);
    const md = Math.max(0, memberDeposits);

    const grossShareDiv = (sc * (Math.max(0, shareDividendRate) / 100));
    const grossDepositRebate = (md * (Math.max(0, depositRebateRate) / 100));

    // Kenya Section 35(3) Income Tax Act: SACCO dividends are subjected to 5% withholding tax
    const shareWht = deductSaccoWht ? grossShareDiv * 0.05 : 0;
    const rebateWht = deductSaccoWht ? grossDepositRebate * 0.05 : 0;

    const netShareDiv = grossShareDiv - shareWht;
    const netDepositRebate = grossDepositRebate - rebateWht;
    const totalGross = grossShareDiv + grossDepositRebate;
    const totalWht = shareWht + rebateWht;
    const totalNetPayout = netShareDiv + netDepositRebate;
    const monthlyEquivalent = totalNetPayout / 12;

    const totalPortfolio = sc + md;
    const effectiveNetYield = totalPortfolio > 0 ? (totalNetPayout / totalPortfolio) * 100 : 0;

    return {
      grossShareDiv,
      grossDepositRebate,
      shareWht,
      rebateWht,
      netShareDiv,
      netDepositRebate,
      totalGross,
      totalWht,
      totalNetPayout,
      monthlyEquivalent,
      totalPortfolio,
      effectiveNetYield,
    };
  }, [shareCapital, shareDividendRate, memberDeposits, depositRebateRate, deductSaccoWht]);

  const handleApplyMmfPreset = (preset: MmfPreset) => {
    setSelectedMmfName(preset.name);
    setMmfAnnualRate(preset.nominalYield);
  };

  const handleApplySaccoPreset = (preset: (typeof SACCO_PRESETS)[0]) => {
    setSaccoName(preset.name);
    setShareDividendRate(preset.shareDiv);
    setDepositRebateRate(preset.depositRebate);
  };

  const handleAddToInvestmentsMMF = () => {
    addInvestment({
      name: selectedMmfName || 'Money Market Fund (MMF)',
      assetClass: 'Money Market Fund (MMF)',
      currentValue: mmfResults.finalBalance,
      investedAmount: mmfResults.totalPrincipal,
      expectedAnnualYieldPercent: mmfAnnualRate,
      provider: selectedMmfName,
    });
  };

  const handleAddToInvestmentsSACCO = () => {
    addInvestment({
      name: `${saccoName} Shares & Deposits`,
      assetClass: 'SACCO Deposits & Shares',
      currentValue: saccoResults.totalPortfolio,
      investedAmount: saccoResults.totalPortfolio,
      expectedAnnualYieldPercent: saccoResults.effectiveNetYield,
      provider: saccoName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-[#0df2c9]" />
          SACCO Dividends & MMF Compounding Yield Calculator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Simulate daily & monthly compounding returns for leading Kenya MMFs (net of 15% WHT) and estimate annual SACCO dividend payouts (5% WHT).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#18253b]">
        <button
          onClick={() => setActiveTab('mmf')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'mmf'
              ? 'border-[#0df2c9] text-[#0df2c9] bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Money Market Fund (MMF) Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('sacco')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'sacco'
              ? 'border-[#0df2c9] text-[#0df2c9] bg-teal-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>SACCO Dividends & Rebates Estimator</span>
        </button>
      </div>

      {activeTab === 'mmf' ? (
        /* MMF TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Presets List */}
            <div className="p-4 rounded-2xl bg-[#0c1322] border border-[#18253b]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                  <span>Top Kenya & Offshore MMFs</span>
                </span>
                <span className="text-[10px] text-slate-400">Current Yields</span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {TOP_MMF_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleApplyMmfPreset(p)}
                    className={`text-left p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                      selectedMmfName === p.name
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                        : 'bg-[#111c30] border-[#1a2c49] text-slate-300 hover:text-white hover:bg-[#162540]'
                    }`}
                  >
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                      {p.nominalYield}% p.a.
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Investment Parameters
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Initial Deposit ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={mmfInitialDeposit}
                  onChange={(e) => setMmfInitialDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monthly Contribution ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={mmfMonthlyContribution}
                  onChange={(e) => setMmfMonthlyContribution(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Annual Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={mmfAnnualRate}
                    onChange={(e) => setMmfAnnualRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={mmfDurationYears}
                    onChange={(e) => setMmfDurationYears(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Compounding & Tax Toggles */}
              <div className="pt-2 border-t border-[#141f33] space-y-2.5">
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Deduct 15% Withholding Tax (Kenya WHT)</span>
                  <input
                    type="checkbox"
                    checked={deductMmfWht}
                    onChange={(e) => setDeductMmfWht(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-400 focus:ring-0 bg-[#070b13] border-[#162540]"
                  />
                </label>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Compounding Frequency</span>
                  <div className="flex items-center gap-1 bg-[#070b13] p-1 rounded-lg border border-[#162540]">
                    <button
                      onClick={() => setCompoundingFreq('daily')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        compoundingFreq === 'daily'
                          ? 'bg-teal-500/20 text-[#0df2c9]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Daily (Standard)
                    </button>
                    <button
                      onClick={() => setCompoundingFreq('monthly')}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        compoundingFreq === 'monthly'
                          ? 'bg-teal-500/20 text-[#0df2c9]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Primary Result Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c182a] to-[#07101d] border border-teal-500/30 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-teal-300">
                    Projected Maturity Portfolio
                  </span>
                  <h2 className="text-3xl font-extrabold font-mono text-white mt-1">
                    {formatCurrency(mmfResults.finalBalance)}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Horizon</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {mmfDurationYears} Year{mmfDurationYears === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Breakdown Row */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#182742]">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Your Principal</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {formatCurrency(mmfResults.totalPrincipal)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-medium">Net Interest Earned</div>
                  <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                    +{formatCurrency(mmfResults.netInterest)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">15% WHT Paid</div>
                  <div className="text-base font-bold font-mono text-rose-300 mt-0.5">
                    {formatCurrency(mmfResults.whtAmount)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-[#182742] flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Effective net yield: <span className="text-[#0df2c9] font-mono font-bold">{(mmfAnnualRate * 0.85).toFixed(2)}% p.a.</span>
                </div>
                <button
                  onClick={handleAddToInvestmentsMMF}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0df2c9] text-black font-semibold text-xs hover:bg-[#0df2c9]/90 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to My Portfolio</span>
                </button>
              </div>

              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Projected Yearly Schedule Table */}
            <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Year-by-Year Growth Schedule
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-[#18253b] text-left">
                      <th className="pb-2 font-medium">Period</th>
                      <th className="pb-2 font-medium font-mono">Invested Principal</th>
                      <th className="pb-2 font-medium font-mono text-emerald-400">Net Interest</th>
                      <th className="pb-2 font-medium font-mono text-right text-white">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141f33]">
                    {mmfResults.yearlyData.map((row) => (
                      <tr key={row.year} className="hover:bg-[#10192b]/50">
                        <td className="py-2.5 text-slate-300 font-medium">Year {row.year}</td>
                        <td className="py-2.5 font-mono text-slate-400">{formatCurrency(row.invested)}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-semibold">+{formatCurrency(row.interest)}</td>
                        <td className="py-2.5 font-mono text-right text-white font-bold">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SACCO TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sacco Inputs Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Top SACCOs Presets */}
            <div className="p-4 rounded-2xl bg-[#0c1322] border border-[#18253b]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#0df2c9]" />
                  <span>Leading Kenyan SACCO Benchmarks</span>
                </span>
                <span className="text-[10px] text-slate-400">Dividends / Rebates</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SACCO_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleApplySaccoPreset(p)}
                    className={`text-left p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                      saccoName === p.name
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-[#111c30] border-[#1a2c49] text-slate-300 hover:text-white hover:bg-[#162540]'
                    }`}
                  >
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Shares: <span className="text-amber-400 font-mono font-bold">{p.shareDiv}%</span> | BOSA: <span className="text-sky-400 font-mono font-bold">{p.depositRebate}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sacco Form */}
            <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                SACCO Capital & Rate Configuration
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  SACCO Name
                </label>
                <input
                  type="text"
                  value={saccoName}
                  onChange={(e) => setSaccoName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Share Capital */}
              <div className="p-3 rounded-xl bg-[#090f1a] border border-[#15233c] space-y-3">
                <div className="text-xs font-semibold text-amber-300">
                  1. Share Capital (Permanent Institutional Equity)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Total Shares ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={shareCapital}
                      onChange={(e) => setShareCapital(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Dividend Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={shareDividendRate}
                      onChange={(e) => setShareDividendRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Member Deposits (BOSA) */}
              <div className="p-3 rounded-xl bg-[#090f1a] border border-[#15233c] space-y-3">
                <div className="text-xs font-semibold text-sky-300">
                  2. Non-Withdrawable Deposits (BOSA Loan Security)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Total Deposits ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={memberDeposits}
                      onChange={(e) => setMemberDeposits(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Interest Rebate Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={depositRebateRate}
                      onChange={(e) => setDepositRebateRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Toggle */}
              <label className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-[#141f33] cursor-pointer">
                <span>Deduct 5% SACCO Withholding Tax (WHT)</span>
                <input
                  type="checkbox"
                  checked={deductSaccoWht}
                  onChange={(e) => setDeductSaccoWht(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-400 focus:ring-0 bg-[#070b13] border-[#162540]"
                />
              </label>
            </div>
          </div>

          {/* Sacco Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Payout Summary Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c2f] to-[#08101e] border border-amber-500/30 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
                    Total Estimated Annual SACCO Payout
                  </span>
                  <h2 className="text-3xl font-extrabold font-mono text-white mt-1">
                    {formatCurrency(saccoResults.totalNetPayout)}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Monthly Passive Eqv.</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    +{formatCurrency(saccoResults.monthlyEquivalent)} / mo
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-[#1a2942]">
                {/* Share Capital Dividend */}
                <div className="p-3 rounded-xl bg-[#090f1a]/80 border border-[#15233c]">
                  <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                    Net Dividend on Shares
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {formatCurrency(saccoResults.netShareDiv)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Gross: {formatCurrency(saccoResults.grossShareDiv)} (5% WHT: {formatCurrency(saccoResults.shareWht)})
                  </div>
                </div>

                {/* Deposit Interest Rebate */}
                <div className="p-3 rounded-xl bg-[#090f1a]/80 border border-[#15233c]">
                  <div className="text-[11px] text-sky-300 font-semibold uppercase tracking-wider">
                    Net Interest on BOSA Deposits
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {formatCurrency(saccoResults.netDepositRebate)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Gross: {formatCurrency(saccoResults.grossDepositRebate)} (5% WHT: {formatCurrency(saccoResults.rebateWht)})
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-[#1a2942] flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Total capital in SACCO: <span className="text-white font-mono font-bold">{formatCurrency(saccoResults.totalPortfolio)}</span>
                </div>
                <button
                  onClick={handleAddToInvestmentsSACCO}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add SACCO to Portfolio</span>
                </button>
              </div>

              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* SACCO Tax Advantage Explanation */}
            <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                The SACCO Tax Advantage (5% vs 15% WHT)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under the Kenyan Income Tax Act, dividends and deposit rebates distributed by registered Savings and Credit Cooperatives (SACCOs) are subject to a preferential <strong>5% Withholding Tax</strong>, compared to <strong>15% Withholding Tax</strong> charged on bank savings interest, commercial bonds, and commercial money market funds.
              </p>
              <div className="p-3 rounded-xl bg-[#080d17] border border-[#142036] flex items-center justify-between text-xs">
                <span className="text-slate-400">Tax saved on this payout compared to commercial bank:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  +{formatCurrency(saccoResults.totalGross * 0.10)} extra in your pocket
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
