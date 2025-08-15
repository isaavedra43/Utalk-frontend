import { useState, useCallback, useMemo } from 'react';
import type { NotificationFilters, Notification } from '../types/notification';

export const useNotificationFilters = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    category: 'today',
    priority: 'all',
    type: 'all',
    search: ''
  });

  // Actualizar filtro de categoría
  const setCategory = useCallback((category: NotificationFilters['category']) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  // Actualizar filtro de prioridad
  const setPriority = useCallback((priority: NotificationFilters['priority']) => {
    setFilters(prev => ({ ...prev, priority }));
  }, []);

  // Actualizar filtro de tipo
  const setType = useCallback((type: NotificationFilters['type']) => {
    setFilters(prev => ({ ...prev, type }));
  }, []);

  // Actualizar búsqueda
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  // Actualizar múltiples filtros a la vez
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({
      category: 'today',
      priority: 'all',
      type: 'all',
      search: ''
    });
  }, []);

  // Limpiar solo la búsqueda
  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return filters.category !== 'today' || 
           filters.priority !== 'all' || 
           filters.type !== 'all' || 
           filters.search !== '';
  }, [filters]);

  // Obtener filtros activos como texto
  const getActiveFiltersText = useCallback(() => {
    const activeFilters: string[] = [];
    
    if (filters.category !== 'today') {
      const categoryLabels: Record<string, string> = {
        today: 'Hoy',
        unread: 'No leídas',
        actionable: 'Accionables',
        urgent: 'Urgentes',
        all: 'Todas'
      };
      activeFilters.push(`Categoría: ${categoryLabels[filters.category]}`);
    }
    
    if (filters.priority !== 'all') {
      const priorityLabels: Record<string, string> = {
        urgent: 'Urgente',
        high: 'Alta',
        medium: 'Media',
        low: 'Baja',
        all: 'Todas'
      };
      activeFilters.push(`Prioridad: ${priorityLabels[filters.priority]}`);
    }
    
    if (filters.type !== 'all') {
      const typeLabels: Record<string, string> = {
        conversation: 'Conversación',
        meeting: 'Reunión',
        sla: 'SLA',
        churn: 'Churn',
        system: 'Sistema',
        alert: 'Alerta',
        all: 'Todos'
      };
      activeFilters.push(`Tipo: ${typeLabels[filters.type]}`);
    }
    
    if (filters.search) {
      activeFilters.push(`Búsqueda: "${filters.search}"`);
    }
    
    return activeFilters.join(', ');
  }, [filters]);

  // Aplicar filtros a una lista de notificaciones
  const applyFilters = useCallback((notifications: Notification[]): Notification[] => {
    return notifications.filter(notification => {
      // Filtro por categoría
      if (filters.category !== 'all') {
        if (filters.category === 'today' && notification.category !== 'today') return false;
        if (filters.category === 'unread' && notification.status !== 'unread') return false;
        if (filters.category === 'actionable' && notification.quickActions.length === 0) return false;
        if (filters.category === 'urgent' && notification.priority !== 'urgent') return false;
      }
      
      // Filtro por prioridad
      if (filters.priority !== 'all' && notification.priority !== filters.priority) {
        return false;
      }
      
      // Filtro por tipo
      if (filters.type !== 'all' && notification.type !== filters.type) {
        return false;
      }
      
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = notification.title.toLowerCase().includes(searchLower);
        const matchesDescription = notification.description.toLowerCase().includes(searchLower);
        const matchesTags = notification.tags.some(tag => 
          tag.label.toLowerCase().includes(searchLower)
        );
        const matchesRelatedTo = notification.relatedTo?.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesDescription && !matchesTags && !matchesRelatedTo) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters]);

  // Obtener opciones de filtros disponibles
  const getFilterOptions = useMemo(() => {
    return {
      categories: [
        { value: 'today', label: 'Hoy' },
        { value: 'unread', label: 'No leídas' },
        { value: 'actionable', label: 'Accionables' },
        { value: 'urgent', label: 'Urgentes' },
        { value: 'all', label: 'Todas' }
      ],
      priorities: [
        { value: 'urgent', label: 'Urgente' },
        { value: 'high', label: 'Alta' },
        { value: 'medium', label: 'Media' },
        { value: 'low', label: 'Baja' },
        { value: 'all', label: 'Todas' }
      ],
      types: [
        { value: 'conversation', label: 'Conversación' },
        { value: 'meeting', label: 'Reunión' },
        { value: 'sla', label: 'SLA' },
        { value: 'churn', label: 'Churn' },
        { value: 'system', label: 'Sistema' },
        { value: 'alert', label: 'Alerta' },
        { value: 'all', label: 'Todos' }
      ]
    };
  }, []);

  return {
    // Estado
    filters,
    
    // Setters individuales
    setCategory,
    setPriority,
    setType,
    setSearch,
    
    // Setters múltiples
    updateFilters,
    
    // Limpiadores
    clearFilters,
    clearSearch,
    
    // Utilidades
    hasActiveFilters,
    getActiveFiltersText,
    applyFilters,
    getFilterOptions
  };
}; 