/**
 * useMessages Hook
 * Manages messages data, real-time updates, and message sending
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Message, ApiError } from '@/lib/api';
import { safeDocument } from '@/lib/utils';

export interface MessagesFilter {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
  mediaType?: string;
}

export const useMessages = (conversationId: string | null, filters: MessagesFilter = {}) => {
  const queryClient = useQueryClient();
  const [isPolling, setIsPolling] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate query key
  const queryKey = ['messages', conversationId, filters];

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<MessagesResponse> => {
      if (!conversationId) {
        return { messages: [], total: 0, hasMore: false };
      }
      return apiClient.getMessages(conversationId, filters);
    },
    enabled: !!conversationId,
    refetchInterval: isPolling ? 3000 : false, // Poll every 3 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: SendMessageData }) => {
      return apiClient.sendMessage(conversationId, message);
    },
    onSuccess: (newMessage) => {
      // Add the new message to the cache
      queryClient.setQueryData<MessagesResponse>(queryKey, (old) => {
        if (!old) return { messages: [newMessage], total: 1, hasMore: false };
        
        return {
          ...old,
          messages: [...old.messages, newMessage],
          total: old.total + 1,
        };
      });

      // Scroll to bottom
      scrollToBottom();
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'image' | 'audio' | 'video' | 'document' }) => {
      return apiClient.uploadMedia(file, type);
    },
  });

  // Send text message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        message: { content: content.trim(), type: 'text' },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [conversationId, sendMessageMutation]);

  // Send message with media
  const sendMessageWithMedia = useCallback(async (
    content: string,
    file: File,
    type: 'image' | 'audio' | 'video' | 'document'
  ) => {
    if (!conversationId) return;

    try {
      // First upload the media
      const mediaData = await uploadMediaMutation.mutateAsync({ file, type });
      
      // Then send the message with media URL
      await sendMessageMutation.mutateAsync({
        conversationId,
        message: {
          content: content.trim() || `${type} enviado`,
          type,
          mediaUrl: mediaData.url,
          mediaType: mediaData.type,
        },
      });
    } catch (error) {
      console.error('Failed to send message with media:', error);
      throw error;
    }
  }, [conversationId, sendMessageMutation, uploadMediaMutation]);

  // Send image message
  const sendImage = useCallback(async (file: File, caption?: string) => {
    await sendMessageWithMedia(caption || '', file, 'image');
  }, [sendMessageWithMedia]);

  // Send document message
  const sendDocument = useCallback(async (file: File, caption?: string) => {
    await sendMessageWithMedia(caption || '', file, 'document');
  }, [sendMessageWithMedia]);

  // Send audio message
  const sendAudio = useCallback(async (file: File) => {
    await sendMessageWithMedia('', file, 'audio');
  }, [sendMessageWithMedia]);

  // Send video message
  const sendVideo = useCallback(async (file: File, caption?: string) => {
    await sendMessageWithMedia(caption || '', file, 'video');
  }, [sendMessageWithMedia]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    setTypingTimeout(timeout);
  }, [typingTimeout]);

  // Stop typing
  const stopTyping = useCallback(() => {
    setIsTyping(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  }, [typingTimeout]);

  // Refresh messages
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

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !messagesData?.hasMore) return;

    const oldestMessage = messagesData.messages[0];
    if (!oldestMessage) return;

    try {
      const moreMessages = await apiClient.getMessages(conversationId, {
        ...filters,
        before: oldestMessage.id,
      });

      // Prepend new messages to existing ones
      queryClient.setQueryData<MessagesResponse>(queryKey, (old) => {
        if (!old) return moreMessages;
        
        return {
          ...old,
          messages: [...moreMessages.messages, ...old.messages],
          hasMore: moreMessages.hasMore,
        };
      });
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  }, [conversationId, messagesData, filters, queryKey, queryClient]);

  // Get message by ID
  const getMessage = useCallback((messageId: string) => {
    return messagesData?.messages.find(m => m.id === messageId) || null;
  }, [messagesData]);

  // Get messages by type
  const getMessagesByType = useCallback((type: string) => {
    return messagesData?.messages.filter(m => m.type === type) || [];
  }, [messagesData]);

  // Get media messages
  const getMediaMessages = useCallback(() => {
    return messagesData?.messages.filter(m => 
      ['image', 'audio', 'video', 'document'].includes(m.type)
    ) || [];
  }, [messagesData]);

  // Get unread messages count
  const getUnreadCount = useCallback(() => {
    return messagesData?.messages.filter(m => 
      m.direction === 'inbound' && m.status !== 'read'
    ).length || 0;
  }, [messagesData]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    // This would typically be handled by the conversation update
    // For now, we'll just refresh the messages
    refresh();
  }, [refresh]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesData?.messages.length) {
      scrollToBottom();
    }
  }, [messagesData?.messages.length, scrollToBottom]);

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

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    // Data
    messages: messagesData?.messages || [],
    total: messagesData?.total || 0,
    hasMore: messagesData?.hasMore || false,
    messagesEndRef,
    
    // States
    isLoading,
    error: error as ApiError | null,
    isSending: sendMessageMutation.isPending,
    isUploading: uploadMediaMutation.isPending,
    isTyping,
    
    // Actions
    sendMessage,
    sendMessageWithMedia,
    sendImage,
    sendDocument,
    sendAudio,
    sendVideo,
    handleTyping,
    stopTyping,
    scrollToBottom,
    refresh,
    startPolling,
    stopPolling,
    loadMoreMessages,
    markAsRead,
    
    // Utilities
    getMessage,
    getMessagesByType,
    getMediaMessages,
    getUnreadCount,
    
    // Errors
    sendError: sendMessageMutation.error as ApiError | null,
    uploadError: uploadMediaMutation.error as ApiError | null,
  };
};

export default useMessages; 