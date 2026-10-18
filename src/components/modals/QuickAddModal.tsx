import React, { useState } from 'react';
import {
  X,
  Plus,
  Receipt,
  Wallet,
  Target,
  Shield,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { ExpenseItem, IncomeItem } from '../../types/finance.ts';

type ModalTab = 'expense' | 'income' | 'emergency' | 'investment';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    addExpense,
    addIncome,
    depositToEmergencyFund,
    addInvestment,
    currency,
  } = useFinance();

  const [activeType, setActiveType] = useState<ModalTab>('expense');

  // Shared / Expense / Income state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food & Groceries');
  const [paymentMethod, setPaymentMethod] = useState<string>('M-Pesa');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (activeType === 'expense') {
      addExpense({
        title: title.trim() || 'General Expense',
        amount: numAmount,
        category: category as any,
        date,
        paymentMethod: paymentMethod as any,
        isRecurring: false,
      });
    } else if (activeType === 'income') {
      addIncome({
        source: title.trim() || 'Income',
        amount: numAmount,
        category: (category as any) || 'Salary',
        frequency: 'monthly',
        date,
        paymentMethod: paymentMethod as any,
      });
    } else if (activeType === 'emergency') {
      depositToEmergencyFund(numAmount);
    } else if (activeType === 'investment') {
      addInvestment({
        name: title.trim() || 'Investment Holding',
        assetClass: 'Money Market Fund (MMF)',
        currentValue: numAmount,
        investedAmount: numAmount,
        expectedAnnualYieldPercent: 14.0,
        provider: 'Asset Manager',
      });
    }

    // Reset & close
    setTitle('');
    setAmount('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e1626] border border-[#1e2d48] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#162237] bg-[#0b121f]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-400 stroke-[2.5]" />
            Quick Entry
          </h3>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#162237] bg-[#0c1424] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveType('expense');
              setCategory('Food & Groceries');
            }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeType === 'expense'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveType('income');
              setCategory('Salary');
            }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeType === 'income'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveType('emergency');
            }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeType === 'emergency'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Emergency</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveType('investment');
            }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeType === 'investment'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Investment</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Amount ({currency})
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
              className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-4 py-2.5 text-xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-400"
            />
          </div>

          {activeType !== 'emergency' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {activeType === 'expense'
                  ? 'Description / Merchant'
                  : activeType === 'income'
                  ? 'Source / Payer'
                  : 'Asset / Portfolio Name'}
              </label>
              <input
                type="text"
                placeholder={
                  activeType === 'expense'
                    ? 'e.g. Shell Petrol Station, Naivas'
                    : activeType === 'income'
                    ? 'e.g. Monthly Salary, Freelance project'
                    : 'e.g. Britam MMF'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>
          )}

          {activeType === 'expense' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="Food & Groceries">Food & Groceries</option>
                  <option value="Rent & Housing">Rent & Housing</option>
                  <option value="Transport & Fuel">Transport & Fuel</option>
                  <option value="Utilities & Bills">Utilities & Bills</option>
                  <option value="Entertainment & Dining">Entertainment & Dining</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Family & Support">Family & Support</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
          )}

          {activeType === 'income' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Side Hustle">Side Hustle</option>
                  <option value="Business">Business</option>
                  <option value="Dividends">Dividends</option>
                  <option value="Rental">Rental</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="SACCO">SACCO</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
