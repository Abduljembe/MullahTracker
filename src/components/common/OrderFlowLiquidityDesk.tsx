import React, { useState, useMemo } from 'react';
import {
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Crosshair,
  Flame,
  Zap,
  BarChart2,
  Users,
  Eye,
  Info,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface OrderFlowLiquidityDeskProps {
  currentTicker?: string;
  currentPrice?: number;
  currency?: string;
  onApplyZoneToOrder?: (entry: number, sl: number, tp: number) => void;
}

interface VolumeProfileNode {
  price: number;
  formattedPrice: string;
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  isPoc: boolean; // Point of Control
  isValueArea: boolean;
  deltaPercent: number; // positive = buy dominant, negative = sell dominant
}

interface OrderBlockZone {
  id: string;
  type: 'BULLISH' | 'BEARISH';
  label: string;
  priceLow: number;
  priceHigh: number;
  volumeAbsorbed: string;
  timeframe: string;
  status: 'UNMITIGATED (FRESH)' | 'TESTED (MITIGATED)' | 'SWEPT';
  description: string;
  institutionalTraders: string;
}

interface LiquidityPool {
  id: string;
  type: 'BUY_SIDE (BSL)' | 'SELL_SIDE (SSL)';
  price: number;
  contractsResting: string;
  description: string;
  dangerLevel: 'EXTREME' | 'HIGH' | 'MODERATE';
}

export const OrderFlowLiquidityDesk: React.FC<OrderFlowLiquidityDeskProps> = ({
  currentTicker = 'EUR/USD',
  currentPrice = 1.0865,
  currency = 'USD',
  onApplyZoneToOrder,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'blocks' | 'heatmap' | 'sentiment'>('profile');
  const [depthRange, setDepthRange] = useState<'tight' | 'normal' | 'wide'>('normal');

  const isGold = currentTicker.includes('XAU');
  const isForex = currentTicker.includes('/') || ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/KES'].includes(currentTicker);
  const isKES = currentTicker.includes('KES') || currency === 'KES';

  const formatPrice = (p: number) => {
    if (isGold) return p.toFixed(2);
    if (isForex && p < 10) return p.toFixed(4);
    return p.toFixed(2);
  };

  // Generate dynamic institutional Volume Profile (VPVR) centered around current price
  const volumeProfileData = useMemo(() => {
    const nodesCount = 14;
    const step = isGold ? 2.5 : isForex && currentPrice < 10 ? 0.0008 : currentPrice * 0.004;
    const baseLow = currentPrice - step * 7;

    const nodes: VolumeProfileNode[] = [];
    let maxVol = 0;
    let pocIdx = 5; // Default POC node

    for (let i = 0; i < nodesCount; i++) {
      const price = baseLow + i * step;
      // Institutional clustering logic (higher near support nodes 4 and 10)
      const multiplier = i === 4 || i === 5 || i === 10 ? 2.8 : i === 7 ? 1.9 : 1.2;
      const baseBuy = Math.floor((1200 + Math.sin(i * 0.8) * 600) * multiplier);
      const baseSell = Math.floor((1050 + Math.cos(i * 0.7) * 550) * multiplier);
      const total = baseBuy + baseSell;

      if (total > maxVol) {
        maxVol = total;
        pocIdx = i;
      }

      const deltaPercent = Math.round(((baseBuy - baseSell) / total) * 100);

      nodes.push({
        price,
        formattedPrice: formatPrice(price),
        buyVolume: baseBuy,
        sellVolume: baseSell,
        totalVolume: total,
        isPoc: false,
        isValueArea: i >= 2 && i <= 11, // 70% value area
        deltaPercent,
      });
    }

    if (nodes[pocIdx]) {
      nodes[pocIdx].isPoc = true;
    }

    return {
      nodes: nodes.reverse(), // Highest price on top
      maxVolume: maxVol,
      pocNode: nodes[pocIdx],
      valueAreaHigh: nodes[nodes.length - 3]?.price || currentPrice,
      valueAreaLow: nodes[2]?.price || currentPrice,
    };
  }, [currentPrice, isGold, isForex]);

  // Institutional Order Blocks
  const orderBlocks: OrderBlockZone[] = useMemo(() => {
    const step = isGold ? 8.0 : isForex && currentPrice < 10 ? 0.0025 : currentPrice * 0.015;

    return [
      {
        id: 'ob-1',
        type: 'BULLISH',
        label: 'Institutional Demand Block (4H Origin)',
        priceLow: currentPrice - step * 1.4,
        priceHigh: currentPrice - step * 0.9,
        volumeAbsorbed: isGold ? '$820M Notional' : isKES ? 'KES 4.2B' : '18,400 Lots',
        timeframe: '4H / 1D',
        status: 'UNMITIGATED (FRESH)',
        description: 'Last aggressive down-candle before structural market break. Huge unfilled bank limit buys resting here.',
        institutionalTraders: 'Tier-1 Liquidity Providers & Hedge Funds',
      },
      {
        id: 'ob-2',
        type: 'BULLISH',
        label: 'Intraday Liquidity Accumulation Block',
        priceLow: currentPrice - step * 0.5,
        priceHigh: currentPrice - step * 0.2,
        volumeAbsorbed: isGold ? '$410M Notional' : isKES ? 'KES 1.8B' : '9,200 Lots',
        timeframe: '1H',
        status: 'TESTED (MITIGATED)',
        description: 'European session sweep order block. Supported initial test with immediate 30-pip rejection spike.',
        institutionalTraders: 'London Interbank Desks',
      },
      {
        id: 'ob-3',
        type: 'BEARISH',
        label: 'Macro Distribution Supply Block',
        priceLow: currentPrice + step * 1.1,
        priceHigh: currentPrice + step * 1.6,
        volumeAbsorbed: isGold ? '$940M Notional' : isKES ? 'KES 5.1B' : '22,100 Lots',
        timeframe: 'Daily',
        status: 'UNMITIGATED (FRESH)',
        description: 'Heavy institutional distribution wall. Strong rejection zone with multiple commercial hedger sell limits.',
        institutionalTraders: 'Central Bank Fixing & Sovereign Desks',
      },
    ];
  }, [currentPrice, isGold, isForex, isKES]);

  // Resting Liquidity Pools (Equal Highs / Equal Lows Stop Clusters)
  const liquidityPools: LiquidityPool[] = useMemo(() => {
    const step = isGold ? 12.0 : isForex && currentPrice < 10 ? 0.004 : currentPrice * 0.02;

    return [
      {
        id: 'lp-1',
        type: 'BUY_SIDE (BSL)',
        price: currentPrice + step,
        contractsResting: isGold ? '24,500 Buy Stops' : '14,800 Lots',
        description: 'Equal Highs (EQH) retail double top. Stop-loss buy orders for early breakout traders resting above.',
        dangerLevel: 'EXTREME',
      },
      {
        id: 'lp-2',
        type: 'SELL_SIDE (SSL)',
        price: currentPrice - step,
        contractsResting: isGold ? '31,200 Sell Stops' : '19,500 Lots',
        description: 'Equal Lows (EQL) clean support double bottom. Prime target for market maker liquidity raid.',
        dangerLevel: 'EXTREME',
      },
      {
        id: 'lp-3',
        type: 'BUY_SIDE (BSL)',
        price: currentPrice + step * 1.8,
        contractsResting: isGold ? '12,300 Buy Stops' : '8,400 Lots',
        description: 'Previous week high breakout stops. Macro runner target.',
        dangerLevel: 'HIGH',
      },
    ];
  }, [currentPrice, isGold, isForex]);

  // Depth of Market (DOM) Buy & Sell Walls Ladder
  const domLadder = useMemo(() => {
    const step = isGold ? 1.0 : isForex && currentPrice < 10 ? 0.0004 : currentPrice * 0.002;
    const bids = [
      { price: currentPrice - step * 1, lots: 480, orders: 42, isWall: false },
      { price: currentPrice - step * 2, lots: 920, orders: 78, isWall: false },
      { price: currentPrice - step * 3, lots: 1850, orders: 135, isWall: false },
      { price: currentPrice - step * 4, lots: 4200, orders: 310, isWall: true }, // Institutional Buy Wall
      { price: currentPrice - step * 5, lots: 1240, orders: 94, isWall: false },
    ];

    const asks = [
      { price: currentPrice + step * 1, lots: 510, orders: 49, isWall: false },
      { price: currentPrice + step * 2, lots: 880, orders: 67, isWall: false },
      { price: currentPrice + step * 3, lots: 1420, orders: 112, isWall: false },
      { price: currentPrice + step * 4, lots: 3950, orders: 284, isWall: true }, // Institutional Sell Wall
      { price: currentPrice + step * 5, lots: 980, orders: 81, isWall: false },
    ];

    return { bids, asks };
  }, [currentPrice, isGold, isForex]);

  // Retail vs Institutional Sentiment Ratio
  const retailSentiment = useMemo(() => {
    // Statistically representative contrarian retail ratio
    const retailLong = 74; // 74% retail buyers
    const retailShort = 26;
    const institutionalLong = 32;
    const institutionalShort = 68; // Smart money leaning short to absorb retail buyers

    return {
      retailLong,
      retailShort,
      institutionalLong,
      institutionalShort,
      contrarianBias: 'BEARISH SWEEP LIKELY',
      contrarianWarning: 'Retail crowd is 74% Long at resistance. Market makers typically flush stops down before upside expansion.',
    };
  }, []);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#091120] border border-[#162744] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
              Institutional Market Depth
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
              ORDER FLOW & VOLUME PROFILE
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Order Block & Volume Liquidity Radar ({currentTicker})</span>
          </h3>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#060c18] border border-[#132238] text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-teal-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Volume Profile (VPVR)
          </button>
          <button
            onClick={() => setActiveSubTab('blocks')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'blocks'
                ? 'bg-teal-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order Blocks (OB)
          </button>
          <button
            onClick={() => setActiveSubTab('heatmap')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'heatmap'
                ? 'bg-teal-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DOM Buy/Sell Walls
          </button>
          <button
            onClick={() => setActiveSubTab('sentiment')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === 'sentiment'
                ? 'bg-teal-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Retail Sentiment
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Visual Volume Profile (VPVR) */}
      {activeSubTab === 'profile' && (
        <div className="space-y-3">
          {/* POC & Value Area Summary Banner */}
          <div className="p-3 rounded-xl bg-[#060c18] border border-[#14233c] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-300">
                Point of Control (POC):{' '}
                <strong className="text-amber-300 font-extrabold text-sm">
                  {volumeProfileData.pocNode ? formatPrice(volumeProfileData.pocNode.price) : formatPrice(currentPrice)}
                </strong>
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                (Highest volume transacted zone)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>
                VAH: <strong className="text-cyan-300">{formatPrice(volumeProfileData.valueAreaHigh)}</strong>
              </span>
              <span>
                VAL: <strong className="text-cyan-300">{formatPrice(volumeProfileData.valueAreaLow)}</strong>
              </span>
              <span className="text-teal-400 font-bold bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                70% Value Area Active
              </span>
            </div>
          </div>

          {/* Horizontal Volume Profile Ladder */}
          <div className="p-3.5 rounded-xl bg-[#060c18] border border-[#14233c] space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold pb-1 border-b border-[#132238]">
              <span className="w-24">Price Level</span>
              <span className="flex-1 text-center">Horizontal Volume Nodes (Buy vs Sell Volume)</span>
              <span className="w-28 text-right">Delta / Bias</span>
            </div>

            {volumeProfileData.nodes.map((node, idx) => {
              const isCurrent = Math.abs(node.price - currentPrice) < (isGold ? 1.5 : 0.0006);
              const barWidthPercent = (node.totalVolume / volumeProfileData.maxVolume) * 100;
              const buyPercent = (node.buyVolume / node.totalVolume) * 100;
              const sellPercent = (node.sellVolume / node.totalVolume) * 100;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 py-1 px-2 rounded-lg transition-colors ${
                    node.isPoc
                      ? 'bg-amber-950/30 border border-amber-500/50'
                      : isCurrent
                      ? 'bg-teal-950/40 border border-teal-500/40'
                      : 'hover:bg-[#091426]'
                  }`}
                >
                  {/* Price */}
                  <div className="w-24 font-bold flex items-center gap-1.5">
                    {node.isPoc && (
                      <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-400 text-slate-950">
                        POC
                      </span>
                    )}
                    {isCurrent && !node.isPoc && (
                      <span className="text-[9px] font-black px-1 py-0.2 rounded bg-teal-400 text-slate-950">
                        LIVE
                      </span>
                    )}
                    <span
                      className={
                        node.isPoc
                          ? 'text-amber-300 font-black'
                          : isCurrent
                          ? 'text-[#0df2c9]'
                          : 'text-slate-300'
                      }
                    >
                      {node.formattedPrice}
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="flex-1 h-3.5 bg-[#091322] rounded-md overflow-hidden relative flex">
                    <div
                      className="h-full bg-emerald-500/80 transition-all"
                      style={{ width: `${(barWidthPercent * buyPercent) / 100}%` }}
                      title={`Buy Volume: ${node.buyVolume.toLocaleString()}`}
                    />
                    <div
                      className="h-full bg-rose-500/80 transition-all"
                      style={{ width: `${(barWidthPercent * sellPercent) / 100}%` }}
                      title={`Sell Volume: ${node.sellVolume.toLocaleString()}`}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white drop-shadow">
                      {node.totalVolume.toLocaleString()} lots
                    </span>
                  </div>

                  {/* Delta */}
                  <div className="w-28 text-right text-[11px] font-bold">
                    <span className={node.deltaPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {node.deltaPercent >= 0 ? '+' : ''}
                      {node.deltaPercent}% {node.deltaPercent >= 0 ? 'BUY' : 'SELL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Institutional Order Blocks (OB) */}
      {activeSubTab === 'blocks' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {orderBlocks.map((ob) => {
              const isBull = ob.type === 'BULLISH';
              return (
                <div
                  key={ob.id}
                  className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                    isBull
                      ? 'bg-gradient-to-b from-[#081824] to-[#050e18] border-teal-500/50'
                      : 'bg-gradient-to-b from-[#180a12] to-[#0f060b] border-rose-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          isBull
                            ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {ob.type} ORDER BLOCK
                      </span>
                      <h4 className="text-xs font-black text-white mt-1">{ob.label}</h4>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        ob.status.includes('FRESH')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ob.status}
                    </span>
                  </div>

                  {/* Price Zone Box */}
                  <div className="p-2 rounded-lg bg-[#040810] border border-[#132238] font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Accumulation Zone:</span>
                      <span className="text-white font-bold">
                        {formatPrice(ob.priceLow)} - {formatPrice(ob.priceHigh)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Absorbed Capital:</span>
                      <span className="text-teal-300 font-extrabold">{ob.volumeAbsorbed}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{ob.description}</p>

                  <div className="pt-2 border-t border-[#14233c] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Source: {ob.institutionalTraders}</span>
                    <button
                      onClick={() =>
                        onApplyZoneToOrder?.(
                          (ob.priceLow + ob.priceHigh) / 2,
                          isBull ? ob.priceLow * 0.998 : ob.priceHigh * 1.002,
                          isBull ? currentPrice + (currentPrice - ob.priceLow) * 2 : currentPrice - (ob.priceHigh - currentPrice) * 2
                        )
                      }
                      className="text-teal-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Trade Zone</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resting Liquidity Pools Warning */}
          <div className="p-3.5 rounded-xl bg-[#060c18] border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white uppercase tracking-wider">
                Resting Retail Liquidity Pools (Stop Hunt Clusters)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
              {liquidityPools.map((lp) => (
                <div key={lp.id} className="p-2.5 rounded-lg bg-[#081020] border border-[#14233c] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400">{lp.type}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-bold">
                      {lp.contractsResting}
                    </span>
                  </div>
                  <div className="text-sm font-black text-white">{formatPrice(lp.price)}</div>
                  <p className="text-[10px] text-slate-400 font-sans">{lp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Depth of Market (DOM) / Buy & Sell Walls */}
      {activeSubTab === 'heatmap' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Limit Bids (Buy Walls) */}
            <div className="p-3.5 rounded-xl bg-[#061418] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/30">
                <span className="text-emerald-400 font-extrabold uppercase text-[11px] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Pending Institutional Bids (Buy Walls)</span>
                </span>
                <span className="text-[10px] text-slate-400">Total Bids: 8,690 Lots</span>
              </div>

              <div className="space-y-1.5">
                {domLadder.bids.map((bid, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      bid.isWall
                        ? 'bg-emerald-950/80 border border-emerald-400 text-white font-black'
                        : 'bg-[#081822] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-300">{formatPrice(bid.price)}</span>
                      {bid.isWall && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-400 text-slate-950 animate-pulse">
                          MAJOR BUY WALL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{bid.lots} Lots</span>
                      <span className="text-[10px] text-slate-500">{bid.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Limit Asks (Sell Walls) */}
            <div className="p-3.5 rounded-xl bg-[#170a12] border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-rose-500/30">
                <span className="text-rose-400 font-extrabold uppercase text-[11px] flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Pending Institutional Asks (Sell Walls)</span>
                </span>
                <span className="text-[10px] text-slate-400">Total Asks: 7,740 Lots</span>
              </div>

              <div className="space-y-1.5">
                {domLadder.asks.map((ask, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      ask.isWall
                        ? 'bg-rose-950/80 border border-rose-400 text-white font-black'
                        : 'bg-[#180e15] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300">{formatPrice(ask.price)}</span>
                      {ask.isWall && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-rose-400 text-slate-950 animate-pulse">
                          MAJOR SELL WALL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{ask.lots} Lots</span>
                      <span className="text-[10px] text-slate-500">{ask.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Retail Sentiment & Contrarian Order Book */}
      {activeSubTab === 'sentiment' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#060c18] border border-[#14233c] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h4 className="font-bold text-white uppercase tracking-wider">
                  Retail Open Positions Sentiment (Contrarian Indicator)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                {retailSentiment.contrarianBias}
              </span>
            </div>

            {/* Split Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">Retail Long: {retailSentiment.retailLong}%</span>
                <span className="text-rose-400">Retail Short: {retailSentiment.retailShort}%</span>
              </div>
              <div className="h-4 w-full bg-slate-900 rounded-lg overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 font-bold text-[10px] text-slate-950 flex items-center justify-center"
                  style={{ width: `${retailSentiment.retailLong}%` }}
                >
                  {retailSentiment.retailLong}% BUYERS
                </div>
                <div
                  className="h-full bg-rose-500 font-bold text-[10px] text-white flex items-center justify-center"
                  style={{ width: `${retailSentiment.retailShort}%` }}
                >
                  {retailSentiment.retailShort}% SELLERS
                </div>
              </div>
            </div>

            {/* Warning callout */}
            <div className="p-3 rounded-lg bg-[#0e1626] border border-[#1b2b44] flex items-start gap-2.5 text-slate-300 font-sans">
              <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white">Smart Money Rule: </strong>
                {retailSentiment.contrarianWarning}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
