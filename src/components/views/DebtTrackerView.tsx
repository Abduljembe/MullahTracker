import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingDown,
  ArrowDown,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { DebtItem } from '../../types/finance.ts';

const DEBT_CATEGORIES: DebtItem['category'][] = [
  'Mobile Loan',
  'Bank Loan',
  'Student / HELB',
  'Credit Card',
  'Personal',
  'Mortgage',
  'Other',
];

export const DebtTrackerView: React.FC = () => {
  const { debts, addDebt, recordDebtPayment, deleteDebt, formatCurrency, totalDebt, currency } = useFinance();

  const [isAdding, setIsAdding] = useState(false);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Form
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [principal, setPrincipal] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [interestRatePercent, setInterestRatePercent] = useState('12');
  const [minimumMonthlyPayment, setMinimumMonthlyPayment] = useState('');
  const [dueDate, setDueDate] = useState('2026-06-25');
  const [category, setCategory] = useState<DebtItem['category']>('Mobile Loan');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !remainingAmount) return;

    const rem = parseFloat(remainingAmount);
    const princ = parseFloat(principal) || rem;

    addDebt({
      name: name.trim(),
      lender: lender.trim() || 'Lender',
      principal: princ,
      remainingAmount: rem,
      interestRatePercent: parseFloat(interestRatePercent) || 0,
      minimumMonthlyPayment: parseFloat(minimumMonthlyPayment) || Math.round(rem * 0.1),
      dueDate,
      category,
    });

    setName('');
    setLender('');
    setPrincipal('');
    setRemainingAmount('');
    setMinimumMonthlyPayment('');
    setIsAdding(false);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDebtId || !paymentAmount) return;

    const amt = parseFloat(paymentAmount);
    if (amt > 0) {
      recordDebtPayment(paymentDebtId, amt);
    }

    setPaymentDebtId(null);
    setPaymentAmount('');
  };

  // Sort by Strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === 'snowball') {
      // Smallest balance first
      return a.remainingAmount - b.remainingAmount;
    } else {
      // Highest interest rate first (Avalanche)
      return b.interestRatePercent - a.interestRatePercent;
    }
  });

  const totalMinPayments = debts.reduce((sum, d) => sum + d.minimumMonthlyPayment, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Remaining Liabilities</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {formatCurrency(totalDebt)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {debts.length} active liability / loan{debts.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Monthly Debt Commitments</div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalMinPayments)} / mo
          </div>
          <div className="text-xs text-slate-500 mt-1">Minimum monthly payments required</div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Payoff Freedom Goal</div>
            <div className="text-lg font-bold text-teal-400 mt-2">
              {totalDebt === 0 ? 'Debt Free!' : 'Freedom Plan Active'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {strategy === 'avalanche' ? 'Avalanche (Highest Interest)' : 'Snowball (Smallest Balance)'}
            </div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Debt</span>
          </button>
        </div>
      </div>

      {/* Pay Modal */}
      {paymentDebtId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handlePay}
            className="bg-[#0e1626] border border-rose-500/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Record Debt Repayment
            </h3>
            <p className="text-xs text-slate-400">
              Enter the amount paid towards {debts.find((d) => d.id === paymentDebtId)?.name}.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Amount ({currency})</label>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 5000' : 'e.g. 50'}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                autoFocus
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-base text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentDebtId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:bg-emerald-400"
              >
                Apply Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0e1626] border border-rose-500/30 rounded-2xl p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-400" />
              Add Liability or Debt
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Loan / Debt Name</label>
              <input
                type="text"
                placeholder="e.g. Fuliza M-Pesa, HELB Student Loan, KCB Bank Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Lender / Institution</label>
              <input
                type="text"
                placeholder="e.g. Safaricom / NCBA, HELB, Equity Bank"
                value={lender}
                onChange={(e) => setLender(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                {DEBT_CATEGORIES.map((dc) => (
                  <option key={dc} value={dc}>
                    {dc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Remaining Balance ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 50000' : 'e.g. 500'}
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Original Principal ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 80000' : 'e.g. 800'}
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 13.5"
                value={interestRatePercent}
                onChange={(e) => setInterestRatePercent(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Payment ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 4500' : 'e.g. 45'}
                value={minimumMonthlyPayment}
                onChange={(e) => setMinimumMonthlyPayment(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
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
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors"
            >
              Save Debt
            </button>
          </div>
        </form>
      )}

      {/* Payoff Strategy Selector */}
      <div className="flex items-center justify-between bg-[#0e1626] border border-[#18263e] rounded-2xl p-4">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Recommended Payoff Strategy
          </div>
          <div className="text-[11px] text-slate-400">
            {strategy === 'avalanche'
              ? 'Avalanche orders highest interest first, saving the most money on charges.'
              : 'Snowball orders smallest balance first for rapid psychological momentum.'}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#121c2e] p-1 rounded-xl border border-[#1b2b44]">
          <button
            onClick={() => setStrategy('avalanche')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              strategy === 'avalanche'
                ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Avalanche (Recommended)
          </button>
          <button
            onClick={() => setStrategy('snowball')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              strategy === 'snowball'
                ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Snowball
          </button>
        </div>
      </div>

      {/* Debt List */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Liabilities Priority Order</h3>

        {debts.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-60" />
            <p className="text-sm font-medium text-slate-300">You are completely debt free!</p>
            <p className="text-xs text-slate-500 mt-1">
              No outstanding loans recorded. Keep investing surplus income into high-yield assets.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDebts.map((item, idx) => {
              const paid = Math.max(0, item.principal - item.remainingAmount);
              const pctPaid = item.principal > 0 ? Math.round((paid / item.principal) * 100) : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#111a2b] border border-[#1a2840] hover:border-[#223555] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-400">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {item.name}
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {item.category}
                          </span>
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{item.lender}</span>
                          <span>·</span>
                          <span className="text-amber-400 font-mono font-semibold">{item.interestRatePercent}% APR</span>
                          <span>·</span>
                          <span>Due: {item.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-rose-400">
                          {formatCurrency(item.remainingAmount)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Min: {formatCurrency(item.minimumMonthlyPayment)}/mo
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPaymentDebtId(item.id);
                          setPaymentAmount('');
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Record Payment
                      </button>

                      <button
                        onClick={() => deleteDebt(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                        title="Delete liability"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar of loan repayment */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span>{pctPaid}% paid off</span>
                      <span>Principal: {formatCurrency(item.principal)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${pctPaid}%` }}
                      />
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
