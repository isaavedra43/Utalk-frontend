/**
 * Servicio de transporte de mensajes
 * Capa thin que maneja envío y normalización de respuestas
 */

import { httpPost } from '$lib/api/http';
import { encodeConvIdForUrl } from './transport';

export interface MessagePayload {
    messageId?: string;
    type: 'text' | 'image' | 'document' | 'audio';
    content: string;
    senderIdentifier: string;
    recipientIdentifier: string;
    metadata: Record<string, any>;
    media?: {
        fileId?: string;
        mediaUrl: string;
        mimeType: string;
        fileName: string;
        fileSize: number;
        durationMs?: number;
    };
}

export interface SendResult {
    message?: any;
    conversation?: any;
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
        
        const response = await httpPost<any>(path, payload);

        return {
            message: response?.message,
            conversation: response?.conversation,
            info: response?.info
        };
    } catch (error: any) {
        // Mapeo de errores del backend
        if (error.message?.includes('MISSING_TOKEN')) {
            throw new Error('Sesión inválida/expirada. Vuelve a iniciar sesión.');
        }
        if (error.message?.includes('VALIDATION_ERROR')) {
            throw new Error('Datos del mensaje inválidos. Verifica el contenido.');
        }
        if (error.message?.includes('CONVERSATION_NOT_FOUND')) {
            throw new Error('La conversación no existe o no tienes acceso.');
        }
        throw new Error('No se pudo enviar el mensaje. Intenta nuevamente.');
    }
} 