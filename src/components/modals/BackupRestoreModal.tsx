import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Shield,
  FileText,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const BackupRestoreModal: React.FC = () => {
  const {
    isBackupRestoreOpen,
    setIsBackupRestoreOpen,
    exportBackupJSON,
    importBackupJSON,
    incomes,
    expenses,
    savingsGoals,
    investments,
    debts,
    chamas,
    bills,
    wallets,
    currency,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('replace');
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isBackupRestoreOpen) return null;

  const handleCopyJSON = () => {
    const json = exportBackupJSON();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
      validateJSON(text);
    };
    reader.readAsText(file);
  };

  const validateJSON = (text: string) => {
    try {
      setParseError(null);
      if (!text.trim()) {
        setParsedPreview(null);
        return;
      }
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object') {
        throw new Error('JSON is not a valid object.');
      }
      setParsedPreview(data);
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON format');
      setParsedPreview(null);
    }
  };

  const handlePerformRestore = async () => {
    if (!importJsonText.trim()) return;
    setIsRestoring(true);
    const result = await importBackupJSON(importJsonText, importMode);
    setIsRestoring(false);

    if (result.success) {
      setIsBackupRestoreOpen(false);
    } else {
      setParseError(result.message);
    }
  };

  const totalRecords =
    incomes.length +
    expenses.length +
    savingsGoals.length +
    investments.length +
    debts.length +
    chamas.length +
    bills.length +
    wallets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b121e] border border-[#162540] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141f33]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[#0df2c9] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Data Backup & Restore</h2>
              <p className="text-xs text-slate-400">Export or import your complete financial state in portable JSON</p>
            </div>
          </div>

          <button
            onClick={() => setIsBackupRestoreOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#070b13] p-1 border border-[#141f33] mt-4">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import & Restore</span>
          </button>
        </div>

        {activeTab === 'export' ? (
          /* EXPORT TAB */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#080e19] border border-[#142238] space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Backup Manifest</span>
                <span className="text-teal-400 font-mono">{totalRecords} Total Records</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Incomes</div>
                  <div className="font-bold font-mono text-white mt-0.5">{incomes.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Expenses</div>
                  <div className="font-bold font-mono text-white mt-0.5">{expenses.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Bills</div>
                  <div className="font-bold font-mono text-white mt-0.5">{bills.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Wallets</div>
                  <div className="font-bold font-mono text-white mt-0.5">{wallets.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Savings</div>
                  <div className="font-bold font-mono text-white mt-0.5">{savingsGoals.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Investments</div>
                  <div className="font-bold font-mono text-white mt-0.5">{investments.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Debts</div>
                  <div className="font-bold font-mono text-white mt-0.5">{debts.length}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0c1526] border border-[#182844]">
                  <div className="text-slate-400 text-[10px]">Chamas</div>
                  <div className="font-bold font-mono text-white mt-0.5">{chamas.length}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={exportBackupJSON}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0df2c9] text-black font-bold text-xs hover:bg-[#0df2c9]/90 transition-all shadow-[0_0_15px_rgba(13,242,201,0.2)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON Backup File</span>
              </button>

              <button
                onClick={handleCopyJSON}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#111c30] hover:bg-[#162540] text-slate-200 border border-[#1c2e4c] font-semibold text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* IMPORT TAB */
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Upload Backup File (.json)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-[#1a2c49] hover:border-teal-500/50 rounded-xl bg-[#070b13] flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-teal-400 transition-colors mb-2" />
                <span className="text-xs text-slate-200 font-medium">Click to select backup .json file</span>
                <span className="text-[10px] text-slate-500 mt-1">Accepts MullahTracker standard JSON exports</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Or Paste JSON Content Directly
              </label>
              <textarea
                rows={4}
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  validateJSON(e.target.value);
                }}
                placeholder='{"version": "1.0.0", "incomes": [...], "expenses": [...]}'
                className="w-full px-3 py-2 rounded-xl bg-[#070b13] border border-[#162540] text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            {parseError && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{parseError}</span>
              </div>
            )}

            {parsedPreview && (
              <div className="p-3.5 rounded-xl bg-[#080f1a] border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-teal-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    Valid Backup Detected
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Currency: {parsedPreview.currency || 'USD'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 grid grid-cols-3 gap-1 pt-1 border-t border-[#142036]">
                  <div>Incomes: <strong className="text-white">{parsedPreview.incomes?.length || 0}</strong></div>
                  <div>Expenses: <strong className="text-white">{parsedPreview.expenses?.length || 0}</strong></div>
                  <div>Bills: <strong className="text-white">{parsedPreview.bills?.length || 0}</strong></div>
                  <div>Wallets: <strong className="text-white">{parsedPreview.wallets?.length || 0}</strong></div>
                  <div>Goals: <strong className="text-white">{parsedPreview.savingsGoals?.length || 0}</strong></div>
                  <div>Investments: <strong className="text-white">{parsedPreview.investments?.length || 0}</strong></div>
                </div>
              </div>
            )}

            {/* Restore Mode */}
            <div className="p-3 rounded-xl bg-[#080d17] border border-[#141f33] space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Restore Strategy</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  importMode === 'replace'
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                    : 'bg-[#0d1626] border-[#182844] text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="mode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="hidden"
                  />
                  <div>
                    <div className="font-bold text-white text-[11px]">Full Replace (Overwrite)</div>
                    <div className="text-[10px] text-slate-400">Replaces current data with backup</div>
                  </div>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  importMode === 'merge'
                    ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                    : 'bg-[#0d1626] border-[#182844] text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="mode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="hidden"
                  />
                  <div>
                    <div className="font-bold text-white text-[11px]">Merge Records</div>
                    <div className="text-[10px] text-slate-400">Merges new entries with existing</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePerformRestore}
              disabled={!parsedPreview || isRestoring}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                parsedPreview && !isRestoring
                  ? 'bg-[#0df2c9] text-black hover:bg-[#0df2c9]/90 cursor-pointer shadow-[0_0_15px_rgba(13,242,201,0.2)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{isRestoring ? 'Restoring...' : 'Restore Financial Data Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
