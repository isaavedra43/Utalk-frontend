import type { Notification, NotificationStats, NotificationFilters } from '../types/notification';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva conversación asignada',
    description: 'Te han asignado la conversación con Ana Martínez sobre consulta de precios',
    type: 'conversation',
    priority: 'high',
    status: 'unread',
    category: 'today',
    timestamp: 'hace 15m',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    isNew: true,
    icon: 'conversation-assigned',
    tags: [
      { label: 'Ana Martínez (WhatsApp)', type: 'contact', color: 'grey' },
      { label: 'Consulta de precios', type: 'topic', color: 'grey' }
    ],
    relatedTo: 'Ana Martínez (WhatsApp)',
    context: {
      originalMessage: 'Hola, quisiera conocer los precios de sus productos premium'
    },
    aiRecommendation: {
      recommendation: 'Cliente interesado en productos premium, alta probabilidad de conversión',
      confidence: 'high',
      suggestedSteps: [
        'Responder con catálogo de productos premium',
        'Ofrecer descuento por primera compra',
        'Programar seguimiento en 24h'
      ]
    },
    quickActions: [
      {
        id: 'reply-template',
        label: 'Responder con Plantilla',
        icon: 'arrow-right',
        color: 'primary',
        action: () => console.log('Responder con plantilla')
      },
      {
        id: 'reassign',
        label: 'Reasignar',
        icon: 'arrow-right',
        color: 'secondary',
        action: () => console.log('Reasignar')
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
    id: '2',
    title: 'Reunión con cliente en 30 minutos',
    description: 'Reunión de seguimiento con Industrias López programada a las 14:30',
    type: 'meeting',
    priority: 'medium',
    status: 'unread',
    category: 'today',
    timestamp: 'hace 20m',
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    isNew: true,
    icon: 'meeting-reminder',
    tags: [
      { label: 'Industrias López', type: 'contact', color: 'grey' }
    ],
    context: {
      meetingTime: '14:30',
      clientName: 'Industrias López'
    },
    aiRecommendation: {
      recommendation: 'Basado en el contexto y historial, recomiendo acción inmediata',
      confidence: 'medium',
      suggestedSteps: [
        'Revisar el contexto completo',
        'Contactar al cliente directamente',
        'Documentar la resolución'
      ]
    },
    quickActions: [
      {
        id: 'reschedule',
        label: 'Reprogramar',
        icon: 'calendar',
        color: 'secondary',
        action: () => console.log('Reprogramar')
      }
    ],
    relatedLinks: [
      {
        id: 'open-chat',
        label: 'Abrir en Chat',
        icon: 'chat-bubble',
        action: () => console.log('Abrir chat')
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
    timestamp: 'hace 35m',
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
    isNew: true,
    icon: 'sla-expired',
    tags: [
      { label: 'Carlos Ruiz (SMS)', type: 'contact', color: 'grey' },
      { label: 'Urgente', type: 'priority', color: 'red' }
    ],
    context: {
      slaExceededSince: 'hace 2h'
    },
    aiRecommendation: {
      recommendation: 'Cliente con historial de quejas, requiere atención prioritaria',
      confidence: 'high',
      suggestedSteps: [
        'Disculparse por el retraso',
        'Asignar agente senior',
        'Ofrecer compensación'
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
    id: '4',
    title: 'Alto riesgo de churn detectado',
    description: 'Elena Vásquez muestra señales de abandono: 3 días sin actividad',
    type: 'churn',
    priority: 'urgent',
    status: 'unread',
    category: 'urgent',
    timestamp: 'hace 49m',
    createdAt: new Date(Date.now() - 49 * 60 * 1000),
    isNew: true,
    icon: 'churn-risk',
    tags: [
      { label: 'Urgente', type: 'priority', color: 'red' }
    ],
    aiRecommendation: {
      recommendation: 'Cliente en riesgo de abandono, requiere contacto inmediato',
      confidence: 'high',
      suggestedSteps: [
        'Contactar por múltiples canales',
        'Ofrecer incentivo de retención',
        'Programar llamada de seguimiento'
      ]
    },
    quickActions: [
      {
        id: 'contact-now',
        label: 'Contactar Ahora',
        icon: 'phone',
        color: 'danger',
        action: () => console.log('Contactar ahora')
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
    id: '5',
    title: 'Nueva conversación asignada',
    description: 'Te han asignado la conversación con María González sobre soporte técnico',
    type: 'conversation',
    priority: 'medium',
    status: 'unread',
    category: 'today',
    timestamp: 'hace 1h',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    isNew: true,
    icon: 'conversation-assigned',
    tags: [
      { label: 'María González (Email)', type: 'contact', color: 'grey' },
      { label: 'Soporte técnico', type: 'topic', color: 'grey' }
    ],
    quickActions: [
      {
        id: 'reply-template',
        label: 'Responder con Plantilla',
        icon: 'arrow-right',
        color: 'primary',
        action: () => console.log('Responder con plantilla')
      }
    ]
  },
  {
    id: '6',
    title: 'Nueva conversación asignada',
    description: 'Te han asignado la conversación con María González sobre soporte técnico',
    type: 'conversation',
    priority: 'medium',
    status: 'unread',
    category: 'today',
    timestamp: 'hace 1h',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    isNew: true,
    icon: 'conversation-assigned',
    tags: [
      { label: 'María González (Email)', type: 'contact', color: 'grey' },
      { label: 'Soporte técnico', type: 'topic', color: 'grey' }
    ],
    quickActions: [
      {
        id: 'reply-template',
        label: 'Responder con Plantilla',
        icon: 'arrow-right',
        color: 'primary',
        action: () => console.log('Responder con plantilla')
      }
    ]
  },
  {
    id: '6',
    title: 'Recordatorio de seguimiento',
    description: 'Seguimiento pendiente con Cliente Premium desde hace 2 días',
    type: 'system',
    priority: 'medium',
    status: 'read',
    category: 'actionable',
    timestamp: 'hace 2h',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isNew: false,
    icon: 'system-alert',
    tags: [
      { label: 'Cliente Premium', type: 'contact', color: 'grey' }
    ],
    quickActions: [
      {
        id: 'schedule-followup',
        label: 'Programar Seguimiento',
        icon: 'calendar',
        color: 'primary',
        action: () => console.log('Programar seguimiento')
      }
    ]
  },
  {
    id: '7',
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
    id: '8',
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
];

export const notificationStats: NotificationStats = {
  total: 8,
  new: 4,
  unread: 4,
  actionable: 3,
  urgent: 2
};

// Funciones de utilidad para generar datos
export const generateMockNotification = (overrides: Partial<Notification> = {}): Notification => {
  const baseNotification: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Notificación de ejemplo',
    description: 'Esta es una notificación de ejemplo generada dinámicamente',
    type: 'conversation',
    priority: 'medium',
    status: 'unread',
    category: 'today',
    timestamp: 'hace 1m',
    createdAt: new Date(),
    isNew: true,
    icon: 'conversation-assigned',
    tags: [
      { label: 'Ejemplo', type: 'topic', color: 'grey' }
    ],
    quickActions: [
      { id: 'action-1', label: 'Acción 1', icon: 'arrow-right', color: 'primary', action: () => console.log('Acción 1') }
    ],
    relatedLinks: [
      { id: 'link-1', label: 'Enlace 1', icon: 'link', action: () => console.log('Enlace 1') }
    ]
  };

  return { ...baseNotification, ...overrides };
};

export const generateMockNotifications = (count: number, options: {
  type?: Notification['type'];
  priority?: Notification['priority'];
  status?: Notification['status'];
  category?: Notification['category'];
  isNew?: boolean;
} = {}): Notification[] => {
  const notifications: Notification[] = [];
  
  for (let i = 0; i < count; i++) {
    const notification = generateMockNotification({
      id: `generated-${i + 1}`,
      title: `Notificación generada ${i + 1}`,
      description: `Descripción de la notificación generada ${i + 1}`,
      timestamp: `hace ${i + 1}m`,
      createdAt: new Date(Date.now() - (i + 1) * 60 * 1000),
      ...options
    });
    
    notifications.push(notification);
  }
  
  return notifications;
};

// Simulación de actualizaciones en tiempo real
export class MockNotificationSimulator {
  private static instance: MockNotificationSimulator;
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Array<(notification: Notification) => void> = [];

  private constructor() {}

  public static getInstance(): MockNotificationSimulator {
    if (!MockNotificationSimulator.instance) {
      MockNotificationSimulator.instance = new MockNotificationSimulator();
    }
    return MockNotificationSimulator.instance;
  }

  // Iniciar simulación de notificaciones en tiempo real
  public startSimulation(intervalMs: number = 30000): void {
    if (this.intervalId) {
      this.stopSimulation();
    }

    this.intervalId = setInterval(() => {
      const newNotification = this.generateRandomNotification();
      this.notifySubscribers(newNotification);
    }, intervalMs);

    console.log(`Simulación de notificaciones iniciada (intervalo: ${intervalMs}ms)`);
  }

  // Detener simulación
  public stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Simulación de notificaciones detenida');
    }
  }

  // Suscribirse a nuevas notificaciones
  public subscribe(callback: (notification: Notification) => void): () => void {
    this.subscribers.push(callback);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Notificar a todos los suscriptores
  private notifySubscribers(notification: Notification): void {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error en callback de notificación:', error);
      }
    });
  }

  // Generar notificación aleatoria
  private generateRandomNotification(): Notification {
    const types: Notification['type'][] = ['conversation', 'meeting', 'sla', 'churn', 'system', 'alert'];
    const priorities: Notification['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const contacts = ['Ana Martínez', 'Carlos Ruiz', 'María González', 'Juan Pérez', 'Laura Silva'];
    const topics = ['Consulta de precios', 'Soporte técnico', 'Facturación', 'Reclamo', 'Sugerencia'];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    return generateMockNotification({
      title: `Nueva ${randomType} - ${randomContact}`,
      description: `${randomContact} ha iniciado una ${randomType} sobre ${randomTopic}`,
      type: randomType,
      priority: randomPriority,
      timestamp: 'hace 1m',
      createdAt: new Date(),
      tags: [
        { label: `${randomContact} (WhatsApp)`, type: 'contact', color: 'grey' },
        { label: randomTopic, type: 'topic', color: 'grey' }
      ],
      relatedTo: `${randomContact} (WhatsApp)`,
      context: {
        originalMessage: `Hola, necesito ayuda con ${randomTopic.toLowerCase()}`
      },
      aiRecommendation: {
        recommendation: `Cliente interesado en ${randomTopic.toLowerCase()}, requiere atención`,
        confidence: 'medium',
        suggestedSteps: [
          'Responder con información relevante',
          'Ofrecer asistencia personalizada',
          'Programar seguimiento'
        ]
      },
      quickActions: [
        { id: 'reply', label: 'Responder', icon: 'arrow-right', color: 'primary', action: () => console.log('Responder') },
        { id: 'assign', label: 'Asignar', icon: 'person', color: 'secondary', action: () => console.log('Asignar') }
      ],
      relatedLinks: [
        { id: 'open-chat', label: 'Abrir en Chat', icon: 'chat-bubble', action: () => console.log('Abrir chat') },
        { id: 'view-profile', label: 'Ver Perfil', icon: 'person', action: () => console.log('Ver perfil') }
      ]
    });
  }

  // Generar notificación específica
  public generateSpecificNotification(): Notification {
    return this.generateRandomNotification();
  }

  // Simular múltiples notificaciones
  public simulateBulkNotifications(count: number): Notification[] {
    return generateMockNotifications(count);
  }
}

// Instancia global del simulador
export const notificationSimulator = MockNotificationSimulator.getInstance();

// Funciones de utilidad para filtros
export const filterNotifications = (notifications: Notification[], filters: NotificationFilters): Notification[] => {
  return notifications.filter(notification => {
    // Filtro por categoría
    if (filters.category !== 'all') {
      if (filters.category === 'today' && notification.category !== 'today') return false;
      if (filters.category === 'unread' && notification.status !== 'unread') return false;
      if (filters.category === 'actionable' && notification.quickActions.length === 0) return false;
      if (filters.category === 'urgent' && notification.priority !== 'urgent') return false;
    }
    
    // Filtro por prioridad
    if (filters.priority !== 'all' && notification.priority !== filters.priority) {
      return false;
    }
    
    // Filtro por tipo
    if (filters.type !== 'all' && notification.type !== filters.type) {
      return false;
    }
    
    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(searchLower);
      const matchesDescription = notification.description.toLowerCase().includes(searchLower);
      const matchesTags = notification.tags.some(tag => 
        tag.label.toLowerCase().includes(searchLower)
      );
      const matchesRelatedTo = notification.relatedTo?.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription && !matchesTags && !matchesRelatedTo) {
        return false;
      }
    }
    
    return true;
  });
};

// Calcular estadísticas dinámicamente
export const calculateStats = (notifications: Notification[]): NotificationStats => {
  const total = notifications.length;
  const newCount = notifications.filter(n => n.isNew).length;
  const unread = notifications.filter(n => n.status === 'unread').length;
  const actionable = notifications.filter(n => n.quickActions.length > 0).length;
  const urgent = notifications.filter(n => n.priority === 'urgent').length;

  return {
    total,
    new: newCount,
    unread,
    actionable,
    urgent
  };
};

// Función para actualizar timestamp dinámicamente
export const updateNotificationTimestamps = (notifications: Notification[]): Notification[] => {
  const now = Date.now();
  
  return notifications.map(notification => {
    const timeDiff = now - notification.createdAt.getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    let timestamp: string;
    if (minutes < 60) {
      timestamp = `hace ${minutes}m`;
    } else if (hours < 24) {
      timestamp = `hace ${hours}h`;
    } else {
      timestamp = `hace ${days}d`;
    }

    return {
      ...notification,
      timestamp
    };
  });
}; 