import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import { logger } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Message, MessageFormData } from '@/types/api';

interface SendMessageOptions {
  conversationId: string;
  onSuccess?: (message: Message) => void;
  onError?: (error: string) => void;
}

interface MessageState {
  id: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  error?: string;
  retryCount: number;
}

interface ExtendedMessage extends Omit<Message, 'status' | 'attachments'> {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  attachments?: any[];
}

export function useSendMessage({ conversationId, onSuccess, onError }: SendMessageOptions) {
  const [messageStates, setMessageStates] = useState<Map<string, MessageState>>(new Map());
  const queryClient = useQueryClient();

  // Actualizar estado de mensaje local
  const updateMessageState = useCallback((messageId: string, updates: Partial<MessageState>) => {
    setMessageStates(prev => {
      const newStates = new Map(prev);
      const current = newStates.get(messageId) || { id: messageId, status: 'sending', retryCount: 0 };
      newStates.set(messageId, { ...current, ...updates });
      return newStates;
    });
  }, []);

  // Enviar mensaje con Socket.io + fallback API
  const sendMessage = useMutation({
    mutationFn: async (messageData: MessageFormData): Promise<Message> => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.api('🚀 Enviando mensaje', { conversationId, content: messageData.content });

      // Crear mensaje temporal para UI inmediata
      const tempMessage: ExtendedMessage = {
        id: tempId,
        conversationId,
        content: messageData.content,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'sending',
        type: messageData.type || 'text',
        attachments: messageData.attachments || []
      };

      // Actualizar UI inmediatamente
      updateMessageState(tempId, { status: 'sending' });
      
      // Agregar a cache local para mostrar inmediatamente
      queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
        if (oldData?.messages) {
          return {
            ...oldData,
            messages: [...oldData.messages, tempMessage]
          };
        }
        return oldData;
      });

      try {
        // 1. 📤 Intentar envío via Socket.io con ACK
        const socket = getSocket();
        let socketSuccess = false;
        
        if (socket && socket.connected) {
          logger.socket('📨 Enviando mensaje via Socket.io', { tempId, conversationId });
          
          const socketResponse = await new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Socket timeout'));
            }, 5000); // 5 segundos timeout

            (socket as any).emit('send-message', {
              conversationId,
              content: messageData.content,
              type: messageData.type || 'text',
              attachments: messageData.attachments || []
            }, (response: any) => {
              clearTimeout(timeout);
              
              if (response.success) {
                logger.socket('✅ Mensaje enviado via Socket con ACK', { 
                  tempId, 
                  realId: response.messageId 
                });
                resolve(response);
              } else {
                logger.socket('❌ Error en ACK de Socket', { 
                  tempId, 
                  error: response.error 
                }, true);
                reject(new Error(response.error || 'Socket ACK failed'));
              }
            });
          });

          if (socketResponse.success) {
            socketSuccess = true;
            
            // Actualizar mensaje temporal con ID real
            const realMessage: Message = {
              ...tempMessage,
              id: socketResponse.messageId,
              status: 'sent',
              timestamp: socketResponse.timestamp || tempMessage.timestamp
            };

            updateMessageState(tempId, { status: 'sent' });
            
            // Actualizar cache con mensaje real
            queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
              if (oldData?.messages) {
                return {
                  ...oldData,
                  messages: oldData.messages.map((msg: Message) =>
                    msg.id === tempId ? realMessage : msg
                  )
                };
              }
              return oldData;
            });

            logger.socket('✅ Mensaje procesado exitosamente via Socket', { 
              tempId, 
              realId: socketResponse.messageId 
            });

            return realMessage;
          }
        }

        // 2. 🔄 Fallback: Envío via API REST si Socket falla
        if (!socketSuccess) {
          logger.api('🔄 Fallback: Enviando mensaje via API REST', { tempId });
          
          const response = await api.post<Message>(`/conversations/${conversationId}/messages`, {
            content: messageData.content,
            type: messageData.type || 'text',
            attachments: messageData.attachments || []
          });

          const realMessage: Message = {
            ...response,
            status: 'sent'
          };

          updateMessageState(tempId, { status: 'sent' });
          
          // Actualizar cache con mensaje real de API
          queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
            if (oldData?.messages) {
              return {
                ...oldData,
                messages: oldData.messages.map((msg: Message) =>
                  msg.id === tempId ? realMessage : msg
                )
              };
            }
            return oldData;
          });

          logger.api('✅ Mensaje enviado via API REST', { tempId, realId: response.id });
          return realMessage;
        }

        throw new Error('No se pudo enviar el mensaje');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        logger.api('❌ Error enviando mensaje', { 
          tempId, 
          conversationId, 
          error: errorMessage 
        }, true);

        updateMessageState(tempId, { 
          status: 'error', 
          error: errorMessage,
          retryCount: (messageStates.get(tempId)?.retryCount || 0) + 1
        });

        // Actualizar mensaje en cache con error
        queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
          if (oldData?.messages) {
            return {
              ...oldData,
              messages: oldData.messages.map((msg: Message) =>
                msg.id === tempId ? { ...msg, status: 'error' } : msg
              )
            };
          }
          return oldData;
        });

        throw error;
      }
    },
    onSuccess: (message) => {
      logger.api('✅ Mensaje enviado exitosamente', { messageId: message.id, conversationId });
      
      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado exitosamente.",
      });
      
      // Invalidar conversaciones para actualizar último mensaje
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      onSuccess?.(message);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Error enviando mensaje";
      
      logger.api('❌ Error en mutación de envío', { 
        conversationId, 
        error: errorMessage 
      }, true);
      
      toast({
        variant: "destructive",
        title: "Error enviando mensaje",
        description: errorMessage,
      });
      
      onError?.(errorMessage);
    },
  });

  // Reintentarenvío de mensaje fallido
  const retryMessage = useCallback(async (messageId: string, messageData: MessageFormData) => {
    const currentState = messageStates.get(messageId);
    
    if (!currentState || currentState.retryCount >= 3) {
      toast({
        variant: "destructive",
        title: "No se puede reintentar",
        description: "Se alcanzó el límite máximo de reintentos.",
      });
      return;
    }

    logger.api('🔄 Reintentando envío de mensaje', { 
      messageId, 
      retryCount: currentState.retryCount + 1 
    });

    // Resetear estado y reintentar
    updateMessageState(messageId, { status: 'sending', error: undefined });
    
    try {
      await sendMessage.mutateAsync(messageData);
    } catch (error) {
      logger.api('❌ Error en reintento', { messageId, error }, true);
    }
  }, [messageStates, sendMessage, updateMessageState]);

  // Obtener estado de un mensaje específico
  const getMessageState = useCallback((messageId: string): MessageState | undefined => {
    return messageStates.get(messageId);
  }, [messageStates]);

  // Limpiar estados de mensajes
  const clearMessageStates = useCallback(() => {
    setMessageStates(new Map());
  }, []);

  return {
    sendMessage: sendMessage.mutate,
    sendMessageAsync: sendMessage.mutateAsync,
    isLoading: sendMessage.isPending,
    error: sendMessage.error,
    retryMessage,
    getMessageState,
    clearMessageStates,
    messageStates: Array.from(messageStates.values()),
  };
} 