/**
 * Sistema de Monitoreo Exhaustivo para UTalk
 * Tracking de procesos críticos, performance y errores
 */

import { notificationsStore } from '$lib/stores/notifications.store';
import { logStore } from '$lib/utils/logger';

interface PerformanceMetric {
    operation: string;
    duration: number;
    timestamp: string;
    success: boolean;
    error?: string;
    context?: Record<string, unknown>;
}

interface ErrorMetric {
    error: string;
    operation: string;
    timestamp: string;
    context?: Record<string, unknown>;
    stack?: string;
}

interface SocketMetric {
    event: string;
    timestamp: string;
    success: boolean;
    error?: string;
    data?: Record<string, unknown>;
}

class MonitoringSystem {
    private performanceMetrics: PerformanceMetric[] = [];
    private errorMetrics: ErrorMetric[] = [];
    private socketMetrics: SocketMetric[] = [];
    private isEnabled = true;

    /**
     * Trackea performance de operaciones
     */
    trackPerformance(
        operation: string,
        startTime: number,
        success: boolean,
        error?: string,
        context?: Record<string, unknown>
    ): void {
        if (!this.isEnabled) return;

        const duration = Date.now() - startTime;
        const metric: PerformanceMetric = {
            operation,
            duration,
            timestamp: new Date().toISOString(),
            success,
            error,
            context
        };

        this.performanceMetrics.push(metric);

        logStore('monitoring: performance', {
            operation,
            duration: `${duration}ms`,
            success,
            error,
            context
        });

        // Alertar si la operación es muy lenta
        if (duration > 5000) {
            logStore('monitoring: operación lenta detectada', {
                operation,
                duration: `${duration}ms`,
                threshold: '5000ms'
            });
        }
    }

    /**
     * Trackea errores específicos
     */
    trackError(
        error: string,
        operation: string,
        context?: Record<string, unknown>,
        stack?: string
    ): void {
        if (!this.isEnabled) return;

        const metric: ErrorMetric = {
            error,
            operation,
            timestamp: new Date().toISOString(),
            context,
            stack
        };

        this.errorMetrics.push(metric);

        logStore('monitoring: error', {
            error,
            operation,
            context,
            hasStack: !!stack
        });

        // Notificar al usuario si es un error crítico
        if (this.isCriticalError(error)) {
            notificationsStore.error(`Error en ${operation}: ${error}`);
        }
    }

    /**
     * Trackea eventos de socket
     */
    trackSocketEvent(
        event: string,
        success: boolean,
        error?: string,
        data?: Record<string, unknown>
    ): void {
        if (!this.isEnabled) return;

        const metric: SocketMetric = {
            event,
            timestamp: new Date().toISOString(),
            success,
            error,
            data
        };

        this.socketMetrics.push(metric);

        logStore('monitoring: socket event', {
            event,
            success,
            error,
            hasData: !!data
        });

        // Alertar si hay muchos errores de socket
        const recentSocketErrors = this.socketMetrics.filter(
            m => !m.success &&
                new Date(m.timestamp).getTime() > Date.now() - 60000 // Último minuto
        );

        if (recentSocketErrors.length > 5) {
            logStore('monitoring: muchos errores de socket detectados', {
                errorCount: recentSocketErrors.length,
                timeWindow: '1 minuto'
            });
        }
    }

    /**
     * Trackea carga de conversaciones
     */
    trackConversationsLoad(
        startTime: number,
        success: boolean,
        count: number,
        error?: string
    ): void {
        this.trackPerformance(
            'load_conversations',
            startTime,
            success,
            error,
            { count }
        );

        if (success) {
            logStore('monitoring: conversaciones cargadas', {
                count,
                duration: `${Date.now() - startTime}ms`
            });
        }
    }

    /**
     * Trackea carga de mensajes
     */
    trackMessagesLoad(
        startTime: number,
        success: boolean,
        conversationId: string,
        count: number,
        error?: string
    ): void {
        this.trackPerformance(
            'load_messages',
            startTime,
            success,
            error,
            { conversationId, count }
        );

        if (success) {
            logStore('monitoring: mensajes cargados', {
                conversationId,
                count,
                duration: `${Date.now() - startTime}ms`
            });
        }
    }

