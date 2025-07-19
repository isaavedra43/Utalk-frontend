// 🧪 DATOS MOCK - Módulo de Campañas
// Datos de prueba para desarrollo y testing

import type { Campaign, CampaignTemplate, SelectedContact } from '../types'

/**
 * 🎯 CAMPAÑAS MOCK
 */
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp_001',
    name: 'Promoción Black Friday 2024',
    status: 'sending',
    type: 'mixed',
    channels: ['whatsapp', 'sms'],
    message: {
      content: 'Hola {{nombre}}, ¡No te pierdas nuestro Black Friday! Descuentos de hasta 70% en toda la tienda. Válido hasta {{fecha_limite}}. ¡Compra ahora!',
      variables: [
        {
          id: 'var_001',
          name: '{{nombre}}',
          label: 'Nombre del contacto',
          type: 'text',
          defaultValue: 'Cliente',
          required: true,
          description: 'Nombre personalizado del contacto'
        },
        {
          id: 'var_002',
          name: '{{fecha_limite}}',
          label: 'Fecha límite',
          type: 'date',
          defaultValue: '30 de noviembre',
          required: true,
          description: 'Fecha de vencimiento de la promoción'
        }
      ],
      attachments: [
        {
          id: 'att_001',
          name: 'catalogo_blackfriday.pdf',
          url: 'https://example.com/catalogs/bf2024.pdf',
          type: 'document',
          size: 2048000,
          mimeType: 'application/pdf'
        }
      ],
      callToActions: [
        {
          id: 'cta_001',
          type: 'url',
          text: 'Ver Ofertas',
          value: 'https://tienda.com/black-friday',
          trackClicks: true
        },
        {
          id: 'cta_002',
          type: 'phone',
          text: 'Llamar Ahora',
          value: '+525512345678',
          trackClicks: true
        }
      ],
      whatsapp: {
        templateId: 'template_bf_001',
        templateName: 'black_friday_promo',
        useTemplate: true
      },
      sms: {
        maxLength: 160,
        estimatedParts: 2
      }
    },
    contacts: [],
    totalRecipients: 15420,
    scheduledAt: new Date('2024-11-25T08:00:00Z'),
    sendImmediately: false,
    timezone: 'America/Mexico_City',
    settings: {
      retrySettings: {
        enabled: true,
        maxRetries: 3,
        retryInterval: 30,
        retryOnErrors: ['UNDELIVERED', 'FAILED']
      },
      rateLimit: {
        messagesPerMinute: 100,
        messagesPerHour: 5000
      },
      fallbackChannels: {
        enabled: true,
        whatsappToSms: true,
        smsToWhatsapp: false,
        fallbackDelay: 15
      },
      tracking: {
        deliveryReceipts: true,
        readReceipts: true,
        clickTracking: true,
        replyTracking: true
      },
      compliance: {
        respectOptOut: true,
        respectBlacklist: true,
        respectQuietHours: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      }
    },
    stats: {
      total: 15420,
      pending: 2800,
      sent: 12620,
      delivered: 11850,
      read: 8900,
      replied: 1200,
      failed: 770,
      deliveryRate: 93.9,
      readRate: 75.1,
      replyRate: 13.5,
      failureRate: 6.1,
      whatsappStats: {
        total: 10000,
        sent: 8200,
        delivered: 7800,
        read: 6200,
        replied: 800,
        failed: 400,
        cost: 820.00
      },
      smsStats: {
        total: 5420,
        sent: 4420,
        delivered: 4050,
        read: 2700,
        replied: 400,
        failed: 370,
        cost: 542.00
      },
      averageDeliveryTime: 12,
      averageReadTime: 45,
      estimatedCost: 1362.00,
      actualCost: 1362.00,
      currency: 'MXN',
      progress: {
        percentage: 81.8,
        startedAt: new Date('2024-11-25T08:00:00Z'),
        estimatedCompletion: new Date('2024-11-25T14:30:00Z')
      }
    },
    tags: ['black-friday', 'promocion', 'descuentos'],
    createdBy: 'user_001',
    createdAt: new Date('2024-11-20T10:30:00Z'),
    updatedAt: new Date('2024-11-25T08:15:00Z'),
    sentAt: new Date('2024-11-25T08:00:00Z'),
    metadata: {
      templateId: 'template_bf_001',
      version: 2,
      notes: 'Campaña principal de Black Friday con fallback a SMS'
    }
  },
  
  {
    id: 'camp_002',
    name: 'Bienvenida Nuevos Clientes',
    status: 'completed',
    type: 'whatsapp',
    channels: ['whatsapp'],
    message: {
      content: '¡Bienvenido a nuestra familia {{nombre}}! 🎉 Gracias por unirte. Como regalo de bienvenida, tienes un 15% de descuento en tu primera compra. Usa el código: BIENVENIDO15',
      variables: [
        {
          id: 'var_003',
          name: '{{nombre}}',
          label: 'Nombre del contacto',
          type: 'text',
          defaultValue: 'Cliente',
          required: true,
          description: 'Nombre del nuevo cliente'
        }
      ],
      whatsapp: {
        useTemplate: false
      }
    },
    contacts: [],
    totalRecipients: 2840,
    sendImmediately: true,
    timezone: 'America/Mexico_City',
    settings: {
      retrySettings: {
        enabled: true,
        maxRetries: 2,
        retryInterval: 60,
        retryOnErrors: ['UNDELIVERED']
      },
      rateLimit: {
        messagesPerMinute: 50,
        messagesPerHour: 2000
      },
      fallbackChannels: {
        enabled: false,
        whatsappToSms: false,
        smsToWhatsapp: false,
        fallbackDelay: 0
      },
      tracking: {
        deliveryReceipts: true,
        readReceipts: true,
        clickTracking: false,
        replyTracking: true
      },
      compliance: {
        respectOptOut: true,
        respectBlacklist: true,
        respectQuietHours: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      }
    },
    stats: {
      total: 2840,
      pending: 0,
      sent: 2840,
      delivered: 2795,
      read: 2456,
      replied: 145,
      failed: 45,
      deliveryRate: 98.4,
      readRate: 87.9,
      replyRate: 5.9,
      failureRate: 1.6,
      whatsappStats: {
        total: 2840,
        sent: 2840,
        delivered: 2795,
        read: 2456,
        replied: 145,
        failed: 45,
        cost: 284.00
      },
      estimatedCost: 284.00,
      actualCost: 284.00,
      currency: 'MXN',
      progress: {
        percentage: 100,
        startedAt: new Date('2024-11-20T09:00:00Z'),
        estimatedCompletion: new Date('2024-11-20T11:30:00Z')
      }
    },
    tags: ['bienvenida', 'nuevos-clientes', 'descuento'],
    createdBy: 'user_002',
    createdAt: new Date('2024-11-15T14:20:00Z'),
    updatedAt: new Date('2024-11-20T11:30:00Z'),
    sentAt: new Date('2024-11-20T09:00:00Z')
  },
  
  {
    id: 'camp_003',
    name: 'Recordatorio Carrito Abandonado',
    status: 'scheduled',
    type: 'sms',
    channels: ['sms'],
    message: {
      content: 'Hola {{nombre}}, tienes productos esperándote en tu carrito. ¡Completa tu compra antes de que se agoten! Link: {{link_carrito}}',
      variables: [
        {
          id: 'var_004',
          name: '{{nombre}}',
          label: 'Nombre del contacto',
          type: 'text',
          defaultValue: 'Cliente',
          required: true
        },
        {
          id: 'var_005',
          name: '{{link_carrito}}',
          label: 'Link del carrito',
          type: 'text',
          defaultValue: 'https://tienda.com/carrito',
          required: true
        }
      ],
      sms: {
        maxLength: 160,
        estimatedParts: 1
      }
    },
    contacts: [],
    totalRecipients: 1250,
    scheduledAt: new Date('2024-11-26T16:00:00Z'),
    sendImmediately: false,
    timezone: 'America/Mexico_City',
    settings: {
      retrySettings: {
        enabled: true,
        maxRetries: 1,
        retryInterval: 120,
        retryOnErrors: ['UNDELIVERED']
      },
      rateLimit: {
        messagesPerMinute: 30,
        messagesPerHour: 1500
      },
      fallbackChannels: {
        enabled: false,
        whatsappToSms: false,
        smsToWhatsapp: false,
        fallbackDelay: 0
      },
      tracking: {
        deliveryReceipts: true,
        readReceipts: false,
        clickTracking: true,
        replyTracking: false
      },
      compliance: {
        respectOptOut: true,
        respectBlacklist: true,
        respectQuietHours: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      }
    },
    stats: {
      total: 1250,
      pending: 1250,
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      failed: 0,
      deliveryRate: 0,
      readRate: 0,
      replyRate: 0,
      failureRate: 0,
      smsStats: {
        total: 1250,
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
        cost: 0
      },
      estimatedCost: 125.00,
      actualCost: 0,
      currency: 'MXN',
      progress: {
        percentage: 0,
        estimatedCompletion: new Date('2024-11-26T18:00:00Z')
      }
    },
    tags: ['carrito-abandonado', 'remarketing'],
    createdBy: 'user_001',
    createdAt: new Date('2024-11-22T11:45:00Z'),
    updatedAt: new Date('2024-11-22T11:45:00Z')
  },

  {
    id: 'camp_004',
    name: 'Encuesta Post-Compra',
    status: 'draft',
    type: 'whatsapp',
    channels: ['whatsapp'],
    message: {
      content: 'Hola {{nombre}}, esperamos que estés disfrutando tu compra. ¿Podrías calificar tu experiencia? Tu opinión nos ayuda a mejorar. ⭐⭐⭐⭐⭐',
      variables: [
        {
          id: 'var_006',
          name: '{{nombre}}',
          label: 'Nombre del contacto',
          type: 'text',
          defaultValue: 'Cliente',
          required: true
        }
      ],
      callToActions: [
        {
          id: 'cta_003',
          type: 'url',
          text: 'Calificar Experiencia',
          value: 'https://encuestas.tienda.com/satisfaccion',
          trackClicks: true
        }
      ]
    },
    contacts: [],
    totalRecipients: 0,
    sendImmediately: false,
    timezone: 'America/Mexico_City',
    settings: {
      retrySettings: {
        enabled: false,
        maxRetries: 0,
        retryInterval: 0,
        retryOnErrors: []
      },
      rateLimit: {
        messagesPerMinute: 20,
        messagesPerHour: 1000
      },
      fallbackChannels: {
        enabled: false,
        whatsappToSms: false,
        smsToWhatsapp: false,
        fallbackDelay: 0
      },
      tracking: {
        deliveryReceipts: true,
        readReceipts: true,
        clickTracking: true,
        replyTracking: true
      },
      compliance: {
        respectOptOut: true,
        respectBlacklist: true,
        respectQuietHours: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      }
    },
    stats: {
      total: 0,
      pending: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      failed: 0,
      deliveryRate: 0,
      readRate: 0,
      replyRate: 0,
      failureRate: 0,
      estimatedCost: 0,
      actualCost: 0,
      currency: 'MXN',
      progress: {
        percentage: 0
      }
    },
    tags: ['encuesta', 'post-compra', 'satisfaccion'],
    createdBy: 'user_003',
    createdAt: new Date('2024-11-24T09:15:00Z'),
    updatedAt: new Date('2024-11-24T09:15:00Z')
  }
]

