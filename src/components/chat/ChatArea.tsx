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
    loadMoreMessages,
    isLoading,
    isSending,
    hasMore,
    isFetchingNextPage
  } = useMessages(selectedConversationId);

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'document' | 'location' = 'text') => {
    if (selectedConversationId && content.trim()) {
      sendMessage(content.trim(), type);
    }
  };

  const handleContextTagClick = (tag: string) => {
    console.log('Context tag clicked:', tag);
  };

  // Si no hay conversación seleccionada
  if (!selectedConversationId || !activeConversation) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
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
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
              {getCustomerInitials(activeConversation.customerName)}
            </div>

            {/* Información del contacto */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{activeConversation.customerName}</h3>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">en línea</span>
                {activeConversation.tags?.includes('VIP') && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">VIP</span>
                )}
              </div>
            </div>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
              <UserPlus className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
              <MoreVertical className="w-4 h-4" />
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
        onLoadMore={loadMoreMessages}
        hasMore={hasMore}
        isFetchingNextPage={isFetchingNextPage}
      />

      {/* Input de mensaje */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isSending={isSending}
        placeholder="Escribe un mensaje..."
        contextTags={['Proposal', 'Updated Doc']}
        onContextTagClick={handleContextTagClick}
        conversationId={selectedConversationId}
      />
    </div>
  );
}; 