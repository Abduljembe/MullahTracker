import React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  Wallet,
  FileText,
  SlidersHorizontal,
  Target,
  Shield,
  TrendingUp,
  CreditCard,
  Calculator,
  BarChart2,
  X,
  Compass,
  Lock,
  LogOut,
  User as UserIcon,
  CloudCheck,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { TabType } from '../types/finance.ts';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab } = useFinance();
  const { user, setIsAuthModalOpen, setAuthMode, logout } = useAuth();

  const navGroups: NavGroup[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'insights', label: 'Insights', icon: Lightbulb },
      ],
    },
    {
      group: 'MANAGE',
      items: [
        { id: 'income', label: 'Income', icon: Wallet },
        { id: 'expenses', label: 'Expenses', icon: FileText },
        { id: 'budget', label: 'Budget', icon: SlidersHorizontal },
      ],
    },
    {
      group: 'GOALS',
      items: [
        { id: 'savings', label: 'Savings Goals', icon: Target },
        { id: 'emergency', label: 'Emergency Fund', icon: Shield },
        { id: 'investments', label: 'Investments', icon: TrendingUp },
        { id: 'debt', label: 'Debt Tracker', icon: CreditCard },
      ],
    },
    {
      group: 'TOOLS',
      items: [
        { id: 'calculator', label: 'FF Calculator', icon: Calculator },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
      ],
    },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b111c] border-r border-[#152033] text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-[#141e30]/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0df2c9] drop-shadow-sm">
              MullahTracker
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1 pl-0.5">
            Your financial journey
          </p>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.group}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative text-left ${
                      isActive
                        ? 'bg-[#102235] text-[#0df2c9] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-teal-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1726]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#0df2c9] rounded-r-full shadow-[0_0_8px_#0df2c9]" />
                    )}
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-[#0df2c9]' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info / user account */}
      <div className="p-3.5 border-t border-[#141e30] bg-[#090e18] space-y-2.5">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#0f1828] border border-[#1b2b44]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 text-[#0df2c9] font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                {user.displayName ? user.displayName.charAt(0) : user.email ? user.email.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{user.provider === 'firebase' ? 'Cloud Synced' : 'Private Vault'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Sign In / Sign Up</span>
          </button>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Active Currency</span>
          <span className="font-mono text-teal-400 font-semibold px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-800/40 text-[10px]">
            KES
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
