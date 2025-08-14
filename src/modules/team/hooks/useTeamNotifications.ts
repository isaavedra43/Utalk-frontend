import { useState, useEffect, useCallback } from 'react';
import type { TeamMember } from '../../../types/team';
import { logger } from '../../../utils/logger';

export const useTeamNotifications = (members: TeamMember[]) => {
  const [notifications, setNotifications] = useState({
    total: 0,
    pendingReviews: 0,
    performanceAlerts: 0,
    coachingUpdates: 0
  });

  // Calcular notificaciones basadas en el estado del equipo
  const calculateNotifications = useCallback(() => {
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

  // Actualizar notificaciones cuando cambien los miembros
  useEffect(() => {
    const newNotifications = calculateNotifications();
    setNotifications(newNotifications);
    
    logger.systemInfo('Team notifications updated', { notifications: newNotifications });
  }, [calculateNotifications]);

  // Obtener badge para mostrar en el sidebar
  const getBadgeText = useCallback(() => {
    if (notifications.total === 0) return null;
    if (notifications.total > 9) return '9+';
    return notifications.total.toString();
  }, [notifications.total]);

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
    notifications,
    getBadgeText,
    getNotificationsByCategory,
    calculateNotifications
  };
}; 