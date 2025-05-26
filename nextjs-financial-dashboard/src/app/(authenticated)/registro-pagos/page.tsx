"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/utils/DataContext';
import PeriodNavigator from '@/components/PeriodNavigator';
import PaymentsTable from '@/components/PaymentsTable';

const RegistroPagosPage: React.FC = () => {
  const { currentBackupData, isDataLoaded } = useData();
  const { settings } = currentBackupData || {};

  // State for the selected period's start and end dates, and a key part for payments
  const [selectedPeriodStart, setSelectedPeriodStart] = useState<Date | null>(null);
  const [selectedPeriodEnd, setSelectedPeriodEnd] = useState<Date | null>(null);
  const [periodKeyPart, setPeriodKeyPart] = useState<string>(''); // e.g., "W32" or "08"

  const [pageTitle, setPageTitle] = useState<string>('Registro de Pagos');

  // Update page title based on periodicity
  useEffect(() => {
    if (settings?.analysis_periodicity) {
      const periodicityText = settings.analysis_periodicity === 'mensual' ? 'Mensual' 
                            : settings.analysis_periodicity === 'semanal' ? 'Semanal' 
                            : 'Diario'; // Add Diario if supported
      setPageTitle(`Registro de Pagos (${periodicityText})`);
    }
  }, [settings?.analysis_periodicity]);

  // Callback for PeriodNavigator to update the selected period
  const handlePeriodChange = useCallback((startDate: Date, endDate: Date, pKeyPart: string) => {
    setSelectedPeriodStart(startDate);
    setSelectedPeriodEnd(endDate);
    setPeriodKeyPart(pKeyPart);
  }, []);
  
  if (!isDataLoaded) {
    return <div className="p-4 text-center text-lg">Cargando datos...</div>;
  }

  if (!settings || !settings.analysis_start_date) {
    return (
      <div className="p-4 text-center text-lg">
        La configuración de análisis (fecha de inicio, periodicidad) no está disponible. 
        Por favor, configurela en <a href="/dashboard/ajustes" className="text-primary hover:underline">Ajustes</a>.
      </div>
    );
  }


  return (
    <div className="p-4 space-y-6">
      <h1 id="payments-tab-title" className="text-3xl font-bold text-primary">{pageTitle}</h1>
      
      <PeriodNavigator 
        onPeriodChange={handlePeriodChange}
        initialAnalysisStartDate={settings.analysis_start_date}
        analysisPeriodicity={settings.analysis_periodicity}
      />

      {selectedPeriodStart && selectedPeriodEnd && periodKeyPart ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <PaymentsTable 
            selectedPeriodStart={selectedPeriodStart}
            selectedPeriodEnd={selectedPeriodEnd}
            periodKeyPart={periodKeyPart}
            analysisPeriodicity={settings.analysis_periodicity}
          />
        </div>
      ) : (
        <div className="p-4 text-center text-lg text-gray-500">
          Seleccione un período para ver los pagos correspondientes.
        </div>
      )}
    </div>
  );
};

export default RegistroPagosPage;
