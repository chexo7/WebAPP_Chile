"use client";

import React, { useState } from 'react';
import { useData } from '@/utils/DataContext';
import BudgetForm from '@/components/BudgetForm';
import BudgetsTableView from '@/components/BudgetsTableView';
import BudgetSummaryTable from '@/components/BudgetSummaryTable';

const PresupuestosPage: React.FC = () => {
  const { currentBackupData, isDataLoaded } = useData();
  const [selectedCategoryForForm, setSelectedCategoryForForm] = useState<string | null>(null);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryForForm(categoryId);
  };

  const handleBudgetUpdate = () => {
    // Optionally, clear the selection or perform other actions after a budget is set.
    // setSelectedCategoryForForm(null); // Uncomment to clear form selection after update
  };

  if (!isDataLoaded) {
    return <div className="p-4 text-center text-lg">Cargando datos de presupuestos...</div>;
  }

  if (!currentBackupData) {
    return <div className="p-4 text-center text-lg">No hay datos de respaldo cargados. Por favor, seleccione una versión.</div>;
  }
  
  if (!currentBackupData.expense_categories || Object.keys(currentBackupData.expense_categories).length === 0) {
     return (
        <div className="p-4 text-center text-lg">
            No hay categorías de gastos definidas. 
            Por favor, agregue categorías en la pestaña de <a href="/dashboard/gastos" className="text-primary hover:underline">Gastos</a> primero.
        </div>
    );
  }


  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Gestión de Presupuestos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna para el Formulario de Presupuesto y la Tabla de Presupuestos por Categoría */}
        <div className="lg:col-span-1 space-y-6">
          <BudgetForm 
            selectedCategoryForForm={selectedCategoryForForm}
            onBudgetUpdate={handleBudgetUpdate}
          />
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Presupuestos por Categoría</h2>
            <BudgetsTableView onSelectCategory={handleSelectCategory} />
          </div>
        </div>

        {/* Columna para la Tabla de Resumen del Presupuesto */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <BudgetSummaryTable />
        </div>
      </div>
    </div>
  );
};

export default PresupuestosPage;
