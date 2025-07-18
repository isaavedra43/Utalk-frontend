// Entrada de mensajes con soporte para texto, archivos y emojis
// Maneja el envío de mensajes y indicadores de escritura
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, Smile, Mic, Send } from 'lucide-react'

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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Botón adjuntar archivo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Adjuntar archivo"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Input de mensaje */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            disabled={disabled}
            className="pr-16 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
          
          {/* Botones dentro del input */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-gray-500 hover:text-gray-700"
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-gray-500 hover:text-gray-700"
              title="Mensaje de voz"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Botón enviar */}
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="bg-[#4880ff] hover:bg-[#3968cc] text-white"
          size="sm"
        >
          <Send className="w-4 h-4" />
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