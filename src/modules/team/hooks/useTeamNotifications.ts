import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TeamMember } from '../../../types/team';
import { logger } from '../../../utils/logger';

export const useTeamNotifications = (members: TeamMember[]) => {
  const [notifications, setNotifications] = useState({
    total: 0,
    pendingReviews: 0,
    performanceAlerts: 0,
    coachingUpdates: 0
  });

  // Calcular notificaciones usando useMemo para evitar recálculos innecesarios
  const calculatedNotifications = useMemo(() => {
    let pendingReviews = 0;
    let performanceAlerts = 0;
    let coachingUpdates = 0;

    members.forEach((member: TeamMember) => {
      // Miembros que necesitan revisión de rendimiento
      if (member.performanceMetrics && member.performanceMetrics.csatScore < 4.0) {
        performanceAlerts++;
      }

      // Miembros con tareas de coaching pendientes
      if (member.coachingPlan) {
        const pendingTasks = member.coachingPlan.tasks.filter((task: { status: string }) => task.status === 'pending');
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
      pendingReviews: members.filter((m: TeamMember) => m.status === 'inactive'),
      performanceAlerts: members.filter((m: TeamMember) => m.performanceMetrics && m.performanceMetrics.csatScore < 4.0),
      coachingUpdates: members.filter((m: TeamMember) => 
        m.coachingPlan && 
        m.coachingPlan.tasks.some((task: { status: string }) => task.status === 'pending')
      )
    };
  }, [members]);

  return {
    notifications: calculatedNotifications,
    getBadgeText,
    getNotificationsByCategory
  };
}; 