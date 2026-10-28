import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Flame,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Target,
  Zap,
} from 'lucide-react';

interface ForexFactoryNewsItem {
  headline: string;
  eventTitle: string;
  country: string;
  scheduledTime: string;
  impact: 'High' | 'Medium' | 'Low' | string;
  forecast: string;
  previous: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  aiInsight: {
    summary: string;
    bullishScenario: string;
    bearishScenario: string;
    actionableStrategy: string;
    expectedVolatility: string;
  };
}

interface ForexFactoryNewsDeskProps {
  currentTicker: string;
  market: 'NSE' | 'US' | 'FOREX';
}

export const ForexFactoryNewsDesk: React.FC<ForexFactoryNewsDeskProps> = ({
  currentTicker,
  market,
}) => {
  const [news, setNews] = useState<ForexFactoryNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchForexFactoryNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/forexfactory/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: currentTicker, market }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setNews(data.news);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Failed to load Forex Factory news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForexFactoryNews();
  }, [currentTicker, market]);

  return (
    <div className="p-5 rounded-2xl bg-[#0c1322] border border-[#18253b] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141f33] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Forex Factory Live News & Quantitative Insights
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                100% REAL MACRO DATA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live scheduled macro catalysts for {currentTicker} grounded in official Forex Factory releases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchForexFactoryNews}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111c2e] hover:bg-[#192842] border border-[#1e2f4c] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live News</span>
          </button>
        </div>
      </div>

      {/* News Feed List */}
      {isLoading && news.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
          Querying live Forex Factory feed & synthesizing quantitative insights...
        </div>
      ) : news.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          No high-impact releases scheduled today for {currentTicker}. Check the full Economic Calendar tab.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item, idx) => {
            const isHigh = item.impact.toLowerCase() === 'high';

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#080e19] border border-[#162540] hover:border-rose-500/30 transition-all space-y-3"
              >
                {/* News Title & Forex Factory Impact Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                        Forex Factory {item.impact} Impact
                      </span>

                      <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                        {item.country} • {item.eventTitle}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug pt-0.5">
                      {item.headline}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold ${
                        item.sentiment === 'Bullish'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : item.sentiment === 'Bearish'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.sentiment} Catalyst
                    </span>
                  </div>
                </div>

                {/* Macro Figures: Forecast vs Previous */}
                <div className="flex items-center gap-4 text-xs font-mono bg-[#050810] p-2.5 rounded-lg border border-[#121c2d]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Scheduled Time</span>
                    <span className="font-bold text-slate-200">{item.scheduledTime}</span>
                  </div>
                  <div className="border-l border-[#1a283e] pl-3">
                    <span className="text-[10px] text-slate-500 block">Forecast</span>
                    <span className="font-bold text-cyan-400">{item.forecast}</span>
                  </div>
                  <div className="border-l border-[#1a283e] pl-3">
                    <span className="text-[10px] text-slate-500 block">Previous</span>
                    <span className="font-bold text-slate-300">{item.previous}</span>
                  </div>
                  <div className="border-l border-[#1a283e] pl-3 hidden sm:block">
                    <span className="text-[10px] text-slate-500 block">Expected Volatility</span>
                    <span className="font-bold text-rose-400">{item.aiInsight?.expectedVolatility || 'High'}</span>
                  </div>
                </div>

                {/* Quantitative AI Insights Box */}
                {item.aiInsight && (
                  <div className="p-3.5 rounded-lg bg-gradient-to-br from-[#0c1626] to-[#070d18] border border-teal-500/25 space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#0df2c9] font-bold text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Quantitative Impact Analysis for {currentTicker}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {item.aiInsight.summary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30">
                        <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 mb-0.5">
                          <ArrowUpRight className="w-3 h-3" />
                          Bullish Trigger
                        </span>
                        <span className="text-slate-300">{item.aiInsight.bullishScenario}</span>
                      </div>

                      <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30">
                        <span className="font-mono font-bold text-rose-400 flex items-center gap-1 mb-0.5">
                          <ArrowDownRight className="w-3 h-3" />
                          Bearish Trigger
                        </span>
                        <span className="text-slate-300">{item.aiInsight.bearishScenario}</span>
                      </div>
                    </div>

                    {/* Actionable Strategy */}
                    <div className="p-2 rounded bg-[#0a1120] border border-[#182844] flex items-center gap-2 text-[11px] text-slate-300">
                      <Target className="w-3.5 h-3.5 text-[#0df2c9] shrink-0" />
                      <span>
                        <strong className="text-white">Trade Directive:</strong> {item.aiInsight.actionableStrategy}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
