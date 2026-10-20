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
  ChamaItem,
  MilestoneBadge,
} from '../types/finance.ts';
import {
  ExchangeRates,
  DEFAULT_RATES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  getStoredExchangeRates,
  fetchLiveExchangeRates,
  getExchangeRate,
  convertCurrency,
  formatCurrencyWithSymbol,
} from '../utils/currency.ts';

export interface CurrencyNotice {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  message: string;
}

export interface DataNotice {
  type: 'success' | 'info' | 'warning';
  message: string;
}

interface FinanceContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currency: CurrencyCode;
  currencySymbol: string;
  setCurrency: (c: CurrencyCode, convertData?: boolean) => void;
  formatCurrency: (amount: number, options?: { showSymbol?: boolean; decimals?: number }) => string;
  currentPeriod: string;
  setCurrentPeriod: (p: string) => void;

  // Real-time FX Rates & Notices
  exchangeRates: ExchangeRates;
  refreshExchangeRates: () => Promise<void>;
  currencyNotice: CurrencyNotice | null;
  dismissCurrencyNotice: () => void;

  // Data collections
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  investments: InvestmentItem[];
  debts: DebtItem[];
  emergencyFund: EmergencyFundConfig;
  chamas: ChamaItem[];

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
  addChama: (chama: Omit<ChamaItem, 'id'>) => void;
  deleteChama: (id: string) => void;

  // Aggregated totals & new metrics
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  savingsThisMonth: number;
  savingsRate: number;
  totalInvestments: number;
  totalEmergencyFund: number;
  totalDebt: number;
  totalSavingsGoals: number;
  netWorth: number;
  dailySafeToSpend: number;
  badges: MilestoneBadge[];

  // Health
  financialHealth: FinancialHealth;

  // Utilities & Data Management
  isCloudSyncing: boolean;
  hasAnyData: boolean;
  clearAllData: () => Promise<void> | void;
  resetToZeroState: () => Promise<void> | void;
  loadDemoData: () => void;
  isClearDataModalOpen: boolean;
  setIsClearDataModalOpen: (open: boolean) => void;
  dataNotice: DataNotice | null;
  dismissDataNotice: () => void;
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
  currency: 'USD' as CurrencyCode,
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
  chamas: [] as ChamaItem[],
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(getStoredExchangeRates());
  const [currencyNotice, setCurrencyNotice] = useState<CurrencyNotice | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<string>(getDynamicCurrentPeriod());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [dataNotice, setDataNotice] = useState<DataNotice | null>(null);

  const dismissDataNotice = () => setDataNotice(null);

  // Load latest live exchange rates on mount
  useEffect(() => {
    fetchLiveExchangeRates().then((rates) => {
      if (rates) setExchangeRates(rates);
    });
  }, []);

  // Collections starting blank
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_EMPTY_STATE.budgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFundConfig>(INITIAL_EMPTY_STATE.emergencyFund);
  const [chamas, setChamas] = useState<ChamaItem[]>([]);

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
        if (parsed.currency) setCurrencyState(parsed.currency);
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
        if (Array.isArray(parsed.chamas)) {
          setChamas(parsed.chamas);
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
          if (parsed.currency) setCurrencyState(parsed.currency);
          if (parsed.currentPeriod) setCurrentPeriod(parsed.currentPeriod);
          if (Array.isArray(parsed.incomes)) setIncomes(parsed.incomes);
          if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
          if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
          if (Array.isArray(parsed.savingsGoals)) setSavingsGoals(parsed.savingsGoals);
          if (Array.isArray(parsed.investments)) setInvestments(parsed.investments);
          if (Array.isArray(parsed.debts)) setDebts(parsed.debts);
          if (Array.isArray(parsed.chamas)) setChamas(parsed.chamas);
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
          if (data.currency) setCurrencyState(data.currency);
          if (data.currentPeriod) setCurrentPeriod(data.currentPeriod);
          if (Array.isArray(data.incomes)) setIncomes(data.incomes);
          if (Array.isArray(data.expenses)) setExpenses(data.expenses);
          if (Array.isArray(data.budgets)) setBudgets(data.budgets);
          if (Array.isArray(data.savingsGoals)) setSavingsGoals(data.savingsGoals);
          if (Array.isArray(data.investments)) setInvestments(data.investments);
          if (Array.isArray(data.debts)) setDebts(data.debts);
          if (Array.isArray(data.chamas)) setChamas(data.chamas);
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
              chamas,
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
        chamas,
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
            chamas,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Error syncing to Firestore:', e);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, currency, currentPeriod, incomes, expenses, budgets, savingsGoals, investments, debts, emergencyFund, chamas]);

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
        chamas,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving finance state:', e);
    }
  }, [currency, currentPeriod, incomes, expenses, budgets, savingsGoals, investments, debts, emergencyFund, chamas]);

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  const dismissCurrencyNotice = () => setCurrencyNotice(null);

  const refreshExchangeRates = async () => {
    const fresh = await fetchLiveExchangeRates();
    if (fresh) {
      setExchangeRates(fresh);
    }
  };

  const setCurrency = (newCurrency: CurrencyCode, convertData = true) => {
    if (newCurrency === currency) return;

    if (convertData) {
      const rate = getExchangeRate(currency, newCurrency, exchangeRates);

      if (rate > 0 && Math.abs(rate - 1) > 0.0001) {
        // Convert all active recorded monetary figures across all categories
        setIncomes((prev) =>
          prev.map((i) => ({
            ...i,
            amount: Math.round(i.amount * rate * 100) / 100,
          }))
        );

        setExpenses((prev) =>
          prev.map((e) => ({
            ...e,
            amount: Math.round(e.amount * rate * 100) / 100,
          }))
        );

        setBudgets((prev) =>
          prev.map((b) => ({
            ...b,
            monthlyLimit: Math.round(b.monthlyLimit * rate * 100) / 100,
          }))
        );

        setSavingsGoals((prev) =>
          prev.map((g) => ({
            ...g,
            targetAmount: Math.round(g.targetAmount * rate * 100) / 100,
            currentAmount: Math.round(g.currentAmount * rate * 100) / 100,
          }))
        );

        setInvestments((prev) =>
          prev.map((inv) => ({
            ...inv,
            currentValue: Math.round(inv.currentValue * rate * 100) / 100,
            investedAmount: Math.round(inv.investedAmount * rate * 100) / 100,
          }))
        );

        setDebts((prev) =>
          prev.map((d) => ({
            ...d,
            principal: Math.round(d.principal * rate * 100) / 100,
            remainingAmount: Math.round(d.remainingAmount * rate * 100) / 100,
            minimumMonthlyPayment: Math.round(d.minimumMonthlyPayment * rate * 100) / 100,
          }))
        );

        setEmergencyFund((prev) => ({
          ...prev,
          monthlyEssentialExpenses: Math.round(prev.monthlyEssentialExpenses * rate * 100) / 100,
          currentAmount: Math.round(prev.currentAmount * rate * 100) / 100,
        }));

        setChamas((prev) =>
          prev.map((ch) => ({
            ...ch,
            contributionAmount: Math.round(ch.contributionAmount * rate * 100) / 100,
            payoutAmount: Math.round(ch.payoutAmount * rate * 100) / 100,
          }))
        );

        const rateFormatted =
          rate < 0.01 ? rate.toFixed(4) : rate < 10 ? rate.toFixed(3) : rate.toFixed(2);

        setCurrencyNotice({
          from: currency,
          to: newCurrency,
          rate,
          message: `Converted portfolio from ${currency} to ${newCurrency} (1 ${currency} = ${rateFormatted} ${newCurrency})`,
        });
      }
    }

    setCurrencyState(newCurrency);
  };

  const formatCurrency = (
    amount: number,
    options?: { showSymbol?: boolean; decimals?: number }
  ): string => {
    return formatCurrencyWithSymbol(amount, currency, options);
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

  const addChama = (chama: Omit<ChamaItem, 'id'>) => {
    const newChama: ChamaItem = {
      ...chama,
      id: 'user-chama-' + Date.now(),
    };
    setChamas((prev) => [...prev, newChama]);
  };

  const deleteChama = (id: string) => {
    setChamas((prev) => prev.filter((c) => c.id !== id));
  };

  // Reset / Clear all data to fresh zero state
  const clearAllData = async () => {
    // 1. Reset state
    setIncomes([]);
    setExpenses([]);
    setBudgets(INITIAL_EMPTY_STATE.budgets);
    setSavingsGoals([]);
    setInvestments([]);
    setDebts([]);
    setEmergencyFund(INITIAL_EMPTY_STATE.emergencyFund);
    setChamas([]);

    // 2. Clear all local storage keys
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach((k) => {
        try { localStorage.removeItem(k); } catch { /* ignore */ }
      });
      if (user?.uid) {
        try { localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${user.uid}`); } catch { /* ignore */ }
      }
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith('mullahtracker_') ||
          key.startsWith('mullah_') ||
          key.startsWith('njiafedha_')
        ) {
          try { localStorage.removeItem(key); } catch { /* ignore */ }
        }
      });
    } catch (e) {
      console.warn('Could not clear local storage:', e);
    }

    // 3. Clear cloud Firestore data if logged in
    if (user?.provider === 'firebase' && auth.currentUser) {
      try {
        setIsCloudSyncing(true);
        const ref = doc(db, 'users', auth.currentUser.uid, 'finance', 'main');
        await setDoc(ref, {
          currency,
          currentPeriod,
          incomes: [],
          expenses: [],
          budgets: INITIAL_EMPTY_STATE.budgets,
          savingsGoals: [],
          investments: [],
          debts: [],
          emergencyFund: INITIAL_EMPTY_STATE.emergencyFund,
          chamas: [],
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Error clearing Firestore document:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }

    setDataNotice({
      type: 'success',
      message: 'All recorded financial data has been cleared. You are starting with a clean blank slate.',
    });
  };

  const resetToZeroState = clearAllData;

  // Load realistic demo data
  const loadDemoData = () => {
    const isKes = currency === 'KES';
    const isEur = currency === 'EUR';
    const mult = isKes ? 130 : isEur ? 0.9 : 1;
    const roundVal = (v: number) => Math.round(v * mult);

    const demoIncomes: IncomeItem[] = [
      {
        id: 'demo-inc-' + (Date.now() + 1),
        source: isKes ? 'Tech Salary (Monthly)' : 'Senior Software Engineer Salary',
        amount: isKes ? 180000 : roundVal(1450),
        category: 'Salary',
        frequency: 'monthly',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly direct payroll deposit',
      },
      {
        id: 'demo-inc-' + (Date.now() + 2),
        source: 'Consulting & Freelance Retainer',
        amount: isKes ? 45000 : roundVal(350),
        category: 'Freelance',
        frequency: 'monthly',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        notes: 'Advisory and design retainer',
      },
      {
        id: 'demo-inc-' + (Date.now() + 3),
        source: isKes ? 'Safaricom Dividend Yield' : 'Index Fund Dividend Yield',
        amount: isKes ? 12000 : roundVal(95),
        category: 'Dividends',
        frequency: 'one-time',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        notes: 'Quarterly dividend payout',
      },
    ];

    const demoExpenses: ExpenseItem[] = [
      {
        id: 'demo-exp-' + (Date.now() + 1),
        title: isKes ? 'Apartment Rent (Kilimani)' : 'Apartment Rent & Living Space',
        amount: isKes ? 45000 : roundVal(420),
        category: 'Rent & Housing',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank',
        isRecurring: true,
      },
      {
        id: 'demo-exp-' + (Date.now() + 2),
        title: 'Monthly Food & Groceries (Carrefour)',
        amount: isKes ? 22000 : roundVal(180),
        category: 'Food & Groceries',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        isRecurring: false,
      },
      {
        id: 'demo-exp-' + (Date.now() + 3),
        title: 'Fuel & Uber Commutes',
        amount: isKes ? 12000 : roundVal(95),
        category: 'Transport & Fuel',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        isRecurring: false,
      },
      {
        id: 'demo-exp-' + (Date.now() + 4),
        title: 'Electricity, Water & High-speed Fiber',
        amount: isKes ? 7500 : roundVal(60),
        category: 'Utilities & Bills',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'M-Pesa',
        isRecurring: true,
      },
      {
        id: 'demo-exp-' + (Date.now() + 5),
        title: 'Weekend Dining & Socializing',
        amount: isKes ? 8000 : roundVal(65),
        category: 'Entertainment & Dining',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Card',
        isRecurring: false,
      },
    ];

    const demoBudgets: BudgetCategory[] = [
      { id: 'b1', category: 'Rent & Housing', monthlyLimit: isKes ? 50000 : roundVal(450) },
      { id: 'b2', category: 'Food & Groceries', monthlyLimit: isKes ? 25000 : roundVal(220) },
      { id: 'b3', category: 'Transport & Fuel', monthlyLimit: isKes ? 15000 : roundVal(120) },
      { id: 'b4', category: 'Utilities & Bills', monthlyLimit: isKes ? 10000 : roundVal(80) },
      { id: 'b5', category: 'Entertainment & Dining', monthlyLimit: isKes ? 12000 : roundVal(100) },
    ];

    const demoSavings: SavingsGoal[] = [
      {
        id: 'demo-goal-' + (Date.now() + 1),
        title: isKes ? 'Prime Plot / Land Deposit' : 'Real Estate Down Payment',
        targetAmount: isKes ? 600000 : roundVal(4500),
        currentAmount: isKes ? 240000 : roundVal(1800),
        deadline: '2026-12-31',
        category: 'Land & Property',
        color: '#0df2c9',
      },
      {
        id: 'demo-goal-' + (Date.now() + 2),
        title: 'High Performance Laptop & Workstation',
        targetAmount: isKes ? 180000 : roundVal(1350),
        currentAmount: isKes ? 110000 : roundVal(825),
        deadline: '2026-11-30',
        category: 'Gadget / Tech',
        color: '#38bdf8',
      },
    ];

    const demoInvestments: InvestmentItem[] = [
      {
        id: 'demo-inv-' + (Date.now() + 1),
        name: isKes ? 'CIC / Sanlam Money Market Fund' : 'Daily Compound Money Market Fund (MMF)',
        assetClass: 'Money Market Fund (MMF)',
        currentValue: isKes ? 280000 : roundVal(2100),
        investedAmount: isKes ? 250000 : roundVal(1900),
        expectedAnnualYieldPercent: 14.5,
        provider: isKes ? 'CIC Asset Management' : 'Vanguard / Fidelity',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      {
        id: 'demo-inv-' + (Date.now() + 2),
        name: isKes ? 'Stima DT SACCO Deposits' : 'Credit Union High-Yield Shares',
        assetClass: 'SACCO Deposits & Shares',
        currentValue: isKes ? 190000 : roundVal(1450),
        investedAmount: isKes ? 170000 : roundVal(1300),
        expectedAnnualYieldPercent: 12.0,
        provider: isKes ? 'Stima SACCO' : 'State Credit Union',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      {
        id: 'demo-inv-' + (Date.now() + 3),
        name: isKes ? 'Central Bank Infrastructure Bond (IFB)' : '10-Yr Government Infrastructure Bond',
        assetClass: 'Treasury Bills & Bonds',
        currentValue: isKes ? 150000 : roundVal(1150),
        investedAmount: isKes ? 150000 : roundVal(1150),
        expectedAnnualYieldPercent: 16.5,
        provider: 'Central Bank',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    ];

    const demoDebts: DebtItem[] = [
      {
        id: 'demo-debt-' + (Date.now() + 1),
        name: isKes ? 'M-Shwari / Fuliza Short-term' : 'Credit Card Facility Balance',
        lender: isKes ? 'NCBA / Safaricom' : 'Commercial Bank',
        principal: isKes ? 20000 : roundVal(160),
        remainingAmount: isKes ? 8500 : roundVal(65),
        interestRatePercent: 7.5,
        minimumMonthlyPayment: isKes ? 3500 : roundVal(28),
        dueDate: '2026-10-28',
        category: 'Mobile Loan',
      },
    ];

    const demoEmergencyFund: EmergencyFundConfig = {
      monthlyEssentialExpenses: isKes ? 65000 : roundVal(500),
      targetMonths: 6,
      currentAmount: isKes ? 195000 : roundVal(1500),
    };

    const demoChamas: ChamaItem[] = [
      {
        id: 'demo-chama-' + (Date.now() + 1),
        name: isKes ? 'Nairobi Tech Professionals Chama' : 'Community Wealth Circle',
        type: 'Merry-Go-Round',
        totalMembers: 12,
        frequency: 'monthly',
        contributionAmount: isKes ? 10000 : roundVal(80),
        payoutAmount: isKes ? 120000 : roundVal(960),
        payoutDate: '2026-12-15',
        notes: 'Monthly payout rotates among members',
      },
    ];

    setIncomes(demoIncomes);
    setExpenses(demoExpenses);
    setBudgets(demoBudgets);
    setSavingsGoals(demoSavings);
    setInvestments(demoInvestments);
    setDebts(demoDebts);
    setEmergencyFund(demoEmergencyFund);
    setChamas(demoChamas);

    setDataNotice({
      type: 'info',
      message: 'Realistic demo financial dataset loaded. Explore dashboards, insights, and charts!',
    });
  };

  const hasAnyData =
    incomes.length > 0 ||
    expenses.length > 0 ||
    investments.length > 0 ||
    debts.length > 0 ||
    savingsGoals.length > 0 ||
    chamas.length > 0 ||
    emergencyFund.currentAmount > 0 ||
    budgets.some((b) => b.monthlyLimit > 0);

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

  // Safe to Spend Today
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);
  const dailySafeToSpend = totalMonthlyIncome > 0
    ? Math.max(0, Math.round(Math.max(0, totalMonthlyIncome - totalMonthlyExpenses) / daysRemaining))
    : 0;

  // Dynamic Badges Engine
  const badges: MilestoneBadge[] = React.useMemo(() => {
    const list: MilestoneBadge[] = [];
    const totalTransactions = incomes.length + expenses.length;
    const essentialExpenses = emergencyFund.monthlyEssentialExpenses || (totalMonthlyExpenses > 0 ? totalMonthlyExpenses : 30000);
    const monthsSaved = essentialExpenses > 0 ? totalEmergencyFund / essentialExpenses : 0;
    const completedGoals = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount && g.targetAmount > 0);
    const activeBudgets = budgets.filter((b) => b.monthlyLimit > 0);

    list.push({
      id: 'first-entry',
      title: 'First Shilling',
      description: 'Record your very first income or expense transaction',
      icon: 'Wallet',
      unlocked: totalTransactions > 0,
      progress: totalTransactions > 0 ? 100 : 0,
    });

    list.push({
      id: 'budget-disciplined',
      title: 'Budget Master',
      description: 'Define limits for at least 3 core spending categories',
      icon: 'SlidersHorizontal',
      unlocked: activeBudgets.length >= 3,
      progress: Math.min(100, Math.round((activeBudgets.length / 3) * 100)),
    });

    list.push({
      id: 'emergency-starter',
      title: 'Safety Shield',
      description: 'Accumulate at least 1 month of essential expenses in emergency cash',
      icon: 'Shield',
      unlocked: monthsSaved >= 1,
      progress: Math.min(100, Math.round(monthsSaved * 100)),
    });

    list.push({
      id: 'financial-fortress',
      title: 'Financial Fortress',
      description: 'Build a bulletproof 6-month living expense runway',
      icon: 'ShieldCheck',
      unlocked: monthsSaved >= 6,
      progress: Math.min(100, Math.round((monthsSaved / 6) * 100)),
    });

    list.push({
      id: 'active-investor',
      title: 'Wealth Builder',
      description: 'Invest into compound interest assets (MMF, SACCOs, Bonds, Stocks)',
      icon: 'TrendingUp',
      unlocked: totalInvestments > 0,
      progress: totalInvestments > 0 ? 100 : 0,
    });

    list.push({
      id: 'super-saver',
      title: 'Savvy Saver',
      description: 'Achieve a monthly savings rate of 30% or higher',
      icon: 'Sparkles',
      unlocked: savingsRate >= 30,
      progress: Math.min(100, Math.round((savingsRate / 30) * 100)),
    });

    list.push({
      id: 'goal-crusher',
      title: 'Goal Crusher',
      description: 'Fully fund any savings milestone target',
      icon: 'Target',
      unlocked: completedGoals.length > 0,
      progress: completedGoals.length > 0 ? 100 : savingsGoals.length > 0 ? 50 : 0,
    });

    list.push({
      id: 'debt-slayer',
      title: 'Debt Free Life',
      description: 'Zero high-interest debt liabilities',
      icon: 'CreditCard',
      unlocked: debts.length === 0 && (incomes.length > 0 || totalInvestments > 0),
      progress: debts.length === 0 ? 100 : 40,
    });

    list.push({
      id: 'chama-champion',
      title: 'Chama Pillar',
      description: 'Join and manage a community Chama or Table Banking circle',
      icon: 'Users',
      unlocked: chamas.length > 0,
      progress: chamas.length > 0 ? 100 : 0,
    });

    list.push({
      id: 'centurion',
      title: '100K Club',
      description: 'Surpass KES 100,000 in combined Net Worth',
      icon: 'Award',
      unlocked: netWorth >= 100000,
      progress: Math.min(100, Math.max(0, Math.round((netWorth / 100000) * 100))),
    });

    list.push({
      id: 'mullah-millionaire',
      title: 'Mullah Millionaire',
      description: 'Reach seven-figure Net Worth milestone (KES 1,000,000+)',
      icon: 'Crown',
      unlocked: netWorth >= 1000000,
      progress: Math.min(100, Math.max(0, Math.round((netWorth / 1000000) * 100))),
    });

    return list;
  }, [incomes, expenses, budgets, savingsGoals, emergencyFund, totalEmergencyFund, totalMonthlyExpenses, totalInvestments, savingsRate, debts, chamas, netWorth]);

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
        currencySymbol,
        setCurrency,
        formatCurrency,
        currentPeriod,
        setCurrentPeriod,
        exchangeRates,
        refreshExchangeRates,
        currencyNotice,
        dismissCurrencyNotice,
        incomes,
        expenses,
        budgets,
        savingsGoals,
        investments,
        debts,
        emergencyFund,
        chamas,
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
        addChama,
        deleteChama,
        totalMonthlyIncome,
        totalMonthlyExpenses,
        savingsThisMonth,
        savingsRate,
        totalInvestments,
        totalEmergencyFund,
        totalDebt,
        totalSavingsGoals,
        netWorth,
        dailySafeToSpend,
        badges,
        financialHealth,
        isCloudSyncing,
        hasAnyData,
        clearAllData,
        resetToZeroState,
        loadDemoData,
        isClearDataModalOpen,
        setIsClearDataModalOpen,
        dataNotice,
        dismissDataNotice,
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
