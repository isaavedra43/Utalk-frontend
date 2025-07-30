// Componente principal Inbox
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ResponsiveInbox } from './components/ResponsiveInbox'
import { useConversations } from './hooks/useConversations'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'

// ✅ CONTEXTO PARA LOGGING
const inboxContext = getComponentContext('Inbox')

export function Inbox() {
  const { isAuthLoaded, isAuthenticated, user, error } = useAuth()
  const { data: conversations = [], isLoading, error: conversationsError } = useConversations()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const context = createLogContext({
    ...inboxContext,
    method: 'Inbox',
    data: {
      isAuthLoaded,
      isAuthenticated,
      userEmail: user?.email,
      conversationsCount: conversations?.length,
      selectedConversationId
    }
  })

  logger.info('RENDER', '🎨 Rendering Inbox component', context)

  // ✅ Mostrar loading mientras se carga la autenticación
  if (!isAuthLoaded) {
    logger.info('RENDER', '⏳ Auth not loaded yet, showing loading', context)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando autenticación...</p>
        </div>
      </div>
    )
  }

  // ✅ Si no está autenticado, mostrar mensaje
  if (!isAuthenticated || !user) {
    logger.warn('RENDER', '⚠️ User not authenticated, showing auth message', context)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No autenticado</h2>
          <p className="text-muted-foreground">Debes iniciar sesión para acceder al chat.</p>
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>
      </div>
    )
  }

  // ✅ Si hay error en las conversaciones, mostrar mensaje
  if (conversationsError) {
    logger.renderError('💥 Error loading conversations', createLogContext({
      ...context,
      error: conversationsError as Error
    }))
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error al cargar conversaciones</h2>
          <p className="text-muted-foreground">No se pudieron cargar las conversaciones.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recargar página
          </button>
        </div>
      </div>
    )
  }

  // ✅ Renderizar el inbox con las conversaciones
  logger.info('RENDER', '✅ Rendering inbox with conversations', createLogContext({
    ...context,
    data: {
      conversationsCount: conversations.length,
      selectedConversationId,
      isLoading
    }
  }))

  return (
    <ResponsiveInbox
      conversations={conversations}
      selectedConversationId={selectedConversationId}
      onSelectConversation={setSelectedConversationId}
      isLoading={isLoading}
    />
  )
} 