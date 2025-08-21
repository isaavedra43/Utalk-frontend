import React from 'react';
import { X, Send, FileText, Image, Music, Video } from 'lucide-react';

interface PendingFile {
  id: string;
  file: File;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedFileId?: string; // ID del archivo después de subirlo al servidor
}

interface PendingFileUploadProps {
  files: PendingFile[];
  onRemoveFile: (id: string) => void;
  onSendFiles: (files: PendingFile[], message: string) => void;
  conversationId?: string;
  sendMessageWithAttachments?: (content: string, attachments: Array<{ id: string; type: string }>) => Promise<void>;
}

export const PendingFileUpload: React.FC<PendingFileUploadProps> = ({
  files,
  onRemoveFile,
  onSendFiles,
  conversationId,
  sendMessageWithAttachments
}) => {
  const [message, setMessage] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4 text-blue-500" />;
      case 'audio': return <Music className="w-4 h-4 text-green-500" />;
      case 'video': return <Video className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validatePayload = (payload: any) => {
    if (!payload.conversationId) {
      throw new Error('conversationId es requerido');
    }
    if (!payload.attachments) {
      throw new Error('attachments es requerido');
    }
    if (!Array.isArray(payload.attachments)) {
      throw new Error('attachments debe ser un array');
    }
    if (payload.attachments.length === 0) {
      throw new Error('attachments no puede estar vacío');
    }
    payload.attachments.forEach((attachment: any, index: number) => {
      if (!attachment.id) {
        throw new Error(`Attachment ${index} debe tener ID`);
      }
      if (!attachment.type) {
        throw new Error(`Attachment ${index} debe tener tipo`);
      }
      const validTypes = ['image', 'document', 'video', 'audio'];
      if (!validTypes.includes(attachment.type)) {
        throw new Error(`Attachment ${index} tiene tipo inválido: ${attachment.type}`);
      }
    });
    return true;
  };

  const handleSend = async () => {
    // SOLUCIONADO: Protección contra doble envío
    if (isUploading) {
      console.log('⚠️ PendingFileUpload - Ya se está enviando, ignorando envío duplicado');
      return;
    }

    console.log('🚀 PendingFileUpload - Iniciando envío de archivos:', {
      filesCount: files.length,
      message: message,
      conversationId
    });

    setIsUploading(true);
    try {
      if (!conversationId) {
        throw new Error('conversationId es requerido para enviar archivos');
      }

      // Filtrar solo archivos que ya fueron subidos exitosamente
      const readyFiles = files.filter(f => f.status === 'success' && f.uploadedFileId);
      
      if (readyFiles.length === 0) {
        throw new Error('No hay archivos listos para enviar');
      }

      // Preparar attachments para el endpoint send-with-file-ids
      const attachments = readyFiles.map(file => ({
        id: file.uploadedFileId!,
        type: file.type
      }));

      // Logs obligatorios
      console.log('📤 Enviando mensaje:', {
        conversationId,
        content: message.trim() || '(vacío)',
        attachments: attachments
      });

      // SOLUCIONADO: Usar la función de useChat para mensajes optimísticos y manejo de estado
      if (sendMessageWithAttachments) {
        await sendMessageWithAttachments(message.trim(), attachments);
        console.log('✅ PendingFileUpload - Mensaje enviado via useChat exitosamente');
        
        // Notificar a MessageInput que se enviaron los archivos
        onSendFiles(readyFiles, message.trim());
        
        // Limpiar el estado local
        setMessage('');
      } else {
        // Fallback: usar fileUploadService directamente si no se pasó la función
        const { fileUploadService } = await import('../../services/fileUpload');
        
        // Construir payload obligatorio y validarlo
        const payload = {
          conversationId,
          content: message.trim() || '',
          attachments
        };

        // Validación crítica
        validatePayload(payload);

        await fileUploadService.sendMessageWithAttachments(
          payload.conversationId,
          payload.content,
          payload.attachments
        );

        console.log('✅ PendingFileUpload - Mensaje enviado via servicio directo exitosamente');
        
        // Solo limpiar el estado local
        setMessage('');
      }
    } catch (error) {
      console.error('❌ Error en envío de archivo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Archivos pendientes de envío ({files.length})
        </h4>
        <button
          onClick={() => files.forEach(f => onRemoveFile(f.id))}
          className="text-gray-400 hover:text-red-500 text-sm"
        >
          Limpiar todo
        </button>
      </div>

      {/* Lista de archivos */}
      <div className="space-y-2 mb-4">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded border">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.file.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {file.status === 'pending' && (
                <span className="text-xs text-gray-500">Pendiente</span>
              )}
              
              {file.status === 'uploading' && (
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500">{file.progress}%</span>
                </div>
              )}
              
              {file.status === 'success' && (
                <span className="text-xs text-green-500">✓ Subido</span>
              )}
              
              {file.status === 'error' && (
                <span className="text-xs text-red-500">{file.error}</span>
              )}
              
              <button
                onClick={() => onRemoveFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Input de mensaje */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje (opcional)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isUploading}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={isUploading || files.filter(f => f.status === 'success').length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </>
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-2 text-xs text-gray-500">
        {files.filter(f => f.status === 'success').length} de {files.length} archivos listos para enviar
      </div>
    </div>
  );
}; 