import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { ExpenseItem } from '../../types/finance.ts';

const CATEGORIES: ExpenseItem['category'][] = [
  'Rent & Housing',
  'Food & Groceries',
  'Transport & Fuel',
  'Utilities & Bills',
  'Entertainment & Dining',
  'Healthcare',
  'Education',
  'Family & Support',
  'Shopping',
  'Other',
];

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, formatCurrency, totalMonthlyExpenses } = useFinance();

  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('Food & Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem['paymentMethod']>('M-Pesa');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      paymentMethod,
      isRecurring,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setIsAdding(false);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Monthly Expenses</div>
          <div className="text-2xl font-bold font-mono text-[#ff4b6b] mt-2">
            {formatCurrency(totalMonthlyExpenses)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {expenses.length} transaction{expenses.length !== 1 ? 's' : ''} logged
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Largest Spending Category</div>
          <div className="text-lg font-bold text-white truncate mt-2">
            {expenses.length > 0
              ? (() => {
                  const catTotals: Record<string, number> = {};
                  expenses.forEach((e) => {
                    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
                  });
                  return Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0][0];
                })()
              : 'None'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Monitored against your monthly limits</div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Payment Habits</div>
            <div className="text-lg font-bold text-[#0df2c9] mt-2">
              {expenses.filter((e) => e.paymentMethod === 'M-Pesa').length} M-Pesa
            </div>
            <div className="text-xs text-slate-500 mt-1">Mobile payments tracker</div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff4b6b] hover:bg-[#ff3357] text-white font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Add Form Collapse */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0e1626] border border-rose-500/30 rounded-2xl p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#ff4b6b]" />
              Record New Expense
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Expense Title / Merchant</label>
              <input
                type="text"
                placeholder="e.g. Naivas Supermarket, KPLC Tokens, Shell Fuel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount (KES)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 4500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                <option value="M-Pesa">M-Pesa (Till / Paybill / Send Money)</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Bank">Bank Transfer / Pesalink</option>
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
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-700 text-teal-400 focus:ring-teal-400 w-4 h-4 bg-slate-900"
                />
                <span>Monthly Recurring Bill (e.g. Rent, Fiber, Gym)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Optional Notes</label>
            <input
              type="text"
              placeholder="e.g. M-Pesa Ref QBG82K9P2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
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
              className="px-5 py-2 rounded-xl bg-[#ff4b6b] hover:bg-[#ff3357] text-white font-bold text-xs transition-colors"
            >
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search expenses or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0e1626] border border-[#1a2840] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0e1626] border border-[#1a2840] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#162237]">
          <h3 className="text-sm font-bold text-white">Expenses Ledger</h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredExpenses.length} of {expenses.length}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Receipt className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-300">No expenses found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your bills and daily expenses to take control of your financial destiny.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#162237]">
            {filteredExpenses.map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#ff4b6b] shrink-0 mt-0.5">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      {item.title}
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                      {item.isRecurring && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className="font-mono text-slate-400">{item.paymentMethod}</span>
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
                  <div className="text-base font-bold font-mono text-[#ff4b6b]">
                    -{formatCurrency(item.amount)}
                  </div>
                  <button
                    onClick={() => deleteExpense(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete expense"
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
