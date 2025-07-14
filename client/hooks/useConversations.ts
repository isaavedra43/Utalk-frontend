/**
 * useConversations Hook
 * Manages conversations data, real-time updates, and API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Conversation, ApiError } from '@/lib/api';
import { safeDocument } from '@/lib/utils';

export interface ConversationsFilter {
  status?: 'active' | 'pending' | 'resolved' | 'closed';
  channel?: 'whatsapp' | 'facebook' | 'email' | 'sms' | 'webchat';
  search?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  page?: number;
  limit?: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const useConversations = (filters: ConversationsFilter = {}) => {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Generate query key
  const queryKey = ['conversations', filters];

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<ConversationsResponse> => {
      const response = await apiClient.getConversations(filters);
      return {
        ...response,
        hasMore: response.conversations.length === (filters.limit || 20),
      };
    },
    refetchInterval: isPolling ? 5000 : false, // Poll every 5 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update conversation mutation
  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Conversation> }) => {
      return apiClient.updateConversation(id, updates);
    },
    onSuccess: (updatedConversation) => {
      // Update the conversation in the cache
      queryClient.setQueryData<ConversationsResponse>(queryKey, (old) => {
        if (!old) return old;
        
        const updatedConversations = old.conversations.map(conv =>
          conv.id === updatedConversation.id ? updatedConversation : conv
        );
        
        return {
          ...old,
          conversations: updatedConversations,
        };
      });

      // Also update individual conversation cache if it exists
      queryClient.setQueryData(['conversation', updatedConversation.id], updatedConversation);
    },
  });

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { unreadCount: 0 },
      });
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  }, [updateConversationMutation]);

  // Assign conversation
  const assignConversation = useCallback(async (conversationId: string, assignedTo: string) => {
    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { assignedTo },
      });
    } catch (error) {
      console.error('Failed to assign conversation:', error);
    }
  }, [updateConversationMutation]);

  // Change conversation status
  const changeStatus = useCallback(async (
    conversationId: string,
    status: 'active' | 'pending' | 'resolved' | 'closed'
  ) => {
    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { status },
      });
    } catch (error) {
      console.error('Failed to change conversation status:', error);
    }
  }, [updateConversationMutation]);

  // Add tags to conversation
  const addTags = useCallback(async (conversationId: string, tags: string[]) => {
    try {
      const conversation = conversationsData?.conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const newTags = [...new Set([...conversation.tags, ...tags])];
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { tags: newTags },
      });
    } catch (error) {
      console.error('Failed to add tags to conversation:', error);
    }
  }, [conversationsData, updateConversationMutation]);

  // Remove tags from conversation
  const removeTags = useCallback(async (conversationId: string, tagsToRemove: string[]) => {
    try {
      const conversation = conversationsData?.conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const newTags = conversation.tags.filter(tag => !tagsToRemove.includes(tag));
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { tags: newTags },
      });
    } catch (error) {
      console.error('Failed to remove tags from conversation:', error);
    }
  }, [conversationsData, updateConversationMutation]);

  // Set priority
  const setPriority = useCallback(async (
    conversationId: string,
    priority: 'low' | 'medium' | 'high'
  ) => {
    try {
      await updateConversationMutation.mutateAsync({
        id: conversationId,
        updates: { priority },
      });
    } catch (error) {
      console.error('Failed to set conversation priority:', error);
    }
  }, [updateConversationMutation]);

  // Select conversation
  const selectConversation = useCallback((conversationId: string | null) => {
    setSelectedConversationId(conversationId);
    
    // Mark as read when selected
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [markAsRead]);

  // Get selected conversation
  const selectedConversation = conversationsData?.conversations.find(
    c => c.id === selectedConversationId
  ) || null;

  // Refresh conversations
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Start/stop polling
  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // Get conversations by status
  const getConversationsByStatus = useCallback((status: string) => {
    if (!conversationsData) return [];
    return conversationsData.conversations.filter(c => c.status === status);
  }, [conversationsData]);

  // Get conversations by channel
  const getConversationsByChannel = useCallback((channel: string) => {
    if (!conversationsData) return [];
    return conversationsData.conversations.filter(c => c.channel === channel);
  }, [conversationsData]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    if (!conversationsData) return 0;
    return conversationsData.conversations.reduce((count, conv) => count + conv.unreadCount, 0);
  }, [conversationsData]);

  // Get conversations with high priority
  const getHighPriorityConversations = useCallback(() => {
    if (!conversationsData) return [];
    return conversationsData.conversations.filter(c => c.priority === 'high');
  }, [conversationsData]);

  // Polling visibility management
  useEffect(() => {
    const handleVisibilityChange = () => {
      // SAFE DOCUMENT ACCESS - Previene crashes en SSR
      if (safeDocument.getVisibilityState() === 'visible' && isPolling) {
        refetch();
      }
    };

    // SAFE DOCUMENT - Event listener protegido
    const cleanup = safeDocument.addEventListener('visibilitychange', handleVisibilityChange);
    return cleanup;
  }, [isPolling, refetch]);

  return {
    // Data
    conversations: conversationsData?.conversations || [],
    total: conversationsData?.total || 0,
    page: conversationsData?.page || 1,
    limit: conversationsData?.limit || 20,
    hasMore: conversationsData?.hasMore || false,
    selectedConversation,
    selectedConversationId,
    
    // States
    isLoading,
    error: error as ApiError | null,
    isUpdating: updateConversationMutation.isPending,
    
    // Actions
    selectConversation,
    markAsRead,
    assignConversation,
    changeStatus,
    addTags,
    removeTags,
    setPriority,
    refresh,
    startPolling,
    stopPolling,
    
    // Utilities
    getConversationsByStatus,
    getConversationsByChannel,
    getUnreadCount,
    getHighPriorityConversations,
  };
};

export default useConversations; 