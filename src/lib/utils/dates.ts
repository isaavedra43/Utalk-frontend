// Utilidad de fechas - Extraído de PLAN_FRONTEND_UTALK_COMPLETO.md Fase 1.4
// Maneja los 6 formatos distintos de fecha que puede responder el backend

export const safeDateToISOString = (date: any): string | null => {
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
    if (date._seconds) {
        // Firestore timestamp
        return new Date(date._seconds * 1000).toISOString();
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
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
    } catch (error) {
        console.warn('No se pudo parsear la fecha:', date);
    }

    return null;
};

// Función helper para formatear fecha para mostrar en UI
export const formatDateForDisplay = (date: any): string => {
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
export const formatRelativeDate = (date: any): string => {
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
export const isRecentDate = (date: any): boolean => {
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
export const getMinutesDifference = (date1: any, date2: any): number => {
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