import type { Notification, NotificationStats } from '../types/notification';

// Datos de prueba para escenarios específicos
export const testNotifications: Record<string, Notification[]> = {
  // Escenario: Notificaciones vacías
  empty: [],
  
  // Escenario: Solo notificaciones leídas
  readOnly: [
    {
      id: 'read-1',
      title: 'Métricas de rendimiento',
      description: 'Tu rendimiento semanal ha mejorado un 15% respecto a la semana anterior',
      type: 'system',
      priority: 'low',
      status: 'read',
      category: 'today',
      timestamp: 'hace 3h',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isNew: false,
      icon: 'system-alert',
      tags: [
        { label: 'Métricas', type: 'topic', color: 'green' }
      ],
      quickActions: [
        {
          id: 'view-report',
          label: 'Ver Reporte',
          icon: 'chart',
          color: 'primary',
          action: () => console.log('Ver reporte')
        }
      ]
    },
    {
      id: 'read-2',
      title: 'Actualización del sistema',
      description: 'Nueva funcionalidad disponible: Respuestas automáticas inteligentes',
      type: 'system',
      priority: 'low',
      status: 'read',
      category: 'today',
      timestamp: 'hace 4h',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isNew: false,
      icon: 'system-alert',
      tags: [
        { label: 'Actualización', type: 'topic', color: 'blue' }
      ],
      quickActions: [
        {
          id: 'learn-more',
          label: 'Conocer Más',
          icon: 'info',
          color: 'primary',
          action: () => console.log('Conocer más')
        }
      ]
    }
  ],
  
  // Escenario: Solo notificaciones urgentes
  urgentOnly: [
    {
      id: 'urgent-test-1',
      title: 'SLA crítico vencido',
      description: 'Cliente VIP esperando respuesta desde hace 4 horas (SLA: 30 min)',
      type: 'sla',
      priority: 'urgent',
      status: 'unread',
      category: 'urgent',
      timestamp: 'hace 5m',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      isNew: true,
      icon: 'sla-expired',
      tags: [
        { label: 'Cliente VIP', type: 'contact', color: 'grey' },
        { label: 'Urgente', type: 'priority', color: 'red' }
      ],
      context: {
        slaExceededSince: 'hace 4h'
      },
      aiRecommendation: {
        recommendation: 'Cliente VIP con SLA crítico vencido, requiere atención inmediata',
        confidence: 'high',
        suggestedSteps: [
          'Contactar inmediatamente',
          'Ofrecer compensación VIP',
          'Asignar supervisor'
        ]
      },
      quickActions: [
        {
          id: 'respond-now',
          label: 'Responder Ahora',
          icon: 'arrow-right',
          color: 'danger',
          action: () => console.log('Responder ahora')
        },
        {
          id: 'escalate',
          label: 'Escalar',
          icon: 'arrow-up',
          color: 'secondary',
          action: () => console.log('Escalar')
        }
      ],
      relatedLinks: [
        {
          id: 'open-chat',
          label: 'Abrir en Chat',
          icon: 'chat-bubble',
          action: () => console.log('Abrir chat')
        },
        {
          id: 'view-profile',
          label: 'Ver Perfil del Cliente',
          icon: 'person',
          action: () => console.log('Ver perfil')
        }
      ]
    },
    {
      id: 'urgent-test-2',
      title: 'Sistema caído',
      description: 'El sistema de chat está experimentando interrupciones',
      type: 'system',
      priority: 'urgent',
      status: 'unread',
      category: 'urgent',
      timestamp: 'hace 10m',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      isNew: true,
      icon: 'system-alert',
      tags: [
        { label: 'Urgente', type: 'priority', color: 'red' },
        { label: 'Sistema', type: 'topic', color: 'red' }
      ],
      aiRecommendation: {
        recommendation: 'Sistema crítico caído, notificar a todos los agentes',
        confidence: 'high',
        suggestedSteps: [
          'Notificar a todos los agentes',
          'Activar modo offline',
          'Contactar al equipo técnico'
        ]
      },
      quickActions: [
        {
          id: 'notify-team',
          label: 'Notificar Equipo',
          icon: 'bell',
          color: 'danger',
          action: () => console.log('Notificar equipo')
        }
      ]
    }
  ],
  
  // Escenario: Muchas notificaciones
  many: Array.from({ length: 25 }, (_, i) => ({
    id: `many-${i + 1}`,
    title: `Notificación de prueba ${i + 1}`,
    description: `Esta es la descripción de la notificación número ${i + 1}`,
    type: ['conversation', 'meeting', 'sla', 'churn', 'system'][i % 5] as Notification['type'],
    priority: ['low', 'medium', 'high', 'urgent'][i % 4] as Notification['priority'],
    status: ['unread', 'read'][i % 2] as Notification['status'],
    category: ['today', 'unread', 'actionable', 'urgent'][i % 4] as Notification['category'],
    timestamp: `hace ${i + 1}m`,
    createdAt: new Date(Date.now() - (i + 1) * 60 * 1000),
    isNew: i < 5,
    icon: 'conversation-assigned',
    tags: [
      { label: `Tag ${i + 1}`, type: 'contact', color: 'grey' }
    ],
    quickActions: [
      {
        id: `action-${i + 1}`,
        label: `Acción ${i + 1}`,
        icon: 'arrow-right',
        color: 'primary',
        action: () => console.log(`Acción ${i + 1}`)
      }
    ]
  }))
};

