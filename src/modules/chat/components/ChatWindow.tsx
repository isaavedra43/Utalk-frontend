// Ventana principal de chat con header, mensajes e input
// Componente central que une MessageList y MessageInput
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreVertical, 
  Phone, 
  Video, 
  Archive, 
  UserPlus,
  Pin,
  VolumeX,
  Volume2,
  Info
} from 'lucide-react'
import { ChatWindowProps } from '../types'
import Avatar from './Avatar'
import ChannelBadge from './ChannelBadge'
import MessageInput from './MessageInput'
import MessageBubble from './MessageBubble'
import { ChatWindowSkeleton } from './LoaderSkeleton'
import { useConversationData } from '../hooks/useConversationData'

export function ChatWindow({
  conversationId,
  messages,
  isLoading,
  typingUsers,
  onSendMessage
}: ChatWindowProps) {
  const [showInfo, setShowInfo] = useState(false)

  // ✅ OBTENER DATOS REALES DEL BACKEND - Reemplaza datos hardcodeados
  const { data: conversationData, isLoading: isLoadingConversation, error: conversationError } = useConversationData(conversationId)

  // ✅ LOGS CRÍTICOS: Diagnosticar datos de mensajes y conversación
  console.log('🔍 ChatWindow render:', {
    conversationId,
    messagesLength: messages.length,
    isLoading,
    isLoadingConversation,
    conversationError,
    hasConversationData: !!conversationData,
    contactName: conversationData?.contact?.name,
    status: conversationData?.status,
    messages: messages.slice(0, 3), // Solo los primeros 3 para debug
    messageTypes: messages.map(m => ({ id: m.id, type: m.type, content: m.content?.substring(0, 50) }))
  });

  const handleSendMessage = (content: string) => {
    onSendMessage(content, 'text')
  }

  const handleAssignConversation = () => {
    // TODO: Implementar lógica de asignación
    console.log('Asignar conversación')
  }

  const handleArchiveConversation = () => {
    // TODO: Implementar lógica de archivo
    console.log('Archivar conversación')
  }

  const handleMuteConversation = () => {
    // TODO: Implementar lógica de silenciar
    console.log('Silenciar conversación')
  }

  // Renderizar indicadores de typing
  const renderTypingIndicators = () => {
    if (typingUsers.length === 0) return null

    return (
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-gray-500">
            {typingUsers.length === 1 
              ? `${typingUsers[0].userName} está escribiendo...`
              : `${typingUsers.length} personas están escribiendo...`
            }
          </span>
        </div>
      </div>
    )
  }

  // ✅ MOSTRAR LOADING SI SE ESTÁ CARGANDO LA CONVERSACIÓN
  if (isLoading || isLoadingConversation) {
    console.log('🔄 ChatWindow: Showing loading state');
    return <ChatWindowSkeleton />
  }

  // ✅ MOSTRAR ERROR SI HAY PROBLEMA CON LA CONVERSACIÓN
  if (conversationError) {
    console.error('❌ ChatWindow: Conversation error:', conversationError);
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <div className="flex-1 flex flex-col items-center justify-center text-red-500 dark:text-red-400">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium mb-2">Error al cargar conversación</h2>
          <p className="text-sm text-center max-w-md">
            No se pudo cargar la información de la conversación
          </p>
        </div>
      </div>
    )
  }

  // ✅ MOSTRAR ESTADO VACÍO SI NO HAY CONVERSACIÓN SELECCIONADA
  if (!conversationId || !conversationData) {
    console.log('🤷 ChatWindow: No conversation selected');
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-medium mb-2">Selecciona una conversación</h2>
          <p className="text-sm text-center max-w-md">
            Elige una conversación de la lista para comenzar a chatear con tus clientes
          </p>
        </div>
      </div>
    )
  }

  // ✅ EXTRAER DATOS DE LA CONVERSACIÓN REAL
  const { contact, status, assignedTo, priority, isMuted } = conversationData

  console.log('✅ ChatWindow: Rendering conversation with', messages.length, 'messages');

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header de la conversación */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar 
            src={contact.avatar}
            name={contact.name}
            size="lg"
            isOnline={contact.isOnline}
            channel={contact.channel}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {contact.name}
              </h3>
              
              <ChannelBadge channel={contact.channel} size="sm" />
              
              {priority === 'high' && (
                <Pin className="w-4 h-4 text-red-500 transform rotate-45" />
              )}
              
              {isMuted && (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {contact.phone}
              </span>
              
              <Badge 
                variant={status === 'open' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {status === 'open' ? 'Abierta' : 
                 status === 'closed' ? 'Cerrada' : 'Pendiente'}
              </Badge>
              
              {assignedTo && (
                <span className="text-xs text-gray-500">
                  Asignado a: {assignedTo.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            title="Llamada telefónica"
          >
            <Phone className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            title="Videollamada"
          >
            <Video className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAssignConversation}
            className="text-gray-500 hover:text-gray-700"
            title="Asignar conversación"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMuteConversation}
            className="text-gray-500 hover:text-gray-700"
            title={isMuted ? "Activar notificaciones" : "Silenciar conversación"}
          >
            {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchiveConversation}
            className="text-gray-500 hover:text-gray-700"
            title="Archivar conversación"
          >
            <Archive className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-500 hover:text-gray-700"
            title="Información del cliente"
          >
            <Info className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Lista de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {(() => {
            console.log('🎯 ChatWindow: Rendering messages area with', messages.length, 'messages');
            
            if (messages.length === 0) {
              console.log('📭 ChatWindow: No messages, showing empty state');
              return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="text-lg font-medium mb-1">¡Comienza la conversación!</h3>
                  <p className="text-sm text-center">
                    Este es el inicio de tu conversación con {contact.name}
                  </p>
                </div>
              );
            }

            console.log('💬 ChatWindow: Rendering', messages.length, 'message bubbles');
            return (
              <>
                {messages.map((message, index) => {
                  console.log(`📝 Rendering message ${index + 1}/${messages.length}:`, {
                    id: message.id,
                    content: message.content?.substring(0, 50),
                    sender: message.sender.name,
                    type: message.type
                  });
                  
                  const previousMessage = index > 0 ? messages[index - 1] : null
                  const isGrouped = previousMessage?.sender.id === message.sender.id
                  const showAvatar = !isGrouped || index === 0
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showAvatar={showAvatar}
                      isGrouped={isGrouped}
                    />
                  )
                })}
              </>
            );
          })()}
        </div>

        {/* Indicadores de typing */}
        {renderTypingIndicators()}

        {/* Input de mensaje */}
        <MessageInput
          conversationId={conversationId}
          onSendMessage={handleSendMessage}
          disabled={status === 'closed'}
        />
      </div>
    </div>
  )
}

export default ChatWindow 