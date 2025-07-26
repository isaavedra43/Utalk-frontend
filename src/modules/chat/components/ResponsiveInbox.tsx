// Inbox responsivo con adaptación móvil/desktop
// ✅ EMAIL-FIRST: Layout adaptativo para diferentes pantallas
import { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationList } from './ConversationList'
import { ChatWindow } from './ChatWindow'
import { useConversations } from '../hooks/useConversations'
import { useSendMessage } from '../hooks/useMessages'
import type { ResponsiveInboxProps, SendMessageData } from '../types'

export function ResponsiveInbox({
  initialConversationId,
  onSendMessage,
  onSelectConversation
}: ResponsiveInboxProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  )
  const [isMobile, setIsMobile] = useState(false)
  const [showChat, setShowChat] = useState(!!initialConversationId)

  // ✅ Hooks corregidos - usar datos directamente
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useConversations()
  
  const sendMessageMutation = useSendMessage()

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Encontrar conversación seleccionada
  const selectedConversation = conversations.find((c: any) => c.id === selectedConversationId)

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowChat(true)
    onSelectConversation?.(conversationId)
  }

  const handleSendMessage = (messageData: SendMessageData) => {
    sendMessageMutation.mutate(messageData)
    onSendMessage?.(messageData)
  }

  const handleBackToList = () => {
    setShowChat(false)
    setSelectedConversationId(undefined)
  }

  // Convertir error a string si existe
  const errorMessage = conversationsError ? String(conversationsError) : null

  // Vista móvil: mostrar solo lista o solo chat
  if (isMobile) {
    if (showChat && selectedConversationId) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
          {/* Header móvil */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="mr-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedConversation?.contact?.name || 'Chat'}
              </h1>
            </div>
          </div>

          {/* Chat completo */}
          <div className="flex-1">
            <ChatWindow
              conversationId={selectedConversationId}
              onSendMessage={handleSendMessage}
              onSelectConversation={handleSelectConversation}
              isLoading={false}
              typingUsers={[]}
            />
          </div>
        </div>
      )
    }

    // Vista de lista en móvil
    return (
      <div className="h-full">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isLoading={conversationsLoading}
          error={errorMessage}
        />
      </div>
    )
  }

  // Vista desktop: layout de dos columnas
  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900">
      {/* Lista de conversaciones */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isLoading={conversationsLoading}
          error={errorMessage}
        />
      </div>

      {/* Área de chat */}
      <div className="flex-1">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onSendMessage={handleSendMessage}
            onSelectConversation={handleSelectConversation}
            isLoading={false}
            typingUsers={[]}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
  )
} 