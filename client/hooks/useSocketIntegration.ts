import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { initSocket } from '@/lib/socket';
import { logger } from '@/lib/utils';
import type { Message, Conversation } from '@/types/api';

/* ------------------------------------------------------------------------------ */
/*  HOOK DE INTEGRACIÓN SOCKET.IO + REACT QUERY                                   */
/* ------------------------------------------------------------------------------ */
export function useSocketIntegration() {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading, token } = useAuth();

  useEffect(() => {
    // ABORTAR si AuthContext aún está cargando
    if (loading) {
      if (import.meta.env.DEV) {
        console.log('🔄 [SOCKET] AuthContext aún cargando - esperando...');
      }
      return;
    }

    // ABORTAR si no hay autenticación válida
    if (!isAuthenticated || !token) {
      if (import.meta.env.DEV) {
        console.log('❌ [SOCKET] No autenticado o sin token - abortar inicialización');
      }
      
      logger.socket('No hay token de autenticación, no se puede conectar Socket.io', {}, true);
      return;
    }

    if (import.meta.env.DEV) {
      console.group('🔌 [SOCKET INTEGRATION] Inicializando...');
      console.log('✅ AuthContext listo (loading=false)');
      console.log('✅ Usuario autenticado');
      console.log('✅ Token disponible:', token.substring(0, 20) + '...');
      console.groupEnd();
    }

    logger.socket('🔌 Inicializando integración Socket.io + React Query');
    const socket = initSocket(token);

    /* -------------------------------------------------------------------------- */
    /*  EVENTOS DE MENSAJES                                                        */
    /* -------------------------------------------------------------------------- */
    socket.on('new-message', (message: Message) => {
      if (import.meta.env.DEV) {
        console.log('📨 [SOCKET] Nuevo mensaje recibido:', {
          messageId: message.id,
          conversationId: message.conversationId,
          sender: message.sender,
          content: message.content?.substring(0, 50) + '...'
        });
      }

      logger.socket('📨 Nuevo mensaje recibido vía Socket.io', {
        messageId: message.id,
        conversationId: message.conversationId,
        sender: message.sender
      });

      // Invalidar cache de mensajes para esta conversación
      queryClient.invalidateQueries({
        queryKey: ['messages', message.conversationId]
      });

      // Invalidar lista de conversaciones (para actualizar último mensaje)
      queryClient.invalidateQueries({
        queryKey: ['conversations']
      });

      // Actualizar contadores si están en cache
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'stats']
      });
    });

    socket.on('message-read', (data: { messageId: string; conversationId: string; readBy: string }) => {
      if (import.meta.env.DEV) {
        console.log('👁️ [SOCKET] Mensaje marcado como leído:', data);
      }

      logger.socket('👁️ Mensaje marcado como leído', data);

      // Invalidar mensajes de la conversación
      queryClient.invalidateQueries({
        queryKey: ['messages', data.conversationId]
      });
    });

    /* -------------------------------------------------------------------------- */
    /*  EVENTOS DE CONVERSACIONES                                                  */
    /* -------------------------------------------------------------------------- */
    socket.on('conversation-assigned', (data: { conversationId: string; assignedTo: string }) => {
      if (import.meta.env.DEV) {
        console.log('👤 [SOCKET] Conversación asignada:', data);
      }

      logger.socket('👤 Conversación asignada', data);

      // Invalidar lista de conversaciones
      queryClient.invalidateQueries({
        queryKey: ['conversations']
      });

      // Invalidar stats de dashboard
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'stats']
      });
    });

    socket.on('conversation-status-changed', (data: { conversationId: string; status: string }) => {
      if (import.meta.env.DEV) {
        console.log('🔄 [SOCKET] Estado de conversación cambiado:', data);
      }

      logger.socket('🔄 Estado de conversación cambiado', data);

      // Invalidar conversaciones
      queryClient.invalidateQueries({
        queryKey: ['conversations']
      });
    });

    /* -------------------------------------------------------------------------- */
    /*  EVENTOS DE TYPING                                                          */
    /* -------------------------------------------------------------------------- */
    socket.on('typing-start', (data: { conversationId: string; userId: string; userName: string }) => {
      if (import.meta.env.DEV) {
        console.log('✍️ [SOCKET] Usuario escribiendo:', data);
      }

      // Aquí podrías actualizar un estado de "typing indicators" si lo implementas
      logger.socket('✍️ Usuario escribiendo', data);
    });

    socket.on('typing-stop', (data: { conversationId: string; userId: string }) => {
      if (import.meta.env.DEV) {
        console.log('⏹️ [SOCKET] Usuario dejó de escribir:', data);
      }

      logger.socket('⏹️ Usuario dejó de escribir', data);
    });

    /* -------------------------------------------------------------------------- */
    /*  EVENTOS DE CONEXIÓN                                                        */
    /* -------------------------------------------------------------------------- */
    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('🟢 [SOCKET] Conectado exitosamente');
      }

      logger.socket('🟢 Socket.io conectado exitosamente', { socketId: socket.id });
    });

    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('🔴 [SOCKET] Desconectado:', reason);
      }

      logger.socket('🔴 Socket.io desconectado', { reason }, true);
    });

    socket.on('connect_error', (error) => {
      if (import.meta.env.DEV) {
        console.error('❌ [SOCKET] Error de conexión:', error);
      }

      logger.socket('❌ Error de conexión Socket.io', { error: error.message }, true);
    });

    /* -------------------------------------------------------------------------- */
    /*  CLEANUP                                                                     */
    /* -------------------------------------------------------------------------- */
    return () => {
      if (import.meta.env.DEV) {
        console.log('🧹 [SOCKET] Limpiando eventos y desconectando...');
      }

      logger.socket('🧹 Limpiando integración Socket.io');
      
      // Remover todos los listeners
      socket.off('new-message');
      socket.off('message-read');
      socket.off('conversation-assigned');
      socket.off('conversation-status-changed');
      socket.off('typing-start');
      socket.off('typing-stop');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      
      // Desconectar socket
      socket.disconnect();
    };
  }, [isAuthenticated, loading, token, queryClient]); // Dependencias: solo del contexto de auth

  if (import.meta.env.DEV) {
    console.log('🔍 [SOCKET INTEGRATION] Estado actual:', {
      loading,
      isAuthenticated,
      hasToken: !!token
    });
  }

  // No retorna nada - es un hook de efecto secundario
}

export default useSocketIntegration;

/**
 * 🔊 Hook específico para indicadores de escritura
 */
export function useTypingIndicators(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const socket = initSocket(); // Assuming initSocket is the correct way to get the socket
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
    const socket = initSocket(); // Assuming initSocket is the correct way to get the socket
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