import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  getSocket, 
  initSocket, 
  joinConversation, 
  leaveConversation,
  getConnectionStatus 
} from '@/lib/socket';
import { logger } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Message, Conversation } from '@/types/api';

/**
 * 🔊 Hook principal para integración Socket.io + React Query
 * 
 * Este hook establece la conexión Socket.io y actualiza automáticamente
 * el cache de React Query cuando llegan eventos en tiempo real.
 */
export function useSocketIntegration() {
  const queryClient = useQueryClient();

  // Inicializar Socket.io al montar el hook
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    // 🔍 LOGS DETALLADOS PARA DEBUG - SOCKET INTEGRATION
    console.group('🔍 [SOCKET INTEGRATION DEBUG]');
    console.log('Token en localStorage:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
    console.log('URL actual:', window.location.href);
    console.groupEnd();
    
    if (!token) {
      logger.socket('No hay token de autenticación, no se puede conectar Socket.io', {}, true);
      return;
    }

    logger.socket('🔌 Inicializando integración Socket.io + React Query');
    const socket = initSocket(token);

    // 🔊 CONFIGURAR TODOS LOS EVENTOS QUE ACTUALIZAN REACT QUERY CACHE
    
    // 📨 NUEVO MENSAJE: Actualizar cache de mensajes instantáneamente
    socket.on('new-message', (message: Message) => {
      logger.socket('📨 Nuevo mensaje recibido, actualizando cache', { 
        messageId: message.id, 
        conversationId: message.conversationId 
      });

      // Actualizar cache de mensajes de la conversación
      queryClient.setQueryData(['messages', message.conversationId], (old: any) => {
        if (!old) return old;
        
        // Evitar duplicados
        const exists = old.messages?.some((m: Message) => m.id === message.id);
        if (exists) return old;

        return {
          ...old,
          messages: [...(old.messages || []), message]
        };
      });

      // Actualizar último mensaje en lista de conversaciones
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((conv: Conversation) => 
            conv.id === message.conversationId 
              ? { 
                  ...conv, 
                  lastMessage: message.content,
                  lastMessageAt: message.timestamp,
                  isUnread: true 
                }
              : conv
          )
        };
      });

      // Mostrar notificación si no está en la conversación activa
      toast({
        title: "Nuevo mensaje",
        description: `Mensaje de ${message.sender === 'client' ? 'Cliente' : 'Agente'}`,
      });
    });

    // 👁️ MENSAJE LEÍDO: Actualizar estado de lectura
    socket.on('message-read', (data: { conversationId: string; messageId: string; userId: string }) => {
      logger.socket('👁️ Mensaje marcado como leído, actualizando cache', data);

      queryClient.setQueryData(['messages', data.conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: old.messages?.map((msg: Message) => 
            msg.id === data.messageId ? { ...msg, status: 'read' } : msg
          )
        };
      });

      // Actualizar estado de no leído en conversaciones
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((conv: Conversation) => 
            conv.id === data.conversationId ? { ...conv, isUnread: false } : conv
          )
        };
      });
    });

    // 👤 CONVERSACIÓN ASIGNADA: Invalidar cache y mostrar notificación
    socket.on('conversation-assigned', (data: { conversationId: string; agentId: string; agentName: string }) => {
      logger.socket('👤 Conversación reasignada, invalidando cache', data);

      // Invalidar todas las queries relacionadas con conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', data.conversationId] });

      // Mostrar notificación de asignación
      toast({
        title: "Conversación reasignada",
        description: `La conversación ha sido asignada a ${data.agentName}`,
      });
    });

    // ✅ MENSAJE ENTREGADO: Actualizar estado
    socket.on('message-delivered', (data: { conversationId: string; messageId: string }) => {
      logger.socket('✅ Mensaje entregado, actualizando estado', data);

      queryClient.setQueryData(['messages', data.conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: old.messages?.map((msg: Message) => 
            msg.id === data.messageId ? { ...msg, status: 'delivered' } : msg
          )
        };
      });
    });

    // ❌ MENSAJE FALLÓ: Actualizar estado y mostrar error
    socket.on('message-failed', (data: { conversationId: string; messageId: string; error: string }) => {
      logger.socket('❌ Mensaje falló, actualizando estado', data);

      queryClient.setQueryData(['messages', data.conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: old.messages?.map((msg: Message) => 
            msg.id === data.messageId ? { ...msg, status: 'error' } : msg
          )
        };
      });

      toast({
        variant: "destructive",
        title: "Error al enviar mensaje",
        description: data.error,
      });
    });

    // 🟢 USUARIO EN LÍNEA: Actualizar estado de equipo
    socket.on('user-online', (data: { userId: string; userName: string }) => {
      logger.socket('🟢 Usuario en línea, actualizando estado de equipo', data);

      queryClient.setQueryData(['team', 'members'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((member: any) => 
            member.id === data.userId ? { ...member, isOnline: true, status: 'online' } : member
          )
        };
      });
    });

    // 🔴 USUARIO FUERA DE LÍNEA: Actualizar estado de equipo
    socket.on('user-offline', (data: { userId: string }) => {
      logger.socket('🔴 Usuario fuera de línea, actualizando estado de equipo', data);

      queryClient.setQueryData(['team', 'members'], (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((member: any) => 
            member.id === data.userId ? { ...member, isOnline: false, status: 'offline' } : member
          )
        };
      });
    });

    // 🔔 NOTIFICACIONES DEL SISTEMA: Mostrar en UI
    socket.on('notification', (data: { type: string; title: string; message: string; conversationId?: string }) => {
      logger.socket('🔔 Notificación del sistema recibida', data);

      // Mostrar toast según el tipo de notificación
      const isImportant = data.type === 'assignment' || data.type === 'mention' || data.type === 'alert';
      
      toast({
        variant: isImportant ? "default" : "default",
        title: data.title,
        description: data.message,
      });

      // Si es una notificación de conversación específica, invalidar su cache
      if (data.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversations', data.conversationId] });
      }
    });

    // 📋 ESTADO DE CONVERSACIÓN: Actualizar cache
    socket.on('conversation-status', (data: { conversationId: string; status: string }) => {
      logger.socket('📋 Estado de conversación actualizado', data);

      queryClient.setQueryData(['conversations', data.conversationId], (old: any) => {
        if (!old) return old;
        return { ...old, status: data.status };
      });

      // También actualizar en la lista de conversaciones
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old?.conversations) return old;

        return {
          ...old,
          conversations: old.conversations.map((conv: Conversation) => 
            conv.id === data.conversationId ? { ...conv, status: data.status } : conv
          )
        };
      });
    });

    // Cleanup al desmontar
    return () => {
      logger.socket('🧹 Limpiando eventos Socket.io en hook');
      socket.removeAllListeners('new-message');
      socket.removeAllListeners('message-read');
      socket.removeAllListeners('conversation-assigned');
      socket.removeAllListeners('message-delivered');
      socket.removeAllListeners('message-failed');
      socket.removeAllListeners('user-online');
      socket.removeAllListeners('user-offline');
      socket.removeAllListeners('notification');
      socket.removeAllListeners('conversation-status');
    };
  }, [queryClient]);

  return {
    socket: getSocket(),
    connectionStatus: getConnectionStatus(),
    joinConversation,
    leaveConversation
  };
}

