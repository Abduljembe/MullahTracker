import React from 'react';
import {
  Tv,
  ArrowRight,
  TrendingUp,
  Activity,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { LiveMarketsTVDesk } from '../common/LiveMarketsTVDesk.tsx';

export const LiveTvView: React.FC = () => {
  const { setActiveTab } = useFinance();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#170a14] via-[#10070e] to-[#080307] border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                Live Broadcast & Intelligence Desk
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WORLD MONITOR & BLOOMBERG TV
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-0.5">
              World Monitor & Bloomberg Live TV Desk
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Access the interactive World Monitor intelligence dashboard, live geopolitical telemetry, and 24/7 Bloomberg Television market broadcasts directly inside your app.
            </p>
          </div>
        </div>

        {/* Quick Return to Stocks Terminal */}
        <button
          onClick={() => setActiveTab('stocks')}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[#220a16] hover:bg-[#320f21] border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
        >
          <span>Open Stocks & Forex Signals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main TV Desk Component */}
      <LiveMarketsTVDesk
        onSelectTicker={(_symbol) => {
          setActiveTab('stocks');
        }}
      />
    </div>
  );
};
