import React from 'react';
import { Phone, Video, UserPlus, Bookmark, MoreVertical } from 'lucide-react';
import { MessageContainer } from './MessageContainer';
import { MessageInput } from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useAppStore } from '../../stores/useAppStore';

export const ChatArea: React.FC = () => {
  const { activeConversation } = useAppStore();
  const selectedConversationId = activeConversation?.id || null;
  
  const {
    messageGroups,
    typingUsers,
    messagesEndRef,
    sendMessage,
    isLoading,
    isSending
  } = useMessages(selectedConversationId);

  // Generar iniciales del cliente
  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Manejar envío de mensaje
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  // Manejar click en tag de contexto
  const handleContextTagClick = (tag: string) => {
    // Aquí se puede implementar la lógica para manejar tags de contexto
    console.log('Tag de contexto clickeado:', tag);
  };

  // Si no hay conversación seleccionada
  if (!selectedConversationId || !activeConversation) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
            <p className="text-gray-500 text-sm">Elige una conversación para comenzar a chatear</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
              {getCustomerInitials(activeConversation.customerName)}
            </div>
            
            {/* Información del contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{activeConversation.customerName}</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">en línea</span>
                {activeConversation.tags?.includes('VIP') && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">VIP</span>
                )}
              </div>
            </div>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Video className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bookmark className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor de mensajes */}
      <MessageContainer
        messageGroups={messageGroups}
        typingUsers={typingUsers}
        messagesEndRef={messagesEndRef}
        customerName={activeConversation.customerName}
        isLoading={isLoading}
      />

      {/* Input de mensaje */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isSending={isSending}
        placeholder="Escribe un mensaje..."
        contextTags={['Proposal', 'Updated Doc']}
        onContextTagClick={handleContextTagClick}
      />
    </div>
  );
}; 