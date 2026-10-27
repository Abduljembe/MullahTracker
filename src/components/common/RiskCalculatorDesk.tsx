import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Calculator,
  Percent,
  DollarSign,
  ArrowRight,
  Crosshair,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface RiskCalculatorDeskProps {
  currentTicker: string;
  currentPrice: number;
  market: 'NSE' | 'US' | 'FOREX';
  currency: string;
  defaultSl?: string;
  defaultTp?: string;
  onApplyToOrder?: (lots: number, sl: number, tp: number) => void;
}

export const RiskCalculatorDesk: React.FC<RiskCalculatorDeskProps> = ({
  currentTicker,
  currentPrice,
  market,
  currency,
  defaultSl,
  defaultTp,
  onApplyToOrder,
}) => {
  // Account Equity (syncs with Paper balance or user input)
  const [accountBalance, setAccountBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('njia_paper_balance');
      return saved ? parseFloat(saved) : 10000;
    } catch {
      return 10000;
    }
  });

  const [riskType, setRiskType] = useState<'percent' | 'cash'>('percent');
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [riskCash, setRiskCash] = useState<number>(150);

  // Price points
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice);
  const [stopLoss, setStopLoss] = useState<number>(() => {
    if (defaultSl) {
      const num = parseFloat(defaultSl.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) return num;
    }
    return market === 'FOREX' && currentTicker.includes('XAU')
      ? currentPrice - 20
      : currentPrice * 0.985;
  });

  const [takeProfit, setTakeProfit] = useState<number>(() => {
    if (defaultTp) {
      const num = parseFloat(defaultTp.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) return num;
    }
    return market === 'FOREX' && currentTicker.includes('XAU')
      ? currentPrice + 45
      : currentPrice * 1.035;
  });

  // Keep entry price in sync if user changes asset
  React.useEffect(() => {
    setEntryPrice(currentPrice);
    if (currentTicker.includes('XAU')) {
      setStopLoss(Math.round((currentPrice - 25) * 100) / 100);
      setTakeProfit(Math.round((currentPrice + 55) * 100) / 100);
    } else if (market === 'FOREX') {
      setStopLoss(Math.round(currentPrice * 0.995 * 10000) / 10000);
      setTakeProfit(Math.round(currentPrice * 1.01 * 10000) / 10000);
    } else {
      setStopLoss(Math.round(currentPrice * 0.95 * 100) / 100);
      setTakeProfit(Math.round(currentPrice * 1.10 * 100) / 100);
    }
  }, [currentTicker, currentPrice, market]);

  // Risk Calculations
  const calc = useMemo(() => {
    const isGold = currentTicker.includes('XAU');
    const isForex = market === 'FOREX';

    // Maximum dollar risk allowed
    const maxRiskDollars = riskType === 'percent' ? (accountBalance * riskPercent) / 100 : riskCash;

    // Price distance to Stop Loss
    const slDistance = Math.abs(entryPrice - stopLoss);
    const tpDistance = Math.abs(takeProfit - entryPrice);

    if (slDistance <= 0) {
      return {
        recommendedLots: 0.01,
        totalRiskAmount: maxRiskDollars,
        slDistance: 0,
        tpDistance: 0,
        riskReward: '0:0',
        profitTarget: 0,
        marginRequired: 0,
        contractSizeDesc: isGold ? '100 oz/lot' : isForex ? '100,000 units' : '1 share',
      };
    }

    // Lot multiplier:
    // Gold: 1 lot = 100 oz. $1 move on 1 lot = $100.
    // Standard FX: 1 lot = 100,000 units.
    // Stocks: 1 lot = 1 share.
    const contractMultiplier = isGold ? 100 : isForex ? 100000 : 1;

    // Dollar risk per 1 lot = slDistance * contractMultiplier
    const riskPerLot = slDistance * contractMultiplier;

    let exactLots = riskPerLot > 0 ? maxRiskDollars / riskPerLot : 0.01;

    // Format & clamp lots
    let recommendedLots = exactLots;
    if (isForex) {
      recommendedLots = Math.max(0.01, Math.round(exactLots * 100) / 100);
    } else {
      recommendedLots = Math.max(1, Math.floor(exactLots));
    }

    const actualRiskAmount = recommendedLots * contractMultiplier * slDistance;
    const actualProfitTarget = recommendedLots * contractMultiplier * tpDistance;
    const rrRatio = slDistance > 0 ? (tpDistance / slDistance).toFixed(2) : '1:0';

    // Estimated margin required (assuming 1:100 leverage for FX, 1:1 for stocks)
    const notionalValue = recommendedLots * contractMultiplier * entryPrice;
    const marginRequired = isForex ? notionalValue / 100 : notionalValue;

    return {
      recommendedLots,
      totalRiskAmount: Math.round(actualRiskAmount * 100) / 100,
      slDistance: Math.round(slDistance * 10000) / 10000,
      tpDistance: Math.round(tpDistance * 10000) / 10000,
      riskReward: `1:${rrRatio}`,
      profitTarget: Math.round(actualProfitTarget * 100) / 100,
      marginRequired: Math.round(marginRequired * 100) / 100,
      contractSizeDesc: isGold ? '100 oz / Standard Lot' : isForex ? '100,000 Units / Lot' : 'Shares',
    };
  }, [accountBalance, riskType, riskPercent, riskCash, entryPrice, stopLoss, takeProfit, currentTicker, market]);

  return (
    <div className="rounded-2xl bg-[#090e1a] border border-[#162540] overflow-hidden p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141f33] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Smart Lot Size & Risk Calculator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CAPITAL DEFENSE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate exact mathematically safe position size for {currentTicker} to never exceed your risk tolerance
            </p>
          </div>
        </div>

        {/* Account balance preview */}
        <div className="text-right self-start sm:self-auto bg-[#070b13] px-3 py-1.5 rounded-xl border border-[#162540]">
          <span className="text-[10px] text-slate-500 font-mono uppercase block">Trading Capital</span>
          <span className="text-sm font-bold font-mono text-white">${accountBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Inputs Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Side: Parameters */}
        <div className="space-y-4 p-4 rounded-xl bg-[#0d1627] border border-[#182744]">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            1. Risk Parameters
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">Risk Mode</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#070b13] border border-[#142036]">
                <button
                  type="button"
                  onClick={() => setRiskType('percent')}
                  className={`py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                    riskType === 'percent'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  % Equity
                </button>
                <button
                  type="button"
                  onClick={() => setRiskType('cash')}
                  className={`py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                    riskType === 'cash'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fixed $
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                {riskType === 'percent' ? 'Risk Percentage' : 'Risk Amount ($)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={riskType === 'percent' ? riskPercent : riskCash}
                onChange={(e) =>
                  riskType === 'percent'
                    ? setRiskPercent(parseFloat(e.target.value) || 1)
                    : setRiskCash(parseFloat(e.target.value) || 50)
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#070b13] border border-[#142036] text-xs font-mono text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block pt-2">
            2. Price Levels ({currency})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || currentPrice)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#070b13] border border-[#142036] text-xs font-mono text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-rose-400 block mb-1 font-semibold">Stop Loss Level</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#070b13] border border-rose-500/40 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">Take Profit Target</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#070b13] border border-emerald-500/40 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Computed Output Cards */}
        <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-[#0c182d] to-[#070d18] border border-[#1b2f52] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0df2c9]" />
                Optimal Position Sizing Result
              </span>
              <span className="text-[11px] font-mono text-purple-300">
                {calc.contractSizeDesc}
              </span>
            </div>

            {/* Recommended Lots Highlight Box */}
            <div className="p-4 rounded-xl bg-[#070c16] border border-[#1e3358] mb-4 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {market === 'FOREX' ? 'Recommended Lot Sizing' : 'Recommended Share Quantity'}
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#0df2c9] mt-1">
                {calc.recommendedLots} {market === 'FOREX' ? 'Lots' : 'Shares'}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Guarantees max dollar loss of only <strong className="text-white">${calc.totalRiskAmount}</strong>
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Max Risk</span>
                <span className="font-bold font-mono text-rose-400">${calc.totalRiskAmount}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Target Profit</span>
                <span className="font-bold font-mono text-emerald-400">+${calc.profitTarget}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Risk / Reward</span>
                <span className="font-bold font-mono text-cyan-300">{calc.riskReward}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">SL Distance</span>
                <span className="font-bold font-mono text-slate-300">{calc.slDistance} pts</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">TP Distance</span>
                <span className="font-bold font-mono text-slate-300">{calc.tpDistance} pts</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#080f1d] border border-[#162540]">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Margin Req.</span>
                <span className="font-bold font-mono text-slate-300">${calc.marginRequired}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {onApplyToOrder && (
            <button
              onClick={() => onApplyToOrder(calc.recommendedLots, stopLoss, takeProfit)}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Transfer {calc.recommendedLots} Lots to Paper Trading Desk
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
