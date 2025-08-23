import React, { useState, useEffect } from 'react';
import { 
  NotificationHeader,
  NotificationList,
  NotificationDetail,
  NotificationFilters,
  NotificationPlaceholder
} from './components';
import { useNotificationFilters } from './hooks/useNotificationFilters';
import type { Notification } from './types/notification';

export const NotificationsModule: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const {
    filters,
    setSearch: updateSearch,
    setType: updateTypeFilters,
    setPriority: updatePriorityFilters,
    setCategory: updateDateFilters
  } = useNotificationFilters();

  // Simular carga de notificaciones
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        // Simular datos de notificaciones
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Nueva conversación asignada',
            description: 'Te han asignado la conversación con Ana Martínez sobre consulta de precios',
            type: 'conversation',
            priority: 'high',
            status: 'unread',
            category: 'today',
            timestamp: 'hace 10m',
            createdAt: new Date(),
            isNew: true,
            icon: 'conversation-assigned',
            tags: [
              { label: 'Ana Martínez (WhatsApp)', type: 'contact', color: 'blue' },
              { label: 'Consulta de precios', type: 'topic', color: 'green' }
            ],
            relatedTo: 'Ana Martínez (WhatsApp)',
            context: {
              originalMessage: 'Hola, quisiera conocer los precios de sus productos premium'
            },
            aiRecommendation: {
              recommendation: 'Cliente interesado en productos premium, alta probabilidad de conversión',
              confidence: 'high',
              suggestedSteps: [
                'Responder con saludo personalizado',
                'Enviar catálogo de productos premium',
                'Agendar llamada de seguimiento'
              ]
            },
            quickActions: [
              {
                id: 'template',
                label: 'Responder con Plantilla',
                icon: 'message-square',
                color: 'primary',
                action: () => {}
              },
              {
                id: 'reassign',
                label: 'Reasignar',
                icon: 'user-plus',
                color: 'secondary',
                action: () => {}
              }
            ]
          },
          {
            id: '2',
            title: 'Reunión con cliente en 30 minutos',
            description: 'Reunión de seguimiento con Industrias López programada a las 14:30',
            type: 'meeting',
            priority: 'medium',
            status: 'unread',
            category: 'today',
            timestamp: 'hace 15m',
            createdAt: new Date(Date.now() - 900000),
            isNew: true,
            icon: 'meeting-reminder',
            tags: [
              { label: 'Industrias López', type: 'contact', color: 'blue' }
            ],
            relatedTo: 'Industrias López',
            context: {
              meetingTime: '14:30'
            },
            quickActions: [
              {
                id: 'join',
                label: 'Unirse',
                icon: 'video',
                color: 'primary',
                action: () => {}
              },
              {
                id: 'reschedule',
                label: 'Reprogramar',
                icon: 'calendar',
                color: 'secondary',
                action: () => {}
              }
            ]
          },
          {
            id: '3',
            title: 'SLA de primera respuesta vencido',
            description: 'Carlos Ruiz lleva 2 horas esperando primera respuesta (SLA: 1 hora)',
            type: 'sla',
            priority: 'urgent',
            status: 'unread',
            category: 'urgent',
            timestamp: 'hace 30m',
            createdAt: new Date(Date.now() - 1800000),
            isNew: true,
            icon: 'sla-expired',
            tags: [
              { label: 'Carlos Ruiz (SMS)', type: 'contact', color: 'red' }
            ],
            relatedTo: 'Carlos Ruiz (SMS)',
            context: {
              slaExceededSince: '1 hora'
            },
            quickActions: [
              {
                id: 'respond',
                label: 'Responder Ahora',
                icon: 'message-square',
                color: 'danger',
                action: () => {}
              },
              {
                id: 'escalate',
                label: 'Escalar',
                icon: 'alert-triangle',
                color: 'secondary',
                action: () => {}
              }
            ]
          },
          {
            id: '4',
            title: 'Cliente actualizado',
            description: 'El cliente Isra ha sido actualizado con nueva información',
            type: 'conversation',
            priority: 'medium',
            status: 'read',
            category: 'today',
            timestamp: 'hace 5m',
            createdAt: new Date(Date.now() - 300000),
            isNew: false,
            icon: 'conversation-assigned',
            tags: [
              { label: 'Cliente', type: 'contact', color: 'blue' }
            ],
            relatedTo: 'Isra (WhatsApp)',
            quickActions: [
              {
                id: 'view',
                label: 'Ver cliente',
                icon: 'eye',
                color: 'primary',
                action: () => {}
              }
            ]
          },
          {
            id: '5',
            title: 'Recordatorio de actividad',
            description: 'Tienes una tarea pendiente para el cliente Isra',
            type: 'meeting',
            priority: 'high',
            status: 'read',
            category: 'actionable',
            timestamp: 'hace 1h',
            createdAt: new Date(Date.now() - 3600000),
            isNew: false,
            icon: 'meeting-reminder',
            tags: [
              { label: 'Tarea', type: 'topic', color: 'orange' }
            ],
            quickActions: [
              {
                id: 'complete',
                label: 'Completar',
                icon: 'check',
                color: 'success',
                action: () => {}
              }
            ]
          },
          {
            id: '6',
            title: 'Nueva oportunidad',
            description: 'Se ha detectado una nueva oportunidad de venta',
            type: 'alert',
            priority: 'urgent',
            status: 'unread',
            category: 'urgent',
            timestamp: 'hace 30m',
            createdAt: new Date(Date.now() - 1800000),
            isNew: true,
            icon: 'urgent',
            tags: [
              { label: 'Venta', type: 'topic', color: 'green' }
            ],
            quickActions: [
              {
                id: 'view',
                label: 'Ver oportunidad',
                icon: 'eye',
                color: 'primary',
                action: () => {}
              }
            ]
          },
          {
            id: '7',
            title: 'Alerta de sistema',
            description: 'Se ha detectado un problema con la conexión de WhatsApp',
            type: 'system',
            priority: 'high',
            status: 'unread',
            category: 'actionable',
            timestamp: 'hace 45m',
            createdAt: new Date(Date.now() - 2700000),
            isNew: true,
            icon: 'system-alert',
            tags: [
              { label: 'Sistema', type: 'topic', color: 'red' }
            ],
            quickActions: [
              {
                id: 'check',
                label: 'Verificar',
                icon: 'activity',
                color: 'primary',
                action: () => {}
              }
            ]
          },
          {
            id: '8',
            title: 'Riesgo de churn detectado',
            description: 'El cliente María González no ha tenido actividad en 7 días',
            type: 'churn',
            priority: 'high',
            status: 'unread',
            category: 'actionable',
            timestamp: 'hace 1h',
            createdAt: new Date(Date.now() - 3600000),
            isNew: true,
            icon: 'churn-risk',
            tags: [
              { label: 'María González', type: 'contact', color: 'orange' }
            ],
            relatedTo: 'María González',
            quickActions: [
              {
                id: 'contact',
                label: 'Contactar',
                icon: 'phone',
                color: 'primary',
                action: () => {}
              },
              {
                id: 'offer',
                label: 'Oferta especial',
                icon: 'gift',
                color: 'secondary',
                action: () => {}
              }
            ]
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleNotificationSelect = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'read' as const }
          : notif
      )
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const handleSearch = (searchTerm: string) => {
    updateSearch(searchTerm);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleRefresh = () => {
    // Recargar notificaciones
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Panel izquierdo - Lista de notificaciones */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <NotificationHeader
          title="Centro de Notificaciones"
          subtitle="Gestiona todas tus notificaciones desde un solo lugar"
          onSearch={handleSearch}
          onFilters={handleToggleFilters}
          onMarkAllRead={() => {
            setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
          }}
          onPause={() => {}}
          onSettings={() => {}}
          onExport={() => {}}
          onRefresh={handleRefresh}
          stats={{
            total: notifications.length,
            new: notifications.filter(n => n.isNew).length,
            unread: notifications.filter(n => n.status === 'unread').length,
            actionable: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
            urgent: notifications.filter(n => n.priority === 'urgent').length
          }}
          currentCategory="today"
          onCategoryChange={() => {}}
        />

        {/* Panel de filtros */}
        {showFilters && (
          <NotificationFilters
            filters={filters}
            stats={{
              today: notifications.filter(n => {
                const today = new Date();
                const notifDate = new Date(n.createdAt);
                return notifDate.toDateString() === today.toDateString();
              }).length,
              unread: notifications.filter(n => n.status === 'unread').length,
              actionable: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
              urgent: notifications.filter(n => n.priority === 'urgent').length
            }}
            onCategoryChange={updateDateFilters}
            onPriorityChange={updatePriorityFilters}
            onTypeChange={updateTypeFilters}
          />
        )}

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <NotificationPlaceholder
              title="No hay notificaciones"
              description="No tienes notificaciones pendientes en este momento"
            />
          ) : (
            <NotificationList
              notifications={notifications}
              selectedNotification={selectedNotification}
              stats={{
                total: notifications.length,
                new: notifications.filter(n => n.isNew).length,
                unread: notifications.filter(n => n.status === 'unread').length,
                actionable: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length,
                urgent: notifications.filter(n => n.priority === 'urgent').length
              }}
              loading={loading}
              onSelectNotification={handleNotificationSelect}
              onQuickAction={() => {}}
              onCategoryChange={() => {}}
              onSelectAll={() => {}}
              filters={filters}
            />
          )}
        </div>
      </div>

      {/* Panel derecho - Detalles de la notificación */}
      {selectedNotification && (
        <div className="w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col h-full">
          <NotificationDetail
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onMarkAsRead={() => handleMarkAsRead(selectedNotification.id)}
            onDelete={() => handleDeleteNotification(selectedNotification.id)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsModule;
