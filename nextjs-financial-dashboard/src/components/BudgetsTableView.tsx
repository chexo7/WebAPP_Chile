"use client";

import React from 'react';
import { useData, ExpenseCategory } from '@/utils/DataContext';
import { formatDynamicCurrency } from '@/utils/formatters';

interface BudgetsTableViewProps {
  onSelectCategory: (categoryId: string) => void; // Callback when a row is clicked
}

const BudgetsTableView: React.FC<BudgetsTableViewProps> = ({ onSelectCategory }) => {
  const { currentBackupData } = useData();
  const { expense_categories = {}, budgets = {}, settings } = currentBackupData || {};
  const displaySymbol = settings?.display_currency_symbol || '$';

  const sortedCategories = Object.values(expense_categories).sort((a, b) => a.name.localeCompare(b.name));

  if (sortedCategories.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay categorías de gastos definidas. Agregue categorías en la pestaña de Gastos.</p>;
  }

  return (
    <div className="dynamic-table-scroll mt-4 overflow-x-auto">
      <table id="budgets-table-view" className="min-w-full w-full border-collapse text-sm">
        <thead className="bg-header-bg sticky top-0 z-10">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Categoría</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Tipo</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color text-right">Monto Presupuestado</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map(category => (
            <tr 
              key={category.id} 
              onClick={() => onSelectCategory(category.id)}
              className="hover:bg-row-hover-bg cursor-pointer transition-colors duration-150"
            >
              <td className="py-2 px-3 border-b border-border-color">{category.name}</td>
              <td className="py-2 px-3 border-b border-border-color">{category.type}</td>
              <td className="py-2 px-3 border-b border-border-color text-right">
                {formatDynamicCurrency(budgets?.[category.id] || 0, displaySymbol)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetsTableView;
