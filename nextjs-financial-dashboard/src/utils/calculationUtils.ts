import { Expense, Income, Settings, ExpenseCategory, Budgets } from './DataContext'; // Assuming DataContext exports these
import { getISODateString } from './dateUtils'; // Assuming dateUtils.ts is in the same directory or accessible path

// --- Date Utilities (adapted from original app.js) ---

/**
 * Adds a specified number of months to a given date.
 * @param date The starting date (either a Date object or an ISO string).
 * @param months The number of months to add.
 * @returns A new Date object representing the date after adding the months.
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Adds a specified number of weeks to a given date.
 * @param date The starting date (either a Date object or an ISO string).
 * @param weeks The number of weeks to add.
 * @returns A new Date object representing the date after adding the weeks.
 */
export const addWeeks = (date: Date | string, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

/**
 * Gets the ISO week number of a given date.
 * @param date The date (either a Date object or an ISO string).
 * @returns The ISO week number.
 */
export const getWeekNumber = (date: Date | string): number => {
  const d = new Date(Date.UTC(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return weekNo;
};

/**
 * Gets the Monday of the week for a given date.
 * @param date The date (either a Date object or an ISO string).
 * @returns A new Date object representing the Monday of that week.
 */
export const getMondayOfWeek = (date: Date | string): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Gets the number of days in a specific month of a specific year.
 * @param year The year.
 * @param month The month (1-12).
 * @returns The number of days in the month.
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};


// --- Budget Summary Calculation Logic ---

interface BudgetSummaryItem {
  category: string; // Category Name
  categoryId: string; // Category ID
  budgeted: number;
  spent: number;
  difference: number;
  percentage: number;
  type: 'Fijo' | 'Variable';
}

/**
 * Calculates the budget summary for a specific month.
 * @param expenses All expenses from DataContext.
 * @param incomes All incomes from DataContext (for reimbursements).
 * @param categories All expense categories from DataContext.
 * @param budgets All budget allocations from DataContext.
 * @param analysisSettings The settings object from DataContext, primarily for analysis_start_date.
 * @returns An array of BudgetSummaryItem.
 */
export const calculateBudgetSummary = (
  expenses: Record<string, Expense>,
  incomes: Record<string, Income>,
  categories: Record<string, ExpenseCategory>,
  budgets: Budgets,
  analysisSettings: Settings | undefined
): BudgetSummaryItem[] => {
  if (!analysisSettings || !analysisSettings.analysis_start_date) {
    console.warn("Analysis start date is not set. Cannot calculate budget summary.");
    return [];
  }

  const summaryData: BudgetSummaryItem[] = [];
  const expensesArray = Object.values(expenses || {});
  const incomesArray = Object.values(incomes || {});

  // Determine the target month and year for the summary
  // Original app seems to use the month of the analysis_start_date
  const targetDate = new Date(analysisSettings.analysis_start_date + 'T00:00:00'); // Ensure local time interpretation
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth(); // 0-indexed

  for (const categoryId in categories) {
    const category = categories[categoryId];
    const budgetedAmount = budgets[categoryId] || 0;
    let actualSpending = 0;

    // Calculate spending for this category in the target month
    expensesArray.forEach(expense => {
      if (expense.category !== categoryId) return;

      const expenseStartDate = new Date(expense.startDate + 'T00:00:00');
      const expenseEndDate = expense.endDate ? new Date(expense.endDate + 'T00:00:00') : null;

      // Check if the expense is active in the target month
      let isActiveInMonth = false;
      if (expenseStartDate.getFullYear() < targetYear || (expenseStartDate.getFullYear() === targetYear && expenseStartDate.getMonth() <= targetMonth)) {
        if (expense.isOngoing || !expenseEndDate) {
          isActiveInMonth = true;
        } else if (expenseEndDate && (expenseEndDate.getFullYear() > targetYear || (expenseEndDate.getFullYear() === targetYear && expenseEndDate.getMonth() >= targetMonth))) {
          isActiveInMonth = true;
        }
      }
      
      if (!isActiveInMonth && expense.frequency !== 'Único') continue;


      let amountForMonth = 0;
      switch (expense.frequency) {
        case 'Único':
          if (expenseStartDate.getFullYear() === targetYear && expenseStartDate.getMonth() === targetMonth) {
            amountForMonth = expense.amount;
          }
          break;
        case 'Mensual':
          if (isActiveInMonth) amountForMonth = expense.amount;
          break;
        case 'Quincenal':
          // Approximation: if active, count 2 occurrences
          // More precise logic would check specific paydays relative to the month
          if (isActiveInMonth) amountForMonth = expense.amount * 2; 
          break;
        case 'Semanal':
          // Approximation: if active, count 4 occurrences
          // More precise logic would count weeks in the month overlapping the expense period
          if (isActiveInMonth) amountForMonth = expense.amount * 4;
          break;
        case 'Anual':
          if (expenseStartDate.getMonth() === targetMonth && isActiveInMonth) {
            amountForMonth = expense.amount;
          }
          break;
      }
      actualSpending += amountForMonth;
    });

    // Subtract reimbursements for this category in the target month
    incomesArray.forEach(income => {
      if (!income.isReimbursement || income.reimbursementCategory !== categoryId) return;
      
      const incomeStartDate = new Date(income.startDate + 'T00:00:00');
       // Assuming reimbursement frequency matches how it offsets expenses
      let reimbursementAmountForMonth = 0;
      switch (income.frequency) {
        case 'Único':
          if (incomeStartDate.getFullYear() === targetYear && incomeStartDate.getMonth() === targetMonth) {
            reimbursementAmountForMonth = income.amount;
          }
          break;
        case 'Mensual':
           // Check if active (similar to expense logic)
          const incomeEndDate = income.endDate ? new Date(income.endDate + 'T00:00:00') : null;
          let isActiveIncomeInMonth = false;
          if (incomeStartDate.getFullYear() < targetYear || (incomeStartDate.getFullYear() === targetYear && incomeStartDate.getMonth() <= targetMonth)) {
            if (income.isOngoing || !incomeEndDate) {
              isActiveIncomeInMonth = true;
            } else if (incomeEndDate && (incomeEndDate.getFullYear() > targetYear || (incomeEndDate.getFullYear() === targetYear && incomeEndDate.getMonth() >= targetMonth))) {
              isActiveIncomeInMonth = true;
            }
          }
          if(isActiveIncomeInMonth) reimbursementAmountForMonth = income.amount;
          break;
        // Add other frequencies if reimbursements can be recurring
      }
      actualSpending -= reimbursementAmountForMonth;
    });
    
    actualSpending = Math.max(0, actualSpending); // Ensure spending doesn't go negative due to reimbursements

    const difference = budgetedAmount - actualSpending;
    const percentage = budgetedAmount > 0 ? (actualSpending / budgetedAmount) * 100 : (actualSpending > 0 ? 100 : 0);

    summaryData.push({
      category: category.name,
      categoryId: category.id,
      budgeted: budgetedAmount,
      spent: actualSpending,
      difference: difference,
      percentage: parseFloat(percentage.toFixed(2)),
      type: category.type,
    });
  }
  
  // Sort by category name
  summaryData.sort((a, b) => a.category.localeCompare(b.category));

  return summaryData;
};


// --- Cash Flow Calculation Logic ---

export interface CashFlowData {
  periodDates: Date[];
  income_p: number[];
  fixed_exp_p: number[];
  var_exp_p: number[];
  net_flow_p: number[];
  end_bal_p: number[];
  expenses_by_cat_p: Record<string, number[]>; // Key: categoryId, Value: array of expenses per period
}

export const calculateCashFlowData = (
  settings: Settings | undefined,
  incomesData: Record<string, Income> | undefined,
  expensesData: Record<string, Expense> | undefined,
  categoriesData: Record<string, ExpenseCategory> | undefined
): CashFlowData | null => {
  if (!settings || !incomesData || !expensesData || !categoriesData) {
    console.error("Missing data for cash flow calculation", { settings, incomesData, expensesData, categoriesData });
    return null;
  }

  const {
    analysis_start_date,
    analysis_duration,
    analysis_periodicity,
    initial_balance,
  } = settings;

  const incomes = Object.values(incomesData);
  const expenses = Object.values(expensesData);
  const categories = categoriesData; // Keep as object for easy lookup by ID

  const periodDates: Date[] = [];
  const income_p: number[] = [];
  const fixed_exp_p: number[] = []; // Total fixed expenses per period
  const var_exp_p: number[] = [];   // Total variable expenses per period
  const net_flow_p: number[] = [];
  const end_bal_p: number[] = [];
  const expenses_by_cat_p: Record<string, number[]> = {};

  Object.keys(categories).forEach(catId => {
    expenses_by_cat_p[catId] = new Array(analysis_duration).fill(0);
  });

  let current_date = new Date(analysis_start_date + 'T00:00:00Z'); // Use UTC for consistency

  for (let i = 0; i < analysis_duration; i++) {
    let period_start_date: Date;
    let period_end_date: Date;

    if (analysis_periodicity === 'mensual') {
      period_start_date = new Date(Date.UTC(current_date.getUTCFullYear(), current_date.getUTCMonth(), 1));
      period_end_date = new Date(Date.UTC(current_date.getUTCFullYear(), current_date.getUTCMonth() + 1, 0));
      periodDates.push(period_start_date);
      current_date = addMonths(current_date, 1);
    } else if (analysis_periodicity === 'semanal') {
      period_start_date = getMondayOfWeek(current_date); // Assumes getMondayOfWeek handles UTC correctly if needed
      period_end_date = addWeeks(period_start_date, 1);
      period_end_date.setUTCDate(period_end_date.getUTCDate() - 1);
      periodDates.push(period_start_date);
      current_date = addWeeks(current_date, 1);
    } else { // diario - assuming for now, might need more specific handling
      period_start_date = new Date(current_date);
      period_end_date = new Date(current_date);
      periodDates.push(period_start_date);
      current_date.setUTCDate(current_date.getUTCDate() + 1);
    }

    let period_income_total = 0;
    let period_fixed_expenses_total = 0;
    let period_variable_expenses_total = 0;
    const period_expenses_by_category: Record<string, number> = {};
    Object.keys(categories).forEach(catId => period_expenses_by_category[catId] = 0);


    // Calculate Incomes (excluding reimbursements for now)
    incomes.forEach(income => {
      if (income.isReimbursement) return; // Skip reimbursements for initial income sum

      const income_start_date = new Date(income.startDate + 'T00:00:00Z');
      const income_end_date = income.endDate ? new Date(income.endDate + 'T00:00:00Z') : null;

      if (income_start_date > period_end_date || (income_end_date && income_end_date < period_start_date)) {
        return; // Income not active in this period
      }

      let occurrences = 0;
      switch (income.frequency) {
        case 'Único':
          if (income_start_date >= period_start_date && income_start_date <= period_end_date) {
            occurrences = 1;
          }
          break;
        case 'Mensual':
          if (analysis_periodicity === 'mensual') occurrences = 1;
          else if (analysis_periodicity === 'semanal') { // Approximate for weekly view
             const daysInPeriod = (period_end_date.getTime() - period_start_date.getTime()) / (1000 * 3600 * 24) + 1;
             occurrences = daysInPeriod / (getDaysInMonth(period_start_date.getUTCFullYear(), period_start_date.getUTCMonth()+1) / 1); // Simple proration by days in month
          }
          break;
        case 'Quincenal':
          if (analysis_periodicity === 'mensual') occurrences = 2; // Approximation
          else if (analysis_periodicity === 'semanal') occurrences = 0.5; // Approximation
          break;
        case 'Semanal':
          if (analysis_periodicity === 'mensual') occurrences = 4; // Approximation
          else if (analysis_periodicity === 'semanal') occurrences = 1;
          break;
        case 'Anual':
            if (income_start_date.getUTCMonth() === period_start_date.getUTCMonth() && analysis_periodicity === 'mensual') {
                occurrences = 1;
            } else if (analysis_periodicity === 'semanal') {
                // Check if the anniversary date falls within this week
                let currentYearAnniversary = new Date(Date.UTC(period_start_date.getUTCFullYear(), income_start_date.getUTCMonth(), income_start_date.getUTCDate()));
                if (currentYearAnniversary >= period_start_date && currentYearAnniversary <= period_end_date) {
                    occurrences = 1;
                }
            }
          break;
      }
      if (!income.isOngoing && income_end_date) { // Check end date for non-ongoing
          if (period_start_date > income_end_date) occurrences = 0;
      }
      period_income_total += income.amount * occurrences;
    });
    income_p[i] = period_income_total;

    // Calculate Expenses (initial sum per category)
    expenses.forEach(expense => {
      const expense_start_date = new Date(expense.startDate + 'T00:00:00Z');
      const expense_end_date = expense.endDate ? new Date(expense.endDate + 'T00:00:00Z') : null;

      if (expense_start_date > period_end_date || (expense_end_date && expense_end_date < period_start_date)) {
        return; // Expense not active in this period
      }
      
      let occurrences = 0;
      switch (expense.frequency) {
        case 'Único':
          if (expense_start_date >= period_start_date && expense_start_date <= period_end_date) {
            occurrences = 1;
          }
          break;
        case 'Mensual':
          if (analysis_periodicity === 'mensual') occurrences = 1;
          else if (analysis_periodicity === 'semanal') {
             const daysInPeriod = (period_end_date.getTime() - period_start_date.getTime()) / (1000 * 3600 * 24) + 1;
             occurrences = daysInPeriod / (getDaysInMonth(period_start_date.getUTCFullYear(), period_start_date.getUTCMonth()+1) / 1);
          }
          break;
        case 'Quincenal':
          if (analysis_periodicity === 'mensual') occurrences = 2;
          else if (analysis_periodicity === 'semanal') occurrences = 0.5;
          break;
        case 'Semanal':
          if (analysis_periodicity === 'mensual') occurrences = 4;
          else if (analysis_periodicity === 'semanal') occurrences = 1;
          break;
        case 'Anual':
            if (expense_start_date.getUTCMonth() === period_start_date.getUTCMonth() && analysis_periodicity === 'mensual') {
                occurrences = 1;
            } else if (analysis_periodicity === 'semanal') {
                let currentYearAnniversary = new Date(Date.UTC(period_start_date.getUTCFullYear(), expense_start_date.getUTCMonth(), expense_start_date.getUTCDate()));
                if (currentYearAnniversary >= period_start_date && currentYearAnniversary <= period_end_date) {
                    occurrences = 1;
                }
            }
          break;
      }
      if (!expense.isOngoing && expense_end_date) {
          if (period_start_date > expense_end_date) occurrences = 0;
      }
      if (categories[expense.category]) { // Ensure category exists
          period_expenses_by_category[expense.category] += expense.amount * occurrences;
      }
    });

    // Apply Reimbursements to expense categories
    incomes.forEach(income => {
      if (!income.isReimbursement || !income.reimbursementCategory) return;

      const income_start_date = new Date(income.startDate + 'T00:00:00Z');
      const income_end_date = income.endDate ? new Date(income.endDate + 'T00:00:00Z') : null;
      
      if (income_start_date > period_end_date || (income_end_date && income_end_date < period_start_date)) {
        return; // Reimbursement not active
      }

      let occurrences = 0;
       // Simplified occurrence logic for reimbursements, assuming they match period
      switch (income.frequency) {
        case 'Único':
          if (income_start_date >= period_start_date && income_start_date <= period_end_date) occurrences = 1;
          break;
        case 'Mensual': if (analysis_periodicity === 'mensual') occurrences = 1; break;
        // Add other frequencies if needed, similar to expenses/incomes
        default: occurrences = (analysis_periodicity === 'mensual' && income.frequency !== 'Anual') ? 1 : 0; // Basic fallback
      }
      if (!income.isOngoing && income_end_date) {
          if (period_start_date > income_end_date) occurrences = 0;
      }

      if (occurrences > 0 && period_expenses_by_category[income.reimbursementCategory]) {
        period_expenses_by_category[income.reimbursementCategory] -= income.amount * occurrences;
        // Ensure category expense doesn't go below zero due to reimbursement
        period_expenses_by_category[income.reimbursementCategory] = Math.max(0, period_expenses_by_category[income.reimbursementCategory]);
      }
    });

    // Sum up fixed and variable expenses and store per-category expenses for the period
    Object.keys(categories).forEach(catId => {
      const category = categories[catId];
      const categoryTotalForPeriod = period_expenses_by_category[catId] || 0;
      expenses_by_cat_p[catId][i] = categoryTotalForPeriod;

      if (category.type === 'Fijo') {
        period_fixed_expenses_total += categoryTotalForPeriod;
      } else if (category.type === 'Variable') {
        period_variable_expenses_total += categoryTotalForPeriod;
      }
    });

    fixed_exp_p[i] = period_fixed_expenses_total;
    var_exp_p[i] = period_variable_expenses_total;
    const period_total_expenses = period_fixed_expenses_total + period_variable_expenses_total;

    net_flow_p[i] = income_p[i] - period_total_expenses;
    if (i === 0) {
      end_bal_p[i] = initial_balance + net_flow_p[i];
    } else {
      end_bal_p[i] = end_bal_p[i - 1] + net_flow_p[i];
    }
  }

  return {
    periodDates,
    income_p,
    fixed_exp_p,
    var_exp_p,
    net_flow_p,
    end_bal_p,
    expenses_by_cat_p,
  };
};
