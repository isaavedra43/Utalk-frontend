import api from './api';
import type { AISuggestion } from '../types';
import { encodeConversationIdForUrl } from '../utils/conversationUtils';

// Configuración de la API
const AI_API = '/api/ai';

export const aiService = {
  // Obtener configuración IA
  async getAIConfig(workspaceId: string): Promise<{
    enabled: boolean;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    customPrompts: Record<string, string>;
  }> {
    const response = await api.get(`${AI_API}/config/${workspaceId}`);
    return response.data;
  },

  // Actualizar configuración IA
  async updateAIConfig(workspaceId: string, config: {
    enabled?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    customPrompts?: Record<string, string>;
  }): Promise<void> {
    const response = await api.put(`${AI_API}/config/${workspaceId}`, config);
    return response.data;
  },

  // Generar sugerencia
  async generateSuggestion(suggestionData: {
    workspaceId: string;
    conversationId: string;
    messageId?: string;
    context?: string;
  }): Promise<AISuggestion> {
    const response = await api.post(`${AI_API}/suggestions/generate`, suggestionData);
    return response.data;
  },

  // Probar sugerencia
  async testSuggestion(suggestionData: {
    workspaceId: string;
    conversationId: string;
    messageId?: string;
  }): Promise<{
    suggestion: AISuggestion;
    confidence: number;
    reasoning: string;
  }> {
    const response = await api.post(`${AI_API}/test-suggestion`, suggestionData);
    return response.data;
  },

  // Obtener sugerencias
  async getSuggestions(conversationId: string, params: {
    limit?: number;
    status?: string;
  } = {}): Promise<AISuggestion[]> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const queryParams = new URLSearchParams({
      limit: params.limit?.toString() || '10',
      status: params.status || ''
    });

    const response = await api.get(`${AI_API}/suggestions/${encodedConversationId}?${queryParams}`);
    return response.data;
  },

  // Actualizar estado de sugerencia
  async updateSuggestionStatus(conversationId: string, suggestionId: string, status: 'used' | 'ignored' | 'improved'): Promise<void> {
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    const response = await api.put(`${AI_API}/suggestions/${encodedConversationId}/${suggestionId}/status`, { status });
    return response.data;
  },

  // Obtener estadísticas IA
  async getAIStats(workspaceId: string, params: {
    days?: number;
  } = {}): Promise<{
    totalSuggestions: number;
    usedSuggestions: number;
    ignoredSuggestions: number;
    averageConfidence: number;
    topCategories: Array<{ category: string; count: number }>;
    dailyUsage: Array<{ date: string; count: number }>;
  }> {
    const queryParams = new URLSearchParams({
      days: params.days?.toString() || '7'
    });

    const response = await api.get(`${AI_API}/stats/${workspaceId}?${queryParams}`);
    return response.data;
  },

  // Health check IA
  async getAIHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    model: string;
    responseTime: number;
    lastCheck: string;
    errors: string[];
  }> {
    const response = await api.get(`${AI_API}/health`);
    return response.data;
  },

  // Analizar sentimiento del mensaje
  async analyzeSentiment(messageContent: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keywords: string[];
    urgency: 'low' | 'medium' | 'high';
  }> {
    const response = await api.post(`${AI_API}/analyze-sentiment`, { content: messageContent });
    return response.data;
  },

  // Clasificar intención del mensaje
  async classifyIntent(messageContent: string): Promise<{
    intent: string;
    confidence: number;
    entities: Array<{ type: string; value: string; confidence: number }>;
    suggestedActions: string[];
  }> {
    const response = await api.post(`${AI_API}/classify-intent`, { content: messageContent });
    return response.data;
  },

  // Generar respuesta automática
  async generateAutoResponse(context: {
    conversationId: string;
    customerName: string;
    lastMessage: string;
    conversationHistory: string[];
    suggestedTone: 'professional' | 'friendly' | 'formal';
  }): Promise<{
    response: string;
    confidence: number;
    alternatives: string[];
  }> {
    const response = await api.post(`${AI_API}/generate-response`, context);
    return response.data;
  }
};

// Datos mock para desarrollo
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