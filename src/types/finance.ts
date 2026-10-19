export type TabType = 
  | 'dashboard'
  | 'insights'
  | 'income'
  | 'expenses'
  | 'budget'
  | 'savings'
  | 'emergency'
  | 'investments'
  | 'debt'
  | 'calculator'
  | 'reports'
  | 'mpesa'
  | 'tax'
  | 'chama'
  | 'cashflow'
  | 'milestones';

export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP' | 'TZS' | 'UGX';

export interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  category: 'Salary' | 'Business' | 'Freelance' | 'Side Hustle' | 'Dividends' | 'Rental' | 'Other';
  frequency: 'monthly' | 'one-time';
  date: string;
  paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'SACCO' | 'Other';
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 
    | 'Rent & Housing' 
    | 'Food & Groceries' 
    | 'Transport & Fuel' 
    | 'Utilities & Bills' 
    | 'Entertainment & Dining' 
    | 'Healthcare' 
    | 'Education' 
    | 'Family & Support' 
    | 'Shopping' 
    | 'Other';
  date: string;
  paymentMethod: 'M-Pesa' | 'Card' | 'Cash' | 'Bank' | 'Other';
  isRecurring: boolean;
  notes?: string;
  mpesaRef?: string;
}

export interface BudgetCategory {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'Land & Property' | 'Vehicle' | 'Wedding' | 'Business Capital' | 'Travel' | 'Education' | 'Gadget / Tech' | 'Emergency' | 'Other';
  color: string;
}

export interface InvestmentItem {
  id: string;
  name: string;
  assetClass: 
    | 'Money Market Fund (MMF)' 
    | 'SACCO Deposits & Shares' 
    | 'NSE Stocks' 
    | 'Treasury Bills & Bonds' 
    | 'Real Estate' 
    | 'Cryptocurrency' 
    | 'Offshore / ETFs' 
    | 'Other';
  currentValue: number;
  investedAmount: number;
  expectedAnnualYieldPercent: number;
  provider: string;
  lastUpdated: string;
}

export interface DebtItem {
  id: string;
  name: string;
  lender: string;
  principal: number;
  remainingAmount: number;
  interestRatePercent: number;
  minimumMonthlyPayment: number;
  dueDate: string;
  category: 'Mobile Loan' | 'Bank Loan' | 'Student / HELB' | 'Credit Card' | 'Personal' | 'Mortgage' | 'Other';
}

export interface EmergencyFundConfig {
  monthlyEssentialExpenses: number;
  targetMonths: number;
  currentAmount: number;
}

export interface FinancialHealth {
  score: number;
  status: 'Critical' | 'Needs work' | 'Fair' | 'Good' | 'Excellent';
  color: string;
  savingsRateScore: number;
  emergencyScore: number;
  debtScore: number;
  budgetScore: number;
  tips: string[];
}

export interface ChamaItem {
  id: string;
  name: string;
  contributionAmount: number;
  frequency: 'monthly' | 'weekly' | 'bi-weekly';
  totalMembers: number;
  payoutDate: string;
  payoutAmount: number;
  type: 'Merry-Go-Round' | 'Table Banking / Investment' | 'Welfare';
  notes?: string;
}

export interface ParsedMpesaMessage {
  refCode: string;
  amount: number;
  type: 'sent' | 'paid' | 'received' | 'withdraw';
  counterparty: string;
  date: string;
  time: string;
  suggestedCategory: ExpenseItem['category'];
  balance?: number;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 - 100
}
