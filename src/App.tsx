/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
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
import { QuickAddModal } from './components/modals/QuickAddModal.tsx';
import { HealthScoreModal } from './components/modals/HealthScoreModal.tsx';
import { ClearDataModal } from './components/modals/ClearDataModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';

const MainContent: React.FC = () => {
  const { activeTab } = useFinance();
  const { user, loading } = useAuth();

  // If user is logged in, default to app dashboard; otherwise landing page
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setViewMode('app');
    } else {
      setViewMode('landing');
    }
  }, [user]);

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
      case 'debt':
        return <DebtTrackerView />;
      case 'chama':
        return <ChamaView />;
      case 'milestones':
        return <MilestonesView />;
      case 'cashflow':
        return <CashflowForecastView />;
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

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage onEnterApp={() => setViewMode('app')} />
        <AuthModal />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main View Area with fine tech grid background matching screenshot */}
      <div className="flex-1 flex flex-col min-w-0 fintech-grid-bg">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigateToLanding={() => setViewMode('landing')}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddModal />
      <HealthScoreModal />
      <ClearDataModal />
      <AuthModal />
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
