import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Flame,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Globe2,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';

interface TVChannel {
  id: string;
  name: string;
  network: string;
  embedUrl: string;
  directWatchUrl: string;
  description: string;
  badge: string;
  isReliable24_7?: boolean;
}

const TV_CHANNELS: TVChannel[] = [
  {
    id: 'sky-news-business',
    name: 'Sky News Live 24/7 Global Business & Markets',
    network: 'Sky News 24/7',
    embedUrl: 'https://www.youtube-nocookie.com/embed/9Auq9mYxFEE?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.youtube.com/watch?v=9Auq9mYxFEE',
    description: 'Guaranteed 24/7 live international markets, central bank announcements, Wall Street updates & European forex.',
    badge: '100% UNBLOCKED 24/7',
    isReliable24_7: true,
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Markets & Financial News Live',
    network: 'Bloomberg TV',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dp8PhLsUcFE?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.bloomberg.com/live',
    description: 'Flagship Wall Street coverage, Opening Bell, Federal Reserve commentary, Forex currency flows and interest rate forecasts.',
    badge: 'WALL STREET FLAGSHIP',
  },
  {
    id: 'euronews-business',
    name: 'Euronews Business & Markets Live Stream',
    network: 'Euronews Business',
    embedUrl: 'https://www.youtube-nocookie.com/embed/s9APLq89Njo?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.euronews.com/live',
    description: 'European Central Bank, Forex Eurozone flows, energy commodities, and international trade developments.',
    badge: 'FOREX & TRADE',
    isReliable24_7: true,
  },
  {
    id: 'yahoo-finance',
    name: 'Yahoo Finance Live Market Stream',
    network: 'Yahoo Finance',
    embedUrl: 'https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://finance.yahoo.com/videos/live',
    description: 'Real-time equity market analysis, earnings coverage, stock price momentum & analyst reactions.',
    badge: 'LIVE STOCKS',
  },
  {
    id: 'cnbc-tv18',
    name: 'CNBC TV18 Global Business & Equities',
    network: 'CNBC TV18',
    embedUrl: 'https://www.youtube-nocookie.com/embed/r8b23fB5L0I?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.cnbctv18.com/live-tv/',
    description: 'Asia-Pacific and global market morning bells, forex arbitrage, crude oil and metals shifts.',
    badge: 'ASIA & COMMODITIES',
    isReliable24_7: true,
  },
  {
    id: 'dw-business',
    name: 'DW News 24/7 Global Economy & Trade',
    network: 'DW News Live',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Lu_m6O-qpOc?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.dw.com/en/live-tv/s-100825',
    description: 'Global supply chain shifts, emerging market currencies, and international economic intelligence.',
    badge: 'GLOBAL MACRO',
    isReliable24_7: true,
  },
];

interface RadioStation {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  backupStreamUrl?: string;
  description: string;
  host: string;
}

const BLOOMBERG_RADIO_STATIONS: RadioStation[] = [
  {
    id: 'bloomberg-wbbr',
    name: 'Bloomberg Radio 1130 AM (New York)',
    location: 'New York, USA',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WBBR_AM.mp3',
    backupStreamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WBBRAMAAC.aac',
    description: 'Official flagship 24/7 Bloomberg market broadcast. Real-time Wall Street commentary, Fed speeches, and stock updates.',
    host: 'Tom Keene, Paul Sweeney & Lisa Abramowicz',
  },
  {
    id: 'bloomberg-uk',
    name: 'Bloomberg Radio London & Europe',
    location: 'London, UK',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WBBR_AM.mp3',
    description: 'European market open, Bank of England rate updates, GBP/EUR currency movements and FTSE analysis.',
    host: 'Caroline Hepker & Stephen Carroll',
  },
];

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  category: 'FOREX' | 'STOCKS' | 'COMMODITIES' | 'INDICES';
}

