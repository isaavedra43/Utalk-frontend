import type { Notification, NotificationStats, NotificationFilters } from '../types/notification';

// Datos de muestra para diferentes escenarios de filtros
export const getFilteredNotifications = (filters: NotificationFilters): Notification[] => {
  const allNotifications = mockNotifications;
  
  let filtered = [...allNotifications];
  
  // Filtrar por categoría
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(n => n.category === filters.category);
  }
  
  // Filtrar por prioridad
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(n => n.priority === filters.priority);
  }
  
  // Filtrar por tipo
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(n => n.type === filters.type);
  }
  
  // Filtrar por búsqueda
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(searchLower) ||
      n.description.toLowerCase().includes(searchLower) ||
      n.tags.some(tag => tag.label.toLowerCase().includes(searchLower))
    );
  }
  
  return filtered;
};

// Datos de muestra para notificaciones urgentes
export const urgentNotifications: Notification[] = [
  {
    id: 'urgent-1',
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
    id: 'urgent-2',
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
  }
];

// Datos de muestra para notificaciones no leídas
export const unreadNotifications: Notification[] = [
  {
    id: 'unread-1',
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
    id: 'unread-2',
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
    id: 'unread-3',
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
    id: 'unread-4',
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
  }
];

// Datos de muestra para notificaciones accionables
export const actionableNotifications: Notification[] = [
  {
    id: 'actionable-1',
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
    id: 'actionable-2',
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
    id: 'actionable-3',
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
  }
];

// Estadísticas específicas para cada filtro
export const getStatsForFilter = (filter: string): NotificationStats => {
  switch (filter) {
    case 'today':
      return {
        total: 8,
        new: 4,
        unread: 4,
        actionable: 3,
        urgent: 2
      };
    case 'unread':
      return {
        total: 4,
        new: 4,
        unread: 4,
        actionable: 2,
        urgent: 2
      };
    case 'actionable':
      return {
        total: 3,
        new: 2,
        unread: 2,
        actionable: 3,
        urgent: 0
      };
    case 'urgent':
      return {
        total: 2,
        new: 2,
        unread: 2,
        actionable: 0,
        urgent: 2
      };
    default:
      return {
        total: 8,
        new: 4,
        unread: 4,
        actionable: 3,
        urgent: 2
      };
  }
};

// Importar las notificaciones principales
import { mockNotifications } from './mockNotificationData'; 