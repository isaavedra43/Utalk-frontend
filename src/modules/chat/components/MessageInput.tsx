// Entrada de mensajes con soporte para texto, archivos y emojis
// Maneja el envío de mensajes y indicadores de escritura
import { useState } from 'react'
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
      {/* ✅ CORREGIDO: Alineación perfecta con flex y centrado vertical */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Botón adjuntar archivo - CORREGIDO: Tamaño consistente */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                    rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex-shrink-0"
          title="Adjuntar archivo"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Input de mensaje - CORREGIDO: Mejor alineación y espaciado */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            disabled={disabled}
            className="pr-20 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 
                      rounded-2xl h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200"
          />
          
          {/* Botones dentro del input - CORREGIDO: Mejor posicionamiento */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                        rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                        rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              title="Mensaje de voz"
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Botón enviar - CORREGIDO: Tamaño consistente y mejor diseño */}
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 
                    text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200
                    disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-5 h-5" />
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