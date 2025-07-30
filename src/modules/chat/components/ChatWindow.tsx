// Ventana de chat principal con WebSockets y scroll automático
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, Smile, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageList } from './MessageList'
import { FileUpload } from './FileUpload'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { useSocket, useTypingIndicators } from '../hooks/useSocket'
import type { SendMessageData } from '../types'
import type { CanonicalMessage } from '@/types/canonical'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageBubble } from './MessageBubble'
import { v4 as uuidv4 } from 'uuid'

export function ChatWindow({
  conversation,
  onSendMessage
}: {
  conversation?: any
  onSendMessage?: (data: SendMessageData) => void
}) {
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useAuth()
  
  const conversationId = conversation?.id
  
  // ✅ Hooks para mensajes y WebSocket
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    isFetching
  } = useMessages(conversationId, false) // Sin paginación por ahora
  
  const sendMessageMutation = useSendMessage()
  const { 
    isConnected,
    joinConversation, 
    leaveConversation, 
    sendTyping, 
    sendStopTyping 
  } = useSocket()
  
  // ✅ Typing indicators para esta conversación
  const typingUsers = useTypingIndicators(conversationId)

  // ✅ DEBUG: Logging detallado de mensajes
  useEffect(() => {
    console.log('[CHAT-WINDOW] Messages state updated:', {
      conversationId,
      messagesCount: messages?.length,
      messages: messages?.slice(-3), // Últimos 3 mensajes
      isLoading: messagesLoading,
      isFetching,
      isConnected
    })
  }, [messages, messagesLoading, isFetching, isConnected, conversationId])

  // ✅ Estados para archivos y audio
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // ✅ Manejar archivos subidos
  const handleFilesUploaded = useCallback(async (uploadedFiles: any[]) => {
    if (!conversationId || uploadedFiles.length === 0) return

    try {
      setIsSending(true)

      // Crear mensaje con archivos
      const attachments = uploadedFiles.map(file => ({
        id: file.fileId,
        filename: file.originalName,
        url: file.mediaUrl,
        mimeType: file.metadata?.format || 'application/octet-stream',
        size: file.sizeBytes,
        category: file.category,
        metadata: file.metadata
      }))

      await sendMessageMutation.mutateAsync({
        conversationId,
        content: 'Archivo adjunto',
        senderEmail: user?.email || '',
        recipientEmail: conversation?.contact?.email || '',
        type: 'media',
        attachments
      })

      setShowFileUpload(false)
      
    } catch (error) {
      console.error('[CHAT-WINDOW] Error sending files:', error)
    } finally {
      setIsSending(false)
    }
  }, [conversationId, sendMessageMutation, user?.email, conversation?.contact?.email])

  // ✅ Manejar audio grabado
  const handleAudioUploaded = useCallback(async (uploadedAudio: any) => {
    if (!conversationId) return

    try {
      setIsSending(true)

      const audioAttachment = {
        id: uploadedAudio.fileId,
        filename: uploadedAudio.originalName,
        url: uploadedAudio.mediaUrl,
        mimeType: uploadedAudio.metadata?.format || 'audio/webm',
        size: uploadedAudio.sizeBytes,
        category: 'audio' as const,
        metadata: uploadedAudio.metadata
      }

      await sendMessageMutation.mutateAsync({
        conversationId,
        content: 'Mensaje de audio',
        senderEmail: user?.email || '',
        recipientEmail: conversation?.contact?.email || '',
        type: 'media',
        attachments: [audioAttachment]
      })

      setShowAudioRecorder(false)
      
    } catch (error) {
      console.error('[CHAT-WINDOW] Error sending audio:', error)
    } finally {
      setIsSending(false)
    }
  }, [conversationId, sendMessageMutation, user?.email, conversation?.contact?.email])

  // ✅ Scroll automático al final cuando llegan nuevos mensajes
  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }, [])

  // ✅ Detectar si el usuario está cerca del final para auto-scroll
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return true
    
    const threshold = 100 // px from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  // ✅ Scroll automático cuando cambian los mensajes
  useEffect(() => {
    const shouldAutoScroll = isNearBottom()
    if (shouldAutoScroll) {
      scrollToBottom('smooth')
    }
  }, [messages, scrollToBottom, isNearBottom])

  // ✅ Scroll automático al cambiar de conversación
  useEffect(() => {
    if (conversationId) {
      // Pequeño delay para que los mensajes se carguen
      setTimeout(() => scrollToBottom('auto'), 100)
    }
  }, [conversationId, scrollToBottom])

  // ✅ Manejo de rooms WebSocket con nueva implementación
  useEffect(() => {
    if (conversationId && isConnected) {
      console.log('[CHAT] Joining conversation room:', conversationId)
      joinConversation(conversationId)
      
      return () => {
        console.log('[CHAT] Leaving conversation room:', conversationId)
        leaveConversation(conversationId)
      }
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation])

  // ✅ Envío de mensajes
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !conversationId || !user?.email) {
      console.log('[CHAT] Cannot send message: missing data')
      return
    }

    // ✅ Generar messageId único para cada mensaje
    const messageId = uuidv4()

    const messageData: SendMessageData = {
      messageId, // ✅ OBLIGATORIO: UUID único para el backend
      conversationId,
      content: content.trim(),
      type: 'text',
      senderEmail: user.email,
      recipientEmail: conversation?.contact?.email || conversation?.contact?.phone || '',
    }

    console.log('🔍 [CHAT_WINDOW] Sending message with messageId:', {
      messageId,
      conversationId,
      contentLength: content.trim().length,
      senderEmail: user.email,
      recipientEmail: messageData.recipientEmail
    })

    try {
      // Enviar mensaje via mutation (con optimistic update)
      await sendMessageMutation.mutateAsync(messageData)
      
      // Llamar callback si existe
      if (onSendMessage) {
        onSendMessage(messageData)
      }
      
      // Stop typing si estaba escribiendo
      if (isTyping) {
        sendStopTyping(conversationId)
        setIsTyping(false)
      }

      console.log('✅ [CHAT_WINDOW] Message sent successfully:', messageId)
    } catch (error) {
      console.error('❌ [CHAT_WINDOW] Failed to send message:', error)
      // logger.error('Failed to send message from ChatWindow', {
      //   messageId,
      //   conversationId,
      //   error
      // }, 'chat_window_send_error')
    }
  }, [conversationId, user?.email, conversation?.contact, sendMessageMutation, onSendMessage, isTyping, sendStopTyping])

  // ✅ Manejo de input con typing indicators
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessageText(value)

    if (!conversationId || !isConnected) return

    // Enviar typing start si no estaba escribiendo
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      sendTyping(conversationId)
    }

    // Manejar timeout de typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          sendStopTyping(conversationId)
          setIsTyping(false)
        }
      }, 1000) // Stop typing después de 1 segundo de inactividad
    } else {
      // Si borra todo el texto, stop typing inmediatamente
      if (isTyping) {
        sendStopTyping(conversationId)
        setIsTyping(false)
      }
    }
  }, [conversationId, isConnected, isTyping, sendTyping, sendStopTyping])

  // ✅ Manejo de teclas
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(messageText)
      setMessageText('')
    }
  }, [messageText, handleSendMessage])

  // ✅ Manejo de archivos
  const handleFilesSelected = useCallback((files: File[]) => {
    console.log('[CHAT] Files selected:', files.length)
    // addFiles(files) // This is now handled by FileUpload
  }, [])

  const handleFileRemove = useCallback((fileId: string) => {
    console.log('[CHAT] Removing file:', fileId)
    // removeFile(fileId) // This is now handled by FileUpload
  }, [])

  const handleSendWithFiles = useCallback(async () => {
    if (!conversationId || !user?.email) {
      console.log('[CHAT] Cannot send files: missing data')
      return
    }

    try {
      console.log('[CHAT] Uploading files:', 0) // No files selected directly here, handled by FileUpload
      
      // Subir archivos primero
      // const uploadedFiles = await uploadFiles() // This is now handled by FileUpload
      
      // if (!uploadedFiles || uploadedFiles.length === 0) { // This is now handled by FileUpload
      //   console.error('[CHAT] No files were uploaded successfully')
      //   return
      // }

      // ✅ Generar messageId único para mensaje con archivos
      const messageId = uuidv4()

      // Crear mensaje con archivos adjuntos
      const messageData: SendMessageData = {
        messageId, // ✅ OBLIGATORIO: UUID único para el backend
        conversationId,
        content: messageText.trim() || 'Archivos adjuntos',
        type: 'file',
        senderEmail: user.email,
        recipientEmail: conversation?.contact?.email || conversation?.contact?.phone || '',
        attachments: [] // No attachments directly here, handled by FileUpload
      }

      console.log('🔍 [CHAT_WINDOW] Sending file message with messageId:', {
        messageId,
        conversationId,
        type: 'file',
        senderEmail: user.email
      })

      // Enviar mensaje con archivos
      await sendMessageMutation.mutateAsync(messageData)
      
      // Llamar callback si existe
      if (onSendMessage) {
        onSendMessage(messageData)
      }
      
      // Limpiar estado
      setMessageText('')
      setShowFileUpload(false)
      
      console.log('[CHAT] Message with files sent successfully')
      
    } catch (error) {
      console.error('[CHAT] Error sending message with files:', error)
    }
  }, [conversationId, user?.email, conversation?.contact, messageText, sendMessageMutation, onSendMessage])

  const handleToggleFileUpload = useCallback(() => {
    setShowFileUpload(!showFileUpload)
  }, [showFileUpload])

  // ✅ Limpiar typing timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // ✅ Renderizado de typing indicators
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null

    return (
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {typingUsers.length === 1
              ? `${typingUsers[0].userName || typingUsers[0].userEmail} está escribiendo...`
              : `${typingUsers.length} usuarios están escribiendo...`}
          </span>
        </div>
      </div>
    )
  }

  // ✅ Estado de conexión WebSocket
  const renderConnectionStatus = () => {
    if (isConnected) return null

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            Reconectando al chat en tiempo real...
          </span>
        </div>
      </div>
    )
  }

  // ✅ Icono de canal
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
        )
    }
  }

  // ✅ Estados de loading y error
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Selecciona una conversación
          </h3>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Elige una conversación de la lista para empezar a chatear
          </p>
        </div>
      </div>
    )
  }

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* ✅ Estado de conexión WebSocket */}
      {renderConnectionStatus()}

      {/* Header mejorado */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Avatar del contacto */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
              {conversation?.contact?.avatar ? (
                <img 
                  src={conversation.contact.avatar} 
                  alt={conversation.contact.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                conversation?.contact?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            {conversation?.contact?.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          
          {/* Info del contacto */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {conversation?.contact?.name || 'Cliente'}
              </h3>
              {getChannelIcon(conversation?.channel || 'whatsapp')}
              {/* Indicador de WebSocket */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} 
                   title={isConnected ? 'Conectado' : 'Reconectando...'}></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversation?.contact?.phone || conversation?.contact?.email || 'Sin contacto'}
            </p>
          </div>
        </div>
        
        {/* Acciones del header */}
        <div className="flex items-center space-x-2">
          {isFetching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Área de mensajes mejorada - CON ALTURA FLEXIBLE Y SCROLLBAR PERSONALIZADA */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4 min-h-0 chat-messages-container"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No hay mensajes aún
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Envía el primer mensaje para comenzar la conversación
            </p>
          </div>
        ) : (
          <>
            {messages?.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null
              const isOwn = message.sender?.email === user?.email || message.direction === 'outbound'
              const isGrouped = prevMessage?.sender?.email === message.sender?.email
              const showAvatar = !isGrouped

              return (
                <div key={message.id} className="flex space-x-2">
                  {showAvatar && !isOwn && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.sender?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex-1 ${isOwn ? 'flex justify-end' : ''}`}>
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwn}
                    />
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
        {renderTypingIndicator()}
      </div>

      {/* Input de mensaje mejorado - CON ALTURA FIJA */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex-shrink-0 message-input-container">
        <div className="flex items-end space-x-3">
          {/* Botón adjuntar */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleFileUpload}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 flex-shrink-0"
            title="Adjuntar archivo"
            disabled={messagesLoading || sendMessageMutation.isPending}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </Button>

          {/* Input principal */}
          <div className="flex-1 relative min-w-0">
            <textarea
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              disabled={messagesLoading || sendMessageMutation.isPending}
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        rounded-2xl resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 min-h-[44px] max-h-32"
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
            
            {/* Botón emoji */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
              title="Emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </div>
          
          {/* Botón enviar */}
          <Button 
            onClick={() => handleSendMessage(messageText)}
            disabled={!messageText.trim() || messagesLoading || sendMessageMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 
                      text-white rounded-full p-3 transition-all duration-200 shadow-md hover:shadow-lg
                      disabled:cursor-not-allowed flex-shrink-0"
            size="sm"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>

        {/* Componente de subida de archivos */}
        {showFileUpload && conversationId && (
          <div className="mt-4">
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              conversationId={conversationId}
              maxFiles={3}
              disabled={isSending}
            />
            
            {/* Botón para enviar archivos */}
            {/* The original code had a "Cancelar" button here, but the new FileUpload handles its own close.
                The "Enviar" button is now handled by the FileUpload component itself. */}
          </div>
        )}
      </div>
    </div>
  )
} 