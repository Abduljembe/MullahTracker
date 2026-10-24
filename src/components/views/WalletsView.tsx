import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  Smartphone,
  Building,
  Landmark,
  Coins,
  CreditCard,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { WalletAccount, WalletType } from '../../types/finance.ts';

const PRESET_ACCOUNTS: Array<{
  name: string;
  type: WalletType;
  institution: string;
  color: string;
}> = [
  { name: 'M-PESA Primary', type: 'M-PESA', institution: 'Safaricom', color: '#00a859' },
  { name: 'Equity Bank Checking', type: 'Bank Account', institution: 'Equity Bank', color: '#a32020' },
  { name: 'KCB Bank Current', type: 'Bank Account', institution: 'KCB Group', color: '#0d5b94' },
  { name: 'SACCO FOSA Account', type: 'SACCO FOSA', institution: 'Stima / Police SACCO', color: '#d97706' },
  { name: 'Cash on Hand', type: 'Cash / Physical', institution: 'Cash Wallet', color: '#10b981' },
];

export const WalletsView: React.FC = () => {
  const {
    wallets,
    transfers,
    addWallet,
    deleteWallet,
    transferBetweenWallets,
    reconcileWalletBalance,
    totalLiquidBalance,
    formatCurrency,
    currency,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [reconcilingWallet, setReconcilingWallet] = useState<WalletAccount | null>(null);
  const [reconcileAmount, setReconcileAmount] = useState('');

  // Add form state
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('M-PESA');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('Safaricom');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#0df2c9');

  // Transfer form state
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferFee, setTransferFee] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Aggregate stats
  const mpesaBalance = wallets
    .filter((w) => w.type === 'M-PESA')
    .reduce((sum, w) => sum + w.balance, 0);

  const bankSaccoBalance = wallets
    .filter((w) => w.type === 'Bank Account' || w.type === 'SACCO FOSA')
    .reduce((sum, w) => sum + w.balance, 0);

  const cashBalance = wallets
    .filter((w) => w.type === 'Cash / Physical')
    .reduce((sum, w) => sum + w.balance, 0);

  const handleOpenTransfer = (fromId?: string) => {
    if (wallets.length < 2) {
      alert('Please add at least 2 accounts before initiating an inter-wallet transfer.');
      return;
    }
    if (fromId) {
      setFromWalletId(fromId);
      const other = wallets.find((w) => w.id !== fromId);
      if (other) setToWalletId(other.id);
    } else {
      setFromWalletId(wallets[0]?.id || '');
      setToWalletId(wallets[1]?.id || '');
    }
    setIsTransferModalOpen(true);
  };

  const handleOpenReconcile = (w: WalletAccount) => {
    setReconcilingWallet(w);
    setReconcileAmount(w.balance.toString());
    setIsReconcileModalOpen(true);
  };

  const handleSaveReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcilingWallet || !reconcileAmount) return;
    reconcileWalletBalance(reconcilingWallet.id, parseFloat(reconcileAmount));
    setIsReconcileModalOpen(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    addWallet({
      name,
      type,
      balance: parseFloat(balance),
      institution,
      accountNumber: accountNumber || undefined,
      color,
    });

    setName('');
    setBalance('');
    setAccountNumber('');
    setIsAddModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWalletId || !toWalletId || !transferAmount) return;

    const amt = parseFloat(transferAmount);
    const fee = transferFee ? parseFloat(transferFee) : 0;

    const success = transferBetweenWallets({
      fromWalletId,
      toWalletId,
      amount: amt,
      fee,
      notes: transferNotes || undefined,
      date: transferDate,
    });

    if (success) {
      setTransferAmount('');
      setTransferFee('');
      setTransferNotes('');
      setIsTransferModalOpen(false);
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_ACCOUNTS)[0]) => {
    setName(preset.name);
    setType(preset.type);
    setInstitution(preset.institution);
    setColor(preset.color);
    setBalance('10000');
    setIsAddModalOpen(true);
  };

  const getWalletIcon = (t: WalletType) => {
    switch (t) {
      case 'M-PESA':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'Bank Account':
        return <Building className="w-5 h-5 text-sky-400" />;
      case 'SACCO FOSA':
        return <Landmark className="w-5 h-5 text-amber-400" />;
      case 'Cash / Physical':
        return <Coins className="w-5 h-5 text-teal-400" />;
      case 'Credit Card':
        return <CreditCard className="w-5 h-5 text-purple-400" />;
      default:
        return <Wallet className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-[#0df2c9]" />
            Multi-Wallet Accounts & Reconciliation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage M-PESA, Bank Accounts, SACCO FOSA, and Cash. Move funds without skewing income or expenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenTransfer()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#121e33] hover:bg-[#182742] text-teal-300 border border-teal-500/30 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#0df2c9]" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0df2c9] text-black font-semibold text-xs hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquid */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-teal-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Total Liquid Net</span>
            <Wallet className="w-4 h-4 text-[#0df2c9]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalLiquidBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {wallets.length} active account{wallets.length === 1 ? '' : 's'}
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* M-PESA Total */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-[#18263e] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">M-PESA Balances</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatCurrency(mpesaBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Mobile wallet liquidity
          </div>
        </div>

        {/* Bank & SACCO */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-[#18263e] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Banks & SACCOs</span>
            <Landmark className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-2">
            {formatCurrency(bankSaccoBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Institutions & FOSA
          </div>
        </div>

        {/* Cash Float */}
        <div className="p-4 rounded-2xl bg-[#0e1626]/80 border border-[#18263e] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cash Float</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-2">
            {formatCurrency(cashBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Physical wallet & reserve
          </div>
        </div>
      </div>

      {/* Quick Add Presets */}
      <div className="p-4 rounded-2xl bg-[#0c1322] border border-[#18253b]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
            <span>Fast Setup Accounts (Kenya & Global)</span>
          </div>
          <span className="text-[11px] text-slate-400">Click to bootstrap</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_ACCOUNTS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111c30] hover:bg-[#162540] border border-[#1c2e4c] hover:border-teal-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0c1322]/60 border border-[#18253b]/80">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#0df2c9] flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">No active accounts configured</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Add your M-PESA phone wallet, bank accounts, SACCO FOSA, or cash reserve to track real net balances and perform transfers.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="rounded-2xl p-5 bg-[#0c1322] border border-[#18253b] hover:border-[#223554] transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{ backgroundColor: wallet.color || '#0df2c9' }}
              />

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#111d33] border border-[#1d2f50] flex items-center justify-center shrink-0">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{wallet.name}</h4>
                      <p className="text-xs text-slate-400">{wallet.institution || wallet.type}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#111d33] text-slate-300 border border-[#1d2f50]">
                    {wallet.type}
                  </span>
                </div>

                {/* Balance display */}
                <div className="mt-5 pt-3 border-t border-[#141f33]">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Current Balance</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {formatCurrency(wallet.balance)}
                  </div>
                  {wallet.accountNumber && (
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      Acct: •••• {wallet.accountNumber.slice(-4) || wallet.accountNumber}
                    </div>
                  )}
                </div>

                {wallet.lastReconciled && (
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Reconciled: {new Date(wallet.lastReconciled).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-[#141f33] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenReconcile(wallet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111d33] hover:bg-[#182744] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  title="Reconcile balance to match actual statement"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Reconcile</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenTransfer(wallet.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-[#0df2c9] border border-teal-500/20 text-xs font-medium transition-colors cursor-pointer"
                    title="Transfer money from this wallet"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Send</span>
                  </button>

                  <button
                    onClick={() => deleteWallet(wallet.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete wallet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer History Log */}
      {transfers.length > 0 && (
        <div className="rounded-2xl bg-[#0c1322] border border-[#18253b] p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-4 h-4 text-[#0df2c9]" />
            Recent Inter-Wallet Transfers
          </h3>

          <div className="divide-y divide-[#141f33] overflow-x-auto">
            {transfers.slice(0, 10).map((t) => {
              const fromW = wallets.find((w) => w.id === t.fromWalletId);
              const toW = wallets.find((w) => w.id === t.toWalletId);

              return (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs min-w-[500px]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {fromW?.name || 'Wallet'} <span className="text-slate-400 font-normal">→</span> {toW?.name || 'Wallet'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.date} {t.notes ? `• ${t.notes}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold font-mono text-white">
                      {formatCurrency(t.amount)}
                    </div>
                    {t.fee && (
                      <div className="text-[10px] text-slate-400">
                        Fee: {formatCurrency(t.fee)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b121e] border border-[#162540] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#0df2c9]" />
              Add Account / Wallet
            </h2>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Nickname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M-PESA Safaricom, Equity Checking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WalletType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="M-PESA">M-PESA</option>
                    <option value="Bank Account">Bank Account</option>
                    <option value="SACCO FOSA">SACCO FOSA</option>
                    <option value="Cash / Physical">Cash Float</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Crypto Wallet">Crypto Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Balance ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Institution / Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Safaricom, KCB, Stima Sacco, NCBA"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 0712345678 or 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#162540]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0df2c9] text-black font-semibold text-xs hover:bg-[#0df2c9]/90 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b121e] border border-[#162540] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#0df2c9]" />
              Transfer Funds Between Accounts
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Internal transfers move money between your wallets without inflating income or expenses.
            </p>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">From Account (Source)</label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.id === toWalletId}>
                      {w.name} (Balance: {formatCurrency(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">To Account (Destination)</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>
                      {w.name} (Balance: {formatCurrency(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="5000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transfer Fee (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 23"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-400">Recorded as expense</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. M-PESA Paybill to Bank transfer"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#162540]">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0df2c9] text-black font-semibold text-xs hover:bg-[#0df2c9]/90 transition-colors"
                >
                  Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {isReconcileModalOpen && reconcilingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b121e] border border-[#162540] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              Reconcile {reconcilingWallet.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter the true balance shown in your M-PESA statement or banking app right now.
            </p>

            <form onSubmit={handleSaveReconcile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Actual Statement Balance ({currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={reconcileAmount}
                  onChange={(e) => setReconcileAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b13] border border-[#162540] text-base text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#162540]">
                <button
                  type="button"
                  onClick={() => setIsReconcileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0df2c9] text-black font-semibold text-xs hover:bg-[#0df2c9]/90 transition-colors"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
