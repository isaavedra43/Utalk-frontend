import { useCallback, useState } from 'react';
import type { Notification, QuickAction } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export const useNotificationActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async (): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('markAllAsRead');
      await notificationService.markAllAsRead();
      return { success: true, data: { message: 'Todas las notificaciones marcadas como leídas' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al marcar todas como leídas' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Pausar notificaciones
  const pauseNotifications = useCallback(async (): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('pauseNotifications');
      await notificationService.pauseNotifications();
      return { success: true, data: { message: 'Notificaciones pausadas' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al pausar notificaciones' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Reanudar notificaciones
  const resumeNotifications = useCallback(async (): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('resumeNotifications');
      await notificationService.resumeNotifications();
      return { success: true, data: { message: 'Notificaciones reanudadas' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al reanudar notificaciones' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Exportar notificaciones
  const exportNotifications = useCallback(async (
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('exportNotifications');
      
      // TODO: Implementar exportación real cuando esté disponible
      const notifications = await notificationService.getNotifications();
      
      let exportData: string;
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        const headers = ['ID', 'Título', 'Descripción', 'Tipo', 'Prioridad', 'Estado', 'Fecha'];
        const rows = notifications.map(n => [
          n.id,
          n.title,
          n.description,
          n.type,
          n.priority,
          n.status,
          n.createdAt.toISOString()
        ]);
        exportData = [headers, ...rows].map(row => row.join(',')).join('\n');
      } else if (format === 'json') {
        exportData = JSON.stringify(notifications, null, 2);
      } else {
        exportData = JSON.stringify(notifications, null, 2); // PDF placeholder
      }
      
      // Simular descarga
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notificaciones_${timestamp}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      return { 
        success: true, 
        data: { 
          message: `Notificaciones exportadas en formato ${format.toUpperCase()}`,
          filename: `notificaciones_${timestamp}.${format}`
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al exportar notificaciones' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Refrescar notificaciones
  const refreshNotifications = useCallback(async (): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('refreshNotifications');
      
      // TODO: Implementar refresh real cuando esté disponible
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      
      return { success: true, data: { message: 'Notificaciones actualizadas' } };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al refrescar notificaciones' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Configurar notificaciones
  const configureNotifications = useCallback(async (settings: {
    email?: boolean;
    push?: boolean;
    sound?: boolean;
    desktop?: boolean;
    quietHours?: { enabled: boolean; start: string; end: string };
  }): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('configureNotifications');
      
      // TODO: Implementar configuración real cuando esté disponible
      console.log('Configurando notificaciones:', settings);
      
      return { 
        success: true, 
        data: { 
          message: 'Configuración de notificaciones actualizada',
          settings 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al configurar notificaciones' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Ejecutar acción rápida individual
  const executeQuickAction = useCallback(async (
    notificationId: string, 
    actionId: string
  ): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('executeQuickAction');
      
      await notificationService.executeQuickAction(notificationId, actionId);
      
      return { 
        success: true, 
        data: { 
          message: 'Acción ejecutada correctamente',
          notificationId,
          actionId
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al ejecutar acción' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Acciones en lote
  const bulkActions = useCallback(async (
    action: 'markAsRead' | 'markAsUnread' | 'archive' | 'delete',
    notificationIds: string[]
  ): Promise<ActionResult> => {
    try {
      setIsLoading(true);
      setLastAction('bulkActions');
      
      const results = await Promise.allSettled(
        notificationIds.map(async (id) => {
          switch (action) {
            case 'markAsRead':
              return notificationService.markAsRead(id);
            case 'markAsUnread':
              return notificationService.markAsUnread(id);
            case 'archive':
              return notificationService.archiveNotification(id);
            case 'delete':
              return notificationService.deleteNotification(id);
            default:
              throw new Error('Acción no válida');
          }
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { 
        success: true, 
        data: { 
          message: `Acción ${action} completada`,
          successful,
          failed,
          total: notificationIds.length
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error en acciones en lote' 
      };
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  }, []);

  // Obtener acciones disponibles para una notificación
  const getAvailableActions = useCallback((notification: Notification): QuickAction[] => {
    const actions: QuickAction[] = [];
    
    // Acciones básicas
    if (notification.status === 'unread') {
      actions.push({
        id: 'markAsRead',
        label: 'Marcar como leída',
        icon: 'check',
        color: 'primary',
        action: () => console.log('Marcar como leída')
      });
    } else {
      actions.push({
        id: 'markAsUnread',
        label: 'Marcar como no leída',
        icon: 'circle',
        color: 'secondary',
        action: () => console.log('Marcar como no leída')
      });
    }
    
    // Acciones específicas por tipo
    switch (notification.type) {
      case 'conversation':
        actions.push({
          id: 'reply',
          label: 'Responder',
          icon: 'arrow-right',
          color: 'primary',
          action: () => console.log('Responder')
        });
        break;
      case 'meeting':
        actions.push({
          id: 'reschedule',
          label: 'Reprogramar',
          icon: 'calendar',
          color: 'secondary',
          action: () => console.log('Reprogramar')
        });
        break;
      case 'sla':
        actions.push({
          id: 'escalate',
          label: 'Escalar',
          icon: 'arrow-up',
          color: 'danger',
          action: () => console.log('Escalar')
        });
        break;
    }
    
    // Acciones de gestión
    actions.push({
      id: 'archive',
      label: 'Archivar',
      icon: 'archive',
      color: 'secondary',
      action: () => console.log('Archivar')
    });
    
    return actions;
  }, []);

  return {
    // Estado
    isLoading,
    lastAction,
    
    // Acciones globales
    markAllAsRead,
    pauseNotifications,
    resumeNotifications,
    exportNotifications,
    refreshNotifications,
    configureNotifications,
    
    // Acciones individuales
    executeQuickAction,
    
    // Acciones en lote
    bulkActions,
    
    // Utilidades
    getAvailableActions
  };
}; 