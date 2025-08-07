// Utilidades de validación - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md Fase 1.3
import { environment } from '../config/environment';

// Validación de teléfono - Documento sección "Validación de Teléfonos"
export const validatePhone = (phone: string): boolean => {
    return environment.PHONE_REGEX.test(phone);
};

// Validación de mensaje con emojis - Documento sección "Consideraciones Especiales con Emojis"
export const validateMessage = (text: string): { valid: boolean; error?: string; remaining?: number } => {
    // Contar bytes reales, no caracteres - Documento: "Límite real: 4096 bytes, no caracteres"
    const byteLength = new TextEncoder().encode(text).length;

    if (byteLength > environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH) {
        return {
            valid: false,
            error: `Mensaje demasiado largo (${byteLength}/${environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH} bytes)`
        };
    }

    return {
        valid: true,
        remaining: environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH - byteLength
    };
};

// Validación de archivos - Documento sección "Validación de Archivos"
export const validateFileUpload = (files: File[]): { valid: boolean; error?: string } => {
    // Verificar número máximo de archivos - Documento: "Máximo 10 archivos por mensaje"
    if (files.length > environment.VALIDATION_LIMITS.MAX_FILES_PER_MESSAGE) {
        return {
            valid: false,
            error: `Máximo ${environment.VALIDATION_LIMITS.MAX_FILES_PER_MESSAGE} archivos por mensaje`
        };
    }

    // Verificar cada archivo individualmente
    for (const file of files) {
        // Verificar tamaño máximo - Documento: "100MB por archivo"
        if (file.size > environment.VALIDATION_LIMITS.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `Archivo ${file.name} excede ${environment.VALIDATION_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`
            };
        }

        // Verificar tipo MIME permitido - Documento: "Tipos permitidos"
        if (!environment.ALLOWED_FILE_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: `Tipo de archivo no permitido: ${file.type}`
            };
        }

        // Verificar extensión bloqueada - Documento: "Tipos bloqueados"
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (environment.BLOCKED_EXTENSIONS.includes(extension)) {
            return {
                valid: false,
                error: `Extensión bloqueada: ${extension}`
            };
        }
    }

    return { valid: true };
};

// Validación de nombre de contacto - Documento sección "Validaciones Específicas"
export const validateContactName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'El nombre es requerido' };
    }

    if (name.length > 100) {
        return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
    }

    return { valid: true };
};

// Validación de notas de contacto - Documento sección "Validaciones Específicas"
export const validateContactNotes = (notes: string): { valid: boolean; error?: string } => {
    if (notes && notes.length > 500) {
        return { valid: false, error: 'Las notas no pueden exceder 500 caracteres' };
    }

    return { valid: true };
};

// Validación de UUID - Documento sección "Validación de IDs"
export const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

// Validación de email - Documento sección "Validaciones en Formularios"
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.trim().length === 0) {
        return { valid: false, error: 'El email es requerido' };
    }

    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Formato de email inválido' };
    }

    return { valid: true };
};

// Validación de contraseña - Documento sección "Validaciones en Formularios"
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
    if (!password || password.length === 0) {
        return { valid: false, error: 'La contraseña es requerida' };
    }

    if (password.length < 6) {
        return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    return { valid: true };
};

// Función helper para obtener el tamaño de archivo en formato legible
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función helper para obtener el tipo de archivo desde la extensión
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