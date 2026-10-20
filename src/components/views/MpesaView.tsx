import React, { useState } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext.tsx';
import { ExpenseItem, IncomeItem, ParsedMpesaMessage } from '../../types/finance.ts';

const SAMPLE_MPESA_MESSAGES = [
  {
    title: 'Naivas Supermarket (Groceries)',
    sms: 'TK74H9Q87Z Confirmed. Ksh3,450.00 paid to NAIVAS KILIMANI. on 18/10/26 at 3:45 PM. New M-PESA balance is Ksh18,250.00. Transaction cost, Ksh0.00.',
  },
  {
    title: 'KPLC Prepaid Tokens (Electricity)',
    sms: 'TK73N2M41P Confirmed. Ksh1,500.00 sent to KPLC PREPAID for account 14289871109 on 17/10/26 at 8:12 PM. New M-PESA balance is Ksh21,700.00. Transaction cost, Ksh23.00.',
  },
  {
    title: 'Total Energies (Fuel / Transport)',
    sms: 'TK69B4X92R Confirmed. Ksh4,000.00 paid to TOTAL ENERGIES WESTLANDS. on 16/10/26 at 7:30 AM. New M-PESA balance is Ksh23,223.00. Transaction cost, Ksh0.00.',
  },
  {
    title: 'House Rent (Housing)',
    sms: 'TK58Z1K29D Confirmed. Ksh35,000.00 sent to COOPERATIVE BANK for account 01109823478900 on 05/10/26 at 11:20 AM. New M-PESA balance is Ksh27,223.00. Transaction cost, Ksh108.00.',
  },
  {
    title: 'Consulting Client Payment (Income)',
    sms: 'TK44Q7P19M Confirmed. You have received Ksh45,000.00 from ACME TECH SOLUTIONS LIMITED on 15/10/26 at 2:15 PM. New M-PESA balance is Ksh62,223.00.',
  },
];

