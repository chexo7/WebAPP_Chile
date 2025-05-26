"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure of your financial data
export interface Income {
  id: string; // Unique ID for the income, can be incomeName for simplicity if unique
  name: string;
  amount: number;
  frequency: 'Único' | 'Mensual' | 'Quincenal' | 'Semanal' | 'Anual';
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate?: string | null; // ISO Date string YYYY-MM-DD
  isOngoing: boolean;
  isReimbursement: boolean;
  reimbursementCategory?: string | null; // Key of the expense category
}

export interface ExpenseCategory {
  id: string; // Unique ID, can be categoryName if unique and Firebase safe
  name: string;
  type: 'Fijo' | 'Variable'; // Type of category
  // Add other properties if needed, e.g., budget amount for this category
}

export interface Expense {
  id: string; // Unique ID
  name: string;
  amount: number;
  category: string; // Category ID/name
  frequency: 'Único' | 'Mensual' | 'Quincenal' | 'Semanal' | 'Anual';
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate?: string | null; // ISO Date string YYYY-MM-DD
  isOngoing: boolean;
  isReal: boolean; // If the expense is a real transaction or a projection
  type?: 'Fijo' | 'Variable'; // Derived from category, stored for convenience
}

// Budgets will store the budgeted amount for each expense category ID
export type Budgets = Record<string, number>;


export interface Settings {
  analysis_periodicity: 'mensual' | 'semanal' | 'diario';
  analysis_duration: number;
  analysis_start_date: string; // ISO format YYYY-MM-DD
  initial_balance: number;
  display_currency_symbol: string;
  exchangeRateCLPToUSD?: number | null;
  // Add other settings as needed
}

// This is a placeholder and should be expanded based on your app's needs
interface FinancialData {
  incomes: Record<string, Income>;
  expenses: Record<string, Expense>;
  expense_categories: Record<string, ExpenseCategory>;
  budgets: Budgets; // Budget amount per category ID
  payments: Record<string, boolean>; // Key: "expenseName|year|monthOrWeek", Value: true if paid
  settings: Settings;
  // Add other data structures as needed
}

interface ChangeLogEntry {
  timestamp: string;
  user: string; // Or UID
  message: string;
  details?: Record<string, any>;
}

interface DataContextType {
  currentBackupData: FinancialData | null;
  setCurrentBackupData: (data: FinancialData | null | ((prev: FinancialData | null) => FinancialData | null)) => void;
  originalLoadedData: FinancialData | null;
  setOriginalLoadedData: (data: FinancialData | null | ((prev: FinancialData | null) => FinancialData | null)) => void;
  currentBackupKey: string | null;
  setCurrentBackupKey: (key: string | null) => void;
  changeLogEntries: ChangeLogEntry[];
  setChangeLogEntries: (entries: ChangeLogEntry[]) => void;
  isDataLoaded: boolean; // Helper to quickly check if data is available
  setDataAsLoaded: () => void; // To set isDataLoaded to true
  resetDataState: () => void; // To reset context state (e.g., on logout or new data load)
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBackupData, setCurrentBackupData] = useState<FinancialData | null>(null);
  const [originalLoadedData, setOriginalLoadedData] = useState<FinancialData | null>(null);
  const [currentBackupKey, setCurrentBackupKey] = useState<string | null>(null);
  // Default settings for initialization
  const defaultSettings: Settings = {
    analysis_periodicity: 'mensual',
    analysis_duration: 12,
    analysis_start_date: new Date().toISOString().split('T')[0],
    initial_balance: 0,
    display_currency_symbol: '$',
    exchangeRateCLPToUSD: 900, // Default, will be updated from API
  };
  const [changeLogEntries, setChangeLogEntries] = useState<ChangeLogEntry[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const setDataAsLoaded = () => setIsDataLoaded(true);

  const resetDataState = () => {
    setCurrentBackupData({ incomes: {}, expenses: {}, expense_categories: {}, budgets: {}, payments: {}, settings: defaultSettings });
    setOriginalLoadedData({ incomes: {}, expenses: {}, expense_categories: {}, budgets: {}, payments: {}, settings: defaultSettings });
    setCurrentBackupKey(null);
    setChangeLogEntries([]); // Reset changelog on full data reset
    setIsDataLoaded(false);
  };

  // Initialize with default structure if no data is loaded initially (e.g. for a new user)
  useEffect(() => {
    if (!currentBackupData && !isDataLoaded) {
      setCurrentBackupData({ incomes: {}, expenses: {}, expense_categories: {}, budgets: {}, payments: {}, settings: defaultSettings });
      setOriginalLoadedData({ incomes: {}, expenses: {}, expense_categories: {}, budgets: {}, payments: {}, settings: defaultSettings });
    }
  }, []); // Run once on mount


  return (
    <DataContext.Provider
      value={{
        currentBackupData,
        setCurrentBackupData,
        originalLoadedData,
        setOriginalLoadedData,
        currentBackupKey,
        setCurrentBackupKey,
        changeLogEntries,
        setChangeLogEntries,
        isDataLoaded,
        setDataAsLoaded,
        resetDataState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
