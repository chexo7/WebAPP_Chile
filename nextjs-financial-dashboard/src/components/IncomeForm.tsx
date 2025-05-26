"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useData, Income } from '@/utils/DataContext';
import { getISODateString } from '@/utils/dateUtils';
import { sanitizeFirebaseKey, isFirebaseKeySafe } from '@/utils/validationUtils';
import { formatDynamicCurrency } from '@/utils/formatters';

interface IncomeFormProps {
  editingIncome: Income | null;
  onFormSubmit: () => void; // To reset editing state or trigger table refresh
  onCancelEdit: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ editingIncome, onFormSubmit, onCancelEdit }) => {
  const { currentBackupData, setCurrentBackupData } = useData();
  const defaultStartDate = currentBackupData?.settings?.analysis_start_date || getISODateString(new Date());

  const initialFormState: Omit<Income, 'id'> & { id?: string } = {
    name: '',
    amount: 0,
    frequency: 'Mensual',
    startDate: defaultStartDate,
    endDate: '',
    isOngoing: true,
    isReimbursement: false,
    reimbursementCategory: '',
  };

  const [formData, setFormData] = useState<Omit<Income, 'id'> & { id?: string }>(initialFormState);
  const [showReimbursementCategory, setShowReimbursementCategory] = useState(false);
  const [endDateDisabled, setEndDateDisabled] = useState(true); // Controlled by isOngoing
  const [ongoingDisabled, setOngoingDisabled] = useState(false); // Controlled by frequency

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        ...editingIncome,
        startDate: getISODateString(editingIncome.startDate) || defaultStartDate,
        endDate: getISODateString(editingIncome.endDate) || '',
      });
      setShowReimbursementCategory(editingIncome.isReimbursement || false);
      setEndDateDisabled(!editingIncome.isOngoing);
      setOngoingDisabled(editingIncome.frequency === 'Único');
    } else {
      setFormData({...initialFormState, startDate: defaultStartDate});
      setShowReimbursementCategory(false);
      setEndDateDisabled(true);
      setOngoingDisabled(false);
    }
  }, [editingIncome, defaultStartDate]);

  useEffect(() => {
    // Logic for frequency and ongoing status
    if (formData.frequency === 'Único') {
      setFormData(prev => ({ ...prev, isOngoing: false, endDate: '' }));
      setOngoingDisabled(true);
      setEndDateDisabled(false); // Can set end date for "Único" if not ongoing (though typically it's the start date)
    } else {
      setOngoingDisabled(false);
      setEndDateDisabled(!formData.isOngoing); // End date disabled if ongoing
    }
  }, [formData.frequency, formData.isOngoing]);

  useEffect(() => {
    setShowReimbursementCategory(formData.isReimbursement || false);
  }, [formData.isReimbursement]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (name === 'isOngoing') {
        setEndDateDisabled(checked);
        if (checked) setFormData(prev => ({ ...prev, endDate: '' })); // Clear end date if ongoing
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentBackupData) {
      alert("Error: No hay datos cargados.");
      return;
    }
    if (!isFirebaseKeySafe(formData.name)) {
        alert("El nombre del ingreso contiene caracteres inválidos ('.', '#', '$', '[', ']'). Por favor, corríjalo.");
        return;
    }
    if (formData.isReimbursement && !formData.reimbursementCategory) {
        alert("Por favor, seleccione una categoría de gasto a reembolsar.");
        return;
    }
    if (formData.frequency !== "Único" && formData.isOngoing === false && !formData.endDate) {
        alert("Por favor, ingrese una fecha de término si el ingreso no es indefinido y no es único.");
        return;
    }
     if (formData.frequency === "Único") {
        formData.endDate = formData.startDate; // For "Único", endDate is same as startDate
        formData.isOngoing = false;
    }


    const incomeId = editingIncome?.id || sanitizeFirebaseKey(formData.name);

    const newIncome: Income = {
      ...formData,
      id: incomeId,
      amount: Number(formData.amount) || 0, // Ensure amount is a number
      startDate: getISODateString(formData.startDate) || '',
      endDate: formData.frequency === 'Único' ? getISODateString(formData.startDate) : (formData.isOngoing ? null : getISODateString(formData.endDate)),
    };

    setCurrentBackupData(prevData => {
      if (!prevData) return null;
      const updatedIncomes = { ...(prevData.incomes || {}), [newIncome.id]: newIncome };
      return { ...prevData, incomes: updatedInicons };
    });

    setFormData(initialFormState); // Reset form
    onFormSubmit(); // Call callback
  };

  const expenseCategories = currentBackupData?.expense_categories || {};

  return (
    <div className="form-container p-4 border border-gray-300 rounded-md bg-white shadow">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        {editingIncome ? 'Editar Ingreso' : 'Agregar Nuevo Ingreso'}
      </h3>
      <form onSubmit={handleSubmit} id="income-form" className="space-y-4">
        <div>
          <label htmlFor="income-name" className="block text-sm font-medium text-gray-700">Nombre del Ingreso:</label>
          <input
            type="text"
            id="income-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="income-amount" className="block text-sm font-medium text-gray-700">Monto:</label>
          <input
            type="number"
            id="income-amount"
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
          <label htmlFor="income-frequency-select" className="block text-sm font-medium text-gray-700">Frecuencia:</label>
          <select
            id="income-frequency-select"
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
          <label htmlFor="income-start-date" className="block text-sm font-medium text-gray-700">Fecha Inicio:</label>
          <input
            type="date"
            id="income-start-date"
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
            id="income-ongoing-checkbox"
            name="isOngoing"
            checked={formData.isOngoing || false}
            onChange={handleChange}
            disabled={ongoingDisabled}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
          />
          <label htmlFor="income-ongoing-checkbox" className="text-sm text-gray-700">Ingreso Indefinido (No tiene fecha de término)</label>
        </div>

        <div>
          <label htmlFor="income-end-date" className="block text-sm font-medium text-gray-700">Fecha Término (si aplica):</label>
          <input
            type="date"
            id="income-end-date"
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
            id="income-is-reimbursement"
            name="isReimbursement"
            checked={formData.isReimbursement || false}
            onChange={handleChange}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
          />
          <label htmlFor="income-is-reimbursement" className="text-sm text-gray-700">Es Reembolso de Gasto</label>
        </div>

        {showReimbursementCategory && (
          <div id="income-reimbursement-category-container">
            <label htmlFor="income-reimbursement-category" className="block text-sm font-medium text-gray-700">Categoría de Gasto a Reembolsar:</label>
            <select
              id="income-reimbursement-category"
              name="reimbursementCategory"
              value={formData.reimbursementCategory || ''}
              onChange={handleChange}
              required={formData.isReimbursement}
              className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="">Seleccione una categoría...</option>
              {Object.values(expenseCategories).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex space-x-2">
          <button type="submit" className="button bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
            {editingIncome ? 'Actualizar Ingreso' : 'Agregar Ingreso'}
          </button>
          {editingIncome && (
            <button type="button" onClick={onCancelEdit} className="button bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Cancelar Edición
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
