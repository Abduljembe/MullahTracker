import React, { useState } from 'react';
import {
  Calculator,
  Building,
  Shield,
  Home,
  HeartPulse,
  Receipt,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PieChart,
  HelpCircle,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';

export const TaxCalculatorView: React.FC = () => {
  const { addIncome, formatCurrency } = useFinance();

  const [grossSalary, setGrossSalary] = useState<number>(100000);
  const [voluntaryPension, setVoluntaryPension] = useState<number>(0);
  const [mortgageInterest, setMortgageInterest] = useState<number>(0);
  const [importedNotice, setImportedNotice] = useState<string | null>(null);

  // 1. NSSF Calculation (New rates Tier I & II)
  // Tier I: 6% of lower limit (KES 7,000 to 8,000) = KES 420 - 480
  // Tier II: 6% of upper limit (up to KES 72,000) = up to KES 1,740
  const nssfTier1 = Math.min(480, grossSalary * 0.06);
  const nssfTier2 = grossSalary > 8000 ? Math.min(1740, (grossSalary - 8000) * 0.06) : 0;
  const totalNssf = Math.round(nssfTier1 + nssfTier2);

  // 2. Affordable Housing Levy (AHL) = 1.5% of Gross
  const housingLevy = Math.round(grossSalary * 0.015);

  // 3. SHIF (Social Health Insurance Fund) = 2.75% of Gross, min KES 300
  const shif = Math.max(300, Math.round(grossSalary * 0.0275));

  // 4. Taxable Pay Calculation
  // Allowable deductions: NSSF, Pension (max 20,000), Mortgage Interest (max 25,000)
  const allowablePension = Math.min(20000, voluntaryPension);
  const allowableMortgage = Math.min(25000, mortgageInterest);
  const taxablePay = Math.max(0, grossSalary - totalNssf - allowablePension - allowableMortgage);

  // 5. Progressive PAYE Brackets (KRA 2024/2025/2026)
  // First 24,000 @ 10%
  // Next 8,333 (24,001 - 32,333) @ 25%
  // Next 467,667 (32,334 - 500,000) @ 30%
  // Next 300,000 (500,001 - 800,000) @ 32.5%
  // Above 800,000 @ 35%
  let remainingTaxable = taxablePay;
  let taxBand1 = 0;
  let taxBand2 = 0;
  let taxBand3 = 0;
  let taxBand4 = 0;
  let taxBand5 = 0;

  if (remainingTaxable > 0) {
    const chunk1 = Math.min(remainingTaxable, 24000);
    taxBand1 = chunk1 * 0.10;
    remainingTaxable -= chunk1;
  }
  if (remainingTaxable > 0) {
    const chunk2 = Math.min(remainingTaxable, 8333);
    taxBand2 = chunk2 * 0.25;
    remainingTaxable -= chunk2;
  }
  if (remainingTaxable > 0) {
    const chunk3 = Math.min(remainingTaxable, 467667);
    taxBand3 = chunk3 * 0.30;
    remainingTaxable -= chunk3;
  }
  if (remainingTaxable > 0) {
    const chunk4 = Math.min(remainingTaxable, 300000);
    taxBand4 = chunk4 * 0.325;
    remainingTaxable -= chunk4;
  }
  if (remainingTaxable > 0) {
    taxBand5 = remainingTaxable * 0.35;
  }

  const grossTax = Math.round(taxBand1 + taxBand2 + taxBand3 + taxBand4 + taxBand5);

  // 6. Tax Reliefs
  const personalRelief = 2400; // Monthly standard KRA relief
  const insuranceRelief = Math.min(5000, Math.round(shif * 0.15)); // 15% of SHIF/NHIF premium
  const housingRelief = Math.min(9000 / 12, Math.round(housingLevy * 0.15)); // 15% of AHL contribution

  const totalRelief = personalRelief + insuranceRelief + housingRelief;
  const netPaye = Math.max(0, grossTax - totalRelief);

  // 7. Net Take-Home Pay
  const totalDeductions = netPaye + totalNssf + shif + housingLevy + voluntaryPension;
  const netTakeHome = Math.max(0, grossSalary - totalDeductions);
  const effectiveTaxRate = grossSalary > 0 ? ((totalDeductions / grossSalary) * 100).toFixed(1) : '0';

  const handleImportSalary = () => {
    addIncome({
      source: 'Monthly Employment Salary',
      amount: netTakeHome,
      category: 'Salary',
      frequency: 'monthly',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      notes: `Net Take-Home after KRA PAYE (${formatCurrency(netPaye)}), SHIF (${formatCurrency(shif)}), Housing Levy (${formatCurrency(housingLevy)}), and NSSF (${formatCurrency(totalNssf)}).`,
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    setImportedNotice(`Added ${formatCurrency(netTakeHome)} to Monthly Income in MullahTracker!`);
    setTimeout(() => setImportedNotice(null), 4500);
  };

  const PRESET_SALARIES = [30000, 50000, 80000, 100000, 150000, 250000, 400000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Kenya KRA PAYE & Net Salary Calculator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compliant with current KRA progressive tax bands, Affordable Housing Levy (1.5%), SHIF (2.75%), and NSSF Tiers I & II.
          </p>
        </div>

        <button
          onClick={handleImportSalary}
          disabled={netTakeHome <= 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0df2c9] hover:bg-[#00d2b4] text-[#071317] font-bold text-xs transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          <span>Add Net Pay to Monthly Income</span>
        </button>
      </div>

      {/* Imported Notice */}
      {importedNotice && (
        <div className="bg-teal-500/15 border border-teal-500/30 rounded-xl p-3.5 text-xs text-teal-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0df2c9] shrink-0" />
          <span>{importedNotice}</span>
        </div>
      )}

      {/* Main Grid: Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Salary and Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Gross Monthly Earnings</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Gross Basic Salary + Cash Allowances (KES)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-teal-400">
                  KES
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={grossSalary || ''}
                  onChange={(e) => setGrossSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl pl-14 pr-4 py-3 text-base font-bold font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Quick preset buttons */}
            <div>
              <span className="text-[11px] text-slate-500 block mb-2">Popular Salary Benchmarks:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SALARIES.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setGrossSalary(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      grossSalary === preset
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 font-bold'
                        : 'bg-[#14233c] text-slate-400 hover:text-white border border-[#213554]'
                    }`}
                  >
                    KES {(preset / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#141e30] space-y-3">
              <h4 className="text-xs font-semibold text-slate-300">Allowable Relief Deductions (Optional)</h4>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Voluntary Pension Contribution (KES/mo)
                  <span className="text-slate-500 ml-1">(Tax deductible up to KES 20,000)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={voluntaryPension || ''}
                  onChange={(e) => setVoluntaryPension(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Mortgage Interest on Primary Residence (KES/mo)
                  <span className="text-slate-500 ml-1">(Tax deductible up to KES 25,000)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={mortgageInterest || ''}
                  onChange={(e) => setMortgageInterest(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Net Take-Home */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Big Result Card */}
          <div className="bg-gradient-to-br from-[#0c1c2e] via-[#0e2136] to-[#0c1828] border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Net Take-Home Pay</span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-teal-500/20 text-[#0df2c9] border border-teal-500/40">
                Effective Deductions: {effectiveTaxRate}%
              </span>
            </div>

            <div className="mt-3">
              <div className="text-3xl md:text-4xl font-extrabold text-[#0df2c9] font-mono tracking-tight">
                {formatCurrency(netTakeHome)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your actual monthly bank/M-Pesa deposit after all KRA taxes and statutory deductions.
              </p>
            </div>

            {/* Proportion Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="h-3 rounded-full bg-[#080d17] overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, (netTakeHome / Math.max(1, grossSalary)) * 100)}%` }}
                  className="bg-teal-400 h-full"
                  title="Net Pay"
                />
                <div
                  style={{ width: `${Math.min(100, (netPaye / Math.max(1, grossSalary)) * 100)}%` }}
                  className="bg-rose-500 h-full"
                  title="PAYE"
                />
                <div
                  style={{ width: `${Math.min(100, (housingLevy / Math.max(1, grossSalary)) * 100)}%` }}
                  className="bg-amber-400 h-full"
                  title="Housing Levy"
                />
                <div
                  style={{ width: `${Math.min(100, (shif / Math.max(1, grossSalary)) * 100)}%` }}
                  className="bg-blue-400 h-full"
                  title="SHIF"
                />
                <div
                  style={{ width: `${Math.min(100, (totalNssf / Math.max(1, grossSalary)) * 100)}%` }}
                  className="bg-purple-400 h-full"
                  title="NSSF"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> Take-Home ({Math.round((netTakeHome / Math.max(1, grossSalary)) * 100)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> PAYE
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Housing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> SHIF
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> NSSF
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Deductions Table */}
          <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#141e30] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Statutory Itemized Deductions
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                Total: -{formatCurrency(totalDeductions)}
              </span>
            </div>

            <div className="divide-y divide-[#141e30] text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">NSSF Contribution (Tier I & Tier II)</div>
                  <div className="text-[11px] text-slate-400">Retirement savings (Tier I: {formatCurrency(nssfTier1)} + Tier II: {formatCurrency(nssfTier2)})</div>
                </div>
                <span className="font-mono font-semibold text-slate-200">-{formatCurrency(totalNssf)}</span>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Affordable Housing Levy (AHL)</div>
                  <div className="text-[11px] text-slate-400">1.5% of Gross Basic Pay</div>
                </div>
                <span className="font-mono font-semibold text-slate-200">-{formatCurrency(housingLevy)}</span>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Social Health Insurance Fund (SHIF)</div>
                  <div className="text-[11px] text-slate-400">2.75% of Gross Pay (min KES 300)</div>
                </div>
                <span className="font-mono font-semibold text-slate-200">-{formatCurrency(shif)}</span>
              </div>

              <div className="p-3.5 flex items-center justify-between bg-rose-500/5">
                <div>
                  <div className="font-semibold text-rose-300">KRA PAYE (Income Tax)</div>
                  <div className="text-[11px] text-slate-400">
                    Gross Tax: {formatCurrency(grossTax)} less Personal Relief ({formatCurrency(personalRelief)}) & Insurance/Housing reliefs ({formatCurrency(insuranceRelief + housingRelief)})
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-400">-{formatCurrency(netPaye)}</span>
              </div>

              {voluntaryPension > 0 && (
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Voluntary Pension Contribution</div>
                    <div className="text-[11px] text-slate-400">Dedicated retirement fund</div>
                  </div>
                  <span className="font-mono font-semibold text-slate-200">-{formatCurrency(voluntaryPension)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
