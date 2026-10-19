import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useFinance } from '../../context/FinanceContext.tsx';
import { AppLogo } from '../common/AppLogo.tsx';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
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

  const [authTab, setAuthTab] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      onEnterApp();
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onEnterApp();
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      onEnterApp();
    } catch (err) {
      onEnterApp();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-teal-500 selection:text-black">
      {/* Background cyber grid */}
      <div className="fixed inset-0 pointer-events-none fintech-grid-bg opacity-75 z-0" />

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-[#141e30] bg-[#070b14]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <AppLogo size="md" subtext="Your financial journey" />

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleGuestDemo}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Explore Demo</span>
                </button>
                <button
                  onClick={() => {
                    setAuthTab('login');
                    document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-[#1e2e48] hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab('signup');
                    document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Features */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[#0df2c9] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart East African Wealth & FIRE Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Master Your Money.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0df2c9] via-teal-300 to-cyan-400">
                Accelerate Your Freedom.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              The high-precision financial OS designed for your real cashflow. Track multi-stream income, categorize M-Pesa & bank expenses, build your 6-month liquid runway, and calculate your exact Financial Independence (FIRE) number in KES.
            </p>

            {/* Quick value badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0d1626] border border-[#18263e] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">Private Cloud Vault</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1626] border border-[#18263e] flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">FIRE Calculator</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1626] border border-[#18263e] flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#0df2c9] shrink-0" />
                <span className="text-xs text-slate-300 font-medium">MMF & SACCO Tracker</span>
              </div>
            </div>

            {/* Live Interactive Preview Snapshot of the 6 Cards */}
            <div className="pt-4">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                <span>Real-Time Dashboard Preview</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3 rounded-2xl bg-[#0a111e]/90 border border-[#17253b] backdrop-blur-sm shadow-2xl">
                <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4a]">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Banknote className="w-3 h-3 text-emerald-400" /> Income
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-[#00e5a3] mt-1">
                    KES 145,000
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4a]">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-rose-400" /> Expenses
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-[#ff4b6b] mt-1">
                    KES 48,000
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4a]">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <PiggyBank className="w-3 h-3 text-cyan-400" /> Savings Rate
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-[#00d2ff] mt-1">
                    67% (KES 97k)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Converting Direct Signup / Login Form */}
          <div id="signup-section" className="lg:col-span-5 scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1525]/95 border border-teal-500/30 backdrop-blur-xl shadow-2xl shadow-teal-950/30 relative overflow-hidden">
              {/* Subtle top ambient glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-[#18263e]">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {authTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authTab === 'signup' ? 'Start private financial tracking in seconds' : 'Sign in to access your secure vault'}
                  </p>
                </div>

                {/* Switch tab */}
                <div className="flex bg-[#080d17] p-1 rounded-xl border border-[#1a2942] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthError();
                      setAuthTab('signup');
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
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
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      authTab === 'login'
                        ? 'bg-teal-500/20 text-[#0df2c9] border border-teal-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Log In
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="space-y-4 pt-4">
                {authError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                    {authError}
                  </div>
                )}

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#131f32] hover:bg-[#18263d] border border-[#223554] text-white text-xs font-semibold transition-all hover:border-slate-400 active:scale-[0.98] disabled:opacity-50"
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
                    or with email
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
                          placeholder="e.g. Rashid J."
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
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
                        className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
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
                        className="w-full bg-[#121c2e] border border-[#1d2c47] rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
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
                        ? 'Processing...'
                        : authTab === 'signup'
                        ? 'Create Free Account & Launch'
                        : 'Sign In to Your Dashboard'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>

                {/* Guest exploration */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleGuestDemo}
                    disabled={loading}
                    className="text-xs text-slate-400 hover:text-teal-300 transition-colors underline decoration-dotted"
                  >
                    Or skip sign up and explore demo directly →
                  </button>
                </div>

                <div className="pt-3 border-t border-[#17253b] text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-teal-400" />
                  <span>Secure zero-knowledge Firestore cloud database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#141e30]">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered Specifically for High-Growth Savers
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to eliminate money anxiety, optimize capital across Kenyan assets, and build permanent generational wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1: M-Pesa Parser */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-emerald-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">M-Pesa SMS Auto-Parser</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No manual typing. Paste raw Safaricom M-Pesa messages; MullahTracker auto-extracts amount, vendor, ref code, and category.
            </p>
          </div>

          {/* Feature 2: KRA Tax Calc */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-teal-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9]">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">KRA PAYE & Net Salary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates 2025/2026 progressive PAYE bands, SHIF (2.75%), Affordable Housing (1.5%), and NSSF Tiers I & II in 1 click.
            </p>
          </div>

          {/* Feature 3: Chama Manager */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Chama & Merry-Go-Round</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track contributions, table banking pools, member turns, and receive countdowns for your next lump-sum payout rotation.
            </p>
          </div>

          {/* Feature 4: Cashflow Simulator */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-blue-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">12-Month Cash Flow Forecast</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forward-looking liquidity simulator. Stress-test income shocks, cost of living inflation, and compound interest growth.
            </p>
          </div>

          {/* Feature 5: Milestones Badges */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-purple-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Milestones & Badges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gamified wealth-building journey with 11 milestones from "First Shilling" and "Safety Shield" to "Mullah Millionaire".
            </p>
          </div>

          {/* Feature 6: Investments */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-teal-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Kenyan Investment Portfolio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor Money Market Funds (MMFs), SACCO deposits, NSE stocks, and Treasury Infrastructure Bonds in one dashboard.
            </p>
          </div>

          {/* Feature 7: Emergency Fund */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-indigo-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Emergency Fund Runway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculate essential monthly runway (3, 6, 9, or 12 months) and track liquidity reserves parked safely in liquid assets.
            </p>
          </div>

          {/* Feature 8: FIRE Engine */}
          <div className="p-5 rounded-2xl bg-[#0c1424] border border-[#18263e] hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">FIRE Freedom Calculator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive target calculator projecting years to financial freedom, Coast FIRE, and Fat FIRE in Kenyan Shillings.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0e1b30] to-[#0a1220] border border-teal-500/30 space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Take Command of Your Financial Journey?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands building disciplined wealth in KES. Create your private account in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setAuthTab('signup');
                document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-[#0df2c9] text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={handleGuestDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#223656] text-slate-200 text-xs font-semibold transition-colors"
            >
              Launch Interactive Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#141e30] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AppLogo size="xs" subtext="Your Financial Journey" />
          <div>
            Built with secure Firebase Firestore authentication & zero-trust privacy
          </div>
        </div>
      </footer>
    </div>
  );
};
