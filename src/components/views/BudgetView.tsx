import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

const DEFAULT_BUDGET_CATEGORIES = [
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

export const BudgetView: React.FC = () => {
  const { budgets, setCategoryBudget, deleteBudget, expenses, formatCurrency, totalMonthlyExpenses } = useFinance();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');

  // Calculate spent per budget category
  const categorySpentMap = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (categorySpentMap[b.category] || 0), 0);
  const totalBudgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const overallPercentage = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  const handleSaveBudget = (cat: string) => {
    const val = parseFloat(newLimit);
    if (!isNaN(val) && val >= 0) {
      setCategoryBudget(cat, val);
    }
    setEditingCategory(null);
    setNewLimit('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Monthly Budget Limit</div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalBudgetLimit)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all planned categories</div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Spent so far</div>
          <div className="text-2xl font-bold font-mono text-[#ff4b6b] mt-2">
            {formatCurrency(totalBudgetSpent)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {overallPercentage}% of allocated budget utilized
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Remaining Safe Buffer</div>
          <div className="text-2xl font-bold font-mono text-[#00e5a3] mt-2">
            {formatCurrency(totalBudgetRemaining)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Remaining available to spend</div>
        </div>
      </div>

      {/* Main Budget List */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#162237]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-400" />
              Category Budget Allowances
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set realistic monthly spending ceilings to prevent lifestyle creep and retain cashflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_BUDGET_CATEGORIES.map((category) => {
            const budgetItem = budgets.find((b) => b.category === category);
            const limit = budgetItem ? budgetItem.monthlyLimit : 0;
            const spent = categorySpentMap[category] || 0;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : spent > 0 ? 100 : 0;
            const remaining = Math.max(0, limit - spent);
            const isExceeded = limit > 0 && spent > limit;
            const isWarning = limit > 0 && pct >= 80 && !isExceeded;

            return (
              <div
                key={category}
                className="p-4 rounded-xl bg-[#111a2c] border border-[#1a2942] space-y-3 transition-colors hover:border-[#223555]"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-white">{category}</div>

                  {editingCategory === category ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Limit"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        className="w-24 bg-[#0a111e] border border-teal-500 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBudget(category)}
                        className="px-2 py-1 bg-teal-400 text-slate-950 font-bold text-xs rounded-lg"
                      >
                        Set
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {limit > 0 ? formatCurrency(limit) : 'No limit set'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setNewLimit(limit.toString());
                        }}
                        className="p-1 text-slate-500 hover:text-teal-400 rounded-lg"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>
                      Spent: <strong className="text-white">{formatCurrency(spent)}</strong>
                    </span>
                    <span>
                      {limit > 0 ? (
                        isExceeded ? (
                          <span className="text-rose-400 font-bold">Exceeded by {formatCurrency(spent - limit)}</span>
                        ) : (
                          <span className="text-teal-400">{formatCurrency(remaining)} left</span>
                        )
                      ) : (
                        <span>{pct}%</span>
                      )}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-[#ff4b6b]'
                          : isWarning
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-teal-400 to-[#0df2c9]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {limit === 0 ? 'Click edit to set monthly cap' : `${pct}% of monthly limit`}
                  </span>
                  {isExceeded ? (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertTriangle className="w-3 h-3" /> Over budget
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <AlertTriangle className="w-3 h-3" /> Approaching cap
                    </span>
                  ) : limit > 0 ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> On track
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
