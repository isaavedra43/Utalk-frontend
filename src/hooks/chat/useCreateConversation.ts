import { useState, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { conversationsService } from '../../services/conversations';
import { fileUploadService } from '../../services/fileUpload';

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
      
      if (!data.message.trim()) {
        throw new Error('El mensaje inicial es requerido');
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

      // Paso 1: Crear la conversación con el formato del backend
      const conversationPayload: {
        contact: {
          phoneNumber: string;
          name: string;
          email: string;
          source: string;
        };
        initialMessage: {
          text: string;
          type: 'text' | 'file';
          fileName?: string;
          fileType?: string;
          fileSize?: number;
        };
      } = {
        contact: {
          phoneNumber: data.customerPhone,
          name: data.customerName,
          email: data.customerEmail || '',
          source: 'web_form'
        },
        initialMessage: {
          text: data.message,
          type: data.attachment ? 'file' : 'text'
        }
      };

      // Agregar información del archivo si existe
      if (data.attachment) {
        conversationPayload.initialMessage.fileName = data.attachment.name;
        conversationPayload.initialMessage.fileType = data.attachment.type;
        conversationPayload.initialMessage.fileSize = data.attachment.size;
      }

      infoLog('📤 useCreateConversation - Enviando payload al backend:', conversationPayload);

      // Crear conversación usando el servicio
      const newConversation = await conversationsService.createConversation(conversationPayload);

      infoLog('✅ useCreateConversation - Conversación creada:', newConversation);

      // Paso 2: Subir archivo adjunto si existe
      if (data.attachment && newConversation.id) {
        try {
          infoLog('📎 useCreateConversation - Subiendo archivo adjunto:', data.attachment.name);
          
          const uploadResult = await fileUploadService.uploadFile(data.attachment, {
            conversationId: newConversation.id,
            type: 'attachment'
          });
          
          infoLog('✅ useCreateConversation - Archivo subido:', uploadResult);
        } catch (uploadError) {
          infoLog('⚠️ useCreateConversation - Error subiendo archivo:', uploadError);
          // Continuar sin el archivo adjunto, la conversación ya se creó
        }
      }

      // Paso 3: Emitir evento para actualizar la UI
      window.dispatchEvent(new CustomEvent('new-conversation-added', {
        detail: {
          conversationId: newConversation.id,
          conversation: newConversation
        }
      }));

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