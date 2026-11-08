/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Margin & Lot Size Sizer Calculator
 * Calculates accurate lot sizes for Deriv Synthetics, Boom/Crash, Crypto, Gold, and FX.
 * Takes account equity, risk %, stop loss points, and computes margin requirements and risk-to-reward.
 */

import React, { useState } from 'react';
import {
  Calculator,
  X,
  Check,
  Copy,
  DollarSign,
  Percent,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DERIV_INSTRUMENTS, getDerivInstrument } from '../../utils/derivInstruments.ts';

interface MarginLotCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLot?: (lot: number, symbol: string) => void;
  initialSymbol?: string;
  accountBalance?: number;
}

export const MarginLotCalculatorModal: React.FC<MarginLotCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyLot,
  initialSymbol = 'R_75',
  accountBalance = 2450.00,
}) => {
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [balance, setBalance] = useState<number>(accountBalance);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [slPoints, setSlPoints] = useState<number>(2800);
  const [tpPoints, setTpPoints] = useState<number>(6500);
  const [leverage, setLeverage] = useState<number>(500);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const inst = getDerivInstrument(symbol);

  // Calibrate defaults when symbol changes
  const handleSymbolChange = (newSym: string) => {
    setSymbol(newSym);
    const item = getDerivInstrument(newSym);
    if (newSym.includes('R_75')) {
      setSlPoints(2800);
      setTpPoints(6500);
    } else if (newSym.includes('BOOM') || newSym.includes('CRASH')) {
      setSlPoints(40);
      setTpPoints(100);
    } else if (newSym.includes('STP')) {
      setSlPoints(15);
      setTpPoints(35);
    } else if (newSym.includes('BTC')) {
      setSlPoints(1200);
      setTpPoints(2800);
    } else if (newSym.includes('XAU')) {
      setSlPoints(15);
      setTpPoints(35);
    } else {
      setSlPoints(30);
      setTpPoints(60);
    }
  };

  // Dollar amount the user is willing to risk
  const maxDollarRisk = (balance * riskPercent) / 100;

  // Multiplier for point value
  const pointMultiplier = inst ? inst.pointValueMultiplier : 1.0;

  // Raw lot calculation: risk = lots * slPoints * pointMultiplier
  // lots = risk / (slPoints * pointMultiplier)
  const rawLot = slPoints > 0 ? maxDollarRisk / (slPoints * pointMultiplier) : (inst?.minLot || 0.01);

  // Round according to lotStep
  const step = inst?.lotStep || 0.01;
  const minL = inst?.minLot || 0.01;
  const maxL = inst?.maxLot || 100.0;

  let calculatedLot = Math.floor(rawLot / step) * step;
  if (calculatedLot < minL) calculatedLot = minL;
  if (calculatedLot > maxL) calculatedLot = maxL;
  calculatedLot = Number(calculatedLot.toFixed(step < 0.01 ? 3 : 2));

  // Actual dollar risk with rounded lot
  const actualDollarRisk = calculatedLot * slPoints * pointMultiplier;
  const actualDollarGain = calculatedLot * tpPoints * pointMultiplier;
  const riskRewardRatio = slPoints > 0 ? (tpPoints / slPoints).toFixed(1) : '1:2.0';

  // Required margin = (Price * lots * contractSize) / leverage
  const baseP = inst?.basePrice || 100;
  const requiredMargin = Math.round(((baseP * calculatedLot) / leverage) * 100) / 100;

  const handleCopy = () => {
    navigator.clipboard.writeText(calculatedLot.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyLot?.(calculatedLot, symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0a1220] border border-[#17253b] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#070d18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[#0df2c9]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Interactive Margin & Lot Sizer
              </h3>
              <p className="text-[11px] text-slate-400">
                Precision contract sizing for Deriv Synthetics, Crypto & Forex.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Instrument</label>
            <select
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 font-mono text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {DERIV_INSTRUMENTS.map((i) => (
                <option key={i.symbol} value={i.symbol}>
                  {i.symbol} — {i.displayName} (Min: {i.minLot} lot)
                </option>
              ))}
            </select>
          </div>

          {/* Account Balance & Risk % */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Account Equity ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Risk per Trade (%)</label>
              <div className="flex items-center gap-1">
                {[1, 1.5, 2, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskPercent(r)}
                    className={`flex-1 py-2 rounded-lg border font-mono font-bold text-[11px] transition-all cursor-pointer ${
                      riskPercent === r
                        ? 'bg-teal-500/20 border-teal-500/60 text-[#0df2c9]'
                        : 'bg-[#070d18] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stop Loss & Take Profit Points */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Stop Loss (Points)</label>
                <span className="text-[10px] text-rose-400 font-mono">Max Risk: ${maxDollarRisk.toFixed(2)}</span>
              </div>
              <input
                type="number"
                value={slPoints}
                onChange={(e) => setSlPoints(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Take Profit (Points)</label>
                <span className="text-[10px] text-emerald-400 font-mono">R:R 1:{riskRewardRatio}</span>
              </div>
              <input
                type="number"
                value={tpPoints}
                onChange={(e) => setTpPoints(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Sizing Output Display Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c182c] to-[#081120] border border-teal-500/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-400 tracking-wider">RECOMMENDED LOT SIZE</span>
                <div className="text-2xl font-mono font-extrabold text-white flex items-center gap-2">
                  <span>{calculatedLot}</span>
                  <span className="text-xs font-normal text-slate-400 font-sans">lots</span>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[#0df2c9] text-xs font-semibold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div>
                <div className="text-slate-400">Loss at SL</div>
                <div className="font-bold text-rose-400">-${actualDollarRisk.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400">Gain at TP</div>
                <div className="font-bold text-emerald-400">+${actualDollarGain.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400">Est. Margin</div>
                <div className="font-bold text-amber-300">${requiredMargin.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Broker Min Lot Warning if applicable */}
          {inst && calculatedLot === inst.minLot && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Clamped to broker minimum lot size ({inst.minLot}) for {inst.displayName}.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070d18] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <span>Apply Lot ({calculatedLot}) to EA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
