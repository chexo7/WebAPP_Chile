"use client";

import React from 'react';
import { CashFlowData, ExpenseCategory } from '@/utils/calculationUtils'; // Assuming CashFlowData is exported here
import { useData } from '@/utils/DataContext'; // To get settings for currency and categories
import { formatDynamicCurrency } from '@/utils/formatters';
import { getISODateString } from '@/utils/dateUtils'; // For formatting header dates

interface CashFlowTableProps {
  cashFlowData: CashFlowData | null;
}

// Define the structure for row definitions, similar to cf_row_definitions
interface CashFlowRowDefinition {
  id: string;
  label: string;
  isBold?: boolean;
  isCategory?: boolean; // True if this row represents an expense category
  categoryId?: string;  // The ID of the expense category
  isSubHeader?: boolean; // For rows like "Total Gastos Fijos"
  isTotal?: boolean; // For rows like "Total Gastos" (though not explicitly in original cf_row_definitions)
  dataKey: keyof Pick<CashFlowData, 'income_p' | 'fixed_exp_p' | 'var_exp_p' | 'net_flow_p' | 'end_bal_p'> | 'initial_balance' | 'total_expenses';
  indent?: boolean; // For indenting category rows
}


const CashFlowTable: React.FC<CashFlowTableProps> = ({ cashFlowData }) => {
  const { currentBackupData } = useData();
  const { settings, expense_categories = {} } = currentBackupData || {};
  const displaySymbol = settings?.display_currency_symbol || '$';
  const analysisPeriodicity = settings?.analysis_periodicity || 'mensual';

  if (!cashFlowData) {
    return <p className="text-center text-gray-500 py-4">No hay datos de flujo de caja para mostrar.</p>;
  }
  if (!settings) {
    return <p className="text-center text-gray-500 py-4">Configuración no cargada.</p>;
  }

  const { 
    periodDates, 
    income_p, 
    fixed_exp_p, 
    var_exp_p, 
    net_flow_p, 
    end_bal_p, 
    expenses_by_cat_p 
  } = cashFlowData;

  // Build row definitions dynamically based on categories
  const cf_row_definitions: CashFlowRowDefinition[] = [
    { id: 'initial_balance', label: 'Saldo Inicial', isBold: true, dataKey: 'initial_balance' },
    { id: 'income_total', label: 'Ingreso Total Neto', isBold: true, dataKey: 'income_p' },
  ];

  // Add Fixed Expense Categories
  cf_row_definitions.push({ id: 'fixed_header', label: 'Gastos Fijos', isBold: true, isSubHeader: true, dataKey: 'fixed_exp_p' /* Placeholder datakey for styling */ });
  Object.values(expense_categories)
    .filter(cat => cat.type === 'Fijo')
    .sort((a,b) => a.name.localeCompare(b.name))
    .forEach(cat => {
      cf_row_definitions.push({ 
        id: `cat_${cat.id}`, 
        label: cat.name, 
        isCategory: true, 
        categoryId: cat.id, 
        dataKey: 'fixed_exp_p', /* Placeholder, actual data from expenses_by_cat_p */
        indent: true 
      });
    });
  cf_row_definitions.push({ id: 'total_fixed_expenses', label: 'Total Gastos Fijos', isBold: true, dataKey: 'fixed_exp_p' });

  // Add Variable Expense Categories
  cf_row_definitions.push({ id: 'variable_header', label: 'Gastos Variables', isBold: true, isSubHeader: true, dataKey: 'var_exp_p' /* Placeholder */ });
  Object.values(expense_categories)
    .filter(cat => cat.type === 'Variable')
    .sort((a,b) => a.name.localeCompare(b.name))
    .forEach(cat => {
      cf_row_definitions.push({ 
        id: `cat_${cat.id}`, 
        label: cat.name, 
        isCategory: true, 
        categoryId: cat.id, 
        dataKey: 'var_exp_p', /* Placeholder */
        indent: true 
      });
    });
  cf_row_definitions.push({ id: 'total_variable_expenses', label: 'Total Gastos Variables', isBold: true, dataKey: 'var_exp_p' });
  
  // Total Expenses (Calculated for display)
  cf_row_definitions.push({ id: 'total_expenses', label: 'Total Gastos (Fijos + Variables)', isBold: true, dataKey: 'total_expenses'});


  cf_row_definitions.push({ id: 'net_flow', label: 'Flujo Neto del Período', isBold: true, dataKey: 'net_flow_p' });
  cf_row_definitions.push({ id: 'final_balance', label: 'Saldo Final Estimado', isBold: true, dataKey: 'end_bal_p' });


  const formatHeaderDate = (date: Date): string => {
    if (analysisPeriodicity === 'mensual') {
      return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    } else if (analysisPeriodicity === 'semanal') {
      // For weekly, show "Semana X (DD/MM)"
      const weekNum = getWeekNumber(date); // Ensure getWeekNumber can handle UTC date
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      return `Sem ${weekNum} (${day}/${month})`;
    }
    // Daily - just date
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' });
  };
  
  const getRowBgClass = (index: number, definition: CashFlowRowDefinition): string => {
    if (definition.isSubHeader || 
        definition.id === 'initial_balance' || 
        definition.id === 'income_total' ||
        definition.id === 'total_fixed_expenses' ||
        definition.id === 'total_variable_expenses' ||
        definition.id === 'total_expenses' ||
        definition.id === 'net_flow' ||
        definition.id === 'final_balance'
        ) {
      return 'bg-body-header-row-bg'; // From globals.css (mapped to var)
    }
    return index % 2 === 0 ? 'bg-white' : 'bg-alt-row-bg'; // Alternating rows
  };

  const getCellData = (definition: CashFlowRowDefinition, periodIndex: number): number => {
    if (definition.id === 'initial_balance') {
      return periodIndex === 0 ? settings.initial_balance : end_bal_p[periodIndex - 1];
    }
    if (definition.isCategory && definition.categoryId) {
      return expenses_by_cat_p[definition.categoryId]?.[periodIndex] || 0;
    }
    if (definition.id === 'total_expenses') {
        return (fixed_exp_p[periodIndex] || 0) + (var_exp_p[periodIndex] || 0);
    }
    // For other dataKey types that are arrays (income_p, fixed_exp_p, etc.)
    const dataArray = cashFlowData[definition.dataKey as keyof CashFlowData] as number[] | undefined;
    return dataArray?.[periodIndex] || 0;
  };
  
  const getTextAlignClass = (definition: CashFlowRowDefinition): string => {
    return definition.id === 'initial_balance' || definition.id === 'final_balance' || definition.id === 'net_flow' ? 'text-right' : 'text-right';
  }

  const getTextColorClass = (value: number, definitionId: string): string => {
    if (definitionId === 'net_flow' || definitionId === 'final_balance' || definitionId === 'initial_balance') {
        if (value < 0) return 'text-text-red'; // Mapped in globals.css
        // if (value > 0) return 'text-text-green'; // Optionally for positive values
    }
    return '';
  }


  return (
    <div className="table-responsive mt-4 overflow-x-auto shadow-lg rounded-md">
      <table id="cashflow-table" className="min-w-full w-full border-collapse text-xs">
        <thead className="bg-header-bg sticky top-0 z-20">
          <tr>
            <th className="sticky left-0 z-10 bg-header-bg py-2 px-3 text-left font-semibold text-primary border-b border-r border-border-color">
              Categoría / Concepto
            </th>
            {periodDates.map((date, index) => (
              <th key={index} className="py-2 px-3 text-center font-semibold text-primary border-b border-r border-border-color whitespace-nowrap">
                {formatHeaderDate(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cf_row_definitions.map((def, rowIndex) => (
            <tr key={def.id} className={`${getRowBgClass(rowIndex, def)} hover:bg-row-hover-bg`}>
              <td className={`sticky left-0 z-10 py-2 px-3 border-b border-r border-border-color whitespace-nowrap ${getRowBgClass(rowIndex, def)} ${def.isBold ? 'font-bold' : ''} ${def.indent ? 'pl-6' : ''}`}>
                {def.label}
              </td>
              {periodDates.map((_, periodIndex) => {
                const cellValue = getCellData(def, periodIndex);
                return (
                  <td 
                    key={`${def.id}-${periodIndex}`} 
                    className={`py-2 px-3 border-b border-r border-border-color whitespace-nowrap ${getTextAlignClass(def)} ${getTextColorClass(cellValue, def.id)} ${def.isBold ? 'font-semibold' : ''}`}
                  >
                    {formatDynamicCurrency(cellValue, displaySymbol)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CashFlowTable;