    /**
     * Trackea envío de mensajes
     */
    trackMessageSend(
        startTime: number,
        success: boolean,
        conversationId: string,
        messageType: string,
        hasAttachments: boolean,
        error?: string
    ): void {
        this.trackPerformance(
            'send_message',
            startTime,
            success,
            error,
            { conversationId, messageType, hasAttachments }
        );

        if (success) {
            logStore('monitoring: mensaje enviado', {
                conversationId,
                messageType,
                hasAttachments,
                duration: `${Date.now() - startTime}ms`
            });
        } else {
            logStore('monitoring: error enviando mensaje', {
                conversationId,
                messageType,
                hasAttachments,
                error,
                duration: `${Date.now() - startTime}ms`
            });
        }
    }

    /**
     * Trackea uploads de archivos
     */
    trackFileUpload(
        startTime: number,
        success: boolean,
        filename: string,
        size: number,
        error?: string
    ): void {
        this.trackPerformance(
            'upload_file',
            startTime,
            success,
            error,
            { filename, size }
        );

        if (success) {
            logStore('monitoring: archivo subido', {
                filename,
                size: `${(size / 1024 / 1024).toFixed(2)}MB`,
                duration: `${Date.now() - startTime}ms`
            });
        } else {
            logStore('monitoring: error subiendo archivo', {
                filename,
                size: `${(size / 1024 / 1024).toFixed(2)}MB`,
                error,
                duration: `${Date.now() - startTime}ms`
            });
        }
    }

    /**
     * Trackea reconexiones de socket
     */
    trackSocketReconnection(
        attempt: number,
        success: boolean,
        duration: number,
        error?: string
    ): void {
        logStore('monitoring: reconexión de socket', {
            attempt,
            success,
            duration: `${duration}ms`,
            error
        });

        if (!success && attempt > 3) {
            notificationsStore.warning('Problemas de conexión detectados');
        }
    }

    /**
     * Trackea cambios de estado de conversación
     */
    trackConversationStateChange(
        conversationId: string,
        oldStatus: string,
        newStatus: string,
        trigger: string
    ): void {
        logStore('monitoring: cambio de estado de conversación', {
            conversationId,
            oldStatus,
            newStatus,
            trigger
        });
    }

    /**
     * Trackea validaciones
     */
    trackValidation(
        type: string,
        success: boolean,
        input: string,
        error?: string
    ): void {
        logStore('monitoring: validación', {
            type,
            success,
            inputLength: input.length,
            error
        });
    }

    /**
     * Trackea rate limiting
     */
    trackRateLimit(
        endpoint: string,
        remaining: number,
        resetTime: string
    ): void {
        logStore('monitoring: rate limit', {
            endpoint,
            remaining,
            resetTime
        });

        if (remaining < 5) {
            notificationsStore.warning('Límite de peticiones próximo');
        }
    }

    /**
     * Determina si un error es crítico
     */
    private isCriticalError(error: string): boolean {
        const criticalErrors = [
            'TOKEN_EXPIRED',
            'UNAUTHORIZED',
            'FORBIDDEN',
            'RATE_LIMIT_EXCEEDED',
            'NETWORK_ERROR',
            'SOCKET_DISCONNECTED'
        ];

        return criticalErrors.some(critical =>
            error.toUpperCase().includes(critical)
        );
    }

    /**
     * Obtiene métricas de performance
     */
    getPerformanceMetrics(): PerformanceMetric[] {
        return this.performanceMetrics;
    }

    /**
     * Obtiene métricas de errores
     */
    getErrorMetrics(): ErrorMetric[] {
        return this.errorMetrics;
    }

    /**
     * Obtiene métricas de socket
     */
    getSocketMetrics(): SocketMetric[] {
        return this.socketMetrics;
    }

