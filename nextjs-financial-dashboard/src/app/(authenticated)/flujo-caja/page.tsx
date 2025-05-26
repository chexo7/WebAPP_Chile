"use client";

import React, { useMemo } from 'react';
import { useData } from '@/utils/DataContext';
import { calculateCashFlowData, CashFlowData } from '@/utils/calculationUtils';
import CashFlowTable from '@/components/CashFlowTable'; // Ensure this path is correct

const FlujoCajaPage: React.FC = () => {
  const { currentBackupData, isDataLoaded } = useData();
  const { settings, incomes, expenses, expense_categories } = currentBackupData || {};

  // Memoize the cash flow calculation
  const cashFlowData: CashFlowData | null = useMemo(() => {
    if (!isDataLoaded || !settings || !incomes || !expenses || !expense_categories) {
      return null;
    }
    // Ensure all required data is passed to the calculation function
    return calculateCashFlowData(settings, incomes, expenses, expense_categories);
  }, [isDataLoaded, settings, incomes, expenses, expense_categories]);

  const getCashFlowTitle = (): string => {
    if (!settings) return "Flujo de Caja";
    const periodicity = settings.analysis_periodicity === 'mensual' ? 'Mensual' 
                      : settings.analysis_periodicity === 'semanal' ? 'Semanal' 
                      : 'Diario'; // Add Diario if supported
    return `Proyección de Flujo de Caja (${periodicity})`;
  };
  
  if (!isDataLoaded) {
    return <div className="p-4 text-center text-lg">Cargando datos...</div>;
  }

  if (!settings || !incomes || !expenses || !expense_categories) {
    return (
      <div className="p-4 text-center text-lg">
        Faltan datos necesarios para calcular el flujo de caja. 
        Asegúrese de que los ajustes, ingresos, gastos y categorías de gastos estén cargados y configurados.
        Verifique la pestaña de <a href="/dashboard/ajustes" className="text-primary hover:underline">Ajustes</a>.
      </div>
    );
  }
  
  if (!cashFlowData) {
    return <div className="p-4 text-center text-lg">Error al calcular los datos del flujo de caja. Verifique la consola para más detalles.</div>;
  }

  return (
    <div className="p-4 space-y-6" id="cashflow-container">
      <h1 id="cashflow-title" className="text-3xl font-bold text-primary text-center">
        {getCashFlowTitle()}
      </h1>
      
      <CashFlowTable cashFlowData={cashFlowData} />
    </div>
  );
};

export default FlujoCajaPage;
