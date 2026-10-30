import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Smartphone,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Trash2,
  Upload,
  Copy,
  Plus,
  RefreshCw,
  Tag,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Receipt,
  Calendar,
  Zap,
  Check,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
  FileUp,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FileCheck2,
  FileType,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';
import { ExpenseItem, IncomeItem, ParsedMpesaMessage, MpesaSpendingBreakdown, MpesaAuditAdvice } from '../../types/finance.ts';
import { convertCurrency, getExchangeRate } from '../../utils/currency.ts';
import { StatementImporterModal } from '../modals/StatementImporterModal.tsx';
import {
  parseMpesaSms,
  parseMpesaStatement,
  calculateMpesaSpending,
  generateLocalMpesaAdvice,
} from '../../utils/mpesaParser.ts';
import {
  extractTextFromPdf,
  extractTextFromDocument,
  PdfPasswordRequiredError,
} from '../../utils/pdfExtractor.ts';

const SAMPLE_FULL_STATEMENT = `DETAILED SAFARICOM M-PESA STATEMENT EXTRACT
TK74H9Q87Z Confirmed. Ksh4,500.00 paid to NAIVAS SUPERMARKET KILIMANI. on 24/10/26 at 3:45 PM. New M-PESA balance is Ksh38,250.00. Transaction cost, Ksh0.00.
TK73N2M41P Confirmed. Ksh2,000.00 sent to KPLC PREPAID for account 14289871109 on 23/10/26 at 8:12 PM. New M-PESA balance is Ksh36,227.00. Transaction cost, Ksh23.00.
TK69B4X92R Confirmed. Ksh5,000.00 paid to TOTAL ENERGIES WESTLANDS. on 22/10/26 at 7:30 AM. New M-PESA balance is Ksh31,227.00. Transaction cost, Ksh0.00.
TK58Z1K29D Confirmed. Ksh35,000.00 sent to COOPERATIVE BANK for account 01109823478900 on 20/10/26 at 11:20 AM. New M-PESA balance is Ksh56,119.00. Transaction cost, Ksh108.00.
TK44Q7P19M Confirmed. You have received Ksh85,000.00 from ACME TECH SOLUTIONS CLIENT CONSULTING on 18/10/26 at 2:15 PM. New M-PESA balance is Ksh91,227.00.
TK39A1C88K Confirmed. Ksh4,500.00 paid to ZUKU FIBER INTERNET for account 882910 on 17/10/26 at 7:40 PM. New M-PESA balance is Ksh86,727.00. Transaction cost, Ksh0.00.
TK28X9P11L Confirmed. on 16/10/26 at 11:30 AM Withdraw Ksh6,000.00 from 289102 - AGENT KANGEMI STAGE. New M-PESA balance is Ksh80,612.00. Transaction cost, Ksh115.00.
TK21W8M44J Confirmed. Ksh7,200.00 paid to THE ALCHEMIST LOUNGE BAR. on 15/10/26 at 11:45 PM. New M-PESA balance is Ksh73,412.00. Transaction cost, Ksh0.00.
TK19L3B22C Confirmed. Ksh3,800.00 paid to JAVA HOUSE CAFE. on 14/10/26 at 1:15 PM. New M-PESA balance is Ksh69,612.00. Transaction cost, Ksh0.00.
TK12M7B33V Confirmed. Ksh6,500.00 sent to MUM UPCOUNTRY SUPPORT for account 254722891002 on 12/10/26 at 9:00 AM. New M-PESA balance is Ksh63,055.00. Transaction cost, Ksh57.00.
TK09K4A11R Confirmed. Ksh1,500.00 sent to KPLC PREPAID for account 14289871109 on 10/10/26 at 6:30 PM. New M-PESA balance is Ksh61,532.00. Transaction cost, Ksh23.00.
TK04Z8X55Q Confirmed. on 08/10/26 at 2:10 PM Withdraw Ksh4,000.00 from 192837 - AGENT WESTGATE MALL. New M-PESA balance is Ksh57,463.00. Transaction cost, Ksh69.00.`;

const SAMPLE_INDIVIDUAL_SMS = [
  {
    title: 'Naivas (Groceries)',
    sms: 'TK74H9Q87Z Confirmed. Ksh3,450.00 paid to NAIVAS KILIMANI. on 18/10/26 at 3:45 PM. New M-PESA balance is Ksh18,250.00. Transaction cost, Ksh0.00.',
  },
  {
    title: 'KPLC Electricity Tokens',
    sms: 'TK73N2M41P Confirmed. Ksh1,500.00 sent to KPLC PREPAID for account 14289871109 on 17/10/26 at 8:12 PM. New M-PESA balance is Ksh21,700.00. Transaction cost, Ksh23.00.',
  },
  {
    title: 'Total Energies (Fuel)',
    sms: 'TK69B4X92R Confirmed. Ksh4,000.00 paid to TOTAL ENERGIES WESTLANDS. on 16/10/26 at 7:30 AM. New M-PESA balance is Ksh23,223.00. Transaction cost, Ksh0.00.',
  },
  {
    title: 'Agent Withdrawal (Cash & Tariff Fee)',
    sms: 'TK28X9P11L Confirmed. on 16/10/26 at 11:30 AM Withdraw Ksh6,000.00 from 289102 - AGENT KANGEMI STAGE. New M-PESA balance is Ksh17,108.00. Transaction cost, Ksh115.00.',
  },
  {
    title: 'Alchemist Lounge (Dining/Nightlife)',
    sms: 'TK21W8M44J Confirmed. Ksh7,200.00 paid to THE ALCHEMIST LOUNGE BAR. on 15/10/26 at 11:45 PM. New M-PESA balance is Ksh9,908.00. Transaction cost, Ksh0.00.',
  },
  {
    title: 'Consulting Client Inflow',
    sms: 'TK44Q7P19M Confirmed. You have received Ksh65,000.00 from ACME TECH SOLUTIONS CLIENT CONSULTING on 15/10/26 at 2:15 PM. New M-PESA balance is Ksh74,908.00.',
  },
];

