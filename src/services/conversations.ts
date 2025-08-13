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
  async getConversations(filters: ConversationFilters = {}): Promise<ConversationListResponse> {
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '50',
      status: filters.status || 'all',
      priority: filters.priority || '',
      assignedTo: filters.assignedTo || '',
      search: filters.search || ''
    });

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

// Datos mock basados en Firebase para desarrollo
export const mockConversations: Conversation[] = [
  {
    id: 'conv_+5214773790184_+5214793176502',
    customerName: 'Isra',
    customerPhone: '+5214773790184',
    subject: 'Consulta sobre pedido #12345',
    status: 'open',
    messageCount: 22,
    unreadCount: 5,
    participants: [
      '+5214773790184',
      'system@utalk.local',
      'admin@company.com',
      'agent:admin@company.com',
      'whatsapp:+5214773790184'
    ],
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    createdAt: '8 de agosto de 2025, 6:33:49 p.m. UTC-6',
    updatedAt: '11 de agosto de 2025, 4:21:25 p.m. UTC-6',
    lastMessageAt: '11 de agosto de 2025, 4:21:25 p.m. UTC-6',
    lastMessage: {
      content: 'PRUEBA 9',
      direction: 'outbound',
      messageId: 'e9f6edd0-d771-4829-89f0-16393b53eed3',
      sender: 'agent:admin@company.com',
      timestamp: '11 de agosto de 2025, 4:21:25 p.m. UTC-6'
    },
    assignedTo: 'admin@company.com',
    assignedToName: 'PS Pedro Sánchez',
    priority: 'medium',
    tags: ['Order', 'VIP'],
    metadata: {
      source: 'whatsapp',
      channel: 'whatsapp',
      language: 'es'
    }
  },
  {
    id: 'conv_+5214775211_+5214793176502',
    customerName: 'María González',
    customerPhone: '+5214775211',
    status: 'open',
    messageCount: 15,
    unreadCount: 2,
    participants: [
      '+5214775211',
      'system@utalk.local',
      'admin@company.com',
      'agent:admin@company.com',
      'whatsapp:+5214775211'
    ],
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    createdAt: '10 de agosto de 2025, 2:15:30 p.m. UTC-6',
    updatedAt: '11 de agosto de 2025, 3:45:12 p.m. UTC-6',
    lastMessageAt: '11 de agosto de 2025, 3:45:12 p.m. UTC-6',
    lastMessage: {
      content: '¡Perfecto! Muchas gracias por la información. ¿Podrían cambiar la dirección de entrega?',
      direction: 'inbound',
      messageId: 'msg-123456',
      sender: 'whatsapp:+5214775211',
      timestamp: '11 de agosto de 2025, 3:45:12 p.m. UTC-6'
    },
    assignedTo: 'admin@company.com',
    priority: 'high',
    tags: ['VIP', 'Premium']
  },
  {
    id: 'conv_+5214773790_+5214793176502',
    customerName: 'Carlos Ruiz',
    customerPhone: '+5214773790',
    status: 'open',
    messageCount: 8,
    unreadCount: 1,
    participants: [
      '+5214773790',
      'system@utalk.local',
      'admin@company.com',
      'agent:admin@company.com',
      'whatsapp:+5214773790'
    ],
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    createdAt: '11 de agosto de 2025, 9:20:15 a.m. UTC-6',
    updatedAt: '11 de agosto de 2025, 2:30:45 p.m. UTC-6',
    lastMessageAt: '11 de agosto de 2025, 2:30:45 p.m. UTC-6',
    lastMessage: {
      content: 'Buenos días, soy nuevo cliente y necesito ayuda',
      direction: 'inbound',
      messageId: 'msg-789012',
      sender: 'whatsapp:+5214773790',
      timestamp: '11 de agosto de 2025, 2:30:45 p.m. UTC-6'
    },
    assignedTo: 'admin@company.com',
    priority: 'medium',
    tags: ['New Cus']
  },
  {
    id: 'conv_+5214773791_+5214793176502',
    customerName: 'David López',
    customerPhone: '+5214773791',
    status: 'open',
    messageCount: 12,
    unreadCount: 3,
    participants: [
      '+5214773791',
      'system@utalk.local',
      'admin@company.com',
      'agent:admin@company.com',
      'whatsapp:+5214773791'
    ],
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    createdAt: '9 de agosto de 2025, 4:10:22 p.m. UTC-6',
    updatedAt: '11 de agosto de 2025, 1:15:30 p.m. UTC-6',
    lastMessageAt: '11 de agosto de 2025, 1:15:30 p.m. UTC-6',
    lastMessage: {
      content: 'Tengo un problema técnico con mi cuenta',
      direction: 'inbound',
      messageId: 'msg-345678',
      sender: 'whatsapp:+5214773791',
      timestamp: '11 de agosto de 2025, 1:15:30 p.m. UTC-6'
    },
    assignedTo: 'admin@company.com',
    priority: 'high',
    tags: ['Technica']
  },
  {
    id: 'conv_+5214773792_+5214793176502',
    customerName: 'Elena Torres',
    customerPhone: '+5214773792',
    status: 'open',
    messageCount: 25,
    unreadCount: 8,
    participants: [
      '+5214773792',
      'system@utalk.local',
      'admin@company.com',
      'agent:admin@company.com',
      'whatsapp:+5214773792'
    ],
    tenantId: 'default_tenant',
    workspaceId: 'default_workspace',
    createdAt: '7 de agosto de 2025, 11:30:45 a.m. UTC-6',
    updatedAt: '11 de agosto de 2025, 4:55:18 p.m. UTC-6',
    lastMessageAt: '11 de agosto de 2025, 4:55:18 p.m. UTC-6',
    lastMessage: {
      content: 'URGENTE: Necesito ayuda inmediata con mi pedido',
      direction: 'inbound',
      messageId: 'msg-901234',
      sender: 'whatsapp:+5214773792',
      timestamp: '11 de agosto de 2025, 4:55:18 p.m. UTC-6'
    },
    assignedTo: 'admin@company.com',
    priority: 'urgent',
    tags: ['VIP', 'Urgent']
  }
]; 