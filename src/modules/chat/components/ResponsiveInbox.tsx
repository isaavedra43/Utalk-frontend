// Inbox responsivo con adaptación móvil/desktop
// ✅ REFACTORIZADO: Sin lógica de filtrado, solo renderizado
import React, { useState, useEffect, useMemo } from 'react'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { SendMessageData } from '../types'

// ✅ DEFINIR INTERFAZ LOCAL PARA EVITAR CONFLICTOS
interface LocalResponsiveInboxProps {
  conversations: any[]
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string | null) => void
  isLoading?: boolean
}

// ✅ CONTEXTO PARA LOGGING
const responsiveInboxContext = getComponentContext('ResponsiveInbox')

// ✅ Error Boundary específico para ResponsiveInbox
class ResponsiveInboxErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    logger.renderError('❌ ResponsiveInbox error boundary triggered', createLogContext({
      component: 'ResponsiveInbox',
      method: 'getDerivedStateFromError',
      error: error,
      data: { errorMessage: error.message, stack: error.stack?.split('\n') || [] }
    }))
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.renderError('💥 ResponsiveInbox componentDidCatch', createLogContext({
      component: 'ResponsiveInbox',
      method: 'componentDidCatch',
      error: error,
      data: { errorInfo: errorInfo.componentStack }
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="text-red-500 text-lg font-semibold mb-4">Error en el chat</div>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ResponsiveInbox({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading = false
}: LocalResponsiveInboxProps) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const context = createLogContext({
    ...responsiveInboxContext,
    method: 'ResponsiveInbox',
    data: {
      conversationsCount: conversations?.length,
      selectedConversationId,
      isLoading,
      isMobileView,
      showChat
    }
  })

  logger.render('🎨 Rendering ResponsiveInbox', context)

  // ✅ VALIDACIÓN DEFENSIVA DE CONVERSACIONES
  const safeConversations = useMemo(() => {
    try {
      if (!Array.isArray(conversations)) {
        logger.validationError('❌ Conversations is not an array', createLogContext({
          ...context,
          data: { conversations, type: typeof conversations }
        }))
        return []
      }

      return conversations.filter(conv => {
        if (!conv || typeof conv !== 'object') {
          logger.validationError('❌ Invalid conversation object', createLogContext({
            ...context,
            data: { conversation: conv }
          }))
          return false
        }

        if (!conv.id) {
          logger.validationError('❌ Conversation missing ID', createLogContext({
            ...context,
            data: { conversation: conv }
          }))
          return false
        }

        return true
      })
    } catch (error) {
      logger.renderError('💥 Error filtering conversations', createLogContext({
        ...context,
        error: error as Error,
        data: { conversations }
      }))
      return []
    }
  }, [conversations])

  // ✅ CONVERSACIÓN SELECCIONADA
  const selectedConversation = useMemo(() => {
    try {
      if (!selectedConversationId) return null
      
      const found = safeConversations.find(conv => conv.id === selectedConversationId)
      
      logger.render('🔍 Selected conversation found', createLogContext({
        ...context,
        data: { 
          selectedConversationId, 
          found: !!found,
          conversationTitle: found?.title || found?.name
        }
      }))
      
      return found || null
    } catch (error) {
      logger.renderError('💥 Error finding selected conversation', createLogContext({
        ...context,
        error: error as Error,
        data: { selectedConversationId }
      }))
      return null
    }
  }, [safeConversations, selectedConversationId])

  // ✅ DETECTAR TAMAÑO DE PANTALLA
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768
      setIsMobileView(isMobile)
      
      logger.render('📱 Screen size detected', createLogContext({
        ...context,
        data: { 
          isMobile,
          width: window.innerWidth,
          height: window.innerHeight
        }
      }))
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // ✅ MANEJAR SELECCIÓN DE CONVERSACIÓN
  const handleSelectConversation = (conversationId: string | null) => {
    try {
      logger.render('💬 Conversation selected', createLogContext({
        ...context,
        data: { conversationId, isMobileView }
      }))

      onSelectConversation(conversationId)
      
      if (isMobileView && conversationId) {
        setShowChat(true)
      }
    } catch (error) {
      logger.renderError('💥 Error selecting conversation', createLogContext({
        ...context,
        error: error as Error,
        data: { conversationId }
      }))
    }
  }

  // ✅ MANEJAR ENVÍO DE MENSAJE
  const handleSendMessage = async (messageData: SendMessageData) => {
    try {
      logger.render('📤 Sending message from ResponsiveInbox', createLogContext({
        ...context,
        data: { 
          conversationId: messageData.conversationId,
          hasContent: !!messageData.content,
          hasAttachments: !!messageData.attachments?.length
        }
      }))

      // Aquí se podría implementar la lógica de envío
      // Por ahora solo loggeamos
      logger.render('Message send attempt logged', createLogContext({
        ...context,
        data: { messageData }
      }))
    } catch (error) {
      logger.renderError('💥 Error sending message', createLogContext({
        ...context,
        error: error as Error,
        data: { messageData }
      }))
    }
  }

  // ✅ VOLVER A LISTA (MÓVIL)
  const handleBackToList = () => {
    try {
      logger.render('⬅️ Back to conversation list', context)
      setShowChat(false)
      onSelectConversation(null)
    } catch (error) {
      logger.renderError('💥 Error going back to list', createLogContext({
        ...context,
        error: error as Error
      }))
    }
  }

  // ✅ RENDERIZADO MÓVIL
  if (isMobileView) {
    if (showChat && selectedConversation) {
      return (
        <ResponsiveInboxErrorBoundary>
          <div className="h-screen flex flex-col">
            <ChatWindow
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
            />
          </div>
        </ResponsiveInboxErrorBoundary>
      )
    }

    return (
      <ResponsiveInboxErrorBoundary>
        <div className="h-screen">
          <ConversationList
            conversations={safeConversations}
            onSelect={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            searchQuery=""
            onSearchChange={() => {}}
            isLoading={isLoading}
          />
        </div>
      </ResponsiveInboxErrorBoundary>
    )
  }

  // ✅ RENDERIZADO DESKTOP
  return (
    <ResponsiveInboxErrorBoundary>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Lista de conversaciones */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
          <ConversationList
            conversations={safeConversations}
            onSelect={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            searchQuery=""
            onSearchChange={() => {}}
            isLoading={isLoading}
          />
        </div>

        {/* Chat window */}
        <div className="flex-1">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveInboxErrorBoundary>
  )
} 