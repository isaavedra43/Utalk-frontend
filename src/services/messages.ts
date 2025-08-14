import api from './api';
import type { Message, MessageInputData } from '../types';
import { encodeConversationIdForUrl } from '../utils/conversationUtils';

// Configuración de la API
const MESSAGES_API = '/api/messages';
const CONVERSATIONS_API = '/api/conversations';

export const messagesService = {
  // Obtener mensajes de una conversación
  async getMessages(conversationId: string, params: {
    limit?: number;
    cursor?: string;
    before?: string;
    after?: string;
  } = {}): Promise<{ messages: Message[]; hasMore: boolean; cursor?: string }> {
    // SOLUCIÓN CRÍTICA: Codificar el conversationId para preservar los +
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    
    const queryParams = new URLSearchParams({
      conversationId: encodedConversationId, // Usar el ID codificado
      limit: params.limit?.toString() || '50',
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.before && { before: params.before }),
      ...(params.after && { after: params.after })
    });

    // SOLUCIÓN CRÍTICA: Usar el endpoint correcto según el backend
    // Backend espera: GET /api/messages?conversationId={conversationId}&limit=50
    const response = await api.get(`${MESSAGES_API}?${queryParams}`);
    return response.data;
  },

  // Enviar mensaje
  async sendMessage(conversationId: string, messageData: MessageInputData): Promise<Message> {
    // SOLUCIÓN CRÍTICA: Codificar el ID de conversación para preservar los +
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    
    // Backend espera: POST /api/conversations/{conversationId}/messages
    const response = await api.post(`${CONVERSATIONS_API}/${encodedConversationId}/messages`, messageData);
    return response.data;
  },

  // Marcar mensaje como leído
  async markMessageAsRead(conversationId: string, messageId: string): Promise<Message> {
    // SOLUCIÓN CRÍTICA: Codificar el ID de conversación para preservar los +
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    
    // Backend espera: PUT /api/conversations/{conversationId}/messages/{messageId}/read
    const response = await api.put(`${CONVERSATIONS_API}/${encodedConversationId}/messages/${messageId}/read`, {
      readAt: new Date().toISOString()
    });
    return response.data;
  },

  // Eliminar mensaje
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    // SOLUCIÓN CRÍTICA: Codificar el ID de conversación para preservar los +
    const encodedConversationId = encodeConversationIdForUrl(conversationId);
    
    // Backend espera: DELETE /api/conversations/{conversationId}/messages/{messageId}
    await api.delete(`${CONVERSATIONS_API}/${encodedConversationId}/messages/${messageId}`);
  },

  // Enviar ubicación
  async sendLocation(locationData: {
    to: string;
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
    conversationId: string;
  }): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/send-location`, locationData);
    return response.data;
  },

  // Enviar sticker
  async sendSticker(stickerData: {
    to: string;
    stickerUrl: string;
    conversationId: string;
  }): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/send-sticker`, stickerData);
    return response.data;
  },

  // Enviar imagen
  async sendImage(imageData: {
    to: string;
    imageUrl: string;
    caption?: string;
    conversationId: string;
  }): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/send-image`, imageData);
    return response.data;
  },

  // Enviar documento
  async sendDocument(documentData: {
    to: string;
    documentUrl: string;
    filename: string;
    caption?: string;
    conversationId: string;
  }): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/send-document`, documentData);
    return response.data;
  },

  // Enviar audio
  async sendAudio(audioData: {
    to: string;
    audioUrl: string;
    filename: string;
    duration?: number;
    conversationId: string;
  }): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/send-audio`, audioData);
    return response.data;
  },

  // Enviar video
  async sendVideo(videoData: {
    to: string;
    videoUrl: string;
    filename: string;
    caption?: string;
    duration?: number;
    thumbnail?: string;
    conversationId: string;
  }): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/send-video`, videoData);
    return response.data;
  },

  // Reenviar mensaje
  async forwardMessage(messageId: string, targetConversationId: string): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/${messageId}/forward`, {
      targetConversationId
    });
    return response.data;
  },

  // Responder a mensaje
  async replyToMessage(messageId: string, replyData: MessageInputData): Promise<Message> {
    const response = await api.post(`${MESSAGES_API}/${messageId}/reply`, replyData);
    return response.data;
  }
}; 