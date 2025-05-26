"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useData } from '@/utils/DataContext';
import { formatDynamicCurrency } from '@/utils/formatters';

interface BudgetFormProps {
  selectedCategoryForForm: string | null; // Category ID
  onBudgetUpdate: () => void; // To potentially trigger re-renders or clear selections
}

const BudgetForm: React.FC<BudgetFormProps> = ({ selectedCategoryForForm, onBudgetUpdate }) => {
  const { currentBackupData, setCurrentBackupData } = useData();
  const { expense_categories = {}, budgets = {}, settings } = currentBackupData || {};
  
  const displaySymbol = settings?.display_currency_symbol || '$';

  const [categoryId, setCategoryId] = useState<string>('');
  const [budgetAmount, setBudgetAmount] = useState<number | string>(''); // Allow string for input flexibility

  useEffect(() => {
    if (selectedCategoryForForm) {
      setCategoryId(selectedCategoryForForm);
      setBudgetAmount(budgets?.[selectedCategoryForForm]?.toString() || '0');
    } else {
      // Optionally reset or set to a default category if none is selected
      const firstCategoryId = Object.keys(expense_categories)[0];
      if (firstCategoryId) {
          setCategoryId(firstCategoryId);
          setBudgetAmount(budgets?.[firstCategoryId]?.toString() || '0');
      } else {
          setCategoryId('');
          setBudgetAmount('');
      }
    }
  }, [selectedCategoryForForm, budgets, expense_categories]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value;
    setCategoryId(newCategoryId);
    setBudgetAmount(budgets?.[newCategoryId]?.toString() || '0');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudgetAmount(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert("Por favor, seleccione una categoría.");
      return;
    }
    const amount = parseFloat(budgetAmount as string);
    if (isNaN(amount) || amount < 0) {
      alert("Por favor, ingrese un monto de presupuesto válido (número positivo).");
      return;
    }

    setCurrentBackupData(prevData => {
      if (!prevData) return null;
      const updatedBudgets = {
        ...(prevData.budgets || {}),
        [categoryId]: amount,
      };
      return { ...prevData, budgets: updatedBudgets };
    });

    alert(`Presupuesto para "${expense_categories[categoryId]?.name}" actualizado a ${formatDynamicCurrency(amount, displaySymbol)}.`);
    onBudgetUpdate(); // Notify parent
  };

  return (
    <div className="form-container p-4 border border-gray-300 rounded-md bg-white shadow">
      <h3 className="text-lg font-semibold mb-4 text-primary">Definir Presupuesto</h3>
      <form onSubmit={handleSubmit} id="budget-form" className="space-y-4">
        <div>
          <label htmlFor="budget-category-select" className="block text-sm font-medium text-gray-700">
            Categoría de Gasto:
          </label>
          <select
            id="budget-category-select"
            value={categoryId}
            onChange={handleCategoryChange}
            required
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          >
            <option value="">-- Seleccione una Categoría --</option>
            {Object.values(expense_categories)
                .sort((a,b) => a.name.localeCompare(b.name))
                .map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget-amount-input" className="block text-sm font-medium text-gray-700">
            Monto Presupuestado ({displaySymbol}):
          </label>
          <input
            type="number"
            id="budget-amount-input"
            value={budgetAmount}
            onChange={handleAmountChange}
            required
            min="0"
            step="any"
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Ingrese el monto"
          />
        </div>
        <button
          type="submit"
          id="set-budget-button"
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Establecer Presupuesto
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
