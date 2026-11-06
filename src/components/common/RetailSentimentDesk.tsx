import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Zap,
  Info,
  CheckCircle2,
  Crosshair,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

export interface SentimentAsset {
  symbol: string;
  name: string;
  retailLongPct: number;
  retailShortPct: number;
  change24h: number;
  currentPrice: number;
  institutionalBias: 'STRONG FADE (SHORT)' | 'STRONG FADE (BUY)' | 'BALANCED / NEUTRAL';
  trapWarning: string;
  stopLossClusterHigh: number;
  stopLossClusterLow: number;
  totalPositionsSampled: string;
}

const DEFAULT_SENTIMENT_DATA: SentimentAsset[] = [
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    retailLongPct: 82,
    retailShortPct: 18,
    change24h: 0.71,
    currentPrice: 4089.08,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Extreme Retail Long Crowding. Institutions have primed Sell-Side Liquidity sweeps below 4,057 to trigger retail stops.',
    stopLossClusterHigh: 4148.50,
    stopLossClusterLow: 4055.00,
    totalPositionsSampled: '48,290 retail lots',
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    retailLongPct: 34,
    retailShortPct: 66,
    change24h: -0.10,
    currentPrice: 1.1217,
    institutionalBias: 'STRONG FADE (BUY)',
    trapWarning: 'Heavy Retail Short consensus. Institutional market makers targeting Buy-Side Liquidity above 1.1270.',
    stopLossClusterHigh: 1.1275,
    stopLossClusterLow: 1.1190,
    totalPositionsSampled: '32,150 retail lots',
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    retailLongPct: 41,
    retailShortPct: 59,
    change24h: 0.15,
    currentPrice: 1.3452,
    institutionalBias: 'STRONG FADE (BUY)',
    trapWarning: 'Moderate Short imbalance. Potential squeeze of retail breakout shorts during London/NY overlap.',
    stopLossClusterHigh: 1.3520,
    stopLossClusterLow: 1.3380,
    totalPositionsSampled: '24,800 retail lots',
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    retailLongPct: 74,
    retailShortPct: 26,
    change24h: -0.32,
    currentPrice: 157.79,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Retail buying dips into resistance. High probability of BoJ jawboning liquidity sweep downward.',
    stopLossClusterHigh: 158.40,
    stopLossClusterLow: 156.80,
    totalPositionsSampled: '29,400 retail lots',
  },
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Tech Index',
    retailLongPct: 76,
    retailShortPct: 24,
    change24h: 0.85,
    currentPrice: 26954.00,
    institutionalBias: 'STRONG FADE (SHORT)',
    trapWarning: 'Euphoric retail call-buying. Smart money distributing into high-volume liquidity pools.',
    stopLossClusterHigh: 27150.00,
    stopLossClusterLow: 26780.00,
    totalPositionsSampled: '18,920 retail contracts',
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average',
    retailLongPct: 48,
    retailShortPct: 52,
    change24h: 0.22,
    currentPrice: 43810.00,
    institutionalBias: 'BALANCED / NEUTRAL',
    trapWarning: 'Equilibrium zone. No extreme retail crowding detected; follow pure technical price action.',
    stopLossClusterHigh: 44100.00,
    stopLossClusterLow: 43500.00,
    totalPositionsSampled: '14,200 retail contracts',
  },
];

interface RetailSentimentDeskProps {
  currentTicker?: string;
  onSelectTicker?: (ticker: string) => void;
}

export const RetailSentimentDesk: React.FC<RetailSentimentDeskProps> = ({
  currentTicker = 'XAU/USD',
  onSelectTicker,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentTicker);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedAsset = useMemo(() => {
    return (
      DEFAULT_SENTIMENT_DATA.find(
        (a) => a.symbol === selectedSymbol || a.symbol.replace('/', '') === selectedSymbol.replace('/', '')
      ) || DEFAULT_SENTIMENT_DATA[0]
    );
  }, [selectedSymbol]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] via-[#09101d] to-[#070d18] border border-teal-500/30 shadow-[0_0_25px_rgba(13,242,201,0.08)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182942] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Retail vs. Institutional Sentiment & Order Book Ratio
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                CONTRARIAN EDGE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              When 75%+ of retail traders pile into one direction, institutional market makers hunt their stop-loss clusters. Trade with the smart money, not the crowd.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1d33] hover:bg-[#152744] border border-[#1b345b] text-slate-300 hover:text-white text-xs font-mono transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0df2c9]' : ''}`} />
          <span>Sync Order Book</span>
        </button>
      </div>

      {/* Asset Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {DEFAULT_SENTIMENT_DATA.map((item) => {
          const isSelected = item.symbol === selectedAsset.symbol;
          const isExtreme = item.retailLongPct >= 75 || item.retailShortPct >= 75;
          return (
            <button
              key={item.symbol}
              onClick={() => {
                setSelectedSymbol(item.symbol);
                if (onSelectTicker) onSelectTicker(item.symbol);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                isSelected
                  ? 'bg-teal-500/20 text-[#0df2c9] border-[#0df2c9]/60 shadow-[0_0_12px_rgba(13,242,201,0.2)] font-bold'
                  : 'bg-[#09111e] hover:bg-[#0e1a2f] text-slate-300 border-[#182942]'
              }`}
            >
              <span>{item.symbol}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  item.retailLongPct > 50
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {item.retailLongPct}% L
              </span>
              {isExtreme && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Asset Focus Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#08101d] border border-[#1b3050] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14233a] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{selectedAsset.symbol}</span>
              <span className="text-xs text-slate-400 font-mono">({selectedAsset.name})</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Sampled Pool: <strong className="text-slate-200">{selectedAsset.totalPositionsSampled}</strong> across major retail brokers
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Institutional Bias:</span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${
                selectedAsset.institutionalBias.includes('SHORT')
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : selectedAsset.institutionalBias.includes('BUY')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {selectedAsset.institutionalBias}
            </span>
          </div>
        </div>

        {/* Visual Bar Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              RETAIL LONG: {selectedAsset.retailLongPct}%
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              RETAIL SHORT: {selectedAsset.retailShortPct}%
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-[#1e3458] p-0.5">
            <div
              style={{ width: `${selectedAsset.retailLongPct}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
            <div
              style={{ width: `${selectedAsset.retailShortPct}%` }}
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-700 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            />
          </div>
        </div>

        {/* Institutional Liquidity Trap Warning */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block">
              Smart Money Liquidity Hunt Warning
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedAsset.trapWarning}
            </p>
          </div>
        </div>

        {/* Liquidity Pools & Stop Clusters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#0a1526] border border-[#172d4c] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Buy-Side Stop Clustered (BSL):</span>
              <span className="text-emerald-400 font-bold">
                {selectedAsset.stopLossClusterHigh}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Retail shorts have protective buy-stops clustered here. Market makers may wick into this level to sweep liquidity.
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0a1526] border border-[#172d4c] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Sell-Side Stop Clustered (SSL):</span>
              <span className="text-rose-400 font-bold">
                {selectedAsset.stopLossClusterLow}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Retail longs placed stops beneath this swing low. Prime target for institutional accumulation before an upside expansion.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
