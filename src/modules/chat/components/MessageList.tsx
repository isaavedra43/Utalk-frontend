// Lista de mensajes de una conversación
// Renderiza mensajes con scroll virtual, estados de lectura y tiempo real
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface MessageListProps {
  conversationId: string
}

export function MessageList({ conversationId: _conversationId }: MessageListProps) {
  // TODO: Implementar lógica de mensajes
  // - useMessages hook para obtener mensajes
  // - Conexión WebSocket para mensajes en tiempo real
  // - Scroll automático a mensajes nuevos
  // - Indicadores de entrega y lectura
  // - Scroll virtual para performance con muchos mensajes
  // - Agrupación de mensajes por fecha/usuario

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* TODO: Implementar lista real de mensajes */}
      
      {/* Mensaje del usuario */}
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-xs">
          <p>Hola, ¿cómo estás?</p>
          <div className="text-xs opacity-70 mt-1">
            14:30 ✓✓
          </div>
        </div>
      </div>

      {/* Mensaje del contacto */}
      <div className="flex space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="bg-muted rounded-lg px-4 py-2 max-w-xs">
          <p>¡Hola! Todo bien, gracias por preguntar.</p>
          <div className="text-xs text-muted-foreground mt-1">
            14:32
          </div>
        </div>
      </div>

      {/* Mensaje del sistema */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-xs">
          Juan se unió a la conversación
        </Badge>
      </div>

      {/* Indicador de escritura */}
      <div className="flex space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="bg-muted rounded-lg px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground py-4">
        Lista de mensajes - Pendiente de implementación completa
      </div>
    </div>
  )
}

export default MessageList 