/**
 * 🎯 PLANTILLAS MOCK
 */
export const mockCampaignTemplates: CampaignTemplate[] = [
  {
    id: 'template_001',
    name: 'Promoción Básica',
    description: 'Plantilla para promociones y descuentos generales',
    category: 'Promociones',
    message: {
      content: 'Hola {{nombre}}, ¡Tenemos una oferta especial para ti! {{descuento}} de descuento en {{producto}}. Válido hasta {{fecha}}.',
      availableVariables: [
        {
          id: 'var_nombre',
          name: '{{nombre}}',
          label: 'Nombre del contacto',
          type: 'text',
          defaultValue: 'Cliente',
          required: true
        },
        {
          id: 'var_descuento',
          name: '{{descuento}}',
          label: 'Porcentaje de descuento',
          type: 'text',
          defaultValue: '20%',
          required: true
        },
        {
          id: 'var_producto',
          name: '{{producto}}',
          label: 'Producto en promoción',
          type: 'text',
          defaultValue: 'toda la tienda',
          required: true
        },
        {
          id: 'var_fecha',
          name: '{{fecha}}',
          label: 'Fecha límite',
          type: 'date',
          defaultValue: '31 de diciembre',
          required: true
        }
      ],
      callToActions: [
        {
          id: 'cta_template_001',
          type: 'url',
          text: 'Ver Ofertas',
          value: 'https://tienda.com/ofertas',
          trackClicks: true
        }
      ]
    },
    defaultType: 'whatsapp',
    isPublic: true,
    createdBy: 'admin',
    createdAt: new Date('2024-11-01T10:00:00Z'),
    usageCount: 15
  },
  
  {
    id: 'template_002',
    name: 'Bienvenida Nuevos Clientes',
    description: 'Mensaje de bienvenida para clientes que se registran',
    category: 'Bienvenida',
    message: {
      content: '¡Bienvenido a {{empresa}} {{nombre}}! 🎉 Gracias por unirte a nuestra comunidad. Como regalo de bienvenida, tienes {{descuento_bienvenida}} en tu primera compra.',
      availableVariables: [
        {
          id: 'var_empresa',
          name: '{{empresa}}',
          label: 'Nombre de la empresa',
          type: 'text',
          defaultValue: 'nuestra tienda',
          required: true
        },
        {
          id: 'var_nombre',
          name: '{{nombre}}',
          label: 'Nombre del contacto',
          type: 'text',
          defaultValue: 'Cliente',
          required: true
        },
        {
          id: 'var_descuento_bienvenida',
          name: '{{descuento_bienvenida}}',
          label: 'Descuento de bienvenida',
          type: 'text',
          defaultValue: '15% de descuento',
          required: true
        }
      ]
    },
    defaultType: 'whatsapp',
    isPublic: true,
    createdBy: 'admin',
    createdAt: new Date('2024-11-01T10:30:00Z'),
    usageCount: 8
  }
]

