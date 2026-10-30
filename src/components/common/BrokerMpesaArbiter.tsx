import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  ArrowRightLeft,
  DollarSign,
  ShieldCheck,
  Zap,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Building,
  Scale,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface BrokerProfile {
  id: string;
  name: string;
  cmaLicensed: boolean;
  minDepositKes: number;
  depositRateKes: number; // KES to buy 1 USD
  withdrawalRateKes: number; // KES received per 1 USD
  mpesaFee: string;
  withdrawalSpeed: string;
  maxLeverage: string;
  spreadEurUsd: string;
  popularFor: string;
}

const BROKERS: BrokerProfile[] = [
  {
    id: 'fxpesa',
    name: 'FXPesa (EGM Securities)',
    cmaLicensed: true,
    minDepositKes: 500,
    depositRateKes: 130.20,
    withdrawalRateKes: 128.80,
    mpesaFee: 'Free (Broker absorbs Paybill fee)',
    withdrawalSpeed: 'Instant - 30 Mins (M-Pesa)',
    maxLeverage: '1:400',
    spreadEurUsd: '1.2 pips (Standard) / 0.1 pips (Executive)',
    popularFor: 'Local CMA regulation & direct Safaricom STK Push',
  },
  {
    id: 'pepperstone',
    name: 'Pepperstone Kenya',
    cmaLicensed: true,
    minDepositKes: 1000,
    depositRateKes: 130.40,
    withdrawalRateKes: 128.90,
    mpesaFee: 'Free via M-Pesa portal',
    withdrawalSpeed: 'Instant via M-Pesa',
    maxLeverage: '1:400',
    spreadEurUsd: '0.0 pips + $3.50 commission (Razor)',
    popularFor: 'Raw institutional ECN spreads & cTrader support',
  },
  {
    id: 'scope',
    name: 'Scope Markets Kenya',
    cmaLicensed: true,
    minDepositKes: 1000,
    depositRateKes: 130.50,
    withdrawalRateKes: 128.60,
    mpesaFee: 'Standard M-Pesa tariffs',
    withdrawalSpeed: '1 - 2 Hours',
    maxLeverage: '1:400',
    spreadEurUsd: '1.1 pips',
    popularFor: 'CMA licensed pioneer in Nairobi interbank trading',
  },
  {
    id: 'exness',
    name: 'Exness Kenya',
    cmaLicensed: true,
    minDepositKes: 1300, // ~$10
    depositRateKes: 130.10,
    withdrawalRateKes: 129.10,
    mpesaFee: 'Zero deposit & withdrawal fees',
    withdrawalSpeed: 'Instant Automated 24/7 (3 seconds)',
    maxLeverage: '1:2000 (Unlimited)',
    spreadEurUsd: '0.6 pips (Standard) / 0.0 pips (Raw)',
    popularFor: 'Instant 24/7 automated M-Pesa withdrawals & high leverage',
  },
  {
    id: 'icmarkets',
    name: 'IC Markets',
    cmaLicensed: false,
    minDepositKes: 2600, // ~$200 recommended
    depositRateKes: 131.20,
    withdrawalRateKes: 128.20,
    mpesaFee: 'Card / Neteller / Skrill M-Pesa gateway',
    withdrawalSpeed: 'Same day (2 - 6 Hours)',
    maxLeverage: '1:500',
    spreadEurUsd: '0.0 pips (Raw Spread)',
    popularFor: 'Deep global liquidity pools & MT5 algo trading',
  },
  {
    id: 'xm',
    name: 'XM Global',
    cmaLicensed: false,
    minDepositKes: 650, // ~$5
    depositRateKes: 130.90,
    withdrawalRateKes: 128.40,
    mpesaFee: 'Zero fees on M-Pesa deposits',
    withdrawalSpeed: 'Under 1 Hour',
    maxLeverage: '1:1000',
    spreadEurUsd: '0.6 pips (Ultra Low)',
    popularFor: '$30 No Deposit Bonus & zero swap accounts',
  },
];

const CBK_INTERBANK_RATE = 129.50; // Official CBK Reference Rate

