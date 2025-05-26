"use client";

import React, { useMemo } from 'react';
import { useData } from '@/utils/DataContext';
import { formatDynamicCurrency } from '@/utils/formatters';
import { calculateBudgetSummary } from '@/utils/calculationUtils'; // Assuming this is where the logic resides

const BudgetSummaryTable: React.FC = () => {
  const { currentBackupData } = useData();
  const { expenses, incomes, expense_categories, budgets, settings } = currentBackupData || {};
  const displaySymbol = settings?.display_currency_symbol || '$';

  // Memoize the summary calculation to avoid re-calculating on every render
  // unless relevant data changes.
  const budgetSummary = useMemo(() => {
    if (!expenses || !incomes || !expense_categories || !budgets || !settings) {
      return [];
    }
    return calculateBudgetSummary(expenses, incomes, expense_categories, budgets, settings);
  }, [expenses, incomes, expense_categories, budgets, settings]);

  if (!settings || !settings.analysis_start_date) {
     return <p className="text-center text-gray-500 py-4">La fecha de inicio del análisis no está configurada en los ajustes.</p>;
  }
  if (budgetSummary.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay datos de presupuesto para mostrar. Asegúrese de tener categorías, presupuestos y gastos definidos.</p>;
  }
  
  const getDifferenceClass = (difference: number): string => {
    if (difference < 0) return 'text-red'; // text-red from globals.css (mapped to var(--text-red))
    if (difference > 0) return 'text-green'; // text-green from globals.css
    return 'text-gray-700';
  };

  const getPercentageClass = (percentage: number): string => {
    if (percentage > 100) return 'text-red font-semibold';
    if (percentage > 80) return 'text-orange'; // text-orange from globals.css
    return 'text-green';
  };


  return (
    <div className="dynamic-table-scroll mt-4 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Resumen del Presupuesto (Mes de Inicio del Análisis)</h2>
      <table id="budget-summary-table" className="min-w-full w-full border-collapse text-sm">
        <thead className="bg-header-bg sticky top-0 z-10">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Categoría (Tipo)</th>
            <th className="py-2 px-3 font-semibold text-primary border-b border-border-color text-right">Presupuestado</th>
            <th className="py-2 px-3 font-semibold text-primary border-b border-border-color text-right">Gastado</th>
            <th className="py-2 px-3 font-semibold text-primary border-b border-border-color text-right">Diferencia</th>
            <th className="py-2 px-3 font-semibold text-primary border-b border-border-color text-right">% Gastado</th>
          </tr>
        </thead>
        <tbody>
          {budgetSummary.map(item => (
            <tr key={item.categoryId} className="hover:bg-row-hover-bg transition-colors duration-150">
              <td className="py-2 px-3 border-b border-border-color">{item.category} ({item.type})</td>
              <td className="py-2 px-3 border-b border-border-color text-right">
                {formatDynamicCurrency(item.budgeted, displaySymbol)}
              </td>
              <td className="py-2 px-3 border-b border-border-color text-right">
                {formatDynamicCurrency(item.spent, displaySymbol)}
              </td>
              <td className={`py-2 px-3 border-b border-border-color text-right ${getDifferenceClass(item.difference)}`}>
                {formatDynamicCurrency(item.difference, displaySymbol)}
              </td>
              <td className={`py-2 px-3 border-b border-border-color text-right ${getPercentageClass(item.percentage)}`}>
                {item.percentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
         <tfoot>
            <tr className="bg-gray-100 font-semibold">
                <td className="py-2 px-3 border-b border-border-color text-right" colSpan={1}>Totales:</td>
                <td className="py-2 px-3 border-b border-border-color text-right">
                    {formatDynamicCurrency(budgetSummary.reduce((sum, item) => sum + item.budgeted, 0), displaySymbol)}
                </td>
                <td className="py-2 px-3 border-b border-border-color text-right">
                    {formatDynamicCurrency(budgetSummary.reduce((sum, item) => sum + item.spent, 0), displaySymbol)}
                </td>
                <td className={`py-2 px-3 border-b border-border-color text-right ${getDifferenceClass(budgetSummary.reduce((sum, item) => sum + item.difference, 0))}`}>
                    {formatDynamicCurrency(budgetSummary.reduce((sum, item) => sum + item.difference, 0), displaySymbol)}
                </td>
                <td className="py-2 px-3 border-b border-border-color text-right">
                    {/* Average percentage doesn't make much sense here, or would need weighted average */}
                </td>
            </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BudgetSummaryTable;
