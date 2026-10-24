import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Plus,
  Wallet,
  Receipt,
  Layers,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { CurrencyCode } from '../../types/finance.ts';
import {
  CURRENCY_NAMES,
  CURRENCY_SYMBOLS,
  convertCurrency,
  getExchangeRate,
} from '../../utils/currency.ts';

const CURRENCIES: CurrencyCode[] = ['USD', 'KES', 'EUR', 'GBP', 'TZS', 'UGX'];

export const CurrencyConverterModal: React.FC = () => {
  const {
    currency: activeCurrency,
    setCurrency,
    exchangeRates,
    refreshExchangeRates,
    addIncome,
    addExpense,
    isCurrencyConverterOpen,
    setIsCurrencyConverterOpen,
  } = useFinance();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(
    activeCurrency === 'USD' ? 'USD' : 'USD'
  );
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(
    activeCurrency === 'USD' ? 'KES' : 'USD'
  );
  const [amountStr, setAmountStr] = useState<string>('100');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isCurrencyConverterOpen) return null;

  const numAmount = parseFloat(amountStr) || 0;
  const currentRate = getExchangeRate(fromCurrency, toCurrency, exchangeRates);
  const inverseRate = currentRate > 0 ? 1 / currentRate : 0;
  const convertedResult = convertCurrency(numAmount, fromCurrency, toCurrency, exchangeRates);

  const formatNum = (val: number, cur: CurrencyCode) => {
    const isCents = cur === 'USD' || cur === 'EUR' || cur === 'GBP';
    return val.toLocaleString('en-US', {
      minimumFractionDigits: isCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshExchangeRates();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleApplyToPortfolio = () => {
    if (toCurrency !== activeCurrency) {
      setCurrency(toCurrency, true);
      setActionSuccess(`Portfolio converted to ${toCurrency} at live exchange rate!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleAddAsIncome = () => {
    if (numAmount <= 0) return;
    // If fromCurrency is different from activeCurrency, convert it to activeCurrency
    const finalAmount =
      fromCurrency === activeCurrency
        ? numAmount
        : convertCurrency(numAmount, fromCurrency, activeCurrency, exchangeRates);

    addIncome({
      source: `Foreign Income (${numAmount} ${fromCurrency})`,
      amount: Math.round(finalAmount * 100) / 100,
      category: 'Freelance',
      frequency: 'one-time',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: fromCurrency === 'KES' ? 'M-Pesa' : 'Bank Transfer',
      notes: `Converted from ${numAmount} ${fromCurrency} at 1 ${fromCurrency} = ${getExchangeRate(fromCurrency, activeCurrency, exchangeRates).toFixed(2)} ${activeCurrency}`,
    });

    setActionSuccess(
      `Added ${CURRENCY_SYMBOLS[activeCurrency]} ${formatNum(finalAmount, activeCurrency)} as income!`
    );
    setTimeout(() => {
      setActionSuccess(null);
      setIsCurrencyConverterOpen(false);
    }, 1500);
  };

  const handleAddAsExpense = () => {
    if (numAmount <= 0) return;
    const finalAmount =
      fromCurrency === activeCurrency
        ? numAmount
        : convertCurrency(numAmount, fromCurrency, activeCurrency, exchangeRates);

    addExpense({
      title: `Foreign Payment (${numAmount} ${fromCurrency})`,
      amount: Math.round(finalAmount * 100) / 100,
      category: 'Shopping',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: fromCurrency === 'KES' ? 'M-Pesa' : 'Card',
      isRecurring: false,
      notes: `Converted from ${numAmount} ${fromCurrency} at 1 ${fromCurrency} = ${getExchangeRate(fromCurrency, activeCurrency, exchangeRates).toFixed(2)} ${activeCurrency}`,
    });

    setActionSuccess(
      `Added ${CURRENCY_SYMBOLS[activeCurrency]} ${formatNum(finalAmount, activeCurrency)} as expense!`
    );
    setTimeout(() => {
      setActionSuccess(null);
      setIsCurrencyConverterOpen(false);
    }, 1500);
  };

  const usdPresets = [10, 50, 100, 250, 500, 1000];
  const kesPresets = [1000, 5000, 10000, 25000, 50000, 100000];
  const presets = fromCurrency === 'KES' ? kesPresets : usdPresets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b121e] border border-teal-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#152238] bg-[#080d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Live Currency Converter
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  Real-time FX
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official mid-market exchange rates (USD, KES, EUR, GBP, TZS, UGX)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCurrencyConverterOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {actionSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Currency Selectors & Amount Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative items-end">
            {/* From */}
            <div className="bg-[#111a2d] border border-[#1d2d48] rounded-2xl p-3.5 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                From Currency
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-[#080d16] border border-[#213554] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c} - {CURRENCY_NAMES[c]}
                  </option>
                ))}
              </select>

              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Amount to Convert
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                    {CURRENCY_SYMBOLS[fromCurrency]}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#080d16] border border-[#213554] rounded-xl pl-8 pr-3 py-2 text-lg font-mono font-bold text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* Swap Button (Desktop Center, Mobile between) */}
            <div className="sm:hidden flex justify-center py-1">
              <button
                onClick={handleSwap}
                className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 transition-colors"
                title="Swap currencies"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="bg-[#111a2d] border border-[#1d2d48] rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  To Currency
                </label>
                <button
                  onClick={handleSwap}
                  className="hidden sm:flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                  title="Swap currencies"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>

              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-[#080d16] border border-[#213554] rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c} - {CURRENCY_NAMES[c]}
                  </option>
                ))}
              </select>

              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Converted Result
                </label>
                <div className="w-full bg-[#080d16] border border-teal-500/40 rounded-xl px-3 py-2 text-lg font-mono font-bold text-[#0df2c9] truncate">
                  {CURRENCY_SYMBOLS[toCurrency]} {formatNum(convertedResult, toCurrency)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Amount Presets */}
          <div>
            <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
              <span>Quick Presets ({fromCurrency}):</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {presets.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmountStr(val.toString())}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                    amountStr === val.toString()
                      ? 'bg-teal-500/25 border-teal-500/50 text-[#0df2c9]'
                      : 'bg-[#111a2d] border-[#1f304e] text-slate-300 hover:bg-[#182742]'
                  }`}
                >
                  {CURRENCY_SYMBOLS[fromCurrency]} {val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Big Visual Result Card */}
          <div className="bg-gradient-to-br from-[#0c1c2e] via-[#0f253d] to-[#0c1828] border border-teal-500/40 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-teal-500/20">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Live Conversion Rate
              </span>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-white transition-colors"
                title="Fetch latest rates from exchange rate network"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Rates</span>
              </button>
            </div>

            <div className="py-3 text-center space-y-1">
              <div className="text-xs text-slate-400">
                {CURRENCY_SYMBOLS[fromCurrency]} {formatNum(numAmount, fromCurrency)}{' '}
                {fromCurrency} =
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#0df2c9] tracking-tight">
                {CURRENCY_SYMBOLS[toCurrency]} {formatNum(convertedResult, toCurrency)}{' '}
                <span className="text-lg font-sans text-teal-300 font-semibold">{toCurrency}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-teal-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
              <div>
                1 {fromCurrency} ={' '}
                <strong className="text-white font-mono">
                  {currentRate < 0.01
                    ? currentRate.toFixed(4)
                    : currentRate < 10
                    ? currentRate.toFixed(3)
                    : currentRate.toFixed(2)}{' '}
                  {toCurrency}
                </strong>
              </div>
              <div>
                1 {toCurrency} ={' '}
                <strong className="text-white font-mono">
                  {inverseRate < 0.01
                    ? inverseRate.toFixed(4)
                    : inverseRate < 10
                    ? inverseRate.toFixed(3)
                    : inverseRate.toFixed(2)}{' '}
                  {fromCurrency}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Conversion Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleAddAsIncome}
                disabled={numAmount <= 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Record as Income</span>
              </button>

              <button
                onClick={handleAddAsExpense}
                disabled={numAmount <= 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Record as Expense</span>
              </button>

              <button
                onClick={handleApplyToPortfolio}
                disabled={toCurrency === activeCurrency}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
                title={`Convert all recorded figures to ${toCurrency}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Portfolio to {toCurrency}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#152238] bg-[#080d16] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Portfolio Currency:</span>
            <span className="font-mono text-teal-400 font-bold px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-800/40">
              {CURRENCY_SYMBOLS[activeCurrency]} {activeCurrency}
            </span>
          </div>
          <button
            onClick={() => setIsCurrencyConverterOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