    /**
     * Limpia métricas antiguas (más de 1 hora)
     */
    cleanupOldMetrics(): void {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;

        this.performanceMetrics = this.performanceMetrics.filter(
            m => new Date(m.timestamp).getTime() > oneHourAgo
        );

        this.errorMetrics = this.errorMetrics.filter(
            m => new Date(m.timestamp).getTime() > oneHourAgo
        );

        this.socketMetrics = this.socketMetrics.filter(
            m => new Date(m.timestamp).getTime() > oneHourAgo
        );

        logStore('monitoring: métricas antiguas limpiadas');
    }

    /**
     * Habilita/deshabilita el monitoreo
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        logStore('monitoring: estado cambiado', { enabled });
    }

    /**
     * Obtiene resumen de métricas
     */
    getMetricsSummary(): Record<string, unknown> {
        const totalOperations = this.performanceMetrics.length;
        const successfulOperations = this.performanceMetrics.filter(m => m.success).length;
        const totalErrors = this.errorMetrics.length;
        const totalSocketEvents = this.socketMetrics.length;
        const successfulSocketEvents = this.socketMetrics.filter(m => m.success).length;

        const avgDuration = totalOperations > 0
            ? this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations
            : 0;

        return {
            totalOperations,
            successfulOperations,
            successRate: totalOperations > 0 ? (successfulOperations / totalOperations * 100).toFixed(2) + '%' : '0%',
            totalErrors,
            totalSocketEvents,
            successfulSocketEvents,
            socketSuccessRate: totalSocketEvents > 0 ? (successfulSocketEvents / totalSocketEvents * 100).toFixed(2) + '%' : '0%',
            averageDuration: `${avgDuration.toFixed(2)}ms`
        };
    }
}

// Instancia global del sistema de monitoreo
export const monitoringSystem = new MonitoringSystem();

// Funciones de conveniencia para uso directo
export const trackPerformance = (
    operation: string,
    startTime: number,
    success: boolean,
    error?: string,
    context?: Record<string, unknown>
) => monitoringSystem.trackPerformance(operation, startTime, success, error, context);

export const trackError = (
    error: string,
    operation: string,
    context?: Record<string, unknown>,
    stack?: string
) => monitoringSystem.trackError(error, operation, context, stack);

export const trackSocketEvent = (
    event: string,
    success: boolean,
    error?: string,
    data?: Record<string, unknown>
) => monitoringSystem.trackSocketEvent(event, success, error, data);

export const trackConversationsLoad = (
    startTime: number,
    success: boolean,
    count: number,
    error?: string
) => monitoringSystem.trackConversationsLoad(startTime, success, count, error);

export const trackMessagesLoad = (
    startTime: number,
    success: boolean,
    conversationId: string,
    count: number,
    error?: string
) => monitoringSystem.trackMessagesLoad(startTime, success, conversationId, count, error);

export const trackMessageSend = (
    startTime: number,
    success: boolean,
    conversationId: string,
    messageType: string,
    hasAttachments: boolean,
    error?: string
) => monitoringSystem.trackMessageSend(startTime, success, conversationId, messageType, hasAttachments, error);

export const trackFileUpload = (
    startTime: number,
    success: boolean,
    filename: string,
    size: number,
    error?: string
) => monitoringSystem.trackFileUpload(startTime, success, filename, size, error);

export const trackSocketReconnection = (
    attempt: number,
    success: boolean,
    duration: number,
    error?: string
) => monitoringSystem.trackSocketReconnection(attempt, success, duration, error);

export const trackConversationStateChange = (
    conversationId: string,
    oldStatus: string,
    newStatus: string,
    trigger: string
) => monitoringSystem.trackConversationStateChange(conversationId, oldStatus, newStatus, trigger);

export const trackValidation = (
    type: string,
    success: boolean,
    input: string,
    error?: string
) => monitoringSystem.trackValidation(type, success, input, error);

export const trackRateLimit = (
    endpoint: string,
    remaining: number,
    resetTime: string
) => monitoringSystem.trackRateLimit(endpoint, remaining, resetTime);

export const getMetricsSummary = () => monitoringSystem.getMetricsSummary(); 