// Estadísticas de prueba para diferentes escenarios
export const testStats: Record<string, NotificationStats> = {
  empty: {
    total: 0,
    new: 0,
    unread: 0,
    actionable: 0,
    urgent: 0
  },
  readOnly: {
    total: 2,
    new: 0,
    unread: 0,
    actionable: 0,
    urgent: 0
  },
  urgentOnly: {
    total: 2,
    new: 2,
    unread: 2,
    actionable: 0,
    urgent: 2
  },
  many: {
    total: 25,
    new: 5,
    unread: 13,
    actionable: 6,
    urgent: 6
  }
};

// Función para generar datos de prueba dinámicos
export const generateTestNotifications = (count: number, options?: {
  priority?: Notification['priority'];
  type?: Notification['type'];
  status?: Notification['status'];
}): Notification[] => {
  const notifications: Notification[] = [];
  
  for (let i = 0; i < count; i++) {
    const priority = options?.priority || ['low', 'medium', 'high', 'urgent'][i % 4] as Notification['priority'];
    const type = options?.type || ['conversation', 'meeting', 'sla', 'churn', 'system'][i % 5] as Notification['type'];
    const status = options?.status || ['unread', 'read'][i % 2] as Notification['status'];
    
    notifications.push({
      id: `generated-${i + 1}`,
      title: `Notificación generada ${i + 1}`,
      description: `Descripción de la notificación generada número ${i + 1}`,
      type,
      priority,
      status,
      category: 'today',
      timestamp: `hace ${i + 1}m`,
      createdAt: new Date(Date.now() - (i + 1) * 60 * 1000),
      isNew: i < Math.floor(count / 4),
      icon: 'conversation-assigned',
      tags: [
        { label: `Generado ${i + 1}`, type: 'contact', color: 'grey' }
      ],
      quickActions: [
        {
          id: `generated-action-${i + 1}`,
          label: `Acción ${i + 1}`,
          icon: 'arrow-right',
          color: 'primary',
          action: () => console.log(`Acción generada ${i + 1}`)
        }
      ]
    });
  }
  
  return notifications;
};

// Función para generar estadísticas dinámicas
export const generateTestStats = (notifications: Notification[]): NotificationStats => {
  const total = notifications.length;
  const newCount = notifications.filter(n => n.isNew).length;
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const actionableCount = notifications.filter(n => n.quickActions.length > 0).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;
  
  return {
    total,
    new: newCount,
    unread: unreadCount,
    actionable: actionableCount,
    urgent: urgentCount
  };
}; 