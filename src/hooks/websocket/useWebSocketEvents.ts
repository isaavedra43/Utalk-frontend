import { useCallback } from 'react';
import { infoLog } from '../../config/logger';

interface CustomEventHandler<T = unknown> {
  (data: T): void;
}

export const useWebSocketEvents = () => {
  // Registrar handler para eventos personalizados (DOM CustomEvent)
  const listenToCustomEvent = useCallback(<T = unknown>(eventName: string, handler: CustomEventHandler<T>) => {
    const wrapped = (e: Event) => {
      const detail = (e as CustomEvent).detail as T;
      handler(detail);
    };

    window.addEventListener(eventName, wrapped as EventListener);

    // Retorna función de cleanup para remover el listener
    return () => window.removeEventListener(eventName, wrapped as EventListener);
  }, []);

  // Emitir/broadcast de eventos personalizados
  const emitCustomEvent = useCallback(<T = unknown>(eventName: string, data: T) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    infoLog(`📣 Evento emitido: ${eventName}`);
  }, []);

  // Manejo de visibilidad/ foco de ventana
  const handleVisibilityChange = useCallback((onVisible?: () => void, onHidden?: () => void) => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        onVisible?.();
      } else {
        onHidden?.();
      }
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const handleWindowFocus = useCallback((onFocus?: () => void, onBlur?: () => void) => {
    const focusHandler = () => onFocus?.();
    const blurHandler = () => onBlur?.();

    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);
    return () => {
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('blur', blurHandler);
    };
  }, []);

  const handleOnlineStatus = useCallback((onOnline?: () => void, onOffline?: () => void) => {
    const onlineHandler = () => onOnline?.();
    const offlineHandler = () => onOffline?.();

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  return {
    // Eventos personalizados
    listenToCustomEvent,
    emitCustomEvent,

    // Eventos de sistema
    handleVisibilityChange,
    handleWindowFocus,
    handleOnlineStatus,
  };
}; 