export const MpesaView: React.FC = () => {
  const { addExpense, addIncome, formatCurrency, currency, exchangeRates, setCategoryBudget } = useFinance();

  // Mode: 'upload' (PDF/Document) | 'statement' (Full Statement Extract) | 'sms' (Individual SMS Parser)
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'statement' | 'sms'>('upload');
  const [inputText, setInputText] = useState('');
  const [parsedMessages, setParsedMessages] = useState<ParsedMpesaMessage[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  // Document Upload & Password Handling State
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const [uploadedDocMeta, setUploadedDocMeta] = useState<{
    name: string;
    size: number;
    pageCount?: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showRawExtractedText, setShowRawExtractedText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Audit & Advice State
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<MpesaAuditAdvice | null>(null);
  const [auditSuccessNotice, setAuditSuccessNotice] = useState<string | null>(null);
  const [completedChecklist, setCompletedChecklist] = useState<Record<number, boolean>>({});

  // Search & Filter within Parsed Transactions
  const [tableFilter, setTableFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'WITHDRAWAL'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Calculate spending breakdown whenever parsed messages change
  const spendingBreakdown: MpesaSpendingBreakdown | null = useMemo(() => {
    if (parsedMessages.length === 0) return null;
    return calculateMpesaSpending(parsedMessages);
  }, [parsedMessages]);

  // 2. Automatically generate local forensic advice or trigger AI audit
  useEffect(() => {
    if (spendingBreakdown && spendingBreakdown.totalOutflow > 0) {
      // Set instant local advice immediately
      const initialAdvice = generateLocalMpesaAdvice(spendingBreakdown);
      setAiAdvice(initialAdvice);
    } else {
      setAiAdvice(null);
    }
  }, [spendingBreakdown]);

  // Trigger Deep AI Audit via /api/mpesa/audit
  const handleTriggerAiAudit = async () => {
    if (!spendingBreakdown) return;
    setIsAuditing(true);
    setAuditSuccessNotice(null);

    try {
      const res = await fetch('/api/mpesa/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakdown: spendingBreakdown,
          transactions: parsedMessages,
          accountCurrency: currency,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: MpesaAuditAdvice = await res.json();
      setAiAdvice(data);
      setAuditSuccessNotice('Gemini AI completed forensic statement audit & reduction gameplan!');
      setTimeout(() => setAuditSuccessNotice(null), 5000);
    } catch {
      // Local fallback is already active
      const local = generateLocalMpesaAdvice(spendingBreakdown);
      setAiAdvice(local);
      setAuditSuccessNotice('Statement analyzed using offline financial forensic engine.');
      setTimeout(() => setAuditSuccessNotice(null), 4000);
    } finally {
      setIsAuditing(false);
    }
  };

  // Process uploaded PDF, CSV, or document file
  const handleProcessFile = async (file: File, userPassword?: string) => {
    setIsExtractingDoc(true);
    setParseError(null);
    setPasswordError(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    try {
      let extractedText = '';
      let pageCount: number | undefined;

      if (isPdf) {
        const result = await extractTextFromPdf(file, userPassword);
        extractedText = result.text;
        pageCount = result.pageCount;
      } else {
        extractedText = await extractTextFromDocument(file);
      }

      // Extraction succeeded - clear pending encrypted PDF state
      setPendingPdfFile(null);
      setPdfPassword('');
      setPasswordError(null);

      setUploadedDocMeta({
        name: file.name,
        size: file.size,
        pageCount,
      });
      setInputText(extractedText);

      // Parse statement lines into transactions
      const results = parseMpesaStatement(extractedText);

      if (results.length > 0) {
        setParsedMessages((prev) => {
          const existingCodes = new Set(prev.map((m) => m.refCode));
          const newItems = results.filter((m) => !existingCodes.has(m.refCode));
          return [...newItems, ...prev];
        });
        setImportSuccess(
          `Extracted & parsed ${results.length} transaction(s) from "${file.name}"${pageCount ? ` (${pageCount} page${pageCount > 1 ? 's' : ''})` : ''}!`
        );
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.6 },
        });
        setTimeout(() => setImportSuccess(null), 5000);
      } else {
        setParseError(
          `Document loaded (${extractedText.length} characters), but no standard M-Pesa transaction lines could be recognized automatically. Review the extracted text in "View Raw Text" or paste individual entries.`
        );
      }
    } catch (err: any) {
      if (err instanceof PdfPasswordRequiredError || err?.name === 'PdfPasswordRequiredError') {
        // Keep pending PDF file and prompt user for their Kenyan National ID / passport
        setPendingPdfFile(file);
        setPasswordError(err.message);
      } else {
        setParseError(err?.message || 'Failed to read document file.');
      }
    } finally {
      setIsExtractingDoc(false);
      setIsUnlocking(false);
    }
  };

  // Unlock password-protected Safaricom PDF statement
  const handleUnlockPdf = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingPdfFile) return;
    if (!pdfPassword.trim()) {
      setPasswordError('Please enter your statement password (Kenyan National ID or Passport).');
      return;
    }
    setIsUnlocking(true);
    await handleProcessFile(pendingPdfFile, pdfPassword.trim());
  };

  // Clear loaded document
  const handleClearDocument = () => {
    setUploadedDocMeta(null);
    setPendingPdfFile(null);
    setPdfPassword('');
    setPasswordError(null);
    setInputText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Parse action from textarea
  const handleParseInput = () => {
    if (!inputText.trim()) return;

    const results = parseMpesaStatement(inputText);

    if (results.length > 0) {
      setParsedMessages((prev) => {
        const existingCodes = new Set(prev.map((m) => m.refCode));
        const newItems = results.filter((m) => !existingCodes.has(m.refCode));
        return [...newItems, ...prev];
      });
      setInputText('');
      setImportSuccess(`Successfully parsed ${results.length} M-Pesa statement transaction(s)!`);
      setParseError(null);
      setTimeout(() => setImportSuccess(null), 4000);
    } else {
      setParseError('Could not detect valid M-Pesa confirmation SMS or statement lines. Try clicking one of the sample buttons to test!');
      setTimeout(() => setParseError(null), 6000);
    }
  };

  // Load Full Sample Statement
  const handleLoadFullSample = () => {
    setInputText(SAMPLE_FULL_STATEMENT);
    const results = parseMpesaStatement(SAMPLE_FULL_STATEMENT);
    setParsedMessages(results);
    setImportSuccess(`Loaded official 1-month M-Pesa statement extract (${results.length} transactions)!`);
    setTimeout(() => setImportSuccess(null), 4000);
  };

  // Use single SMS sample
  const handleUseSingleSample = (sms: string) => {
    setInputText(sms);
    const parsed = parseMpesaSms(sms);
    if (parsed) {
      setParsedMessages((prev) => [parsed, ...prev.filter((p) => p.refCode !== parsed.refCode)]);
      setImportSuccess(`Loaded & parsed SMS: ${parsed.refCode}`);
      setTimeout(() => setImportSuccess(null), 3000);
    }
  };

  // 1-Click Apply Recommended Budget Caps to user's finance context
  const handleApplyRecommendedBudgetCaps = () => {
    if (!aiAdvice || !aiAdvice.recommendedBudgetCaps || aiAdvice.recommendedBudgetCaps.length === 0) return;

    let appliedCount = 0;
    aiAdvice.recommendedBudgetCaps.forEach((capItem) => {
      // Convert KES cap to user's currency if needed
      const finalCap =
        currency === 'KES'
          ? capItem.recommendedCap
          : Math.round(convertCurrency(capItem.recommendedCap, 'KES', currency, exchangeRates) * 100) / 100;

      setCategoryBudget(capItem.category, finalCap);
      appliedCount++;
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    setAuditSuccessNotice(`Successfully applied ${appliedCount} AI-recommended budget spending ceilings to your active budget!`);
    setTimeout(() => setAuditSuccessNotice(null), 6000);
  };

  // Import all parsed transactions to FinanceContext
  const handleImportAll = () => {
    if (parsedMessages.length === 0) return;

    let expenseCount = 0;
    let incomeCount = 0;

    parsedMessages.forEach((item) => {
      const finalAmount =
        currency === 'KES'
          ? item.amount
          : Math.round(convertCurrency(item.amount, 'KES', currency, exchangeRates) * 100) / 100;

      const fxNote =
        currency !== 'KES'
          ? ` (Originally KSh ${item.amount.toLocaleString()} converted to ${currency} @ 1 KES = ${getExchangeRate('KES', currency, exchangeRates).toFixed(4)} ${currency})`
          : '';

      if (item.type === 'received') {
        addIncome({
          source: item.counterparty || 'M-Pesa Received',
          amount: finalAmount,
          category: 'Side Hustle',
          frequency: 'one-time',
          date: item.date,
          paymentMethod: 'M-Pesa',
          notes: `Imported from M-Pesa ref: ${item.refCode}${fxNote}`,
        });
        incomeCount++;
      } else {
        addExpense({
          title: item.counterparty || 'M-Pesa Payment',
          amount: finalAmount,
          category: item.suggestedCategory,
          date: item.date,
          paymentMethod: 'M-Pesa',
          isRecurring: false,
          notes: `Imported via M-Pesa ref: ${item.refCode} at ${item.time}${item.fee ? ` (Fee: KSh ${item.fee})` : ''}${fxNote}`,
          mpesaRef: item.refCode,
        });
        expenseCount++;
      }
    });

    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
    });

    setImportSuccess(`Imported ${expenseCount} expense(s) and ${incomeCount} income stream(s) into your personal tracker!`);
    setTimeout(() => setImportSuccess(null), 5000);
  };

  // Copy structured audit report
  const handleCopyReport = () => {
    if (!spendingBreakdown || !aiAdvice) return;

    const report = `======================================================
NJIAFEDHA M-PESA STATEMENT SPENDING & REDUCTION AUDIT
======================================================
Audit Verdict: ${aiAdvice.verdictBadge}
Monthly Potential Savings Target: KSh ${aiAdvice.monthlyPotentialSavings.toLocaleString()}

FINANCIAL FLOW SUMMARY:
- Total Outflow (Spent): KSh ${spendingBreakdown.totalOutflow.toLocaleString()}
- Total Inflow (Received): KSh ${spendingBreakdown.totalInflow.toLocaleString()}
- Net Cash Flow: KSh ${spendingBreakdown.netCashflow.toLocaleString()}
- Real Savings Rate: ${spendingBreakdown.savingsRatePercent}%
- Safaricom Tariff & Fee Loss: KSh ${spendingBreakdown.totalFees.toLocaleString()}
- Daily Burn Rate: KSh ${spendingBreakdown.dailyBurnRate.toLocaleString()}/day

WHAT TO REDUCE:
${aiAdvice.whatToReduce.map((r, i) => `${i + 1}. ${r.title} (Target Saving: KSh ${r.targetSaving.toLocaleString()}):\n   ${r.reason}`).join('\n\n')}

WHAT TO OPTIMIZE:
${aiAdvice.whatToOptimize.map((o, i) => `${i + 1}. ${o.title}:\n   Action: ${o.action}\n   Tip: ${o.potentialSavingTip}`).join('\n\n')}

WHAT TO DO (STRATEGIC ROADMAP):
${aiAdvice.whatToDo.map((s) => `Step ${s.stepNumber}: ${s.title}\n   ${s.description}`).join('\n\n')}

EMERGENCY RUNWAY:
- Recommended 3-Month Buffer: KSh ${aiAdvice.emergencyFundRecommendation.recommended3Month.toLocaleString()}
- Recommended 6-Month Buffer: KSh ${aiAdvice.emergencyFundRecommendation.recommended6Month.toLocaleString()}
${aiAdvice.emergencyFundRecommendation.rationale}
======================================================`;

    navigator.clipboard.writeText(report);
    setAuditSuccessNotice('Copied complete forensic audit report to clipboard!');
    setTimeout(() => setAuditSuccessNotice(null), 4000);
  };

  // Filtered transactions for table
  const filteredTransactions = useMemo(() => {
    return parsedMessages.filter((t) => {
      if (tableFilter === 'EXPENSE' && t.type === 'received') return false;
      if (tableFilter === 'INCOME' && t.type !== 'received') return false;
      if (tableFilter === 'WITHDRAWAL' && t.type !== 'withdraw') return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          t.counterparty.toLowerCase().includes(q) ||
          t.refCode.toLowerCase().includes(q) ||
          t.suggestedCategory.toLowerCase().includes(q) ||
          (t.channel && t.channel.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [parsedMessages, tableFilter, searchFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-br from-[#0c1626] via-[#09111e] to-[#060b13] p-6 rounded-3xl border border-teal-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shadow-lg shadow-teal-500/10">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>M-Pesa Statement & SMS Spending Audit</span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[11px] font-mono border border-teal-500/40 font-bold">
                  AI Forensic Advisor
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Upload or paste your Safaricom M-Pesa statement or SMS messages. We calculate exactly how you used your money, identify hidden tariff fees, and provide AI forensic guidance on what to cut, what to optimize, and what to do next.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {/* Hidden File Input for PDF / Doc statement upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.txt,text/plain,text/csv,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => {
              setActiveInputMode('upload');
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02]"
            title="Upload official Safaricom M-Pesa PDF statement or CSV spreadsheet"
          >
            <FileUp className="w-4 h-4 text-[#0df2c9]" />
            <span>Upload Statement (PDF / Doc)</span>
          </button>

          <button
            onClick={handleLoadFullSample}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#13233c] hover:bg-[#1a3052] border border-[#233a5f] text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Load a 1-month realistic statement with rent, fuel, groceries, utility bills & nightlife"
          >
            <Receipt className="w-4 h-4 text-teal-400" />
            <span>Load 1-Month Sample</span>
          </button>

          <button
            onClick={() => setIsImporterOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#070b13] font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Batch Importer</span>
          </button>

          {parsedMessages.length > 0 && (
            <button
              onClick={handleImportAll}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0df2c9] hover:bg-[#00d2b4] text-[#071317] font-bold text-xs transition-colors shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import to Budget ({parsedMessages.length})</span>
            </button>
          )}
        </div>
      </div>

      <StatementImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
      />

      {/* Notifications */}
      {importSuccess && (
        <div className="bg-teal-500/15 border border-teal-500/30 rounded-2xl p-4 text-xs text-teal-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#0df2c9] shrink-0" />
          <span className="font-medium">{importSuccess}</span>
        </div>
      )}

      {auditSuccessNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-300 flex items-center justify-between gap-2.5 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{auditSuccessNotice}</span>
          </div>
          <button
            onClick={() => setAuditSuccessNotice(null)}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {parseError && (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{parseError}</span>
        </div>
      )}

      {/* Input Console with 3 Modes: Upload PDF/Doc, Statement Paste, SMS Paste */}
      <div className="bg-[#0e1626] border border-[#19273f] rounded-3xl p-5 space-y-4 shadow-lg">
        {/* Mode Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142036] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveInputMode('upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInputMode === 'upload'
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload PDF / Document Statement</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500/30 text-[10px] text-teal-200">
                Auto-Unlock
              </span>
            </button>
            <button
              onClick={() => setActiveInputMode('statement')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInputMode === 'statement'
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Statement Text</span>
            </button>
            <button
              onClick={() => setActiveInputMode('sms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInputMode === 'sms'
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Individual SMS Messages</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Safaricom M-Pesa • Encrypted PDF, CSV, TXT & SMS confirmation
          </span>
        </div>

        {/* 1. UPLOAD PDF / DOCUMENT MODE */}
        {activeInputMode === 'upload' && (
          <div className="space-y-4">
            {/* Password Unlock Card if Encrypted PDF */}
            {pendingPdfFile ? (
              <div className="bg-[#121c2e] border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Safaricom Statement is Password-Protected</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase">
                        Encrypted PDF
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Safaricom protects all emailed monthly and yearly M-Pesa PDF statements with your{' '}
                      <strong className="text-amber-300 font-semibold">Kenyan National ID Number</strong> or{' '}
                      <strong className="text-amber-300 font-semibold">Passport Number</strong> (e.g. 28934125). Enter it below to decrypt and analyze your spending.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUnlockPdf} className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={pdfPassword}
                        onChange={(e) => {
                          setPdfPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        placeholder="Enter your National ID / Passport Number (e.g. 28934125)"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090e18] border border-[#23354f] focus:border-amber-400 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={isUnlocking || !pdfPassword.trim()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isUnlocking ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Unlocking Statement...</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            <span>Unlock & Calculate Spending</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleClearDocument}
                        className="px-3.5 py-2.5 rounded-xl bg-[#142236] hover:bg-[#1a2d48] text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>
                      100% Client-Side Privacy: Decryption happens entirely in your local browser memory. Your ID is never transmitted or saved.
                    </span>
                  </div>
                </form>
              </div>
            ) : uploadedDocMeta ? (
              /* Loaded Document Meta Badge */
              <div className="bg-[#101b2d] border border-teal-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-mono truncate max-w-xs sm:max-w-md">
                        {uploadedDocMeta.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-[#0df2c9] text-[10px] font-bold font-mono">
                        {(uploadedDocMeta.size / 1024).toFixed(1)} KB
                      </span>
                      {uploadedDocMeta.pageCount && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                          {uploadedDocMeta.pageCount} Page{uploadedDocMeta.pageCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-teal-300/80 flex items-center gap-1.5 mt-0.5">
                      <Check className="w-3 h-3 text-[#0df2c9]" />
                      <span>Parsed {parsedMessages.length} transaction entries from statement</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowRawExtractedText(!showRawExtractedText)}
                    className="px-3 py-1.5 rounded-lg bg-[#14233c] hover:bg-[#1c3254] border border-[#233857] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {showRawExtractedText ? 'Hide Raw Text' : 'View Raw Extracted Text'}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#14233c] hover:bg-[#1c3254] border border-[#233857] text-teal-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={handleClearDocument}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${
                  isDragging
                    ? 'border-[#0df2c9] bg-teal-500/10 scale-[1.01]'
                    : 'border-[#1b2b44] hover:border-teal-500/50 bg-[#0a101d] hover:bg-[#0c1424]'
                }`}
              >
                {isExtractingDoc ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-10 h-10 text-[#0df2c9] animate-spin" />
                    <p className="text-sm font-bold text-white">Reading & Decrypting M-Pesa Statement Document...</p>
                    <p className="text-xs text-slate-400">Extracting transaction tables, receipt numbers, and balances</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9] mx-auto group-hover:scale-110 group-hover:bg-teal-500/20 transition-all shadow-lg shadow-teal-500/10">
                      <FileUp className="w-7 h-7" />
                    </div>

                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#0df2c9] transition-colors">
                        Drop your official Safaricom M-Pesa Statement or Document here
                      </h3>
                      <p className="text-xs text-slate-400">
                        Drag and drop your file, or <span className="text-[#0df2c9] font-semibold underline underline-offset-2">browse files</span> from your phone or computer
                      </p>
                    </div>

                    {/* Format Pill Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#132034] text-slate-300 text-[11px] font-mono border border-[#1d304e]">
                        <FileText className="w-3 h-3 text-rose-400" />
                        <span>Official PDF (Password Unlock)</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#132034] text-slate-300 text-[11px] font-mono border border-[#1d304e]">
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        <span>CSV Statement Export</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#132034] text-slate-300 text-[11px] font-mono border border-[#1d304e]">
                        <Smartphone className="w-3 h-3 text-teal-400" />
                        <span>TXT SMS Dump</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Encrypted client-side: Files remain 100% private in your browser.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View Raw Extracted Text Drawer */}
            {showRawExtractedText && inputText && (
              <div className="bg-[#090f1b] border border-[#1b2b44] rounded-2xl p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span>Raw Extracted Statement Text ({inputText.length} characters)</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inputText);
                      setImportSuccess('Extracted text copied to clipboard!');
                      setTimeout(() => setImportSuccess(null), 3000);
                    }}
                    className="text-xs text-[#0df2c9] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  className="w-full bg-[#060a13] border border-[#152339] rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-teal-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={handleParseInput}
                    className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-all cursor-pointer"
                  >
                    Re-Parse Text
                  </button>
                </div>
              </div>
            )}

            {/* Quick Sample Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-400">
              <span className="text-[11px]">Don't have your Safaricom PDF statement ready right now?</span>
              <button
                onClick={handleLoadFullSample}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13233c] hover:bg-[#1a3052] border border-[#233a5f] text-teal-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Test with 1-Month Statement Sample (12 Items)</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. STATEMENT TEXT PASTING MODE */}
        {activeInputMode === 'statement' && (
          <div className="space-y-4">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste full M-Pesa statement extract text (e.g. from email PDF, mySafaricom App, or multiple SMS messages)..."
              className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 font-mono"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Quick Test:</span>
                <button
                  onClick={handleLoadFullSample}
                  className="px-3 py-1 rounded-lg bg-[#14233c] hover:bg-[#1c3052] border border-[#213554] text-[11px] text-teal-300 font-medium transition-colors cursor-pointer"
                >
                  1-Month Full Statement (12 Items)
                </button>
              </div>

              <div className="flex items-center gap-2">
                {inputText.trim() && (
                  <button
                    onClick={() => setInputText('')}
                    className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleParseInput}
                  disabled={!inputText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Parse & Calculate Spending</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. INDIVIDUAL SMS MESSAGES MODE */}
        {activeInputMode === 'sms' && (
          <div className="space-y-4">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste Safaricom confirmation SMS e.g. TK74H9Q87Z Confirmed. Ksh4,500.00 paid to NAIVAS KILIMANI. on 18/10/26 at 3:45 PM. New M-PESA balance is Ksh18,250.00. Transaction cost, Ksh0.00."
              className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-2xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 font-mono"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Quick Test:</span>
                {SAMPLE_INDIVIDUAL_SMS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUseSingleSample(sample.sms)}
                    className="px-2.5 py-1 rounded-lg bg-[#14233c] hover:bg-[#1c3052] border border-[#213554] text-[11px] text-slate-300 transition-colors cursor-pointer"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {inputText.trim() && (
                  <button
                    onClick={() => setInputText('')}
                    className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleParseInput}
                  disabled={!inputText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Parse SMS</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FORENSIC SPENDING CALCULATOR RESULTS ("HOW YOU USED YOUR MONEY") */}
      {spendingBreakdown && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142036] pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0df2c9]" />
                <span>Forensic Cash Flow Calculation: How You Used Your Money</span>
              </h3>
              <p className="text-xs text-slate-400">
                Calculated across {parsedMessages.length} transactions covering {spendingBreakdown.daysSpan} active day(s).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerAiAudit}
                disabled={isAuditing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Auditing with Gemini...' : 'Re-Run AI Forensic Audit'}</span>
              </button>
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13233c] hover:bg-[#1a3052] border border-[#233a5f] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Copy structured audit report to clipboard"
              >
                <Copy className="w-3.5 h-3.5 text-teal-400" />
                <span>Copy Report</span>
              </button>
            </div>
          </div>

          {/* 5 Core Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Outflow (Spent) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c2e] to-[#0a111c] border border-rose-500/30 space-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Total Outflow (Spent)</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-lg font-extrabold font-mono text-white">
                KSh {spendingBreakdown.totalOutflow.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                {parsedMessages.filter((t) => t.type !== 'received').length} debit transactions
              </div>
            </div>

            {/* Inflow (Received) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c2e] to-[#0a111c] border border-emerald-500/30 space-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Total Inflow (Received)</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-extrabold font-mono text-emerald-300">
                KSh {spendingBreakdown.totalInflow.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                {parsedMessages.filter((t) => t.type === 'received').length} credit transactions
              </div>
            </div>

            {/* Net Flow & Savings Rate */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c2e] to-[#0a111c] border border-cyan-500/30 space-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Net Flow & Retention</span>
                <Scale className="w-4 h-4 text-cyan-400" />
              </div>
              <div
                className={`text-lg font-extrabold font-mono ${
                  spendingBreakdown.netCashflow >= 0 ? 'text-cyan-300' : 'text-rose-400'
                }`}
              >
                {spendingBreakdown.netCashflow >= 0 ? '+' : ''}KSh {spendingBreakdown.netCashflow.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                {spendingBreakdown.savingsRatePercent}% statement savings rate
              </div>
            </div>

            {/* Safaricom Tariff Fees */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c2e] to-[#0a111c] border border-amber-500/30 space-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Safaricom Tariff Fees</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-extrabold font-mono text-amber-300">
                KSh {spendingBreakdown.totalFees.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                Withdrawals & Paybill tariffs paid
              </div>
            </div>

            {/* Daily Burn Rate */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c2e] to-[#0a111c] border border-purple-500/30 space-y-1 shadow-md col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Daily Burn Rate</span>
                <TrendingDown className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-extrabold font-mono text-purple-300">
                KSh {spendingBreakdown.dailyBurnRate.toLocaleString()}
                <span className="text-xs font-normal text-slate-400">/day</span>
              </div>
              <div className="text-[10px] text-slate-400">
                ≈ KSh {(spendingBreakdown.dailyBurnRate * 30).toLocaleString()}/month projected
              </div>
            </div>
          </div>

          {/* Forensic Visual Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Category Breakdown (2 Cols) */}
            <div className="lg:col-span-2 bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[#142036] pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#0df2c9]" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Category Spending Breakdown
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {spendingBreakdown.categoryBreakdown.length} Categories Active
                </span>
              </div>

              <div className="space-y-3.5">
                {spendingBreakdown.categoryBreakdown.map((catItem) => (
                  <div key={catItem.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{catItem.category}</span>
                        {catItem.isHighBurn && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            High Burn ({catItem.percentage}%)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({catItem.count} {catItem.count === 1 ? 'tx' : 'txs'})
                        </span>
                      </div>
                      <div className="font-mono font-bold text-slate-200">
                        KSh {catItem.amount.toLocaleString()}{' '}
                        <span className="text-slate-400 font-normal">({catItem.percentage}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#142035] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          catItem.isHighBurn
                            ? 'bg-rose-500'
                            : catItem.category === 'Rent & Housing'
                            ? 'bg-blue-500'
                            : catItem.category === 'Food & Groceries'
                            ? 'bg-emerald-500'
                            : catItem.category === 'Utilities & Bills'
                            ? 'bg-cyan-500'
                            : catItem.category === 'Transport & Fuel'
                            ? 'bg-amber-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(3, catItem.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 50/30/20 Benchmark Strip */}
              <div className="pt-3 border-t border-[#142036] grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#09111e] border border-[#15233a]">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Needs (Target 50%)</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {spendingBreakdown.needsWantsSavings.needsPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    KSh {spendingBreakdown.needsWantsSavings.needsAmount.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#09111e] border border-[#15233a]">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Wants (Target 30%)</div>
                  <div
                    className={`text-sm font-bold font-mono mt-0.5 ${
                      spendingBreakdown.needsWantsSavings.wantsPercent > 30 ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    {spendingBreakdown.needsWantsSavings.wantsPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    KSh {spendingBreakdown.needsWantsSavings.wantsAmount.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#09111e] border border-[#15233a]">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Retained (Target 20%)</div>
                  <div
                    className={`text-sm font-bold font-mono mt-0.5 ${
                      spendingBreakdown.needsWantsSavings.savingsPercent >= 20 ? 'text-[#0df2c9]' : 'text-rose-400'
                    }`}
                  >
                    {spendingBreakdown.needsWantsSavings.savingsPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    KSh {spendingBreakdown.needsWantsSavings.savingsAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Channels & Top Beneficiaries (1 Col) */}
            <div className="space-y-4">
              {/* Payment Channels */}
              <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#142036] pb-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    <span>Transaction Channels</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Outflows</span>
                </div>

                <div className="space-y-2.5">
                  {spendingBreakdown.channelBreakdown.map((ch) => (
                    <div key={ch.channel} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-400" />
                        <span className="text-slate-300">{ch.channel}</span>
                      </div>
                      <div className="font-mono text-slate-200">
                        KSh {ch.amount.toLocaleString()}{' '}
                        <span className="text-slate-500 font-normal">({ch.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 Sinks / Merchants */}
              <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#142036] pb-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Top 5 Spending Sinks</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Highest Recipients</span>
                </div>

                <div className="space-y-2">
                  {spendingBreakdown.topMerchants.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-200 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{m.count} payments</div>
                      </div>
                      <div className="font-mono font-bold text-rose-300 shrink-0">
                        KSh {m.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI FORENSIC FINANCIAL ADVISOR ("WHAT TO REDUCE OR WHAT TO DO") */}
          {aiAdvice && (
            <div className="bg-gradient-to-br from-[#0c182c] via-[#091322] to-[#070e1a] border border-teal-500/40 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172642] pb-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-teal-500/20 text-[#0df2c9] text-xs font-bold border border-teal-500/40 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{aiAdvice.verdictBadge}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 font-mono">
                      Potential Monthly Savings: +KSh {aiAdvice.monthlyPotentialSavings.toLocaleString()}/mo
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    AI Statement Spending Audit & Actionable Reduction Gameplan
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyRecommendedBudgetCaps}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#070b13] font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                    title="Automatically apply these recommended category spending ceilings to your active budget"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Apply Recommended Budget Caps</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: WHAT TO REDUCE (CUTS) */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider">
                    1. What to Reduce & Cut (Priority Spending Leaks)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {aiAdvice.whatToReduce.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#091220] border border-rose-500/30 space-y-2 hover:border-rose-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-bold text-white">{item.title}</h5>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                          Cut KSh {item.targetSaving.toLocaleString()}/mo
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: WHAT TO OPTIMIZE (OPERATIONAL SWAPS & FEE ELIMINATION) */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-amber-400">
                  <Zap className="w-4 h-4" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider">
                    2. What to Optimize (Kenyan Financial Lifehacks & Tariff Elimination)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {aiAdvice.whatToOptimize.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#091220] border border-amber-500/30 space-y-2 hover:border-amber-500/50 transition-colors"
                    >
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{item.title}</span>
                      </h5>
                      <div className="text-xs text-slate-300 font-medium">{item.action}</div>
                      <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        💡 {item.potentialSavingTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: WHAT TO DO (STRATEGIC FINANCIAL ROADMAP) */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-[#0df2c9]">
                  <PiggyBank className="w-4 h-4" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider">
                    3. Strategic Financial Roadmap: What to Do Next
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {aiAdvice.whatToDo.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-2xl bg-[#091220] border border-teal-500/30 space-y-2 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-[#0df2c9] text-xs font-extrabold flex items-center justify-center font-mono border border-teal-500/40">
                          {step.stepNumber}
                        </span>
                        <h5 className="text-xs font-bold text-white">{step.title}</h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: RECOMMENDED BUDGET CAPS TABLE & EMERGENCY CUSHION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-[#172642] relative z-10">
                {/* Recommended Caps Table (2 cols) */}
                <div className="lg:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-400" />
                      <span>Recommended Monthly Category Caps</span>
                    </span>
                    <button
                      onClick={handleApplyRecommendedBudgetCaps}
                      className="text-xs text-[#0df2c9] hover:underline font-semibold cursor-pointer"
                    >
                      Apply All to My Budget →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiAdvice.recommendedBudgetCaps.map((cap) => {
                      const isReduction = cap.recommendedCap < cap.currentSpent;
                      return (
                        <div
                          key={cap.category}
                          className="p-3 rounded-xl bg-[#091220] border border-[#182740] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{cap.category}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Current: KSh {cap.currentSpent.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-mono font-bold ${
                                isReduction ? 'text-teal-300' : 'text-slate-300'
                              }`}
                            >
                              KSh {cap.recommendedCap.toLocaleString()}/mo
                            </div>
                            {isReduction && (
                              <div className="text-[10px] text-emerald-400 font-mono">
                                -KSh {(cap.currentSpent - cap.recommendedCap).toLocaleString()} cut
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Emergency Fund Cushion (1 col) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1a2e] to-[#07101c] border border-cyan-500/30 space-y-3">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Emergency Runway Cushion</span>
                  </span>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">3-Month Basic Buffer:</span>
                      <span className="font-mono font-bold text-cyan-300">
                        KSh {aiAdvice.emergencyFundRecommendation.recommended3Month.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">6-Month Safe Buffer:</span>
                      <span className="font-mono font-bold text-emerald-300">
                        KSh {aiAdvice.emergencyFundRecommendation.recommended6Month.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed border-t border-[#182740] pt-2">
                    {aiAdvice.emergencyFundRecommendation.rationale}
                  </p>
                </div>
              </div>

              {/* ACTION CHECKLIST */}
              {aiAdvice.actionChecklist && aiAdvice.actionChecklist.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#091220] border border-[#1a2b47] space-y-2.5 relative z-10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Action Checklist: Take Control of Your Money This Month</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiAdvice.actionChecklist.map((task, idx) => {
                      const isDone = completedChecklist[idx];
                      return (
                        <label
                          key={idx}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#0d1a2d] transition-colors cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={!!isDone}
                            onChange={() =>
                              setCompletedChecklist((prev) => ({
                                ...prev,
                                [idx]: !prev[idx],
                              }))
                            }
                            className="mt-0.5 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500"
                          />
                          <span
                            className={
                              isDone ? 'line-through text-slate-500' : 'text-slate-200'
                            }
                          >
                            {task}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PARSED TRANSACTIONS TABLE */}
      {parsedMessages.length > 0 ? (
        <div className="bg-[#0e1626] border border-[#19273f] rounded-3xl overflow-hidden shadow-lg">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-[#141e30] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Statement Transactions
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-[#0df2c9] text-[10px] font-mono border border-teal-500/20">
                {parsedMessages.length} Total
              </span>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#09111e] p-1 rounded-xl border border-[#17253d] ml-0 sm:ml-2">
                <button
                  onClick={() => setTableFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    tableFilter === 'ALL' ? 'bg-teal-500/20 text-[#0df2c9]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({parsedMessages.length})
                </button>
                <button
                  onClick={() => setTableFilter('EXPENSE')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    tableFilter === 'EXPENSE' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Outflows ({parsedMessages.filter((t) => t.type !== 'received').length})
                </button>
                <button
                  onClick={() => setTableFilter('INCOME')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    tableFilter === 'INCOME' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Inflows ({parsedMessages.filter((t) => t.type === 'received').length})
                </button>
                <button
                  onClick={() => setTableFilter('WITHDRAWAL')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    tableFilter === 'WITHDRAWAL' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Withdrawals ({parsedMessages.filter((t) => t.type === 'withdraw').length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search merchant, ref code..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-[#09111e] border border-[#1b2b44] rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 font-mono w-48"
              />

              <button
                onClick={() => setParsedMessages([])}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-[#141e30] max-h-96 overflow-y-auto">
            {filteredTransactions.map((item) => {
              const isIncome = item.type === 'received';
              return (
                <div
                  key={item.refCode}
                  className="p-4 hover:bg-[#121c2e] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isIncome
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{item.counterparty}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.refCode}
                        </span>
                        {item.channel && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            {item.channel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                        {item.fee !== undefined && item.fee > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400/90 font-mono">
                              Tariff Fee: KSh {item.fee.toLocaleString()}
                            </span>
                          </>
                        )}
                        {item.balance !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">
                              M-Pesa Bal: KSh {item.balance.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-mono ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}KSh {item.amount.toLocaleString()}
                      </div>

                      {currency !== 'KES' && (
                        <div className="text-[11px] font-mono text-[#0df2c9] font-medium">
                          ≈ {isIncome ? '+' : '-'}{formatCurrency(convertCurrency(item.amount, 'KES', currency, exchangeRates))}
                        </div>
                      )}

                      {!isIncome && (
                        <div className="mt-1">
                          <select
                            value={item.suggestedCategory}
                            onChange={(e) => {
                              const newCat = e.target.value as ExpenseItem['category'];
                              setParsedMessages((prev) =>
                                prev.map((m) =>
                                  m.refCode === item.refCode ? { ...m, suggestedCategory: newCat } : m
                                )
                              );
                            }}
                            className="bg-[#0b121f] border border-[#1e2e47] rounded-lg px-2 py-0.5 text-[10px] text-teal-400 focus:outline-none cursor-pointer"
                          >
                            <option value="Food & Groceries">Food & Groceries</option>
                            <option value="Utilities & Bills">Utilities & Bills</option>
                            <option value="Transport & Fuel">Transport & Fuel</option>
                            <option value="Rent & Housing">Rent & Housing</option>
                            <option value="Entertainment & Dining">Entertainment & Dining</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Family & Support">Family & Support</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setParsedMessages((prev) => prev.filter((m) => m.refCode !== item.refCode))
                      }
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                      title="Discard item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#0e1626]/60 border border-[#19273f] rounded-3xl p-10 text-center space-y-4 shadow-md">
          <div className="w-14 h-14 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#0df2c9] mx-auto shadow-lg shadow-teal-500/10">
            <Smartphone className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Statement or SMS Transactions Parsed Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Paste your Safaricom M-Pesa SMS messages, paste a full statement extract, or click the button below to load an instant realistic statement and see the full forensic spending analysis!
            </p>
          </div>
          <button
            onClick={handleLoadFullSample}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#070b13] font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load 1-Month Statement Sample</span>
          </button>
        </div>
      )}
    </div>
  );
};
