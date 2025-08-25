import React from 'react';
import { Bell, AlertTriangle, Users, TrendingDown } from 'lucide-react';
import type { TeamMember } from '../../../types/team';

interface TeamNotificationsProps {
  notifications: {
    total: number;
    pendingReviews: number;
    performanceAlerts: number;
    coachingUpdates: number;
  };
  membersByCategory: {
    pendingReviews: TeamMember[];
    performanceAlerts: TeamMember[];
    coachingUpdates: TeamMember[];
  };
  onMemberClick?: (member: TeamMember) => void;
}

const TeamNotifications: React.FC<TeamNotificationsProps> = ({
  notifications,
  membersByCategory,
  onMemberClick
}) => {
  if (notifications.total === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No hay notificaciones pendientes</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notificaciones del Equipo</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {notifications.total}
        </span>
      </div>

      {/* Revisiones Pendientes */}
      {notifications.pendingReviews > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Revisiones Pendientes ({notifications.pendingReviews})
            </span>
          </div>
          <div className="space-y-1">
            {membersByCategory.pendingReviews.slice(0, 3).map(member => (
              <button
                key={member.id}
                onClick={() => onMemberClick?.(member)}
                className="block w-full text-left text-xs text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 rounded px-2 py-1 transition-colors"
              >
                • {member.fullName} - {member.role}
              </button>
            ))}
            {membersByCategory.pendingReviews.length > 3 && (
              <p className="text-xs text-yellow-600">
                +{membersByCategory.pendingReviews.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Alertas de Rendimiento */}
      {notifications.performanceAlerts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Alertas de Rendimiento ({notifications.performanceAlerts})
            </span>
          </div>
          <div className="space-y-1">
            {membersByCategory.performanceAlerts.slice(0, 3).map(member => (
              <button
                key={member.id}
                onClick={() => onMemberClick?.(member)}
                className="block w-full text-left text-xs text-red-700 hover:text-red-800 hover:bg-red-100 rounded px-2 py-1 transition-colors"
              >
                • {member.fullName} - CSAT: {member.performanceMetrics?.csatScore || 'N/A'}
              </button>
            ))}
            {membersByCategory.performanceAlerts.length > 3 && (
              <p className="text-xs text-red-600">
                +{membersByCategory.performanceAlerts.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actualizaciones de Coaching */}
      {notifications.coachingUpdates > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Actualizaciones de Coaching ({notifications.coachingUpdates})
            </span>
          </div>
          <div className="space-y-1">
            {membersByCategory.coachingUpdates.slice(0, 3).map(member => (
              <button
                key={member.id}
                onClick={() => onMemberClick?.(member)}
                className="block w-full text-left text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100 rounded px-2 py-1 transition-colors"
              >
                • {member.fullName} - Tareas pendientes
              </button>
            ))}
            {membersByCategory.coachingUpdates.length > 3 && (
              <p className="text-xs text-blue-600">
                +{membersByCategory.coachingUpdates.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamNotifications; 