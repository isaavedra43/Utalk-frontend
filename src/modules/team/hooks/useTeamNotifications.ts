import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TeamMember } from '../../../types/team';
import { logger } from '../../../utils/logger';

export const useTeamNotifications = (members: TeamMember[]) => {
  const [notifications, setNotifications] = useState({
    total: 0,
    pendingReviews: 0,
    performanceAlerts: 0,
    coachingUpdates: 0
  });

  // Generar notificaciones de rendimiento
  const generatePerformanceNotifications = useCallback((members: TeamMember[]) => {
    const notifications: TeamNotification[] = [];

    members.forEach(member => {
      if (!member.performanceMetrics) return;

      // Notificación por CSAT bajo
      if (member.performanceMetrics.csatScore < 3.5) {
        notifications.push({
          id: `csat-${member.id}`,
          type: 'performance',
          title: 'CSAT bajo detectado',
          message: `${member.name} tiene un CSAT de ${member.performanceMetrics.csatScore}`,
          priority: 'high',
          memberId: member.id,
          createdAt: new Date(),
          isRead: false
        });
      }

      // Notificación por tiempo de respuesta alto
      const [minutes, seconds] = member.performanceMetrics.averageResponseTime.split(':').map(Number);
      const responseTimeMinutes = minutes + seconds / 60;
      
      if (responseTimeMinutes > 5) {
        notifications.push({
          id: `response-${member.id}`,
          type: 'performance',
          title: 'Tiempo de respuesta alto',
          message: `${member.name} tiene un tiempo de respuesta promedio de ${member.performanceMetrics.averageResponseTime}`,
          priority: 'medium',
          memberId: member.id,
          createdAt: new Date(),
          isRead: false
        });
      }
    });

    return notifications;
  }, []);

  // Calcular notificaciones usando useMemo para evitar recálculos innecesarios
  const calculatedNotifications = useMemo(() => {
    let pendingReviews = 0;
    let performanceAlerts = 0;
    let coachingUpdates = 0;

    members.forEach(member => {
      // Miembros que necesitan revisión de rendimiento
      if (member.performanceMetrics.csatScore < 4.0) {
        performanceAlerts++;
      }

      // Miembros con tareas de coaching pendientes
      if (member.coachingPlan) {
        const pendingTasks = member.coachingPlan.tasks.filter(task => task.status === 'pending');
        if (pendingTasks.length > 0) {
          coachingUpdates++;
        }
      }

      // Miembros inactivos que necesitan revisión
      if (member.status === 'inactive') {
        pendingReviews++;
      }
    });

    const total = pendingReviews + performanceAlerts + coachingUpdates;

    return {
      total,
      pendingReviews,
      performanceAlerts,
      coachingUpdates
    };
  }, [members]);

  // Actualizar notificaciones solo cuando cambien los miembros
  useEffect(() => {
    setNotifications(calculatedNotifications);
    
    // Solo loggear si hay cambios reales en las notificaciones
    const hasChanges = (
      notifications.total !== calculatedNotifications.total ||
      notifications.pendingReviews !== calculatedNotifications.pendingReviews ||
      notifications.performanceAlerts !== calculatedNotifications.performanceAlerts ||
      notifications.coachingUpdates !== calculatedNotifications.coachingUpdates
    );
    
    if (hasChanges) {
      logger.systemInfo('Team notifications updated', { notifications: calculatedNotifications });
    }
  }, [calculatedNotifications, notifications]);

  // Obtener badge para mostrar en el sidebar
  const getBadgeText = useCallback(() => {
    if (calculatedNotifications.total === 0) return null;
    if (calculatedNotifications.total > 9) return '9+';
    return calculatedNotifications.total.toString();
  }, [calculatedNotifications.total]);

  // Obtener notificaciones por categoría
  const getNotificationsByCategory = useCallback(() => {
    return {
      pendingReviews: members.filter(m => m.status === 'inactive'),
      performanceAlerts: members.filter(m => m.performanceMetrics.csatScore < 4.0),
      coachingUpdates: members.filter(m => 
        m.coachingPlan && 
        m.coachingPlan.tasks.some(task => task.status === 'pending')
      )
    };
  }, [members]);

  return {
    notifications: calculatedNotifications,
    getBadgeText,
    getNotificationsByCategory
  };
}; 