import React, { useState } from 'react';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building2,
  Users,
  Flame,
  Info,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface CotDataAsset {
  symbol: string;
  name: string;
  reportDate: string;
  commercialNet: number; // Institutional Banks / Producers (contracts)
  nonCommercialNet: number; // Hedge Funds / Large Speculators
  retailNet: number; // Small Speculators
  cotIndex: number; // 0-100% percentile of 52-week positioning
  institutionalBias: 'STRONG INSTITUTIONAL ACCUMULATION' | 'INSTITUTIONAL DISTRIBUTION' | 'NEUTRAL ROTATION';
  changeFromPrevWeek: number;
  thesis: string;
}

const DEFAULT_COT_DATA: CotDataAsset[] = [
  {
    symbol: 'GOLD (XAU)',
    name: 'CFTC Gold Futures (COMEX)',
    reportDate: 'Nov 04, 2026',
    commercialNet: 242500,
    nonCommercialNet: 285400,
    retailNet: -42900,
    cotIndex: 94,
    institutionalBias: 'STRONG INSTITUTIONAL ACCUMULATION',
    changeFromPrevWeek: 12400,
    thesis: 'Hedge funds and sovereign accounts added +12,400 net long contracts. COT Index at 94% confirms massive multi-week institutional accumulation.',
  },
  {
    symbol: 'EUR (Euro)',
    name: 'CFTC Euro FX Futures (CME)',
    reportDate: 'Nov 04, 2026',
    commercialNet: 64200,
    nonCommercialNet: -48100,
    retailNet: -16100,
    cotIndex: 42,
    institutionalBias: 'NEUTRAL ROTATION',
    changeFromPrevWeek: -3200,
    thesis: 'Speculative funds trimmed shorts ahead of ECB policy statement. Institutional positioning neutral with slight recovery bias.',
  },
  {
    symbol: 'GBP (Pound)',
    name: 'CFTC British Pound Futures',
    reportDate: 'Nov 04, 2026',
    commercialNet: -28400,
    nonCommercialNet: 31200,
    retailNet: -2800,
    cotIndex: 68,
    institutionalBias: 'STRONG INSTITUTIONAL ACCUMULATION',
    changeFromPrevWeek: 4800,
    thesis: 'Large money managers increased net long sterling exposure by +4,800 contracts following sticky UK services inflation.',
  },
  {
    symbol: 'JPY (Yen)',
    name: 'CFTC Japanese Yen Futures',
    reportDate: 'Nov 04, 2026',
    commercialNet: -145000,
    nonCommercialNet: 128000,
    retailNet: 17000,
    cotIndex: 88,
    institutionalBias: 'STRONG INSTITUTIONAL ACCUMULATION',
    changeFromPrevWeek: 18200,
    thesis: 'Historic short-squeeze unwind underway. Japanese institutional repatriation driving aggressive buying of Yen futures.',
  },
  {
    symbol: 'WTI (Crude Oil)',
    name: 'CFTC Light Sweet Crude',
    reportDate: 'Nov 04, 2026',
    commercialNet: -198000,
    nonCommercialNet: 215000,
    retailNet: -17000,
    cotIndex: 76,
    institutionalBias: 'STRONG INSTITUTIONAL ACCUMULATION',
    changeFromPrevWeek: 8900,
    thesis: 'Managed money positioning expands as global inventories tighten and geopolitical risk premiums elevate.',
  },
];

export const CotInstitutionalMatrix: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<CotDataAsset>(DEFAULT_COT_DATA[0]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Commitment of Traders (COT) Institutional Flow Matrix
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                CFTC SMART MONEY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Weekly audited regulatory filing showing whether Commercial Banks and Billion-Dollar Hedge Funds are accumulating or dumping.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-[#0c1628] px-3 py-1.5 rounded-xl border border-[#172c4a] self-start sm:self-auto">
          CFTC Release: <strong className="text-teal-300">{selectedAsset.reportDate}</strong>
        </span>
      </div>

      {/* Asset Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {DEFAULT_COT_DATA.map((item) => {
          const isSelected = item.symbol === selectedAsset.symbol;
          return (
            <button
              key={item.symbol}
              onClick={() => setSelectedAsset(item)}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                isSelected
                  ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 shadow-[0_0_12px_rgba(13,242,201,0.2)] font-bold'
                  : 'bg-[#09111e] hover:bg-[#0e1a2f] text-slate-300 border-[#182942]'
              }`}
            >
              <span>{item.symbol}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  item.cotIndex >= 70
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : item.cotIndex <= 30
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                COT: {item.cotIndex}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Asset Focus */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#08101d] border border-[#1b3050] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14233a] pb-3">
          <div>
            <span className="text-base font-bold text-white">{selectedAsset.name}</span>
            <span className="text-xs font-mono text-slate-400 block">
              Weekly Flow: <strong className={selectedAsset.changeFromPrevWeek >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {selectedAsset.changeFromPrevWeek >= 0 ? '+' : ''}{selectedAsset.changeFromPrevWeek.toLocaleString()} contracts
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Institutional Bias:</span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
                selectedAsset.institutionalBias.includes('ACCUMULATION')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : selectedAsset.institutionalBias.includes('DISTRIBUTION')
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {selectedAsset.institutionalBias}
            </span>
          </div>
        </div>

        {/* 3-Tier Positioning Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#173054] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Commercial Banks:
              </span>
            </div>
            <span className="text-base font-bold text-white block">
              {selectedAsset.commercialNet.toLocaleString()} net
            </span>
            <span className="text-[10px] text-slate-400">Producers & Central Bank Arbitrageurs</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#173054] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Hedge Funds (Non-Comm):
              </span>
            </div>
            <span className="text-base font-bold text-emerald-300 block">
              {selectedAsset.nonCommercialNet.toLocaleString()} net
            </span>
            <span className="text-[10px] text-slate-400">Trend-following Institutional Capital</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#173054] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Retail (Non-Reportable):
              </span>
            </div>
            <span className="text-base font-bold text-rose-300 block">
              {selectedAsset.retailNet.toLocaleString()} net
            </span>
            <span className="text-[10px] text-slate-400">Small Speculator Crowd</span>
          </div>
        </div>

        {/* Institutional Thesis */}
        <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/40 text-xs text-slate-200 leading-relaxed font-mono flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0df2c9] shrink-0 mt-0.5" />
          <span>{selectedAsset.thesis}</span>
        </div>
      </div>
    </div>
  );
};
