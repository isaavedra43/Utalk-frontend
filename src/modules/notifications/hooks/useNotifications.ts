import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Notification, NotificationFilters, NotificationStats } from '../types/notification';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({
    category: 'today',
    priority: 'all',
    type: 'all',
    search: ''
  });

  // Cargar notificaciones
  const loadNotifications = useCallback(async (customFilters?: NotificationFilters) => {
    try {
      setLoading(true);
      setError(null);
      const appliedFilters = customFilters || filters;
      const data = await notificationService.getNotifications(appliedFilters);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Actualizar filtros y recargar
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadNotifications(updatedFilters);
  }, [filters, loadNotifications]);

  // Filtrar notificaciones localmente
  const filteredNotifications = useMemo(() => {
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
  }, [notifications, filters]);

  // Calcular estadísticas
  const stats = useMemo((): NotificationStats => {
    const total = notifications.length;
    const newCount = notifications.filter(n => n.isNew).length;
    const unread = notifications.filter(n => n.status === 'unread').length;
    const actionable = notifications.filter(n => n.quickActions.length > 0).length;
    const urgent = notifications.filter(n => n.priority === 'urgent').length;

    return {
      total,
      new: newCount,
      unread,
      actionable,
      urgent
    };
  }, [notifications]);

  // Marcar como leída
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'read', isNew: false } : n)
      );
      if (selectedNotification?.id === id) {
        setSelectedNotification(prev => prev ? { ...prev, status: 'read', isNew: false } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como leída');
    }
  }, [selectedNotification]);

  // Marcar como no leída
  const markAsUnread = useCallback(async (id: string) => {
    try {
      await notificationService.markAsUnread(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'unread', isNew: true } : n)
      );
      if (selectedNotification?.id === id) {
        setSelectedNotification(prev => prev ? { ...prev, status: 'unread', isNew: true } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como no leída');
    }
  }, [selectedNotification]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read', isNew: false }))
      );
      if (selectedNotification) {
        setSelectedNotification(prev => prev ? { ...prev, status: 'read', isNew: false } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar todas como leídas');
    }
  }, [selectedNotification]);

  // Archivar notificación
  const archiveNotification = useCallback(async (id: string) => {
    try {
      await notificationService.archiveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al archivar notificación');
    }
  }, [selectedNotification]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar notificación');
    }
  }, [selectedNotification]);

  // Ejecutar acción rápida
  const executeQuickAction = useCallback(async (notificationId: string, actionId: string) => {
    try {
      await notificationService.executeQuickAction(notificationId, actionId);
      // Recargar notificaciones después de la acción
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar acción');
    }
  }, [loadNotifications]);

  // Seleccionar notificación
  const selectNotification = useCallback((notification: Notification | null) => {
    setSelectedNotification(notification);
    if (notification && notification.status === 'unread') {
      markAsRead(notification.id);
    }
  }, [markAsRead]);

  // Pausar notificaciones
  const pauseNotifications = useCallback(async () => {
    try {
      await notificationService.pauseNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al pausar notificaciones');
    }
  }, []);

  // Reanudar notificaciones
  const resumeNotifications = useCallback(async () => {
    try {
      await notificationService.resumeNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reanudar notificaciones');
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar notificaciones
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Suscribirse a nuevas notificaciones
  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return unsubscribe;
  }, []);

  return {
    // Estado
    notifications: filteredNotifications,
    allNotifications: notifications,
    loading,
    error,
    selectedNotification,
    stats,
    filters,
    
    // Acciones CRUD
    loadNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    executeQuickAction,
    selectNotification,
    refreshNotifications,
    
    // Filtros
    updateFilters,
    clearFilters: () => updateFilters({
      category: 'today',
      priority: 'all',
      type: 'all',
      search: ''
    }),
    
    // Acciones globales
    pauseNotifications,
    resumeNotifications,
    
    // Utilidades
    clearError
  };
}; 