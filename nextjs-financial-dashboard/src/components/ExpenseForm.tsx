"use client";

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useData, Expense, ExpenseCategory } from '@/utils/DataContext';
import { getISODateString } from '@/utils/dateUtils';
import { sanitizeFirebaseKey, isFirebaseKeySafe } from '@/utils/validationUtils';

interface ExpenseFormProps {
  editingExpense: Expense | null;
  onFormSubmit: () => void;
  onCancelEdit: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ editingExpense, onFormSubmit, onCancelEdit }) => {
  const { currentBackupData, setCurrentBackupData } = useData();
  const defaultStartDate = currentBackupData?.settings?.analysis_start_date || getISODateString(new Date());

  const initialFormState: Omit<Expense, 'id' | 'type'> & { id?: string } = {
    name: '',
    amount: 0,
    category: '',
    frequency: 'Mensual',
    startDate: defaultStartDate,
    endDate: '',
    isOngoing: true,
    isReal: true, // Default to real expense
  };

  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'type'> & { id?: string }>(initialFormState);
  const [endDateDisabled, setEndDateDisabled] = useState(true);
  const [ongoingDisabled, setOngoingDisabled] = useState(false);
  const [isCategoryInUse, setIsCategoryInUse] = useState(false);

  const expenseCategories = currentBackupData?.expense_categories || {};
  const incomes = currentBackupData?.incomes || {};
  const expenses = currentBackupData?.expenses || {};
  
  // Check if selected category is in use
  useEffect(() => {
    if (!formData.category) {
      setIsCategoryInUse(false);
      return;
    }
    // Check in expenses
    const categoryUsedInExpenses = Object.values(expenses).some(exp => exp.category === formData.category);
    if (categoryUsedInExpenses) {
      setIsCategoryInUse(true);
      return;
    }
    // Check in incomes (as reimbursementCategory)
    const categoryUsedInIncomes = Object.values(incomes).some(inc => inc.isReimbursement && inc.reimbursementCategory === formData.category);
    setIsCategoryInUse(categoryUsedInIncomes);

  }, [formData.category, expenses, incomes]);


  useEffect(() => {
    if (editingExpense) {
      setFormData({
        ...editingExpense,
        startDate: getISODateString(editingExpense.startDate) || defaultStartDate,
        endDate: getISODateString(editingExpense.endDate) || '',
      });
      setEndDateDisabled(!editingExpense.isOngoing);
      setOngoingDisabled(editingExpense.frequency === 'Único');
    } else {
      setFormData({...initialFormState, startDate: defaultStartDate});
      setEndDateDisabled(true);
      setOngoingDisabled(false);
    }
  }, [editingExpense, defaultStartDate]);

  useEffect(() => {
    if (formData.frequency === 'Único') {
      setFormData(prev => ({ ...prev, isOngoing: false, endDate: '' }));
      setOngoingDisabled(true);
      setEndDateDisabled(false); 
    } else {
      setOngoingDisabled(false);
      setEndDateDisabled(!formData.isOngoing);
    }
  }, [formData.frequency, formData.isOngoing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === 'isOngoing') {
        setEndDateDisabled(checked);
        if (checked) setFormData(prev => ({ ...prev, endDate: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleAddCategory = () => {
    const categoryName = prompt("Ingrese el nombre de la nueva categoría:");
    if (!categoryName) return;

    if (!isFirebaseKeySafe(categoryName)) {
      alert("El nombre de la categoría contiene caracteres inválidos ('.', '#', '$', '[', ']').");
      return;
    }
    const categoryId = sanitizeFirebaseKey(categoryName);
    if (expenseCategories[categoryId]) {
      alert("Ya existe una categoría con este nombre (o un nombre similar sanitizado).");
      return;
    }

    let categoryTypeInput = prompt("Ingrese el tipo de categoría ('Fijo' o 'Variable'):");
    if (!categoryTypeInput || (categoryTypeInput.toLowerCase() !== 'fijo' && categoryTypeInput.toLowerCase() !== 'variable')) {
        alert("Tipo de categoría inválido. Debe ser 'Fijo' o 'Variable'.");
        return;
    }
    const categoryType = categoryTypeInput.charAt(0).toUpperCase() + categoryTypeInput.slice(1).toLowerCase() as 'Fijo' | 'Variable';


    setCurrentBackupData(prevData => {
      if (!prevData) return null;
      const newCategory: ExpenseCategory = { id: categoryId, name: categoryName, type: categoryType };
      const updatedCategories = { ...(prevData.expense_categories || {}), [categoryId]: newCategory };
      const updatedBudgets = { ...(prevData.budgets || {}), [categoryId]: 0 }; // Initialize budget
      return { ...prevData, expense_categories: updatedCategories, budgets: updatedBudgets };
    });
    setFormData(prev => ({ ...prev, category: categoryId })); // Select new category
  };

  const handleRemoveCategory = () => {
    if (!formData.category) {
      alert("Por favor, seleccione una categoría para eliminar.");
      return;
    }
    if (isCategoryInUse) {
        alert("No se puede eliminar la categoría porque está siendo utilizada en gastos o como categoría de reembolso en ingresos.");
        return;
    }

    if (window.confirm(`¿Está seguro de que desea eliminar la categoría "${expenseCategories[formData.category]?.name}"?`)) {
      setCurrentBackupData(prevData => {
        if (!prevData) return null;
        const updatedCategories = { ...(prevData.expense_categories || {}) };
        delete updatedCategories[formData.category];
        const updatedBudgets = { ...(prevData.budgets || {}) };
        delete updatedBudgets[formData.category];
        return { ...prevData, expense_categories: updatedCategories, budgets: updatedBudgets };
      });
      setFormData(prev => ({ ...prev, category: '' })); // Clear selection
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentBackupData) {
      alert("Error: No hay datos cargados.");
      return;
    }
    if (!formData.name.trim() || !formData.category) {
      alert("Por favor, complete el nombre y seleccione una categoría para el gasto.");
      return;
    }
    if (!isFirebaseKeySafe(formData.name)) {
        alert("El nombre del gasto contiene caracteres inválidos ('.', '#', '$', '[', ']'). Por favor, corríjalo.");
        return;
    }
    if (formData.frequency !== "Único" && formData.isOngoing === false && !formData.endDate) {
        alert("Por favor, ingrese una fecha de término si el gasto no es indefinido y no es único.");
        return;
    }
    if (formData.frequency === "Único") {
        formData.endDate = formData.startDate; // For "Único", endDate is same as startDate
        formData.isOngoing = false;
    }


    const expenseId = editingExpense?.id || sanitizeFirebaseKey(formData.name);
    const categoryType = expenseCategories[formData.category]?.type || 'Variable'; // Default if somehow missing

    const newExpense: Expense = {
      ...formData,
      id: expenseId,
      type: categoryType,
      amount: Number(formData.amount) || 0,
      startDate: getISODateString(formData.startDate) || '',
      endDate: formData.frequency === 'Único' ? getISODateString(formData.startDate) : (formData.isOngoing ? null : getISODateString(formData.endDate)),
    };

    setCurrentBackupData(prevData => {
      if (!prevData) return null;
      const updatedExpenses = { ...(prevData.expenses || {}), [newExpense.id]: newExpense };
      return { ...prevData, expenses: updatedExpenses };
    });

    setFormData(initialFormState);
    onFormSubmit();
  };

  return (
    <div className="form-container p-4 border border-gray-300 rounded-md bg-white shadow">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        {editingExpense ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
      </h3>
      <form onSubmit={handleSubmit} id="expense-form" className="space-y-4">
        <div>
          <label htmlFor="expense-name" className="block text-sm font-medium text-gray-700">Nombre del Gasto:</label>
          <input
            type="text"
            id="expense-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700">Monto:</label>
          <input
            type="number"
            id="expense-amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="any"
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
            <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700">Categoría:</label>
            <div className="category-input-group mt-1 flex items-center space-x-2">
                <select
                    id="expense-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="flex-grow p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                    <option value="">Seleccione una categoría...</option>
                    {Object.values(expenseCategories).sort((a,b) => a.name.localeCompare(b.name)).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
                    ))}
                </select>
                <button type="button" id="add-category-button" onClick={handleAddCategory} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm leading-tight w-10 h-10 flex items-center justify-center">+</button>
                <button type="button" id="remove-category-button" onClick={handleRemoveCategory} disabled={!formData.category || isCategoryInUse} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm leading-tight w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">-</button>
            </div>
            {isCategoryInUse && <p className="text-xs text-red-500 mt-1">Esta categoría está en uso y no puede ser eliminada.</p>}
        </div>


        <div>
          <label htmlFor="expense-frequency-select" className="block text-sm font-medium text-gray-700">Frecuencia:</label>
          <select
            id="expense-frequency-select"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            <option value="Mensual">Mensual</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Semanal">Semanal</option>
            <option value="Anual">Anual</option>
            <option value="Único">Único</option>
          </select>
        </div>

        <div>
          <label htmlFor="expense-start-date" className="block text-sm font-medium text-gray-700">Fecha Inicio:</label>
          <input
            type="date"
            id="expense-start-date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="checkbox-container flex items-center">
          <input
            type="checkbox"
            id="expense-ongoing-checkbox"
            name="isOngoing"
            checked={formData.isOngoing || false}
            onChange={handleChange}
            disabled={ongoingDisabled}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
          />
          <label htmlFor="expense-ongoing-checkbox" className="text-sm text-gray-700">Gasto Indefinido (No tiene fecha de término)</label>
        </div>

        <div>
          <label htmlFor="expense-end-date" className="block text-sm font-medium text-gray-700">Fecha Término (si aplica):</label>
          <input
            type="date"
            id="expense-end-date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleChange}
            disabled={endDateDisabled}
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div className="checkbox-container flex items-center">
          <input
            type="checkbox"
            id="expense-is-real"
            name="isReal"
            checked={formData.isReal || false}
            onChange={handleChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
          />
          <label htmlFor="expense-is-real" className="text-sm text-gray-700">Es un Gasto Real (no una proyección)</label>
        </div>

        <div className="flex space-x-2">
          <button type="submit" className="button bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
            {editingExpense ? 'Actualizar Gasto' : 'Agregar Gasto'}
          </button>
          {editingExpense && (
            <button type="button" onClick={onCancelEdit} className="button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Cancelar Edición
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
