"use client";

import React from 'react';
import { useData, Expense } from '@/utils/DataContext';
import { formatDynamicCurrency } from '@/utils/formatters';
import { getISODateString, getWeekNumber, getMondayOfWeek, addWeeks, addMonths, getDaysInMonth } from '@/utils/dateUtils'; // Assuming dateUtils is correct
// It's better to have calculation utilities in calculationUtils.ts if they become complex or are shared.
// For now, keeping filtering logic here for directness.

interface PaymentsTableProps {
  selectedPeriodStart: Date;
  selectedPeriodEnd: Date;
  periodKeyPart: string; // e.g., "W32" or "08" (for August)
  analysisPeriodicity: 'mensual' | 'semanal' | 'diario';
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({ 
  selectedPeriodStart, 
  selectedPeriodEnd,
  periodKeyPart,
  analysisPeriodicity
}) => {
  const { currentBackupData, setCurrentBackupData } = useData();
  const { expenses = {}, expense_categories = {}, payments = {}, settings } = currentBackupData || {};
  const displaySymbol = settings?.display_currency_symbol || '$';

  const isExpenseDueInPeriod = (expense: Expense, periodStart: Date, periodEnd: Date): boolean => {
    const expenseStartDate = new Date(expense.startDate + 'T00:00:00'); // Ensure local time interpretation
    const expenseEndDate = expense.endDate ? new Date(expense.endDate + 'T00:00:00') : null;

    // Check if the expense's general active period overlaps with the selected period at all
    if (expenseStartDate > periodEnd) return false; // Expense starts after the period ends
    if (expenseEndDate && expenseEndDate < periodStart) return false; // Expense ends before the period starts

    // Frequency-specific checks
    switch (expense.frequency) {
      case 'Único':
        return expenseStartDate >= periodStart && expenseStartDate <= periodEnd;
      case 'Mensual':
        // An expense is due if its start date is before or within the period's end,
        // AND (it's ongoing OR its end date is after or within the period's start).
        // Then, check if the expense's "day" of the month falls within the period.
        // This logic is simplified: if the expense is active during any part of the month, it's considered due.
        // More precise: check if expenseStartDate.getDate() is within the month days.
        return true; // Simplified: if active in month, it's due. Original app might have more complex day check.
      case 'Semanal':
        // If the expense is generally active, and its start day of week occurs, it's due.
        // This simplified check considers it due if any part of its active duration overlaps the week.
        return true; 
      case 'Quincenal':
         // This is complex. Original app might check specific start days or 1st/15th.
         // Simplified: if active in the period, assume it might occur.
         // For a more accurate check, one would need to iterate through paydays.
        return true;
      case 'Anual':
        // Check if the expense's month and day fall within the current year's period
        // This is more complex if period spans across year boundary for annual check.
        // Simplified: if active and the month of expenseStartDate is same as periodStart's month (if monthly view)
        if (analysisPeriodicity === 'mensual') {
            return expenseStartDate.getMonth() === periodStart.getMonth() && expenseStartDate.getFullYear() <= periodStart.getFullYear();
        }
        // For weekly, it's more complex - does the anniversary fall in this week?
        return true; // Needs refinement for weekly/daily views of annual expenses
      default:
        return false;
    }
  };
  
  const dueExpenses = Object.values(expenses).filter(expense => {
      if (!expense.isReal) return false; // Only show real expenses
      return isExpenseDueInPeriod(expense, selectedPeriodStart, selectedPeriodEnd);
  }).sort((a,b) => a.name.localeCompare(b.name));


  const handlePaymentToggle = (expenseId: string, expenseName: string) => {
    const year = selectedPeriodStart.getFullYear();
    // periodKeyPart is already the month number (e.g., "08") or week number (e.g., "W32")
    const paymentKey = `${expenseName}|${year}|${periodKeyPart}`;

    setCurrentBackupData(prevData => {
      if (!prevData) return null;
      const updatedPayments = { ...(prevData.payments || {}) };
      if (updatedPayments[paymentKey]) {
        delete updatedPayments[paymentKey]; // Mark as unpaid
      } else {
        updatedPayments[paymentKey] = true; // Mark as paid
      }
      return { ...prevData, payments: updatedPayments };
    });
  };

  if (!settings) {
    return <p className="text-center text-gray-500 py-4">Ajustes de la aplicación no cargados.</p>;
  }
  if (dueExpenses.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay gastos registrados como "reales" para este período.</p>;
  }


  return (
    <div className="dynamic-table-scroll mt-4 overflow-x-auto">
      <table id="payments-table-view" className="min-w-full w-full border-collapse text-sm">
        <thead className="bg-header-bg sticky top-0 z-10">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Gasto</th>
            <th className="py-2 px-3 font-semibold text-primary border-b border-border-color text-right">Monto</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Categoría (Tipo)</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">¿Pagado?</th>
          </tr>
        </thead>
        <tbody>
          {dueExpenses.map(expense => {
            const year = selectedPeriodStart.getFullYear();
            const paymentKey = `${expense.name}|${year}|${periodKeyPart}`;
            const isPaid = payments[paymentKey] || false;
            const category = expense_categories[expense.category];

            return (
              <tr key={expense.id} className={`hover:bg-row-hover-bg transition-colors duration-150 ${isPaid ? 'bg-green-50' : ''}`}>
                <td className="py-2 px-3 border-b border-border-color">{expense.name}</td>
                <td className="py-2 px-3 border-b border-border-color text-right">
                  {formatDynamicCurrency(expense.amount, displaySymbol)}
                </td>
                <td className="py-2 px-3 border-b border-border-color">
                  {category ? `${category.name} (${category.type})` : expense.category}
                </td>
                <td className="py-2 px-3 border-b border-border-color text-center">
                  <input
                    type="checkbox"
                    id={`payment-${expense.id}-${periodKeyPart}`}
                    checked={isPaid}
                    onChange={() => handlePaymentToggle(expense.id, expense.name)}
                    className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;
