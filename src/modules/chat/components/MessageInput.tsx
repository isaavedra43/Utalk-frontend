// Entrada de mensajes con soporte para texto, archivos y emojis
// Maneja el envío de mensajes y indicadores de escritura
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MessageInputProps {
  conversationId: string
  onSendMessage?: (message: string) => void
  disabled?: boolean
}

export function MessageInput({ conversationId: _conversationId, onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')

  // TODO: Implementar funcionalidades
  // - Envío de mensajes de texto
  // - Subida de archivos/imágenes
  // - Selector de emojis
  // - Indicador de escritura (typing)
  // - Autocompletado de menciones
  // - Soporte para markdown/formato
  // - Grabación de mensajes de voz
  // - Shortcuts de teclado (Ctrl+Enter)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            disabled={disabled}
            className="pr-20"
          />
          
          {/* Botones de acciones adicionales */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {/* TODO: Añadir botones de adjuntar, emojis, etc. */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              title="Adjuntar archivo"
            >
              📎
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              title="Emoji"
            >
              😊
            </Button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          size="sm"
        >
          Enviar
        </Button>
      </form>
      
      {/* TODO: Mostrar indicador de usuarios escribiendo */}
      {/* {isTyping && (
        <div className="text-xs text-muted-foreground mt-1">
          Usuario está escribiendo...
        </div>
      )} */}
    </div>
  )
}

export default MessageInput 