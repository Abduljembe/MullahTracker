import React, { useState, useMemo } from 'react';
import {
  Grid,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Layers,
  HelpCircle,
  ShieldAlert,
  ArrowRightLeft,
  DollarSign,
  Info,
} from 'lucide-react';

const PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'XAU/USD',
];

// Statistically representative correlation matrix (Daily/1H rolling coefficients)
const CORRELATION_DATA: Record<string, Record<string, number>> = {
  'EUR/USD': {
    'EUR/USD': 1.0,
    'GBP/USD': 0.88,
    'USD/JPY': -0.42,
    'USD/CHF': -0.91,
    'AUD/USD': 0.74,
    'USD/CAD': -0.78,
    'NZD/USD': 0.69,
    'XAU/USD': 0.63,
  },
  'GBP/USD': {
    'EUR/USD': 0.88,
    'GBP/USD': 1.0,
    'USD/JPY': -0.35,
    'USD/CHF': -0.84,
    'AUD/USD': 0.71,
    'USD/CAD': -0.73,
    'NZD/USD': 0.67,
    'XAU/USD': 0.58,
  },
  'USD/JPY': {
    'EUR/USD': -0.42,
    'GBP/USD': -0.35,
    'USD/JPY': 1.0,
    'USD/CHF': 0.52,
    'AUD/USD': -0.28,
    'USD/CAD': 0.46,
    'NZD/USD': -0.24,
    'XAU/USD': -0.48,
  },
  'USD/CHF': {
    'EUR/USD': -0.91,
    'GBP/USD': -0.84,
    'USD/JPY': 0.52,
    'USD/CHF': 1.0,
    'AUD/USD': -0.76,
    'USD/CAD': 0.79,
    'NZD/USD': -0.71,
    'XAU/USD': -0.66,
  },
  'AUD/USD': {
    'EUR/USD': 0.74,
    'GBP/USD': 0.71,
    'USD/JPY': -0.28,
    'USD/CHF': -0.76,
    'AUD/USD': 1.0,
    'USD/CAD': -0.72,
    'NZD/USD': 0.86,
    'XAU/USD': 0.71,
  },
  'USD/CAD': {
    'EUR/USD': -0.78,
    'GBP/USD': -0.73,
    'USD/JPY': 0.46,
    'USD/CHF': 0.79,
    'AUD/USD': -0.72,
    'USD/CAD': 1.0,
    'NZD/USD': -0.68,
    'XAU/USD': -0.59,
  },
  'NZD/USD': {
    'EUR/USD': 0.69,
    'GBP/USD': 0.67,
    'USD/JPY': -0.24,
    'USD/CHF': -0.71,
    'AUD/USD': 0.86,
    'USD/CAD': -0.68,
    'NZD/USD': 1.0,
    'XAU/USD': 0.64,
  },
  'XAU/USD': {
    'EUR/USD': 0.63,
    'GBP/USD': 0.58,
    'USD/JPY': -0.48,
    'USD/CHF': -0.66,
    'AUD/USD': 0.71,
    'USD/CAD': -0.59,
    'NZD/USD': 0.64,
    'XAU/USD': 1.0,
  },
};

interface CurrencyCorrelationMatrixProps {
  currentTicker?: string;
  onSelectPair?: (pair: string) => void;
}

