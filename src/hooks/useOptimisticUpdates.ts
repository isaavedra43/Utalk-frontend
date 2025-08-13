import { useCallback } from 'react';
import type { Message } from '../types';

export const useOptimisticUpdates = (addMessage: (conversationId: string, message: Message) => void, updateMessage: (conversationId: string, messageId: string, message: Partial<Message>) => void) => {
  const addOptimisticMessage = useCallback((conversationId: string, message: Message) => {
    addMessage(conversationId, message);
  }, [addMessage]);

  const updateMessageStatus = useCallback((conversationId: string, messageId: string, status: 'sent' | 'delivered' | 'read' | 'failed') => {
    updateMessage(conversationId, messageId, { status });
  }, [updateMessage]);

  const updateMessageContent = useCallback((conversationId: string, messageId: string, content: string) => {
    updateMessage(conversationId, messageId, { content });
  }, [updateMessage]);

  const removeOptimisticMessage = useCallback((messageId: string) => {
    // Implementar lógica para remover mensaje optimista
    console.log('Removing optimistic message:', messageId);
  }, []);

  return { 
    addOptimisticMessage, 
    updateMessageStatus, 
    updateMessageContent, 
    removeOptimisticMessage 
  };
}; 