import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Check,
  RefreshCw,
  FileUp,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';
import { ExpenseItem, IncomeItem } from '../../types/finance.ts';
import {
  extractTextFromPdf,
  extractTextFromDocument,
  PdfPasswordRequiredError,
} from '../../utils/pdfExtractor.ts';

interface ParsedTransaction {
  id: string;
  date: string;
  time?: string;
  description: string;
  counterparty: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  paymentMethod: string;
  referenceCode?: string;
  selected?: boolean;
}

interface StatementImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_MPESA_STATEMENT = `DETAILED STATEMENT EXTRACT - SAFARICOM M-PESA
Receipt No: TK74H9Q87Z | 2026-10-24 15:45 | Customer Transfer of Ksh 3,450.00 to NAIVAS KILIMANI
Receipt No: TK73N2M41P | 2026-10-23 20:12 | Pay Bill to KPLC PREPAID Acc 14289871109 Ksh 1,500.00
Receipt No: TK69B4X92R | 2026-10-22 07:30 | Customer Transfer to TOTAL ENERGIES WESTLANDS Ksh 4,000.00
Receipt No: TK58Z1K29D | 2026-10-20 11:20 | Funds Transfer to COOPERATIVE BANK RENT Ksh 35,000.00
Receipt No: TK44Q7P19M | 2026-10-18 14:15 | Received Ksh 65,000.00 from ACME TECH SOLUTIONS CLIENT CONSULTING
Receipt No: TK39A1C88K | 2026-10-17 19:40 | Pay Bill to ZUKU FIBER INTERNET Ksh 4,500.00
Receipt No: TK28X9P11L | 2026-10-15 13:00 | Received Ksh 12,500.00 from STIMA SACCO DIVIDEND REINVESTMENT
Receipt No: TK12M7B33V | 2026-10-14 18:25 | Customer Transfer to JAVA HOUSE CAFE Ksh 1,850.00`;

const CATEGORIES: ExpenseItem['category'][] = [
  'Food & Groceries',
  'Rent & Housing',
  'Utilities & Bills',
  'Transport & Fuel',
  'Healthcare',
  'Education',
  'Entertainment & Dining',
  'Shopping',
  'Family & Support',
  'Other',
];

