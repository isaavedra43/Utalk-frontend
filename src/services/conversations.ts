import api from './api';
import type { Conversation, ConversationFilters } from '../types';
import type { ConversationContact } from '../types/conversation';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';

// Mock de datos para desarrollo según la nueva estructura del backend
const mockConversations = [
  {
    id: 'conv_+524773790184_+5214793176502',
    customerPhone: '+524773790184',
    contact: {
      name: 'Isra',
      phoneNumber: '+524773790184'
    },
    lastMessage: {
      id: 'msg-1',
      content: 'Hola, necesito información sobre el producto',
      type: 'text',
      timestamp: '2025-08-21T17:30:00.000Z',
      direction: 'inbound',
      status: 'sent'
    },
    lastMessageAt: '2025-08-21T17:30:00.000Z',
    unreadCount: 2,
    status: 'open',
    assignedTo: 'admin@company.com',
    participants: ['+524773790184', 'admin@company.com', 'agent:admin@company.com', 'whatsapp:+524773790184'],
    createdAt: '2025-08-21T17:00:00.000Z',
    updatedAt: '2025-08-21T17:30:00.000Z',
    priority: 'medium',
    tags: ['VIP'],
    // Campos legacy para compatibilidad
    customerName: 'Isra',
    messageCount: 5,
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    assignedToName: null,
    createdBy: 'admin@company.com',
    metadata: {}
  },
  {
    id: 'conv_+524773790185_+5214793176502',
    customerPhone: '+524773790185',
    contact: {
      name: 'María González',
      phoneNumber: '+524773790185'
    },
    lastMessage: {
      id: 'msg-2',
      content: 'Gracias por la información',
      type: 'text',
      timestamp: '2025-08-21T16:45:00.000Z',
      direction: 'outbound',
      status: 'sent'
    },
    lastMessageAt: '2025-08-21T16:45:00.000Z',
    unreadCount: 0,
    status: 'open',
    assignedTo: 'admin@company.com',
    participants: ['+524773790185', 'admin@company.com', 'agent:admin@company.com', 'whatsapp:+524773790185'],
    createdAt: '2025-08-21T16:00:00.000Z',
    updatedAt: '2025-08-21T16:45:00.000Z',
    priority: 'low',
    tags: [],
    // Campos legacy para compatibilidad
    customerName: 'María González',
    messageCount: 3,
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    assignedToName: null,
    createdBy: 'admin@company.com',
    metadata: {}
  }
];

// Tipo para respuesta de lista de conversaciones
interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Tipo para la respuesta del backend
interface BackendConversation {
  id: string;
  customerPhone: string;
  contact: {
    name: string;
    phoneNumber: string;
  };
  lastMessage?: {
    content: string;
    direction: string;
    messageId: string;
    sender: string;
    timestampISO?: string;
  };
  lastMessageAt: string;
  unreadCount: number;
  status: string;
  assignedTo?: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  priority?: string;
  tags?: string[];
  
  // Campos legacy para compatibilidad
  customerName?: string;
  messageCount?: number;
  tenantId?: string;
  workspaceId?: string;
  assignedToName?: string | null;
  createdBy?: string;
}

interface BackendResponse {
  success: boolean;
  data: BackendConversation[];
  message: string;
  timestamp: string;
}

// Configuración de la API
const CONVERSATIONS_API = '/api/conversations';

