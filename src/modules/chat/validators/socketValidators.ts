// Validadores para eventos Socket.IO
// Siguiendo mejores prácticas: https://medium.com/@selieshjksofficial/crafting-reliable-socket-io-code-e062405c7741

import type { CanonicalMessage } from '@/types/canonical'
import { logger } from '@/lib/logger'
import { createLogContext } from '@/lib/logger'

/**
 * ✅ Validador de estructura de mensaje
 */
export function validateMessageEvent(data: any): boolean {
  try {
    // ✅ VALIDAR QUE SEA UN OBJETO
    if (!data || typeof data !== 'object') {
      logger.error('VALIDATION', '❌ Invalid message event: not an object', createLogContext({
        data: { receivedData: data }
      }))
      return false
    }

    // ✅ VALIDAR QUE TENGA MENSAJE
    if (!data.message) {
      logger.error('VALIDATION', '❌ Invalid message event: missing message object', createLogContext({
        data: { receivedData: data }
      }))
      return false
    }

    // ✅ VALIDAR CONVERSATIONID
    if (!data.conversationId) {
      logger.error('VALIDATION', '❌ Invalid message event: missing conversationId', createLogContext({
        data: { receivedData: data }
      }))
      return false
    }

    // ✅ VALIDAR ID DEL MENSAJE
    if (!data.message.id) {
      logger.error('VALIDATION', '❌ Invalid message event: missing message.id', createLogContext({
        data: { receivedData: data }
      }))
      return false
    }

    // ✅ VALIDAR CONTENIDO DEL MENSAJE
    if (!data.message.content) {
      logger.error('VALIDATION', '❌ Invalid message event: missing message.content', createLogContext({
        data: { receivedData: data }
      }))
      return false
    }

    return true
  } catch (error) {
    logger.error('VALIDATION', '💥 Error validating message event', createLogContext({
      error: error as Error,
      data: { receivedData: data }
    }))
    return false
  }
}

/**
 * ✅ Validador de evento de lectura
 */
export function validateMessageReadEvent(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (!data.messageId || !data.markedByEmail) {
      return false
    }

    return true
  } catch (error) {
    logger.error('VALIDATION', '💥 Error validating message read event', createLogContext({
      error: error as Error,
      data: { receivedData: data }
    }))
    return false
  }
}

/**
 * ✅ Validador de eventos de typing
 */
export function validateTypingEvent(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (!data.conversationId || !data.userEmail) {
      return false
    }

    return true
  } catch (error) {
    logger.error('VALIDATION', '💥 Error validating typing event', createLogContext({
      error: error as Error,
      data: { receivedData: data }
    }))
    return false
  }
}

/**
 * ✅ Validador de eventos de usuario
 */
export function validateUserEvent(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (!data.userEmail) {
      return false
    }

    return true
  } catch (error) {
    logger.error('VALIDATION', '💥 Error validating user event', createLogContext({
      error: error as Error,
      data: { receivedData: data }
    }))
    return false
  }
}

/**
 * ✅ Wrapper genérico para validación segura
 */
export function safeEventHandler<T>(
  validator: (data: any) => data is T,
  handler: (data: T) => void,
  eventName: string
) {
  return (data: any) => {
    if (validator(data)) {
      try {
        handler(data)
      } catch (error) {
        logger.error('SOCKET', `Error handling ${eventName} event`, createLogContext({
          component: 'socketValidators',
          method: 'safeEventHandler',
          error: error as Error,
          data: { eventName, data }
        }))
      }

      logger.warn('SOCKET', `Invalid ${eventName} event received`, createLogContext({
        component: 'socketValidators',
        method: 'safeEventHandler',
        data: { eventName, data }
      }))
    }
  }
}

export function validateSocketEvent(eventName: string, data: any): boolean {
  try {
    switch (eventName) {
      case 'new-message':
        return validateMessageEvent(data)
      case 'message-read':
        return validateMessageReadEvent(data)
      case 'typing':
        return validateTypingEvent(data)
      case 'user-online':
      case 'user-offline':
        return validateUserEvent(data)
      default:
        logger.error('VALIDATION', `💥 Error handling ${eventName} event`, createLogContext({
          error: new Error(`Unknown event type: ${eventName}`),
          data: { receivedData: data }
        }))
        logger.warn('VALIDATION', `⚠️ Invalid ${eventName} event received`, createLogContext({
          data: { receivedData: data }
        }))
        return false
    }
  } catch (error) {
    logger.error('VALIDATION', `💥 Error handling ${eventName} event`, createLogContext({
      error: error as Error,
      data: { receivedData: data }
    }))
    return false
  }
} 