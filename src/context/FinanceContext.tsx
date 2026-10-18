import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { useAuth } from './AuthContext.tsx';
import {
  TabType,
  CurrencyCode,
  IncomeItem,
  ExpenseItem,
  BudgetCategory,
  SavingsGoal,
  InvestmentItem,
  DebtItem,
  EmergencyFundConfig,
  FinancialHealth,
} from '../types/finance.ts';

interface FinanceContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
  currentPeriod: string;
  setCurrentPeriod: (p: string) => void;

  // Data collections
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  investments: InvestmentItem[];
  debts: DebtItem[];
  emergencyFund: EmergencyFundConfig;

  // Actions
  addIncome: (income: Omit<IncomeItem, 'id'>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (id: string) => void;
  setCategoryBudget: (category: string, monthlyLimit: number) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  depositToGoal: (id: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;
  addInvestment: (inv: Omit<InvestmentItem, 'id' | 'lastUpdated'>) => void;
  deleteInvestment: (id: string) => void;
  addDebt: (debt: Omit<DebtItem, 'id'>) => void;
  recordDebtPayment: (id: string, paymentAmount: number) => void;
  deleteDebt: (id: string) => void;
  updateEmergencyFund: (config: Partial<EmergencyFundConfig>) => void;
  depositToEmergencyFund: (amount: number) => void;

  // Aggregated totals
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  savingsThisMonth: number;
  savingsRate: number;
  totalInvestments: number;
  totalEmergencyFund: number;
  totalDebt: number;
  totalSavingsGoals: number;
  netWorth: number;

  // Health
  financialHealth: FinancialHealth;

  // Utilities
  isCloudSyncing: boolean;
  clearAllData: () => void;
  resetToZeroState: () => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isHealthModalOpen: boolean;
  setIsHealthModalOpen: (open: boolean) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mullahtracker_finance_state_v1';
const LEGACY_STORAGE_KEYS = ['mullah_finance_state_v1', 'njiafedha_finance_state_v1'];

// Sample IDs to purge
const SAMPLE_IDS = new Set([
  'inc-1', 'inc-2', 'inc-3',
  'exp-1', 'exp-2', 'exp-3', 'exp-4', 'exp-5', 'exp-6',
  'g-1', 'g-2', 'g-3',
  'inv-1', 'inv-2', 'inv-3', 'inv-4',
  'd-1', 'd-2'
]);

const getDynamicCurrentPeriod = () => {
  const d = new Date();
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const INITIAL_EMPTY_STATE = {
  currency: 'KES' as CurrencyCode,
  currentPeriod: getDynamicCurrentPeriod(),
  incomes: [] as IncomeItem[],
  expenses: [] as ExpenseItem[],
  budgets: [
    { id: 'b1', category: 'Rent & Housing', monthlyLimit: 0 },
    { id: 'b2', category: 'Food & Groceries', monthlyLimit: 0 },
    { id: 'b3', category: 'Transport & Fuel', monthlyLimit: 0 },
    { id: 'b4', category: 'Utilities & Bills', monthlyLimit: 0 },
    { id: 'b5', category: 'Entertainment & Dining', monthlyLimit: 0 },
  ],
  savingsGoals: [] as SavingsGoal[],
  investments: [] as InvestmentItem[],
  debts: [] as DebtItem[],
  emergencyFund: {
    monthlyEssentialExpenses: 0,
    targetMonths: 6,
    currentAmount: 0,
  },
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currency, setCurrency] = useState<CurrencyCode>('KES');
  const [currentPeriod, setCurrentPeriod] = useState<string>(getDynamicCurrentPeriod());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  // Collections starting blank
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_EMPTY_STATE.budgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFundConfig>(INITIAL_EMPTY_STATE.emergencyFund);

  // Load from localStorage on mount, removing any leftover sample items
  useEffect(() => {
    try {
      // Purge legacy storage keys
      LEGACY_STORAGE_KEYS.forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
      });

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.currentPeriod) setCurrentPeriod(parsed.currentPeriod);

        // Filter out any sample demo IDs so only real user entries exist
        if (Array.isArray(parsed.incomes)) {
          const real = parsed.incomes.filter((i: IncomeItem) => !SAMPLE_IDS.has(i.id));
          setIncomes(real);
        }
        if (Array.isArray(parsed.expenses)) {
          const real = parsed.expenses.filter((e: ExpenseItem) => !SAMPLE_IDS.has(e.id));
          setExpenses(real);
        }
        if (Array.isArray(parsed.budgets)) {
          setBudgets(parsed.budgets);
        }
        if (Array.isArray(parsed.savingsGoals)) {
          const real = parsed.savingsGoals.filter((g: SavingsGoal) => !SAMPLE_IDS.has(g.id));
          setSavingsGoals(real);
        }
        if (Array.isArray(parsed.investments)) {
          const real = parsed.investments.filter((inv: InvestmentItem) => !SAMPLE_IDS.has(inv.id));
          setInvestments(real);
        }
        if (Array.isArray(parsed.debts)) {
          const real = parsed.debts.filter((d: DebtItem) => !SAMPLE_IDS.has(d.id));
          setDebts(real);
        }
        if (parsed.emergencyFund && parsed.emergencyFund.currentAmount !== 280000) {
          // If it was the exact sample fund 280000, reset to 0
          setEmergencyFund(parsed.emergencyFund);
        }
      }
    } catch (e) {
      console.error('Error loading finance data from storage:', e);
    }
  }, []);

  const { user } = useAuth();
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Sync from cloud when user logs in with Firebase, or load from user vault
  useEffect(() => {
    if (!user) return;

    if (user.provider !== 'firebase' || !auth.currentUser) {
      // Local vault user: load user-scoped storage if exists
      try {
        const userScopedKey = `${LOCAL_STORAGE_KEY}_${user.uid}`;
        const stored = localStorage.getItem(userScopedKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.currentPeriod) setCurrentPeriod(parsed.currentPeriod);
          if (Array.isArray(parsed.incomes)) setIncomes(parsed.incomes);
          if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
          if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
          if (Array.isArray(parsed.savingsGoals)) setSavingsGoals(parsed.savingsGoals);
          if (Array.isArray(parsed.investments)) setInvestments(parsed.investments);
          if (Array.isArray(parsed.debts)) setDebts(parsed.debts);
          if (parsed.emergencyFund) setEmergencyFund(parsed.emergencyFund);
        }
      } catch (e) {
        console.warn('Could not read user vault storage:', e);
      }
      return;
    }

    const currentUid = auth.currentUser.uid;
    let isCancelled = false;

    async function loadCloudData() {
      try {
        setIsCloudSyncing(true);
        const ref = doc(db, 'users', currentUid, 'finance', 'main');
        const snap = await getDoc(ref);
        if (snap.exists() && !isCancelled) {
          const data = snap.data();
          if (data.currency) setCurrency(data.currency);
          if (data.currentPeriod) setCurrentPeriod(data.currentPeriod);
          if (Array.isArray(data.incomes)) setIncomes(data.incomes);
          if (Array.isArray(data.expenses)) setExpenses(data.expenses);
          if (Array.isArray(data.budgets)) setBudgets(data.budgets);
          if (Array.isArray(data.savingsGoals)) setSavingsGoals(data.savingsGoals);
          if (Array.isArray(data.investments)) setInvestments(data.investments);
          if (Array.isArray(data.debts)) setDebts(data.debts);
          if (data.emergencyFund) setEmergencyFund(data.emergencyFund);
        } else if (!snap.exists() && !isCancelled) {
          await setDoc(
            ref,
            {
              currency,
              currentPeriod,
              incomes,
              expenses,
              budgets,
              savingsGoals,
              investments,
              debts,
              emergencyFund,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('Firestore cloud fetch error:', err);
      } finally {
        if (!isCancelled) setIsCloudSyncing(false);
      }
    }

    loadCloudData();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Sync to cloud on state changes if user has an active Firebase auth session
  useEffect(() => {
    if (!user) return;

    // Save to user-scoped local storage for immediate offline/local reliability
    try {
      const stateToSave = {
        currency,
        currentPeriod,
        incomes,
        expenses,
        budgets,
        savingsGoals,
        investments,
        debts,
        emergencyFund,
      };
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.uid}`, JSON.stringify(stateToSave));
    } catch {
      // ignore
    }

    if (user.provider !== 'firebase' || !auth.currentUser) return;
    const currentUid = auth.currentUser.uid;

    const timeout = setTimeout(async () => {
      try {
        const ref = doc(db, 'users', currentUid, 'finance', 'main');
        await setDoc(
          ref,
          {
            currency,
            currentPeriod,
            incomes,
            expenses,
            budgets,
            savingsGoals,
            investments,
            debts,
            emergencyFund,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Error syncing to Firestore:', e);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, currency, currentPeriod, incomes, expenses, budgets, savingsGoals, investments, debts, emergencyFund]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        currency,
        currentPeriod,
        incomes,
        expenses,
        budgets,
        savingsGoals,
        investments,
        debts,
        emergencyFund,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving finance state:', e);
    }
  }, [currency, currentPeriod, incomes, expenses, budgets, savingsGoals, investments, debts, emergencyFund]);

  const formatCurrency = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString('en-US');
    return `${currency} ${formatted}`;
  };

  // Actions
  const addIncome = (income: Omit<IncomeItem, 'id'>) => {
    const newItem: IncomeItem = { ...income, id: 'user-inc-' + Date.now() };
    setIncomes((prev) => [newItem, ...prev]);
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = { ...expense, id: 'user-exp-' + Date.now() };
    setExpenses((prev) => [newItem, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const setCategoryBudget = (category: string, monthlyLimit: number) => {
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) {
        return prev.map((b) => (b.category === category ? { ...b, monthlyLimit } : b));
      }
      return [...prev, { id: 'user-b-' + Date.now(), category, monthlyLimit }];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'user-goal-' + Date.now(),
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const depositToGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addInvestment = (inv: Omit<InvestmentItem, 'id' | 'lastUpdated'>) => {
    const newInv: InvestmentItem = {
      ...inv,
      id: 'user-inv-' + Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInvestments((prev) => [...prev, newInv]);
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  const addDebt = (debt: Omit<DebtItem, 'id'>) => {
    const newDebt: DebtItem = {
      ...debt,
      id: 'user-debt-' + Date.now(),
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const recordDebtPayment = (id: string, paymentAmount: number) => {
    setDebts((prev) =>
      prev
        .map((d) => {
          if (d.id === id) {
            const remaining = Math.max(0, d.remainingAmount - paymentAmount);
            return { ...d, remainingAmount: remaining };
          }
          return d;
        })
        .filter((d) => d.remainingAmount > 0)
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const updateEmergencyFund = (config: Partial<EmergencyFundConfig>) => {
    setEmergencyFund((prev) => ({ ...prev, ...config }));
  };

  const depositToEmergencyFund = (amount: number) => {
    setEmergencyFund((prev) => ({ ...prev, currentAmount: prev.currentAmount + amount }));
  };

  // Reset / Clear all data to fresh zero state
  const clearAllData = () => {
    setIncomes([]);
    setExpenses([]);
    setBudgets(INITIAL_EMPTY_STATE.budgets);
    setSavingsGoals([]);
    setInvestments([]);
    setDebts([]);
    setEmergencyFund(INITIAL_EMPTY_STATE.emergencyFund);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      /* ignore */
    }
  };

  const resetToZeroState = clearAllData;

  // Computed Totals
  const totalMonthlyIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalMonthlyExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const savingsThisMonth = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? Math.max(0, Math.round((savingsThisMonth / totalMonthlyIncome) * 100)) : 0;

  const totalInvestments = investments.reduce((sum, item) => sum + item.currentValue, 0);
  const totalEmergencyFund = emergencyFund.currentAmount;
  const totalDebt = debts.reduce((sum, item) => sum + item.remainingAmount, 0);
  const totalSavingsGoals = savingsGoals.reduce((sum, item) => sum + item.currentAmount, 0);

  // Net Worth = (Cash/Savings + Emergency + Investments + Goals) - Debts
  const liquidSavings = Math.max(0, savingsThisMonth);
  const netWorth = (liquidSavings + totalEmergencyFund + totalInvestments + totalSavingsGoals) - totalDebt;

  // Calculate Financial Health Score (0 - 100)
  const calculateFinancialHealth = (): FinancialHealth => {
    if (totalMonthlyIncome === 0 && totalMonthlyExpenses === 0 && totalInvestments === 0) {
      return {
        score: 25,
        status: 'Needs work',
        color: '#f43f5e',
        savingsRateScore: 5,
        emergencyScore: 5,
        debtScore: 10,
        budgetScore: 5,
        tips: [
          'Record your real monthly income and recurring expenses to unlock complete cashflow insights.',
          'Build an emergency fund covering at least 3-6 months of living costs.',
          'Start allocating 20% of your earnings to high-yield investments like MMF or SACCOs.',
        ],
      };
    }

    // 1. Savings rate score (up to 30 pts)
    let savingsScore = 0;
    if (savingsRate >= 30) savingsScore = 30;
    else if (savingsRate >= 20) savingsScore = 25;
    else if (savingsRate >= 10) savingsScore = 18;
    else if (savingsRate > 0) savingsScore = 10;
    else savingsScore = 0;

    // 2. Emergency fund runway (up to 25 pts)
    let emergencyScore = 0;
    const essentialExpenses = emergencyFund.monthlyEssentialExpenses || (totalMonthlyExpenses > 0 ? totalMonthlyExpenses : 30000);
    const monthsCovered = essentialExpenses > 0 ? totalEmergencyFund / essentialExpenses : 0;
    if (monthsCovered >= 6) emergencyScore = 25;
    else if (monthsCovered >= 3) emergencyScore = 20;
    else if (monthsCovered >= 1) emergencyScore = 12;
    else if (totalEmergencyFund > 0) emergencyScore = 6;
    else emergencyScore = 2;

    // 3. Debt to income ratio (up to 25 pts)
    let debtScore = 25;
    if (totalDebt > 0) {
      const debtRatio = totalMonthlyIncome > 0 ? totalDebt / (totalMonthlyIncome * 12) : 1;
      if (debtRatio < 0.2) debtScore = 22;
      else if (debtRatio < 0.4) debtScore = 16;
      else if (debtRatio < 0.7) debtScore = 10;
      else debtScore = 5;
    }

    // 4. Budget & Investment discipline (up to 20 pts)
    let budgetScore = 10;
    if (totalInvestments > 0) budgetScore += 6;
    if (savingsGoals.length > 0) budgetScore += 4;

    const totalScore = Math.min(100, Math.max(10, savingsScore + emergencyScore + debtScore + budgetScore));

    let status: FinancialHealth['status'] = 'Needs work';
    let color = '#f43f5e';
    if (totalScore >= 80) {
      status = 'Excellent';
      color = '#10b981';
    } else if (totalScore >= 65) {
      status = 'Good';
      color = '#00d2b4';
    } else if (totalScore >= 45) {
      status = 'Fair';
      color = '#fbbf24';
    } else {
      status = 'Needs work';
      color = '#f43f5e';
    }

    const tips: string[] = [];
    if (savingsRate < 20) tips.push('Aim to increase your monthly savings rate to at least 20% using the 50/30/20 rule.');
    if (monthsCovered < 3) tips.push('Your emergency fund covers less than 3 months of expenses. Park emergency cash in a liquid Money Market Fund.');
    if (totalDebt > 0) tips.push('Accelerate paying off high-interest mobile loans (Fuliza, M-Shwari) using the Debt Avalanche method.');
    if (totalInvestments === 0) tips.push('Start putting aside regular contributions into compound interest accounts (e.g. Treasury Infrastructure Bonds or Regulated MMFs).');
    if (tips.length === 0) tips.push('Outstanding financial discipline! Continue rebalancing your portfolio and monitoring your FIRE number.');

    return {
      score: totalScore,
      status,
      color,
      savingsRateScore: savingsScore,
      emergencyScore,
      debtScore,
      budgetScore,
      tips,
    };
  };

  const financialHealth = calculateFinancialHealth();

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        formatCurrency,
        currentPeriod,
        setCurrentPeriod,
        incomes,
        expenses,
        budgets,
        savingsGoals,
        investments,
        debts,
        emergencyFund,
        addIncome,
        deleteIncome,
        addExpense,
        deleteExpense,
        setCategoryBudget,
        deleteBudget,
        addSavingsGoal,
        depositToGoal,
        deleteSavingsGoal,
        addInvestment,
        deleteInvestment,
        addDebt,
        recordDebtPayment,
        deleteDebt,
        updateEmergencyFund,
        depositToEmergencyFund,
        totalMonthlyIncome,
        totalMonthlyExpenses,
        savingsThisMonth,
        savingsRate,
        totalInvestments,
        totalEmergencyFund,
        totalDebt,
        totalSavingsGoals,
        netWorth,
        financialHealth,
        isCloudSyncing,
        clearAllData,
        resetToZeroState,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isHealthModalOpen,
        setIsHealthModalOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
