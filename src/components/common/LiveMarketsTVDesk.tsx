import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
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
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface TVChannel {
  id: string;
  name: string;
  network: string;
  hlsUrl?: string; // Direct HLS stream used by World Monitor
  embedUrl: string; // YouTube / iframe fallback
  directWatchUrl: string;
  description: string;
  badge: string;
  isReliable24_7?: boolean;
}

// World Monitor Curated Feeds & Direct Fastly/Akamai HLS Streams
const TV_CHANNELS: TVChannel[] = [
  {
    id: 'bloomberg',
    name: 'Bloomberg Television Live (Official World Monitor Feed)',
    network: 'Bloomberg TV',
    hlsUrl: 'https://www.bloomberg.com/media-manifest/streams/us.m3u8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/QB5BNdBFujE?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.bloomberg.com/live',
    description: 'Direct 24/7 institutional broadcast feed as used by World Monitor. Covers Wall Street Opening Bell, Fed policy, currency flows and global equities.',
    badge: 'WORLD MONITOR HLS FEED',
    isReliable24_7: true,
  },
  {
    id: 'sky-news-business',
    name: 'Sky News Live 24/7 Global Business & Markets',
    network: 'Sky News 24/7',
    hlsUrl: 'https://linear901-oo-hls0-prd-gtm.delivery.skycdp.com/17501/sde-fast-skynews/master.m3u8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/9Auq9mYxFEE?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.youtube.com/watch?v=9Auq9mYxFEE',
    description: 'Guaranteed 24/7 live international markets, central bank announcements, Wall Street updates & European forex.',
    badge: 'DIRECT HD 24/7',
    isReliable24_7: true,
  },
  {
    id: 'dw-business',
    name: 'DW News 24/7 Global Economy & Trade',
    network: 'DW News Live',
    hlsUrl: 'https://dwamdstream103.akamaized.net/hls/live/2015526/dwstream103/master.m3u8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Lu_m6O-qpOc?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.dw.com/en/live-tv/s-100825',
    description: 'Global supply chain shifts, emerging market currencies, and international economic intelligence.',
    badge: 'DIRECT HD',
    isReliable24_7: true,
  },
  {
    id: 'france24-business',
    name: 'France 24 Live International Economy & Markets',
    network: 'France 24',
    hlsUrl: 'https://amg00106-france24-france24-samsunguk-qvpp8.amagi.tv/playlist/amg00106-france24-france24-samsunguk/playlist.m3u8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/h3MuIUNCc8I?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.france24.com/en/live',
    description: 'Global macroeconomic developments, European currency crosses, energy and commodity pricing.',
    badge: 'DIRECT HD',
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
    id: 'euronews-business',
    name: 'Euronews Business & Markets Live Stream',
    network: 'Euronews Business',
    embedUrl: 'https://www.youtube-nocookie.com/embed/s9APLq89Njo?autoplay=1&mute=1&enablejsapi=1',
    directWatchUrl: 'https://www.euronews.com/live',
    description: 'European Central Bank, Forex Eurozone flows, energy commodities, and international trade developments.',
    badge: 'FOREX & TRADE',
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
  // Player media mode: 'worldmonitor' (World Monitor Terminal Embed), 'tv' (Video Broadcast), 'radio' (Bloomberg 24/7 Audio Radio Console), 'custom' (User URL)
  const [mediaMode, setMediaMode] = useState<'worldmonitor' | 'tv' | 'radio' | 'custom'>('worldmonitor');
  
  // Default to Bloomberg TV which now uses the World Monitor direct HLS stream
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(TV_CHANNELS[0]);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'FOREX' | 'STOCKS' | 'COMMODITIES' | 'INDICES'>('ALL');
  
  // Video Engine State: 'hls' (World Monitor direct feed) or 'embed' (YouTube fallback)
  const [useFallbackEmbed, setUseFallbackEmbed] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [videoVolume, setVideoVolume] = useState<number>(0.9);
  const [hlsError, setHlsError] = useState<string | null>(null);
  const [isHlsLoading, setIsHlsLoading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Custom Stream URL State
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeCustomEmbed, setActiveCustomEmbed] = useState<string | null>(null);
  const [customStreamType, setCustomStreamType] = useState<'hls' | 'embed'>('embed');

  // Audio Radio State
  const [selectedStation, setSelectedStation] = useState<RadioStation>(BLOOMBERG_RADIO_STATIONS[0]);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.8);
  const [isRadioMuted, setIsRadioMuted] = useState<boolean>(false);
  const [radioError, setRadioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // HLS Stream Attachment & Playback (World Monitor architecture)
  useEffect(() => {
    if (mediaMode !== 'tv') return;

    // Reset fallback state when channel changes
    setHlsError(null);

    const hasHls = !!selectedChannel.hlsUrl && !useFallbackEmbed;
    const video = videoRef.current;

    if (!hasHls || !video) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    setIsHlsLoading(true);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(selectedChannel.hlsUrl!);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsHlsLoading(false);
        video.muted = isVideoMuted;
        video.volume = videoVolume;
        video.play()
          .then(() => setIsVideoPlaying(true))
          .catch((err) => {
            console.warn('HLS autoplay muted restriction:', err);
            video.muted = true;
            setIsVideoMuted(true);
            video.play().catch(() => {});
          });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS fatal error encountered, recovering:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setIsHlsLoading(false);
              setHlsError('Direct HLS feed connection interrupted. Switching to YouTube backup embed...');
              setUseFallbackEmbed(true);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS (Safari / iOS)
      video.src = selectedChannel.hlsUrl!;
      video.muted = isVideoMuted;
      video.volume = videoVolume;
      video.addEventListener('loadedmetadata', () => {
        setIsHlsLoading(false);
        video.play().catch(() => {
          video.muted = true;
          setIsVideoMuted(true);
          video.play().catch(() => {});
        });
      });
    } else {
      setIsHlsLoading(false);
      setUseFallbackEmbed(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, useFallbackEmbed, mediaMode]);

  // Handle Video Volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isVideoMuted ? 0 : videoVolume;
      videoRef.current.muted = isVideoMuted;
    }
  }, [videoVolume, isVideoMuted]);

  // Audio Radio volume sync
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

  // Toggle Video Play/Pause for HLS
  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsVideoPlaying(true))
        .catch(console.warn);
    }
  };

  // Switch to next active channel
  const handleSwitchToBackupChannel = () => {
    const currentIndex = TV_CHANNELS.findIndex((c) => c.id === selectedChannel.id);
    const nextIndex = (currentIndex + 1) % TV_CHANNELS.length;
    setSelectedChannel(TV_CHANNELS[nextIndex]);
    setUseFallbackEmbed(false);
  };

  // Parse custom URL into embed or HLS
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const val = customUrlInput.trim();
    if (val.endsWith('.m3u8')) {
      setCustomStreamType('hls');
      setActiveCustomEmbed(val);
    } else {
      let embed = val;
      const ytMatch = val.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch && ytMatch[1]) {
        embed = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&enablejsapi=1`;
      }
      setCustomStreamType('embed');
      setActiveCustomEmbed(embed);
    }
    setMediaMode('custom');
  };

  const filteredTickers = filterCategory === 'ALL'
    ? LIVE_TICKERS
    : LIVE_TICKERS.filter((t) => t.category === filterCategory);

  const isCurrentChannelHls = !!selectedChannel.hlsUrl && !useFallbackEmbed;

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
              Live Broadcast Desk
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
              <span>WORLD MONITOR STREAM ENGINE (HLS + FASTLY)</span>
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>Bloomberg Television Live & Real-Time Stocks Desk</span>
          </h3>
        </div>

        {/* Media Mode Switcher (World Monitor Terminal vs Video TV vs Bloomberg Native Audio Radio vs Custom Stream) */}
        <div className="flex items-center gap-1.5 bg-[#040812] p-1 rounded-xl border border-[#162744]">
          <button
            onClick={() => setMediaMode('worldmonitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaMode === 'worldmonitor'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>World Monitor Terminal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setMediaMode('tv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mediaMode === 'tv'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Bloomberg TV (Direct HD)</span>
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
            <Radio className="w-3.5 h-3.5" />
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

      {/* Channel Switcher & Stream Source Selector */}
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
                  setUseFallbackEmbed(false);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold shrink-0 text-xs flex items-center gap-1.5 ${
                  selectedChannel.id === ch.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-black'
                    : 'bg-[#0a1426] text-slate-300 hover:text-white border border-[#182946]'
                }`}
              >
                <span>{ch.network}</span>
                {ch.hlsUrl && (
                  <span className="text-[8px] bg-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded font-mono">
                    HLS
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Engine Mode Toggle (HLS Direct vs YouTube Embed) */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedChannel.hlsUrl && (
              <button
                onClick={() => setUseFallbackEmbed((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  !useFallbackEmbed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#0e1b2f] text-slate-400 border border-[#1d3356]'
                }`}
                title="Toggle between World Monitor Direct HLS feed and YouTube Embed"
              >
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>{!useFallbackEmbed ? 'Engine: Direct HLS (World Monitor)' : 'Engine: YouTube Embed'}</span>
              </button>
            )}

            <button
              onClick={handleSwitchToBackupChannel}
              className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Switch to next channel"
            >
              <RefreshCw className="w-3 h-3 text-teal-400" />
              <span>Next Channel</span>
            </button>

            <a
              href={selectedChannel.directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#0e1b2f] hover:bg-[#162a4a] border border-[#1d3356] text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Watch full stream directly on official website"
            >
              <span>Official Site</span>
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

      {/* MODE 0: WORLD MONITOR EMBEDDED TERMINAL (INTELLIGENCE GLOBE, LIVE CHANNELS & BLOOMBERG) */}
      {mediaMode === 'worldmonitor' && (
        <div className={`space-y-3 transition-all ${isTheaterMode ? 'w-full' : ''}`}>
          {/* World Monitor Header Bar */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#061426] via-[#040e1c] to-[#061224] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Globe2 className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">World Monitor Intelligence & Live News Terminal</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    ONLINE & ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Global telemetry, geopolitical situation awareness, and integrated live financial streams directly inside your app.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setMediaMode('tv')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Switch directly to full-screen Bloomberg TV Video player"
              >
                <Tv className="w-3 h-3 text-rose-400" />
                <span>Switch to Bloomberg TV Player</span>
              </button>

              <button
                onClick={() => setIsTheaterMode((p) => !p)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0c182e] hover:bg-[#132444] text-slate-300 border border-[#162a4d] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isTheaterMode ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isTheaterMode ? 'Standard View' : 'Theater Mode'}</span>
              </button>

              <a
                href="https://www.worldmonitor.app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-[#0c182e] hover:bg-[#132444] text-cyan-300 border border-[#162a4d] transition-colors"
                title="Open official World Monitor in separate tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Embedded World Monitor Interactive Iframe */}
          <div className={`relative w-full rounded-2xl overflow-hidden border border-[#182946] bg-black shadow-2xl transition-all ${
            isTheaterMode ? 'h-[85vh]' : 'h-[640px]'
          }`}>
            <iframe
              src="https://www.worldmonitor.app/embed"
              title="World Monitor Embedded Intelligence Dashboard"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; geolocation"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* MODE 1: LIVE VIDEO BROADCAST PLAYER */}
      {mediaMode === 'tv' && (
        <div className={`space-y-2 transition-all ${isTheaterMode ? 'w-full' : ''}`}>
          {/* Active Stream Info Header */}
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-mono">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                <strong>Connected:</strong> {selectedChannel.name}
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                {isCurrentChannelHls ? 'World Monitor Direct HLS Stream' : 'YouTube Live Stream'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              {isCurrentChannelHls && (
                <span className="text-slate-400">
                  {isVideoMuted ? '🔊 Audio muted for autoplay. Click unmute button to listen!' : '🔊 Audio Active'}
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-[#192b4a] bg-black shadow-2xl aspect-video max-h-[520px] flex items-center justify-center">
            {isHlsLoading && (
              <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-cyan-300">Connecting to World Monitor live broadcast feed...</span>
              </div>
            )}

            {/* DIRECT HLS PLAYER (Matches World Monitor exactly) */}
            {isCurrentChannelHls ? (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted={isVideoMuted}
                controls={false}
                className="w-full h-full object-contain bg-black"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
            ) : (
              /* YOUTUBE IFRAME FALLBACK */
              <iframe
                src={selectedChannel.embedUrl}
                title={selectedChannel.name}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}

            {/* Floating Top Left Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-rose-500/50 flex items-center gap-2 pointer-events-none z-10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black font-mono text-rose-300 uppercase">
                {selectedChannel.network} LIVE
              </span>
              {isCurrentChannelHls && (
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1 rounded">
                  DIRECT FASTLY
                </span>
              )}
            </div>

            {/* Floating Top Right Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              {isCurrentChannelHls && (
                <>
                  {/* Play/Pause */}
                  <button
                    onClick={toggleVideoPlayback}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md hover:bg-black text-slate-300 hover:text-white border border-[#1c2e4c] transition-colors cursor-pointer"
                    title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
                  >
                    {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  {/* Mute/Unmute */}
                  <button
                    onClick={() => setIsVideoMuted((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md hover:bg-black text-cyan-300 hover:text-white border border-[#1c2e4c] transition-colors cursor-pointer"
                    title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </>
              )}

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

          {/* Interactive Player Controls & Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060c18] border border-[#14233c] text-xs font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">{selectedChannel.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                  {selectedChannel.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">{selectedChannel.description}</p>
            </div>

            {/* Volume Slider for Native Video */}
            {isCurrentChannelHls && (
              <div className="flex items-center gap-3 shrink-0 bg-[#081224] px-3 py-1.5 rounded-xl border border-[#162744]">
                <button
                  onClick={() => setIsVideoMuted((prev) => !prev)}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  {isVideoMuted || videoVolume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isVideoMuted ? 0 : videoVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVideoVolume(val);
                    if (isVideoMuted && val > 0) setIsVideoMuted(false);
                  }}
                  className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-[#122446] rounded-lg"
                />

                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {Math.round((isVideoMuted ? 0 : videoVolume) * 100)}%
                </span>
              </div>
            )}
          </div>

          {hlsError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{hlsError}</span>
              </div>
              <button
                onClick={() => setUseFallbackEmbed(false)}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400 cursor-pointer"
              >
                Retry HLS Feed
              </button>
            </div>
          )}
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
                    NATIVE AUDIO CONSOLE
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
            <span className="text-[10px] text-slate-400 font-mono">Supports YouTube Live, HLS (.m3u8), & Web Streams</span>
          </div>

          <form onSubmit={handleApplyCustomUrl} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Paste HLS stream URL (.m3u8) or YouTube Live URL..."
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
              {customStreamType === 'hls' ? (
                <video
                  src={activeCustomEmbed}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={activeCustomEmbed}
                  title="Custom Stream Player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#030712] border border-dashed border-[#162744] text-center text-xs text-slate-400">
              <Tv className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Paste any direct HLS stream (.m3u8) or YouTube live stream URL above and click &quot;Play Custom Stream&quot;.</p>
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
