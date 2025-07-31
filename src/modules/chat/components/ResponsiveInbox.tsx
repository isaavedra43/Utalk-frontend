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
  const { user, isAuthenticated, isAuthLoaded, sessionValid } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // ✅ SOCKET.IO SIMPLIFICADO
  const { 
    isConnected: socketConnected, 
    connectionError, 
    joinConversation, 
    leaveConversation 
  } = useSocket()

  // ✅ CONVERSACIONES SIMPLIFICADAS
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useConversations()

  // ✅ MENSAJES SIMPLIFICADOS
  const { 
    messages = [], 
    isLoading: messagesLoading = false, 
    error: messagesError = null
  } = useMessages(selectedConversationId || '')

  // ✅ VALIDACIÓN SIMPLE
  const safeConversations = Array.isArray(conversations) ? conversations : []
  const safeMessages = Array.isArray(messages) ? messages : []

  // ✅ ENVÍO DE MENSAJES
  const sendMessageMutation = useSendMessage()

  // ✅ MANEJO DE RESIZE
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ✅ FUNCIÓN PARA SELECCIONAR CONVERSACIÓN
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowInfoPanel(false)
  }, [])

  // ✅ FUNCIÓN PARA ENVIAR MENSAJE
  const handleSendMessage = useCallback(async (content: string, type: string = 'text') => {
    if (!selectedConversationId || !content.trim()) return

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        content: content.trim(),
        type
      })
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    }
  }, [selectedConversationId, sendMessageMutation])

  // ✅ VALIDACIONES BÁSICAS
  if (!isAuthLoaded) return <LoadingSpinner />
  if (!isAuthenticated || !sessionValid) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sesión expirada</h2>
          <p className="text-gray-600">Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    )
  }

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="Cargando conversaciones..." />
      </div>
    )
  }

  if (conversationsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error cargando conversaciones</h2>
          <p className="text-gray-600">No se pudieron cargar las conversaciones.</p>
        </div>
      </div>
    )
  }

  if (safeConversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No hay conversaciones</h2>
          <p className="text-gray-600">No tienes conversaciones activas.</p>
        </div>
      </div>
    )
  }

  // ✅ RENDER PRINCIPAL SIMPLIFICADO
  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* ✅ LISTA DE CONVERSACIONES */}
      <div className={`${isMobile ? (selectedConversationId ? 'hidden' : 'w-full') : 'w-80'} border-r border-gray-200 bg-white`}>
        <ConversationList
          conversations={safeConversations}
          selectedConversationId={selectedConversationId}
          onSelect={handleSelectConversation}
          searchQuery=""
          onSearchChange={() => {}}
          isLoading={conversationsLoading}
          error={conversationsError ? String(conversationsError) : null}
        />
      </div>

      {/* ✅ VENTANA DE CHAT */}
      {selectedConversationId && (
        <div className={`${isMobile ? 'w-full' : 'flex-1'} flex`}>
          <div className={`${showInfoPanel && !isMobile ? 'flex-1' : 'w-full'}`}>
            <ChatWindow
              conversation={safeConversations.find(c => c.id === selectedConversationId) || null}
              onSendMessage={(data: any) => handleSendMessage(data.content, data.type)}
            />
          </div>

          {showInfoPanel && !isMobile && (
            <div className="w-80 border-l border-gray-200 bg-white">
              <InfoPanel
                conversation={safeConversations.find(c => c.id === selectedConversationId) || null}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
} 