export const conversationsService = {
  // Obtener lista de conversaciones
  async getConversations(filters: ConversationFilters & { page?: number; limit?: number } = {}): Promise<ConversationListResponse> {
    // Construir parámetros de query omitiendo valores vacíos
    const params: Record<string, string> = {
      page: (filters.page || 1).toString(),
      limit: (filters.limit || 50).toString(),
      status: filters.status || 'all'
    };

    // Solo agregar parámetros si tienen valores válidos
    if (filters.priority && filters.priority.trim() !== '') {
      params.priority = filters.priority;
    }
    if (filters.assignedTo && filters.assignedTo.trim() !== '') {
      params.assignedTo = filters.assignedTo;
    }
    if (filters.search && filters.search.trim() !== '') {
      params.search = filters.search;
    }

    const queryParams = new URLSearchParams(params);
    
    let backendData: BackendResponse;
    
    try {
      const response = await api.get(`${CONVERSATIONS_API}?${queryParams}`);
      
      // Mapear la respuesta del backend al formato esperado por el frontend
      backendData = response.data as BackendResponse;
    } catch (error) {
      console.warn('⚠️ API no disponible, usando datos mock:', error);
      
      // Usar datos mock si la API falla
      return {
        conversations: mockConversations as unknown as Conversation[],
        total: mockConversations.length,
        page: parseInt(params.page),
        limit: parseInt(params.limit),
        hasMore: false
      };
    }
    
    // Transformar las conversaciones del backend al formato esperado
    const conversations = backendData.data.map((conv: BackendConversation) => {
      // Usar la nueva estructura del backend
      const contactName = conv.contact?.name || conv.customerPhone;
      const contactPhone = conv.contact?.phoneNumber || conv.customerPhone;

      return {
        id: conv.id,
        customerPhone: contactPhone,
        contact: {
          name: contactName,
          phoneNumber: contactPhone
        } as ConversationContact,
        lastMessage: conv.lastMessage
          ? {
              id: conv.lastMessage.messageId,
              content: conv.lastMessage.content,
              direction: conv.lastMessage.direction as 'inbound' | 'outbound',
              timestamp: conv.lastMessage.timestampISO || new Date().toISOString(),
              type: 'text' as const,
              status: 'sent' as const
            }
          : undefined,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount || 0,
        status: conv.status as 'open' | 'closed' | 'pending' | 'resolved',
        assignedTo: conv.assignedTo,
        participants: conv.participants || [],
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        priority: conv.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
        tags: conv.tags || [],
        
        // Campos legacy para compatibilidad
        customerName: contactName,
        messageCount: conv.messageCount || 0,
        tenantId: conv.tenantId || 'default_tenant',
        workspaceId: conv.workspaceId || 'default_workspace',
        assignedToName: conv.assignedToName,
        createdBy: conv.createdBy,
        metadata: {}
      } as Conversation;
    });

    return {
      conversations,
      total: conversations.length,
      page: parseInt(params.page),
      limit: parseInt(params.limit),
      hasMore: false // Por ahora asumimos que no hay más páginas
    };
  },

  // Obtener conversación específica
  async getConversation(conversationId: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    // SOLUCIÓN CRÍTICA: Codificar el ID de conversación para preservar los +
    const encodedConversationId = encodeConversationIdForUrl(sanitizedId);
    
    logConversationId(sanitizedId, 'getConversation');
    const response = await api.get(`${CONVERSATIONS_API}/${encodedConversationId}`);
    return response.data;
  },

  // Crear conversación
  async createConversation(conversationData: {
    contact: {
      phoneNumber: string;
      name: string;
      email?: string;
      source?: string;
    };
    initialMessage: {
      text: string;
      type: 'text' | 'file';
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    };
  }): Promise<Conversation> {
    const response = await api.post(CONVERSATIONS_API, conversationData);
    return response.data;
  },

  // Crear conversación con mensaje inicial (endpoint correcto del backend)
  async createConversationBasic(conversationData: {
    customerPhone: string;
    initialMessage?: string;
    assignedTo?: string;
    currentUser?: string; // Agregar usuario actual como parámetro
  }): Promise<Conversation> {
    // Construir la estructura correcta de la conversación según las imágenes
    const currentUser = conversationData.currentUser || 'admin@company.com';
    
    // Construir el ID correcto: conv_{customerPhone}_{ourNumber}
    // Nuestro número es +5214793176502 según las imágenes
    const ourNumber = '+5214793176502';
    const conversationId = `conv_${conversationData.customerPhone}_${ourNumber}`;
    
    // Estructura completa de la conversación según las imágenes correctas
    const fullConversationData = {
      id: conversationId,
      customerPhone: conversationData.customerPhone,
      status: 'open',
      priority: 'medium',
      tags: [],
      participants: [
        conversationData.customerPhone, // Cliente
        currentUser, // Agente actual
        `agent:${currentUser}`, // Identificador del agente
        `whatsapp:${conversationData.customerPhone}` // Identificador de WhatsApp
      ],
      createdBy: currentUser,
      assignedTo: conversationData.assignedTo || currentUser,
      assignedToName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messageCount: 0,
      tenantId: 'default_tenant',
      workspaceId: 'default_workspace',
      messages: [], // Subcolección de mensajes
      // Campos adicionales según las imágenes
      customerName: '', // Se llenará con el nombre del contacto
      lastMessage: null,
      metadata: {
        channel: 'whatsapp',
        createdVia: 'manual'
      }
    };

    const response = await api.post(CONVERSATIONS_API, fullConversationData);
    
    // Verificar y corregir el ID si el backend lo devuelve al revés
    const responseData = response.data;
    if (responseData.data && responseData.data.id) {
      const backendId = responseData.data.id;
      const expectedId = conversationId;
      
      // Si el backend devolvió el ID al revés, corregirlo
      if (backendId !== expectedId) {
        console.warn('⚠️ Backend devolvió ID al revés, corrigiendo:', {
          backendId,
          expectedId
        });
        
        // Corregir el ID en la respuesta
        responseData.data.id = expectedId;
        
        // También corregir los participantes si no están completos
        if (!responseData.data.participants || responseData.data.participants.length < 4) {
          responseData.data.participants = [
            conversationData.customerPhone, // Cliente
            currentUser, // Agente actual
            `agent:${currentUser}`, // Identificador del agente
            `whatsapp:${conversationData.customerPhone}` // Identificador de WhatsApp
          ];
        }
        
        // Asegurar que el agente esté como participante
        if (!responseData.data.participants.includes(currentUser)) {
          responseData.data.participants.push(currentUser);
        }
        if (!responseData.data.participants.includes(`agent:${currentUser}`)) {
          responseData.data.participants.push(`agent:${currentUser}`);
        }
      }
    }
    
    return responseData;
  },

  // Actualizar conversación
  async updateConversation(conversationId: string, updateData: {
    customerName?: string;
    subject?: string;
    status?: string;
    priority?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'updateConversation');
    const response = await api.put(`${CONVERSATIONS_API}/${sanitizedId}`, updateData);
    return response.data;
  },

  // Asignar conversación
  async assignConversation(conversationId: string, agentEmail: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'assignConversation');
    const response = await api.put(`${CONVERSATIONS_API}/${sanitizedId}/assign`, { agentEmail });
    return response.data;
  },

  // Desasignar conversación
  async unassignConversation(conversationId: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'unassignConversation');
    const response = await api.put(`${CONVERSATIONS_API}/${sanitizedId}/unassign`);
    return response.data;
  },

  // Transferir conversación
  async transferConversation(conversationId: string, targetAgentEmail: string, reason: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'transferConversation');
    const response = await api.post(`${CONVERSATIONS_API}/${sanitizedId}/transfer`, {
      targetAgentEmail,
      reason
    });
    return response.data;
  },

  // Cambiar estado de conversación
  async changeConversationStatus(conversationId: string, status: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'changeConversationStatus');
    const response = await api.put(`${CONVERSATIONS_API}/${sanitizedId}/status`, { status });
    return response.data;
  },

  // Cambiar prioridad de conversación
  async changeConversationPriority(conversationId: string, priority: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'changeConversationPriority');
    const response = await api.put(`${CONVERSATIONS_API}/${sanitizedId}/priority`, { priority });
    return response.data;
  },

  // Marcar conversación como leída
  async markConversationAsRead(conversationId: string): Promise<Conversation> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'markConversationAsRead');
    const response = await api.put(`${CONVERSATIONS_API}/${sanitizedId}/read-all`);
    return response.data;
  },

  // Enviar mensaje (placeholder)
}; 