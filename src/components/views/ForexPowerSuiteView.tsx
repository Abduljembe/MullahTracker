import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe2,
  Calendar,
  Users,
  Clock,
  Send,
  Zap,
  Flame,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Compass,
  Building2,
  Target,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { CurrencyStrengthMeter } from '../common/CurrencyStrengthMeter.tsx';
import { PropFirmRiskGuardian } from '../common/PropFirmRiskGuardian.tsx';
import { EconomicCalendar } from '../common/EconomicCalendar.tsx';
import { ForexSessionsKillzones } from '../common/ForexSessionsKillzones.tsx';
import { RetailSentimentDesk } from '../common/RetailSentimentDesk.tsx';
import { TelegramSignalDispatcher } from '../common/TelegramSignalDispatcher.tsx';
import { IntermarketDivergenceRadar } from '../common/IntermarketDivergenceRadar.tsx';
import { AdrVolatilityExhaustionDesk } from '../common/AdrVolatilityExhaustionDesk.tsx';
import { CotInstitutionalMatrix } from '../common/CotInstitutionalMatrix.tsx';
import { MtfConfluenceMatrixDesk } from '../common/MtfConfluenceMatrixDesk.tsx';
import { CamarillaPivotMatrix } from '../common/CamarillaPivotMatrix.tsx';

type SuiteTab =
  | 'all'
  | 'csm'
  | 'intermarket'
  | 'adr'
  | 'mtf-matrix'
  | 'cot'
  | 'camarilla'
  | 'propfirm'
  | 'sentiment'
  | 'calendar'
  | 'sessions'
  | 'dispatcher';

