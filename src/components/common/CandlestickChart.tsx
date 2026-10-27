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
import {
  Candle,
  Timeframe,
  ALL_TRADINGVIEW_TIMEFRAMES,
  TimeframeOption,
} from '../../utils/stockCandles.ts';
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
  ChevronDown,
  Camera,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  Share2,
  Play,
  Pause,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export type ChartStyleType = 'candles' | 'hollow' | 'line' | 'area' | 'bars';

interface CandlestickChartProps {
  candles: Candle[];
  currency: string;
  ticker: string;
  timeframe: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
  isMarketLive?: boolean;
  marketSession?: MarketSessionInfo;
  chartType?: 'candlestick' | 'line';
  onChartTypeChange?: (type: 'candlestick' | 'line') => void;
  isLiveStreaming?: boolean;
  onToggleLiveStreaming?: () => void;
  currentLivePrice?: number;
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
  onTimeframeChange,
  isMarketLive = false,
  marketSession,
  isLiveStreaming = true,
  onToggleLiveStreaming,
  currentLivePrice,
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

  // Timeframe dropdown menu state
  const [showTfMenu, setShowTfMenu] = useState<boolean>(false);
  const tfMenuRef = useRef<HTMLDivElement>(null);

  // Extract / Export dropdown menu state
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Live bar countdown timer (seconds remaining in current bar)
  const [barCountdown, setBarCountdown] = useState<number>(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setBarCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tfMenuRef.current && !tfMenuRef.current.contains(e.target as Node)) {
        setShowTfMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Track previous params to detect if we can do an in-place candle tick update
  const prevTickerRef = useRef(ticker);
  const prevTfRef = useRef(timeframe);
  const prevStyleRef = useRef(chartStyle);
  const prevCandleLenRef = useRef(candles.length);

  // Main Chart Initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Check if this is a live tick update (same ticker, timeframe, style, and candle length)
    const isLiveTick =
      chartRef.current &&
      mainSeriesRef.current &&
      prevTickerRef.current === ticker &&
      prevTfRef.current === timeframe &&
      prevStyleRef.current === chartStyle &&
      prevCandleLenRef.current === candles.length &&
      candles.length > 0;

    prevTickerRef.current = ticker;
    prevTfRef.current = timeframe;
    prevStyleRef.current = chartStyle;
    prevCandleLenRef.current = candles.length;

    if (isLiveTick && mainSeriesRef.current) {
      // In-place live series update for smooth TradingView tick animation
      const last = candles[candles.length - 1];
      if (chartStyle === 'line' || chartStyle === 'area') {
        mainSeriesRef.current.update({
          time: last.time as Time,
          value: last.close,
        });
      } else {
        mainSeriesRef.current.update({
          time: last.time as Time,
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
        });
      }
      return;
    }

    // Clean previous instance on structural change
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    // Create TradingView Chart instance
    const chart = createChart(container, {
      width: container.clientWidth || 700,
      height: isFullscreen ? window.innerHeight - 130 : 450,
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
        topColor: 'rgba(13, 242, 201, 0.4)',
        bottomColor: 'rgba(13, 242, 201, 0.0)',
        lineColor: '#0df2c9',
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

    // Apply 4-decimal precision for small pip prices (Forex)
    const isSmallPipPrice = candles[0]?.close && candles[0].close < 10;
    if (isSmallPipPrice) {
      mainSeries.applyOptions({
        priceFormat: {
          type: 'price',
          precision: 4,
          minMove: 0.0001,
        },
      });
    }

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

    // 5. Technical Indicators: Bollinger Bands (Upper & Lower)
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
          height: isFullscreen ? window.innerHeight - 130 : 450,
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

  // Add Support/Resistance price line alert
  const handleAddPriceLine = () => {
    if (!latestCandle || !mainSeriesRef.current) return;
    const currentClose = latestCandle.close;
    setPriceLineAlerts((prev) => [...prev, currentClose]);
  };

  const handleClearPriceLines = () => {
    setPriceLineAlerts([]);
  };

  // --- EXTRACT WHOLE CHART HANDLERS ---
  const handleExtractPng = () => {
    if (!chartRef.current) return;
    try {
      const canvas = chartRef.current.takeScreenshot();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${ticker}_${timeframe}_TradingView_Chart.png`;
      link.href = dataUrl;
      link.click();
      setShowExportMenu(false);
      setExportNotice('Chart PNG snapshot downloaded successfully!');
      setTimeout(() => setExportNotice(null), 3000);
    } catch {
      setExportNotice('Failed to capture snapshot.');
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  const handleCopyChartImage = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = chartRef.current.takeScreenshot();
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setShowExportMenu(false);
          setExportNotice('Chart image copied to clipboard!');
          setTimeout(() => setExportNotice(null), 3000);
        } else {
          handleExtractPng();
        }
      });
    } catch {
      handleExtractPng();
    }
  };

  const handleExtractCsv = () => {
    if (!candles || candles.length === 0) return;
    const headers = 'UnixTimestamp,Date,Time,Open,High,Low,Close,Volume,EMA20,EMA50\n';
    const rows = candles
      .map(
        (c) =>
          `${c.time},"${c.fullDate}","${c.timeLabel}",${c.open},${c.high},${c.low},${c.close},${c.volume},${c.ema20 || ''},${c.ema50 || ''}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ticker}_${timeframe}_OHLCV_Dataset.csv`;
    link.click();
    setShowExportMenu(false);
    setExportNotice('OHLCV CSV dataset exported!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExtractJson = () => {
    if (!candles || candles.length === 0) return;
    const jsonStr = JSON.stringify(
      {
        ticker,
        currency,
        timeframe,
        exportedAt: new Date().toISOString(),
        candleCount: candles.length,
        candles,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ticker}_${timeframe}_chart_data.json`;
    link.click();
    setShowExportMenu(false);
    setExportNotice('Chart JSON data exported!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (p >= 10) return p.toFixed(2);
    if (p >= 5) return p.toFixed(3);
    return p.toFixed(4);
  };

  const formatVol = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
  };

  // Grouped timeframes for the menu
  const timeframeCategories = useMemo(() => {
    const cats: Record<string, TimeframeOption[]> = {
      Minutes: [],
      Hours: [],
      'Days / Weeks': [],
      Extended: [],
    };
    ALL_TRADINGVIEW_TIMEFRAMES.forEach((opt) => {
      cats[opt.category].push(opt);
    });
    return cats;
  }, []);

  return (
    <div
      className={`space-y-2 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#070b14] p-5 overflow-auto flex flex-col justify-between'
          : 'relative'
      }`}
    >
      {/* Export Notification Toast */}
      {exportNotice && (
        <div className="absolute top-14 right-4 z-30 px-3.5 py-2 rounded-xl bg-teal-950/90 border border-teal-500/50 text-[#0df2c9] text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#0df2c9]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* TradingView Top Functional Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-[#080e18] border border-[#142036] text-xs">
        {/* Left Side: Ticker, Live Badge, Timeframes, Chart Styles, and Indicators */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Ticker badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0f172a] border border-[#1e293b] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="font-bold text-white">{ticker}</span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] text-teal-300 font-semibold uppercase">{timeframe}</span>
          </div>

          {/* LIVE STREAMING TOGGLE PILL */}
          <button
            onClick={onToggleLiveStreaming}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
              isLiveStreaming
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Live Real-time Price Ticking Feed"
          >
            {isLiveStreaming ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>LIVE FEED</span>
                <span className="text-[9px] text-emerald-400/80 font-normal hidden sm:inline">
                  • 00:{barCountdown.toString().padStart(2, '0')}
                </span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* ALL TRADINGVIEW TIMEFRAMES SELECTOR */}
          <div className="flex items-center bg-[#050912] p-0.5 rounded-lg border border-[#162540] relative" ref={tfMenuRef}>
            {/* Quick Favorite Intervals */}
            {(['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange?.(tf)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Switch to ${tf} TradingView timeframe`}
              >
                {tf}
              </button>
            ))}

            {/* Extended All-Timeframes Dropdown Button */}
            <button
              onClick={() => setShowTfMenu((prev) => !prev)}
              className={`px-1.5 py-1 rounded text-[10px] font-mono flex items-center gap-0.5 transition-all cursor-pointer ${
                showTfMenu || !['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'].includes(timeframe)
                  ? 'bg-teal-500/20 text-[#0df2c9] font-bold border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View all TradingView intervals (Minutes, Hours, Days)"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* All Timeframes Dropdown Menu */}
            {showTfMenu && (
              <div className="absolute top-full left-0 mt-1.5 z-40 w-64 p-3 rounded-xl bg-[#09111e] border border-[#1c2e4c] shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300 font-mono pb-1 border-b border-[#16253d] flex items-center justify-between">
                  <span>TradingView Timeframes</span>
                  <span className="text-slate-400">15 intervals</span>
                </div>

                {Object.entries(timeframeCategories).map(([cat, opts]) => (
                  <div key={cat} className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">{cat}</span>
                    <div className="grid grid-cols-3 gap-1">
                      {opts.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            onTimeframeChange?.(opt.value);
                            setShowTfMenu(false);
                          }}
                          className={`px-2 py-1 rounded text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                            timeframe === opt.value
                              ? 'bg-[#0df2c9] text-black shadow-md'
                              : 'bg-[#0e1726] hover:bg-[#14233a] text-slate-300 hover:text-white border border-[#192842]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart Style Switcher */}
          <div className="hidden lg:flex items-center bg-[#050912] p-0.5 rounded-lg border border-[#162540]">
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

        {/* Right Side: Tools (EXTRACT CHART, Alert Lines, Zoom, Fit, Fullscreen) */}
        <div className="flex items-center gap-1">
          {/* EXTRACT WHOLE CHART BUTTON & MENU */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-xs font-semibold text-[#0df2c9] transition-all cursor-pointer shadow-sm"
              title="Extract Whole Chart (PNG Snapshot, CSV, JSON, Clipboard)"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Extract Chart</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-56 p-2 rounded-xl bg-[#09111e] border border-[#1b2d4b] shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-1 text-xs font-medium">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-[#14233c]">
                  Chart Extract Options
                </div>

                <button
                  onClick={handleExtractPng}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#111e33] transition-colors text-left cursor-pointer"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <div>
                    <div className="font-semibold text-white">Save Image (PNG)</div>
                    <div className="text-[10px] text-slate-400">Download high-res chart image</div>
                  </div>
                </button>

                <button
                  onClick={handleCopyChartImage}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#111e33] transition-colors text-left cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-white">Copy Image</div>
                    <div className="text-[10px] text-slate-400">Copy chart to clipboard</div>
                  </div>
                </button>

                <button
                  onClick={handleExtractCsv}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#111e33] transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Export CSV Data</div>
                    <div className="text-[10px] text-slate-400">OHLCV price table (.csv)</div>
                  </div>
                </button>

                <button
                  onClick={handleExtractJson}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-[#111e33] transition-colors text-left cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Export JSON</div>
                    <div className="text-[10px] text-slate-400">Raw candle array dataset</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Add Price Level */}
          <button
            onClick={handleAddPriceLine}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e1726] hover:bg-[#14233a] border border-[#1b2b45] text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Place horizontal target/alert price level"
          >
            <Tag className="w-3 h-3 text-teal-400" />
            <span className="hidden sm:inline">+ Level</span>
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
                  isLiveStreaming
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isLiveStreaming ? '● LIVE TICK' : 'STATIC'}
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
                {legend?.change.toFixed(4)} ({legend?.isBullish ? '+' : ''}
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

        {/* Live Bid/Ask & Watermark in Corner */}
        <div className="absolute bottom-2 left-3 z-10 pointer-events-none flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="text-[#0df2c9]/60 font-bold">MullahTracker Live Engine</span>
          <span>•</span>
          <span>TradingView Lightweight Platform</span>
        </div>

        {/* Canvas DOM container */}
        <div
          ref={chartContainerRef}
          className="w-full"
          style={{ height: isFullscreen ? 'calc(100vh - 130px)' : '450px' }}
        />
      </div>
    </div>
  );
};
