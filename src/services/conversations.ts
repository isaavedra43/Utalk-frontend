import api from './api';
import type { Conversation, ConversationFilters } from '../types';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';

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
  lastMessage?: {
    sender: string;
    direction: string;
    messageId: string;
    content: string;
    timestamp: {
      _seconds: number;
      _nanoseconds: number;
    };
    timestampMs: number;
    timestampISO: string;
  };
  unreadCount: number;
  status: string;
  workspaceId: string;
  tenantId: string;
  participants: string[];
  lastMessageAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  contact: {
    phone: string;
    name?: string;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  messageCount: number;
  lastMessageAtMs: number;
  lastMessageAtISO: string;
  assignedTo?: string;
  priority?: string;
  tags?: string[];
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
    const response = await api.get(`${CONVERSATIONS_API}?${queryParams}`);
    
    // Mapear la respuesta del backend al formato esperado por el frontend
    const backendData = response.data as BackendResponse;
    
    // Transformar las conversaciones del backend al formato esperado
    const conversations = backendData.data.map((conv: BackendConversation) => ({
      id: conv.id,
      customerName: conv.contact?.name || conv.customerPhone, // Usar nombre del contacto o teléfono como fallback
      customerPhone: conv.customerPhone,
      status: conv.status as 'open' | 'closed' | 'pending' | 'resolved',
      messageCount: conv.messageCount || 0,
      unreadCount: conv.unreadCount || 0,
      participants: conv.participants || [],
      tenantId: conv.tenantId,
      workspaceId: conv.workspaceId,
      createdAt: conv.createdAt ? new Date(conv.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
      updatedAt: conv.updatedAt ? new Date(conv.updatedAt._seconds * 1000).toISOString() : new Date().toISOString(),
      lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt._seconds * 1000).toISOString() : new Date().toISOString(),
      lastMessage: conv.lastMessage ? {
        content: conv.lastMessage.content,
        direction: conv.lastMessage.direction as 'inbound' | 'outbound',
        messageId: conv.lastMessage.messageId,
        sender: conv.lastMessage.sender,
        timestamp: conv.lastMessage.timestampISO || new Date().toISOString()
      } : undefined,
      assignedTo: conv.assignedTo,
      priority: conv.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
      tags: conv.tags || []
    }));

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
    customerPhone: string;
    customerName: string;
    subject?: string;
    priority?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<Conversation> {
    const response = await api.post(CONVERSATIONS_API, conversationData);
    return response.data;
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

  // Indicar escritura
  async indicateTyping(conversationId: string): Promise<void> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'indicateTyping');
    const response = await api.post(`${CONVERSATIONS_API}/${sanitizedId}/typing`);
    return response.data;
  },

  // Eliminar conversación
  async deleteConversation(conversationId: string): Promise<void> {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      throw new Error(`ID de conversación inválido: ${conversationId}`);
    }
    
    logConversationId(sanitizedId, 'deleteConversation');
    await api.delete(`${CONVERSATIONS_API}/${sanitizedId}`);
  }
}; 