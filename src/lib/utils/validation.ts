// Utilidades de validación - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md Fase 1.3
import { logStore } from '$lib/utils/logger';
import { canSendMessages } from '$lib/utils/permissions';
import { validateFile, validateFiles, validateMessageByBytes } from '$lib/utils/security';

/**
 * Valida un número de teléfono según el formato internacional
 */
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phone);

    logStore('validation: validación de teléfono', {
        phone,
        isValid
    });

    return isValid;
};

/**
 * Valida un mensaje de texto (usando validación por bytes)
 */
export const validateMessage = (text: string): { valid: boolean; error?: string } => {
    const validation = validateMessageByBytes(text);

    logStore('validation: validación de mensaje', {
        characterCount: text.length,
        byteCount: validation.byteCount,
        isValid: validation.valid,
        error: validation.error
    });

    return {
        valid: validation.valid,
        error: validation.error
    };
};

/**
 * Valida archivos adjuntos usando el sistema de seguridad
 */
export const validateFileUpload = async (files: File[]): Promise<{ valid: boolean; error?: string }> => {
    const validation = await validateFiles(files);

    logStore('validation: validación de archivos', {
        fileCount: files.length,
        isValid: validation.valid,
        error: validation.error,
        validFilesCount: validation.validFiles.length
    });

    return {
        valid: validation.valid,
        error: validation.error
    };
};

/**
 * Valida si el usuario puede enviar mensajes a una conversación específica
 */
export const validateCanSendMessage = (conversationId?: string, assignedTo?: string | null): { valid: boolean; error?: string } => {
    const canSend = canSendMessages(conversationId, assignedTo);

    if (!canSend) {
        const error = assignedTo === null
            ? 'No se pueden enviar mensajes a conversaciones sin agente asignado'
            : 'No tienes permisos para enviar mensajes';

        logStore('validation: no puede enviar mensajes', {
            conversationId,
            assignedTo,
            error
        });

        return { valid: false, error };
    }

    logStore('validation: puede enviar mensajes', {
        conversationId,
        assignedTo
    });

    return { valid: true };
};

/**
 * Valida un email
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    logStore('validation: validación de email', {
        email,
        isValid
    });

    return isValid;
};

/**
 * Valida un nombre (no vacío, longitud razonable)
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'El nombre no puede estar vacío' };
    }

    if (name.trim().length < 2) {
        return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (name.trim().length > 100) {
        return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
    }

    logStore('validation: validación de nombre', {
        name: name.trim(),
        length: name.trim().length,
        isValid: true
    });

    return { valid: true };
};

/**
 * Valida un mensaje de texto con límites específicos
 */
export const validateMessageWithLimits = (text: string, maxLength: number = 4096): { valid: boolean; error?: string; remaining: number } => {
    const validation = validateMessageByBytes(text);
    const remaining = maxLength - validation.byteCount;

    if (!validation.valid) {
        return {
            valid: false,
            error: validation.error,
            remaining: 0
        };
    }

    logStore('validation: validación de mensaje con límites', {
        characterCount: text.length,
        byteCount: validation.byteCount,
        maxLength,
        remaining,
        isValid: true
    });

    return {
        valid: true,
        remaining
    };
};

/**
 * Valida un archivo individual
 */
export const validateSingleFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    const validation = await validateFile(file);

    logStore('validation: validación de archivo individual', {
        filename: file.name,
        size: file.size,
        type: file.type,
        isValid: validation.valid,
        error: validation.error
    });

    return validation;
};

/**
 * Valida múltiples archivos con límites
 */
export const validateMultipleFiles = async (files: File[], maxFiles: number = 10): Promise<{ valid: boolean; error?: string; validFiles: File[] }> => {
    if (files.length > maxFiles) {
        const error = `Demasiados archivos: ${files.length} (máximo ${maxFiles})`;

        logStore('validation: demasiados archivos', {
            fileCount: files.length,
            maxFiles,
            error
        });

        return { valid: false, error, validFiles: [] };
    }

    const validation = await validateFiles(files);

    logStore('validation: validación de múltiples archivos', {
        fileCount: files.length,
        maxFiles,
        isValid: validation.valid,
        error: validation.error,
        validFilesCount: validation.validFiles.length
    });

    return validation;
};

/**
 * Valida un objeto de conversación
 */
export const validateConversation = (conversation: any): { valid: boolean; error?: string } => {
    if (!conversation) {
        return { valid: false, error: 'Conversación no válida' };
    }

    if (!conversation.id) {
        return { valid: false, error: 'Conversación sin ID' };
    }

    if (!conversation.participants || !Array.isArray(conversation.participants)) {
        return { valid: false, error: 'Conversación sin participantes válidos' };
    }

    logStore('validation: validación de conversación', {
        conversationId: conversation.id,
        participantCount: conversation.participants.length,
        isValid: true
    });

    return { valid: true };
};

/**
 * Valida un objeto de mensaje
 */
export const validateMessageObject = (message: any): { valid: boolean; error?: string } => {
    if (!message) {
        return { valid: false, error: 'Mensaje no válido' };
    }

    if (!message.id) {
        return { valid: false, error: 'Mensaje sin ID' };
    }

    if (!message.content && !message.mediaUrl) {
        return { valid: false, error: 'Mensaje sin contenido' };
    }

    if (!message.conversationId) {
        return { valid: false, error: 'Mensaje sin conversación' };
    }

    logStore('validation: validación de objeto mensaje', {
        messageId: message.id,
        hasContent: !!message.content,
        hasMedia: !!message.mediaUrl,
        conversationId: message.conversationId,
        isValid: true
    });

    return { valid: true };
};

/**
 * Función helper para obtener el tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Función helper para obtener el tipo de archivo desde la extensión
 */
export const getFileTypeFromExtension = (filename: string): string => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const audioExtensions = ['.mp3', '.ogg', '.wav', '.m4a'];
    const videoExtensions = ['.mp4', '.webm', '.avi', '.mov'];
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt'];

    if (imageExtensions.includes(extension)) return 'image';
    if (audioExtensions.includes(extension)) return 'audio';
    if (videoExtensions.includes(extension)) return 'video';
    if (documentExtensions.includes(extension)) return 'document';

    return 'unknown';
}; 