export const StatementImporterModal: React.FC<StatementImporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addExpense, addIncome, currency } = useFinance();
  const [statementText, setStatementText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // File Upload & PDF Decryption State
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleParse = async (textToParse?: string) => {
    const raw = textToParse || statementText;
    if (!raw.trim()) {
      setErrorMsg('Please paste or upload statement text first.');
      return;
    }

    setIsParsing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/statement/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementText: raw,
          accountCurrency: currency,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(
          data.transactions.map((t: any) => ({
            ...t,
            selected: true,
          }))
        );
      } else {
        throw new Error('No transactions could be parsed from the text.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse statement. Please check the text and try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleProcessFile = async (file: File, userPassword?: string) => {
    setIsExtractingDoc(true);
    setErrorMsg(null);
    setPasswordError(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    try {
      let extracted = '';
      if (isPdf) {
        const result = await extractTextFromPdf(file, userPassword);
        extracted = result.text;
      } else {
        extracted = await extractTextFromDocument(file);
      }

      setPendingPdfFile(null);
      setPdfPassword('');
      setPasswordError(null);
      setUploadedDocName(file.name);
      setStatementText(extracted);

      // Automatically trigger AI parse
      await handleParse(extracted);
    } catch (err: any) {
      if (err instanceof PdfPasswordRequiredError || err?.name === 'PdfPasswordRequiredError') {
        setPendingPdfFile(file);
        setPasswordError(err.message);
      } else {
        setErrorMsg(err?.message || 'Failed to extract text from document.');
      }
    } finally {
      setIsExtractingDoc(false);
      setIsUnlocking(false);
    }
  };

  const handleUnlockPdf = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingPdfFile || !pdfPassword.trim()) return;
    setIsUnlocking(true);
    await handleProcessFile(pendingPdfFile, pdfPassword.trim());
  };

  const handleToggleSelect = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setTransactions((prev) => prev.map((t) => ({ ...t, selected: select })));
  };

  const handleCategoryChange = (id: string, newCat: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category: newCat } : t))
    );
  };

  const handleBatchImport = () => {
    const selected = transactions.filter((t) => t.selected);
    if (selected.length === 0) return;

    let expCount = 0;
    let incCount = 0;

    selected.forEach((t) => {
      if (t.type === 'INCOME') {
        addIncome({
          source: t.description || t.counterparty || 'Imported Income',
          category: t.category.includes('Salary') ? 'Salary' : t.category.includes('Business') ? 'Business' : 'Freelance',
          amount: t.amount,
          frequency: 'one-time',
          date: t.date || new Date().toISOString().split('T')[0],
          paymentMethod: (t.paymentMethod.includes('M-PESA') ? 'M-Pesa' : 'Bank Transfer') as any,
          notes: t.referenceCode ? `Ref: ${t.referenceCode}` : undefined,
        });
        incCount++;
      } else {
        addExpense({
          title: t.description || t.counterparty || 'Imported Expense',
          category: (CATEGORIES.includes(t.category as any) ? t.category : 'Other') as any,
          amount: t.amount,
          date: t.date || new Date().toISOString().split('T')[0],
          paymentMethod: (t.paymentMethod.includes('M-PESA') ? 'M-Pesa' : 'Bank') as any,
          isRecurring: false,
          notes: t.referenceCode ? `Ref: ${t.referenceCode}` : undefined,
          mpesaRef: t.referenceCode,
        });
        expCount++;
      }
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    setImportNotice(
      `Successfully imported ${selected.length} transactions (${expCount} expenses, ${incCount} income)!`
    );

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const selectedCount = transactions.filter((t) => t.selected).length;
  const totalExpSelected = transactions
    .filter((t) => t.selected && t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncSelected = transactions
    .filter((t) => t.selected && t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090e1a] border border-[#162540] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#141f33] flex items-center justify-between bg-[#060a13]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Statement & M-PESA Auto-Importer
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/30 font-bold">
                  GEMINI OCR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Drop M-PESA SMS statements, bank PDF text or CSVs — categorized automatically into your budget
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#142036] hover:bg-[#1b2b48] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {importNotice && (
          <div className="p-3 bg-emerald-500/20 border-b border-emerald-500/40 text-center text-xs font-mono font-bold text-emerald-300">
            {importNotice}
          </div>
        )}

        <div className="overflow-y-auto p-5 space-y-5">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.txt,application/pdf,text/plain,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleProcessFile(file);
              e.target.value = '';
            }}
            className="hidden"
          />

          {/* Password Prompt if Encrypted Safaricom PDF */}
          {pendingPdfFile && (
            <div className="bg-[#121c2e] border-2 border-amber-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Safaricom PDF Password Required</h4>
                  <p className="text-[11px] text-slate-300">
                    Safaricom statements are encrypted with your Kenyan National ID or Passport Number.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUnlockPdf} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <div className="relative flex-1 w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pdfPassword}
                    onChange={(e) => {
                      setPdfPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="National ID / Passport Number"
                    className="w-full pl-3 pr-9 py-2 rounded-lg bg-[#090e18] border border-[#23354f] focus:border-amber-400 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isUnlocking || !pdfPassword.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Unlocking...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingPdfFile(null);
                    setPdfPassword('');
                    setPasswordError(null);
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#142036] hover:bg-[#1a2d48] text-slate-400 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </form>

              {passwordError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          )}

          {/* Paste / Drop Input Box */}
          {transactions.length === 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Paste Text or Upload File</span>
                  {uploadedDocName && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-mono lowercase">
                      {uploadedDocName}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtractingDoc}
                    className="text-xs text-[#0df2c9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {isExtractingDoc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reading file...</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Upload PDF / CSV / Document</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatementText(SAMPLE_MPESA_STATEMENT);
                      handleParse(SAMPLE_MPESA_STATEMENT);
                    }}
                    className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Load Sample</span>
                  </button>
                </div>
              </div>

              <textarea
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
                placeholder="Paste your M-PESA SMS records, Bank PDF text (Equity, KCB, Standard Chartered, NCBA), or card statement lines here, or click 'Upload PDF / CSV / Document' above..."
                rows={7}
                className="w-full p-3.5 rounded-xl bg-[#070b13] border border-[#162540] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#0df2c9]"
              />

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#142236] hover:bg-[#1c304d] text-slate-200 text-xs font-semibold border border-[#233857] transition-all cursor-pointer"
                >
                  <FileUp className="w-4 h-4 text-teal-400" />
                  <span>Choose PDF / Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleParse()}
                  disabled={isParsing || !statementText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#070b13] font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Parse & Categorize Statement
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Parsed Transactions Preview & Selection Table */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0d1627] border border-[#182744]">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>Selected: <strong className="text-white">{selectedCount}</strong> / {transactions.length}</span>
                  <span>Expenses: <strong className="text-rose-400">{currency} {totalExpSelected.toLocaleString()}</strong></span>
                  <span>Income: <strong className="text-emerald-400">{currency} {totalIncSelected.toLocaleString()}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectAll(true)}
                    className="px-2.5 py-1 rounded text-xs bg-[#121c2e] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="px-2.5 py-1 rounded text-xs bg-[#121c2e] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setTransactions([]);
                      setStatementText('');
                    }}
                    className="px-2.5 py-1 rounded text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-xl border border-[#162540] overflow-hidden bg-[#070b13] max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#0a1120] border-b border-[#141f33] text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141f33]/60 font-mono">
                    {transactions.map((t) => (
                      <tr
                        key={t.id}
                        className={`hover:bg-[#0e1729] transition-colors ${
                          t.selected ? 'bg-[#0b1424]/40' : 'opacity-40'
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={t.selected}
                            onChange={() => handleToggleSelect(t.id)}
                            className="rounded border-[#1e2f4e] text-teal-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">{t.date}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-white truncate max-w-[200px]">{t.description}</div>
                          {t.referenceCode && (
                            <span className="text-[9px] text-slate-500">[{t.referenceCode}]</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={t.category}
                            onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                            className="bg-[#0c1424] border border-[#162540] rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-[#0df2c9]"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right font-bold whitespace-nowrap">
                          <span className={t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}>
                            {t.type === 'INCOME' ? '+' : '-'}{currency} {t.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              t.type === 'INCOME'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#141f33]">
                <span className="text-xs text-slate-400">
                  Ready to add to your personal budget & cashflow records.
                </span>

                <button
                  type="button"
                  onClick={handleBatchImport}
                  disabled={selectedCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#070b13] font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Import {selectedCount} Selected into Finances
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
