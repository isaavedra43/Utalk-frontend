// Ventana principal de chat con mensajes y envío
// ✅ EMAIL-FIRST: Componente alineado con backend
import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageBubble } from './MessageBubble'
import { Avatar } from './Avatar'
import { ChannelBadge } from './ChannelBadge'
import { useMessages } from '../hooks/useMessages'
import { useConversationData } from '../hooks/useConversationData'
import { useAuth } from '@/contexts/AuthContext'
import type { ChatWindowProps, SendMessageData } from '../types'
import type { CanonicalMessage } from '@/types/canonical'

export function ChatWindow({
  conversationId,
  onSendMessage,
  isLoading,
  typingUsers = []
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { user } = useAuth()
  const { data: messages = [] } = useMessages(conversationId || '')
  const { conversation: conversationData } = useConversationData(conversationId || '')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !conversationId || !user?.email) return

    const messageData: SendMessageData = {
      conversationId,
      content: content.trim(),
      type: 'text',
      senderEmail: user.email,
      recipientEmail: conversationData?.contact?.email || '',
      timestamp: new Date()
    }

    onSendMessage(messageData)
    setMessageText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(messageText)
    }
  }

  const renderTypingIndicator = () => {
    if (!typingUsers.length) return null

    return (
      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {typingUsers.length === 1
          ? `${typingUsers[0]} está escribiendo...`
          : `${typingUsers.length} usuarios están escribiendo...`}
      </div>
    )
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Elige una conversación para empezar a chatear
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              name={conversationData?.contact?.name}
              src={conversationData?.contact?.avatar}
              size="md"
              isOnline={conversationData?.contact?.isOnline}
              channel={conversationData?.channel}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {conversationData?.contact?.name || 'Cliente'}
                </h2>
                {conversationData?.channel && (
                  <ChannelBadge 
                    channel={conversationData.channel} 
                    size="sm" 
                  />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {conversationData?.contact?.phone || conversationData?.contact?.email}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-4xl mb-2">💭</div>
            <p>No hay mensajes aún</p>
            <p className="text-sm">Envía el primer mensaje para comenzar la conversación</p>
          </div>
        ) : (
          <>
            {messages.map((message: CanonicalMessage, index: number) => {
              const isOwn = message.sender?.id === user?.email || message.direction === 'outbound'
              const prevMessage = index > 0 ? messages[index - 1] : null
              const isGrouped = prevMessage?.sender?.id === message.sender?.id

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={!isGrouped}
                  isGrouped={isGrouped}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
        {renderTypingIndicator()}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="resize-none"
              disabled={isLoading}
            />
          </div>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleSendMessage(messageText)}
            disabled={!messageText.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 