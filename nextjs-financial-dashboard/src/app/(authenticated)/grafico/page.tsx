"use client";

import React, { useMemo } from 'react';
import { useData } from '@/utils/DataContext';
import { calculateCashFlowData, CashFlowData } from '@/utils/calculationUtils';
import CashFlowChart from '@/components/CashFlowChart'; // Ensure this path is correct

// If issues with SSR for Chart.js, uncomment this:
// import dynamic from 'next/dynamic';
// const CashFlowChart = dynamic(() => import('@/components/CashFlowChart'), { 
//   ssr: false,
//   loading: () => <p className="text-center text-lg p-10">Cargando gráfico...</p> 
// });


const GraficoPage: React.FC = () => {
  const { currentBackupData, isDataLoaded } = useData();
  const { settings, incomes, expenses, expense_categories } = currentBackupData || {};

  // Memoize the cash flow calculation, same as in FlujoCajaPage
  const cashFlowData: CashFlowData | null = useMemo(() => {
    if (!isDataLoaded || !settings || !incomes || !expenses || !expense_categories) {
      return null;
    }
    return calculateCashFlowData(settings, incomes, expenses, expense_categories);
  }, [isDataLoaded, settings, incomes, expenses, expense_categories]);

  const getChartTitle = (): string => {
    if (!settings) return "Gráfico de Flujo de Caja";
    const periodicity = settings.analysis_periodicity === 'mensual' ? 'Mensual' 
                      : settings.analysis_periodicity === 'semanal' ? 'Semanal' 
                      : 'Diario';
    return `Gráfico de Flujo de Caja (${periodicity})`;
  };
  
  if (!isDataLoaded) {
    return <div className="p-4 text-center text-lg">Cargando datos para el gráfico...</div>;
  }

  if (!settings || !incomes || !expenses || !expense_categories) {
    return (
      <div className="p-4 text-center text-lg">
        Faltan datos necesarios para generar el gráfico. 
        Asegúrese de que los ajustes, ingresos, gastos y categorías de gastos estén cargados y configurados.
        Verifique la pestaña de <a href="/dashboard/ajustes" className="text-primary hover:underline">Ajustes</a>.
      </div>
    );
  }
  
  if (!cashFlowData) {
    return <div id="chart-message" className="p-4 text-center text-lg">No hay datos disponibles para graficar o ocurrió un error en el cálculo. Verifique la configuración y los datos.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary text-center">
        {getChartTitle()}
      </h1>
      
      <CashFlowChart 
        cashFlowData={cashFlowData} 
        analysisPeriodicity={settings.analysis_periodicity} 
      />
    </div>
  );
};

export default GraficoPage;