/**
 * 🎯 CONTACTOS SELECCIONADOS MOCK
 */
export const mockSelectedContacts: SelectedContact[] = [
  {
    id: 'contact_001',
    name: 'María García López',
    phone: '+525512345678',
    email: 'maria.garcia@email.com',
    company: 'Empresa ABC',
    position: 'Gerente de Marketing',
    status: 'active',
    source: 'manual',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-11-20T10:30:00Z'),
    totalMessages: 25,
    totalConversations: 3,
    value: 15000,
    currency: 'MXN',
    tags: ['vip', 'cliente-premium', 'marketing'],
    campaignStatus: 'delivered',
    personalizedVariables: {
      '{{nombre}}': 'María',
      '{{empresa}}': 'Empresa ABC',
      '{{descuento}}': '25%'
    },
    preferredChannel: 'whatsapp',
    sendResult: {
      twilioSid: 'SM1234567890abcdef',
      channel: 'whatsapp',
      sentAt: new Date('2024-11-25T08:05:00Z'),
      status: 'delivered',
      deliveredAt: new Date('2024-11-25T08:07:00Z'),
      readAt: new Date('2024-11-25T08:45:00Z'),
      interactions: [
        {
          id: 'int_001',
          type: 'click',
          timestamp: new Date('2024-11-25T08:50:00Z'),
          data: { url: 'https://tienda.com/black-friday' }
        }
      ]
    }
  },
  
  {
    id: 'contact_002',
    name: 'Carlos Rodríguez',
    phone: '+525587654321',
    email: 'carlos.rodriguez@email.com',
    status: 'active',
    source: 'whatsapp',
    createdAt: new Date('2024-03-10T14:20:00Z'),
    updatedAt: new Date('2024-11-22T16:15:00Z'),
    totalMessages: 8,
    totalConversations: 1,
    value: 5000,
    currency: 'MXN',
    tags: ['cliente-nuevo', 'interesado'],
    campaignStatus: 'read',
    personalizedVariables: {
      '{{nombre}}': 'Carlos',
      '{{descuento}}': '20%'
    },
    preferredChannel: 'sms',
    sendResult: {
      twilioSid: 'SM0987654321fedcba',
      channel: 'sms',
      sentAt: new Date('2024-11-25T08:10:00Z'),
      status: 'read',
      deliveredAt: new Date('2024-11-25T08:11:00Z'),
      readAt: new Date('2024-11-25T09:20:00Z')
    }
  }
] 