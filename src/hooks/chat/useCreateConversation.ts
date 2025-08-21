import { useState, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { conversationsService } from '../../services/conversations';
import { fileUploadService } from '../../services/fileUpload';
import { contactsService } from '../../services/contacts';
import { messagesService } from '../../services/messages';
import type { MessageInputData } from '../../types';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';
import { useConversationActions } from './useConversationActions';

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

  const createConversation = useCallback(async (data: CreateConversationData) => {
    setIsLoading(true);
    setError(null);

    try {
      infoLog('🆕 useCreateConversation - Iniciando creación de conversación:', {
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

      // Paso 0: Asegurar contacto (crear si no existe)
      try {
        const existing = await contactsService.searchContactByPhone(data.customerPhone);
        if (!existing) {
          await contactsService.createContact({
            phone: data.customerPhone,
            name: data.customerName,
            email: data.customerEmail || undefined
          });
        }
      } catch (cErr) {
        infoLog('⚠️ useCreateConversation - No se pudo verificar/crear contacto (continuando):', cErr);
      }

      // Paso 1: Crear la conversación con payload básico del backend
      const newConversation = await conversationsService.createConversationBasic({
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        metadata: { source: 'web_form' }
      });

      infoLog('✅ useCreateConversation - Conversación creada:', newConversation);

      // Paso 2: Unirse por WebSocket a la room de la conversación
      if (newConversation.id) {
        joinConversation(newConversation.id);
      }

      // Paso 3: Enviar primer mensaje
      if (newConversation.id) {
        if (data.attachment) {
          // 3a: Subir archivo y enviar con IDs
          infoLog('📎 useCreateConversation - Subiendo archivo adjunto:', data.attachment.name);
          const uploaded = await fileUploadService.uploadFile(data.attachment, {
            conversationId: newConversation.id,
            type: fileUploadService.getMessageType(data.attachment)
          });
          infoLog('✅ useCreateConversation - Archivo subido:', uploaded);

          await fileUploadService.sendMessageWithAttachments(
            newConversation.id,
            data.message.trim(), // si está vacío, el servicio lo omitirá
            [{ id: uploaded.id, type: uploaded.type }]
          );
        } else if (data.message.trim()) {
          // 3b: Solo texto
          const textPayload: MessageInputData = {
            content: data.message.trim(),
            type: 'text'
          } as MessageInputData;
          await messagesService.sendMessage(newConversation.id, textPayload);
        }
      }

      // Paso 3: Emitir evento para actualizar la UI
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

      infoLog('🎉 useCreateConversation - Conversación creada exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear conversación';
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