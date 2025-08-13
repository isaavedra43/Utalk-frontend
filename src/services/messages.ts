import api from './api';
import type { Message, MessageInputData } from '../types';

// Configuración de la API
const MESSAGES_API = '/api/messages';

export const messagesService = {
  // Obtener mensajes de una conversación
  async getMessages(conversationId: string, params: {
    limit?: number;
    cursor?: string;
    before?: string;
    after?: string;
  } = {}): Promise<{ messages: Message[]; hasMore: boolean; cursor?: string }> {
    // En desarrollo, usar datos mock si el backend no está disponible
    if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
      console.log('🔧 Usando datos mock para desarrollo');
      const mockMessagesForConversation = mockMessages.filter(
        msg => msg.conversationId === conversationId
      );
      return {
        messages: mockMessagesForConversation,
        hasMore: false
      };
    }

    const queryParams = new URLSearchParams({
      conversationId,
      limit: params.limit?.toString() || '50',
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.before && { before: params.before }),
      ...(params.after && { after: params.after })
    });

    const response = await api.get(`${MESSAGES_API}?${queryParams}`);
    return response.data;
  },

  // Enviar mensaje
  async sendMessage(conversationId: string, messageData: MessageInputData): Promise<Message> {
    const response = await api.post(`/api/conversations/${conversationId}/messages`, messageData);
    return response.data;
  },

  // Marcar mensaje como leído
  async markMessageAsRead(conversationId: string, messageId: string): Promise<Message> {
    const response = await api.put(`/api/conversations/${conversationId}/messages/${messageId}/read`, {
      readAt: new Date().toISOString()
    });
    return response.data;
  },

  // Eliminar mensaje
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await api.delete(`/api/conversations/${conversationId}/messages/${messageId}`);
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

