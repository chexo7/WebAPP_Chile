"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useData } from '@/utils/DataContext';
import { getISODateString } from '@/utils/dateUtils';
import { fetchUSDToCLPRate } from '@/utils/apiUtils'; // Assuming this path

interface SettingsData {
  analysis_periodicity: 'mensual' | 'semanal' | 'diario';
  analysis_duration: number;
  analysis_start_date: string; // ISO format YYYY-MM-DD
  initial_balance: number;
  display_currency_symbol: string;
  exchangeRateCLPToUSD?: number | null; // Store the fetched rate
}

const AjustesPage: React.FC = () => {
  const { currentBackupData, setCurrentBackupData, setDataAsLoaded, isDataLoaded } = useData();

  // Local form state
  const [settings, setSettings] = useState<SettingsData>({
    analysis_periodicity: 'mensual',
    analysis_duration: 12,
    analysis_start_date: getISODateString(new Date()),
    initial_balance: 0,
    display_currency_symbol: '$',
    exchangeRateCLPToUSD: null,
  });

  const [durationLabel, setDurationLabel] = useState<string>('Meses');
  const [usdClpRateInfo, setUsdClpRateInfo] = useState<string>('Cargando tasa USD/CLP...');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Populate form when currentBackupData changes (e.g., after loading a backup)
  useEffect(() => {
    if (currentBackupData?.settings) {
      const s = currentBackupData.settings;
      setSettings({
        analysis_periodicity: s.analysis_periodicity || 'mensual',
        analysis_duration: s.analysis_duration || 12,
        analysis_start_date: getISODateString(s.analysis_start_date) || getISODateString(new Date()),
        initial_balance: s.initial_balance || 0,
        display_currency_symbol: s.display_currency_symbol || '$',
        exchangeRateCLPToUSD: s.exchangeRateCLPToUSD || null,
      });
    }
  }, [currentBackupData]);

  // Update duration label based on periodicity
  useEffect(() => {
    switch (settings.analysis_periodicity) {
      case 'mensual':
        setDurationLabel('Meses');
        break;
      case 'semanal':
        setDurationLabel('Semanas');
        break;
      case 'diario':
        setDurationLabel('Días');
        break;
      default:
        setDurationLabel('Meses');
    }
  }, [settings.analysis_periodicity]);

  // Fetch USD/CLP rate on component mount
  const fetchRate = useCallback(async () => {
    setUsdClpRateInfo('Cargando tasa USD/CLP...');
    const rate = await fetchUSDToCLPRate();
    if (rate !== null) {
      setUsdClpRateInfo(`Tasa USD/CLP actual: ${rate.toFixed(2)} (obtenida de CoinGecko)`);
      // Update settings in context if it's different or not set
      setSettings(prev => ({...prev, exchangeRateCLPToUSD: rate }));
      if (currentBackupData) {
          setCurrentBackupData({
              ...currentBackupData,
              settings: {
                  ...currentBackupData.settings,
                  exchangeRateCLPToUSD: rate,
              }
          });
      }
    } else {
      setUsdClpRateInfo('Error al cargar la tasa USD/CLP. Se usará la última tasa guardada si existe, o un valor por defecto.');
      // Keep existing rate in settings if fetch fails, or use default if none
      if (currentBackupData?.settings?.exchangeRateCLPToUSD) {
        setSettings(prev => ({...prev, exchangeRateCLPToUSD: currentBackupData.settings.exchangeRateCLPToUSD as number}));
      } else {
         setSettings(prev => ({...prev, exchangeRateCLPToUSD: 900})); // Default fallback
      }
    }
  }, [currentBackupData, setCurrentBackupData]); // Added dependencies

  useEffect(() => {
    if (isDataLoaded) { // Only fetch if data context considers data loaded
        fetchRate();
    }
  }, [isDataLoaded, fetchRate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        // Handle cases where parseFloat results in NaN, e.g., for empty string or invalid number
        // Keep it as an empty string for the input field, or a default numeric value for the state
        processedValue = value === '' ? '' : 0; // Or some other default/validation
      }
    }
    
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [name]: processedValue };
      // Default duration logic from original app
      if (name === 'analysis_periodicity') {
        switch (value) {
          case 'mensual': newSettings.analysis_duration = 12; break;
          case 'semanal': newSettings.analysis_duration = 52; break;
          case 'diario': newSettings.analysis_duration = 365; break;
        }
      }
      return newSettings;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!currentBackupData) {
      setFeedbackMessage('Error: No hay datos cargados para aplicar ajustes.');
      return;
    }

    // Ensure numeric fields are numbers, not strings from input
    const finalSettings = {
        ...settings,
        analysis_duration: Number(settings.analysis_duration) || 0,
        initial_balance: Number(settings.initial_balance) || 0,
    };

    setCurrentBackupData({
      ...currentBackupData,
      settings: finalSettings,
      // Potentially add a flag or timestamp for "last_recalculated" if needed
    });
    
    // If this is the first time settings are applied, mark data as loaded
    // This might be redundant if DataVersionSelector already does this.
    if(!isDataLoaded) setDataAsLoaded(); 


    setFeedbackMessage('Ajustes aplicados y datos actualizados. El flujo de caja y gráficos se recalcularán.');
    setTimeout(() => setFeedbackMessage(''), 3000);
  };
  
  if (!isDataLoaded && !currentBackupData) {
    // This case should be handled by AuthenticatedLayout showing DataVersionSelector
    // But as a fallback or if directly navigated here:
    return (
        <div className="p-4 text-center">
            <p className="text-lg text-gray-600">Por favor, cargue una versión de datos primero desde el selector.</p>
        </div>
    );
  }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Ajustes de la Aplicación</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md settings-form-container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="analysis-periodicity-select" className="block text-sm font-medium text-gray-700">
              Periodicidad del Análisis
            </label>
            <select
              id="analysis-periodicity-select"
              name="analysis_periodicity"
              value={settings.analysis_periodicity}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="mensual">Mensual</option>
              <option value="semanal">Semanal</option>
              <option value="diario">Diario</option>
            </select>
          </div>

          <div>
            <label htmlFor="analysis-duration-input" id="analysis-duration-label" className="block text-sm font-medium text-gray-700">
              Duración ({durationLabel})
            </label>
            <input
              type="number"
              id="analysis-duration-input"
              name="analysis_duration"
              value={settings.analysis_duration}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="analysis-start-date-input" className="block text-sm font-medium text-gray-700">
              Fecha Inicio Análisis
            </label>
            <input
              type="date"
              id="analysis-start-date-input"
              name="analysis_start_date"
              value={settings.analysis_start_date}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="analysis-initial-balance-input" className="block text-sm font-medium text-gray-700">
              Saldo Inicial ({settings.display_currency_symbol})
            </label>
            <input
              type="number"
              id="analysis-initial-balance-input"
              name="initial_balance"
              value={settings.initial_balance}
              onChange={handleChange}
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="display-currency-symbol-input" className="block text-sm font-medium text-gray-700">
              Símbolo Moneda Principal
            </label>
            <input
              type="text"
              id="display-currency-symbol-input"
              name="display_currency_symbol"
              value={settings.display_currency_symbol}
              onChange={handleChange}
              maxLength={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          <div className="informative-rate p-3 bg-blue-50 border-l-4 border-primary text-sm text-blue-700 rounded-md">
            <p id="usd-clp-info-label">{usdClpRateInfo}</p>
            {settings.exchangeRateCLPToUSD && (
                <p className="mt-1">Tasa guardada actualmente: {settings.exchangeRateCLPToUSD.toFixed(2)}</p>
            )}
          </div>

          <button
            type="submit"
            id="apply-settings-button"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Aplicar Ajustes y Recalcular
          </button>

          {feedbackMessage && (
            <p className="mt-3 text-sm text-center p-2 rounded-md"
               style={{ backgroundColor: feedbackMessage.startsWith('Error') ? 'var(--danger-color)' : 'var(--accent-color)', color: 'white' }}>
              {feedbackMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AjustesPage;
