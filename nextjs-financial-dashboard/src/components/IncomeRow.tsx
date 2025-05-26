"use client";

import React from 'react';
import { Income, useData } from '@/utils/DataContext';
import { formatDynamicCurrency } from '@/utils/formatters';
import { getISODateString } from '@/utils/dateUtils';

interface IncomeRowProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (incomeId: string) => void;
}

const IncomeRow: React.FC<IncomeRowProps> = ({ income, onEdit, onDelete }) => {
  const { currentBackupData } = useData();
  const displaySymbol = currentBackupData?.settings?.display_currency_symbol || '$';
  const expenseCategories = currentBackupData?.expense_categories || {};

  const getReimbursementCategoryName = (categoryId: string | null | undefined): string => {
    if (!categoryId) return 'N/A';
    return expenseCategories[categoryId]?.name || categoryId; // Fallback to ID if name not found
  };
  
  const frequencyMap: Record<Income['frequency'], string> = {
    'Mensual': 'Mensual',
    'Quincenal': 'Quincenal',
    'Semanal': 'Semanal',
    'Anual': 'Anual',
    'Único': 'Una Sola Vez',
  };

  return (
    <tr className="hover:bg-row-hover-bg transition-colors duration-150">
      <td className="py-2 px-3 border-b border-border-color text-sm">
        {income.name}
        {income.isReimbursement && (
          <span 
            className="reimbursement-icon ml-1 text-accent font-bold cursor-help"
            title={`Reembolso de: ${getReimbursementCategoryName(income.reimbursementCategory)}`}
          >
            (R)
          </span>
        )}
      </td>
      <td className={`py-2 px-3 border-b border-border-color text-sm text-right ${income.isReimbursement ? 'text-accent italic' : ''}`}>
        {formatDynamicCurrency(income.amount, displaySymbol)}
      </td>
      <td className="py-2 px-3 border-b border-border-color text-sm">{frequencyMap[income.frequency] || income.frequency}</td>
      <td className="py-2 px-3 border-b border-border-color text-sm">{getISODateString(income.startDate)}</td>
      <td className="py-2 px-3 border-b border-border-color text-sm">
        {income.frequency === 'Único' ? getISODateString(income.startDate) : (income.isOngoing ? 'Indefinido' : getISODateString(income.endDate))}
      </td>
      <td className="py-2 px-3 border-b border-border-color text-sm">
        <button 
          onClick={() => onEdit(income)} 
          className="small-button bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mr-1 text-xs"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(income.id)} 
          className="small-button bg-danger hover:bg-danger-hover text-white py-1 px-2 rounded text-xs"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default IncomeRow;
