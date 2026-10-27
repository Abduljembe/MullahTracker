import React, { useEffect, useRef, memo } from 'react';
import { ExternalLink, AlertCircle, Sparkles } from 'lucide-react';

interface TradingViewWidgetProps {
  ticker: string;
  market: 'NSE' | 'US' | 'FOREX';
  timeframe?: string;
  height?: number | string;
  isFullscreen?: boolean;
  onSwitchToProRadar?: () => void;
}

// Convert app timeframe string to TradingView interval string
function mapTimeframeToTvInterval(tf?: string): string {
  if (!tf) return '15';
  if (tf === '1m') return '1';
  if (tf === '3m') return '3';
  if (tf === '5m') return '5';
  if (tf === '15m') return '15';
  if (tf === '30m') return '30';
  if (tf === '45m') return '45';
  if (tf === '1H') return '60';
  if (tf === '2H') return '120';
  if (tf === '4H') return '240';
  if (tf === '1D') return 'D';
  if (tf === '1W') return 'W';
  if (tf === '1M' || tf === '6M' || tf === '1Y' || tf === 'ALL') return 'M';
  return '15';
}

// Map app tickers to valid TradingView symbols
export function getTradingViewSymbol(ticker: string, market: 'NSE' | 'US' | 'FOREX'): string | null {
  const clean = ticker.replace('/', '').toUpperCase();

  // Forex & Precious Metals mappings
  if (market === 'FOREX') {
    if (clean === 'XAUUSD') return 'OANDA:XAUUSD'; // Exact match to user's OANDA chart
    if (clean === 'EURUSD') return 'FX:EURUSD';
    if (clean === 'GBPUSD') return 'FX:GBPUSD';
    if (clean === 'USDJPY') return 'FX:USDJPY';
    if (clean === 'USDKES') return 'FX_IDC:USDKES';
    if (clean === 'GBPKES') return 'FX_IDC:GBPKES';
    if (clean === 'EURKES') return 'FX_IDC:EURKES';
    if (clean === 'AUDUSD') return 'FX:AUDUSD';
    if (clean === 'USDCAD') return 'FX:USDCAD';
    return `FX:${clean}`;
  }

  // US Stocks mappings
  if (market === 'US') {
    if (['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META'].includes(clean)) {
      return `NASDAQ:${clean}`;
    }
    return `NYSE:${clean}`;
  }

  // NSE (Nairobi Securities Exchange) - Not available on TradingView public embed
  return null;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
  ticker,
  market,
  timeframe = '15m',
  height = 500,
  isFullscreen = false,
  onSwitchToProRadar,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvSymbol = getTradingViewSymbol(ticker, market);
  const tvInterval = mapTimeframeToTvInterval(timeframe);

  useEffect(() => {
    if (!tvSymbol || !containerRef.current) return;

    // Clear previous children
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: 'Africa/Nairobi',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      studies: ['STD;RSI'],
      support_host: 'https://www.tradingview.com',
      backgroundColor: 'rgba(7, 11, 20, 1)',
      gridColor: 'rgba(20, 32, 54, 0.4)',
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, tvInterval]);

  if (!tvSymbol) {
    return (
      <div
        className="w-full rounded-2xl border border-[#142036] bg-[#070b14] flex flex-col items-center justify-center p-8 text-center"
        style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {ticker} is an NSE Local Market Asset
        </h3>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Nairobi Securities Exchange equities are tracked through NjiaFedha&apos;s native East African data engine. Switch to <span className="text-[#0df2c9] font-medium">NjiaFedha Pro Radar</span> to view full candlestick charts, AI trend signals, and risk analytics.
        </p>
        {onSwitchToProRadar && (
          <button
            onClick={onSwitchToProRadar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-emerald-500 text-[#070b14] font-bold text-sm shadow-lg shadow-[#0df2c9]/20 hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Switch to NjiaFedha Pro Radar
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[#142036] bg-[#070b14] shadow-2xl"
      style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
    >
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-[#070b14]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-[#1a2942] text-[11px] font-mono text-slate-300 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-bold text-[#0df2c9]">TRADINGVIEW REAL-TIME FEED</span>
        <span className="text-slate-500">({tvSymbol})</span>
      </div>

      <div
        ref={containerRef}
        className="tradingview-widget-container w-full h-full"
      />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';
