import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Coins,
  ShieldCheck,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';
import { ChamaItem } from '../../types/finance.ts';

export const ChamaView: React.FC = () => {
  const { chamas, addChama, deleteChama, addExpense, addIncome, formatCurrency } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ChamaItem['type']>('Merry-Go-Round');
  const [contributionAmount, setContributionAmount] = useState<number>(5000);
  const [frequency, setFrequency] = useState<ChamaItem['frequency']>('monthly');
  const [totalMembers, setTotalMembers] = useState<number>(10);
  const [payoutDate, setPayoutDate] = useState<string>(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [payoutAmount, setPayoutAmount] = useState<number>(50000);
  const [notes, setNotes] = useState('');

  const totalMonthlyCommitment = chamas.reduce((sum, item) => {
    if (item.frequency === 'monthly') return sum + item.contributionAmount;
    if (item.frequency === 'weekly') return sum + item.contributionAmount * 4;
    if (item.frequency === 'bi-weekly') return sum + item.contributionAmount * 2;
    return sum + item.contributionAmount;
  }, 0);

  const totalExpectedPayouts = chamas.reduce((sum, item) => sum + item.payoutAmount, 0);

  const handleCreateChama = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || contributionAmount <= 0) return;

    addChama({
      name: name.trim(),
      type,
      contributionAmount,
      frequency,
      totalMembers,
      payoutDate,
      payoutAmount: payoutAmount || contributionAmount * totalMembers,
      notes: notes.trim() || undefined,
    });

    setName('');
    setContributionAmount(5000);
    setPayoutAmount(50000);
    setNotes('');
    setIsAddModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleRecordContribution = (chama: ChamaItem) => {
    addExpense({
      title: `${chama.name} Contribution`,
      amount: chama.contributionAmount,
      category: 'Family & Support',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'M-Pesa',
      isRecurring: true,
      notes: `Recorded regular ${chama.frequency} contribution for ${chama.name}`,
    });

    setSuccessMessage(`Logged ${formatCurrency(chama.contributionAmount)} contribution for ${chama.name} in Expenses!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRecordPayout = (chama: ChamaItem) => {
    addIncome({
      source: `${chama.name} Payout`,
      amount: chama.payoutAmount,
      category: 'Dividends',
      frequency: 'one-time',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'M-Pesa',
      notes: `Received rotational payout pool from ${chama.name}`,
    });

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    });

    setSuccessMessage(`Celebration! Recorded ${formatCurrency(chama.payoutAmount)} payout received into Monthly Income!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const getDaysUntilPayout = (targetDate: string): number => {
    const diff = new Date(targetDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Chama & Table Banking Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track your Merry-Go-Round cycles, group contributions, and upcoming lump-sum payout dates.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0df2c9] hover:bg-[#00d2b4] text-[#071317] font-bold text-xs transition-colors shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Chama Group</span>
        </button>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="bg-teal-500/15 border border-teal-500/30 rounded-xl p-3.5 text-xs text-teal-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0df2c9] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Monthly Chama Commitments</div>
          <div className="text-2xl font-extrabold text-[#0df2c9] font-mono mt-2">
            {formatCurrency(totalMonthlyCommitment)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across {chamas.length} active group(s)</div>
        </div>

        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Expected Payout Pools</div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-2">
            {formatCurrency(totalExpectedPayouts)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total lump sums to collect</div>
        </div>

        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Next Rotation Payout</div>
          <div className="text-2xl font-extrabold text-teal-300 font-mono mt-2">
            {chamas.length > 0 ? (
              `${Math.max(0, Math.min(...chamas.map((c) => getDaysUntilPayout(c.payoutDate))))} Days`
            ) : (
              'None set'
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Countdown to next recipient turn</div>
        </div>
      </div>

      {/* Chama Groups List */}
      {chamas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chamas.map((chama) => {
            const daysLeft = getDaysUntilPayout(chama.payoutDate);
            const isDueSoon = daysLeft <= 14 && daysLeft >= 0;

            return (
              <div
                key={chama.id}
                className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/40 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-[#0df2c9] border border-teal-500/20">
                        {chama.type}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">{chama.name}</h3>
                    </div>
                    <button
                      onClick={() => deleteChama(chama.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/50"
                      title="Delete Chama"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {chama.notes && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{chama.notes}</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-[#141e30] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Contribution:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {formatCurrency(chama.contributionAmount)} ({chama.frequency})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Members:</span>
                      <span className="font-mono text-slate-300">{chama.totalMembers} members</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expected Payout:</span>
                      <span className="font-mono font-extrabold text-amber-400">
                        {formatCurrency(chama.payoutAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Your Payout Date:</span>
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isDueSoon ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {chama.payoutDate} ({daysLeft > 0 ? `${daysLeft}d left` : 'Due!'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#141e30] flex items-center gap-2">
                  <button
                    onClick={() => handleRecordContribution(chama)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2e4f] border border-[#213554] text-slate-200 text-xs font-medium transition-colors"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pay {formatCurrency(chama.contributionAmount)}</span>
                  </button>

                  <button
                    onClick={() => handleRecordPayout(chama)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5 text-teal-400" />
                    <span>Collect Pool</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0e1626]/60 border border-[#19273f] rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Chama Groups Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Chamas and table banking circles are a cornerstone of financial growth in East Africa. Add your Merry-Go-Round groups to track turn dates, obligations, and payouts.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0df2c9] text-[#071317] font-bold text-xs hover:bg-[#00d2b4] transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Chama</span>
          </button>
        </div>
      )}

      {/* Add Chama Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0e1626] border border-[#1d2d47] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#141e30]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0df2c9]" />
                Add Chama / Table Banking Circle
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChama} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tumaini Investment Chama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chama Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ChamaItem['type'])}
                    className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Merry-Go-Round">Merry-Go-Round</option>
                    <option value="Table Banking / Investment">Table Banking</option>
                    <option value="Welfare">Welfare Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ChamaItem['frequency'])}
                    className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Your Contribution</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={contributionAmount || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setContributionAmount(val);
                      setPayoutAmount(val * totalMembers);
                    }}
                    className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Members</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={totalMembers}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 2;
                      setTotalMembers(val);
                      setPayoutAmount(contributionAmount * val);
                    }}
                    className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Your Payout Date</label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lump Sum Payout (KES)</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={payoutAmount || ''}
                    onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Treasurer Contact</label>
                <input
                  type="text"
                  placeholder="e.g. M-Pesa Till 892348, meets every 1st Sunday"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#141e30]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0df2c9] text-[#071317] font-bold hover:bg-[#00d2b4] transition-colors"
                >
                  Save Chama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
