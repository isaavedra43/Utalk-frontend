import React, { useState, useEffect } from 'react';
import { 
  NotificationHeader,
  NotificationList,
  NotificationDetail,
  NotificationFilters,
  NotificationSearch,
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
            title: 'Cliente actualizado',
            description: 'El cliente Isra ha sido actualizado con nueva información',
            type: 'conversation',
            priority: 'medium',
            status: 'unread',
            category: 'today',
            timestamp: 'hace 5m',
            createdAt: new Date(),
            isNew: true,
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
            id: '2',
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
            id: '3',
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <NotificationHeader
        title="Notificaciones"
        subtitle={`${notifications.length} notificaciones totales`}
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

      {/* Contenido principal */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Lista de notificaciones */}
        <div className={`flex-1 ${selectedNotification ? 'mr-80' : ''}`}>
          <div className="h-full flex flex-col">
            {/* Barra de búsqueda */}
            <div className="p-4 bg-white border-b border-gray-200">
              <NotificationSearch
                searchValue={filters.search || ''}
                onSearchChange={handleSearch}
                onFiltersChange={() => {}}
              />
            </div>

            {/* Lista */}
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
        </div>

        {/* Panel de detalles */}
        {selectedNotification && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col h-full">
            <NotificationDetail
              notification={selectedNotification}
              onClose={() => setSelectedNotification(null)}
              onMarkAsRead={() => handleMarkAsRead(selectedNotification.id)}
              onDelete={() => handleDeleteNotification(selectedNotification.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModule;