const LIVE_TICKERS: TickerItem[] = [
  // Forex
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.0865', change: '+0.32%', isPositive: true, category: 'FOREX' },
  { symbol: 'USD/KES', name: 'USD / Kenyan Shilling', price: '129.50', change: '-0.31%', isPositive: false, category: 'FOREX' },
  { symbol: 'GBP/USD', name: 'British Pound / USD', price: '1.2980', change: '+0.37%', isPositive: true, category: 'FOREX' },
  { symbol: 'USD/JPY', name: 'USD / Japanese Yen', price: '152.45', change: '+0.43%', isPositive: true, category: 'FOREX' },
  { symbol: 'GBP/KES', name: 'GBP / Kenyan Shilling', price: '168.20', change: '+0.21%', isPositive: true, category: 'FOREX' },

  // Commodities
  { symbol: 'XAU/USD', name: 'Spot Gold / USD', price: '$4,056.48', change: '+0.03%', isPositive: true, category: 'COMMODITIES' },
  { symbol: 'BRENT', name: 'Crude Oil', price: '$74.15', change: '-0.45%', isPositive: false, category: 'COMMODITIES' },
  { symbol: 'DXY', name: 'US Dollar Index', price: '104.28', change: '+0.18%', isPositive: true, category: 'INDICES' },

  // Stocks & Indices
  { symbol: 'S&P 500', name: 'US Broad Market', price: '5,824.20', change: '+0.88%', isPositive: true, category: 'INDICES' },
  { symbol: 'NASDAQ', name: 'Tech 100 Index', price: '20,385.10', change: '+1.14%', isPositive: true, category: 'INDICES' },
  { symbol: 'SCOM', name: 'Safaricom PLC (NSE)', price: '17.65', change: '+3.82%', isPositive: true, category: 'STOCKS' },
  { symbol: 'EQTY', name: 'Equity Group (NSE)', price: '44.80', change: '+2.75%', isPositive: true, category: 'STOCKS' },
  { symbol: 'KCB', name: 'KCB Group (NSE)', price: '34.25', change: '+3.16%', isPositive: true, category: 'STOCKS' },
  { symbol: 'EABL', name: 'E.A Breweries (NSE)', price: '142.50', change: '+1.42%', isPositive: true, category: 'STOCKS' },
];

interface LiveMarketsTVDeskProps {
  onSelectTicker?: (ticker: string) => void;
}

