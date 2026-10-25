export type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | 'ALL';

export interface Candle {
  time: number; // Unix timestamp in seconds (strictly ascending for TradingView)
  timeLabel: string;
  fullDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMiddle?: number;
}

export interface PeriodStats {
  startPrice: number;
  endPrice: number;
  changeValue: number;
  changePercent: number;
  highestPrice: number;
  lowestPrice: number;
  totalVolume: number;
  averagePrice: number;
}

// Simple deterministic pseudo-random generator with seed
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 42;
}

export function generateCandles(
  ticker: string,
  currentPrice: number,
  changeValue: number,
  timeframe: Timeframe,
  historicalPoints?: number[]
): Candle[] {
  const seed = stringToSeed(`${ticker}-${timeframe}`);
  const rand = createSeededRandom(seed);

  const roundPrice = (p: number) => {
    if (p >= 100) return Math.round(p * 100) / 100;
    if (p >= 10) return Math.round(p * 100) / 100;
    return Math.round(p * 1000) / 1000;
  };

  // Fixed reference base timestamp: 2025-05-15 16:00:00 UTC (1747324800)
  // This guarantees consistent deterministic timestamps across sessions.
  const endTimestamp = 1747324800;

  const rawCandles: Omit<Candle, 'ema20' | 'ema50' | 'bbUpper' | 'bbLower' | 'bbMiddle'>[] = [];

  if (timeframe === '1D') {
    // 30 bars (15-minute intervals spanning 7.5 hours from 08:30 to 16:00)
    const count = 30;
    const intervalSec = 15 * 60; // 15 mins
    const startTimestamp = endTimestamp - count * intervalSec;
    const startPrice = Math.max(0.01, currentPrice - changeValue);

    let prevClose = startPrice;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const progress = (i + 1) / count;
      const wave = Math.sin(progress * Math.PI * 3) * (currentPrice * 0.008);
      const targetClose = isLast
        ? currentPrice
        : startPrice + (currentPrice - startPrice) * progress + wave + (rand() - 0.5) * (currentPrice * 0.006);

      const open = prevClose;
      const close = isLast ? currentPrice : Math.max(0.01, targetClose);
      const spread = Math.abs(close - open) + currentPrice * (0.003 + rand() * 0.005);
      const high = Math.max(open, close) + rand() * spread * 0.6;
      const low = Math.max(0.01, Math.min(open, close) - rand() * spread * 0.6);
      const volume = Math.floor(18000 + rand() * 45000);

      const t = startTimestamp + (i + 1) * intervalSec;
      const d = new Date(t * 1000);
      const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      rawCandles.push({
        time: t,
        timeLabel,
        fullDate: `Today, ${timeLabel}`,
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
      });

      prevClose = close;
    }
  } else if (timeframe === '1W') {
    // 35 bars (2-hour bars across 5 trading days)
    const count = 35;
    const intervalSec = 2 * 3600; // 2 hours
    const startTimestamp = endTimestamp - 7 * 86400;
    const baseWeeklyShift = (rand() - 0.42) * (currentPrice * 0.04);
    const startPrice = Math.max(0.01, currentPrice - baseWeeklyShift);

    let prevClose = startPrice;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const progress = (i + 1) / count;
      const wave = Math.sin(progress * Math.PI * 2.5) * (currentPrice * 0.012);
      const targetClose = isLast
        ? currentPrice
        : startPrice + (currentPrice - startPrice) * progress + wave + (rand() - 0.5) * (currentPrice * 0.01);

      const open = prevClose + (rand() - 0.5) * (currentPrice * 0.003);
      const close = isLast ? currentPrice : Math.max(0.01, targetClose);
      const spread = Math.abs(close - open) + currentPrice * (0.006 + rand() * 0.012);
      const high = Math.max(open, close) + rand() * spread * 0.65;
      const low = Math.max(0.01, Math.min(open, close) - rand() * spread * 0.65);
      const volume = Math.floor(65000 + rand() * 180000);

      const t = startTimestamp + Math.floor((i * (7 * 86400)) / count);
      const d = new Date(t * 1000);
      const dayName = d.toLocaleDateString([], { weekday: 'short' });
      const timeLabel = `${dayName} ${d.getHours()}:00`;

      rawCandles.push({
        time: t,
        timeLabel,
        fullDate: `${dayName}, ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.getHours()}:00`,
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
      });

      prevClose = close;
    }
  } else if (timeframe === '1M') {
    // 30 daily bars
    const count = 30;
    const intervalSec = 86400; // 1 day
    const startTimestamp = endTimestamp - count * intervalSec;
    const monthDrift = (rand() - 0.38) * (currentPrice * 0.08);
    const startPrice = Math.max(0.01, currentPrice - monthDrift);

    let prevClose = startPrice;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const progress = (i + 1) / count;
      const wave = Math.sin(progress * Math.PI * 2) * (currentPrice * 0.02);
      const targetClose = isLast ? currentPrice : startPrice + (currentPrice - startPrice) * progress + wave;

      const open = prevClose + (rand() - 0.5) * (currentPrice * 0.005);
      const close = isLast ? currentPrice : Math.max(0.01, targetClose);
      const spread = Math.abs(close - open) + currentPrice * (0.008 + rand() * 0.016);
      const high = Math.max(open, close) + rand() * spread * 0.7;
      const low = Math.max(0.01, Math.min(open, close) - rand() * spread * 0.7);
      const volume = Math.floor(320000 + rand() * 850000);

      const t = startTimestamp + (i + 1) * intervalSec;
      const d = new Date(t * 1000);
      const timeLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      rawCandles.push({
        time: t,
        timeLabel,
        fullDate: d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }),
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
      });

      prevClose = close;
    }
  } else if (timeframe === '6M') {
    // 60 bars (approx 2-3 days per bar over 180 days)
    const count = 60;
    const intervalSec = 3 * 86400; // 3 days
    const startTimestamp = endTimestamp - 180 * 86400;
    const drift6m = (rand() - 0.35) * (currentPrice * 0.22);
    const startPrice = Math.max(0.01, currentPrice - drift6m);

    let prevClose = startPrice;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const progress = (i + 1) / count;
      const wave = Math.sin(progress * Math.PI * 3) * (currentPrice * 0.035);
      const targetClose = isLast ? currentPrice : startPrice + (currentPrice - startPrice) * progress + wave;

      const open = prevClose + (rand() - 0.5) * (currentPrice * 0.008);
      const close = isLast ? currentPrice : Math.max(0.01, targetClose);
      const spread = Math.abs(close - open) + currentPrice * (0.012 + rand() * 0.022);
      const high = Math.max(open, close) + rand() * spread * 0.7;
      const low = Math.max(0.01, Math.min(open, close) - rand() * spread * 0.7);
      const volume = Math.floor(650000 + rand() * 1800000);

      const t = startTimestamp + Math.floor((i * 180 * 86400) / count);
      const d = new Date(t * 1000);
      const timeLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      rawCandles.push({
        time: t,
        timeLabel,
        fullDate: d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }),
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
      });

      prevClose = close;
    }
  } else if (timeframe === '1Y') {
    // 75 bars over 365 days
    const count = 75;
    const startTimestamp = endTimestamp - 365 * 86400;
    const candlesPerMonth = Math.floor(count / 12);

    const rawAnchors = historicalPoints && historicalPoints.length >= 12
      ? historicalPoints.slice(0, 12)
      : Array.from({ length: 12 }, (_, i) => currentPrice * (0.75 + ((i + 1) / 12) * 0.25));

    let prevClose = rawAnchors[0] * 0.96;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const monthIdx = Math.min(11, Math.floor(i / candlesPerMonth));
      const targetMonthPrice = rawAnchors[monthIdx];
      const nextMonthPrice = rawAnchors[Math.min(11, monthIdx + 1)];
      const subRatio = (i % candlesPerMonth) / candlesPerMonth;
      const baseExpected = targetMonthPrice + (nextMonthPrice - targetMonthPrice) * subRatio;

      const targetClose = isLast ? currentPrice : baseExpected + (rand() - 0.5) * (currentPrice * 0.02);
      const open = prevClose + (rand() - 0.5) * (currentPrice * 0.008);
      const close = isLast ? currentPrice : Math.max(0.01, targetClose);
      const spread = Math.abs(close - open) + currentPrice * (0.015 + rand() * 0.025);
      const high = Math.max(open, close) + rand() * spread * 0.72;
      const low = Math.max(0.01, Math.min(open, close) - rand() * spread * 0.72);
      const volume = Math.floor(1200000 + rand() * 3200000);

      const t = startTimestamp + Math.floor((i * 365 * 86400) / count);
      const d = new Date(t * 1000);
      const timeLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      rawCandles.push({
        time: t,
        timeLabel,
        fullDate: d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }),
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
      });

      prevClose = close;
    }
  } else {
    // ALL: 100 bars spanning 4.5 years
    const count = 100;
    const totalDays = 4.5 * 365;
    const startTimestamp = endTimestamp - Math.floor(totalDays * 86400);

    const isGrowthStock = ticker === 'NVDA' || ticker === 'AAPL' || ticker === 'MSFT';
    const startPrice = isGrowthStock
      ? currentPrice * 0.22
      : Math.max(0.01, currentPrice * (0.55 + rand() * 0.3));

    let prevClose = startPrice;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const progress = (i + 1) / count;
      const curve = Math.pow(progress, 1.35);
      const targetClose = isLast
        ? currentPrice
        : startPrice + (currentPrice - startPrice) * curve + (rand() - 0.45) * (currentPrice * 0.08);

      const open = prevClose + (rand() - 0.5) * (currentPrice * 0.015);
      const close = isLast ? currentPrice : Math.max(0.01, targetClose);
      const spread = Math.abs(close - open) + currentPrice * (0.025 + rand() * 0.045);
      const high = Math.max(open, close) + rand() * spread * 0.75;
      const low = Math.max(0.01, Math.min(open, close) - rand() * spread * 0.75);
      const volume = Math.floor(4500000 + rand() * 12000000);

      const t = startTimestamp + Math.floor((i * totalDays * 86400) / count);
      const d = new Date(t * 1000);
      const timeLabel = d.toLocaleDateString([], { month: 'short', year: '2-digit' });

      rawCandles.push({
        time: t,
        timeLabel,
        fullDate: d.toLocaleDateString([], { month: 'long', year: 'numeric' }),
        open: roundPrice(open),
        high: roundPrice(high),
        low: roundPrice(low),
        close: roundPrice(close),
        volume,
      });

      prevClose = close;
    }
  }

  // Ensure timestamps are strictly increasing and unique
  const finalCandles: Candle[] = [];
  let lastTime = 0;
  for (let i = 0; i < rawCandles.length; i++) {
    const c = rawCandles[i];
    let t = c.time;
    if (t <= lastTime) {
      t = lastTime + 60;
    }
    lastTime = t;

    finalCandles.push({
      ...c,
      time: t,
    });
  }

  // Calculate Technical Indicators: EMA 20, EMA 50, Bollinger Bands
  const k20 = 2 / (20 + 1);
  const k50 = 2 / (50 + 1);

  let ema20 = finalCandles[0].close;
  let ema50 = finalCandles[0].close;

  for (let i = 0; i < finalCandles.length; i++) {
    const close = finalCandles[i].close;
    ema20 = close * k20 + ema20 * (1 - k20);
    ema50 = close * k50 + ema50 * (1 - k50);

    finalCandles[i].ema20 = roundPrice(ema20);
    finalCandles[i].ema50 = roundPrice(ema50);

    // Bollinger Bands (20 periods)
    const windowStart = Math.max(0, i - 19);
    const windowCloses = finalCandles.slice(windowStart, i + 1).map((c) => c.close);
    const mean = windowCloses.reduce((a, b) => a + b, 0) / windowCloses.length;
    const variance = windowCloses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / windowCloses.length;
    const stdDev = Math.sqrt(variance);

    finalCandles[i].bbMiddle = roundPrice(mean);
    finalCandles[i].bbUpper = roundPrice(mean + 2 * stdDev);
    finalCandles[i].bbLower = roundPrice(Math.max(0.01, mean - 2 * stdDev));
  }

  return finalCandles;
}

export function computePeriodStats(candles: Candle[]): PeriodStats {
  if (!candles || candles.length === 0) {
    return {
      startPrice: 0,
      endPrice: 0,
      changeValue: 0,
      changePercent: 0,
      highestPrice: 0,
      lowestPrice: 0,
      totalVolume: 0,
      averagePrice: 0,
    };
  }

  const startPrice = candles[0].open;
  const endPrice = candles[candles.length - 1].close;
  const changeValue = endPrice - startPrice;
  const changePercent = startPrice > 0 ? (changeValue / startPrice) * 100 : 0;

  let highestPrice = -Infinity;
  let lowestPrice = Infinity;
  let sumPrice = 0;
  let totalVolume = 0;

  for (const c of candles) {
    if (c.high > highestPrice) highestPrice = c.high;
    if (c.low < lowestPrice) lowestPrice = c.low;
    sumPrice += c.close;
    totalVolume += c.volume;
  }

  return {
    startPrice,
    endPrice,
    changeValue: Math.round(changeValue * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    highestPrice: Math.round(highestPrice * 100) / 100,
    lowestPrice: Math.round(lowestPrice * 100) / 100,
    totalVolume,
    averagePrice: Math.round((sumPrice / candles.length) * 100) / 100,
  };
}
