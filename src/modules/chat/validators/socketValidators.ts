// Validadores para eventos Socket.IO
// Siguiendo mejores prácticas: https://medium.com/@selieshjksofficial/crafting-reliable-socket-io-code-e062405c7741

import type { CanonicalMessage } from '@/types/canonical'
import { logger } from '@/lib/logger'

/**
 * ✅ Validador de estructura de mensaje
 */
export function validateNewMessageEvent(data: any): data is { message: CanonicalMessage; conversationId: string; timestamp: number } {
  try {
    if (!data || typeof data !== 'object') {
      logger.error('Invalid message event: not an object', { data }, 'socket_validation_error')
      return false
    }

    if (!data.message || typeof data.message !== 'object') {
      logger.error('Invalid message event: missing message object', { data }, 'socket_validation_error')
      return false
    }

    if (!data.conversationId || typeof data.conversationId !== 'string') {
      logger.error('Invalid message event: missing conversationId', { data }, 'socket_validation_error')
      return false
    }

    if (!data.message.id || typeof data.message.id !== 'string') {
      logger.error('Invalid message event: missing message.id', { data }, 'socket_validation_error')
      return false
    }

    if (!data.message.content || typeof data.message.content !== 'string') {
      logger.error('Invalid message event: missing message.content', { data }, 'socket_validation_error')
      return false
    }

    return true
  } catch (error) {
    logger.error('Error validating message event', { error, data }, 'socket_validation_error')
    return false
  }
}

/**
 * ✅ Validador de evento de lectura
 */
export function validateMessageReadEvent(data: any): data is { messageId: string; conversationId: string; readBy: string; readAt: string } {
  try {
    if (!data || typeof data !== 'object') return false

    return (
      typeof data.messageId === 'string' &&
      typeof data.conversationId === 'string' &&
      typeof data.readBy === 'string' &&
      typeof data.readAt === 'string'
    )
  } catch (error) {
    logger.error('Error validating message read event', { error, data }, 'socket_validation_error')
    return false
  }
}

/**
 * ✅ Validador de eventos de typing
 */
export function validateTypingEvent(data: any): data is { userEmail: string; userName?: string; conversationId: string } {
  try {
    if (!data || typeof data !== 'object') return false

    return (
      typeof data.userEmail === 'string' &&
      typeof data.conversationId === 'string' &&
      (data.userName === undefined || typeof data.userName === 'string')
    )
  } catch (error) {
    logger.error('Error validating typing event', { error, data }, 'socket_validation_error')
    return false
  }
}

/**
 * ✅ Validador de eventos de usuario
 */
export function validateUserEvent(data: any): data is { email: string; displayName?: string; conversationId: string; timestamp: number } {
  try {
    if (!data || typeof data !== 'object') return false

    return (
      typeof data.email === 'string' &&
      typeof data.conversationId === 'string' &&
      typeof data.timestamp === 'number' &&
      (data.displayName === undefined || typeof data.displayName === 'string')
    )
  } catch (error) {
    logger.error('Error validating user event', { error, data }, 'socket_validation_error')
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
        logger.error(`Error handling ${eventName} event`, { error, data }, 'socket_handler_error')
      }
    } else {
      logger.warn(`Invalid ${eventName} event received`, { data }, 'socket_invalid_event')
    }
  }
} 