import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  Tag,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { IncomeItem } from '../../types/finance.ts';

export const IncomeView: React.FC = () => {
  const { incomes, addIncome, deleteIncome, formatCurrency, totalMonthlyIncome, currency } = useFinance();

  const [isAdding, setIsAdding] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<IncomeItem['category']>('Salary');
  const [frequency, setFrequency] = useState<IncomeItem['frequency']>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<IncomeItem['paymentMethod']>('Bank Transfer');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount) return;

    addIncome({
      source: source.trim(),
      amount: parseFloat(amount),
      category,
      frequency,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setSource('');
    setAmount('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Monthly Income</div>
          <div className="text-2xl font-bold font-mono text-[#00e5a3] mt-2">
            {formatCurrency(totalMonthlyIncome)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {incomes.length} active income stream{incomes.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Primary Income Stream</div>
          <div className="text-lg font-bold text-white truncate mt-2">
            {incomes.length > 0
              ? [...incomes].sort((a, b) => b.amount - a.amount)[0].source
              : 'None'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {incomes.length > 0
              ? formatCurrency([...incomes].sort((a, b) => b.amount - a.amount)[0].amount)
              : 'Add your salary or main hustle'}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Stream Diversification</div>
            <div className="text-lg font-bold text-teal-400 mt-2">
              {incomes.length > 1 ? 'Multi-Stream' : incomes.length === 1 ? 'Single Source' : 'No Sources'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Multiple sources improve stability</div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0df2c9] hover:bg-[#00d2b4] text-[#071317] font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Add Form Collapse */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0e1626] border border-teal-500/30 rounded-2xl p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-teal-400" />
              Record New Income Stream
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Source / Employer</label>
              <input
                type="text"
                placeholder="e.g. Primary Job, Freelance Client, Rental Unit"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (KES)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 120000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="Salary">Salary (Net)</option>
                <option value="Freelance">Freelance / Consulting</option>
                <option value="Side Hustle">Side Hustle / Gig</option>
                <option value="Business">Business Revenue</option>
                <option value="Dividends">SACCO / Stock Dividends</option>
                <option value="Rental">Rental Property Income</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="one-time">One-Time / Ad-hoc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer (RTGS / Pesalink)</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="SACCO">SACCO FOSA Account</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Optional Notes</label>
            <input
              type="text"
              placeholder="e.g. Paid on the 28th of every month"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
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
              className="px-5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs transition-colors"
            >
              Save Income
            </button>
          </div>
        </form>
      )}

      {/* List of Income Items */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Recorded Income Streams</h3>

        {incomes.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Wallet className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-300">No income streams recorded</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your salary, business proceeds, or side gigs to calculate your monthly cash flow.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#162237]">
            {incomes.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      {item.source}
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                      {item.frequency === 'monthly' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950/60 text-teal-300 border border-teal-800/40">
                          Monthly
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span>{item.paymentMethod}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                      {item.notes && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500 italic">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                  <div className="text-base font-bold font-mono text-[#00e5a3]">
                    +{formatCurrency(item.amount)}
                  </div>
                  <button
                    onClick={() => deleteIncome(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete income"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
