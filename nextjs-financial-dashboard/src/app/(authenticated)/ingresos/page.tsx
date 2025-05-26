"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useData, Income } from '@/utils/DataContext';
import IncomeForm from '@/components/IncomeForm';
import IncomesTable from '@/components/IncomesTable';
import { sanitizeFirebaseKey } from '@/utils/validationUtils'; // For deleting by original name if ID is sanitized name

const IngresosPage: React.FC = () => {
  const { currentBackupData, setCurrentBackupData, isDataLoaded } = useData();
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize incomes array for stability if currentBackupData.incomes is large
  const incomesArray: Income[] = useMemo(() => {
    return currentBackupData?.incomes ? Object.values(currentBackupData.incomes) : [];
  }, [currentBackupData?.incomes]);


  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
  };

  const handleFormSubmit = () => {
    setEditingIncome(null); // Reset editing state after form submission
    // Table will re-render due to DataContext update
  };

  const handleDeleteIncome = (incomeIdToDelete: string) => {
    if (!currentBackupData || !currentBackupData.incomes) return;

    const incomeToDelete = currentBackupData.incomes[incomeIdToDelete];
    if (!incomeToDelete) {
        alert(`Error: No se encontró el ingreso con ID: ${incomeIdToDelete}`);
        return;
    }

    if (window.confirm(`¿Está seguro de que desea eliminar el ingreso "${incomeToDelete.name}"?`)) {
      setCurrentBackupData(prevData => {
        if (!prevData || !prevData.incomes) return prevData;
        
        const updatedIncomes = { ...prevData.incomes };
        delete updatedIncomes[incomeIdToDelete]; // Delete by ID (which should be the sanitized name or original key)
        
        return { ...prevData, incomes: updatedIncomes };
      });
      if (editingIncome?.id === incomeIdToDelete) {
        setEditingIncome(null); // Clear form if the deleted item was being edited
      }
    }
  };
  
  if (!isDataLoaded) {
    // This should ideally be handled by the AuthenticatedLayout showing DataVersionSelector
    return <div className="p-4 text-center text-lg">Cargando datos de ingresos...</div>;
  }
  
  if (!currentBackupData) {
    return <div className="p-4 text-center text-lg">No hay datos de respaldo cargados. Por favor, seleccione una versión.</div>;
  }


  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Gestión de Ingresos</h1>
      
      <div className="form-and-table-layout grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IncomeForm
            editingIncome={editingIncome}
            onFormSubmit={handleFormSubmit}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        
        <div className="lg:col-span-2 table-container-dynamic bg-white p-4 rounded-lg shadow">
           <h2 className="text-xl font-semibold text-gray-700 mb-3">Listado de Ingresos</h2>
          <input
            type="text"
            id="search-income-input"
            placeholder="Buscar ingreso por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
          <IncomesTable
            incomes={incomesArray}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  );
};

export default IngresosPage;
