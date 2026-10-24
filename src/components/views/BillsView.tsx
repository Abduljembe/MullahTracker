import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Wifi,
  Droplet,
  Home,
  Tv,
  ShieldCheck,
  Tag,
  Trash2,
  Calendar,
  Filter,
  Check,
  CreditCard,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { BillCategory, BillItem } from '../../types/finance.ts';

const BILL_PRESETS: Array<{
  title: string;
  category: BillCategory;
  defaultAmount: number;
  frequency: BillItem['frequency'];
  paybillHint: string;
  icon: React.ElementType;
}> = [
  {
    title: 'KPLC Prepaid Power Tokens',
    category: 'Utilities & Power (KPLC)',
    defaultAmount: 2000,
    frequency: 'monthly',
    paybillHint: 'Paybill: 888880 | Meter #',
    icon: Zap,
  },
  {
    title: 'Safaricom Home Fibre WiFi',
    category: 'Internet & WiFi',
    defaultAmount: 3999,
    frequency: 'monthly',
    paybillHint: 'Paybill: 150501 | Acct #',
    icon: Wifi,
  },
  {
    title: 'House / Apartment Rent',
    category: 'Rent & Housing',
    defaultAmount: 35000,
    frequency: 'monthly',
    paybillHint: 'Landlord / Agent Bank or Paybill',
    icon: Home,
  },
  {
    title: 'Nairobi Water (NCWSC)',
    category: 'Water & Sanitation',
    defaultAmount: 850,
    frequency: 'monthly',
    paybillHint: 'Paybill: 444400 | Account #',
    icon: Droplet,
  },
  {
    title: 'Netflix & Spotify Premium',
    category: 'Subscriptions & Streaming',
    defaultAmount: 1450,
    frequency: 'monthly',
    paybillHint: 'Auto-Debit Card / M-PESA',
    icon: Tv,
  },
  {
    title: 'NHIF / SHIF Health Insurance',
    category: 'Insurance',
    defaultAmount: 1700,
    frequency: 'monthly',
    paybillHint: 'Paybill: 200222 | ID #',
    icon: ShieldCheck,
  },
];

