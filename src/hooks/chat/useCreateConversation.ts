import { useState, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { conversationsService } from '../../services/conversations';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';
import { useConversationActions } from './useConversationActions';
import { useAuthContext } from '../../contexts/useAuthContext';

interface CreateConversationData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  attachment?: File;
}

interface UseCreateConversationReturn {
  createConversation: (data: CreateConversationData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
}

export const useCreateConversation = (): UseCreateConversationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { joinConversation } = useWebSocketContext();
  const { selectConversation, refreshConversations } = useConversationActions();
  const { user } = useAuthContext();

  const createConversation = useCallback(async (data: CreateConversationData) => {
    setIsLoading(true);
    setError(null);

    try {
      infoLog('🆕 useCreateConversation - Enviando mensaje de WhatsApp:', {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        hasEmail: !!data.customerEmail,
        hasAttachment: !!data.attachment,
        messageLength: data.message.length
      });

      // Validaciones del frontend
      if (!data.customerName.trim()) {
        throw new Error('El nombre del cliente es requerido');
      }
      
      if (!data.customerPhone.trim()) {
        throw new Error('El teléfono es requerido');
      }
      
      if (!data.customerPhone.startsWith('+')) {
        throw new Error('El teléfono debe incluir el código de país (ej: +52 1 477 123 4567)');
      }
      
      if (!data.message.trim() && !data.attachment) {
        throw new Error('Debes escribir un mensaje o adjuntar un archivo');
      }

      // Validar archivo si existe
      if (data.attachment) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (data.attachment.size > maxSize) {
          throw new Error('El archivo es demasiado grande. Máximo 100MB');
        }
        
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'audio/mpeg', 'audio/wav', 'audio/ogg',
          'video/mp4', 'video/webm',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(data.attachment.type)) {
          throw new Error('Tipo de archivo no permitido');
        }
      }

      // PASO ÚNICO: Crear conversación con mensaje inicial
      // El backend maneja automáticamente:
      // - Crear contacto (si no existe)
      // - Crear conversación con ID correcto conv_{customerPhone}_{ourNumber}
      // - Enviar mensaje por WhatsApp
      // - Retornar conversación completa
      const newConversation = await conversationsService.createConversationBasic({
        customerPhone: data.customerPhone,
        initialMessage: data.message.trim(),
        assignedTo: user?.email || 'admin@company.com',
        currentUser: user?.email || 'admin@company.com'
      });

      infoLog('✅ useCreateConversation - Conversación creada exitosamente:', newConversation);

      // Unirse por WebSocket a la conversación creada
      if (newConversation.id) {
        joinConversation(newConversation.id);
      }

      // Emitir evento para actualizar la UI
      window.dispatchEvent(new CustomEvent('new-conversation-added', {
        detail: {
          conversationId: newConversation.id,
          conversation: newConversation
        }
      }));

      // Seleccionar la conversación y refrescar lista
      if (newConversation.id) {
        selectConversation(newConversation.id);
      }
      await refreshConversations();

      infoLog('🎉 useCreateConversation - Proceso completado exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al enviar mensaje';
      infoLog('❌ useCreateConversation - Error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createConversation,
    isLoading,
    error,
    resetError
  };
}; 