export const MpesaView: React.FC = () => {
  const { addExpense, addIncome, formatCurrency } = useFinance();
  const [inputText, setInputText] = useState('');
  const [parsedMessages, setParsedMessages] = useState<ParsedMpesaMessage[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseSingleMpesaText = (text: string): ParsedMpesaMessage | null => {
    const cleaned = text.trim();
    if (!cleaned) return null;

    // Pattern 1: Paid to Till / Buy Goods or Paybill
    const paidMatch = cleaned.match(
      /([A-Z0-9]{8,12})\s+Confirmed\.\s+Ksh([0-9,.]+)\s+(?:paid to|sent to)\s+([^.]+)\.?\s+(?:for account [^.]+)?\s*on\s+([0-9/]+)\s+at\s+([0-9:APMapm\s]+)/i
    );

    if (paidMatch) {
      const refCode = paidMatch[1];
      const amount = parseFloat(paidMatch[2].replace(/,/g, ''));
      const counterparty = paidMatch[3].trim();
      const rawDate = paidMatch[4].trim();
      const time = paidMatch[5].trim();

      let date = new Date().toISOString().split('T')[0];
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        date = `${year}-${month}-${day}`;
      }

      let suggestedCategory: ExpenseItem['category'] = 'Other';
      const cUpper = counterparty.toUpperCase();
      if (cUpper.includes('NAIVAS') || cUpper.includes('CARREFOUR') || cUpper.includes('QUICK MART') || cUpper.includes('FOOD') || cUpper.includes('SUPERMARKET') || cUpper.includes('CHANDARANA') || cUpper.includes('BUTCHERY')) {
        suggestedCategory = 'Food & Groceries';
      } else if (cUpper.includes('KPLC') || cUpper.includes('ZUKU') || cUpper.includes('SAFARICOM HOME') || cUpper.includes('WATER') || cUpper.includes('TOKEN')) {
        suggestedCategory = 'Utilities & Bills';
      } else if (cUpper.includes('TOTAL') || cUpper.includes('SHELL') || cUpper.includes('RUBIS') || cUpper.includes('UBER') || cUpper.includes('BOLT') || cUpper.includes('MATATU')) {
        suggestedCategory = 'Transport & Fuel';
      } else if (cUpper.includes('HOSPITAL') || cUpper.includes('PHARMACY') || cUpper.includes('CHEMIST') || cUpper.includes('CLINIC') || cUpper.includes('LAB')) {
        suggestedCategory = 'Healthcare';
      } else if (cUpper.includes('RENT') || cUpper.includes('ESTATE') || cUpper.includes('HOUSING') || cUpper.includes('LANDLORD')) {
        suggestedCategory = 'Rent & Housing';
      } else if (cUpper.includes('SCHOOL') || cUpper.includes('ACADEMY') || cUpper.includes('UNIVERSITY') || cUpper.includes('COLLEGE')) {
        suggestedCategory = 'Education';
      } else if (cUpper.includes('JAVA') || cUpper.includes('ARTCAFFE') || cUpper.includes('KFC') || cUpper.includes('RESTAURANT') || cUpper.includes('LOUNGE') || cUpper.includes('BAR')) {
        suggestedCategory = 'Entertainment & Dining';
      }

      const balanceMatch = cleaned.match(/New M-PESA balance is Ksh([0-9,.]+)/i);
      const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined;

      return {
        refCode,
        amount,
        type: 'paid',
        counterparty,
        date,
        time,
        suggestedCategory,
        balance,
      };
    }

    // Pattern 2: Received money
    const receivedMatch = cleaned.match(
      /([A-Z0-9]{8,12})\s+Confirmed\.\s+You have received\s+Ksh([0-9,.]+)\s+from\s+([^0-9.]+)(?:\s+[0-9+]+)?\s*on\s+([0-9/]+)\s+at\s+([0-9:APMapm\s]+)/i
    );

    if (receivedMatch) {
      const refCode = receivedMatch[1];
      const amount = parseFloat(receivedMatch[2].replace(/,/g, ''));
      const counterparty = receivedMatch[3].trim();
      const rawDate = receivedMatch[4].trim();
      const time = receivedMatch[5].trim();

      let date = new Date().toISOString().split('T')[0];
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        date = `${year}-${month}-${day}`;
      }

      const balanceMatch = cleaned.match(/New M-PESA balance is Ksh([0-9,.]+)/i);
      const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined;

      return {
        refCode,
        amount,
        type: 'received',
        counterparty,
        date,
        time,
        suggestedCategory: 'Other',
        balance,
      };
    }

    // Pattern 3: Cash withdrawal
    const withdrawMatch = cleaned.match(
      /([A-Z0-9]{8,12})\s+Confirmed\.\s+(?:on\s+([0-9/]+)\s+at\s+([0-9:APMapm\s]+)\s+)?Withdraw\s+Ksh([0-9,.]+)\s+from\s+([^.]+)/i
    );

    if (withdrawMatch) {
      const refCode = withdrawMatch[1];
      const rawDate = withdrawMatch[2] || '';
      const time = withdrawMatch[3] || '';
      const amount = parseFloat(withdrawMatch[4].replace(/,/g, ''));
      const counterparty = `Agent: ${withdrawMatch[5].trim()}`;

      let date = new Date().toISOString().split('T')[0];
      if (rawDate) {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          const month = parts[1].padStart(2, '0');
          const day = parts[0].padStart(2, '0');
          date = `${year}-${month}-${day}`;
        }
      }

      return {
        refCode,
        amount,
        type: 'withdraw',
        counterparty,
        date,
        time,
        suggestedCategory: 'Other',
      };
    }

    return null;
  };

  const handleParseInput = () => {
    if (!inputText.trim()) return;

    const blocks = inputText
      .split(/\n\s*\n|(?=[A-Z0-9]{8,12}\s+Confirmed)/)
      .map((b) => b.trim())
      .filter(Boolean);

    const results: ParsedMpesaMessage[] = [];
    for (const b of blocks) {
      const parsed = parseSingleMpesaText(b);
      if (parsed) {
        results.push(parsed);
      }
    }

    if (results.length > 0) {
      setParsedMessages((prev) => [...results, ...prev]);
      setInputText('');
      setImportSuccess(`Successfully parsed ${results.length} M-Pesa transaction(s)!`);
      setParseError(null);
      setTimeout(() => setImportSuccess(null), 4000);
    } else {
      setParseError('Could not detect a valid Safaricom M-Pesa confirmation SMS. Try clicking one of the sample messages below to test!');
      setTimeout(() => setParseError(null), 6000);
    }
  };

  const handleUseSample = (sms: string) => {
    setInputText(sms);
    const parsed = parseSingleMpesaText(sms);
    if (parsed) {
      setParsedMessages((prev) => [parsed, ...prev.filter((p) => p.refCode !== parsed.refCode)]);
      setImportSuccess(`Loaded & parsed sample: ${parsed.refCode}`);
      setTimeout(() => setImportSuccess(null), 3000);
    }
  };

  const handleUpdateCategory = (refCode: string, newCategory: ExpenseItem['category']) => {
    setParsedMessages((prev) =>
      prev.map((m) => (m.refCode === refCode ? { ...m, suggestedCategory: newCategory } : m))
    );
  };

  const handleRemoveItem = (refCode: string) => {
    setParsedMessages((prev) => prev.filter((m) => m.refCode !== refCode));
  };

  const handleImportAll = () => {
    if (parsedMessages.length === 0) return;

    let expenseCount = 0;
    let incomeCount = 0;

    parsedMessages.forEach((item) => {
      if (item.type === 'received') {
        addIncome({
          source: item.counterparty || 'M-Pesa Received',
          amount: item.amount,
          category: 'Side Hustle',
          frequency: 'one-time',
          date: item.date,
          paymentMethod: 'M-Pesa',
          notes: `Imported from M-Pesa SMS ref: ${item.refCode}`,
        });
        incomeCount++;
      } else {
        addExpense({
          title: item.counterparty || 'M-Pesa Payment',
          amount: item.amount,
          category: item.suggestedCategory,
          date: item.date,
          paymentMethod: 'M-Pesa',
          isRecurring: false,
          notes: `Imported via M-Pesa ref: ${item.refCode} at ${item.time}`,
          mpesaRef: item.refCode,
        });
        expenseCount++;
      }
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setImportSuccess(`Imported ${expenseCount} expense(s) and ${incomeCount} income stream(s) into MullahTracker!`);
    setParsedMessages([]);
    setTimeout(() => setImportSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <Smartphone className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">M-Pesa SMS Statement Parser</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Paste your Safaricom M-Pesa confirmation SMS text to instantly parse vendor, amount, reference code, and category.
          </p>
        </div>

        {parsedMessages.length > 0 && (
          <button
            onClick={handleImportAll}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0df2c9] hover:bg-[#00d2b4] text-[#071317] font-bold text-xs transition-colors shadow-lg shadow-teal-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Import All ({parsedMessages.length}) into Tracker</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {importSuccess && (
        <div className="bg-teal-500/15 border border-teal-500/30 rounded-xl p-3.5 text-xs text-teal-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0df2c9] shrink-0" />
          <span>{importSuccess}</span>
        </div>
      )}

      {/* Error Notification */}
      {parseError && (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0df2c9]" />
            <span>Paste M-Pesa SMS Messages (Single or Batch)</span>
          </label>
          <span className="text-[11px] text-slate-500">Supports Till, Paybill, Send Money & Received SMS</span>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. TK74H9Q87Z Confirmed. Ksh2,450.00 paid to NAIVAS KILIMANI. on 18/10/26 at 3:45 PM. New M-PESA balance is Ksh18,250.00."
          className="w-full bg-[#0a101d] border border-[#1b2b44] rounded-xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 font-mono"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Quick Test:</span>
            {SAMPLE_MPESA_MESSAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleUseSample(sample.sms)}
                className="px-2.5 py-1 rounded-lg bg-[#14233c] hover:bg-[#1c3052] border border-[#213554] text-[11px] text-slate-300 transition-colors"
              >
                {sample.title}
              </button>
            ))}
          </div>

          <button
            onClick={handleParseInput}
            disabled={!inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Parse SMS</span>
          </button>
        </div>
      </div>

      {/* Parsed Results Table */}
      {parsedMessages.length > 0 ? (
        <div className="bg-[#0e1626] border border-[#19273f] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#141e30] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Parsed Transactions Ready for Import
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-[#0df2c9] text-[10px] font-mono border border-teal-500/20">
                {parsedMessages.length} Detected
              </span>
            </div>
            <button
              onClick={() => setParsedMessages([])}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear List
            </button>
          </div>

          <div className="divide-y divide-[#141e30] max-h-96 overflow-y-auto">
            {parsedMessages.map((item) => {
              const isIncome = item.type === 'received';
              return (
                <div key={item.refCode} className="p-4 hover:bg-[#121c2e] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{item.counterparty}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.refCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                        {item.balance !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">M-Pesa Bal: {formatCurrency(item.balance)}</span>
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
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </div>

                      {!isIncome && (
                        <div className="mt-1">
                          <select
                            value={item.suggestedCategory}
                            onChange={(e) =>
                              handleUpdateCategory(item.refCode, e.target.value as ExpenseItem['category'])
                            }
                            className="bg-[#0b121f] border border-[#1e2e47] rounded-lg px-2 py-0.5 text-[10px] text-teal-400 focus:outline-none"
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
                      onClick={() => handleRemoveItem(item.refCode)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/50"
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
        <div className="bg-[#0e1626]/60 border border-[#19273f] rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No M-Pesa Transactions Parsed Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Copy and paste your Safaricom M-Pesa SMS messages into the box above, or click any sample button to preview instant extraction.
          </p>
        </div>
      )}
    </div>
  );
};