export const BillsView: React.FC = () => {
  const {
    bills,
    addBill,
    deleteBill,
    markBillPaid,
    formatCurrency,
    currency,
  } = useFinance();

  const [filterStatus, setFilterStatus] = useState<'all' | 'due-soon' | 'overdue' | 'paid'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<BillCategory>('Utilities & Power (KPLC)');
  const [frequency, setFrequency] = useState<BillItem['frequency']>('monthly');
  const [accountNumber, setAccountNumber] = useState('');
  const [isAutoPay, setIsAutoPay] = useState(false);
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to calculate days diff
  const getDaysDiff = (dateStr: string): number => {
    const target = new Date(dateStr);
    const today = new Date(todayStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Metrics
  const unpaidBills = bills.filter((b) => b.status !== 'paid');
  const overdueBills = bills.filter((b) => b.status === 'overdue' || (b.status !== 'paid' && b.dueDate < todayStr));
  const dueSoonBills = unpaidBills.filter((b) => {
    const diff = getDaysDiff(b.dueDate);
    return diff >= 0 && diff <= 7;
  });
  const paidThisMonthBills = bills.filter((b) => b.status === 'paid' && b.lastPaidDate?.startsWith(todayStr.slice(0, 7)));

  const totalUpcomingAmount = unpaidBills.reduce((acc, b) => acc + b.amount, 0);
  const totalOverdueAmount = overdueBills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaidAmount = paidThisMonthBills.reduce((acc, b) => acc + b.amount, 0);
  const totalMonthlyCommitment = bills.reduce((acc, b) => {
    if (b.frequency === 'monthly') return acc + b.amount;
    if (b.frequency === 'weekly') return acc + b.amount * 4.33;
    if (b.frequency === 'yearly') return acc + b.amount / 12;
    return acc;
  }, 0);

  // Filtered list
  const filteredBills = bills.filter((bill) => {
    const daysDiff = getDaysDiff(bill.dueDate);
    const isOverdue = bill.status === 'overdue' || (bill.status !== 'paid' && daysDiff < 0);

    if (filterStatus === 'overdue' && !isOverdue) return false;
    if (filterStatus === 'paid' && bill.status !== 'paid') return false;
    if (filterStatus === 'due-soon' && (bill.status === 'paid' || daysDiff < 0 || daysDiff > 7)) return false;

    if (selectedCategory !== 'all' && bill.category !== selectedCategory) return false;

    return true;
  });

  const handleApplyPreset = (preset: (typeof BILL_PRESETS)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setAmount(preset.defaultAmount.toString());
    setFrequency(preset.frequency);
    setAccountNumber(preset.paybillHint);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) return;

    addBill({
      title,
      amount: parseFloat(amount),
      dueDate,
      category,
      frequency,
      accountNumberOrPaybill: accountNumber || undefined,
      isAutoPay,
      notes: notes || undefined,
    });

    setTitle('');
    setAmount('');
    setAccountNumber('');
    setNotes('');
    setIsAutoPay(false);
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (cat: BillCategory) => {
    switch (cat) {
      case 'Utilities & Power (KPLC)':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Internet & WiFi':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'Rent & Housing':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'Water & Sanitation':
        return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'Subscriptions & Streaming':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'Insurance':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      default:
        return <Tag className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-[#0df2c9]" />
            Upcoming Bills & Subscriptions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Never miss KPLC tokens, WiFi, Rent, or subscriptions. Pay with 1-click and sync directly to Expenses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0df2c9] text-black font-semibold text-sm hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Upcoming */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-[#18263e] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Unpaid Due</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalUpcomingAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {unpaidBills.length} pending bill{unpaidBills.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Overdue */}
        <div className={`p-4 rounded-2xl border backdrop-blur-sm ${
          overdueBills.length > 0 
            ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' 
            : 'bg-[#0e1626]/80 border-[#18263e]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${overdueBills.length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalOverdueAmount)}
          </div>
          <div className={`text-xs mt-1 ${overdueBills.length > 0 ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
            {overdueBills.length} overdue bill{overdueBills.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Due Next 7 Days */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-[#18263e] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due This Week</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {dueSoonBills.length}
          </div>
          <div className="text-xs text-cyan-400 mt-1">
            {formatCurrency(dueSoonBills.reduce((s, b) => s + b.amount, 0))} due soon
          </div>
        </div>

        {/* Monthly Recurring Total */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-[#18263e] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Commitment</span>
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(totalMonthlyCommitment)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Recurring baseline / month
          </div>
        </div>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1322] border border-[#18253b]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#0df2c9]" />
            <span>Fast Kenya & Global Bill Presets</span>
          </div>
          <span className="text-[11px] text-slate-400">Click to prefill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {BILL_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.title}
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111c30] hover:bg-[#162540] border border-[#1c2e4c] hover:border-teal-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer group"
              >
                <Icon className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>{preset.title}</span>
                <span className="text-slate-400 font-mono text-[11px]">({formatCurrency(preset.defaultAmount)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Category Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1322] border border-[#18253b] overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Bills' },
              { id: 'due-soon', label: 'Due Soon (≤7d)' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'paid', label: 'Paid This Month' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterStatus(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === t.id
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0c1322] border border-[#18253b] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="Utilities & Power (KPLC)">Utilities & Power (KPLC)</option>
            <option value="Internet & WiFi">Internet & WiFi</option>
            <option value="Rent & Housing">Rent & Housing</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Subscriptions & Streaming">Subscriptions & Streaming</option>
            <option value="Insurance">Insurance</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Bills Cards Grid */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0c1322]/60 border border-[#18253b]/80">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#0df2c9] flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">No bills match your current filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Add recurring utilities like KPLC power tokens, WiFi, water, and rent to stay on top of your due dates.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Bill</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => {
            const daysDiff = getDaysDiff(bill.dueDate);
            const isOverdue = bill.status === 'overdue' || (bill.status !== 'paid' && daysDiff < 0);
            const isPaid = bill.status === 'paid';
            const isDueSoon = !isPaid && !isOverdue && daysDiff <= 3;

            return (
              <div
                key={bill.id}
                className={`relative rounded-2xl p-4 transition-all border flex flex-col justify-between ${
                  isPaid
                    ? 'bg-[#0a1220]/60 border-[#15233c] opacity-80'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    : isDueSoon
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-[#0c1322] border-[#18253b] hover:border-[#223554]'
                }`}
              >
                {/* Top Row: Category icon, Title, and Status badge */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#111d33] border border-[#1d2f50] flex items-center justify-center shrink-0">
                        {getCategoryIcon(bill.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{bill.title}</h4>
                        <span className="text-[11px] text-slate-400 capitalize">{bill.frequency} recurrence</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue ({Math.abs(daysDiff)}d)</span>
                        </span>
                      ) : daysDiff === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>Due Today</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          <Calendar className="w-3 h-3" />
                          <span>In {daysDiff} day{daysDiff === 1 ? '' : 's'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount and Due Date */}
                  <div className="mt-4 flex items-baseline justify-between border-t border-[#141f33] pt-3">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Amount Due</div>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">
                        {formatCurrency(bill.amount)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Due Date</div>
                      <div className="text-xs font-semibold text-slate-200 font-mono mt-0.5">
                        {new Date(bill.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Paybill / Account Ref */}
                  {bill.accountNumberOrPaybill && (
                    <div className="mt-3 p-2 rounded-xl bg-[#090f1a] border border-[#15233c] text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">Account / Paybill:</span>
                      <span className="text-[#0df2c9] font-medium">{bill.accountNumberOrPaybill}</span>
                    </div>
                  )}

                  {bill.notes && (
                    <p className="mt-2 text-[11px] text-slate-400 italic truncate">
                      "{bill.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-[#141f33] flex items-center justify-between gap-2">
                  <button
                    onClick={() => deleteBill(bill.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => markBillPaid(bill.id, 'M-Pesa')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0df2c9]/15 hover:bg-[#0df2c9]/25 text-[#0df2c9] border border-[#0df2c9]/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
                      title="Log this bill as an Expense and roll next due date forward"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Paid</span>
                    </button>
                  )}

                  {isPaid && (
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 ml-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paid on {bill.lastPaidDate || 'recently'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Bill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b121e] border border-[#162540] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#0df2c9]" />
              Schedule Bill / Subscription
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add upcoming utility or recurring obligation. You can mark it as paid with 1 click to sync into Expenses.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bill Name / Service</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KPLC Tokens, Zuku WiFi, Apartment Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BillCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Utilities & Power (KPLC)">Utilities & Power (KPLC)</option>
                    <option value="Internet & WiFi">Internet & WiFi</option>
                    <option value="Rent & Housing">Rent & Housing</option>
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Subscriptions & Streaming">Subscriptions & Streaming</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Chama & Welfare">Chama & Welfare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recurrence</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as BillItem['frequency'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="monthly">Monthly (rolls forward automatically)</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Number / Paybill (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Meter No. 142098751 or Paybill: 888880"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Reminder Info</label>
                <textarea
                  rows={2}
                  placeholder="Additional payment instructions or billing details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#162540]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0df2c9] hover:bg-[#0df2c9]/90 text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
