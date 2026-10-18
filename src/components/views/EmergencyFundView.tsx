import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const EmergencyFundView: React.FC = () => {
  const {
    emergencyFund,
    updateEmergencyFund,
    depositToEmergencyFund,
    formatCurrency,
    totalMonthlyExpenses,
  } = useFinance();

  const [depositAmt, setDepositAmt] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  const monthlyEssential = emergencyFund.monthlyEssentialExpenses || totalMonthlyExpenses || 45000;
  const targetGoal = monthlyEssential * emergencyFund.targetMonths;
  const currentStash = emergencyFund.currentAmount;
  const pct = targetGoal > 0 ? Math.min(100, Math.round((currentStash / targetGoal) * 100)) : 0;
  const monthsCovered = monthlyEssential > 0 ? (currentStash / monthlyEssential).toFixed(1) : '0';

  const [customMonthly, setCustomMonthly] = useState(monthlyEssential.toString());
  const [customMonths, setCustomMonths] = useState(emergencyFund.targetMonths.toString());

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmt);
    if (val > 0) {
      depositToEmergencyFund(val);
      setDepositAmt('');
      setIsDepositing(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmergencyFund({
      monthlyEssentialExpenses: parseFloat(customMonthly) || monthlyEssential,
      targetMonths: parseInt(customMonths) || 6,
    });
    setIsEditingConfig(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stash Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Current Emergency Stash</div>
          <div className="text-2xl font-bold font-mono text-[#9d8bf8] mt-2">
            {formatCurrency(currentStash)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Liquid buffer reserved for crises</div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Months of Living Runway</div>
          <div className="text-2xl font-bold font-mono text-teal-400 mt-2">
            {monthsCovered} Months
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Target is {emergencyFund.targetMonths} months of essential needs
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Target Reserve Required</div>
            <div className="text-lg font-bold text-white mt-2">
              {formatCurrency(targetGoal)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {pct}% of full safety shield funded
            </div>
          </div>
          <button
            onClick={() => setIsDepositing(!isDepositing)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit</span>
          </button>
        </div>
      </div>

      {/* Deposit Form */}
      {isDepositing && (
        <form
          onSubmit={handleDeposit}
          className="bg-[#0e1626] border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#18263e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Deposit to Emergency Reserve
            </h3>
            <button
              type="button"
              onClick={() => setIsDepositing(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Deposit Amount (KES)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 20000"
                value={depositAmt}
                onChange={(e) => setDepositAmt(e.target.value)}
                autoFocus
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition-colors"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      )}

      {/* Main Gauge & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Runway Progress */}
        <div className="lg:col-span-2 bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#162237]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Emergency Buffer Shield</h3>
            </div>
            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              {isEditingConfig ? 'Cancel' : 'Edit Target Parameters'}
            </button>
          </div>

          {/* Configuration Form */}
          {isEditingConfig && (
            <form
              onSubmit={handleSaveConfig}
              className="p-4 rounded-xl bg-[#111a2c] border border-teal-500/30 space-y-3"
            >
              <h4 className="text-xs font-bold text-teal-300">Set Monthly Living Needs & Runway</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Essential Monthly Cost (KES)</label>
                  <input
                    type="number"
                    value={customMonthly}
                    onChange={(e) => setCustomMonthly(e.target.value)}
                    className="w-full bg-[#0a111e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target Runway (Months)</label>
                  <select
                    value={customMonths}
                    onChange={(e) => setCustomMonths(e.target.value)}
                    className="w-full bg-[#0a111e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="3">3 Months (Standard)</option>
                    <option value="6">6 Months (Recommended for Kenya)</option>
                    <option value="9">9 Months (Conservative)</option>
                    <option value="12">12 Months (Freelancer / Business)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-400 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          )}

          {/* Big Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-slate-200">Safety Buffer Progress</span>
              <span className="text-xl font-bold font-mono text-indigo-400">{pct}%</span>
            </div>

            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>0 KES</span>
              <span>Target: {formatCurrency(targetGoal)}</span>
            </div>
          </div>

          {/* Runway Milestone Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[1, 3, 6, 12].map((m) => {
              const needed = monthlyEssential * m;
              const reached = currentStash >= needed;

              return (
                <div
                  key={m}
                  className={`p-3 rounded-xl border ${
                    reached
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#111928] border-[#1a283e] text-slate-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold flex items-center justify-between">
                    <span>{m} Month{m > 1 ? 's' : ''}</span>
                    {reached && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold font-mono mt-1 text-white">
                    {formatCurrency(needed)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Where to store emergency funds */}
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" />
            Where to Keep Your Emergency Fund
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Never store emergency reserves in locked investments like real estate or fixed 2-year bonds. You need instant, penalty-free access.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#121c2e] border border-[#1b2b44] space-y-1">
              <div className="font-semibold text-teal-300">Regulated Money Market Funds (MMF)</div>
              <p className="text-slate-400">
                Offers 12% - 15% daily compounded interest with fast withdrawal to M-Pesa or Bank within 24 hours.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#121c2e] border border-[#1b2b44] space-y-1">
              <div className="font-semibold text-cyan-300">High-Yield FOSA Accounts</div>
              <p className="text-slate-400">
                SACCO front-office savings accounts often pay attractive annual interest and come with ATM cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
