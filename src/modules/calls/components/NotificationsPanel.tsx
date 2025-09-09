import React from 'react';
import { Bell, X, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { CallNotification } from '../../../types/calls';

interface NotificationsPanelProps {
  notifications: CallNotification[];
  onNotificationRead: (id: string) => void;
  onNotificationDismiss: (id: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onNotificationRead,
  onNotificationDismiss
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <Phone className="w-4 h-4 text-green-600" />;
      case 'missed': return <Phone className="w-4 h-4 text-red-600" />;
      case 'voicemail': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'callback': return <Phone className="w-4 h-4 text-yellow-600" />;
      case 'qa': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
      </div>

      <div className="h-full overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay notificaciones</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`p-4 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority === 'high' ? 'Alta' : 
                         notification.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNotificationDismiss(notification.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

