// Componente de burbuja de mensaje con soporte multimedia
import { useState } from 'react'
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

export function MessageBubble({ message, isOwnMessage, className }: MessageBubbleProps) {
  // ✅ Formatear tiempo del mensaje
  const formatMessageTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  // ✅ Renderizar contenido según tipo de mensaje
  const renderMessageContent = () => {
    // ✅ Verificar si tiene archivos adjuntos
    if (message.attachments && message.attachments.length > 0) {
      return (
        <div className="space-y-2">
          {/* Texto del mensaje si existe */}
          {message.content && message.content.trim() && (
            <p className="text-sm">{message.content}</p>
          )}
          
          {/* Renderizar archivos */}
          {message.attachments.map((file, index) => {
            // Usar AudioPlayer especializado para archivos de audio
            if (file.category === 'audio') {
              return (
                <AudioPlayer
                  key={file.id || index}
                  file={file}
                  metadata={file.metadata}
                />
              )
            }
            
            // Usar FileRenderer para otros tipos
            return (
              <FileRenderer
                key={file.id || index}
                file={file}
              />
            )
          })}
        </div>
      )
    }

    // Mensaje de texto normal
    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.content}
      </p>
    )
  }

  return (
    <div className={cn(
      "flex gap-3 p-4",
      isOwnMessage ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {/* Avatar */}
      {!isOwnMessage && (
        <Avatar
          name={message.sender.name || message.sender.email}
          size="sm"
        />
      )}

      {/* Contenido del mensaje */}
      <div className={cn(
        "flex flex-col max-w-xs lg:max-w-md",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {/* Información del remitente */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-700">
              {message.sender.name || message.sender.email}
            </span>
          </div>
        )}

        {/* Burbuja del mensaje */}
        <div className={cn(
          "relative px-4 py-2 rounded-2xl shadow-sm",
          isOwnMessage 
            ? "bg-blue-500 text-white" 
            : "bg-white border border-gray-200 text-gray-900",
          // Ajustar padding para mensajes con archivos
          message.attachments?.length ? "p-2" : "px-4 py-2"
        )}>
          {renderMessageContent()}
        </div>

        {/* Metadatos del mensaje */}
        <div className={cn(
          "flex items-center gap-2 mt-1 text-xs text-gray-500",
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Timestamp */}
          <span>{formatMessageTime(message.timestamp)}</span>
          
          {/* Estado del mensaje (solo para mensajes propios) */}
          {isOwnMessage && (
            <MessageStatus 
              status={message.status} 
              error={message.metadata?.error}
              timestamp={message.timestamp}
            />
          )}
        </div>
      </div>
    </div>
  )
}
