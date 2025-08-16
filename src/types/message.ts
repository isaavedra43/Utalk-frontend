// Tipos para mensajes basados en Firebase

export interface Message {
  id: string; // "b23da669-896f-4030-8a11-6583b232e96e"
  conversationId: string; // "conv_+5214773790184_+5214"
  content: string; // "prueba 2"
  direction: 'inbound' | 'outbound';
  createdAt: string; // "11 de agosto de 2025, 12:58:20 p.m. UTC-6"
  metadata: MessageMetadata;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'queued' | 'received'; // CORREGIDO: Agregado "queued" y "received"
  type: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker';
  recipientIdentifier?: string; // "whatsapp:+5214773790"
  senderIdentifier?: string; // "agent:admin@company.com"
  userAgent?: string;
  updatedAt: string; // "11 de agosto de 2025, 12:58:20 p.m. UTC-6"
}

export interface MessageMetadata {
  agentId: string; // "admin@company.com"
  ip: string; // "189.162.163.251"
  requestId: string; // "unknown"
  sentBy: string; // "admin@company.com"
  source: 'web' | 'mobile' | 'api';
  timestamp: string; // "2025-08-11T18:58:20.111Z"
  // Metadata adicional para archivos
  fileSize?: number;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  duration?: number; // Para audios/videos
  thumbnail?: string; // Para videos
}

export interface MessageGroup {
  date: string;
  messages: Message[];
  key?: string; // Clave única para evitar duplicados en React
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface MessageInputData {
  content: string;
  type?: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker';
  replyToMessageId?: string;
  metadata?: Record<string, unknown>;
} 