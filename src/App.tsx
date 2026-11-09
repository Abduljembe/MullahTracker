/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { FinanceProvider, useFinance } from './context/FinanceContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { InsightsView } from './components/views/InsightsView.tsx';
import { IncomeView } from './components/views/IncomeView.tsx';
import { ExpensesView } from './components/views/ExpensesView.tsx';
import { BudgetView } from './components/views/BudgetView.tsx';
import { SavingsGoalsView } from './components/views/SavingsGoalsView.tsx';
import { EmergencyFundView } from './components/views/EmergencyFundView.tsx';
import { InvestmentsView } from './components/views/InvestmentsView.tsx';
import { DebtTrackerView } from './components/views/DebtTrackerView.tsx';
import { FFCalculatorView } from './components/views/FFCalculatorView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { MpesaView } from './components/views/MpesaView.tsx';
import { TaxCalculatorView } from './components/views/TaxCalculatorView.tsx';
import { ChamaView } from './components/views/ChamaView.tsx';
import { CashflowForecastView } from './components/views/CashflowForecastView.tsx';
import { MilestonesView } from './components/views/MilestonesView.tsx';
import { BillsView } from './components/views/BillsView.tsx';
import { WalletsView } from './components/views/WalletsView.tsx';
import { SaccoMmfCalculatorView } from './components/views/SaccoMmfCalculatorView.tsx';
import { StockRadarView } from './components/views/StockRadarView.tsx';
import { OrderFlowView } from './components/views/OrderFlowView.tsx';
import { LiveTvView } from './components/views/LiveTvView.tsx';
import { Mt5EaScalperStudio } from './components/views/Mt5EaScalperStudio.tsx';
import { ForexPowerSuiteView } from './components/views/ForexPowerSuiteView.tsx';
import { QuickAddModal } from './components/modals/QuickAddModal.tsx';
import { HealthScoreModal } from './components/modals/HealthScoreModal.tsx';
import { ClearDataModal } from './components/modals/ClearDataModal.tsx';
import { CurrencyConverterModal } from './components/modals/CurrencyConverterModal.tsx';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal.tsx';
import { OfflineIndicator } from './components/pwa/OfflineIndicator.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { activeTab } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loading state while checking authentication credentials
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono text-slate-400">Loading NjiaFedha Security Vault...</span>
      </div>
    );
  }

  // When logged out or not authenticated, redirect directly to Landing Page for Sign In or Create Account
  if (!user) {
    return (
      <>
        <LandingPage initialMode="login" />
        <AuthModal />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'insights':
        return <InsightsView />;
      case 'cashflow':
        return <CashflowForecastView />;
      case 'income':
        return <IncomeView />;
      case 'expenses':
        return <ExpensesView />;
      case 'wallets':
        return <WalletsView />;
      case 'bills':
        return <BillsView />;
      case 'budget':
        return <BudgetView />;
      case 'mpesa':
        return <MpesaView />;
      case 'savings':
        return <SavingsGoalsView />;
      case 'emergency':
        return <EmergencyFundView />;
      case 'investments':
        return <InvestmentsView />;
      case 'stocks':
        return <StockRadarView />;
      case 'mt5-ea':
        return <Mt5EaScalperStudio />;
      case 'forex-suite':
        return <ForexPowerSuiteView />;
      case 'orderflow':
        return <OrderFlowView />;
      case 'livetv':
        return <LiveTvView />;
      case 'sacco-mmf':
        return <SaccoMmfCalculatorView />;
      case 'debt':
        return <DebtTrackerView />;
      case 'chama':
        return <ChamaView />;
      case 'milestones':
        return <MilestonesView />;
      case 'tax':
        return <TaxCalculatorView />;
      case 'calculator':
        return <FFCalculatorView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 w-full overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full fintech-grid-bg transition-all duration-300">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Full-width container covering left and right space */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 w-full min-w-0 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddModal />
      <HealthScoreModal />
      <ClearDataModal />
      <CurrencyConverterModal />
      <BackupRestoreModal />
      <AuthModal />

      {/* PWA Network Status Alert */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
