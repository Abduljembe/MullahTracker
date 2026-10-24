import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';
import { SavingsGoal } from '../../types/finance.ts';

const GOAL_CATEGORIES: SavingsGoal['category'][] = [
  'Land & Property',
  'Vehicle',
  'Wedding',
  'Business Capital',
  'Travel',
  'Education',
  'Gadget / Tech',
  'Emergency',
  'Other',
];

export const SavingsGoalsView: React.FC = () => {
  const { savingsGoals, addSavingsGoal, depositToGoal, deleteSavingsGoal, formatCurrency, currency } = useFinance();

  const [isAdding, setIsAdding] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [category, setCategory] = useState<SavingsGoal['category']>('Land & Property');
  const [color, setColor] = useState('#0df2c9');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    addSavingsGoal({
      title: title.trim(),
      targetAmount: parseFloat(targetAmount),
      deadline,
      category,
      color,
    });

    setTitle('');
    setTargetAmount('');
    setIsAdding(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;

    const amt = parseFloat(depositAmount);
    if (amt > 0) {
      const goal = savingsGoals.find((g) => g.id === depositGoalId);
      depositToGoal(depositGoalId, amt);

      if (goal && goal.currentAmount + amt >= goal.targetAmount) {
        // Goal Reached! Trigger Confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0df2c9', '#38bdf8', '#fbbf24', '#a855f7'],
        });
      }
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Goals Target</div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalTarget)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{savingsGoals.length} milestone target(s)</div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Saved Towards Goals</div>
          <div className="text-2xl font-bold font-mono text-[#00d2ff] mt-2">
            {formatCurrency(totalSaved)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% accumulated` : '0%'}
          </div>
        </div>

        <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Goal Success</div>
            <div className="text-lg font-bold text-teal-400 mt-2">
              {savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length} Completed
            </div>
            <div className="text-xs text-slate-500 mt-1">Milestones unlocked</div>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Add Goal Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-[#0e1626] border border-cyan-500/30 rounded-2xl p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Create Savings Milestone
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. 50x100 Plot in Kangundo Rd, New Laptop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Amount ({currency})</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 500000' : 'e.g. 5000'}
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Accent Color</label>
              <div className="flex items-center gap-2 pt-1">
                {['#0df2c9', '#38bdf8', '#fbbf24', '#a855f7', '#f43f5e'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
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
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
            >
              Create Goal
            </button>
          </div>
        </form>
      )}

      {/* Deposit to Goal Mini Dialog */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleDeposit}
            className="bg-[#0e1626] border border-teal-500/30 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Deposit to {savingsGoals.find((g) => g.id === depositGoalId)?.title}
            </h3>
            <p className="text-xs text-slate-400">
              Enter the amount transferred from income or savings towards this goal.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Deposit Amount ({currency})</label>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder={currency === 'KES' ? 'e.g. 25000' : 'e.g. 250'}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
                required
                className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl px-3 py-2 text-base text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDepositGoalId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0df2c9] text-slate-950 font-bold text-xs rounded-xl shadow-md hover:bg-[#00d2b4]"
              >
                Confirm Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Goals */}
      <div className="bg-[#0e1626] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-5">
        <h3 className="text-sm font-bold text-white">Your Milestone Goals</h3>

        {savingsGoals.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Target className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-300">No savings goals created</p>
            <p className="text-xs text-slate-500 mt-1">
              Add goals like purchasing land, funding a wedding, or planning your dream holiday.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savingsGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-[#111a2b] border border-[#1a2840] hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {goal.category}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">{goal.title}</h4>
                      </div>
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Target: {goal.deadline}</span>
                    </div>
                  </div>

                  {/* Progress & Numbers */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">
                        Saved: <strong className="text-white">{formatCurrency(goal.currentAmount)}</strong>
                      </span>
                      <span className="text-slate-400">Goal: {formatCurrency(goal.targetAmount)}</span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: goal.color || '#0df2c9',
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-xs font-bold" style={{ color: goal.color || '#0df2c9' }}>
                        {pct}% Complete
                      </span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reached!
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">
                          {formatCurrency(remaining)} to go
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDepositGoalId(goal.id);
                      setDepositAmount('');
                    }}
                    className="w-full py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2e4e] border border-[#213554] text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deposit Funds</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
