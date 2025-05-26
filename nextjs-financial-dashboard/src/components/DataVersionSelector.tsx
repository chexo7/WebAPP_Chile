"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useData } from '@/utils/DataContext';
import { database } from '@/utils/firebase';
import { getUserBackupsRef, getSpecificBackupRef, getUserMainDataRef, getUserChangeLogRef } from '@/utils/firebaseUtils';
import { formatBackupKey } from '@/utils/dateUtils';
import { ref, get, child, listAll } from 'firebase/database';

interface BackupEntry {
  key: string;
  formattedName: string;
}

const DataVersionSelector: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    setCurrentBackupData, 
    setOriginalLoadedData, 
    setCurrentBackupKey, 
    setChangeLogEntries,
    setDataAsLoaded 
  } = useData();

  const [backupKeys, setBackupKeys] = useState<BackupEntry[]>([]);
  const [selectedBackupKey, setSelectedBackupKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const fetchBackups = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Cargando lista de respaldos...');

    const userBackupsRef = getUserBackupsRef(currentUser);
    if (!userBackupsRef) {
      setError("No se pudo obtener la referencia a los respaldos del usuario.");
      setIsLoading(false);
      setLoadingMessage('');
      return;
    }

    try {
      const snapshot = await get(userBackupsRef);
      if (snapshot.exists()) {
        const keys = Object.keys(snapshot.val());
        const formattedKeys: BackupEntry[] = keys
          .map(key => ({ key, formattedName: formatBackupKey(key) }))
          .sort((a, b) => b.key.localeCompare(a.key)); // Sort reverse chronologically
        setBackupKeys(formattedKeys);
        if (formattedKeys.length > 0) {
          setSelectedBackupKey(formattedKeys[0].key); // Select the latest by default
        }
      } else {
        setBackupKeys([]);
        setLoadingMessage('No se encontraron respaldos.');
      }
    } catch (err: any) {
      console.error("Error fetching backup keys:", err);
      setError(`Error al cargar respaldos: ${err.message}`);
      setLoadingMessage('');
    } finally {
      setIsLoading(false);
      if(!error) setLoadingMessage('');
    }
  }, [currentUser, error]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const processLoadedData = (data: any, backupKey: string | null) => {
    // This function replicates the data processing logic from the original app
    // Initialize default fields if missing, parse dates, etc.
    // For now, it's a placeholder.
    const processedData = {
      incomes: data?.incomes || {},
      expenses: data?.expenses || {},
      settings: data?.settings || { exchangeRateCLPToUSD: 900, defaultCurrency: "CLP" }, // Example default settings
      // Add other data structures as needed
    };
    return processedData;
  };
  
  const loadData = async (backupKeyToLoad: string | null, isLatest: boolean = false) => {
    if (!currentUser) {
      setError("Usuario no autenticado.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setLoadingMessage(isLatest ? 'Cargando última versión...' : `Cargando respaldo ${formatBackupKey(backupKeyToLoad || "")}...`);
  
    let dataRef;
    if (isLatest) {
      // Logic to determine the "latest" version (could be main data or newest backup)
      // For now, let's assume "latest" means the main data branch, not a backup.
      dataRef = getUserMainDataRef(currentUser);
      if (!dataRef) {
          setError("No se pudo obtener la referencia a los datos principales del usuario.");
          setIsLoading(false);
          setLoadingMessage('');
          return;
      }
    } else if (backupKeyToLoad) {
      dataRef = getSpecificBackupRef(currentUser, backupKeyToLoad);
      if (!dataRef) {
          setError("No se pudo obtener la referencia al respaldo específico.");
          setIsLoading(false);
          setLoadingMessage('');
          return;
      }
    } else {
      setError("No se especificó qué cargar.");
      setIsLoading(false);
      setLoadingMessage('');
      return;
    }
  
    try {
      const snapshot = await get(dataRef);
      let loadedData = snapshot.exists() ? snapshot.val() : {};
      
      // If loading latest and it's empty, or if loading a specific backup that's empty,
      // initialize with default structure (as per original app's behavior)
      if (!snapshot.exists() || Object.keys(loadedData).length === 0) {
        setLoadingMessage(snapshot.exists() ? 'Datos vacíos, inicializando estructura...' : 'No se encontró el nodo de datos, inicializando estructura...');
        loadedData = { // Default structure
          incomes: {},
          expenses: {},
          settings: { exchangeRateCLPToUSD: 900, defaultCurrency: "CLP" }, // Default settings
          // Initialize other fields as necessary
        };
      }

      const processedData = processLoadedData(loadedData, backupKeyToLoad);
  
      setCurrentBackupData(processedData);
      setOriginalLoadedData(JSON.parse(JSON.stringify(processedData))); // Deep copy for original state
      setCurrentBackupKey(isLatest ? 'latest_main_data' : backupKeyToLoad); // Use a special key for main data
  
      // Load change log
      const changeLogRef = getUserChangeLogRef(currentUser);
      if (changeLogRef) {
        const logSnapshot = await get(changeLogRef);
        if (logSnapshot.exists()) {
          setChangeLogEntries(Object.values(logSnapshot.val()));
        } else {
          setChangeLogEntries([]);
        }
      } else {
        setChangeLogEntries([]); // No ref, no logs
      }
      
      setDataAsLoaded(); // Signal that data is loaded
      setLoadingMessage('¡Datos cargados exitosamente!');
      setTimeout(() => setLoadingMessage(''), 2000); // Clear message after a delay

    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(`Error al cargar datos: ${err.message}`);
      setLoadingMessage('');
    } finally {
      setIsLoading(false);
      // Do not clear loading message here if successful, let the timeout handle it.
    }
  };

  const handleLoadLatest = () => {
    loadData(null, true);
  };

  const handleLoadSelectedBackup = () => {
    if (selectedBackupKey) {
      loadData(selectedBackupKey);
    } else {
      setError("Por favor, seleccione un respaldo de la lista.");
    }
  };

  return (
    <div className="p-4 my-4 bg-white rounded-lg shadow-md" id="data-selection-container">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Selección de Versión de Datos</h2>
      
      <div className="version-loader mb-4 space-y-2 md:space-y-0 md:flex md:space-x-2">
        <button
          id="load-latest-version-button"
          onClick={handleLoadLatest}
          disabled={isLoading || !currentUser}
          className="w-full md:w-auto button-large bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading && loadingMessage.startsWith('Cargando última') ? 'Cargando...' : 'Cargar Última Versión (Datos Principales)'}
        </button>

        <div className="version-selector-group flex-grow md:flex md:items-center md:space-x-2">
          <select
            id="backup-selector"
            value={selectedBackupKey}
            onChange={(e) => setSelectedBackupKey(e.target.value)}
            disabled={isLoading || backupKeys.length === 0 || !currentUser}
            className="w-full md:flex-grow p-2 border border-gray-300 rounded-md disabled:opacity-50 bg-white"
          >
            {backupKeys.length === 0 && <option>No hay respaldos disponibles</option>}
            {backupKeys.map(b => (
              <option key={b.key} value={b.key}>{b.formattedName}</option>
            ))}
          </select>
          <button
            id="load-backup-button"
            onClick={handleLoadSelectedBackup}
            disabled={isLoading || !selectedBackupKey || backupKeys.length === 0 || !currentUser}
            className="w-full mt-2 md:mt-0 md:w-auto bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading && loadingMessage.startsWith('Cargando respaldo') ? 'Cargando...' : 'Cargar Versión Seleccionada'}
          </button>
        </div>
      </div>

      {loadingMessage && (
        <p id="loading-message" className={`mt-3 text-sm text-center p-2 rounded-md ${error ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {loadingMessage}
        </p>
      )}
      {error && (
         <p id="error-message" className="mt-3 text-sm text-red-600 text-center p-2 bg-red-100 rounded-md">
            Error: {error}
        </p>
      )}
    </div>
  );
};

export default DataVersionSelector;
