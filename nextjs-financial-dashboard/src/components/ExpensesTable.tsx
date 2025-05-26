"use client";

import React from 'react';
import { Expense } from '@/utils/DataContext';
import ExpenseRow from './ExpenseRow';

interface ExpensesTableProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  searchTerm: string;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, onEditExpense, onDeleteExpense, searchTerm }) => {
  const filteredExpenses = expenses.filter(expense =>
    expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (expense.category && expense.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filteredExpenses.length === 0 && expenses.length > 0) {
    return <p className="text-center text-gray-500 py-4">No se encontraron gastos con el término de búsqueda.</p>;
  }
  if (expenses.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay gastos registrados.</p>;
  }

  return (
    <div className="dynamic-table-scroll mt-4 overflow-x-auto">
      <table id="expenses-table-view" className="min-w-full w-full border-collapse text-sm">
        <thead className="bg-header-bg sticky top-0 z-10">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Nombre</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color text-right">Monto</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Categoría (Tipo)</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Frecuencia</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Fecha Inicio</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Fecha Término</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">¿Real?</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map(expense => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onEdit={onEditExpense}
              onDelete={onDeleteExpense}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
