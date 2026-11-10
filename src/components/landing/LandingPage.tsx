/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * MullahTracker Flagship Landing Page
 * Unified Wealth Management OS & 24/7 Algorithmic Trading Terminal
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Banknote,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
  Sparkles,
  ChevronRight,
  Calculator,
  BarChart2,
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  Users,
  Award,
  CalendarDays,
  Crosshair,
  Activity,
  Radio,
  Cpu,
  Wallet,
  RefreshCw,
  Play,
  Layers,
  ArrowUpRight,
  Sliders,
  DollarSign,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useFinance } from '../../context/FinanceContext.tsx';
import { AppLogo } from '../common/AppLogo.tsx';
import { LiveMarketTickerTape } from '../trading/LiveMarketTickerTape.tsx';

interface LandingPageProps {
  onEnterApp?: () => void;
  initialMode?: 'signup' | 'login';
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, initialMode = 'login' }) => {
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
    authError,
    clearAuthError,
  } = useAuth();

  const { formatCurrency } = useFinance();

  const [authTab, setAuthTab] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'trading' | 'wealth'>('trading');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (authTab === 'signup') {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onEnterApp?.();
    } catch {
      // Handled in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onEnterApp?.();
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      onEnterApp?.();
    } catch {
      onEnterApp?.();
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 pointer-events-none fintech-grid-bg opacity-70 z-0" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <header className="relative z-30 border-b border-[#141f33] bg-[#070b14]/90 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <AppLogo size="md" subtext="Wealth OS & 24/7 Scalper" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection('trading-section')}
              className="hover:text-[#0df2c9] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#0df2c9]" />
              <span>24/7 Deriv & MT5</span>
            </button>
            <button
              onClick={() => scrollToSection('bento-features')}
              className="hover:text-teal-300 transition-colors cursor-pointer"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('mpesa-section')}
              className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>M-Pesa & FIRE</span>
            </button>
            <button
              onClick={() => scrollToSection('specs-table')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Instruments
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="hover:text-slate-100 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleGuestDemo}
                  disabled={loading}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 text-[#0df2c9] fill-[#0df2c9]" />
                  <span>Instant Demo</span>
                </button>
                <button
                  onClick={() => {
                    setAuthTab('login');
                    scrollToSection('signup-section');
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-[#1e2e48] hover:border-slate-400 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab('signup');
                    scrollToSection('signup-section');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Live Market Streaming Ticker Tape */}
      <div className="relative z-20 border-b border-[#141f33] bg-[#090f1d]/90 backdrop-blur-md">
        <LiveMarketTickerTape />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Mission, Value Props, and Interactive HUD Previews */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Live System Pip */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0d1829] border border-teal-500/30 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[#0df2c9] font-semibold tracking-wide uppercase text-[10px] font-mono">
                280ms Tick Engine Active
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 text-[11px]">Deriv 24/7 Synthetics & M-Pesa Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              Master Real Cashflow.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0df2c9] via-teal-300 to-cyan-400">
                Scalp Markets 24/7.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              The high-performance East African wealth OS and trading cockpit. Seamlessly parse M-Pesa SMS records, build a 12-month liquid emergency runway in KES, track compounding SACCO & MMF yields, and scalp Deriv synthetic indices & Gold Spot with sub-second MT5-speed execution.
            </p>

            {/* Quick Proof Pills */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1a2840]">
                <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Execution
                </div>
                <div className="text-sm font-bold text-white mt-1 font-mono">280ms Ticks</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1a2840]">
                <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#0df2c9]" /> M-Pesa
                </div>
                <div className="text-sm font-bold text-white mt-1 font-mono">Instant Sweep</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1a2840]">
                <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" /> Privacy
                </div>
                <div className="text-sm font-bold text-white mt-1 font-mono">Zero-Knowledge</div>
              </div>
            </div>

            {/* Dual Interactive Preview Card */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span>Interactive Cockpit Preview</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-[#0b1220] p-0.5 rounded-lg border border-[#17253b] text-[11px] font-semibold">
                  <button
                    onClick={() => setActivePreviewTab('trading')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePreviewTab === 'trading'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>24/7 Scalper HUD</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('wealth')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePreviewTab === 'wealth'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-3 h-3" />
                    <span>Wealth OS & Runway</span>
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              {activePreviewTab === 'trading' ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#090f1d] border border-teal-500/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-teal-500/20 text-[#0df2c9] font-mono text-[10px] font-bold rounded-bl-xl border-l border-b border-teal-500/30">
                    LIVE PAPER SIMULATOR
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#141f33]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                        XAU
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Gold Spot (XAUUSD)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                            LONG 0.25 LOTS
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Entry: $4,098.20 • Current: <span className="text-[#0df2c9] font-bold">$4,102.90</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Floating P&L</div>
                      <div className="text-base sm:text-lg font-extrabold font-mono text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>+KES 14,850.00</span>
                        <span className="text-xs text-emerald-300 font-normal">(+12.4%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro action strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                    <div className="p-2.5 rounded-xl bg-[#0e1728] border border-[#1b2a42]">
                      <div className="text-[10px] text-slate-400 font-mono">Spike Hunter</div>
                      <div className="text-xs font-bold text-[#0df2c9] mt-0.5">Boom 1000 Arm</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0e1728] border border-[#1b2a42]">
                      <div className="text-[10px] text-slate-400 font-mono">Trailing Stop</div>
                      <div className="text-xs font-bold text-cyan-400 mt-0.5">Break-Even Locked</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0e1728] border border-[#1b2a42]">
                      <div className="text-[10px] text-slate-400 font-mono">Deriv Synthetic</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">V75 24/7 Active</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-teal-300 font-mono uppercase">1-Click Profit</div>
                        <div className="text-xs font-bold text-[#0df2c9]">Sweep M-Pesa</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0df2c9]" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#090f1d] border border-[#17253b] shadow-2xl space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4a]">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Banknote className="w-3 h-3 text-emerald-400" /> Monthly Inflows
                      </div>
                      <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-1">
                        KES 145,000
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4a]">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-rose-400" /> Outflows
                      </div>
                      <div className="text-sm sm:text-base font-bold font-mono text-rose-400 mt-1">
                        KES 48,000
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4a]">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <PiggyBank className="w-3 h-3 text-cyan-400" /> Liquid Runway
                      </div>
                      <div className="text-sm sm:text-base font-bold font-mono text-[#00d2ff] mt-1">
                        8.4 Months
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2a42] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Safaricom M-Pesa SMS Parser</div>
                        <div className="text-[10px] text-slate-400">Auto-categorized 14 paybill & buy goods txns</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                      SYNCED
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Direct Sign In / Create Account Card */}
          <div id="signup-section" className="lg:col-span-5 scroll-mt-20">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0a1120]/95 border border-teal-500/30 backdrop-blur-2xl shadow-2xl shadow-teal-950/40 relative overflow-hidden">
              {/* Top ambient spotlight */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-[#18263e]">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {authTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authTab === 'signup'
                      ? 'Access 24/7 trading & financial OS in seconds'
                      : 'Sign in to access your encrypted personal vault'}
                  </p>
                </div>

                {/* Segmented Tab Switcher */}
                <div className="flex bg-[#070b14] p-1 rounded-xl border border-[#1a2942] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthError();
                      setAuthTab('signup');
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      authTab === 'signup'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthError();
                      setAuthTab('login');
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Log In
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="space-y-4 pt-4">
                {authError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                    {authError}
                  </div>
                )}

                {/* Google 1-Tap Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#111c2e] hover:bg-[#16243b] border border-[#203250] text-white text-xs font-semibold transition-all hover:border-slate-400 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#1a2840]" />
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                    or continue with email
                  </span>
                  <div className="h-px flex-1 bg-[#1a2840]" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {authTab === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g. Rashid Juma"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-[#101828] border border-[#1c2c46] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#101828] border border-[#1c2c46] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full bg-[#101828] border border-[#1c2c46] rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>
                      {loading
                        ? 'Connecting...'
                        : authTab === 'signup'
                        ? 'Create Free Account & Launch'
                        : 'Sign In to Your Vault'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>

                {/* Instant Guest Demo Launch */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleGuestDemo}
                    disabled={loading}
                    className="text-xs text-teal-300 hover:text-white transition-colors underline decoration-dotted font-medium cursor-pointer"
                  >
                    Skip credentials: Open Instant Guest Demo →
                  </button>
                </div>

                <div className="pt-3 border-t border-[#17253b] text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Firebase Firestore encrypted cloud database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Bento Grid Features */}
      <section id="bento-features" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#141f33]">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[#0df2c9] text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Institutional Grade Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for East African Savers & Global Scalpers
          </h2>
          <p className="text-sm text-slate-400">
            From automated M-Pesa statements and KRA statutory deductions to 24/7 sub-second Deriv synthetic scalping.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: 8 Forex MT5 & Deriv 24/7 Algorithmic Bots (Double Span) */}
          <div id="trading-section" className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080e1b] border border-teal-500/30 hover:border-teal-400/50 transition-all space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
                  <Crosshair className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#0df2c9]" />
                    <span>8 Battle-Tested Algorithmic EAs</span>
                  </span>
                  <h3 className="text-lg font-bold text-white">Forex MT5 EAs & Deriv 24/7 Synthetics Bots</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                MQL5 EXPORT READY
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Complete automated bot suite. Pure Forex MT5 EAs (Apex London Breakout, Institutional SMC Order Blocks, Currency Strength Matrix) + Deriv 24/7 Synthetics Bots (Boom/Crash Spike Predator, V75 Harvester, Step Index Ping-Pong). Instant in-app paper deployment or compilable <span className="text-[#0df2c9] font-mono font-bold">.mq5</span> download for desktop MT5.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-2.5 rounded-xl bg-[#0e192c] border border-[#192a47]">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Forex MT5</div>
                <div className="text-xs font-bold text-cyan-300 mt-0.5">London & SMC FVG</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e192c] border border-[#192a47]">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Deriv 24/7</div>
                <div className="text-xs font-bold text-amber-300 mt-0.5">Spike & V75 Harvester</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e192c] border border-[#192a47]">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Tick Speed</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">280ms Low-Latency</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e192c] border border-[#192a47]">
                <div className="text-[9px] text-slate-400 font-mono uppercase">Backtesting</div>
                <div className="text-xs font-bold text-[#0df2c9] mt-0.5">Simulated Monte Carlo</div>
              </div>
            </div>
          </div>

          {/* Card 2: M-Pesa SMS Auto-Parser */}
          <div id="mpesa-section" className="p-6 rounded-2xl bg-[#0a1220] border border-[#18263e] hover:border-emerald-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
              Zero Manual Entry
            </span>
            <h3 className="text-base font-bold text-white">M-Pesa SMS Auto-Parser</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste raw Safaricom confirmation SMS. The parser auto-extracts amount, recipient/merchant, reference code, transaction charges, and categorizes automatically.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supports Paybill, Till, & P2P</span>
            </div>
          </div>

          {/* Card 3: Kenyan FIRE & Runway Calculator */}
          <div className="p-6 rounded-2xl bg-[#0a1220] border border-[#18263e] hover:border-amber-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
              Financial Independence
            </span>
            <h3 className="text-base font-bold text-white">Kenyan FIRE Freedom Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculate your exact FIRE number in KES. Stress-test inflation, Safe Withdrawal Rates (SWR), and track your 3 to 12-month liquid emergency runway in top MMFs.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Coast FIRE, Lean FIRE & Fat FIRE</span>
            </div>
          </div>

          {/* Card 4: SACCO & MMF Compound Interest Radar */}
          <div className="p-6 rounded-2xl bg-[#0a1220] border border-[#18263e] hover:border-cyan-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#0df2c9]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
              Passive Yields
            </span>
            <h3 className="text-base font-bold text-white">SACCO & MMF Yield Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track 12% to 16% annualized MMF returns and annual SACCO dividends (Stima, Kenya Police, Harambee) alongside table banking Chama pools.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span>Daily compounding interest visualizer</span>
            </div>
          </div>

          {/* Card 5: KRA PAYE & 2025/2026 Statutory Deductions */}
          <div className="p-6 rounded-2xl bg-[#0a1220] border border-[#18263e] hover:border-purple-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
              2025/2026 Kenyan Tax Bands
            </span>
            <h3 className="text-base font-bold text-white">KRA PAYE & Net Salary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant breakdown of progressive PAYE rates, new SHIF 2.75% contribution, Affordable Housing Levy (1.5%), and NSSF Tiers I & II to see true take-home pay.
            </p>
            <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-purple-400" />
              <span>Up-to-date with Finance Act laws</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Instruments Specs Matrix */}
      <section id="specs-table" className="relative z-10 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#141f33]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Available Streaming Instruments</h2>
            <p className="text-xs text-slate-400 mt-1">
              Active feed connectivity for Deriv Synthetics, Gold Spot, Crypto, and East African FX
            </p>
          </div>
          <button
            onClick={() => scrollToSection('signup-section')}
            className="self-start sm:self-auto text-xs font-semibold text-[#0df2c9] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>Launch Paper Trading</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#19273f] bg-[#090f1c]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1728] border-b border-[#19273f] text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Market Class</th>
                <th className="py-3 px-4">Typical Spread</th>
                <th className="py-3 px-4">Execution Speed</th>
                <th className="py-3 px-4">Trading Window</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152033] font-mono text-slate-300">
              <tr className="hover:bg-[#0c1424]">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  XAUUSD (Gold Spot)
                </td>
                <td className="py-3.5 px-4 text-amber-400">Precious Metals</td>
                <td className="py-3.5 px-4">0.18 pts</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">280ms sub-second</td>
                <td className="py-3.5 px-4">Mon - Fri (24h)</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    STREAMING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0c1424]">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-[#0df2c9]" />
                  Volatility 75 Index (V75)
                </td>
                <td className="py-3.5 px-4 text-teal-400">Deriv Synthetic</td>
                <td className="py-3.5 px-4">0.05%</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">280ms sub-second</td>
                <td className="py-3.5 px-4 text-[#0df2c9]">24/7/365 Non-stop</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    STREAMING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0c1424]">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Boom 1000 & Crash 1000
                </td>
                <td className="py-3.5 px-4 text-rose-400">Spike Synthetics</td>
                <td className="py-3.5 px-4">Fixed Tick</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Tick Event Radar</td>
                <td className="py-3.5 px-4 text-[#0df2c9]">24/7/365 Non-stop</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    STREAMING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0c1424]">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  BTCUSD & ETHUSD
                </td>
                <td className="py-3.5 px-4 text-cyan-400">Crypto Assets</td>
                <td className="py-3.5 px-4">Floating</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Sub-second</td>
                <td className="py-3.5 px-4 text-[#0df2c9]">24/7/365 Non-stop</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    STREAMING
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0c1424]">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  USD/KES & EUR/USD
                </td>
                <td className="py-3.5 px-4 text-emerald-400">East African FX</td>
                <td className="py-3.5 px-4">0.12 pts</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">Sub-second</td>
                <td className="py-3.5 px-4">Mon - Fri (24h)</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    STREAMING
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#141f33]">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Clear answers on security, 24/7 synthetics, and Kenyan integrations.</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1220] border border-[#17253b]">
            <h4 className="text-sm font-bold text-white mb-1.5">How does the 24/7 Deriv synthetic trading work?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike traditional Forex and stocks which close on Friday evening, Deriv Synthetic Indices (such as Volatility 75, Boom 1000, and Crash 1000) run around the clock, 365 days a year. Our sub-second 280ms tick engine streams micro-ticks continuously so you can practice scalp strategies, spike hunting, and trailing stops anytime.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1220] border border-[#17253b]">
            <h4 className="text-sm font-bold text-white mb-1.5">Is my M-Pesa and financial data kept private?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes. All expense parsing is performed client-side on your device. Your data is stored within your private Firebase Firestore vault accessible only to your authenticated user account. We never sell, share, or monetize your financial logs.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a1220] border border-[#17253b]">
            <h4 className="text-sm font-bold text-white mb-1.5">Can I test without creating an account?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Absolutely. Click "Instant Demo" in the top bar or "Explore Demo" in the signup box to enter the full cockpit with pre-seeded demo balances, active positions, and Kenyan cashflow models.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0e1d35] via-[#0b1424] to-[#070b14] border border-teal-500/30 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[#0df2c9] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Command</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Take Command of Your Wealth & Scalping Today
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join disciplined traders and savers across Kenya. Access 24/7 synthetic indices, track your emergency runway, and automate cashflow in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setAuthTab('signup');
                scrollToSection('signup-section');
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={handleGuestDemo}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#122036] hover:bg-[#182a47] border border-[#203454] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Launch Interactive Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#141f33] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AppLogo size="xs" subtext="Unified Wealth OS & 24/7 Scalper" />
          <div className="text-[11px] text-slate-500">
            Educational trading simulator & financial planner • Not registered financial advice • Zero-knowledge Firebase Vault
          </div>
        </div>
      </footer>
    </div>
  );
};
