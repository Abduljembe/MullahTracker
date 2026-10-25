import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  IChartApi,
  ISeriesApi,
  Time,
  IPriceLine,
} from 'lightweight-charts';
import { Candle, Timeframe } from '../../utils/stockCandles.ts';
import { MarketSessionInfo } from '../../utils/marketHours.ts';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  Layers,
  Sliders,
  TrendingUp,
  Tag,
  Trash2,
  ChevronRight,
  Info,
} from 'lucide-react';

export type ChartStyleType = 'candles' | 'hollow' | 'line' | 'area' | 'bars';

interface CandlestickChartProps {
  candles: Candle[];
  currency: string;
  ticker: string;
  timeframe: Timeframe;
  isMarketLive?: boolean;
  marketSession?: MarketSessionInfo;
  chartType?: 'candlestick' | 'line';
  onChartTypeChange?: (type: 'candlestick' | 'line') => void;
}

interface LegendValues {
  timeLabel: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePct: number;
  isBullish: boolean;
  ema20?: number;
  ema50?: number;
  bbUpper?: number;
  bbLower?: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  currency,
  ticker,
  timeframe,
  isMarketLive = false,
  marketSession,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any, Time> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<any, Time> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<any, Time> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<any, Time> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<any, Time> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<any, Time> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Chart configuration state
  const [chartStyle, setChartStyle] = useState<ChartStyleType>('candles');
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showEma20, setShowEma20] = useState<boolean>(false);
  const [showEma50, setShowEma50] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [priceLineAlerts, setPriceLineAlerts] = useState<number[]>([]);

  // Dynamic Hover Legend state
  const latestCandle = candles[candles.length - 1];
  const [legend, setLegend] = useState<LegendValues | null>(null);

  // Sync legend with latest candle when candles change
  useEffect(() => {
    if (!latestCandle) return;
    const change = latestCandle.close - latestCandle.open;
    const changePct = latestCandle.open > 0 ? (change / latestCandle.open) * 100 : 0;
    setLegend({
      timeLabel: latestCandle.fullDate || latestCandle.timeLabel,
      open: latestCandle.open,
      high: latestCandle.high,
      low: latestCandle.low,
      close: latestCandle.close,
      volume: latestCandle.volume,
      change,
      changePct,
      isBullish: change >= 0,
      ema20: latestCandle.ema20,
      ema50: latestCandle.ema50,
      bbUpper: latestCandle.bbUpper,
      bbLower: latestCandle.bbLower,
    });
  }, [candles, latestCandle]);

  // Main Chart Initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean previous instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    // Create TradingView Chart instance
    const chart = createChart(container, {
      width: container.clientWidth || 700,
      height: isFullscreen ? window.innerHeight - 130 : 440,
      layout: {
        background: { type: ColorType.Solid, color: '#070b14' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: '#0f172a', style: LineStyle.Dotted },
        horzLines: { color: '#0f172a', style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0284c7',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0284c7',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
        scaleMargins: {
          top: 0.08,
          bottom: showVolume ? 0.22 : 0.08,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 9,
        minBarSpacing: 3,
        rightOffset: 8,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // 1. Add Main Series based on selected chart style
    let mainSeries: ISeriesApi<any, Time>;
    if (chartStyle === 'candles') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
    } else if (chartStyle === 'hollow') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: 'transparent',
        downColor: '#f43f5e',
        borderVisible: true,
        borderColor: '#10b981',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
    } else if (chartStyle === 'area') {
      mainSeries = chart.addSeries(AreaSeries, {
        lineColor: '#0df2c9',
        topColor: 'rgba(13, 242, 201, 0.35)',
        bottomColor: 'rgba(13, 242, 201, 0.0)',
        lineWidth: 2,
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          value: c.close,
        }))
      );
    } else if (chartStyle === 'bars') {
      mainSeries = chart.addSeries(BarSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
    } else {
      // Line
      mainSeries = chart.addSeries(LineSeries, {
        color: '#0df2c9',
        lineWidth: 2,
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          value: c.close,
        }))
      );
    }
    mainSeriesRef.current = mainSeries;

    // 2. Add Volume Histogram
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.78,
          bottom: 0,
        },
      });
      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
        }))
      );
      volumeSeriesRef.current = volumeSeries;
    }

    // 3. Technical Indicators: EMA 20
    if (showEma20) {
      const ema20Series = chart.addSeries(LineSeries, {
        color: '#38bdf8',
        lineWidth: 2,
        priceLineVisible: false,
        title: 'EMA 20',
      });
      ema20Series.setData(
        candles
          .filter((c) => c.ema20 !== undefined)
          .map((c) => ({
            time: c.time as Time,
            value: c.ema20!,
          }))
      );
      ema20SeriesRef.current = ema20Series;
    }

    // 4. Technical Indicators: EMA 50
    if (showEma50) {
      const ema50Series = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
        priceLineVisible: false,
        title: 'EMA 50',
      });
      ema50Series.setData(
        candles
          .filter((c) => c.ema50 !== undefined)
          .map((c) => ({
            time: c.time as Time,
            value: c.ema50!,
          }))
      );
      ema50SeriesRef.current = ema50Series;
    }

    // 5. Technical Indicators: Bollinger Bands
    if (showBollinger) {
      const bbUpper = chart.addSeries(LineSeries, {
        color: '#a855f7',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        title: 'BB Upper',
      });
      bbUpper.setData(
        candles
          .filter((c) => c.bbUpper !== undefined)
          .map((c) => ({
            time: c.time as Time,
            value: c.bbUpper!,
          }))
      );
      bbUpperSeriesRef.current = bbUpper;

      const bbLower = chart.addSeries(LineSeries, {
        color: '#a855f7',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        title: 'BB Lower',
      });
      bbLower.setData(
        candles
          .filter((c) => c.bbLower !== undefined)
          .map((c) => ({
            time: c.time as Time,
            value: c.bbLower!,
          }))
      );
      bbLowerSeriesRef.current = bbLower;
    }

    // 6. Restore user custom price alert lines
    priceLinesRef.current = [];
    priceLineAlerts.forEach((price) => {
      const line = mainSeries.createPriceLine({
        price,
        color: '#0df2c9',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Target ${currency} ${price}`,
      });
      priceLinesRef.current.push(line);
    });

    // 7. Subscribe to Crosshair Move Event (TradingView Interactive Legend)
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || param.point === undefined) {
        // Restore latest candle
        if (latestCandle) {
          const change = latestCandle.close - latestCandle.open;
          const changePct = latestCandle.open > 0 ? (change / latestCandle.open) * 100 : 0;
          setLegend({
            timeLabel: latestCandle.fullDate || latestCandle.timeLabel,
            open: latestCandle.open,
            high: latestCandle.high,
            low: latestCandle.low,
            close: latestCandle.close,
            volume: latestCandle.volume,
            change,
            changePct,
            isBullish: change >= 0,
            ema20: latestCandle.ema20,
            ema50: latestCandle.ema50,
            bbUpper: latestCandle.bbUpper,
            bbLower: latestCandle.bbLower,
          });
        }
        return;
      }

      // Find matching candle in dataset
      const hoveredCandle = candles.find((c) => c.time === param.time);
      if (hoveredCandle) {
        const change = hoveredCandle.close - hoveredCandle.open;
        const changePct = hoveredCandle.open > 0 ? (change / hoveredCandle.open) * 100 : 0;
        setLegend({
          timeLabel: hoveredCandle.fullDate || hoveredCandle.timeLabel,
          open: hoveredCandle.open,
          high: hoveredCandle.high,
          low: hoveredCandle.low,
          close: hoveredCandle.close,
          volume: hoveredCandle.volume,
          change,
          changePct,
          isBullish: change >= 0,
          ema20: hoveredCandle.ema20,
          ema50: hoveredCandle.ema50,
          bbUpper: hoveredCandle.bbUpper,
          bbLower: hoveredCandle.bbLower,
        });
      }
    });

    // Fit content on initial load
    chart.timeScale().fitContent();

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 130 : 440,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [
    candles,
    chartStyle,
    showVolume,
    showEma20,
    showEma50,
    showBollinger,
    isFullscreen,
    priceLineAlerts,
    currency,
  ]);

  // TradingView Control Handlers
  const handleFitContent = () => {
    chartRef.current?.timeScale().fitContent();
  };

  const handleZoomIn = () => {
    const timeScale = chartRef.current?.timeScale();
    if (!timeScale) return;
    const currentSpacing = timeScale.options().barSpacing || 9;
    timeScale.applyOptions({ barSpacing: Math.min(40, currentSpacing * 1.3) });
  };

  const handleZoomOut = () => {
    const timeScale = chartRef.current?.timeScale();
    if (!timeScale) return;
    const currentSpacing = timeScale.options().barSpacing || 9;
    timeScale.applyOptions({ barSpacing: Math.max(3, currentSpacing * 0.75) });
  };

  const handleScrollToRealtime = () => {
    chartRef.current?.timeScale().scrollToRealTime();
  };

  // Add Support/Resistance price line alert
  const handleAddPriceLine = () => {
    if (!latestCandle || !mainSeriesRef.current) return;
    const newPrice = Math.round(latestCandle.close * 1.05 * 100) / 100;
    setPriceLineAlerts((prev) => [...prev, newPrice]);
  };

  const handleClearPriceLines = () => {
    setPriceLineAlerts([]);
  };

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (p >= 10) return p.toFixed(2);
    return p.toFixed(3);
  };

  const formatVol = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
  };

  return (
    <div
      className={`space-y-2 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#070b14] p-5 overflow-auto flex flex-col justify-between'
          : 'relative'
      }`}
    >
      {/* TradingView Top Functional Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#080e18] border border-[#142036] text-xs">
        {/* Left Side: Ticker, Chart Styles, and Indicators */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Ticker badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0f172a] border border-[#1e293b] font-mono">
            <span className={`w-2 h-2 rounded-full ${isMarketLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-bold text-white">{ticker}</span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] text-teal-300 font-semibold uppercase">{timeframe}</span>
          </div>

          {/* Live / Closed Market Session Pill */}
          {isMarketLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 font-mono text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE</span>
              <span className="hidden sm:inline text-emerald-400/80 font-normal">• Session Open</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-400 font-mono text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              <span>CLOSED</span>
              <span className="hidden sm:inline text-slate-500 font-normal">• {marketSession?.nextSessionText || 'Session Inactive'}</span>
            </div>
          )}

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-[#050912] p-0.5 rounded-lg border border-[#162540]">
            {(
              [
                { id: 'candles', label: '🕯️ Candles' },
                { id: 'hollow', label: '🕯️ Hollow' },
                { id: 'line', label: '📈 Line' },
                { id: 'area', label: '🏔️ Area' },
                { id: 'bars', label: '📊 Bars' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setChartStyle(st.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  chartStyle === st.id
                    ? 'bg-teal-500/20 text-[#0df2c9] font-bold border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Technical Indicators Toggle Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[#050912] p-0.5 rounded-lg border border-[#162540]">
            <button
              onClick={() => setShowEma20((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                showEma20
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="20-period Exponential Moving Average"
            >
              EMA 20
            </button>
            <button
              onClick={() => setShowEma50((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                showEma50
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="50-period Exponential Moving Average"
            >
              EMA 50
            </button>
            <button
              onClick={() => setShowBollinger((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                showBollinger
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bollinger Bands (20, 2)"
            >
              BBands
            </button>
            <button
              onClick={() => setShowVolume((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                showVolume
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Volume Bars"
            >
              Vol
            </button>
          </div>
        </div>

        {/* Right Side: Tools (Zoom, Fit, Alert Lines, Fullscreen) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleAddPriceLine}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e1726] hover:bg-[#14233a] border border-[#1b2b45] text-[11px] text-teal-300 hover:text-white transition-colors cursor-pointer"
            title="Place horizontal target/alert price level"
          >
            <Tag className="w-3 h-3" />
            <span className="hidden sm:inline">+ Price Level</span>
          </button>

          {priceLineAlerts.length > 0 && (
            <button
              onClick={handleClearPriceLines}
              className="p-1 rounded-lg bg-[#0e1726] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-[#1b2b45] transition-colors cursor-pointer"
              title="Clear added price levels"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-[#1c2c47] mx-0.5" />

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#15233c] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom In (Scroll/Pinch also supported)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#15233c] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFitContent}
            className="p-1.5 rounded-lg bg-[#0e1726] hover:bg-[#15233c] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset / Auto-fit Time & Price Range"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-white border border-teal-500/30 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen TradingView Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive TradingView Canvas Container with Legend Overlay */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#142036] bg-[#070b14] shadow-inner">
        {/* Dynamic TradingView Overlay Legend */}
        <div className="absolute top-2.5 left-3 z-10 pointer-events-none space-y-1">
          {/* Main OHLC HUD */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-slate-300 bg-[#070b14]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#162540]">
            <span className="text-white font-sans font-bold flex items-center gap-1.5">
              <span>{ticker}</span>
              <span className="text-slate-500 font-normal">({timeframe})</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isMarketLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isMarketLive ? '● LIVE' : '○ CLOSED'}
              </span>
            </span>

            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{legend?.timeLabel}</span>

            <div className="flex items-center gap-2">
              <span>
                <span className="text-slate-500">O</span>{' '}
                <span className="text-white font-semibold">{formatPrice(legend?.open || 0)}</span>
              </span>
              <span>
                <span className="text-slate-500">H</span>{' '}
                <span className="text-emerald-400 font-semibold">{formatPrice(legend?.high || 0)}</span>
              </span>
              <span>
                <span className="text-slate-500">L</span>{' '}
                <span className="text-rose-400 font-semibold">{formatPrice(legend?.low || 0)}</span>
              </span>
              <span>
                <span className="text-slate-500">C</span>{' '}
                <span
                  className={`font-bold ${
                    legend?.isBullish ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatPrice(legend?.close || 0)}
                </span>
              </span>
              <span
                className={`font-bold text-[10px] px-1 rounded ${
                  legend?.isBullish
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {legend?.isBullish ? '+' : ''}
                {legend?.change.toFixed(2)} ({legend?.isBullish ? '+' : ''}
                {legend?.changePct.toFixed(2)}%)
              </span>
              <span>
                <span className="text-slate-500">Vol</span>{' '}
                <span className="text-cyan-300 font-semibold">{formatVol(legend?.volume || 0)}</span>
              </span>
            </div>
          </div>

          {/* Indicator values HUD (if active) */}
          {(showEma20 || showEma50 || showBollinger) && (
            <div className="flex items-center gap-3 text-[10px] font-mono bg-[#070b14]/75 px-2 py-0.5 rounded border border-[#162540]/60">
              {showEma20 && legend?.ema20 && (
                <span className="text-sky-400">
                  EMA 20: <span className="text-white font-semibold">{formatPrice(legend.ema20)}</span>
                </span>
              )}
              {showEma50 && legend?.ema50 && (
                <span className="text-amber-400">
                  EMA 50: <span className="text-white font-semibold">{formatPrice(legend.ema50)}</span>
                </span>
              )}
              {showBollinger && legend?.bbUpper && legend?.bbLower && (
                <span className="text-purple-400">
                  BB (20,2): <span className="text-white font-semibold">{formatPrice(legend.bbUpper)} / {formatPrice(legend.bbLower)}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Lightweight Charts Canvas Host */}
        <div
          ref={chartContainerRef}
          className={`w-full ${isFullscreen ? 'h-full' : 'h-[440px]'} cursor-crosshair`}
        />

        {/* Subtle Interactive Instruction Pill on bottom-left */}
        <div className="absolute bottom-2 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-[#070b14]/80 px-2 py-0.5 rounded border border-[#142036]">
          <span>Pan: Click & Drag</span>
          <span>•</span>
          <span>Zoom: Scroll Wheel / Pinch</span>
          <span>•</span>
          <span>Y-Scale: Drag Price Axis</span>
        </div>
      </div>

      {/* TradingView Bottom Controls & Market Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Engine:</span>
          <span className="text-teal-400 font-semibold text-[11px] flex items-center gap-1">
            TradingView Lightweight Charts™ Canvas
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">Sub-pixel Canvas Rendering</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={handleScrollToRealtime}
            className="hover:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Jump to Latest Bar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
