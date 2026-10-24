import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  PieChart,
  ArrowUpRight,
  Sparkles,
  Building,
  Percent,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { InvestmentItem } from '../../types/finance.ts';

const ASSET_CLASSES: InvestmentItem['assetClass'][] = [
  'Money Market Fund (MMF)',
  'SACCO Deposits & Shares',
  'Treasury Bills & Bonds',
  'NSE Stocks',
  'Real Estate',
  'Cryptocurrency',
  'Offshore / ETFs',
  'Other',
];

export const InvestmentsView: React.FC = () => {
  const { investments, addInvestment, deleteInvestment, formatCurrency, totalInvestments, currency } = useFinance();

  const [isAdding, setIsAdding] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [assetClass, setAssetClass] = useState<InvestmentItem['assetClass']>('Money Market Fund (MMF)');
  const [currentValue, setCurrentValue] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [expectedAnnualYieldPercent, setExpectedAnnualYieldPercent] = useState('13.5');
  const [provider, setProvider] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentValue) return;

    addInvestment({
      name: name.trim(),
      assetClass,
      currentValue: parseFloat(currentValue),
      investedAmount: parseFloat(investedAmount) || parseFloat(currentValue),
      expectedAnnualYieldPercent: parseFloat(expectedAnnualYieldPercent) || 0,
      provider: provider.trim() || 'Direct Investment',
    });

    setName('');
    setCurrentValue('');
    setInvestedAmount('');
    setProvider('');
    setIsAdding(false);
  };

  const totalPrincipal = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalGains = totalInvestments - totalPrincipal;
  const weightedAnnualPassive = investments.reduce(
    (sum, inv) => sum + (inv.currentValue * (inv.expectedAnnualYieldPercent / 100)),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Portfolio Value</div>
          <div className="text-2xl font-bold font-mono text-[#fbbf24] mt-2">
            {formatCurrency(totalInvestments)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {investments.length} investment position{investments.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Unrealized Growth</div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              totalGains >= 0 ? 'text-[#00e5a3]' : 'text-rose-400'
            }`}
          >
            {totalGains >= 0 ? '+' : ''}
            {formatCurrency(totalGains)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalPrincipal > 0
              ? `${Math.round((totalGains / totalPrincipal) * 100)}% overall return`
              : 'Principal tracked'}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Projected Annual Passive Income</div>
            <div className="text-lg font-bold text-teal-400 font-mono mt-2">
              ~{formatCurrency(weightedAnnualPassive)} / yr
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ~{formatCurrency(weightedAnnualPassive / 12)} / month passive
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0e1626] border border-amber-500/30 rounded-2xl p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Add Investment Asset
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Asset Name</label>
              <input
                type="text"
                placeholder="e.g. CIC Money Market Fund, Safaricom Shares, Stima SACCO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Asset Class</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {ASSET_CLASSES.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Provider / Institution</label>
              <input
                type="text"
                placeholder="e.g. Britam, Central Bank of Kenya, NSE"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Current Value ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 250000' : 'e.g. 2000'}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Original Invested Principal ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 200000' : 'e.g. 1500'}
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expected Annual Yield (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 14.5"
                value={expectedAnnualYieldPercent}
                onChange={(e) => setExpectedAnnualYieldPercent(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
            >
              Save Investment
            </button>
          </div>
        </form>
      )}

      {/* Asset List */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Investment Holdings</h3>

        {investments.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <TrendingUp className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-300">No investments tracked yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your Money Market Funds, SACCO shares, or Treasury Bonds to see your wealth grow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const gain = inv.currentValue - inv.investedAmount;
              const gainPct = inv.investedAmount > 0 ? ((gain / inv.investedAmount) * 100).toFixed(1) : '0';
              const annualGain = inv.currentValue * (inv.expectedAnnualYieldPercent / 100);

              return (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-[#111a2b] border border-[#1a2840] hover:border-[#223555] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {inv.assetClass}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{inv.name}</h4>
                      <p className="text-xs text-slate-400">{inv.provider}</p>
                    </div>
                    <button
                      onClick={() => deleteInvestment(inv.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete investment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#162237] text-xs">
                    <div>
                      <div className="text-slate-400">Current Value</div>
                      <div className="text-base font-bold font-mono text-[#fbbf24] mt-0.5">
                        {formatCurrency(inv.currentValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Yield Return</div>
                      <div className="text-sm font-semibold font-mono text-teal-400 mt-0.5">
                        {inv.expectedAnnualYieldPercent}% p.a.
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Capital Growth</div>
                      <div className={`text-xs font-bold font-mono mt-0.5 ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Est. Annual Passive</div>
                      <div className="text-xs font-semibold font-mono text-cyan-300 mt-0.5">
                        ~{formatCurrency(annualGain)} / yr
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
