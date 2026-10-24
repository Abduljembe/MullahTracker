import {
  Banknote,
  Receipt,
  PiggyBank,
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
  Sparkles,
  Percent,
  Calendar,
  Wallet,
  AlertCircle,
  Smartphone,
  Users,
  Award,
  CalendarDays,
  Calculator,
  Compass,
  ArrowRightLeft,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext.tsx';

export const DashboardView: React.FC = () => {
  const {
    formatCurrency,
    totalMonthlyIncome,
    totalMonthlyExpenses,
    savingsThisMonth,
    savingsRate,
    totalInvestments,
    totalEmergencyFund,
    netWorth,
    incomes,
    expenses,
    investments,
    emergencyFund,
    dailySafeToSpend,
    badges,
    chamas,
    setActiveTab,
    setIsQuickAddOpen,
    setIsHealthModalOpen,
    setIsCurrencyConverterOpen,
    currency,
    exchangeRates,
    financialHealth,
  } = useFinance();

  // Combine recent transactions (income + expense) sorted by date
  const recentTransactions = [
    ...incomes.map((inc) => ({
      id: inc.id,
      title: inc.source,
      category: inc.category,
      amount: inc.amount,
      type: 'income' as const,
      date: inc.date,
      method: inc.paymentMethod,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      type: 'expense' as const,
      date: exp.date,
      method: exp.paymentMethod,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Group expenses by category for mini visual breakdown
  const categoryExpenses = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const monthsEmergency = emergencyFund.monthlyEssentialExpenses > 0
    ? (totalEmergencyFund / emergencyFund.monthlyEssentialExpenses).toFixed(1)
    : '0';

  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Top Smart Intelligence Banner: Safe to Spend, M-Pesa, Currency Converter, & Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Widget 1: Daily Safe to Spend */}
        <div
          onClick={() => setActiveTab('budget')}
          className="bg-gradient-to-r from-[#0c1c2e] to-[#0e2438] border border-teal-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-teal-400/50 transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#0df2c9] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">
                Safe to Spend Today
              </div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                {dailySafeToSpend > 0 ? `${formatCurrency(dailySafeToSpend)} / day` : 'Set Income / Budget'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
        </div>

        {/* Widget 2: M-Pesa SMS Auto-Parser */}
        <div
          onClick={() => setActiveTab('mpesa')}
          className="bg-[#0e1626] border border-[#19273f] hover:border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                M-Pesa SMS Parser
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                Paste SMS & Import Live
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>

        {/* Widget 3: Live FX Currency Converter */}
        <div
          onClick={() => setIsCurrencyConverterOpen(true)}
          className="bg-[#0e1626] border border-[#19273f] hover:border-teal-500/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-[#0df2c9] shrink-0">
              <ArrowRightLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Live FX Converter
              </div>
              <div className="text-sm font-bold text-teal-300 font-mono mt-0.5">
                1 USD = {exchangeRates.KES ? `${exchangeRates.KES.toFixed(1)} KES` : '129.8 KES'}
              </div>
            </div>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
        </div>

        {/* Widget 4: Milestones & Badges */}
        <div
          onClick={() => setActiveTab('milestones')}
          className="bg-[#0e1626] border border-[#19273f] hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Financial Milestones
              </div>
              <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                {unlockedBadges} of {badges.length} Unlocked
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </div>
      </div>

      {/* 6 Key Stat Cards matching the exact uploaded image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Card 1: Monthly Income */}
        <div
          onClick={() => setActiveTab('income')}
          className="group relative bg-[#0e1626] hover:bg-[#111c30] border border-[#19273f] hover:border-emerald-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Monthly Income</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#00e5a3] font-mono">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <div className="mt-1.5 text-xs text-slate-400">
              {totalMonthlyIncome === 0
                ? 'No income recorded'
                : `${incomes.length} income stream${incomes.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="group relative bg-[#0e1626] hover:bg-[#111c30] border border-[#19273f] hover:border-rose-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Receipt className="w-4 h-4 text-[#ff4b6b]" />
              <span>Total Expenses</span>
            </div>
            <ArrowDownRight className="w-4 h-4 text-slate-500 group-hover:text-[#ff4b6b] transition-colors" />
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#ff4b6b] font-mono">
              {formatCurrency(totalMonthlyExpenses)}
            </div>
            <div className="mt-1.5 text-xs text-slate-400">
              {totalMonthlyExpenses === 0
                ? 'No expenses recorded'
                : `${expenses.length} transaction${expenses.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Card 3: Savings This Month */}
        <div
          onClick={() => setActiveTab('budget')}
          className="group relative bg-[#0e1626] hover:bg-[#111c30] border border-[#19273f] hover:border-cyan-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <PiggyBank className="w-4 h-4 text-[#00d2ff]" />
              <span>Savings This Month</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#00d2ff] transition-colors" />
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#00d2ff] font-mono">
              {formatCurrency(savingsThisMonth)}
            </div>
            <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-2">
              <span>Savings rate: {savingsRate}%</span>
              {totalMonthlyIncome > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-mono">
                  {savingsRate >= 20 ? 'Target met' : 'Below 20%'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Investments */}
        <div
          onClick={() => setActiveTab('investments')}
          className="group relative bg-[#0e1626] hover:bg-[#111c30] border border-[#19273f] hover:border-amber-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <TrendingUp className="w-4 h-4 text-[#fbbf24]" />
              <span>Investments</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#fbbf24] transition-colors" />
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#fbbf24] font-mono">
              {formatCurrency(totalInvestments)}
            </div>
            <div className="mt-1.5 text-xs text-slate-400">
              {totalInvestments === 0
                ? 'No investments tracked'
                : `${investments.length} asset${investments.length > 1 ? 's' : ''} (MMF, SACCO, Stocks)`}
            </div>
          </div>
        </div>

        {/* Card 5: Emergency Fund */}
        <div
          onClick={() => setActiveTab('emergency')}
          className="group relative bg-[#0e1626] hover:bg-[#111c30] border border-[#19273f] hover:border-indigo-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Shield className="w-4 h-4 text-[#9d8bf8]" />
              <span>Emergency Fund</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#9d8bf8] transition-colors" />
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#9d8bf8] font-mono">
              {formatCurrency(totalEmergencyFund)}
            </div>
            <div className="mt-1.5 text-xs text-slate-400">
              {totalEmergencyFund === 0
                ? 'Set up in Emergency Fund tab'
                : `${monthsEmergency} months of runway`}
            </div>
          </div>
        </div>

        {/* Card 6: Net Worth */}
        <div
          onClick={() => setActiveTab('reports')}
          className="group relative bg-[#0e1626] hover:bg-[#111c30] border border-[#19273f] hover:border-blue-500/40 rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-[#38bdf8]" />
              <span>Net Worth</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#38bdf8] transition-colors" />
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#38bdf8] font-mono">
              {formatCurrency(netWorth)}
            </div>
            <div className="mt-1.5 text-xs text-slate-400">
              Savings + Investments - Debt
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Actions Banner */}
      <div className="bg-gradient-to-r from-[#0c182c] via-[#0e1f38] to-[#0c182c] border border-teal-500/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Quick Action Hub
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-teal-500/20 text-[#0df2c9] border border-teal-500/30">
                Live
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Log transactions, top up your emergency fund, or record M-Pesa expenses instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#0df2c9] hover:bg-[#00d2b4] text-[#071317] font-semibold text-xs transition-colors shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('mpesa')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#213554] text-slate-200 font-medium text-xs transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Parse M-Pesa</span>
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#213554] text-slate-200 font-medium text-xs transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-400" />
            <span>KRA Tax</span>
          </button>
          <button
            onClick={() => setActiveTab('chama')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#213554] text-slate-200 font-medium text-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Chamas ({chamas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#213554] text-slate-200 font-medium text-xs transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
            <span>Forecast</span>
          </button>
          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#14233c] hover:bg-[#1a2d4d] border border-[#213554] text-slate-200 font-medium text-xs transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Health</span>
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Transactions & Health / Category Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions Activity */}
        <div className="lg:col-span-2 bg-[#0d1524] border border-[#18263e] rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162237]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white">Recent Transactions</h2>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-300">No transactions recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Record Entry" above to log your income, expenses, or investments.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#101b2d] hover:bg-[#132036] border border-[#1a2840] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-[#ff4b6b] border border-rose-500/30'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-white truncate">{tx.title}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="truncate">{tx.category}</span>
                        <span>·</span>
                        <span className="text-slate-400 font-mono text-[11px]">{tx.method}</span>
                        <span>·</span>
                        <span className="text-slate-400 text-[11px]">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <div
                      className={`text-sm font-bold font-mono ${
                        tx.type === 'income' ? 'text-[#00e5a3]' : 'text-[#ff4b6b]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Financial Diagnostic & Top Expenses */}
        <div className="space-y-6">
          {/* Health Diagnostic Card */}
          <div className="bg-[#0d1524] border border-[#18263e] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-400" />
                Financial Health
              </h3>
              <span
                className="text-xs font-bold font-mono px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${financialHealth.color}15`,
                  color: financialHealth.color,
                  border: `1px solid ${financialHealth.color}40`,
                }}
              >
                {financialHealth.score}/100
              </span>
            </div>

            {/* Health Meter bar */}
            <div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${financialHealth.score}%`,
                    backgroundColor: financialHealth.color,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 Needs work</span>
                <span>50 Fair</span>
                <span>100 Excellent</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              {financialHealth.tips.slice(0, 2).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-400">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="w-full py-2 rounded-xl bg-[#121f33] hover:bg-[#162740] border border-[#1d2f4d] text-teal-300 text-xs font-medium transition-colors"
            >
              Learn how to improve score
            </button>
          </div>

          {/* Top Spending Categories */}
          <div className="bg-[#0d1524] border border-[#18263e] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#162237]">
              <h3 className="text-sm font-bold text-white">Expense Breakdown</h3>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                Budget limits
              </button>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No expense categories to display</p>
            ) : (
              <div className="space-y-3">
                {topCategories.map(([cat, amt]) => {
                  const pct = totalMonthlyExpenses > 0 ? Math.round((amt / totalMonthlyExpenses) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate">{cat}</span>
                        <span className="text-slate-400 font-mono">
                          {formatCurrency(amt)} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
