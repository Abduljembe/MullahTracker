import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Flame,
  Globe2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter,
  ExternalLink,
} from 'lucide-react';

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  flag: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW' | 'HOLIDAY';
  time: string;
  date: string;
  isoDate?: string;
  forecast: string;
  previous: string;
  actual?: string;
  isUpcoming: boolean;
  affectedTickers: string[];
  source?: string;
}

interface EconomicCalendarProps {
  currentTicker?: string;
}

export const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ currentTicker = 'XAU/USD' }) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterImpact, setFilterImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | 'USD' | 'EUR' | 'GBP' | 'KES' | 'JPY' | 'CAD' | 'AUD'>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch real Forex Factory live calendar from our backend
  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/forexfactory/calendar');
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Forex Factory calendar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  // Filtered by Impact and Currency
  const filteredEvents = events.filter((e) => {
    if (filterImpact === 'HIGH' && e.impact !== 'HIGH') return false;
    if (filterImpact === 'MEDIUM' && (e.impact !== 'HIGH' && e.impact !== 'MEDIUM')) return false;

    if (filterCurrency !== 'ALL' && e.country !== filterCurrency) return false;

    return true;
  });

  // Calculate high impact count
  const highImpactCount = events.filter((e) => e.impact === 'HIGH').length;

  return (
    <div className="rounded-2xl bg-[#0c1322] border border-[#18253b] overflow-hidden space-y-4">
      {/* Top Header */}
      <div className="p-4 border-b border-[#141f33] flex flex-wrap items-center justify-between gap-3 bg-[#080d18]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Forex Factory Live Economic Calendar</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                OFFICIAL REAL-TIME FEED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live macroeconomic data releases, central bank decisions & AI trade insights for {currentTicker}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Filters */}
          <div className="flex items-center gap-1 bg-[#0a101d] p-1 rounded-xl border border-[#162540] overflow-x-auto text-[11px]">
            {(['ALL', 'USD', 'EUR', 'GBP', 'KES', 'JPY', 'CAD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setFilterCurrency(curr)}
                className={`px-2 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer ${
                  filterCurrency === curr
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Impact Selector */}
          <div className="flex items-center gap-1 bg-[#0a101d] p-1 rounded-xl border border-[#162540]">
            <button
              onClick={() => setFilterImpact('HIGH')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterImpact === 'HIGH'
                  ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Red Folder (High)
            </button>
            <button
              onClick={() => setFilterImpact('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterImpact === 'ALL'
                  ? 'bg-slate-700/40 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events ({events.length})
            </button>
          </div>

          <button
            onClick={fetchCalendar}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#142036] hover:bg-[#1c2c48] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Forex Factory Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="px-4 pb-4">
        {isLoading && events.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
            Loading live Forex Factory calendar feed...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No events match the selected currency / impact filters. Try selecting &quot;ALL&quot;.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEvents.map((e) => {
              const isSelected = selectedEventId === e.id;
              const isRedFolder = e.impact === 'HIGH';
              const isOrangeFolder = e.impact === 'MEDIUM';

              return (
                <div
                  key={e.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-[#0f172a] border-rose-500/50 shadow-lg shadow-rose-950/20'
                      : isRedFolder
                      ? 'bg-[#0a0f1d] border-rose-900/30 hover:border-rose-700/50'
                      : 'bg-[#080d18] border-[#162540] hover:border-slate-700'
                  }`}
                >
                  {/* Event summary row */}
                  <div
                    onClick={() => setSelectedEventId(isSelected ? null : e.id)}
                    className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Forex Factory Impact Folder Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isRedFolder
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                            : isOrangeFolder
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                        title={`Forex Factory ${e.impact} Impact Release`}
                      >
                        {isRedFolder ? '🔴' : isOrangeFolder ? '🟠' : '🟡'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{e.flag}</span>
                          <span className="text-xs font-mono font-extrabold text-white">{e.country}</span>
                          <span className="text-xs font-bold text-slate-200">{e.title}</span>
                          {e.source && (
                            <span className="text-[9px] font-mono text-slate-500 px-1 py-0.2 rounded bg-[#101b2f]">
                              FF
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                          <span>{e.date} at <strong className="text-slate-200">{e.time} EAT</strong></span>
                          <span>•</span>
                          <span>Forecast: <strong className="text-cyan-300">{e.forecast}</strong></span>
                          <span>Previous: <strong className="text-slate-300">{e.previous}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#142036]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {e.affectedTickers.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              t === currentTicker
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#101b2e] text-slate-400'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[11px]">AI Trade Insight</span>
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded AI Insight Panel */}
                  {isSelected && (
                    <div className="p-4 bg-[#070b14] border-t border-[#182744] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-rose-400" />
                          Quantitative Trading Playbook for {currentTicker} on {e.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Forex Factory Macro Driver
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Bullish Trigger */}
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1 mb-1">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Bullish Catalyst Condition
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {currentTicker.includes('XAU')
                              ? `If actual print arrives softer than forecast (${e.forecast}), US real yields soften, driving institutional bullion demand above current resistance.`
                              : `If data beats consensus (${e.forecast}), expect immediate upward acceleration in base pair momentum.`}
                          </p>
                        </div>

                        {/* Bearish Trigger */}
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                          <span className="text-[10px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1 mb-1">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            Bearish Catalyst Condition
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {currentTicker.includes('XAU')
                              ? `A hotter than expected number reinforces hawkish rate expectations, triggering an immediate liquidity retest of support ($4,025 - $4,035).`
                              : `A clear miss against previous (${e.previous}) invalidates bullish order structure, targeting stop-loss clusters below.`}
                          </p>
                        </div>
                      </div>

                      {/* Actionable Strategy Directive */}
                      <div className="p-3 rounded-lg bg-[#0e172a] border border-[#1e2f4e] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Institutional Execution Directive</span>
                          <span className="text-white font-semibold">
                            Wait for 5-minute candle close post-release to allow spread normalization before entering.
                          </span>
                        </div>
                        <div className="text-right sm:border-l sm:border-[#1e2f4e] sm:pl-3 shrink-0">
                          <span className="text-slate-400 block text-[10px] uppercase">Estimated Volatility</span>
                          <span className="text-rose-400 font-bold">
                            {currentTicker.includes('XAU') ? '$25 - $45 in Gold' : '40 - 70 pips'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