export const ForexPowerSuiteView: React.FC = () => {
  const { setActiveTab } = useFinance();
  const [activeTabLocal, setActiveTabLocal] = useState<SuiteTab>('all');
  const [selectedAsset, setSelectedAsset] = useState<string>('XAU/USD');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#081324] via-[#091830] to-[#060c18] border border-teal-500/30 shadow-[0_0_30px_rgba(13,242,201,0.09)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shadow-[0_0_15px_rgba(13,242,201,0.3)] shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Forex Institutional Quant & Macro Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0df2c9]/15 text-[#0df2c9] border border-[#0df2c9]/30">
                11/11 QUANT TOOLS ARMED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Complete professional quantitative command desk: Intermarket Macro Divergence Radar, ADR Volatility Exhaustion, COT Smart Money Flows, MTF Matrix, Camarilla Pivots, Currency Strength, Prop Firm Shield, Retail Sentiment, and Live News Guard.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('stocks')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e1a2f] hover:bg-[#142644] border border-[#1b345b] text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <span>Live TradingView Chart</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0df2c9]" />
          </button>
          <button
            onClick={() => setActiveTab('mt5-ea')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wide shadow-[0_0_15px_rgba(13,242,201,0.3)] transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Bot EA</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#090f1a] border border-[#16233a] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTabLocal('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'all'
              ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All 11 Quant Tools</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('intermarket')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'intermarket'
              ? 'bg-[#0df2c9]/20 text-[#0df2c9] border border-[#0df2c9]/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#0df2c9]" />
          <span>1. Intermarket Macro Radar</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('adr')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'adr'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>2. ADR Volatility Exhaustion</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('mtf-matrix')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'mtf-matrix'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>3. MTF 4H-1M Confluence</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('cot')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'cot'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-400" />
          <span>4. COT Smart Money Flows</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('camarilla')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'camarilla'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>5. Camarilla & CPR Pivots</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('csm')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'csm'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>6. Currency Strength (CSM)</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('propfirm')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'propfirm'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>7. Prop Firm Shield</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('sentiment')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'sentiment'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>8. Retail Sentiment</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('calendar')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'calendar'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>9. Economic Calendar</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('sessions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'sessions'
              ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>10. Killzones</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('dispatcher')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
            activeTabLocal === 'dispatcher'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-400" />
          <span>11. Telegram Dispatch</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTabLocal === 'all' && (
        <div className="space-y-6">
          {/* Priority Macro & Volatility Suite */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IntermarketDivergenceRadar
              onSelectPair={(pair) => {
                setSelectedAsset(pair);
                setActiveTab('stocks');
              }}
            />
            <AdrVolatilityExhaustionDesk
              currentTicker={selectedAsset}
              onSelectTicker={(t) => setSelectedAsset(t)}
            />
          </div>

          {/* MTF Confluence Matrix Full Width */}
          <MtfConfluenceMatrixDesk
            onSelectPair={(pair) => {
              setSelectedAsset(pair);
              setActiveTab('stocks');
            }}
          />

          {/* Row 3: COT Institutional Matrix + Camarilla Pivots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CotInstitutionalMatrix />
            <CamarillaPivotMatrix
              currentTicker={selectedAsset}
              onSelectTicker={(t) => setSelectedAsset(t)}
            />
          </div>

          {/* Row 4: Currency Strength Meter + Retail Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrencyStrengthMeter
              onSelectPair={(pair) => {
                setSelectedAsset(pair);
                setActiveTab('stocks');
              }}
            />
            <RetailSentimentDesk
              currentTicker={selectedAsset}
              onSelectTicker={(t) => setSelectedAsset(t)}
            />
          </div>

          {/* Row 5: Prop Firm Risk Guardian + Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PropFirmRiskGuardian currentTicker={selectedAsset} />
            <ForexSessionsKillzones />
          </div>

          {/* Row 6: Economic Calendar + Telegram Dispatcher */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EconomicCalendar currentTicker={selectedAsset} />
            <TelegramSignalDispatcher
              activeSignal={{
                symbol: selectedAsset,
                action: 'STRONG BUY',
                price: 4089.08,
                entryZone: '4087.50 - 4091.00',
                sl: 4067.08,
                tp1: 4122.08,
                tp2: 4150.68,
              }}
            />
          </div>
        </div>
      )}

      {activeTabLocal === 'intermarket' && (
        <IntermarketDivergenceRadar
          onSelectPair={(pair) => {
            setSelectedAsset(pair);
            setActiveTab('stocks');
          }}
        />
      )}

      {activeTabLocal === 'adr' && (
        <AdrVolatilityExhaustionDesk
          currentTicker={selectedAsset}
          onSelectTicker={(t) => setSelectedAsset(t)}
        />
      )}

      {activeTabLocal === 'mtf-matrix' && (
        <MtfConfluenceMatrixDesk
          onSelectPair={(pair) => {
            setSelectedAsset(pair);
            setActiveTab('stocks');
          }}
        />
      )}

      {activeTabLocal === 'cot' && <CotInstitutionalMatrix />}

      {activeTabLocal === 'camarilla' && (
        <CamarillaPivotMatrix
          currentTicker={selectedAsset}
          onSelectTicker={(t) => setSelectedAsset(t)}
        />
      )}

      {activeTabLocal === 'csm' && (
        <CurrencyStrengthMeter
          onSelectPair={(pair) => {
            setSelectedAsset(pair);
            setActiveTab('stocks');
          }}
        />
      )}

      {activeTabLocal === 'propfirm' && (
        <PropFirmRiskGuardian currentTicker={selectedAsset} />
      )}

      {activeTabLocal === 'sentiment' && (
        <RetailSentimentDesk
          currentTicker={selectedAsset}
          onSelectTicker={(t) => setSelectedAsset(t)}
        />
      )}

      {activeTabLocal === 'calendar' && (
        <EconomicCalendar currentTicker={selectedAsset} />
      )}

      {activeTabLocal === 'sessions' && <ForexSessionsKillzones />}

      {activeTabLocal === 'dispatcher' && (
        <TelegramSignalDispatcher
          activeSignal={{
            symbol: selectedAsset,
            action: 'STRONG BUY',
            price: 4089.08,
            entryZone: '4087.50 - 4091.00',
            sl: 4067.08,
            tp1: 4122.08,
            tp2: 4150.68,
          }}
        />
      )}
    </div>
  );
};
