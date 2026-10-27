import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, Flame, Globe2, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  flag: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  time: string;
  date: string;
  forecast: string;
  previous: string;
  actual?: string;
  isUpcoming: boolean;
  affectedTickers: string[];
}

const UPCOMING_EVENTS: EconomicEvent[] = [
  {
    id: 'ev-1',
    title: 'US CPI Inflation Rate (YoY)',
    country: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    impact: 'HIGH',
    time: '15:30 EAT',
    date: 'Today',
    forecast: '2.4%',
    previous: '2.5%',
    isUpcoming: true,
    affectedTickers: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'AAPL', 'NVDA'],
  },
  {
    id: 'ev-2',
    title: 'Central Bank of Kenya (CBK) MPC Interest Rate Decision',
    country: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    impact: 'HIGH',
    time: '16:00 EAT',
    date: 'Tomorrow',
    forecast: '12.00%',
    previous: '12.75%',
    isUpcoming: true,
    affectedTickers: ['USD/KES', 'GBP/KES', 'EUR/KES', 'SCOM', 'EQTY', 'KCB'],
  },
  {
    id: 'ev-3',
    title: 'US Initial Jobless Claims',
    country: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    impact: 'MEDIUM',
    time: '15:30 EAT',
    date: 'Thursday',
    forecast: '218K',
    previous: '215K',
    isUpcoming: true,
    affectedTickers: ['USD/JPY', 'EUR/USD', 'USD/CAD'],
  },
  {
    id: 'ev-4',
    title: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
    country: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    impact: 'HIGH',
    time: '15:30 EAT',
    date: 'Friday',
    forecast: '140K / 4.1%',
    previous: '254K / 4.1%',
    isUpcoming: true,
    affectedTickers: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'AUD/USD'],
  },
  {
    id: 'ev-5',
    title: 'European Central Bank (ECB) Main Refinancing Rate',
    country: 'Eurozone',
    flag: '🇪🇺',
    currency: 'EUR',
    impact: 'HIGH',
    time: '15:15 EAT',
    date: 'Thursday',
    forecast: '3.25%',
    previous: '3.40%',
    isUpcoming: true,
    affectedTickers: ['EUR/USD', 'EUR/KES'],
  },
  {
    id: 'ev-6',
    title: 'Bank of Japan (BoJ) Monetary Policy Statement',
    country: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    impact: 'HIGH',
    time: '06:00 EAT',
    date: 'Thursday',
    forecast: '0.25%',
    previous: '0.25%',
    isUpcoming: true,
    affectedTickers: ['USD/JPY'],
  },
];

interface EconomicCalendarProps {
  currentTicker?: string;
}

export const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ currentTicker }) => {
  const [filterImpact, setFilterImpact] = useState<'ALL' | 'HIGH'>('ALL');

  const filteredEvents = UPCOMING_EVENTS.filter((e) => {
    if (filterImpact === 'HIGH' && e.impact !== 'HIGH') return false;
    return true;
  });

  return (
    <div className="rounded-2xl bg-[#0c1322] border border-[#18253b] overflow-hidden">
      <div className="p-4 border-b border-[#141f33] flex flex-wrap items-center justify-between gap-3 bg-[#080d18]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>High-Impact Economic Calendar</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                FOREX & EQUITIES
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Key market-moving macroeconomic releases and central bank rate decisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#10192a] p-1 rounded-xl border border-[#1a2942]">
          <button
            onClick={() => setFilterImpact('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterImpact === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Releases
          </button>
          <button
            onClick={() => setFilterImpact('HIGH')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterImpact === 'HIGH'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>High Impact Only</span>
          </button>
        </div>
      </div>

      <div className="p-4 divide-y divide-[#141f33] space-y-3">
        {filteredEvents.map((event) => {
          const isRelatedToCurrent = currentTicker && event.affectedTickers.includes(currentTicker);

          return (
            <div
              key={event.id}
              className={`pt-3 first:pt-0 transition-colors ${
                isRelatedToCurrent ? 'bg-amber-500/5 -mx-4 px-4 py-2 rounded-xl' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" title={event.country}>
                    {event.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{event.title}</span>
                      {isRelatedToCurrent && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Affects {currentTicker}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono text-slate-300 font-semibold">{event.currency}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {event.date} at {event.time}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Forecast</span>
                    <span className="text-white font-semibold">{event.forecast}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Previous</span>
                    <span className="text-slate-400">{event.previous}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      event.impact === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {event.impact}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
