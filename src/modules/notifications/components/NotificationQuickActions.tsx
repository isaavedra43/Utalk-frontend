import React from 'react';
import { Send, ArrowUp, Calendar, MessageSquare, UserPlus, AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import type { QuickAction, Notification } from '../types/notification';

interface NotificationQuickActionsProps {
  notification: Notification;
  onAction: (actionId: string) => void;
  className?: string;
}

export const NotificationQuickActions: React.FC<NotificationQuickActionsProps> = ({
  notification,
  onAction,
  className = ''
}) => {
  const getDefaultActions = (): QuickAction[] => {
    switch (notification.type) {
      case 'conversation':
        return [
          {
            id: 'reply',
            label: 'Responder con Plantilla',
            icon: 'send',
            color: 'primary',
            action: () => onAction('reply')
          },
          {
            id: 'reassign',
            label: 'Reasignar',
            icon: 'user-plus',
            color: 'secondary',
            action: () => onAction('reassign')
          }
        ];
      
      case 'meeting':
        return [
          {
            id: 'reschedule',
            label: 'Reprogramar',
            icon: 'calendar',
            color: 'secondary',
            action: () => onAction('reschedule')
          },
          {
            id: 'join',
            label: 'Unirse',
            icon: 'external-link',
            color: 'primary',
            action: () => onAction('join')
          }
        ];
      
      case 'sla':
        return [
          {
            id: 'respond_now',
            label: 'Responder Ahora',
            icon: 'send',
            color: 'danger',
            action: () => onAction('respond_now')
          },
          {
            id: 'escalate',
            label: 'Escalar',
            icon: 'arrow-up',
            color: 'secondary',
            action: () => onAction('escalate')
          }
        ];
      
      case 'churn':
        return [
          {
            id: 'retain',
            label: 'Retener Cliente',
            icon: 'message-square',
            color: 'primary',
            action: () => onAction('retain')
          },
          {
            id: 'analyze',
            label: 'Analizar',
            icon: 'settings',
            color: 'secondary',
            action: () => onAction('analyze')
          }
        ];
      
      case 'system':
        return [
          {
            id: 'acknowledge',
            label: 'Reconocer',
            icon: 'check',
            color: 'primary',
            action: () => onAction('acknowledge')
          },
          {
            id: 'configure',
            label: 'Configurar',
            icon: 'settings',
            color: 'secondary',
            action: () => onAction('configure')
          }
        ];
      
      case 'alert':
        return [
          {
            id: 'respond',
            label: 'Responder',
            icon: 'send',
            color: 'danger',
            action: () => onAction('respond')
          },
          {
            id: 'dismiss',
            label: 'Descartar',
            icon: 'x',
            color: 'secondary',
            action: () => onAction('dismiss')
          }
        ];
      
      default:
        return [
          {
            id: 'view',
            label: 'Ver Detalles',
            icon: 'eye',
            color: 'primary',
            action: () => onAction('view')
          }
        ];
    }
  };

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'send':
        return <Send className="w-4 h-4" />;
      case 'arrow-up':
        return <ArrowUp className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'message-square':
        return <MessageSquare className="w-4 h-4" />;
      case 'user-plus':
        return <UserPlus className="w-4 h-4" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'external-link':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getActionColor = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
    }
  };

  const actions = notification.quickActions.length > 0 
    ? notification.quickActions 
    : getDefaultActions();

  const handleActionClick = (action: QuickAction) => {
    action.action();
  };

  return (
    <div className={`notification-quick-actions ${className}`}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${getActionColor(action.color)}`}
            title={action.label}
          >
            {getActionIcon(action.icon)}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 