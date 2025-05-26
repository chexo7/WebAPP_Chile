"use client";

import React from 'react';
import { Income } from '@/utils/DataContext';
import IncomeRow from './IncomeRow';

interface IncomesTableProps {
  incomes: Income[];
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (incomeId: string) => void;
  searchTerm: string;
}

const IncomesTable: React.FC<IncomesTableProps> = ({ incomes, onEditIncome, onDeleteIncome, searchTerm }) => {
  const filteredIncomes = incomes.filter(income =>
    income.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredIncomes.length === 0 && incomes.length > 0) {
    return <p className="text-center text-gray-500 py-4">No se encontraron ingresos con el término de búsqueda.</p>;
  }
  if (incomes.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay ingresos registrados.</p>;
  }

  return (
    <div className="dynamic-table-scroll mt-4 overflow-x-auto">
      <table id="incomes-table-view" className="min-w-full w-full border-collapse text-sm">
        <thead className="bg-header-bg sticky top-0 z-10">
          <tr>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Nombre</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color text-right">Monto</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Frecuencia</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Fecha Inicio</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Fecha Término</th>
            <th className="py-2 px-3 text-left font-semibold text-primary border-b border-border-color">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredIncomes.map(income => (
            <IncomeRow
              key={income.id}
              income={income}
              onEdit={onEditIncome}
              onDelete={onDeleteIncome}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomesTable;
