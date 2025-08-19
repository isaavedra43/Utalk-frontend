// Utilidades para controlar el logging en tiempo de ejecución
import logger from '../config/logging';

// Función para habilitar logs de debug para un módulo específico
export const enableDebugLogs = (module: 'chatHeader' | 'useConversations' | 'webSocket' | 'auth' | 'clientProfile') => {
  logger.setModuleEnabled(module, true);
  logger.setLevel('debug');
  console.log(`🔧 Debug logs habilitados para: ${module}`);
};

// Función para deshabilitar logs de debug para un módulo específico
export const disableDebugLogs = (module: 'chatHeader' | 'useConversations' | 'webSocket' | 'auth' | 'clientProfile') => {
  logger.setModuleEnabled(module, false);
  console.log(`🔧 Debug logs deshabilitados para: ${module}`);
};

// Función para habilitar todos los logs de debug
export const enableAllDebugLogs = () => {
  logger.setModuleEnabled('chatHeader', true);
  logger.setModuleEnabled('useConversations', true);
  logger.setModuleEnabled('webSocket', true);
  logger.setModuleEnabled('auth', true);
  logger.setModuleEnabled('clientProfile', true);
  logger.setLevel('debug');
  console.log('🔧 Todos los debug logs habilitados');
};

// Función para deshabilitar todos los logs de debug
export const disableAllDebugLogs = () => {
  logger.setModuleEnabled('chatHeader', false);
  logger.setModuleEnabled('useConversations', false);
  logger.setModuleEnabled('webSocket', false);
  logger.setModuleEnabled('auth', false);
  logger.setModuleEnabled('clientProfile', false);
  console.log('🔧 Todos los debug logs deshabilitados');
};

// Función para mostrar el estado actual del logging
export const showLoggingStatus = () => {
  console.log('🔧 Estado actual del logging:', {
    enabled: logger['config'].enabled,
    level: logger['config'].level,
    modules: logger['config'].modules
  });
};

// Exponer funciones globalmente para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugUtils = {
    enableDebugLogs,
    disableDebugLogs,
    enableAllDebugLogs,
    disableAllDebugLogs,
    showLoggingStatus
  };
  
  console.log('🔧 Debug utils disponibles en window.debugUtils');
  console.log('🔧 Uso: debugUtils.enableDebugLogs("chatHeader")');
} 