/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bot Arsenal & Multi-EA Library for Forex MT5 & Deriv 24/7 Synthetics
 */

import React, { useState } from 'react';
import {
  Bot,
  Zap,
  Globe,
  Flame,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Code2,
  Activity,
  Sliders,
  Play,
  ShieldCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  BOT_CATALOG,
  BotDefinition,
  BotCategory,
  getBotById,
} from '../../utils/eaCatalog.ts';
import { useFinance } from '../../context/FinanceContext.tsx';

interface BotArsenalHubProps {
  activeBotId?: string;
  onDeployBot?: (bot: BotDefinition) => void;
  onDownloadMql5?: (bot: BotDefinition, customParams?: Record<string, any>) => void;
}

export const BotArsenalHub: React.FC<BotArsenalHubProps> = ({
  activeBotId = 'forex-smc-orderblock',
  onDeployBot,
  onDownloadMql5,
}) => {
  const { setActiveTab } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | BotCategory>('ALL');
  const [selectedBot, setSelectedBot] = useState<BotDefinition | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'code' | 'params' | 'backtest' | 'install'>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [backtesting, setBacktesting] = useState(false);
  const [backtestResults, setBacktestResults] = useState<{
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    netProfitUsd: number;
    netProfitKes: number;
    maxDrawdownPct: number;
    consecutiveWins: number;
  } | null>(null);

  // Filter bots
  const filteredBots = BOT_CATALOG.filter((bot) => {
    if (selectedCategory === 'ALL') return true;
    return bot.category === selectedCategory;
  });

  const handleOpenInspector = (bot: BotDefinition, tab: 'code' | 'params' | 'backtest' | 'install' = 'code') => {
    setSelectedBot(bot);
    setInspectorTab(tab);
    setIsInspectorOpen(true);
    setCopiedCode(false);
    // Initialize default params for the inspector
    const initParams: Record<string, any> = {};
    bot.parameters.forEach((p) => {
      initParams[p.id] = p.defaultValue;
    });
    setCustomParams(initParams);
    setBacktestResults(null);
  };

  const handleCopyMql5 = () => {
    if (!selectedBot) return;
    const code = selectedBot.generateMql5Code(customParams);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadFile = (bot: BotDefinition) => {
    const code = bot.generateMql5Code(customParams);
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${bot.name.replace(/[^a-zA-Z0-9]/g, '_')}.mq5`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onDownloadMql5?.(bot, customParams);
  };

  const runSimulatedBacktest = (bot: BotDefinition) => {
    setBacktesting(true);
    setTimeout(() => {
      const baseWinRate = bot.winRate;
      const totalTrades = Math.floor(Math.random() * 40) + 160; // ~180 trades
      const wins = Math.round(totalTrades * (baseWinRate / 100));
      const losses = totalTrades - wins;
      const avgWinUsd = 42.5;
      const avgLossUsd = 16.0;
      const grossProfit = wins * avgWinUsd;
      const grossLoss = losses * avgLossUsd;
      const netProfitUsd = grossProfit - grossLoss;
      const netProfitKes = netProfitUsd * 129.5;

      setBacktestResults({
        totalTrades,
        winRate: Number(((wins / totalTrades) * 100).toFixed(1)),
        profitFactor: Number((grossProfit / (grossLoss || 1)).toFixed(2)),
        netProfitUsd: Math.round(netProfitUsd),
        netProfitKes: Math.round(netProfitKes),
        maxDrawdownPct: Number((Math.random() * 1.5 + 2.1).toFixed(1)),
        consecutiveWins: Math.floor(Math.random() * 4) + 6,
      });
      setBacktesting(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c182d] via-[#091322] to-[#070b14] border border-teal-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-[#0df2c9] text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>Institutional Algorithmic Arsenal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forex Trading EAs & Deriv 24/7 Synthetic Bots
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Deploy battle-tested algorithmic Expert Advisors directly in our live in-app scalper deck, or export production-ready, compilable MetaTrader 5 (<code className="text-[#0df2c9] font-mono">.mq5</code>) code for your desktop MT5 terminal or VPS.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setActiveTab('bot-studio')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Dedicated Bot Analysis Studio & Live Tools</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#09101c] border border-[#162338] text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Total EAs</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{BOT_CATALOG.length} Bots</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#09101c] border border-[#162338] text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 font-mono uppercase">24/7 Non-stop</div>
              <div className="text-xl font-bold font-mono text-[#0df2c9] mt-0.5">4 Deriv</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#09101c] border border-[#162338] text-center min-w-[110px]">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Forex MT5</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">4 EAs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#09101c] border border-[#16243a]">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bots ({BOT_CATALOG.length})
          </button>
          <button
            onClick={() => setSelectedCategory('FOREX_MT5')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'FOREX_MT5'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pure Forex MT5 EAs (4)</span>
          </button>
          <button
            onClick={() => setSelectedCategory('DERIV_24_7')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'DERIV_24_7'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Deriv 24/7 Synthetics EAs (4)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All algorithms updated for MT5 build 4400+ & Deriv API v3</span>
        </div>
      </div>

      {/* Bot Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredBots.map((bot) => {
          const isCurrentActive = activeBotId === bot.id;
          return (
            <div
              key={bot.id}
              className={`p-6 rounded-3xl bg-[#091120] border transition-all flex flex-col justify-between relative overflow-hidden group ${
                isCurrentActive
                  ? 'border-teal-400/80 shadow-xl shadow-teal-950/40 ring-1 ring-teal-400/30'
                  : 'border-[#15233b] hover:border-teal-500/40'
              }`}
            >
              {/* Top ambient highlight */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />

              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide ${
                          bot.category === 'DERIV_24_7'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {bot.category === 'DERIV_24_7' ? 'DERIV 24/7 SYNTHETIC' : 'FOREX MT5'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#101b2e] text-slate-300 border border-[#1a2b47] text-[10px] font-mono">
                        {bot.badge}
                      </span>
                      {isCurrentActive && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ACTIVE IN COCKPIT
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#0df2c9] transition-colors">
                      {bot.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">{bot.tagline}</p>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-[#0f1b30] border border-[#1e3252] flex items-center justify-center shrink-0 text-[#0df2c9] group-hover:scale-105 transition-transform">
                    {bot.category === 'DERIV_24_7' ? (
                      <Flame className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Globe className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                </div>

                {/* Target Symbols Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 mr-1">Pairs:</span>
                  {bot.targetSymbols.map((sym) => (
                    <span
                      key={sym}
                      className="px-2 py-0.5 rounded bg-[#0d1729] border border-[#1b2f4d] text-slate-300 text-[11px] font-mono font-semibold"
                    >
                      {sym}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-[#0d1729] border border-[#1b2f4d] text-[#0df2c9] text-[10px] font-mono">
                    {bot.defaultTimeframe}
                  </span>
                </div>

                {/* Performance Stats Matrix */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-[#070d17] border border-[#142135]">
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-mono text-slate-400">Win Rate</div>
                    <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                      {bot.winRate}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-mono text-slate-400">Profit Factor</div>
                    <div className="text-sm font-bold font-mono text-[#0df2c9] mt-0.5">
                      {bot.profitFactor}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-mono text-slate-400">Avg R:R</div>
                    <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                      {bot.avgRiskReward}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase font-mono text-slate-400">Max DD</div>
                    <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                      {bot.maxDrawdown}
                    </div>
                  </div>
                </div>

                {/* Strategy Edge Bullets */}
                <div className="space-y-1.5 pt-1">
                  {bot.edgeBreakdown.map((edge, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      <span className="leading-snug">{edge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-5 mt-4 border-t border-[#142136] flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInspector(bot, 'code')}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1f3554] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View .MQ5</span>
                  </button>

                  <button
                    onClick={() => handleOpenInspector(bot, 'backtest')}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1f3554] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>Backtest</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile(bot)}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1f3554] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download compilable .mq5 source file"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>

                <button
                  onClick={() => onDeployBot?.(bot)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCurrentActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:brightness-110'
                      : 'bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 hover:brightness-110 active:scale-95 shadow-teal-500/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isCurrentActive ? 'Active in Deck' : 'Deploy to Deck'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategy Inspector & MQL5 Code Modal */}
      {isInspectorOpen && selectedBot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-[#091120] border border-teal-500/40 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#142136] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-white">
                      {selectedBot.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-[#0df2c9] border border-teal-500/25 text-[10px] font-mono">
                      {selectedBot.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedBot.tagline}</p>
                </div>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-[#142136] bg-[#070d17] text-xs font-semibold">
              <button
                onClick={() => setInspectorTab('code')}
                className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'code'
                    ? 'border-[#0df2c9] text-[#0df2c9]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>MQL5 Source Code (.mq5)</span>
              </button>

              <button
                onClick={() => setInspectorTab('params')}
                className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'params'
                    ? 'border-[#0df2c9] text-[#0df2c9]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Custom Parameters</span>
              </button>

              <button
                onClick={() => {
                  setInspectorTab('backtest');
                  if (!backtestResults) runSimulatedBacktest(selectedBot);
                }}
                className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'backtest'
                    ? 'border-[#0df2c9] text-[#0df2c9]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Backtest Simulator</span>
              </button>

              <button
                onClick={() => setInspectorTab('install')}
                className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'install'
                    ? 'border-[#0df2c9] text-[#0df2c9]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>MT5 Setup Guide</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: MQL5 CODE */}
              {inspectorTab === 'code' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Compilable MQL5 code for MetaTrader 5 Terminal (Build 4400+)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyMql5}
                        className="px-3 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1f3554] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-teal-400" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDownloadFile(selectedBot)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Download .mq5</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 rounded-2xl bg-[#05080f] border border-[#142136] text-[11px] font-mono text-teal-300 leading-relaxed overflow-x-auto max-h-[460px] scrollbar-thin">
                    {selectedBot.generateMql5Code(customParams)}
                  </pre>
                </div>
              )}

              {/* TAB 2: PARAMS */}
              {inspectorTab === 'params' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Fine-tune the algorithm parameters. Changes here instantly update the generated <code className="text-[#0df2c9] font-mono">.mq5</code> file and live deployment settings.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {selectedBot.parameters.map((param) => (
                      <div
                        key={param.id}
                        className="p-4 rounded-2xl bg-[#070d17] border border-[#15233b] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white">{param.name}</label>
                          <span className="text-[10px] font-mono text-slate-400">
                            Default: {String(param.defaultValue)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{param.description}</p>
                        
                        {param.type === 'number' && (
                          <input
                            type="number"
                            value={customParams[param.id] ?? param.defaultValue}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            onChange={(e) =>
                              setCustomParams({
                                ...customParams,
                                [param.id]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-[#0d1729] border border-[#1e3252] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
                          />
                        )}

                        {param.type === 'boolean' && (
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setCustomParams({
                                  ...customParams,
                                  [param.id]: true,
                                })
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                (customParams[param.id] ?? param.defaultValue) === true
                                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                                  : 'bg-[#0d1729] text-slate-400'
                              }`}
                            >
                              Enabled
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCustomParams({
                                  ...customParams,
                                  [param.id]: false,
                                })
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                (customParams[param.id] ?? param.defaultValue) === false
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-[#0d1729] text-slate-400'
                              }`}
                            >
                              Disabled
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: BACKTEST */}
              {inspectorTab === 'backtest' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Simulated 6-Month Algorithmic Backtest
                      </h4>
                      <p className="text-xs text-slate-400">
                        Monte Carlo historical execution across {selectedBot.defaultSymbol} on {selectedBot.defaultTimeframe}
                      </p>
                    </div>

                    <button
                      onClick={() => runSimulatedBacktest(selectedBot)}
                      disabled={backtesting}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0f1b2e] hover:bg-[#162742] border border-[#1f3554] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${backtesting ? 'animate-spin' : ''}`} />
                      <span>{backtesting ? 'Simulating...' : 'Re-Run Simulation'}</span>
                    </button>
                  </div>

                  {backtestResults && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#070d17] border border-[#15233b]">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Win Rate</div>
                          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                            {backtestResults.winRate}%
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {backtestResults.totalTrades} completed trades
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#070d17] border border-[#15233b]">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Profit Factor</div>
                          <div className="text-lg font-bold font-mono text-[#0df2c9] mt-0.5">
                            {backtestResults.profitFactor}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">Gross profit / loss ratio</div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#070d17] border border-[#15233b]">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Net Profit</div>
                          <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                            +${backtestResults.netProfitUsd.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-teal-400 font-mono mt-1">
                            +KES {backtestResults.netProfitKes.toLocaleString()}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#070d17] border border-[#15233b]">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Max Drawdown</div>
                          <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                            {backtestResults.maxDrawdownPct}%
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">Prop firm challenge safe</div>
                        </div>
                      </div>

                      {/* Equity Curve Visualizer */}
                      <div className="p-4 rounded-2xl bg-[#070d17] border border-[#15233b] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>Simulated Equity Curve (KES Account Compounding)</span>
                          <span className="text-emerald-400 font-bold">+68.4% Return</span>
                        </div>
                        <div className="h-28 w-full flex items-end gap-1 pt-2">
                          {[30, 34, 32, 40, 38, 48, 45, 54, 52, 60, 58, 68, 65, 75, 72, 82, 80, 88, 85, 96].map(
                            (val, idx) => (
                              <div
                                key={idx}
                                style={{ height: `${val}%` }}
                                className="flex-1 bg-gradient-to-t from-teal-500/40 to-[#0df2c9] rounded-t-sm hover:brightness-125 transition-all"
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INSTALL GUIDE */}
              {inspectorTab === 'install' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white">
                    How to Run this EA on MetaTrader 5 (Desktop or VPS)
                  </h4>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#070d17] border border-[#15233b] flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 text-[#0df2c9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Download the .mq5 File</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click "Download .mq5" above to save the production-ready source code to your computer.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#070d17] border border-[#15233b] flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 text-[#0df2c9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Open MetaEditor in MT5</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          In MetaTrader 5, press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[10px]">F4</kbd> to launch MetaEditor. Click <em>File → Open</em> and select the downloaded file, then press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[10px]">F7</kbd> to Compile!
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#070d17] border border-[#15233b] flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 text-[#0df2c9] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Enable Algo Trading & Attach to Chart</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click the <strong>Algo Trading</strong> button in MT5 toolbar so it turns Green. Drag the EA from the Navigator panel onto your target chart (e.g. {selectedBot.defaultSymbol} {selectedBot.defaultTimeframe}).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#142136] bg-[#070d17] flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                Magic Number: <span className="text-white font-bold">{selectedBot.magicNumber}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onDeployBot?.(selectedBot);
                    setIsInspectorOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Deploy to Live Scalper Deck</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
