// Hook para manejo de configuración del módulo de inventario

import { useState, useEffect, useCallback } from 'react';
import { ConfigService } from '../services/configService';
import type { ModuleConfiguration, Provider, MaterialOption } from '../types';

export const useConfiguration = () => {
  const [configuration, setConfiguration] = useState<ModuleConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración inicial
  useEffect(() => {
    try {
      const config = ConfigService.getConfiguration();
      setConfiguration(config);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NUEVO: Traer proveedores y materiales reales del backend al abrir configuración
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Cargando proveedores y materiales desde el backend...');
        
        const [{ ProviderApiService, MaterialApiService }] = await Promise.all([
          import('../services/inventoryApiService')
        ]);

        const [providers, materialsResponse] = await Promise.all([
          ProviderApiService.getAllProviders(),
          MaterialApiService.getAllMaterials({ limit: 1000 })
        ]);

        console.log('📦 Proveedores cargados:', providers);
        console.log('📦 Respuesta de materiales:', materialsResponse);

        // Extraer materiales de la respuesta
        let materials = [];
        if (materialsResponse && materialsResponse.data) {
          materials = materialsResponse.data;
        } else if (Array.isArray(materialsResponse)) {
          materials = materialsResponse;
        }

        console.log('📦 Materiales extraídos:', materials);

        const current = ConfigService.getConfiguration();
        current.providers = providers || [];
        current.materials = materials || [];
        ConfigService.saveConfiguration(current);
        setConfiguration({ ...current });
        setError(null);
        
        console.log('✅ Configuración actualizada con datos del backend');
      } catch (err) {
        console.warn('⚠️ No se pudo obtener proveedores/materiales del backend, mostrando locales.', err);
        console.error('❌ Error detallado:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendData();
  }, []);

  // ==================== GESTIÓN GENERAL ====================

  const refreshConfiguration = useCallback(() => {
    try {
      const config = ConfigService.getConfiguration();
      setConfiguration(config);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
    }
  }, []);

  const resetConfiguration = useCallback(() => {
    try {
      const config = ConfigService.resetConfiguration();
      setConfiguration(config);
      setError(null);
      return config;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear configuración');
      throw err;
    }
  }, []);

  // ✅ ELIMINADO: Ya no se crean datos falsos
  // Ahora solo se limpia la configuración local
  const clearLocalConfiguration = useCallback(() => {
    try {
      ConfigService.clearLocalConfiguration();
      const config = ConfigService.getConfiguration();
      setConfiguration(config);
      setError(null);
      console.log('✅ Configuración local limpiada - Solo datos reales del backend');
      return config;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al limpiar configuración');
      throw err;
    }
  }, []);

  const exportConfiguration = useCallback(() => {
    try {
      return ConfigService.exportConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar configuración');
      throw err;
    }
  }, []);

  const importConfiguration = useCallback((jsonConfig: string) => {
    try {
      const config = ConfigService.importConfiguration(jsonConfig);
      setConfiguration(config);
      setError(null);
      return config;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar configuración');
      throw err;
    }
  }, []);

  // ==================== GESTIÓN DE PROVEEDORES ====================

  // ✅ CAMBIO CRÍTICO: Ahora SIEMPRE envía al backend
  const addProvider = useCallback(async (provider: Omit<Provider, 'id'>) => {
    console.log('🚀 [addProvider] Iniciando creación de proveedor:', provider);
    
    try {
      // ✅ ENVIAR AL BACKEND INMEDIATAMENTE
      console.log('📤 [addProvider] Importando ProviderApiService...');
      const { ProviderApiService } = await import('../services/inventoryApiService');
      
      console.log('📤 [addProvider] Enviando POST al backend...');
      const newProvider = await ProviderApiService.createProvider(provider);
      console.log('✅ [addProvider] Proveedor creado en backend:', newProvider);
      
      // ✅ Actualizar configuración local con datos del backend
      console.log('💾 [addProvider] Actualizando LocalStorage...');
      const config = ConfigService.getConfiguration();
      config.providers.push(newProvider);
      ConfigService.saveConfiguration(config);
      
      refreshConfiguration();
      console.log('✅ [addProvider] PROCESO COMPLETADO - Proveedor guardado en backend y LocalStorage');
      return newProvider;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar proveedor';
      setError(errorMessage);
      console.error('❌ [addProvider] ERROR COMPLETO:', err);
      console.error('❌ [addProvider] Error message:', errorMessage);
      console.error('❌ [addProvider] Stack:', err instanceof Error ? err.stack : 'No stack');
      throw err;
    }
  }, [refreshConfiguration]);

  const updateProvider = useCallback((providerId: string, updates: Partial<Provider>) => {
    try {
      const updatedProvider = ConfigService.updateProvider(providerId, updates);
      refreshConfiguration();
      return updatedProvider;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar proveedor');
      throw err;
    }
  }, [refreshConfiguration]);

  const deleteProvider = useCallback((providerId: string) => {
    try {
      ConfigService.deleteProvider(providerId);
      refreshConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar proveedor');
      throw err;
    }
  }, [refreshConfiguration]);

  const getProviders = useCallback(() => {
    try {
      return ConfigService.getProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener proveedores');
      return [];
    }
  }, []);

  // ==================== GESTIÓN DE MATERIALES ====================

  // ✅ CAMBIO CRÍTICO: Ahora SIEMPRE envía al backend
  const addMaterial = useCallback(async (material: Omit<MaterialOption, 'id'>) => {
    console.log('🚀 [addMaterial] Iniciando creación de material:', material);
    
    try {
      // ✅ ENVIAR AL BACKEND INMEDIATAMENTE
      console.log('📤 [addMaterial] Importando MaterialApiService...');
      const { MaterialApiService } = await import('../services/inventoryApiService');
      
      console.log('📤 [addMaterial] Enviando POST al backend...');
      const newMaterial = await MaterialApiService.createMaterial(material);
      console.log('✅ [addMaterial] Material creado en backend:', newMaterial);
      
      // ✅ Actualizar configuración local con datos del backend
      console.log('💾 [addMaterial] Actualizando LocalStorage...');
      const config = ConfigService.getConfiguration();
      config.materials.push(newMaterial);
      ConfigService.saveConfiguration(config);
      
      refreshConfiguration();
      console.log('✅ [addMaterial] PROCESO COMPLETADO - Material guardado en backend y LocalStorage');
      return newMaterial;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar material';
      setError(errorMessage);
      console.error('❌ [addMaterial] ERROR COMPLETO:', err);
      console.error('❌ [addMaterial] Error message:', errorMessage);
      console.error('❌ [addMaterial] Stack:', err instanceof Error ? err.stack : 'No stack');
      throw err;
    }
  }, [refreshConfiguration]);

  const updateMaterial = useCallback((materialId: string, updates: Partial<MaterialOption>) => {
    try {
      const updatedMaterial = ConfigService.updateMaterial(materialId, updates);
      refreshConfiguration();
      return updatedMaterial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar material');
      throw err;
    }
  }, [refreshConfiguration]);

  const deleteMaterial = useCallback((materialId: string) => {
    try {
      ConfigService.deleteMaterial(materialId);
      refreshConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar material');
      throw err;
    }
  }, [refreshConfiguration]);

  const toggleMaterialStatus = useCallback((materialId: string) => {
    try {
      const updatedMaterial = ConfigService.toggleMaterialStatus(materialId);
      refreshConfiguration();
      return updatedMaterial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del material');
      throw err;
    }
  }, [refreshConfiguration]);

  const getMaterials = useCallback(() => {
    try {
      return ConfigService.getMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener materiales');
      return [];
    }
  }, []);

  const getActiveMaterials = useCallback(() => {
    try {
      return ConfigService.getActiveMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener materiales activos');
      return [];
    }
  }, []);

  // ==================== CONFIGURACIÓN GENERAL ====================

  const updateSettings = useCallback((updates: Partial<ModuleConfiguration['settings']>) => {
    try {
      ConfigService.updateSettings(updates);
      refreshConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
      throw err;
    }
  }, [refreshConfiguration]);

  const getSettings = useCallback(() => {
    try {
      return ConfigService.getSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener configuración');
      return null;
    }
  }, []);

  // ==================== CATEGORÍAS DE MATERIALES ====================

  const getMaterialCategories = useCallback(() => {
    try {
      return ConfigService.getMaterialCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener categorías');
      return [];
    }
  }, []);

  const addMaterialCategory = useCallback((category: string) => {
    try {
      ConfigService.addMaterialCategory(category);
      refreshConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar categoría');
      throw err;
    }
  }, [refreshConfiguration]);

  const removeMaterialCategory = useCallback((category: string) => {
    try {
      ConfigService.removeMaterialCategory(category);
      refreshConfiguration();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
      throw err;
    }
  }, [refreshConfiguration]);

  // ==================== ESTADÍSTICAS ====================

  const getConfigurationStats = useCallback(() => {
    try {
      return ConfigService.getConfigurationStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      return null;
    }
  }, []);

  return {
    // Estado
    configuration,
    loading,
    error,
    // Utilidad para refrescar desde backend bajo demanda
    refreshFromBackend: async () => {
      try {
        console.log('🔄 Refrescando datos desde el backend...');
        
        const [{ ProviderApiService, MaterialApiService }] = await Promise.all([
          import('../services/inventoryApiService')
        ]);
        
        const [providers, materialsResponse] = await Promise.all([
          ProviderApiService.getAllProviders(),
          MaterialApiService.getAllMaterials({ limit: 1000 })
        ]);
        
        console.log('📦 Proveedores refrescados:', providers);
        console.log('📦 Respuesta de materiales refrescada:', materialsResponse);
        
        // Extraer materiales de la respuesta
        let materials = [];
        if (materialsResponse && materialsResponse.data) {
          materials = materialsResponse.data;
        } else if (Array.isArray(materialsResponse)) {
          materials = materialsResponse;
        }
        
        console.log('📦 Materiales extraídos (refresh):', materials);
        
        const current = ConfigService.getConfiguration();
        current.providers = providers || [];
        current.materials = materials || [];
        ConfigService.saveConfiguration(current);
        setConfiguration({ ...current });
        
        console.log('✅ Datos refrescados desde el backend');
      } catch (e) {
        console.error('❌ Error refrescando datos de backend:', e);
      }
    },
    
    // Gestión general
    refreshConfiguration,
    resetConfiguration,
    clearLocalConfiguration, // ✅ Cambio: Ya no se inicializan datos falsos
    exportConfiguration,
    importConfiguration,
    
    // Proveedores
    providers: configuration?.providers || [],
    addProvider,
    updateProvider,
    deleteProvider,
    getProviders,
    
    // Materiales
    materials: configuration?.materials || [],
    activeMaterials: configuration?.materials?.filter(m => m.isActive !== false) || [],
    addMaterial,
    updateMaterial,
    deleteMaterial,
    toggleMaterialStatus,
    getMaterials,
    getActiveMaterials,
    
    // Configuración general
    settings: configuration?.settings || null,
    updateSettings,
    getSettings,
    
    // Categorías
    materialCategories: configuration?.settings?.defaultMaterialCategories || [],
    addMaterialCategory,
    removeMaterialCategory,
    getMaterialCategories,
    
    // Estadísticas
    getConfigurationStats
  };
};