/**
 * 🔊 Hook específico para indicadores de escritura
 */
export function useTypingIndicators(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    if (!socket) return;

    // Escuchar indicadores de escritura
    const handleTypingStart = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.conversationId === conversationId) {
        logger.socket('✍️ Usuario empezó a escribir', data);
        
        // Actualizar estado local de typing
        queryClient.setQueryData(['typing', conversationId], (old: any[]) => {
          const existing = old || [];
          const userExists = existing.some(u => u.userId === data.userId);
          if (!userExists) {
            return [...existing, { userId: data.userId, userName: data.userName }];
          }
          return existing;
        });
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        logger.socket('⏹️ Usuario dejó de escribir', data);
        
        // Remover del estado local de typing
        queryClient.setQueryData(['typing', conversationId], (old: any[]) => {
          const existing = old || [];
          return existing.filter(u => u.userId !== data.userId);
        });
      }
    };

    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);

    return () => {
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
    };
  }, [conversationId, queryClient]);

  // Obtener usuarios que están escribiendo
  const typingUsers = queryClient.getQueryData(['typing', conversationId]) as Array<{ userId: string; userName: string }> || [];

  return {
    typingUsers,
    isTyping: typingUsers.length > 0
  };
}

/**
 * 🔊 Hook para stats en tiempo real
 */
export function useRealTimeStats() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Invalidar stats periódicamente cuando hay actividad
    const handleStatsUpdate = () => {
      logger.socket('📊 Actualizando estadísticas en tiempo real');
      
      // Invalidar todas las queries de estadísticas
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['messaging-stats'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'stats'] });
    };

    // Escuchar eventos que implican cambios en estadísticas
    socket.on('new-message', handleStatsUpdate);
    socket.on('conversation-assigned', handleStatsUpdate);
    socket.on('message-delivered', handleStatsUpdate);

    return () => {
      socket.off('new-message', handleStatsUpdate);
      socket.off('conversation-assigned', handleStatsUpdate);
      socket.off('message-delivered', handleStatsUpdate);
    };
  }, [queryClient]);
} 