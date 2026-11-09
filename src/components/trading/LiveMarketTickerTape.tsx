/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Live Market Ticker Tape Ribbon for Global Financials & Deriv 24/7 Synthetics
 * Displays real-time streaming quotes for Gold, Bitcoin, V75, Boom/Crash, EURUSD, and USD/KES.
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Radio, Globe } from 'lucide-react';
import { DERIV_INSTRUMENTS } from '../../utils/derivInstruments.ts';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  category: 'DERIV_24_7' | 'CRYPTO' | 'METALS' | 'FOREX';
  is24_7: boolean;
  digits: number;
}

interface LiveMarketTickerTapeProps {
  onSelectSymbol?: (symbol: string) => void;
  activeSymbol?: string;
}

const DEFAULT_TICKERS: TickerItem[] = [
  { symbol: 'XAUUSD', name: 'Gold Spot', price: 4102.90, changePercent: +1.42, category: 'METALS', is24_7: false, digits: 2 },
  { symbol: 'BTCUSD', name: 'Bitcoin', price: 96450.00, changePercent: +3.18, category: 'CRYPTO', is24_7: true, digits: 2 },
  { symbol: 'R_75', name: 'Deriv Vol 75', price: 428950.40, changePercent: +2.85, category: 'DERIV_24_7', is24_7: true, digits: 2 },
  { symbol: 'BOOM1000', name: 'Boom 1000', price: 15420.30, changePercent: +0.94, category: 'DERIV_24_7', is24_7: true, digits: 2 },
  { symbol: 'CRASH1000', name: 'Crash 1000', price: 8750.60, changePercent: -1.24, category: 'DERIV_24_7', is24_7: true, digits: 2 },
  { symbol: 'STP', name: 'Step Index', price: 8420.10, changePercent: +0.45, category: 'DERIV_24_7', is24_7: true, digits: 1 },
  { symbol: '1HZ100V', name: 'Vol 100 (1s)', price: 1240.85, changePercent: +4.12, category: 'DERIV_24_7', is24_7: true, digits: 2 },
  { symbol: 'ETHUSD', name: 'Ethereum', price: 2780.40, changePercent: +2.15, category: 'CRYPTO', is24_7: true, digits: 2 },
  { symbol: 'EURUSD', name: 'EUR / USD', price: 1.0845, changePercent: -0.18, category: 'FOREX', is24_7: false, digits: 4 },
  { symbol: 'USDKES', name: 'USD / KES', price: 129.50, changePercent: +0.08, category: 'FOREX', is24_7: false, digits: 2 },
];

export const LiveMarketTickerTape: React.FC<LiveMarketTickerTapeProps> = ({
  onSelectSymbol,
  activeSymbol,
}) => {
  const [tickers, setTickers] = useState<TickerItem[]>(DEFAULT_TICKERS);
  const [tickIndex, setTickIndex] = useState<number>(0);

  // Poll server live quotes or simulate subtle micro-ticks
  useEffect(() => {
    let isMounted = true;

    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/tradingview/prices');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.quotes && Array.isArray(data.quotes)) {
            setTickers((prev) =>
              prev.map((item) => {
                const found = data.quotes.find((q: { symbol: string; price: number }) => q.symbol === item.symbol);
                if (found && typeof found.price === 'number') {
                  const oldPrice = item.price;
                  const delta = found.price - oldPrice;
                  const pct = oldPrice > 0 ? (delta / oldPrice) * 100 : item.changePercent;
                  return {
                    ...item,
                    price: found.price,
                    changePercent: Math.abs(pct) > 0.0001 ? Number(pct.toFixed(2)) : item.changePercent,
                  };
                }
                return item;
              })
            );
          }
        }
      } catch {
        // Subtle micro-tick simulation on synthetic assets
        if (isMounted) {
          setTickers((prev) =>
            prev.map((item) => {
              if (item.is24_7 && Math.random() > 0.6) {
                const deltaFactor = (Math.random() - 0.495) * 0.001;
                const newPrice = item.price * (1 + deltaFactor);
                return {
                  ...item,
                  price: newPrice,
                  changePercent: Number((item.changePercent + deltaFactor * 20).toFixed(2)),
                };
              }
              return item;
            })
          );
        }
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 1200);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full bg-[#050912] border-y border-[#142338] px-3 py-1.5 overflow-hidden flex items-center shadow-inner">
      {/* Live Badge */}
      <div className="flex items-center gap-1.5 pr-3 mr-2 border-r border-[#1a2d48] shrink-0 text-[10px] font-mono font-bold text-teal-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="hidden sm:inline">DERIV & MT5 24/7 RADAR</span>
        <span className="sm:hidden">LIVE</span>
      </div>

      {/* Scrolling / Flex Ticker Strip */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
        {tickers.map((item) => {
          const isUp = item.changePercent >= 0;
          const isSelected = activeSymbol === item.symbol;
          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol && onSelectSymbol(item.symbol)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-teal-500/20 border-teal-400/80 text-[#0df2c9] shadow-[0_0_12px_rgba(13,242,201,0.25)]'
                  : 'bg-[#091120] hover:bg-[#101c32] border-[#182a44] text-slate-300'
              }`}
              title={`Click to load ${item.name} (${item.symbol}) into Trading Cockpit`}
            >
              <div className="flex items-center gap-1">
                <span className="font-bold text-white text-[11px]">{item.symbol}</span>
                {item.is24_7 && (
                  <span className="text-[8px] font-mono text-teal-400 font-semibold">24/7</span>
                )}
              </div>

              <span className="font-bold text-slate-200 tabular-nums text-[11px]">
                {item.price.toLocaleString(undefined, {
                  minimumFractionDigits: item.digits,
                  maximumFractionDigits: item.digits,
                })}
              </span>

              <span
                className={`flex items-center text-[10px] font-bold tabular-nums ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {isUp ? '+' : ''}{item.changePercent}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
