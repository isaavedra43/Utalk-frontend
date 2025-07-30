// Componente de burbuja de mensaje con soporte multimedia
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'
import { MessageStatus } from './MessageStatus'
import { FileRenderer } from './FileRenderer'
import { AudioPlayer } from './AudioPlayer'
import type { CanonicalMessage } from '@/types/canonical'

interface MessageBubbleProps {
  message: CanonicalMessage
  isOwnMessage: boolean
  className?: string
}

// ✅ Error Boundary específico para MessageBubble
class MessageBubbleErrorBoundary extends React.Component<
  { children: React.ReactNode; messageId?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; messageId?: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ERROR-BOUNDARY] MessageBubble error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR-BOUNDARY] MessageBubble componentDidCatch:', {
      error,
      errorInfo,
      messageId: this.props.messageId
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded">
          <div className="text-red-600 dark:text-red-400 text-xs">
            ❌ Error renderizando mensaje {this.props.messageId}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function MessageBubble({ message, isOwnMessage, className }: MessageBubbleProps) {
  // ✅ VALIDACIÓN ULTRA-DEFENSIVA
  if (!message) {
    console.error('[MESSAGE-BUBBLE] No message provided')
    return (
      <div className="p-2 border border-yellow-200 bg-yellow-50 rounded">
        <div className="text-yellow-600 text-xs">⚠️ Mensaje no válido</div>
      </div>
    )
  }

  // ✅ EXTRACCIÓN SEGURA DE DATOS
  const messageId = message.id || `bubble_${Date.now()}`
  const messageContent = message.content || ''
  const messageTimestamp = message.timestamp || new Date().toISOString()
  const messageType = message.type || 'text'
  const messageStatus = message.status || 'sent'
  const messageAttachments = Array.isArray(message.attachments) ? message.attachments : []
  const messageMediaUrl = message.mediaUrl || null

  // ✅ DATOS DEL REMITENTE CON FALLBACKS
  const senderData = message.sender || {}
  const senderName = (senderData as any)?.name || 
                    (senderData as any)?.email || 
                    (message as any).senderIdentifier || 
                    'Usuario'
  const senderEmail = (senderData as any)?.email || 
                     (message as any).senderIdentifier || 
                     'unknown@email.com'

  console.log('[MESSAGE-BUBBLE] Rendering message:', {
    messageId,
    messageType,
    hasContent: !!messageContent,
    hasAttachments: messageAttachments.length > 0,
    hasMediaUrl: !!messageMediaUrl,
    isOwnMessage,
    senderName,
    senderEmail
  })

  // ✅ Formatear tiempo del mensaje de forma segura
  const formatMessageTime = (timestamp: string | Date): string => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      
      if (isNaN(date.getTime())) {
        console.warn('[MESSAGE-BUBBLE] Invalid timestamp:', timestamp)
        return ''
      }
      
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } catch (error) {
      console.error('[MESSAGE-BUBBLE] Error formatting time:', error, timestamp)
      return ''
    }
  }

  // ✅ Renderizar contenido según tipo de mensaje de forma segura
  const renderMessageContent = (): React.ReactNode => {
    try {
      // ✅ Si hay archivos adjuntos
      if (messageAttachments.length > 0) {
        return (
          <div className="space-y-2">
            {/* Texto del mensaje si existe */}
            {messageContent && messageContent.trim() && (
              <p className="text-sm break-words">{messageContent}</p>
            )}
            
            {/* Renderizar archivos de forma segura */}
            {messageAttachments.map((file, index) => {
              try {
                if (!file) {
                  console.warn('[MESSAGE-BUBBLE] Invalid attachment at index:', index)
                  return null
                }

                // Usar AudioPlayer especializado para archivos de audio
                if (file.category === 'audio') {
                  return (
                    <AudioPlayer
                      key={file.id || `audio_${index}`}
                      file={file}
                      metadata={file.metadata || {}}
                    />
                  )
                }
                
                // Usar FileRenderer para otros tipos de archivos
                return (
                  <FileRenderer
                    key={file.id || `file_${index}`}
                    file={file}
                  />
                )
              } catch (error) {
                console.error('[MESSAGE-BUBBLE] Error rendering attachment:', error, file)
                return (
                  <div key={`error_${index}`} className="text-xs text-red-500 p-1 border border-red-200 rounded">
                    ❌ Error al mostrar archivo
                  </div>
                )
              }
            })}
          </div>
        )
      }

      // ✅ Si hay mediaUrl (imagen, video, etc.)
      if (messageMediaUrl) {
        return (
          <div className="space-y-2">
            {messageContent && messageContent.trim() && (
              <p className="text-sm break-words">{messageContent}</p>
            )}
            <div className="max-w-xs">
              <img 
                src={messageMediaUrl} 
                alt="Imagen del mensaje"
                className="rounded-lg max-w-full h-auto"
                onError={(e) => {
                  console.warn('[MESSAGE-BUBBLE] Image load error:', messageMediaUrl)
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          </div>
        )
      }

      // ✅ Mensaje de texto simple
      if (messageContent && messageContent.trim()) {
        return <p className="text-sm break-words whitespace-pre-wrap">{messageContent}</p>
      }

      // ✅ Mensaje sin contenido
      return (
        <p className="text-xs text-gray-400 italic">
          [Mensaje sin contenido - Tipo: {messageType}]
        </p>
      )
    } catch (error) {
      console.error('[MESSAGE-BUBBLE] Error rendering message content:', error)
      return (
        <div className="text-xs text-red-500 p-1 border border-red-200 rounded">
          ❌ Error al mostrar contenido del mensaje
        </div>
      )
    }
  }

  return (
    <MessageBubbleErrorBoundary messageId={messageId}>
      <div className={cn(
        'flex w-full mb-4',
        isOwnMessage ? 'justify-end' : 'justify-start',
        className
      )}>
        <div className={cn(
          'flex max-w-xs lg:max-w-md',
          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
        )}>
          {/* Avatar para mensajes ajenos */}
          {!isOwnMessage && (
            <div className="flex-shrink-0 mr-2">
              <Avatar 
                name={senderName}
                size="sm"
              />
            </div>
          )}

          {/* Contenido del mensaje */}
          <div className={cn(
            'rounded-lg px-3 py-2 shadow-sm',
            isOwnMessage 
              ? 'bg-blue-500 text-white' 
              : 'bg-white dark:bg-gray-800 border'
          )}>
            {/* Nombre del remitente para mensajes ajenos */}
            {!isOwnMessage && (
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {senderName}
              </div>
            )}

            {/* Contenido del mensaje */}
            <div className="mb-1">
              {renderMessageContent()}
            </div>

            {/* Información del mensaje (hora y estado) */}
            <div className={cn(
              'flex items-center justify-between text-xs mt-1',
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            )}>
              <span>{formatMessageTime(messageTimestamp)}</span>
              {isOwnMessage && (
                <MessageStatus 
                  status={messageStatus} 
                  timestamp={messageTimestamp}
                  className="ml-2" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </MessageBubbleErrorBoundary>
  )
}
