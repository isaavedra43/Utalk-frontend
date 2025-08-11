/**
 * Servicio de transporte de mensajes
 * Capa thin que maneja envío y normalización de respuestas
 */

import { api } from './axios';
import { encodeConvIdForUrl, mapApiError, normalizeApiResponse } from './transport';

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
        const url = `/api/conversations/${encodeConvIdForUrl(conversationId)}/messages`;

        const response = await api.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const normalized = normalizeApiResponse(response);

        if (!normalized.ok) {
            throw new Error('Respuesta no exitosa del servidor');
        }

        return {
            message: normalized.message,
            conversation: normalized.conversation,
            info: normalized.info
        };
    } catch (error: any) {
        const apiError = mapApiError(error);
        throw new Error(apiError.message);
    }
} 