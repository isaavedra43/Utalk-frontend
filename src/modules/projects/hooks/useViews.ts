// Hook de gestión de vistas

import { useState, useCallback } from 'react';
import type { ProjectView, SavedView, ViewType, ViewFilters } from '../types';

export const useViews = (projectId: string) => {
  const [views, setViews] = useState<SavedView[]>([]);
  const [currentView, setCurrentView] = useState<SavedView | null>(null);
  const [viewType, setViewType] = useState<ViewType>('table');
  const [viewFilters, setViewFilters] = useState<ViewFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar vistas guardadas
  const loadViews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar cuando el servicio esté disponible
      // const fetchedViews = await viewsService.getViews(projectId);
      // setViews(fetchedViews);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar vistas';
      setError(errorMessage);
      console.error('Error loading views:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Guardar vista actual
  const saveView = useCallback(async (viewData: {
    name: string;
    isPublic?: boolean;
    isDefault?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const newView: SavedView = {
        id: Date.now().toString(), // Temporal
        name: viewData.name,
        type: viewType,
        config: {}, // TODO: Obtener config actual
        filters: viewFilters,
        isFavorite: false,
        isDefault: viewData.isDefault || false,
        isPublic: viewData.isPublic || false,
        sharedWith: [],
        usageCount: 0,
        createdAt: new Date(),
        createdBy: '', // TODO: Obtener usuario actual
        updatedAt: new Date(),
      };
      
      // TODO: Guardar en backend
      // const saved = await viewsService.saveView(projectId, newView);
      // setViews(prev => [...prev, saved]);
      
      setViews(prev => [...prev, newView]);
      
      return newView;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar vista';
      setError(errorMessage);
      console.error('Error saving view:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [viewType, viewFilters, projectId]);

  // Aplicar vista guardada
  const applyView = useCallback((view: SavedView) => {
    setCurrentView(view);
    setViewType(view.type);
    setViewFilters(view.filters);
    
    // TODO: Actualizar usage count en backend
  }, []);

  // Eliminar vista
  const deleteView = useCallback(async (viewId: string) => {
    try {
      // TODO: Implementar cuando el servicio esté disponible
      // await viewsService.deleteView(projectId, viewId);
      
      setViews(prev => prev.filter(v => v.id !== viewId));
      
      if (currentView?.id === viewId) {
        setCurrentView(null);
      }
    } catch (err) {
      console.error('Error deleting view:', err);
      throw err;
    }
  }, [projectId, currentView]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (viewId: string) => {
    try {
      setViews(prev => prev.map(v => 
        v.id === viewId ? { ...v, isFavorite: !v.isFavorite } : v
      ));
      
      // TODO: Actualizar en backend
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, []);

  // Actualizar filtros de vista actual
  const updateFilters = useCallback((filters: Partial<ViewFilters>) => {
    setViewFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setViewFilters({});
  }, []);

  return {
    // Estado
    views,
    currentView,
    viewType,
    viewFilters,
    loading,
    error,
    
    // Acciones
    loadViews,
    saveView,
    applyView,
    deleteView,
    toggleFavorite,
    setViewType,
    updateFilters,
    clearFilters,
  };
};

