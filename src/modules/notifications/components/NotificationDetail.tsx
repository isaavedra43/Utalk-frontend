import React, { useState } from 'react';
import type { Notification } from '../../../types/notification';
import { 
  Bell, 
  Clock, 
  User, 
  Tag, 
  ExternalLink, 
  Download,
  Share2,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface NotificationDetailProps {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleAction = (actionId: string) => {
    // Implementar acciones según el tipo de notificación
    switch (actionId) {
      case 'mark-read':
        onMarkAsRead?.(notification.id);
        break;
      case 'delete':
        onDelete?.(notification.id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
              {getPriorityIcon(notification.priority)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {notification.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{notification.timestamp}</span>
                </div>
                {notification.relatedTo && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{notification.relatedTo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Cerrar</span>
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-4">{notification.description}</p>
          
          {isExpanded && notification.context && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Detalles adicionales</h4>
              <div className="text-gray-600 text-sm">
                {notification.context.originalMessage && (
                  <p><strong>Mensaje original:</strong> {notification.context.originalMessage}</p>
                )}
                {notification.context.slaExceededSince && (
                  <p><strong>SLA excedido desde:</strong> {notification.context.slaExceededSince}</p>
                )}
                {notification.context.meetingTime && (
                  <p><strong>Hora de reunión:</strong> {notification.context.meetingTime}</p>
                )}
              </div>
            </div>
          )}

          {notification.tags && notification.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Etiquetas</h4>
              <div className="flex flex-wrap gap-2">
                {notification.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {notification.relatedLinks && notification.relatedLinks.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Enlaces relacionados</h4>
              <div className="space-y-2">
                {notification.relatedLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={link.action}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleAction('mark-read')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Marcar como leída</span>
            </button>
            
            {notification.quickActions && notification.quickActions.length > 0 && (
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Acciones rápidas</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>
            
            <button
              onClick={() => handleAction('delete')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 