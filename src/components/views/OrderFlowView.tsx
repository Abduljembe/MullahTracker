import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe2,
  Crosshair,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';
import { OrderFlowLiquidityDesk } from '../common/OrderFlowLiquidityDesk.tsx';

interface AssetPreset {
  ticker: string;
  name: string;
  market: 'FOREX' | 'NSE' | 'US';
  currency: string;
  price: number;
}

const ASSET_PRESETS: AssetPreset[] = [
  { ticker: 'EUR/USD', name: 'Euro / US Dollar', market: 'FOREX', currency: 'USD', price: 1.0865 },
  { ticker: 'USD/KES', name: 'US Dollar / Kenyan Shilling', market: 'FOREX', currency: 'KES', price: 129.50 },
  { ticker: 'GBP/USD', name: 'British Pound / US Dollar', market: 'FOREX', currency: 'USD', price: 1.2980 },
  { ticker: 'USD/JPY', name: 'US Dollar / Japanese Yen', market: 'FOREX', currency: 'JPY', price: 152.45 },
  { ticker: 'XAU/USD', name: 'Spot Gold / US Dollar', market: 'FOREX', currency: 'USD', price: 4056.48 },
  { ticker: 'GBP/KES', name: 'British Pound / Kenyan Shilling', market: 'FOREX', currency: 'KES', price: 168.20 },
  { ticker: 'SCOM', name: 'Safaricom PLC', market: 'NSE', currency: 'KES', price: 17.65 },
  { ticker: 'EQTY', name: 'Equity Group Holdings', market: 'NSE', currency: 'KES', price: 44.80 },
  { ticker: 'KCB', name: 'KCB Group PLC', market: 'NSE', currency: 'KES', price: 34.25 },
  { ticker: 'EABL', name: 'East African Breweries Ltd', market: 'NSE', currency: 'KES', price: 142.50 },
];

export const OrderFlowView: React.FC = () => {
  const { setActiveTab } = useFinance();
  const [selectedAsset, setSelectedAsset] = useState<AssetPreset>(ASSET_PRESETS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = searchQuery.trim()
    ? ASSET_PRESETS.filter(
        (a) =>
          a.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ASSET_PRESETS;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0a182c] via-[#091526] to-[#060c18] border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-[#0df2c9] shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
                Institutional Market Depth
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
                LEVEL 2 & VOLUME PROFILE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-0.5">
              Order Flow & Liquidity Radar
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Inspect where institutional banks and market participants are heavily buying and selling. Track horizontal Point of Control (POC), fresh order blocks, and retail stop hunt clusters.
            </p>
          </div>
        </div>

        {/* Quick Return to Terminal */}
        <button
          onClick={() => setActiveTab('stocks')}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[#0e1c33] hover:bg-[#152a4d] border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
        >
          <span>Open Full Terminal & Chart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Asset Selector Strip */}
      <div className="p-3 rounded-2xl bg-[#091120] border border-[#162744] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 font-bold text-[11px] mr-1 hidden sm:inline">
            Active Asset:
          </span>
          {filteredPresets.map((asset) => (
            <button
              key={asset.ticker}
              onClick={() => setSelectedAsset(asset)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedAsset.ticker === asset.ticker
                  ? 'bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20'
                  : 'bg-[#060c18] text-slate-300 hover:text-white border border-[#132238]'
              }`}
            >
              {asset.ticker}
            </button>
          ))}
        </div>

        {/* Filter / Search input */}
        <div className="relative w-full sm:w-48 text-xs font-mono">
          <input
            type="text"
            placeholder="Search currency / stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-[#060c18] border border-[#14233c] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Main Order Flow Liquidity Desk */}
      <OrderFlowLiquidityDesk
        currentTicker={selectedAsset.ticker}
        currentPrice={selectedAsset.price}
        currency={selectedAsset.currency}
        onApplyZoneToOrder={(_entry, _sl, _tp) => {
          setActiveTab('stocks');
        }}
      />
    </div>
  );
};
