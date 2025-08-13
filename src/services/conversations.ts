import api from './api';
import type { Conversation, ConversationFilters } from '../types';

// Tipo para respuesta de lista de conversaciones
interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
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
    return response.data;
  },

  // Obtener conversación específica
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get(`${CONVERSATIONS_API}/${conversationId}`);
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
    const response = await api.put(`${CONVERSATIONS_API}/${conversationId}`, updateData);
    return response.data;
  },

  // Asignar conversación
  async assignConversation(conversationId: string, agentEmail: string): Promise<Conversation> {
    const response = await api.put(`${CONVERSATIONS_API}/${conversationId}/assign`, { agentEmail });
    return response.data;
  },

  // Desasignar conversación
  async unassignConversation(conversationId: string): Promise<Conversation> {
    const response = await api.put(`${CONVERSATIONS_API}/${conversationId}/unassign`);
    return response.data;
  },

  // Transferir conversación
  async transferConversation(conversationId: string, targetAgentEmail: string, reason: string): Promise<Conversation> {
    const response = await api.post(`${CONVERSATIONS_API}/${conversationId}/transfer`, {
      targetAgentEmail,
      reason
    });
    return response.data;
  },

  // Cambiar estado de conversación
  async changeConversationStatus(conversationId: string, status: string): Promise<Conversation> {
    const response = await api.put(`${CONVERSATIONS_API}/${conversationId}/status`, { status });
    return response.data;
  },

  // Cambiar prioridad de conversación
  async changeConversationPriority(conversationId: string, priority: string): Promise<Conversation> {
    const response = await api.put(`${CONVERSATIONS_API}/${conversationId}/priority`, { priority });
    return response.data;
  },

  // Marcar conversación como leída
  async markConversationAsRead(conversationId: string): Promise<Conversation> {
    const response = await api.put(`${CONVERSATIONS_API}/${conversationId}/read-all`);
    return response.data;
  },

  // Indicar escritura
  async indicateTyping(conversationId: string): Promise<void> {
    const response = await api.post(`${CONVERSATIONS_API}/${conversationId}/typing`);
    return response.data;
  },

  // Eliminar conversación
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`${CONVERSATIONS_API}/${conversationId}`);
  }
}; 