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
