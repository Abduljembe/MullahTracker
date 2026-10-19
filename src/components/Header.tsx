import React, { useState } from 'react';
import {
  Menu,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RotateCcw,
  Sparkles,
  Lock,
  User as UserIcon,
  LogOut,
  Cloud,
  Globe,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AppLogoIcon } from './common/AppLogo.tsx';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigateToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onNavigateToLanding }) => {
  const {
    activeTab,
    currentPeriod,
    setCurrentPeriod,
    financialHealth,
    setIsQuickAddOpen,
    setIsHealthModalOpen,
    clearAllData,
    incomes,
    expenses,
    investments,
    debts,
    currency,
    setCurrency,
    isCloudSyncing,
  } = useFinance();

  const { user, setIsAuthModalOpen, setAuthMode, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const hasAnyData = incomes.length > 0 || expenses.length > 0 || investments.length > 0 || debts.length > 0;

  // Title mapped from activeTab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'insights':
        return 'Insights & Analytics';
      case 'income':
        return 'Income Streams';
      case 'expenses':
        return 'Expense Tracker';
      case 'budget':
        return 'Monthly Budget';
      case 'savings':
        return 'Savings Goals';
      case 'emergency':
        return 'Emergency Fund';
      case 'investments':
        return 'Investments Portfolio';
      case 'debt':
        return 'Debt Payoff Tracker';
      case 'mpesa':
        return 'M-Pesa SMS Statement Parser';
      case 'tax':
        return 'KRA PAYE & Net Salary Calculator';
      case 'chama':
        return 'Chama & Group Savings Tracker';
      case 'cashflow':
        return '12-Month Cash Flow Forecast';
      case 'milestones':
        return 'Milestones & Achievement Badges';
      case 'calculator':
        return 'Financial Freedom (FIRE) Calculator';
      case 'reports':
        return 'Reports & Cashflow';
      default:
        return 'Dashboard';
    }
  };

  const getHealthBadge = () => {
    const { status, score } = financialHealth;

    if (score >= 80) {
      return {
        bg: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-teal-950/70 border-teal-500/30 text-teal-300',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />,
      };
    }
    if (score >= 40) {
      return {
        bg: 'bg-amber-950/70 border-amber-500/30 text-amber-300',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
      };
    }
    // Screenshot style: reddish dark badge with exclamation icon and "Needs work"
    return {
      bg: 'bg-[#35141e]/90 border-[#6b1e2e]/80 text-[#ff637e]',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#ff4b6b] shrink-0" />,
    };
  };

  const healthBadge = getHealthBadge();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-[#080d17]/85 border-b border-[#141e30] px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Top Left: Title, Subtitle, and Health Pill matching screenshot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 flex items-center gap-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
            <AppLogoIcon sizePx={24} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {getTabTitle()}
              </h1>

              {/* Health pill matching screenshot */}
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-transform hover:scale-105 ${healthBadge.bg}`}
                title="Click to view Financial Health breakdown"
              >
                {healthBadge.icon}
                <span>{financialHealth.status}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              <span>{currentPeriod}</span>
              <span className="mx-1.5 text-slate-500">·</span>
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="hover:text-slate-200 underline decoration-dotted underline-offset-2 transition-colors cursor-pointer"
              >
                Health: {financialHealth.score}/100
              </button>
            </p>
          </div>
        </div>

        {/* Mobile quick add button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-teal-500/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Right: Actions & Tools */}
      <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto text-xs">
        {/* Landing Page Link */}
        {onNavigateToLanding && (
          <button
            onClick={onNavigateToLanding}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#152238] border border-[#1d2d47] text-slate-300 hover:text-white transition-colors"
            title="View Public Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>
        )}

        {/* Currency Switcher */}
        <div className="flex items-center bg-[#0d1524] border border-[#1a273e] rounded-lg p-0.5 text-slate-300">
          {(['KES', 'USD', 'EUR'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                currency === c
                  ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/40'
                  : 'hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Reset / Clear Data */}
        {hasAnyData && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all recorded entries and start completely blank?')) {
                clearAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111929] hover:bg-rose-950/40 border border-[#1d2d48] hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition-colors"
            title="Clear all recorded entries"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
            <span className="hidden sm:inline">Clear Data</span>
          </button>
        )}

        {/* Period Selector */}
        <select
          value={currentPeriod}
          onChange={(e) => setCurrentPeriod(e.target.value)}
          className="bg-[#0e1626] border border-[#1d2c47] rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-teal-400 cursor-pointer"
        >
          <option value="October 2026">October 2026</option>
          <option value="September 2026">September 2026</option>
          <option value="November 2026">November 2026</option>
          <option value="December 2026">December 2026</option>
          <option value="June 2026">June 2026</option>
          <option value="Year 2026">Full Year 2026</option>
        </select>

        {/* Quick Add modal trigger */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-400 to-[#00d2b4] text-[#071317] font-semibold tracking-tight shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>

        {/* Auth / Security Login Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111a2b] hover:bg-[#162238] border border-[#1d2d48] text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold flex items-center justify-center text-[10px] uppercase">
                {user.displayName ? user.displayName.charAt(0) : user.email ? user.email.charAt(0) : 'U'}
              </div>
              <span className="hidden sm:inline font-medium text-xs max-w-[110px] truncate">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isCloudSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
                title={isCloudSyncing ? 'Syncing to cloud...' : 'Encrypted Cloud Sync Active'}
              />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#0e1626] border border-[#1d2d48] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-[#162237] text-xs">
                  <div className="font-bold text-white truncate">
                    {user.displayName || 'Investor'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {user.email || 'Anonymous Guest'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                    <Cloud className="w-3 h-3" />
                    <span>{user.provider === 'firebase' ? 'Cloud Database Synced' : 'Private Vault Active'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 mt-1 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-semibold text-xs transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
};
