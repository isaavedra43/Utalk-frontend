import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../types';
import { useConversations } from '../../hooks/chat/useConversations';

interface VirtualizedMessageListProps {
  messages: Message[];
  height?: number;
  width?: string;
  itemSize?: number;
}

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({ 
  messages, 
  height = 400, 
  width = "100%",
  itemSize = 80 
}) => {
  // Obtener el nombre del cliente del contexto de conversaciones
  const { activeConversation } = useConversations({});
  
  const customerName = activeConversation?.contact?.profileName || 
                      activeConversation?.contact?.name || 
                      activeConversation?.customerName || 'Usuario';

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <MessageBubble 
        message={messages[index]} 
        customerName={customerName}
      />
    </div>
  );

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No hay mensajes</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={itemSize}
      width={width}
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      {Row}
    </List>
  );
}; 