// Utilidad de fechas - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md Fase 1.4
// Maneja los 6 formatos distintos de fecha que puede responder el backend

import { logDebug } from './logger';

// ✅ Tipos específicos para fechas según documentación del backend
export type DateInput =
    | string                    // ISO string - "2025-01-15T10:30:00Z"
    | number                    // Timestamp numérico - 1705312200000
    | Date                      // Instancia de Date
    | null                      // null
    | undefined                 // undefined
    | FirestoreTimestamp        // Objetos Firestore
    | unknown;                  // Otros formatos

export interface FirestoreTimestamp {
    _seconds: number;
    _nanoseconds?: number;
}

export const safeDateToISOString = (date: DateInput): string | null => {
    if (!date) return null;

    // 1. ISO string - Documento: "ISO string - 2025-01-15T10:30:00Z"
    if (typeof date === 'string') {
        return date;
    }

    // 2. Timestamp numérico - Documento: "Timestamp numérico - 1705312200000"
    if (typeof date === 'number') {
        return new Date(date).toISOString();
    }

    // 3. Objetos Firestore - Documento: "Objetos Firestore con _seconds/_nanoseconds"
    if (typeof date === 'object' && date !== null && '_seconds' in date) {
        const firestoreDate = date as FirestoreTimestamp;
        return new Date(firestoreDate._seconds * 1000).toISOString();
    }

    // 4. Instancia de Date
    if (date instanceof Date) {
        return date.toISOString();
    }

    // 5. null - Documento: "null - null"
    if (date === null) {
        return null;
    }

    // 6. undefined - Documento: "undefined - undefined"
    if (date === undefined) {
        return null;
    }

    // Otros formatos específicos - Documento: "Otros formatos específicos"
    try {
        const parsedDate = new Date(date as string | number);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    } catch (error) {
        logDebug('No se pudo parsear la fecha:', String(date));
    }

    return null;
};

// Función helper para formatear fecha para mostrar en UI
export const formatDateForDisplay = (date: DateInput): string => {
    const isoString = safeDateToISOString(date);
    if (!isoString) return 'Fecha no disponible';

    try {
        const dateObj = new Date(isoString);
        return dateObj.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Fecha no disponible';
    }
};

// Función helper para formatear fecha relativa (hace X tiempo)
export const formatRelativeDate = (date: DateInput): string => {
    const isoString = safeDateToISOString(date);
    if (!isoString) return 'Fecha no disponible';

    try {
        const dateObj = new Date(isoString);
        const now = new Date();
        const diffInMs = now.getTime() - dateObj.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) {
            return 'Ahora mismo';
        } else if (diffInMinutes < 60) {
            return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        } else if (diffInHours < 24) {
            return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        } else if (diffInDays < 7) {
            return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        } else {
            return formatDateForDisplay(date);
        }
    } catch (error) {
        return 'Fecha no disponible';
    }
};

// Función helper para verificar si una fecha es reciente (últimas 24 horas)
export const isRecentDate = (date: DateInput): boolean => {
    const isoString = safeDateToISOString(date);
    if (!isoString) return false;

    try {
        const dateObj = new Date(isoString);
        const now = new Date();
        const diffInMs = now.getTime() - dateObj.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return diffInHours < 24;
    } catch (error) {
        return false;
    }
};

// Función helper para obtener la diferencia en minutos entre dos fechas
export const getMinutesDifference = (date1: DateInput, date2: DateInput): number => {
    const isoString1 = safeDateToISOString(date1);
    const isoString2 = safeDateToISOString(date2);

    if (!isoString1 || !isoString2) return 0;

    try {
        const dateObj1 = new Date(isoString1);
        const dateObj2 = new Date(isoString2);
        const diffInMs = Math.abs(dateObj1.getTime() - dateObj2.getTime());
        return Math.floor(diffInMs / (1000 * 60));
    } catch (error) {
        return 0;
    }
};

export const formatRelativeTime = (date: DateInput): string => {
    const isoString = safeDateToISOString(date);
    if (!isoString) return 'Fecha no disponible';

    try {
        const now = new Date();
        const targetDate = new Date(isoString);
        const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'ahora';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `hace ${days} día${days > 1 ? 's' : ''}`;
        }
    } catch (error) {
        return 'Fecha no disponible';
    }
}; 