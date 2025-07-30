// Ventana de chat principal con soporte completo de archivos
import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { MessageBubble } from './MessageBubble'
import { FileUpload, useFileUpload, type FileWithPreview } from './FileUpload'
import { uploadService } from '../services/uploadService'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages, useSendMessage } from '../hooks/useMessages'
import { useSocket, useTypingIndicators } from '../hooks/useSocket'
import { Paperclip, X } from 'lucide-react'
import type { SendMessageData } from '../types'
import type { CanonicalMessage } from '@/types/canonical'

export function ChatWindowWithFiles({
  conversation,
  onSendMessage
}: {
  conversation?: any
  onSendMessage?: (data: SendMessageData) => void
}) {
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
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
  } = useMessages(conversationId, false)
  
  const sendMessageMutation = useSendMessage()
  const { 
    isConnected,
    joinConversation, 
    leaveConversation, 
    sendTyping, 
    sendStopTyping 
  } = useSocket()
  
  // ✅ Hook para upload de archivos
  const {
    selectedFiles,
    handleFilesSelected,
    handleFileRemove,
    clearFiles,
    updateFileProgress,
    updateFileError
  } = useFileUpload()
  
  // ✅ Typing indicators para esta conversación
  const typingUsers = useTypingIndicators(conversationId)

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
      setTimeout(() => scrollToBottom('auto'), 100)
    }
  }, [conversationId, scrollToBottom])

  // ✅ Manejo de rooms WebSocket
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId)
      return () => leaveConversation(conversationId)
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation])

  // ✅ Envío de mensajes con archivos
  const handleSendMessage = useCallback(async (content: string, files?: FileWithPreview[]) => {
    if ((!content.trim() && !files?.length) || !conversationId || !user?.email) {
      console.log('[CHAT] Cannot send message: missing data')
      return
    }

    try {
      let uploadedFiles: any[] = []

      // Subir archivos si existen
      if (files && files.length > 0) {
        setIsUploadingFiles(true)
        
        try {
          const uploadResults = await uploadService.uploadMultipleFiles(
            files,
            (fileId, progress) => {
              updateFileProgress(fileId, progress.progress)
            }
          )
          uploadedFiles = uploadResults
          console.log('[CHAT] Files uploaded successfully:', uploadedFiles)
        } catch (error) {
          console.error('[CHAT] Error uploading files:', error)
          files.forEach(file => {
            updateFileError(file.id, 'Error al subir archivo')
          })
          setIsUploadingFiles(false)
          return
        }
      }

      // Preparar datos del mensaje
      const messageData: SendMessageData = {
        conversationId,
        content: content.trim(),
        type: uploadedFiles.length > 0 ? 'file' : 'text',
        senderEmail: user.email,
        recipientEmail: conversation?.contact?.email || conversation?.contact?.phone || '',
        attachments: uploadedFiles
      }

      // Enviar mensaje via mutation (con optimistic update)
      await sendMessageMutation.mutateAsync(messageData)
      
      // Llamar callback si existe
      if (onSendMessage) {
        onSendMessage(messageData)
      }
      
      // Limpiar estado
      clearFiles()
      setShowFileUpload(false)
      
      // Stop typing si estaba escribiendo
      if (isTyping) {
        sendStopTyping(conversationId)
        setIsTyping(false)
      }
      
      console.log('[CHAT] Message sent successfully')
      
    } catch (error) {
      console.error('[CHAT] Error sending message:', error)
    } finally {
      setIsUploadingFiles(false)
    }
  }, [conversationId, user?.email, conversation?.contact, sendMessageMutation, onSendMessage, isTyping, sendStopTyping, clearFiles, updateFileProgress, updateFileError])

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
      }, 1000)
    } else {
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
      handleSendMessage(messageText, selectedFiles.length > 0 ? selectedFiles : undefined)
      setMessageText('')
    }
  }, [messageText, selectedFiles, handleSendMessage])

  // ✅ Manejar click en botón adjuntar
  const handleAttachClick = () => {
    setShowFileUpload(!showFileUpload)
  }

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
      {/* Header con indicador de conexión */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
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
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {conversation?.contact?.name || 'Cliente'}
              </h3>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} 
                   title={isConnected ? 'Conectado' : 'Reconectando...'}></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversation?.contact?.phone || conversation?.contact?.email || 'Sin contacto'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isFetching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </div>
      </div>

      {/* Área de mensajes */}
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

      {/* Upload de archivos (si está visible) */}
      {showFileUpload && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Adjuntar archivos
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <FileUpload
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            disabled={isUploadingFiles}
          />
        </div>
      )}

      {/* Input de mensaje */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex-shrink-0">
        <div className="flex items-end space-x-3">
          {/* Botón adjuntar */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAttachClick}
            className={`p-2 flex-shrink-0 ${showFileUpload ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            title="Adjuntar archivo"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Input principal */}
          <div className="flex-1 relative min-w-0">
            <textarea
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={selectedFiles.length > 0 ? "Mensaje opcional..." : "Escribe un mensaje..."}
              disabled={messagesLoading || sendMessageMutation.isPending || isUploadingFiles}
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                        rounded-2xl resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 min-h-[44px] max-h-32"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
          </div>
          
          {/* Botón enviar */}
          <Button 
            onClick={() => {
              handleSendMessage(messageText, selectedFiles.length > 0 ? selectedFiles : undefined)
              setMessageText('')
            }}
            disabled={(!messageText.trim() && selectedFiles.length === 0) || messagesLoading || sendMessageMutation.isPending || isUploadingFiles}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 
                      text-white rounded-full p-3 transition-all duration-200 shadow-md hover:shadow-lg
                      disabled:cursor-not-allowed flex-shrink-0"
            size="sm"
          >
            {(sendMessageMutation.isPending || isUploadingFiles) ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </div>
        
        {/* Indicador de archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            📎 {selectedFiles.length} archivo(s) seleccionado(s)
          </div>
        )}
      </div>
    </div>
  )
}
