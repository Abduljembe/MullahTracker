export type Timeframe =
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '45m'
  | '1H'
  | '2H'
  | '4H'
  | '1D'
  | '1W'
  | '1M'
  | '6M'
  | '1Y'
  | 'ALL';

export interface TimeframeOption {
  value: Timeframe;
  label: string;
  category: 'Minutes' | 'Hours' | 'Days / Weeks' | 'Extended';
  isFavorite?: boolean;
}

export const ALL_TRADINGVIEW_TIMEFRAMES: TimeframeOption[] = [
  // Minutes
  { value: '1m', label: '1m', category: 'Minutes', isFavorite: true },
  { value: '3m', label: '3m', category: 'Minutes' },
  { value: '5m', label: '5m', category: 'Minutes', isFavorite: true },
  { value: '15m', label: '15m', category: 'Minutes', isFavorite: true },
  { value: '30m', label: '30m', category: 'Minutes' },
  { value: '45m', label: '45m', category: 'Minutes' },

  // Hours
  { value: '1H', label: '1H', category: 'Hours', isFavorite: true },
  { value: '2H', label: '2H', category: 'Hours' },
  { value: '4H', label: '4H', category: 'Hours', isFavorite: true },

  // Days & Weeks
  { value: '1D', label: '1D', category: 'Days / Weeks', isFavorite: true },
  { value: '1W', label: '1W', category: 'Days / Weeks', isFavorite: true },
  { value: '1M', label: '1M', category: 'Days / Weeks', isFavorite: true },

  // Extended
  { value: '6M', label: '6M', category: 'Extended' },
  { value: '1Y', label: '1Y', category: 'Extended' },
  { value: 'ALL', label: 'ALL', category: 'Extended' },
];

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
    if (p >= 5) return Math.round(p * 1000) / 1000;
    return Math.round(p * 10000) / 10000;
  };

  // Base timestamp: Current Unix time in seconds rounded to nearest minute
  const nowSec = Math.floor(Date.now() / 1000);
  const endTimestamp = nowSec - (nowSec % 60);

  const rawCandles: Omit<Candle, 'ema20' | 'ema50' | 'bbUpper' | 'bbLower' | 'bbMiddle'>[] = [];

  // Determine interval seconds and bar count for each timeframe
  let count = 40;
  let intervalSec = 60;
  let waveFactor = 0.005;
  let spreadFactor = 0.004;

  if (timeframe === '1m') {
    count = 60;
    intervalSec = 60;
    waveFactor = 0.0015;
    spreadFactor = 0.0008;
  } else if (timeframe === '3m') {
    count = 50;
    intervalSec = 180;
    waveFactor = 0.0025;
    spreadFactor = 0.0012;
  } else if (timeframe === '5m') {
    count = 60;
    intervalSec = 300;
    waveFactor = 0.0035;
    spreadFactor = 0.0018;
  } else if (timeframe === '15m') {
    count = 48;
    intervalSec = 900;
    waveFactor = 0.006;
    spreadFactor = 0.003;
  } else if (timeframe === '30m') {
    count = 48;
    intervalSec = 1800;
    waveFactor = 0.008;
    spreadFactor = 0.004;
  } else if (timeframe === '45m') {
    count = 40;
    intervalSec = 2700;
    waveFactor = 0.01;
    spreadFactor = 0.005;
  } else if (timeframe === '1H') {
    count = 48;
    intervalSec = 3600;
    waveFactor = 0.012;
    spreadFactor = 0.006;
  } else if (timeframe === '2H') {
    count = 45;
    intervalSec = 7200;
    waveFactor = 0.015;
    spreadFactor = 0.008;
  } else if (timeframe === '4H') {
    count = 42;
    intervalSec = 14400;
    waveFactor = 0.02;
    spreadFactor = 0.01;
  } else if (timeframe === '1D') {
    count = 45;
    intervalSec = 86400;
    waveFactor = 0.03;
    spreadFactor = 0.015;
  } else if (timeframe === '1W') {
    count = 52;
    intervalSec = 7 * 86400;
    waveFactor = 0.05;
    spreadFactor = 0.025;
  } else if (timeframe === '1M') {
    count = 36;
    intervalSec = 30 * 86400;
    waveFactor = 0.08;
    spreadFactor = 0.035;
  } else if (timeframe === '6M') {
    count = 50;
    intervalSec = 4 * 86400;
    waveFactor = 0.12;
    spreadFactor = 0.04;
  } else if (timeframe === '1Y') {
    count = 52;
    intervalSec = 7 * 86400;
    waveFactor = 0.18;
    spreadFactor = 0.05;
  } else {
    // ALL
    count = 70;
    intervalSec = 15 * 86400;
    waveFactor = 0.25;
    spreadFactor = 0.06;
  }

  const startTimestamp = endTimestamp - count * intervalSec;
  const drift = (rand() - 0.42) * (currentPrice * waveFactor * 3);
  const startPrice = Math.max(0.0001, currentPrice - (changeValue || drift));

  let prevClose = startPrice;

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const progress = (i + 1) / count;
    const wave = Math.sin(progress * Math.PI * 3.2) * (currentPrice * waveFactor);
    const targetClose = isLast
      ? currentPrice
      : startPrice + (currentPrice - startPrice) * progress + wave + (rand() - 0.5) * (currentPrice * spreadFactor);

    const open = prevClose;
    const close = isLast ? currentPrice : Math.max(0.0001, targetClose);
    const spread = Math.abs(close - open) + currentPrice * (spreadFactor * 0.6 + rand() * spreadFactor * 0.8);
    const high = Math.max(open, close) + rand() * spread * 0.6;
    const low = Math.max(0.0001, Math.min(open, close) - rand() * spread * 0.6);

    const volumeBase =
      intervalSec <= 300
        ? 8000
        : intervalSec <= 3600
        ? 35000
        : intervalSec <= 86400
        ? 150000
        : 650000;
    const volume = Math.floor(volumeBase + rand() * volumeBase * 2.5);

    const t = startTimestamp + (i + 1) * intervalSec;
    const d = new Date(t * 1000);

    let timeLabel = '';
    let fullDate = '';

    if (intervalSec < 86400) {
      // Sub-daily
      timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const dayName = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      fullDate = `${dayName} ${timeLabel}`;
    } else if (intervalSec <= 7 * 86400) {
      // Daily / Weekly
      timeLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      fullDate = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      // Monthly
      timeLabel = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
      fullDate = d.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }

    rawCandles.push({
      time: t,
      timeLabel,
      fullDate,
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(low),
      close: roundPrice(close),
      volume,
    });

    prevClose = close;
  }

  // Ensure timestamps are strictly increasing and unique
  const finalCandles: Candle[] = [];
  let lastTime = 0;
  for (let i = 0; i < rawCandles.length; i++) {
    const c = rawCandles[i];
    let t = c.time;
    if (t <= lastTime) {
      t = lastTime + Math.max(1, Math.floor(intervalSec / 2));
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
    finalCandles[i].bbLower = roundPrice(Math.max(0.0001, mean - 2 * stdDev));
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
    changeValue: Math.round(changeValue * 10000) / 10000,
    changePercent: Math.round(changePercent * 100) / 100,
    highestPrice: Math.round(highestPrice * 10000) / 10000,
    lowestPrice: Math.round(lowestPrice * 10000) / 10000,
    totalVolume,
    averagePrice: Math.round((sumPrice / candles.length) * 10000) / 10000,
  };
}
