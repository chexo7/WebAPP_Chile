"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useData, Expense } from '@/utils/DataContext';
import ExpenseForm from '@/components/ExpenseForm';
import ExpensesTable from '@/components/ExpensesTable';

const GastosPage: React.FC = () => {
  const { currentBackupData, setCurrentBackupData, isDataLoaded } = useData();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const expensesArray: Expense[] = useMemo(() => {
    return currentBackupData?.expenses ? Object.values(currentBackupData.expenses) : [];
  }, [currentBackupData?.expenses]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleFormSubmit = () => {
    setEditingExpense(null); 
  };

  const handleDeleteExpense = (expenseIdToDelete: string) => {
    if (!currentBackupData || !currentBackupData.expenses) return;

    const expenseToDelete = currentBackupData.expenses[expenseIdToDelete];
    if (!expenseToDelete) {
        alert(`Error: No se encontró el gasto con ID: ${expenseIdToDelete}`);
        return;
    }

    if (window.confirm(`¿Está seguro de que desea eliminar el gasto "${expenseToDelete.name}"?`)) {
      setCurrentBackupData(prevData => {
        if (!prevData || !prevData.expenses) return prevData;
        
        const updatedExpenses = { ...prevData.expenses };
        delete updatedExpenses[expenseIdToDelete];
        
        return { ...prevData, expenses: updatedExpenses };
      });
      if (editingExpense?.id === expenseIdToDelete) {
        setEditingExpense(null); 
      }
    }
  };
  
  if (!isDataLoaded) {
    return <div className="p-4 text-center text-lg">Cargando datos de gastos...</div>;
  }
  
  if (!currentBackupData) {
    return <div className="p-4 text-center text-lg">No hay datos de respaldo cargados. Por favor, seleccione una versión.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Gestión de Gastos</h1>
      
      <div className="form-and-table-layout grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpenseForm
            editingExpense={editingExpense}
            onFormSubmit={handleFormSubmit}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        
        <div className="lg:col-span-2 table-container-dynamic bg-white p-4 rounded-lg shadow">
           <h2 className="text-xl font-semibold text-gray-700 mb-3">Listado de Gastos</h2>
          <input
            type="text"
            id="search-expense-input"
            placeholder="Buscar gasto por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
          <ExpensesTable
            expenses={expensesArray}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  );
};

export default GastosPage;
