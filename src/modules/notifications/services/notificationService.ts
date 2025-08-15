import type { Notification, NotificationFilters, NotificationStats } from '../types/notification';
import { 
  mockNotifications, 
  notificationStats, 
  generateMockNotification,
  generateMockNotifications,
  notificationSimulator,
  filterNotifications,
  calculateStats,
  updateNotificationTimestamps
} from './mockNotificationData';

// Servicio de notificaciones - Preparado para integración con backend
export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = mockNotifications;
  private stats: NotificationStats = notificationStats;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Obtener todas las notificaciones
  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    // TODO: Implementar llamada a API cuando esté disponible
    // const response = await fetch('/api/notifications', {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(filters)
    // });
    // return response.json();

    // Por ahora, usar datos mock
    let filteredNotifications = [...this.notifications];

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.category === filters.category);
      }
      if (filters.priority && filters.priority !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
      }
      if (filters.type && filters.type !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredNotifications = filteredNotifications.filter(n =>
          n.title.toLowerCase().includes(searchLower) ||
          n.description.toLowerCase().includes(searchLower) ||
          n.tags.some(tag => tag.label.toLowerCase().includes(searchLower))
        );
      }
    }

    return filteredNotifications;
  }

  // Obtener estadísticas
  async getStats(): Promise<NotificationStats> {
    // TODO: Implementar llamada a API cuando esté disponible
    // const response = await fetch('/api/notifications/stats');
    // return response.json();

    return this.stats;
  }

  // Obtener notificación por ID
  async getNotificationById(id: string): Promise<Notification | null> {
    // TODO: Implementar llamada a API cuando esté disponible
    // const response = await fetch(`/api/notifications/${id}`);
    // return response.json();

    return this.notifications.find(n => n.id === id) || null;
  }

  // Marcar notificación como leída
  async markAsRead(id: string): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });

    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'read';
      notification.isNew = false;
    }
  }

  // Marcar notificación como no leída
  async markAsUnread(id: string): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch(`/api/notifications/${id}/unread`, { method: 'PUT' });

    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'unread';
      notification.isNew = true;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch('/api/notifications/read-all', { method: 'PUT' });

    this.notifications.forEach(n => {
      n.status = 'read';
      n.isNew = false;
    });
  }

  // Archivar notificación
  async archiveNotification(id: string): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch(`/api/notifications/${id}/archive`, { method: 'PUT' });

    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'archived';
    }
  }

  // Eliminar notificación
  async deleteNotification(id: string): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });

    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // Pausar notificaciones
  async pauseNotifications(): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch('/api/notifications/pause', { method: 'PUT' });

    console.log('Notificaciones pausadas');
  }

  // Reanudar notificaciones
  async resumeNotifications(): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch('/api/notifications/resume', { method: 'PUT' });

    console.log('Notificaciones reanudadas');
  }

  // Suscribirse a notificaciones en tiempo real (WebSocket)
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    // TODO: Implementar WebSocket cuando esté disponible
    // const ws = new WebSocket('ws://localhost:3000/notifications');
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   callback(notification);
    // };
    // return () => ws.close();

    // Por ahora, usar el simulador
    return notificationSimulator.subscribe(callback);
  }

  // Generar notificación de ejemplo
  generateExampleNotification(overrides: Partial<Notification> = {}): Notification {
    return generateMockNotification(overrides);
  }

  // Generar múltiples notificaciones de ejemplo
  generateExampleNotifications(count: number, options: {
    type?: Notification['type'];
    priority?: Notification['priority'];
    status?: Notification['status'];
    category?: Notification['category'];
    isNew?: boolean;
  } = {}): Notification[] {
    return generateMockNotifications(count, options);
  }

  // Iniciar simulación de notificaciones en tiempo real
  startNotificationSimulation(intervalMs: number = 30000): void {
    notificationSimulator.startSimulation(intervalMs);
  }

  // Detener simulación de notificaciones
  stopNotificationSimulation(): void {
    notificationSimulator.stopSimulation();
  }

  // Filtrar notificaciones usando utilidades
  filterNotificationsByCriteria(notifications: Notification[], filters: NotificationFilters): Notification[] {
    return filterNotifications(notifications, filters);
  }

  // Calcular estadísticas dinámicamente
  calculateNotificationStats(notifications: Notification[]): NotificationStats {
    return calculateStats(notifications);
  }

  // Actualizar timestamps de notificaciones
  updateNotificationTimestamps(notifications: Notification[]): Notification[] {
    return updateNotificationTimestamps(notifications);
  }

  // Ejecutar acción rápida
  async executeQuickAction(notificationId: string, actionId: string): Promise<void> {
    // TODO: Implementar llamada a API cuando esté disponible
    // await fetch(`/api/notifications/${notificationId}/actions/${actionId}`, {
    //   method: 'POST'
    // });

    const notification = this.notifications.find(n => n.id === notificationId);
    const action = notification?.quickActions.find(a => a.id === actionId);
    if (action) {
      action.action();
    }
  }
}

export const notificationService = NotificationService.getInstance(); 