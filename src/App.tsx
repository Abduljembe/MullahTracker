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
import { QuickAddModal } from './components/modals/QuickAddModal.tsx';
import { HealthScoreModal } from './components/modals/HealthScoreModal.tsx';
import { ClearDataModal } from './components/modals/ClearDataModal.tsx';
import { CurrencyConverterModal } from './components/modals/CurrencyConverterModal.tsx';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal.tsx';
import { OfflineIndicator } from './components/pwa/OfflineIndicator.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';

const MainContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
