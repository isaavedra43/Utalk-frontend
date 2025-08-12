/**
 * Servicio de transporte de mensajes
 * Capa thin que maneja envío y normalización de respuestas
 */

import { httpPost } from '$lib/api/http';
import { encodeConvIdForUrl } from './transport';

// Tipos locales para evitar dependencias circulares
interface Message {
  id: string;
  conversationId: string;
  type: 'text' | 'file';
  content: string | null;
  attachments: Array<{ id: string; url: string; mime: string; name: string; size: number; type: string }>;
  senderId: string;
  createdAt: string;
  updatedAt?: string;
  status?: 'pending' | 'sent' | 'failed';
}

interface SendMessageResult {
  success: boolean;
  message: Message;
}

export interface MessagePayload {
    messageId?: string;
    type: 'text' | 'file';
    content: string;
    senderIdentifier: string;
    recipientIdentifier: string;
    metadata: Record<string, unknown>;
    attachments?: Array<{ id: string }>;
}

export interface SendResult {
    message?: Message;
    conversation?: unknown;
    info?: string;
}

/**
 * Envía un mensaje usando el endpoint canónico
 */
export async function sendOutboundMessage(
    conversationId: string,
    payload: MessagePayload
): Promise<SendResult> {
    try {
        const path = `conversations/${encodeConvIdForUrl(conversationId)}/messages`;
        
        const response = await httpPost<SendMessageResult>(path, payload);

        return {
            message: response?.message,
            conversation: undefined,
            info: response?.success ? 'Mensaje enviado exitosamente' : undefined
        };
    } catch (error: unknown) {
        // Mapeo de errores del backend
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('MISSING_TOKEN')) {
            throw new Error('Sesión inválida/expirada. Vuelve a iniciar sesión.');
        }
        if (errorMessage.includes('VALIDATION_ERROR')) {
            throw new Error('Datos del mensaje inválidos. Verifica el contenido.');
        }
        if (errorMessage.includes('CONVERSATION_NOT_FOUND')) {
            throw new Error('La conversación no existe o no tienes acceso.');
        }
        throw new Error('No se pudo enviar el mensaje. Intenta nuevamente.');
    }
} 