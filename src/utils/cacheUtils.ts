import type { Conversation } from '../types';

export interface ConversationCacheData {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const updateConversationInCache = (
  oldData: unknown,
  updatedConversation: Conversation
): ConversationCacheData | unknown => {
  if (!oldData || typeof oldData !== 'object' || !('conversations' in oldData)) {
    return oldData;
  }
  
  const data = oldData as ConversationCacheData;
  return {
    ...data,
    conversations: data.conversations.map((conv: Conversation) =>
      conv.id === updatedConversation.id ? updatedConversation : conv
    )
  };
}; 