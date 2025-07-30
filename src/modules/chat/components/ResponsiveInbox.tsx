// Componente de inbox responsivo con gestión completa del chat
// ✅ CRÍTICO: Integra todas las correcciones para eliminar Error React #310
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '@/contexts/AuthContext'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { InfoPanel } from './InfoPanel'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useConversations } from '../hooks/useConversations'

// ✅ CONTEXTO PARA LOGGING
const inboxContext = getComponentContext('ResponsiveInbox')

interface ResponsiveInboxProps {
  className?: string
}

export function ResponsiveInbox({ className = '' }: ResponsiveInboxProps) {
  const { user, isAuthenticated, isAuthLoaded } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // ✅ SOCKET.IO CON CONFIGURACIÓN MEJORADA
  const { 
    isConnected: socketConnected, 
    connectionError, 
    joinConversation, 
    leaveConversation 
  } = useSocket()

  // ✅ CONVERSACIONES CON VALIDACIÓN
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useConversations()

  // ✅ MENSAJES CON VALIDACIÓN ULTRA-DEFENSIVA - CRÍTICO PARA ERROR #310
  const {
    messages,
    isLoading: messagesLoading,
    error: messagesError,
    hasValidMessages,
    isEnabled: messagesEnabled,
    conversationExists,
    processIncomingMessage
  } = useMessages(selectedConversationId || '', false) // ✅ CRÍTICO: Pasar string vacío si es null

  // ✅ ENVÍO DE MENSAJES
  const sendMessageMutation = useSendMessage()

  const context = useMemo(() => createLogContext({
    ...inboxContext,
    method: 'ResponsiveInbox',
    data: {
      selectedConversationId,
      isAuthenticated,
      socketConnected,
      conversationsCount: conversations.length,
      messagesCount: messages.length,
      hasValidMessages,
      messagesEnabled
    }
  }), [selectedConversationId, isAuthenticated, socketConnected, conversations.length, messages.length, hasValidMessages, messagesEnabled])

  // ✅ MANEJO DE RESIZE PARA RESPONSIVIDAD
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ✅ MANEJO DE CONVERSACIÓN SELECCIONADA CON SOCKET.IO
  useEffect(() => {
    if (selectedConversationId && socketConnected) {
      logger.info('CHAT', 'Unirse a conversación vía Socket.IO', {
        conversationId: selectedConversationId,
        socketConnected
      })
      
      joinConversation(selectedConversationId)

      return () => {
        leaveConversation(selectedConversationId)
      }
    }
  }, [selectedConversationId, socketConnected, joinConversation, leaveConversation])

  // ✅ LISTENER PARA NUEVOS MENSAJES VÍA CUSTOM EVENTS
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { message, conversationId } = event.detail

      if (conversationId === selectedConversationId) {
        logger.info('CHAT', 'Procesando nuevo mensaje en conversación activa', {
          messageId: message.id,
          conversationId
        })
        
        // ✅ PROCESAR MENSAJE USANDO EL HOOK
        if (processIncomingMessage) {
          processIncomingMessage(message)
        }
      }
    }

    window.addEventListener('socket-new-message', handleNewMessage as EventListener)
    
    return () => {
      window.removeEventListener('socket-new-message', handleNewMessage as EventListener)
    }
  }, [selectedConversationId, processIncomingMessage])

  // ✅ FUNCIÓN PARA SELECCIONAR CONVERSACIÓN
  const handleSelectConversation = useCallback((conversationId: string) => {
    if (conversationId === selectedConversationId) return

    logger.info('CHAT', 'Seleccionando nueva conversación', {
      newConversationId: conversationId,
      previousConversationId: selectedConversationId
    })

    setSelectedConversationId(conversationId)
    setShowInfoPanel(false) // Cerrar panel en mobile
  }, [selectedConversationId])

  // ✅ FUNCIÓN PARA ENVIAR MENSAJE
  const handleSendMessage = useCallback(async (content: string, type: string = 'text') => {
    if (!selectedConversationId || !content.trim()) {
      logger.warn('CHAT', 'No se puede enviar mensaje: datos inválidos', {
        hasConversationId: !!selectedConversationId,
        hasContent: !!content.trim()
      })
      return
    }

    try {
      logger.render('Intentando enviar mensaje', createLogContext({
        ...context,
        data: {
          conversationId: selectedConversationId,
          contentLength: content.length,
          type
        }
      }))

      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        content: content.trim(),
        type
      })

      logger.success('MESSAGE', 'Mensaje enviado exitosamente', {
        conversationId: selectedConversationId,
        contentLength: content.length
      })

    } catch (error: any) {
      logger.error('CHAT', 'Error enviando mensaje', {
        conversationId: selectedConversationId,
        error: error.message
      })
    }
  }, [selectedConversationId, sendMessageMutation, context])

  // ✅ VALIDACIÓN DE ESTADO ANTES DEL RENDER
  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
        <span className="ml-2">Cargando autenticación...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No autenticado</h2>
          <p className="text-gray-600">Por favor, inicia sesión para acceder al chat</p>
        </div>
      </div>
    )
  }

  // ✅ RENDER PRINCIPAL
  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* ✅ LISTA DE CONVERSACIONES */}
      <div className={`${isMobile ? (selectedConversationId ? 'hidden' : 'w-full') : 'w-80'} border-r border-gray-200 bg-white`}>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelectConversation}
          searchQuery=""
          onSearchChange={() => {}}
          isLoading={conversationsLoading}
          error={conversationsError as string}
        />
      </div>

      {/* ✅ VENTANA DE CHAT */}
      {selectedConversationId && (
        <div className={`${isMobile ? 'w-full' : 'flex-1'} flex`}>
          <div className={`${showInfoPanel && !isMobile ? 'flex-1' : 'w-full'}`}>
            <ChatWindow
              conversation={null}
              onSendMessage={(data: any) => handleSendMessage(data.content, data.type)}
            />
          </div>

          {/* ✅ PANEL DE INFORMACIÓN */}
          {showInfoPanel && !isMobile && (
            <div className="w-80 border-l border-gray-200 bg-white">
              <InfoPanel
                conversationId={selectedConversationId}
              />
            </div>
          )}
        </div>
      )}

      {/* ✅ PLACEHOLDER CUANDO NO HAY CONVERSACIÓN SELECCIONADA */}
      {!selectedConversationId && !isMobile && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Selecciona una conversación
            </h2>
            <p className="text-gray-500">
              Escoge una conversación de la lista para comenzar a chatear
            </p>
            {!socketConnected && connectionError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
                <p className="text-red-700 text-sm">
                  ⚠️ Sin conexión en tiempo real: {connectionError}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 