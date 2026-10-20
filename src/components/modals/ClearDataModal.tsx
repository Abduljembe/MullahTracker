import React, { useState } from 'react';
import {
  X,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const ClearDataModal: React.FC = () => {
  const {
    isClearDataModalOpen,
    setIsClearDataModalOpen,
    clearAllData,
    loadDemoData,
    incomes,
    expenses,
    budgets,
    savingsGoals,
    investments,
    debts,
    emergencyFund,
    chamas,
    formatCurrency,
    hasAnyData,
  } = useFinance();

  const [isClearing, setIsClearing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isClearDataModalOpen) return null;

  const activeBudgetsCount = budgets.filter((b) => b.monthlyLimit > 0).length;

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      setIsClearDataModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsSeeding(true);
    try {
      loadDemoData();
      setIsClearDataModalOpen(false);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c1322] border border-[#223554] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#182842] bg-[#090f1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reset & Clear Data</h3>
              <p className="text-xs text-slate-400">Manage your workspace records and storage</p>
            </div>
          </div>
          <button
            onClick={() => setIsClearDataModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-rose-200 block">
                Clear all active records & start blank?
              </span>
              <p className="text-rose-300/80 leading-relaxed">
                This will wipe your recorded incomes, expenses, budgets, savings goals, investments, debts, and emergency fund from both local storage and connected cloud sync.
              </p>
            </div>
          </div>

          {/* Current Workspace Stats */}
          <div className="bg-[#101a2e] border border-[#1a2d4b] rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Records currently stored:</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${hasAnyData ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                {hasAnyData ? 'Data Present' : 'Already Blank'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Incomes:</span>
                <span className="font-mono text-white font-semibold">{incomes.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Expenses:</span>
                <span className="font-mono text-white font-semibold">{expenses.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Budgets:</span>
                <span className="font-mono text-white font-semibold">{activeBudgetsCount} active</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Savings Goals:</span>
                <span className="font-mono text-white font-semibold">{savingsGoals.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Investments:</span>
                <span className="font-mono text-white font-semibold">{investments.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Debts:</span>
                <span className="font-mono text-white font-semibold">{debts.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Emergency Fund:</span>
                <span className="font-mono text-white font-semibold">{formatCurrency(emergencyFund.currentAmount)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0a1220] border border-[#15233c] flex justify-between items-center">
                <span className="text-slate-400">Chama Circles:</span>
                <span className="font-mono text-white font-semibold">{chamas.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Data alternative note */}
          <div className="p-3.5 rounded-xl bg-[#0e1c2e] border border-teal-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Want realistic figures to test and explore graphs? You can also click <strong className="text-teal-300">"Load Demo Data"</strong> to repopulate complete sample data at any time.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#182842] bg-[#090f1c] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleLoadDemo}
            disabled={isClearing || isSeeding}
            className="w-full sm:w-auto order-3 sm:order-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111f33] hover:bg-[#182b47] border border-[#1f375b] text-teal-300 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin text-teal-400" /> : <RotateCcw className="w-4 h-4 text-teal-400" />}
            <span>Load Demo Data</span>
          </button>

          <div className="w-full sm:w-auto order-1 sm:order-2 flex items-center gap-2">
            <button
              onClick={() => setIsClearDataModalOpen(false)}
              disabled={isClearing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1a2335] border border-[#222f46] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleClearConfirm}
              disabled={isClearing || isSeeding}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