export const BrokerMpesaArbiter: React.FC = () => {
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('exness');
  const [depositAmountKes, setDepositAmountKes] = useState<number>(20000);
  const [tradingProfitUsd, setTradingProfitUsd] = useState<number>(150);

  const selectedBroker = useMemo(() => {
    return BROKERS.find((b) => b.id === selectedBrokerId) || BROKERS[0];
  }, [selectedBrokerId]);

  // Reconciliation calculations
  const reconciliation = useMemo(() => {
    // 1. Initial USD bought with KES
    const usdDeposited = depositAmountKes / selectedBroker.depositRateKes;

    // 2. Total account balance in USD after trading
    const finalUsdBalance = usdDeposited + tradingProfitUsd;

    // 3. Cashout to M-Pesa at broker withdrawal rate
    const grossKesCashout = finalUsdBalance * selectedBroker.withdrawalRateKes;

    // 4. Spread friction cost (what was lost to deposit/withdrawal exchange rate spread)
    const idealDepositUsd = depositAmountKes / CBK_INTERBANK_RATE;
    const idealFinalKes = (idealDepositUsd + tradingProfitUsd) * CBK_INTERBANK_RATE;
    const spreadLossKes = Math.max(0, idealFinalKes - grossKesCashout);

    // 5. Net profit in KES
    const netProfitKes = grossKesCashout - depositAmountKes;
    const roiPercent = (netProfitKes / depositAmountKes) * 100;

    return {
      usdDeposited: Math.round(usdDeposited * 100) / 100,
      finalUsdBalance: Math.round(finalUsdBalance * 100) / 100,
      grossKesCashout: Math.round(grossKesCashout),
      spreadLossKes: Math.round(spreadLossKes),
      netProfitKes: Math.round(netProfitKes),
      roiPercent: Math.round(roiPercent * 10) / 10,
      spreadPercent: (
        ((selectedBroker.depositRateKes - selectedBroker.withdrawalRateKes) /
          selectedBroker.depositRateKes) *
        100
      ).toFixed(2),
    };
  }, [depositAmountKes, tradingProfitUsd, selectedBroker]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#091120] border border-[#162744] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
              Local Liquidity & Mobile Money Arbiter
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              M-PESA / KES OPTIMIZER
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Forex Broker M-Pesa Deposit/Withdrawal Spread Arbiter</span>
          </h3>
        </div>

        {/* CBK Interbank Benchmark */}
        <div className="px-3 py-1.5 rounded-xl bg-[#060c18] border border-[#14223a] text-right font-mono text-xs">
          <span className="text-[9px] text-slate-400 uppercase block">CBK Interbank Benchmark</span>
          <span className="text-sm font-black text-cyan-300">
            1 USD = KES {CBK_INTERBANK_RATE.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Broker Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {BROKERS.map((broker) => {
          const isSelected = broker.id === selectedBrokerId;
          const spread = (broker.depositRateKes - broker.withdrawalRateKes).toFixed(2);
          return (
            <div
              key={broker.id}
              onClick={() => setSelectedBrokerId(broker.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0a182c] border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-[#060d19] border-[#14233c] hover:border-[#1d355b]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{broker.name}</span>
                    {broker.cmaLicensed && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-teal-500/20 text-[#0df2c9] border border-teal-500/30"
                        title="Regulated by Capital Markets Authority (CMA) Kenya"
                      >
                        CMA LICENSED
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    {broker.popularFor}
                  </span>
                </div>
              </div>

              {/* Rate Matrix */}
              <div className="p-2 rounded-lg bg-[#050b14] border border-[#111e33] text-[11px] font-mono space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Deposit (Buy USD):</span>
                  <span className="text-white font-bold">KES {broker.depositRateKes.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Withdraw (Sell USD):</span>
                  <span className="text-emerald-400 font-bold">KES {broker.withdrawalRateKes.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#121f35] text-[10px]">
                  <span className="text-slate-500">FX Conversion Spread:</span>
                  <span className="text-cyan-300 font-bold">
                    KES {spread} / USD ({(((broker.depositRateKes - broker.withdrawalRateKes) / broker.depositRateKes) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Perks */}
              <div className="space-y-1 text-[10px] font-mono text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Speed:</span>
                  <span className="text-emerald-300 font-semibold">{broker.withdrawalSpeed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">EUR/USD Spread:</span>
                  <span className="text-white">{broker.spreadEurUsd}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Net P&L & Spread Reconciliation Calculator */}
      <div className="p-4 rounded-xl bg-[#060c18] border border-[#14233c] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Net Profit & M-Pesa Cashout Reconciliation ({selectedBroker.name})
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Real take-home after broker conversion
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">
              Deposit Capital (KES via M-Pesa):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                KES
              </span>
              <input
                type="number"
                step="1000"
                value={depositAmountKes}
                onChange={(e) => setDepositAmountKes(parseFloat(e.target.value) || 0)}
                className="w-full pl-12 pr-3 py-2 rounded-xl bg-[#080f1d] border border-[#162744] text-white font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">
              Trading P&L Achieved (USD):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                $
              </span>
              <input
                type="number"
                step="10"
                value={tradingProfitUsd}
                onChange={(e) => setTradingProfitUsd(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#080f1d] border border-[#162744] text-emerald-400 font-bold text-xs"
              />
            </div>
          </div>
        </div>

        {/* Reconciliation Breakdown Result */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#081224] border border-[#14233c] space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase block">USD Deposited</span>
            <div className="text-base font-extrabold text-white">
              ${reconciliation.usdDeposited}
            </div>
            <span className="text-[9px] text-slate-500 block">
              @ KES {selectedBroker.depositRateKes}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#081224] border border-[#14233c] space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase block">Total USD Balance</span>
            <div className="text-base font-extrabold text-cyan-300">
              ${reconciliation.finalUsdBalance}
            </div>
            <span className="text-[9px] text-emerald-400 block font-bold">
              +${tradingProfitUsd} trading gain
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#061418] border border-emerald-500/30 space-y-0.5">
            <span className="text-[10px] text-emerald-400 uppercase block font-bold">
              Gross M-Pesa Payout
            </span>
            <div className="text-base font-black text-emerald-300">
              KES {reconciliation.grossKesCashout.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 block">
              @ KES {selectedBroker.withdrawalRateKes}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#061418] border border-emerald-500/40 space-y-0.5">
            <span className="text-[10px] text-teal-400 uppercase block font-bold">
              Net Profit in KES
            </span>
            <div
              className={`text-base font-black ${
                reconciliation.netProfitKes >= 0 ? 'text-[#0df2c9]' : 'text-rose-400'
              }`}
            >
              {reconciliation.netProfitKes >= 0 ? '+' : ''}KES{' '}
              {reconciliation.netProfitKes.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 block font-bold">
              {reconciliation.netProfitKes >= 0 ? '+' : ''}
              {reconciliation.roiPercent}% Net ROI
            </span>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-2.5 rounded-lg bg-[#070d18] border border-[#14233c] text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            💡 <strong>Broker Spread Friction:</strong> Approximately KES {reconciliation.spreadLossKes.toLocaleString()} was paid in broker buy/sell conversion spread.
          </span>
          <span className="text-teal-400 font-mono text-[10px] font-bold">
            {reconciliation.spreadPercent}% Spread Friction
          </span>
        </div>
      </div>
    </div>
  );
};
