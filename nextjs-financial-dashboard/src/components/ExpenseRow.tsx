"use client";

import React from 'react';
import { Expense, useData } from '@/utils/DataContext';
import { formatDynamicCurrency } from '@/utils/formatters';
import { getISODateString } from '@/utils/dateUtils';

interface ExpenseRowProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense, onEdit, onDelete }) => {
  const { currentBackupData } = useData();
  const displaySymbol = currentBackupData?.settings?.display_currency_symbol || '$';
  const expenseCategories = currentBackupData?.expense_categories || {};
  
  const categoryName = expenseCategories[expense.category]?.name || expense.category;
  const categoryType = expenseCategories[expense.category]?.type || 'N/A';

  const frequencyMap: Record<Expense['frequency'], string> = {
    'Mensual': 'Mensual',
    'Quincenal': 'Quincenal',
    'Semanal': 'Semanal',
    'Anual': 'Anual',
    'Único': 'Una Sola Vez',
  };

  return (
    <tr className="hover:bg-row-hover-bg transition-colors duration-150">
      <td className="py-2 px-3 border-b border-border-color text-sm">{expense.name}</td>
      <td className="py-2 px-3 border-b border-border-color text-sm text-right">
        {formatDynamicCurrency(expense.amount, displaySymbol)}
      </td>
      <td className="py-2 px-3 border-b border-border-color text-sm">{categoryName} ({categoryType})</td>
      <td className="py-2 px-3 border-b border-border-color text-sm">{frequencyMap[expense.frequency] || expense.frequency}</td>
      <td className="py-2 px-3 border-b border-border-color text-sm">{getISODateString(expense.startDate)}</td>
      <td className="py-2 px-3 border-b border-border-color text-sm">
         {expense.frequency === 'Único' ? getISODateString(expense.startDate) : (expense.isOngoing ? 'Indefinido' : getISODateString(expense.endDate))}
      </td>
      <td className="py-2 px-3 border-b border-border-color text-sm">
        {expense.isReal ? 'Sí' : 'No'}
      </td>
      <td className="py-2 px-3 border-b border-border-color text-sm">
        <button 
          onClick={() => onEdit(expense)} 
          className="small-button bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mr-1 text-xs"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(expense.id)} 
          className="small-button bg-danger hover:bg-danger-hover text-white py-1 px-2 rounded text-xs"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default ExpenseRow;
