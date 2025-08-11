/**
 * Servicio de Cleanup Global para UTalk
 * Maneja la limpieza de todos los stores y servicios al hacer logout
 */

import { authStore } from '$lib/stores/auth.store';
import { conversationsStore } from '$lib/stores/conversations.store';
import { messagesStore } from '$lib/stores/messages.store';
import { notificationsStore } from '$lib/stores/notifications.store';
import { presenceStore } from '$lib/stores/presence.store';
import { typingStore } from '$lib/stores/typing.store';
import { logStore } from '$lib/utils/logger';

class CleanupService {
    private isCleaning = false;

    /**
     * Limpia todos los stores y servicios
     * Se ejecuta al hacer logout o cuando se detecta una sesión inválida
     */
    async performGlobalCleanup(): Promise<void> {
        if (this.isCleaning) {
            logStore('cleanup: ya se está ejecutando un cleanup, saltando');
            return;
        }

        this.isCleaning = true;
        logStore('cleanup: iniciando limpieza global');

        try {
            // Limpiar stores en orden específico para evitar dependencias
            await this.cleanupStores();
            await this.cleanupServices();
            await this.cleanupStorage();

            logStore('cleanup: limpieza global completada exitosamente');
        } catch (error) {
            logStore('cleanup: error durante limpieza global', { error: String(error) });
        } finally {
            this.isCleaning = false;
        }
    }

    /**
     * Limpia todos los stores
     */
    private async cleanupStores(): Promise<void> {
        logStore('cleanup: limpiando stores');

        // Limpiar stores en orden de dependencias
        notificationsStore.cleanup();
        typingStore.cleanup();
        presenceStore.cleanup();
        messagesStore.clearMessages();
        conversationsStore.cleanup();
        authStore.clear();

        logStore('cleanup: stores limpiados');
    }

    /**
     * Limpia servicios externos (Socket.IO, etc.)
     */
    private async cleanupServices(): Promise<void> {
        logStore('cleanup: limpiando servicios');

        // Limpiar Socket.IO si está disponible
        if (typeof window !== 'undefined' && (window as { socketManager?: { disconnect: () => void } }).socketManager) {
            try {
                (window as { socketManager?: { disconnect: () => void } }).socketManager?.disconnect();
                logStore('cleanup: socket desconectado');
            } catch (error) {
                logStore('cleanup: error desconectando socket', { error: String(error) });
            }
        }

        // Limpiar cualquier intervalo o timeout activo
        this.clearActiveTimers();

        logStore('cleanup: servicios limpiados');
    }

    /**
     * Limpia el almacenamiento local
     */
    private async cleanupStorage(): Promise<void> {
        logStore('cleanup: limpiando almacenamiento');

        try {
            // Limpiar localStorage
            const keysToKeep = ['utalk-logout-timestamp']; // Mantener timestamp de logout
            const keysToRemove = Object.keys(localStorage).filter(key => !keysToKeep.includes(key));

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            // Limpiar sessionStorage
            sessionStorage.clear();

            logStore('cleanup: almacenamiento limpiado', {
                keysRemoved: keysToRemove.length
            });
        } catch (error) {
            logStore('cleanup: error limpiando almacenamiento', { error: String(error) });
        }
    }

    /**
     * Limpia timers activos
     */
    private clearActiveTimers(): void {
        // Limpiar timeouts y intervals específicos de la aplicación
        // Esto es una implementación básica, se puede expandir según necesidades

        // Nota: En navegadores modernos, no es posible limpiar todos los timers
        // Esta función es más simbólica y se puede expandir según necesidades específicas
        logStore('cleanup: timers activos (limpieza simbólica)');
    }

    /**
     * Configura listeners para sincronización entre pestañas
     */
    setupCrossTabSync(): void {
        if (typeof window === 'undefined') return;

        // Listener para logout en otras pestañas
        window.addEventListener('storage', (event) => {
            if (event.key === 'utalk-logout-timestamp' && event.newValue) {
                logStore('cleanup: detectado logout en otra pestaña');
                this.performGlobalCleanup();
            }
        });

        // Listener para evento personalizado de logout
        window.addEventListener('utalk-logout', () => {
            logStore('cleanup: detectado evento de logout');
            this.performGlobalCleanup();
        });

        logStore('cleanup: listeners de sincronización configurados');
    }

    /**
     * Valida si la sesión actual es válida
     */
    validateSession(): boolean {
        const isValid = authStore.validateToken();

        if (!isValid) {
            logStore('cleanup: sesión inválida detectada, iniciando cleanup');
            this.performGlobalCleanup();
        }

        return isValid;
    }
}

// Instancia global del servicio de cleanup
export const cleanupService = new CleanupService();

// Configurar sincronización entre pestañas al inicializar
if (typeof window !== 'undefined') {
    cleanupService.setupCrossTabSync();
} 