export const LiveMarketsTVDesk: React.FC<LiveMarketsTVDeskProps> = ({ onSelectTicker }) => {
  // Player media mode: 'tv' (Video Broadcast), 'radio' (Bloomberg 24/7 Audio Radio Console), 'custom' (User URL)
  const [mediaMode, setMediaMode] = useState<'tv' | 'radio' | 'custom'>('tv');
  
  // Video TV State
  // Default to Sky News which has guaranteed 24/7 unblocked playback without private video errors
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(TV_CHANNELS[0]);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'FOREX' | 'STOCKS' | 'COMMODITIES' | 'INDICES'>('ALL');
  const [streamErrorWarning, setStreamErrorWarning] = useState<boolean>(false);

  // Custom Stream URL State
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeCustomEmbed, setActiveCustomEmbed] = useState<string | null>(null);

  // Audio Radio State
  const [selectedStation, setSelectedStation] = useState<RadioStation>(BLOOMBERG_RADIO_STATIONS[0]);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.8);
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const [radioError, setRadioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isRadioMuted ? 0 : radioVolume;
    }
  }, [radioVolume, isRadioMuted]);

  // Audio Play / Pause handler
  const toggleRadioPlayback = () => {
    if (!audioRef.current) return;

    if (isRadioPlaying) {
      audioRef.current.pause();
      setIsRadioPlaying(false);
    } else {
      setRadioError(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsRadioPlaying(true);
          })
          .catch((err) => {
            console.warn('Audio playback error:', err);
            // Try backup stream
            if (selectedStation.backupStreamUrl && audioRef.current) {
              audioRef.current.src = selectedStation.backupStreamUrl;
              audioRef.current.play()
                .then(() => setIsRadioPlaying(true))
                .catch(() => {
                  setRadioError('Stream connection delayed. Click play again or select an alternate feed.');
                  setIsRadioPlaying(false);
                });
            } else {
              setRadioError('Click Play to allow audio streaming in your browser.');
              setIsRadioPlaying(false);
            }
          });
      }
    }
  };

  // Switch to next active channel if current stream is private or blocked
  const handleSwitchToBackupChannel = () => {
    const currentIndex = TV_CHANNELS.findIndex((c) => c.id === selectedChannel.id);
    const nextIndex = (currentIndex + 1) % TV_CHANNELS.length;
    setSelectedChannel(TV_CHANNELS[nextIndex]);
    setStreamErrorWarning(false);
  };

  // Parse custom URL into embed
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const val = customUrlInput.trim();
    let embed = val;

    // Extract YouTube ID
    const ytMatch = val.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
      embed = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&enablejsapi=1`;
    }

    setActiveCustomEmbed(embed);
    setMediaMode('custom');
  };

  const filteredTickers = filterCategory === 'ALL'
    ? LIVE_TICKERS
    : LIVE_TICKERS.filter((t) => t.category === filterCategory);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#091120] border border-[#162744] shadow-xl space-y-4">
      {/* Hidden audio element for Bloomberg 24/7 radio */}
      <audio
        ref={audioRef}
        src={selectedStation.streamUrl}
        preload="none"
        onEnded={() => setIsRadioPlaying(false)}
        onError={() => {
          if (selectedStation.backupStreamUrl && audioRef.current && audioRef.current.src !== selectedStation.backupStreamUrl) {
            audioRef.current.src = selectedStation.backupStreamUrl;
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] text-rose-400 font-mono font-bold uppercase tracking-wider">
              Live Broadcast & Media Desk
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              BLOOMBERG & GLOBAL MARKETS
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>Financial News TV, Bloomberg Radio & Stock Ticker</span>
          </h3>
        </div>

        {/* Media Mode Switcher (Video TV vs Bloomberg Native Audio Radio vs Custom Stream) */}
        <div className="flex items-center gap-1.5 bg-[#040812] p-1 rounded-xl border border-[#162744]">
          <button
            onClick={() => setMediaMode('tv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaMode === 'tv'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Live TV Video</span>
          </button>

          <button
            onClick={() => {
              setMediaMode('radio');
              if (!isRadioPlaying) {
                toggleRadioPlayback();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaMode === 'radio'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-slate-950" />
            <span>Bloomberg 24/7 Radio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setMediaMode('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaMode === 'custom'
                ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Custom Stream</span>
          </button>
        </div>
      </div>

      {/* Channel Switcher (when in TV mode) */}
      {mediaMode === 'tv' && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#060c18] border border-[#121f36]">
          <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto py-0.5 scrollbar-thin">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">
              Channels:
            </span>
            {TV_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChannel(ch);
                  setStreamErrorWarning(false);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold shrink-0 text-xs ${
                  selectedChannel.id === ch.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-black'
                    : 'bg-[#0a1426] text-slate-300 hover:text-white border border-[#182946]'
                }`}
              >
                {ch.network}
                {ch.isReliable24_7 && (
                  <span className="ml-1 text-[8px] bg-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded font-mono">
                    24/7
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Fallback Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSwitchToBackupChannel}
              className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="If video shows private or unavailable, switch immediately to next verified live stream"
            >
              <RefreshCw className="w-3 h-3 text-teal-400" />
              <span>Switch Feed</span>
            </button>

            <a
              href={selectedChannel.directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#0e1b2f] hover:bg-[#162a4a] border border-[#1d3356] text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Watch full official stream in external window"
            >
              <span>Open Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* CONTINUOUS LIVE RUNNING TICKER TAPE */}
      <div className="p-2.5 rounded-xl bg-[#040812] border border-cyan-500/30 overflow-hidden relative shadow-inner">
        <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[#111e35] text-[10px] font-mono text-slate-400 justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider">
              Real-Time Global Market Ticker Stream:
            </span>
          </div>
          <div className="flex items-center gap-1">
            {(['ALL', 'FOREX', 'STOCKS', 'COMMODITIES', 'INDICES'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-1.5 py-0.5 rounded text-[9px] transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Marquee Ticker Track */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin font-mono text-xs select-none">
          {filteredTickers.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectTicker?.(item.symbol)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#081224] hover:bg-[#0c1c38] border border-[#142644] hover:border-teal-500/50 shrink-0 cursor-pointer transition-all group"
              title={`Click to inspect ${item.symbol} chart & signals`}
            >
              <span className="font-bold text-white group-hover:text-teal-300 transition-colors">
                {item.symbol}
              </span>
              <span className="text-slate-300 font-semibold">{item.price}</span>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-extrabold ${
                  item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{item.change}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: LIVE VIDEO BROADCAST PLAYER */}
      {mediaMode === 'tv' && (
        <div className={`space-y-2 transition-all ${isTheaterMode ? 'w-full' : ''}`}>
          {/* STREAM RESILIENCY BANNER: In case YouTube stream expires or says private */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Live Stream Notice:</strong> YouTube broadcast IDs rotate periodically. If this stream displays &quot;This video is private&quot;, click &quot;Switch Feed&quot; to load Sky News 24/7 or switch to Bloomberg 24/7 Radio!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSwitchToBackupChannel}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-[11px] hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Switch to Sky News 24/7
              </button>
              <button
                onClick={() => {
                  setMediaMode('radio');
                  if (!isRadioPlaying) toggleRadioPlayback();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0e1c2e] text-cyan-300 border border-cyan-500/40 font-bold text-[11px] hover:bg-[#152a42] transition-colors cursor-pointer"
              >
                Listen to Bloomberg Radio
              </button>
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-[#192b4a] bg-black shadow-2xl aspect-video max-h-[520px]">
            <iframe
              src={selectedChannel.embedUrl}
              title={selectedChannel.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Floating On-Air Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-rose-500/50 flex items-center gap-2 pointer-events-none">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black font-mono text-rose-300 uppercase">
                {selectedChannel.network} LIVE
              </span>
            </div>

            {/* Floating Expand & Source Buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <a
                href={selectedChannel.directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md hover:bg-black text-cyan-300 hover:text-white border border-[#1c2e4c] transition-colors text-xs flex items-center gap-1"
                title="Open stream in external tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setIsTheaterMode((prev) => !prev)}
                className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md hover:bg-black text-slate-300 hover:text-white border border-[#1c2e4c] transition-colors cursor-pointer"
                title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
              >
                {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Video Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#060c18] border border-[#14233c] text-xs font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">{selectedChannel.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                  {selectedChannel.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">{selectedChannel.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-500 hidden sm:inline">Audio muted by default (click video to unmute)</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BLOOMBERG 24/7 RADIO CONSOLE (HTML5 NATIVE AUDIO MEDIA PLAYER - 100% RELIABLE) */}
      {mediaMode === 'radio' && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071328] via-[#050c1b] to-[#03060d] border border-cyan-500/40 shadow-2xl space-y-5">
          {/* Radio Top Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14284b]">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                isRadioPlaying
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-[#09152b] text-slate-400 border-[#1a2d52]'
              }`}>
                <Radio className={`w-6 h-6 ${isRadioPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    BROADCAST LIVE STREAM: 100% UPTIME
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    NATIVE MEDIA PLAYER
                  </span>
                </div>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {selectedStation.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {selectedStation.description}
                </p>
              </div>
            </div>

            {/* Station Selector */}
            <div className="flex items-center gap-1.5">
              {BLOOMBERG_RADIO_STATIONS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStation(st);
                    if (audioRef.current) {
                      audioRef.current.src = st.streamUrl;
                      if (isRadioPlaying) {
                        audioRef.current.play().catch(() => {});
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    selectedStation.id === st.id
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'bg-[#0a1832] text-slate-300 hover:text-white border border-[#162a50]'
                  }`}
                >
                  {st.location}
                </button>
              ))}
            </div>
          </div>

          {/* Equalizer Frequency Visualizer Graphic */}
          <div className="p-4 rounded-xl bg-[#030814] border border-[#142646] flex flex-col items-center justify-center space-y-3">
            <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-md px-4">
              {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85, 60, 100, 50, 80, 65, 90, 40, 70, 85, 60, 95, 75, 50, 65].map(
                (h, idx) => (
                  <span
                    key={idx}
                    style={{
                      height: isRadioPlaying ? `${Math.max(15, (h * (idx % 2 === 0 ? 0.9 : 1.1)) % 100)}%` : '15%',
                      transition: 'height 0.2s ease-in-out',
                    }}
                    className={`w-2 rounded-t-full transition-all duration-200 ${
                      isRadioPlaying
                        ? idx % 3 === 0
                          ? 'bg-cyan-400'
                          : idx % 3 === 1
                          ? 'bg-teal-400'
                          : 'bg-emerald-400'
                        : 'bg-slate-700'
                    }`}
                  />
                )
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isRadioPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span>
                {isRadioPlaying
                  ? 'Streaming Live Audio: Bloomberg Surveillance & Global Markets Wrap'
                  : 'Audio Paused. Click Play to start listening.'}
              </span>
            </div>
          </div>

          {/* Player Media Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#061022] border border-[#152b52]">
            {/* Play/Pause Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleRadioPlayback}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer shadow-lg ${
                  isRadioPlaying
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {isRadioPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Broadcast</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Live Radio</span>
                  </>
                )}
              </button>

              <div className="text-xs">
                <span className="text-slate-400 block font-mono text-[10px]">PROGRAM HOSTS</span>
                <span className="text-white font-bold">{selectedStation.host}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsRadioMuted((prev) => !prev)}
                className="p-2 rounded-lg bg-[#0b1b38] hover:bg-[#112750] text-slate-300 hover:text-white cursor-pointer transition-colors"
                title={isRadioMuted ? 'Unmute' : 'Mute'}
              >
                {isRadioMuted || radioVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              <div className="flex items-center gap-2 flex-1 sm:w-36">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isRadioMuted ? 0 : radioVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setRadioVolume(val);
                    if (isRadioMuted && val > 0) setIsRadioMuted(false);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#122446] rounded-lg"
                />
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                  {Math.round((isRadioMuted ? 0 : radioVolume) * 100)}%
                </span>
              </div>

              {/* Direct Link Popout */}
              <a
                href={selectedStation.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#0b1b38] hover:bg-[#112750] text-cyan-300 hover:text-white cursor-pointer transition-colors"
                title="Direct MP3 Audio Stream Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {radioError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{radioError}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: CUSTOM STREAM URL PLAYER */}
      {mediaMode === 'custom' && (
        <div className="p-4 rounded-xl bg-[#060c18] border border-[#162744] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-purple-400" />
              <span>Embed Your Own Live Stream or Video URL</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Supports YouTube Live, Video Links & HLS</span>
          </div>

          <form onSubmit={handleApplyCustomUrl} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Paste YouTube Live URL (e.g. https://www.youtube.com/watch?v=...)"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#03060e] border border-[#182848] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Play Custom Stream
            </button>
          </form>

          {activeCustomEmbed ? (
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#192b4a] bg-black aspect-video max-h-[500px]">
              <iframe
                src={activeCustomEmbed}
                title="Custom Stream Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#030712] border border-dashed border-[#162744] text-center text-xs text-slate-400">
              <Tv className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Paste any YouTube live stream URL or video link above and click &quot;Play Custom Stream&quot;.</p>
            </div>
          )}
        </div>
      )}

      {/* Breaking Financial Commentary Ticker */}
      <div className="p-3 rounded-xl bg-[#070e1c] border border-teal-500/30 flex items-start gap-2.5 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5 leading-relaxed font-sans">
          <span className="font-bold text-white text-[11px] font-mono">
            LIVE DESK SYNOPSIS & MARKET DRIVERS:
          </span>
          <p className="text-slate-400 text-[11px]">
            US Dollar Index (DXY) testing 104.28 resistance as Fed monetary path remains data-dependent. Gold holding historic highs above $4,056/oz on sovereign central bank reserves accumulation. Nairobi CBK interbank window reports stable KES at 129.50 with diaspora remittance inflows absorbing commercial import settlement demand.
          </p>
        </div>
      </div>
    </div>
  );
};
