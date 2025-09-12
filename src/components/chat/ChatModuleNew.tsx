import React, { useState, useEffect } from 'react';
import { useChatNew } from '../../hooks/useChatNew';
import { logger } from '../../utils/logger';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  AlertCircle, 
  Wifi, 
  WifiOff,
  Users,
  Clock
} from 'lucide-react';

interface ChatModuleNewProps {
  className?: string;
}

// Componente para mostrar el estado de conexión
const ConnectionStatus: React.FC<{ isConnected: boolean }> = ({ isConnected }) => (
  <div className={`flex items-center gap-2 px-3 py-2 text-sm ${
    isConnected 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-red-600 bg-red-50 border-red-200'
  } border rounded-lg`}>
    {isConnected ? (
      <>
        <Wifi className="w-4 h-4" />
        <span>Conectado en tiempo real</span>
      </>
    ) : (
      <>
        <WifiOff className="w-4 h-4" />
        <span>Reconectando...</span>
      </>
    )}
  </div>
);

// Componente para mostrar errores
const ErrorMessage: React.FC<{ error: string; onClear: () => void }> = ({ error, onClear }) => (
  <div className="flex items-center justify-between p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5" />
      <span>{error}</span>
    </div>
    <button
      onClick={onClear}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Cerrar
    </button>
  </div>
);

// Componente para la lista de conversaciones
const ConversationsList: React.FC<{
  conversations: any[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
}> = ({ conversations, currentConversationId, onSelectConversation, isLoading }) => {
  
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Menos de 1 minuto
      return 'Ahora';
    } else if (diff < 3600000) { // Menos de 1 hora
      return `${Math.floor(diff / 60000)}m`;
    } else if (diff < 86400000) { // Menos de 1 día
      return `${Math.floor(diff / 3600000)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando conversaciones...</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay conversaciones</h3>
        <p className="text-sm text-center">
          No tienes conversaciones activas en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
            currentConversationId === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.name}
                </h4>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(conversation.lastMessageTime)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage || 'Sin mensajes'}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Componente para la lista de mensajes
const MessagesList: React.FC<{
  messages: any[];
  user: any;
  isLoading: boolean;
}> = ({ messages, user, isLoading }) => {
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando mensajes...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay mensajes</h3>
        <p className="text-sm text-center">
          Envía el primer mensaje para comenzar la conversación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === user?.id;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              isOwnMessage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center justify-between mt-1 text-xs ${
                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span>{formatMessageTime(message.timestamp)}</span>
                {isOwnMessage && message.status && (
                  <span className="ml-2">
                    {message.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'read' && <span className="text-blue-200">✓✓</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente para el input de mensajes
const MessageInput: React.FC<{
  onSendMessage: (content: string) => void;
  disabled: boolean;
}> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

// Componente principal
export const ChatModuleNew: React.FC<ChatModuleNewProps> = ({ className = '' }) => {
  const {
    messages,
    conversations,
    currentConversationId,
    user,
    isLoading,
    isInitialized,
    isSocketConnected,
    error,
    sendMessage,
    loadMessages,
    loadConversations,
    setCurrentConversation,
    clearError,
    initialize
  } = useChatNew();

  const [selectedView, setSelectedView] = useState<'conversations' | 'chat'>('conversations');

  // Inicializar el chat cuando el componente se monta
  useEffect(() => {
    if (!isInitialized) {
      logger.apiInfo('Inicializando ChatModuleNew...');
      initialize().catch((error) => {
        logger.apiError('Error inicializando ChatModuleNew', error);
      });
    }
  }, [isInitialized, initialize]);

  // Manejar selección de conversación
  const handleSelectConversation = (conversationId: string) => {
    logger.apiInfo('Seleccionando conversación', { conversationId });
    setCurrentConversation(conversationId);
    setSelectedView('chat');
  };

  // Manejar envío de mensaje
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage({ content });
    } catch (error) {
      logger.apiError('Error enviando mensaje desde componente', error as Error);
    }
  };

  // Manejar volver a conversaciones
  const handleBackToConversations = () => {
    setSelectedView('conversations');
  };

  // Mostrar loading inicial
  if (!isInitialized && isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-white ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Inicializando Chat</h2>
          <p className="text-gray-600">Configurando conexión en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Panel de conversaciones */}
      <div className={`w-1/3 bg-white border-r border-gray-200 flex flex-col ${
        selectedView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header de conversaciones */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Conversaciones</h1>
            <button
              onClick={loadConversations}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Estado de conexión */}
          <ConnectionStatus isConnected={isSocketConnected} />
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          <ConversationsList
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Panel de chat */}
      <div className={`flex-1 flex flex-col ${
        selectedView === 'conversations' ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Error message */}
        {error && (
          <div className="p-4 border-b border-gray-200">
            <ErrorMessage error={error} onClear={clearError} />
          </div>
        )}

        {/* Header del chat */}
        {currentConversationId && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToConversations}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <div className="flex-1">
                {(() => {
                  const conversation = conversations.find(c => c.id === currentConversationId);
                  return conversation ? (
                    <div className="flex items-center gap-3">
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <h2 className="font-medium text-gray-900">{conversation.name}</h2>
                        <p className="text-sm text-gray-500">
                          {isSocketConnected ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Conversación no encontrada</div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto bg-white">
          {currentConversationId ? (
            <MessagesList
              messages={messages}
              user={user}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
              <p className="text-sm text-center">
                Elige una conversación de la lista para comenzar a chatear.
              </p>
            </div>
          )}
        </div>

        {/* Input de mensaje */}
        {currentConversationId && (
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || !isSocketConnected}
          />
        )}
      </div>
    </div>
  );
};
