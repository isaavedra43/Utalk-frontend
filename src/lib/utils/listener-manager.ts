/**
 * Gestor de Listeners para UTalk
 * Maneja el registro y cleanup seguro de event listeners
 * Previene memory leaks y asegura limpieza correcta
 */

import { logStore } from '$lib/utils/logger';

interface ListenerInfo {
  element: EventTarget;
  event: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
  id: string;
}

class ListenerManager {
  private listeners: Map<string, ListenerInfo> = new Map();
  private isDestroyed = false;

  /**
   * Registra un listener de forma segura
   */
  addListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): string {
    if (this.isDestroyed) {
      logStore('listener-manager: intentando agregar listener después de destrucción');
      return '';
    }

    const id = `${event}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const listenerInfo: ListenerInfo = {
      element,
      event,
      handler,
      options,
      id
    };

    try {
      element.addEventListener(event, handler, options);
      this.listeners.set(id, listenerInfo);

      logStore('listener-manager: listener registrado', {
        id,
        event,
        elementType: element.constructor.name
      });

      return id;
    } catch (error) {
      logStore('listener-manager: error registrando listener', {
        error: String(error),
        event,
        elementType: element.constructor.name
      });
      return '';
    }
  }

  /**
   * Remueve un listener específico
   */
  removeListener(id: string): boolean {
    const listenerInfo = this.listeners.get(id);
    if (!listenerInfo) {
      logStore('listener-manager: listener no encontrado', { id });
      return false;
    }

    try {
      listenerInfo.element.removeEventListener(
        listenerInfo.event,
        listenerInfo.handler,
        listenerInfo.options
      );

      this.listeners.delete(id);

      logStore('listener-manager: listener removido', {
        id,
        event: listenerInfo.event,
        elementType: listenerInfo.element.constructor.name
      });

      return true;
    } catch (error) {
      logStore('listener-manager: error removiendo listener', {
        error: String(error),
        id,
        event: listenerInfo.event
      });
      return false;
    }
  }

  /**
   * Remueve todos los listeners de un elemento específico
   */
  removeListenersByElement(element: EventTarget): number {
    let removedCount = 0;
    const listenersToRemove: string[] = [];

    for (const [id, listenerInfo] of this.listeners.entries()) {
      if (listenerInfo.element === element) {
        listenersToRemove.push(id);
      }
    }

    for (const id of listenersToRemove) {
      if (this.removeListener(id)) {
        removedCount++;
      }
    }

    logStore('listener-manager: listeners removidos por elemento', {
      elementType: element.constructor.name,
      removedCount
    });

    return removedCount;
  }

  /**
   * Remueve todos los listeners de un tipo de evento específico
   */
  removeListenersByEvent(event: string): number {
    let removedCount = 0;
    const listenersToRemove: string[] = [];

    for (const [id, listenerInfo] of this.listeners.entries()) {
      if (listenerInfo.event === event) {
        listenersToRemove.push(id);
      }
    }

    for (const id of listenersToRemove) {
      if (this.removeListener(id)) {
        removedCount++;
      }
    }

    logStore('listener-manager: listeners removidos por evento', {
      event,
      removedCount
    });

    return removedCount;
  }

  /**
   * Limpia todos los listeners registrados
   */
  cleanup(): number {
    if (this.isDestroyed) {
      return 0;
    }

    const totalListeners = this.listeners.size;
    const listenersToRemove = Array.from(this.listeners.keys());

    for (const id of listenersToRemove) {
      this.removeListener(id);
    }

    this.isDestroyed = true;

    logStore('listener-manager: cleanup completado', {
      totalListenersRemoved: totalListeners
    });

    return totalListeners;
  }

  /**
   * Obtiene información sobre los listeners activos
   */
  getActiveListeners(): Array<{ id: string; event: string; elementType: string }> {
    return Array.from(this.listeners.values()).map(listener => ({
      id: listener.id,
      event: listener.event,
      elementType: listener.element.constructor.name
    }));
  }

  /**
   * Verifica si hay listeners activos
   */
  hasActiveListeners(): boolean {
    return this.listeners.size > 0;
  }

  /**
   * Obtiene el número de listeners activos
   */
  getListenerCount(): number {
    return this.listeners.size;
  }
}

// Instancia global del gestor de listeners
export const listenerManager = new ListenerManager();

// Cleanup automático al cerrar la ventana
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    listenerManager.cleanup();
  });
}
