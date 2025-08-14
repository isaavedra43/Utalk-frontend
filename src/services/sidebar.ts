import api from './api';
import type { ClientProfile, ConversationDetails, NotificationSettings, AISuggestion } from '../types';
import { encodeConversationIdForUrl } from '../utils/conversationUtils';

// Configuración de la API
const SIDEBAR_API = '/sidebar';

export const sidebarService = {
  // Obtener perfil del cliente
  async getClientProfile(conversationId: string): Promise<ClientProfile> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.get(`${SIDEBAR_API}/client-profile/${encodedConversationId}`);
    return response.data;
  },

  // Obtener detalles de la conversación
  async getConversationDetails(conversationId: string): Promise<ConversationDetails> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.get(`${SIDEBAR_API}/conversation-details/${encodedConversationId}`);
    return response.data;
  },

  // Obtener configuración de notificaciones
  async getNotificationSettings(conversationId: string): Promise<NotificationSettings> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.get(`${SIDEBAR_API}/notification-settings/${encodedConversationId}`);
    return response.data;
  },

  // Actualizar configuración de notificaciones
  async updateNotificationSettings(conversationId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.put(`${SIDEBAR_API}/notification-settings/${encodedConversationId}`, settings);
    return response.data;
  },

  // Obtener sugerencias de IA
  async getAISuggestions(conversationId: string): Promise<AISuggestion[]> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.get(`${SIDEBAR_API}/ai-suggestions/${encodedConversationId}`);
    return response.data;
  },

  // Generar nueva sugerencia de IA
  async generateAISuggestion(conversationId: string, context?: string): Promise<AISuggestion> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.post(`${SIDEBAR_API}/ai-suggestions/${encodedConversationId}/generate`, { context });
    return response.data;
  }
};

// Datos mock basados en Firebase para desarrollo
export const mockClientProfile: ClientProfile = {
  id: 'client-1',
  name: 'María González',
  phone: '+34612345678',
  email: 'maria.gonzalez@email.com',
  avatar: 'MG',
  status: 'active',
  channel: 'whatsapp',
  lastContact: 'hace más de 1 año',
  clientSince: 'hace más de 1 año',
  whatsappId: '34612345678',
  tags: ['VIP', 'Premium'],
  metadata: {
    company: 'Empresa ABC',
    location: 'Madrid, España',
    language: 'es'
  }
};

export const mockConversationDetails: ConversationDetails = {
  id: 'conv_+5214775211_+5214793176502',
  status: 'open',
  priority: 'medium',
  unreadCount: 2,
  assignedTo: 'admin@company.com',
  assignedToName: 'PS Pedro Sánchez',
  createdAt: '10 de agosto de 2025, 2:15:30 p.m. UTC-6',
  updatedAt: '11 de agosto de 2025, 3:45:12 p.m. UTC-6',
  lastMessageAt: '11 de agosto de 2025, 3:45:12 p.m. UTC-6',
  messageCount: 15,
  participants: [
    '+5214775211',
    'system@utalk.local',
    'admin@company.com',
    'agent:admin@company.com',
    'whatsapp:+5214775211'
  ],
  tags: ['VIP', 'Premium']
};

export const mockNotificationSettings: NotificationSettings = {
  conversationNotifications: false,
  reports: false,
  autoFollowUp: false,
  emailNotifications: false,
  pushNotifications: false
};

export const mockAISuggestions: AISuggestion[] = [
  {
    id: 'suggestion-1',
    title: 'Confirmar cambio de dirección',
    content: 'Por supuesto, puedo ayudarte a cambiar la dirección de entrega. ¿Podrías proporcionarme la nueva dirección completa?',
    confidence: 'high',
    category: 'order_management',
    tags: ['order_management', 'shipping_policy'],
    actions: {
      copy: true,
      improve: true,
      use: false
    }
  },
  {
    id: 'suggestion-2',
    title: 'Ofrecer tracking',
    content: 'Te envío el enlace de seguimiento para que puedas monitorear tu pedido en tiempo real:',
    confidence: 'medium',
    category: 'customer_service',
    tags: ['tracking', 'order_status'],
    actions: {
      copy: true,
      improve: true,
      use: false
    }
  },
  {
    id: 'suggestion-3',
    title: 'Resolver problema técnico',
    content: 'Entiendo que tienes un problema técnico. Voy a revisar tu cuenta y te ayudo a solucionarlo.',
    confidence: 'low',
    category: 'technical_support',
    tags: ['technical', 'support'],
    actions: {
      copy: true,
      improve: true,
      use: false
    }
  }
]; 