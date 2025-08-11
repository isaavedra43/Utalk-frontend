import { get } from 'svelte/store';
import { authStore } from '../stores/auth.store';

/**
 * Construye el senderIdentifier según el contrato canónico
 * @param conversation - Conversación activa
 * @returns string - senderIdentifier en formato agent:<email>
 */
export function buildSenderIdentifier(conversation: any): string {
    const auth = get(authStore);

    if (!auth.user?.email) {
        throw new Error('Usuario no autenticado o sin email');
    }

    // Usar esquema de agente: agent:<email>
    return `agent:${auth.user.email}`;
}

/**
 * Construye el recipientIdentifier según el contrato canónico
 * @param conversation - Conversación activa
 * @returns string - recipientIdentifier en formato whatsapp:+52XXXXXXXXXX
 */
export function buildRecipientIdentifier(conversation: any): string {
    if (!conversation?.customerPhone) {
        throw new Error('Conversación sin customerPhone');
    }

    // Asegurar formato whatsapp:+52XXXXXXXXXX
    const phone = conversation.customerPhone;

    // Si ya tiene prefijo whatsapp:, usarlo tal como está
    if (phone.startsWith('whatsapp:')) {
        return phone;
    }

    // Si no tiene prefijo, agregarlo
    return `whatsapp:${phone}`;
}

/**
 * Valida el contenido del mensaje según el contrato canónico
 * @param content - Contenido del mensaje
 * @returns { valid: boolean; error?: string }
 */
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
    const trimmed = content.trim();

    if (!trimmed) {
        return { valid: false, error: 'El mensaje no puede estar vacío' };
    }

    if (trimmed.length > 1000) {
        return { valid: false, error: 'El mensaje no puede exceder 1000 caracteres' };
    }

    return { valid: true };
}

/**
 * Construye el metadata del mensaje según el contrato canónico
 * @param conversation - Conversación activa
 * @returns object - metadata con source y agentId
 */
export function buildMessageMetadata(conversation: any): Record<string, any> {
    const auth = get(authStore);

    return {
        source: 'web',
        agentId: auth.user?.id || auth.user?.email,
        timestamp: new Date().toISOString()
    };
} 