import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Clock,
} from 'lucide-react';

export interface PriceAlert {
  id: string;
  ticker: string;
  name: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  currency: string;
  note?: string;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTicker: string;
  currentName: string;
  currentPrice: number;
  currency: string;
  onTriggerAlert?: (alert: PriceAlert) => void;
}

// Sound chime for triggered alerts
export function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.24); // D6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Audio context may require user interaction
  }
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  currentTicker,
  currentName,
  currentPrice,
  currency,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('njia_price_alerts');
      return saved ? JSON.parse(saved) : [
        {
          id: 'alert-xau-1',
          ticker: 'XAU/USD',
          name: 'Gold (Spot FX) / US Dollar',
          condition: 'ABOVE',
          targetPrice: 4075.00,
          currency: 'USD',
          note: 'Breakout above daily resistance',
          isActive: true,
          isTriggered: false,
          createdAt: new Date().toLocaleDateString(),
        },
        {
          id: 'alert-xau-2',
          ticker: 'XAU/USD',
          name: 'Gold (Spot FX) / US Dollar',
          condition: 'BELOW',
          targetPrice: 4030.00,
          currency: 'USD',
          note: 'Key structural stop-loss support',
          isActive: true,
          isTriggered: false,
          createdAt: new Date().toLocaleDateString(),
        },
        {
          id: 'alert-usdkes',
          ticker: 'USD/KES',
          name: 'US Dollar / Kenyan Shilling',
          condition: 'BELOW',
          targetPrice: 128.50,
          currency: 'KES',
          note: 'CBK FX intervention bounce zone',
          isActive: true,
          isTriggered: false,
          createdAt: new Date().toLocaleDateString(),
        },
      ];
    } catch {
      return [];
    }
  });

  // Form states
  const [targetPriceInput, setTargetPriceInput] = useState<string>(
    (currentPrice * 1.01).toFixed(currentPrice < 10 ? 4 : 2)
  );
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [note, setNote] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync with current price when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetPriceInput(
        (condition === 'ABOVE' ? currentPrice * 1.008 : currentPrice * 0.992).toFixed(
          currentPrice < 10 ? 4 : 2
        )
      );
    }
  }, [isOpen, currentPrice, condition]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('njia_price_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetPriceInput);
    if (isNaN(target) || target <= 0) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      ticker: currentTicker,
      name: currentName,
      condition,
      targetPrice: target,
      currency,
      note: note.trim() || undefined,
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setNote('');
    if (soundEnabled) {
      playAlertChime();
    }
  };

  const handleToggleActive = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  const currentTickerAlerts = alerts.filter((a) => a.ticker === currentTicker);
  const otherAlerts = alerts.filter((a) => a.ticker !== currentTicker);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1a] border border-[#162540] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#141f33] flex items-center justify-between bg-[#060a13]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Live Price Alerts & Watch Triggers
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Get instant visual & audio notifications when {currentTicker} crosses your price targets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((p) => !p)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-[#121c2e] border-[#1d2d47] text-slate-400'
              }`}
              title={soundEnabled ? 'Chime sound on' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#142036] hover:bg-[#1b2b48] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          {/* New Alert Form */}
          <div className="p-4 rounded-xl bg-[#0d1524] border border-[#1a2b48] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0df2c9]" />
                Create Trigger for {currentTicker}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Live Rate: <strong className="text-white">{currency} {currentPrice.toFixed(currentPrice < 10 ? 4 : 2)}</strong>
              </span>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Condition */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">Condition</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#070b13] border border-[#162540]">
                    <button
                      type="button"
                      onClick={() => setCondition('ABOVE')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        condition === 'ABOVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      &gt;= Above
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('BELOW')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        condition === 'BELOW'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      &lt;= Below
                    </button>
                  </div>
                </div>

                {/* Target Price */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Target Level ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={targetPriceInput}
                    onChange={(e) => setTargetPriceInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#070b13] border border-[#162540] text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 4075.00"
                  />
                </div>

                {/* Note / Label */}
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Strategy Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070b13] border border-[#162540] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Daily Breakout"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Set Live Price Alert
                </button>
              </div>
            </form>
          </div>

          {/* Active Alerts for Current Ticker */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{currentTicker} Watchlist Triggers ({currentTickerAlerts.length})</span>
            </h3>

            {currentTickerAlerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#090e18] border border-[#141f33] text-center text-xs text-slate-500">
                No active price alerts for {currentTicker}. Set one above to be notified automatically.
              </div>
            ) : (
              <div className="space-y-2">
                {currentTickerAlerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      a.isTriggered
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : a.isActive
                        ? 'bg-[#0d1627] border-[#182744]'
                        : 'bg-[#080d16] border-[#121c2d] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          a.condition === 'ABOVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {a.condition === 'ABOVE' ? '≥' : '≤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-white">
                            {a.currency} {a.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          {a.isTriggered ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              TRIGGERED
                            </span>
                          ) : a.isActive ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              MONITORING
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400">
                              PAUSED
                            </span>
                          )}
                        </div>
                        {a.note && <p className="text-[11px] text-slate-400 mt-0.5">{a.note}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(a.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                          a.isActive
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-[#142036] border-[#1e2f4e] text-slate-400'
                        }`}
                      >
                        {a.isActive ? 'Active' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(a.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Monitored Assets */}
          {otherAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Other Monitored Instruments ({otherAlerts.length})
              </h3>
              <div className="space-y-2">
                {otherAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-[#080d16] border border-[#141f33] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{a.ticker}</span>
                        <span className="text-[10px] text-slate-500">{a.name}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-300 mt-0.5">
                        {a.condition === 'ABOVE' ? 'Above' : 'Below'} {a.currency} {a.targetPrice.toLocaleString()}
                        {a.note && <span className="text-slate-500 ml-2">({a.note})</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