export const CurrencyCorrelationMatrix: React.FC<CurrencyCorrelationMatrixProps> = ({
  currentTicker = 'EUR/USD',
  onSelectPair,
}) => {
  const [selectedPair, setSelectedPair] = useState<string>(currentTicker);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Simulated open positions for net exposure calculator
  const [openPositions, setOpenPositions] = useState<Array<{ id: string; pair: string; direction: 'BUY' | 'SELL'; lots: number }>>([
    { id: '1', pair: 'EUR/USD', direction: 'BUY', lots: 0.5 },
    { id: '2', pair: 'GBP/USD', direction: 'BUY', lots: 0.3 },
  ]);

  const [newPair, setNewPair] = useState('XAU/USD');
  const [newDir, setNewDir] = useState<'BUY' | 'SELL'>('BUY');
  const [newLots, setNewLots] = useState(0.2);

  // Sync with currentTicker prop
  React.useEffect(() => {
    if (PAIRS.includes(currentTicker)) {
      setSelectedPair(currentTicker);
    }
  }, [currentTicker]);

  // Net Currency Exposure Calculator
  const netExposure = useMemo(() => {
    const exposure: Record<string, number> = {
      USD: 0,
      EUR: 0,
      GBP: 0,
      JPY: 0,
      CHF: 0,
      AUD: 0,
      CAD: 0,
      NZD: 0,
      XAU: 0,
    };

    openPositions.forEach((pos) => {
      const [base, quote] = pos.pair.split('/');
      const lots = pos.lots;

      if (pos.direction === 'BUY') {
        // Long Base, Short Quote
        if (exposure[base] !== undefined) exposure[base] += lots;
        if (exposure[quote] !== undefined) exposure[quote] -= lots;
      } else {
        // Short Base, Long Quote
        if (exposure[base] !== undefined) exposure[base] -= lots;
        if (exposure[quote] !== undefined) exposure[quote] += lots;
      }
    });

    return exposure;
  }, [openPositions]);

  // Check if user has high concentrated exposure
  const concentratedUSD = Math.abs(netExposure['USD']) >= 0.7;

  const handleAddPosition = () => {
    setOpenPositions((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        pair: newPair,
        direction: newDir,
        lots: Number(newLots),
      },
    ]);
  };

  const handleRemovePosition = (id: string) => {
    setOpenPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return 'bg-[#122b28] text-teal-300 font-black border-teal-500/40';
    if (val >= 0.75) return 'bg-emerald-950/70 text-emerald-300 font-bold border-emerald-700/50';
    if (val >= 0.45) return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30';
    if (val <= -0.75) return 'bg-rose-950/70 text-rose-300 font-bold border-rose-700/50';
    if (val <= -0.45) return 'bg-rose-950/30 text-rose-400 border-rose-900/30';
    return 'bg-[#0a1426] text-slate-400 border-[#14233c]';
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#091120] border border-[#162744] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#14233c]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">
              Cross-Asset Correlation Engine
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              8×8 HEATMAP
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>Forex Pair Correlation & Portfolio Exposure Matrix</span>
          </h3>
        </div>

        <button
          onClick={() => setShowExplanation((prev) => !prev)}
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>{showExplanation ? 'Hide Guide' : 'How Correlation Works'}</span>
        </button>
      </div>

      {/* Guide Banner */}
      {showExplanation && (
        <div className="p-3.5 rounded-xl bg-[#060c18] border border-teal-500/30 text-xs text-slate-300 space-y-1.5 animate-in fade-in">
          <span className="font-bold text-white block">Understanding Currency Correlation:</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • <strong className="text-emerald-400">+0.75 to +1.00 (Strong Positive):</strong> Pairs move in the exact same direction. (e.g. Buying both EUR/USD and GBP/USD doubles your short USD risk).
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • <strong className="text-rose-400">-0.75 to -1.00 (Strong Inverse):</strong> Pairs move in opposite directions. (e.g. EUR/USD and USD/CHF have a -0.91 inverse correlation).
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • <strong className="text-slate-300">-0.30 to +0.30 (Neutral):</strong> Independence. Excellent for portfolio diversification.
          </p>
        </div>
      )}

      {/* Correlation Heatmap Table */}
      <div className="overflow-x-auto rounded-xl border border-[#14233c] bg-[#060c18]">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-[#081224] border-b border-[#14233c]">
              <th className="p-2.5 text-left text-slate-400 font-bold text-[10px] uppercase">
                Pair
              </th>
              {PAIRS.map((pair) => (
                <th
                  key={pair}
                  className={`p-2.5 text-center font-bold text-[10px] uppercase ${
                    selectedPair === pair ? 'text-teal-400 bg-teal-950/40' : 'text-slate-300'
                  }`}
                >
                  {pair.replace('/USD', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAIRS.map((rowPair) => (
              <tr
                key={rowPair}
                className={`border-b border-[#121f36] hover:bg-[#0a1426] transition-colors ${
                  selectedPair === rowPair ? 'bg-teal-950/20' : ''
                }`}
              >
                <td className="p-2.5 font-bold text-white flex items-center justify-between">
                  <span>{rowPair}</span>
                  <button
                    onClick={() => {
                      setSelectedPair(rowPair);
                      onSelectPair?.(rowPair);
                    }}
                    className="text-[9px] text-slate-500 hover:text-teal-400 underline cursor-pointer ml-2"
                  >
                    inspect
                  </button>
                </td>

                {PAIRS.map((colPair) => {
                  const val = CORRELATION_DATA[rowPair]?.[colPair] ?? 0;
                  const isSelf = rowPair === colPair;
                  return (
                    <td
                      key={colPair}
                      className={`p-2 text-center border-l border-[#121f36] ${getHeatmapColor(val)}`}
                      title={`${rowPair} vs ${colPair}: ${(val * 100).toFixed(0)}% correlation`}
                    >
                      {isSelf ? (
                        <span className="text-teal-300 font-black">1.00</span>
                      ) : (
                        <span>
                          {val >= 0 ? '+' : ''}
                          {val.toFixed(2)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Net Portfolio Exposure Sentinel */}
      <div className="p-3.5 rounded-xl bg-[#060c18] border border-[#14233c] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Net Directional Currency Exposure Checker
            </h4>
          </div>

          {concentratedUSD && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>HIGH CONCENTRATED USD EXPOSURE ({netExposure['USD'].toFixed(2)} Lots)</span>
            </span>
          )}
        </div>

        {/* Exposure Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-mono">
          {Object.entries(netExposure).map(([curr, lots]) => {
            const isLong = lots > 0.001;
            const isShort = lots < -0.001;
            return (
              <div
                key={curr}
                className={`p-2 rounded-lg border text-center ${
                  isLong
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : isShort
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-[#080f1d] border-[#132238] text-slate-500'
                }`}
              >
                <span className="text-[10px] text-slate-400 block font-bold">{curr}</span>
                <span className="text-xs font-black">
                  {lots > 0 ? '+' : ''}
                  {lots.toFixed(2)} L
                </span>
                <span className="text-[9px] block text-slate-400">
                  {isLong ? 'NET LONG' : isShort ? 'NET SHORT' : 'FLAT'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Open Positions List & Add */}
        <div className="pt-2 border-t border-[#14233c] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Simulated Active Positions ({openPositions.length}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {openPositions.map((pos) => (
              <div
                key={pos.id}
                className="px-2.5 py-1 rounded-lg bg-[#0b1526] border border-[#172744] text-xs font-mono flex items-center gap-2"
              >
                <span className={pos.direction === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {pos.direction} {pos.lots}L {pos.pair}
                </span>
                <button
                  onClick={() => handleRemovePosition(pos.id)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Quick Add Position Form */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <select
                value={newPair}
                onChange={(e) => setNewPair(e.target.value)}
                className="px-2 py-1 rounded bg-[#070d18] border border-[#152540] text-slate-300 text-xs"
              >
                {PAIRS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={newDir}
                onChange={(e) => setNewDir(e.target.value as 'BUY' | 'SELL')}
                className="px-2 py-1 rounded bg-[#070d18] border border-[#152540] text-slate-300 text-xs"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
              <input
                type="number"
                step="0.1"
                min="0.01"
                value={newLots}
                onChange={(e) => setNewLots(parseFloat(e.target.value) || 0.1)}
                className="w-16 px-2 py-1 rounded bg-[#070d18] border border-[#152540] text-white text-xs"
              />
              <button
                onClick={handleAddPosition}
                className="px-2 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
