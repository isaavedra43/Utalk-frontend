import { useState, useEffect, useCallback } from 'react';
import { ProvidersService } from '../services/providersService';
import type { Provider } from '../types';

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores
  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProvidersService.getAllProviders();
      setProviders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar proveedores';
      setError(errorMessage);
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear proveedor
  const createProvider = useCallback(async (provider: Omit<Provider, 'id'>) => {
    try {
      const newProvider = await ProvidersService.createProvider(provider);
      setProviders(prev => [...prev, newProvider]);
      return newProvider;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear proveedor';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Actualizar proveedor
  const updateProvider = useCallback(async (providerId: string, updates: Partial<Provider>) => {
    try {
      const updatedProvider = await ProvidersService.updateProvider(providerId, updates);
      setProviders(prev => prev.map(p => p.id === providerId ? updatedProvider : p));
      return updatedProvider;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar proveedor';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Eliminar proveedor
  const deleteProvider = useCallback(async (providerId: string) => {
    try {
      await ProvidersService.deleteProvider(providerId);
      setProviders(prev => prev.filter(p => p.id !== providerId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar proveedor';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return {
    providers,
    loading,
    error,
    loadProviders,
    createProvider,
    updateProvider,
    deleteProvider
  };
};