// Datos mock basados en Firebase para desarrollo
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: 'Hola, necesito ayuda con mi pedido #12345. ¿Podrían revisar el estado?',
    direction: 'inbound',
    createdAt: '15 de enero de 2024, 10:30:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-123',
      sentBy: 'whatsapp:+5214775211',
      source: 'web',
      timestamp: '2024-01-15T16:30:00.000Z'
    },
    status: 'read',
    type: 'text',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'whatsapp:+5214775211',
    updatedAt: '15 de enero de 2024, 10:30:00 a.m. UTC-6'
  },
  {
    id: 'msg-2',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: 'https://picsum.photos/400/300',
    direction: 'inbound',
    createdAt: '15 de enero de 2024, 10:31:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-124',
      sentBy: 'whatsapp:+5214775211',
      source: 'web',
      timestamp: '2024-01-15T16:31:00.000Z',
      fileName: 'imagen_producto.jpg',
      fileSize: 245760,
      fileType: 'image/jpeg'
    },
    status: 'read',
    type: 'image',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'whatsapp:+5214775211',
    updatedAt: '15 de enero de 2024, 10:31:00 a.m. UTC-6'
  },
  {
    id: 'msg-3',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    direction: 'outbound',
    createdAt: '15 de enero de 2024, 10:32:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-125',
      sentBy: 'admin@company.com',
      source: 'web',
      timestamp: '2024-01-15T16:32:00.000Z',
      fileName: 'factura_pedido_12345.pdf',
      fileSize: 1048576,
      fileType: 'application/pdf'
    },
    status: 'read',
    type: 'document',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'agent:admin@company.com',
    updatedAt: '15 de enero de 2024, 10:32:00 a.m. UTC-6'
  },
  {
    id: 'msg-4',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    direction: 'inbound',
    createdAt: '15 de enero de 2024, 10:33:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-126',
      sentBy: 'whatsapp:+5214775211',
      source: 'web',
      timestamp: '2024-01-15T16:33:00.000Z',
      fileName: 'mensaje_voz.wav',
      fileSize: 512000,
      fileType: 'audio/wav',
      duration: 15
    },
    status: 'read',
    type: 'voice',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'whatsapp:+5214775211',
    updatedAt: '15 de enero de 2024, 10:33:00 a.m. UTC-6'
  },
  {
    id: 'msg-5',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    direction: 'outbound',
    createdAt: '15 de enero de 2024, 10:34:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-127',
      sentBy: 'admin@company.com',
      source: 'web',
      timestamp: '2024-01-15T16:34:00.000Z',
      fileName: 'tutorial_producto.mp4',
      fileSize: 2097152,
      fileType: 'video/mp4',
      duration: 45,
      thumbnail: 'https://picsum.photos/320/180'
    },
    status: 'read',
    type: 'video',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'agent:admin@company.com',
    updatedAt: '15 de enero de 2024, 10:34:00 a.m. UTC-6'
  },
  {
    id: 'msg-6',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: JSON.stringify({
      latitude: 19.4326,
      longitude: -99.1332,
      name: 'Centro Histórico',
      address: 'Centro Histórico, Ciudad de México, CDMX, México',
      timestamp: '2024-01-15T16:35:00.000Z'
    }),
    direction: 'inbound',
    createdAt: '15 de enero de 2024, 10:35:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-128',
      sentBy: 'whatsapp:+5214775211',
      source: 'web',
      timestamp: '2024-01-15T16:35:00.000Z'
    },
    status: 'read',
    type: 'location',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'whatsapp:+5214775211',
    updatedAt: '15 de enero de 2024, 10:35:00 a.m. UTC-6'
  },
  {
    id: 'msg-7',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: '😊',
    direction: 'inbound',
    createdAt: '15 de enero de 2024, 10:36:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-129',
      sentBy: 'whatsapp:+5214775211',
      source: 'web',
      timestamp: '2024-01-15T16:36:00.000Z'
    },
    status: 'read',
    type: 'sticker',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'whatsapp:+5214775211',
    updatedAt: '15 de enero de 2024, 10:36:00 a.m. UTC-6'
  },
  {
    id: 'msg-8',
    conversationId: 'conv_+5214775211_+5214793176502',
    content: '¡Perfecto! Muchas gracias por la información. ¿Podrían cambiar la dirección de entrega?',
    direction: 'inbound',
    createdAt: '15 de enero de 2024, 10:37:00 a.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '192.168.1.1',
      requestId: 'req-130',
      sentBy: 'whatsapp:+5214775211',
      source: 'web',
      timestamp: '2024-01-15T16:37:00.000Z'
    },
    status: 'read',
    type: 'text',
    recipientIdentifier: 'whatsapp:+5214775211',
    senderIdentifier: 'whatsapp:+5214775211',
    updatedAt: '15 de enero de 2024, 10:37:00 a.m. UTC-6'
  },
  {
    id: 'msg-9',
    conversationId: 'conv_+5214773790184_+5214793176502',
    content: 'PRUEBA 9',
    direction: 'outbound',
    createdAt: '11 de agosto de 2025, 4:21:25 p.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '189.162.163.251',
      requestId: 'unknown',
      sentBy: 'admin@company.com',
      source: 'web',
      timestamp: '2025-08-11T22:21:25.000Z'
    },
    status: 'sent',
    type: 'text',
    recipientIdentifier: 'whatsapp:+5214773790184',
    senderIdentifier: 'agent:admin@company.com',
    updatedAt: '11 de agosto de 2025, 4:21:25 p.m. UTC-6'
  },
  {
    id: 'msg-10',
    conversationId: 'conv_+5214773790184_+5214793176502',
    content: 'prueba 2',
    direction: 'outbound',
    createdAt: '11 de agosto de 2025, 12:58:20 p.m. UTC-6',
    metadata: {
      agentId: 'admin@company.com',
      ip: '189.162.163.251',
      requestId: 'unknown',
      sentBy: 'admin@company.com',
      source: 'web',
      timestamp: '2025-08-11T18:58:20.111Z'
    },
    status: 'sent',
    type: 'text',
    recipientIdentifier: 'whatsapp:+5214773790',
    senderIdentifier: 'agent:admin@company.com',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    updatedAt: '11 de agosto de 2025, 12:58:20 p.m. UTC-6'
  }
]; 