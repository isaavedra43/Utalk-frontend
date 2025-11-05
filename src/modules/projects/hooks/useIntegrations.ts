// Hook de integraciones con otros módulos

import { useState, useCallback } from 'react';
import { integrationService } from '../services/integrationService';
import type { IntegrationSettings, IntegrationSync, SharedData } from '../types';

export const useIntegrations = (projectId: string) => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ [module: string]: IntegrationSync }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración de integraciones
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedSettings = await integrationService.getSettings(projectId);
      setSettings(fetchedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(errorMessage);
      console.error('Error loading integration settings:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Actualizar configuración
  const updateSettings = useCallback(async (updates: Partial<IntegrationSettings>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await integrationService.updateSettings(projectId, updates);
      setSettings(updated);
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar configuración';
      setError(errorMessage);
      console.error('Error updating settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Sincronizar módulo específico
  const syncModule = useCallback(async (
    moduleType: 'hr' | 'inventory' | 'providers' | 'clients'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const syncResult = await integrationService.syncModule(projectId, moduleType);
      
      setSyncStatus(prev => ({
        ...prev,
        [moduleType]: syncResult
      }));
      
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Error al sincronizar ${moduleType}`;
      setError(errorMessage);
      console.error(`Error syncing ${moduleType}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Cargar datos compartidos
  const loadSharedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await integrationService.getSharedData(projectId);
      setSharedData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos compartidos';
      setError(errorMessage);
      console.error('Error loading shared data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Obtener empleados disponibles (HR)
  const getAvailableEmployees = useCallback(async (filters?: any) => {
    try {
      const employees = await integrationService.getAvailableEmployees(projectId, filters);
      return employees;
    } catch (err) {
      console.error('Error fetching available employees:', err);
      throw err;
    }
  }, [projectId]);

  // Asignar empleado (HR)
  const assignEmployeeFromHR = useCallback(async (employeeData: any) => {
    try {
      const result = await integrationService.assignEmployeeFromHR(projectId, employeeData);
      return result;
    } catch (err) {
      console.error('Error assigning employee from HR:', err);
      throw err;
    }
  }, [projectId]);

  // Obtener materiales del inventario
  const getInventoryMaterials = useCallback(async (filters?: any) => {
    try {
      const materials = await integrationService.getInventoryMaterials(projectId, filters);
      return materials;
    } catch (err) {
      console.error('Error fetching inventory materials:', err);
      throw err;
    }
  }, [projectId]);

  // Reservar material del inventario
  const reserveMaterial = useCallback(async (materialData: any) => {
    try {
      const result = await integrationService.reserveMaterial(projectId, materialData);
      return result;
    } catch (err) {
      console.error('Error reserving material:', err);
      throw err;
    }
  }, [projectId]);

  // Obtener cotizaciones de proveedores
  const getProviderQuotes = useCallback(async (materialId?: string) => {
    try {
      const quotes = await integrationService.getProviderQuotes(projectId, materialId);
      return quotes;
    } catch (err) {
      console.error('Error fetching provider quotes:', err);
      throw err;
    }
  }, [projectId]);

  return {
    // Estado
    settings,
    sharedData,
    syncStatus,
    loading,
    error,
    
    // Acciones
    loadSettings,
    updateSettings,
    syncModule,
    loadSharedData,
    
    // Integraciones específicas
    getAvailableEmployees,
    assignEmployeeFromHR,
    getInventoryMaterials,
    reserveMaterial,
    getProviderQuotes,
  };
};

