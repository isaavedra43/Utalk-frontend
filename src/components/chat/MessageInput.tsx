import React, { useState, useRef, useCallback, useEffect } from 'react';
import { infoLog } from '../../config/logger';
import { Send, Mic, MapPin, Smile, Paperclip } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { StickerPicker } from './StickerPicker';
import { FileUploadPreview } from './FileUploadPreview';


interface MessageInputProps {
  onSendMessage: (content: string, type?: string, metadata?: Record<string, unknown>) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSending?: boolean;
  conversationId?: string; // NUEVO: ID de conversación para subir archivos
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Escribe un mensaje...",
  value: externalValue,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  onKeyPress: externalOnKeyPress,
  isSending = false,
  conversationId
}) => {
  const [message, setMessage] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
  }>>([]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Usar valor externo si se proporciona, sino usar estado interno
  const currentValue = externalValue !== undefined ? externalValue : message;

  const handleSend = useCallback(() => {
    if (currentValue.trim() && !disabled) {
      onSendMessage(currentValue.trim());
      if (externalValue === undefined) {
        setMessage('');
      }
      setIsTyping(false);
      onStopTyping?.();
    }
  }, [currentValue, disabled, onSendMessage, onStopTyping, externalValue]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (externalOnKeyPress) {
      externalOnKeyPress(e);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [externalOnKeyPress, handleSend]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (externalOnChange) {
      externalOnChange(e);
    } else {
      setMessage(e.target.value);
    }
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 3000);
  }, [isTyping, onTyping, onStopTyping, externalOnChange]);

  const handleInputBlur = useCallback(() => {
    if (externalOnBlur) {
      externalOnBlur();
    }
    setIsTyping(false);
    onStopTyping?.();
  }, [externalOnBlur, onStopTyping]);

  const handleAudioComplete = useCallback(async (audioBlob: Blob) => {
    if (!conversationId) {
      infoLog('❌ No se puede enviar audio: conversationId no disponible');
      alert('Error: No se puede enviar audio en este momento');
      return;
    }

    // Declarar fileId fuera del try para que esté disponible en el catch
    const fileId = `audio-${Date.now()}`;

    try {
      infoLog('🎤 Audio grabado, enviando...', audioBlob);
      
      // Crear un archivo de audio desde el blob
      const audioFile = new File([audioBlob], `audio-${Date.now()}.wav`, { 
        type: 'audio/wav' 
      });
      
      // Agregar a la lista de uploads
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type,
        status: 'uploading',
        progress: 0
      }]);

      // Actualizar progreso
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 25 } : f)
      );

      // Importar el servicio dinámicamente
      const { fileUploadService } = await import('../../services/fileUpload');
      
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
      );

      // Subir audio al servidor
      const response = await fileUploadService.uploadFile(audioFile, {
        conversationId,
        type: audioFile.type
      });
      infoLog('✅ Audio subido exitosamente:', response);
      
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'success' } : f)
      );

      // Enviar mensaje con el audio
      onSendMessage(response.url, 'audio', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        fileId: response.id,
        duration: response.duration
      });

      // Remover de la lista después de 2 segundos
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      }, 2000);

      setShowAudioRecorder(false);
      
    } catch (error) {
      infoLog('❌ Error enviando audio:', error);
      
      // Marcar como error
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: 'Error al enviar audio' 
        } : f)
      );
      
      alert('Error al enviar el audio. Intenta de nuevo.');
    }
  }, [conversationId, onSendMessage]);

  const handleStickerSelect = useCallback((stickerUrl: string) => {
    onSendMessage(stickerUrl, 'sticker');
    setShowStickerPicker(false);
  }, [onSendMessage]);

  const handleLocationClick = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          onSendMessage(locationUrl, 'location', { latitude, longitude });
        },
        (error) => {
          infoLog('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación');
        }
      );
    } else {
      alert('Geolocalización no soportada en este navegador');
    }
  }, [onSendMessage]);

  // Función para enviar múltiples archivos juntos
  const sendMultipleFiles = useCallback(async (files: File[]) => {
    if (!conversationId) {
      infoLog('❌ No se puede enviar archivos: conversationId no disponible');
      alert('Error: No se puede enviar archivos en este momento');
      return;
    }

    // Declarar fileIds fuera del try para que esté disponible en el catch
    const fileIds = files.map(file => `${file.name}-${Date.now()}-${Math.random()}`);

    try {
      infoLog('🚀 Enviando múltiples archivos:', files.length);
      
      // Agregar todos los archivos a la lista de uploads
      setUploadingFiles(prev => [
        ...prev,
        ...files.map((file, index) => ({
          id: fileIds[index],
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading' as const,
          progress: 0
        }))
      ]);

      // Importar el servicio dinámicamente
      const { fileUploadService } = await import('../../services/fileUpload');
      
      // Subir y enviar cada archivo secuencialmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const currentId = fileIds[i];

        setUploadingFiles(prev => prev.map(f => f.id === currentId ? { ...f, progress: 25 } : f));
        
        const response = await fileUploadService.uploadFile(file, {
          conversationId,
          type: file.type
        });
        
        setUploadingFiles(prev => prev.map(f => f.id === currentId ? { ...f, progress: 100, status: 'success' } : f));
        
        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'document';
        onSendMessage(response.url, fileType, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileId: response.id,
          duration: response.duration,
          thumbnail: response.thumbnail
        });
      }

      // Remover archivos de la lista después de 2 segundos
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
      }, 2000);

    } catch (error) {
      infoLog('❌ Error enviando múltiples archivos:', error);
      
      // Marcar todos como error
      setUploadingFiles(prev => 
        prev.map(f => fileIds.includes(f.id) ? { 
          ...f, 
          status: 'error', 
          error: 'Error al enviar archivos' 
        } : f)
      );
    }
  }, [conversationId, onSendMessage]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
      {/* File Upload Preview */}
      <FileUploadPreview 
        files={uploadingFiles}
        onRemove={(id) => setUploadingFiles(prev => prev.filter(f => f.id !== id))}
      />
      
      {/* Audio Recorder */}
      {showAudioRecorder && (
        <div className="mb-3 sm:mb-4">
          <AudioRecorder
            onRecordingComplete={handleAudioComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      {/* Sticker Picker */}
      {showStickerPicker && (
        <div className="mb-3 sm:mb-4 relative">
          <StickerPicker
            onSelectSticker={handleStickerSelect}
            onClose={() => setShowStickerPicker(false)}
          />
        </div>
      )}

      {/* Contenedor principal del input con íconos integrados */}
      <div className="relative bg-white border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Input de texto */}
        <div className="flex items-end">
          <textarea
            ref={inputRef}
            value={currentValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="flex-1 px-4 py-3 pr-20 resize-none focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-sm bg-transparent border-0"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Íconos integrados en el lado derecho */}
          <div className="flex items-center space-x-1 pr-2 pb-2">
            {/* Ícono de enviar - PRIMERO Y MÁS PROMINENTE */}
            <button
              onClick={handleSend}
              disabled={!currentValue.trim() || disabled || isSending}
              className={`p-2 rounded-full transition-all duration-200 ${
                currentValue.trim() && !disabled && !isSending
                  ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-md'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
            
            {/* Ícono de micrófono */}
            <button
              onClick={() => {
                infoLog('🎤 Botón de micrófono clickeado, estado actual:', showAudioRecorder);
                setShowAudioRecorder(!showAudioRecorder);
              }}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                showAudioRecorder 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              disabled={disabled}
              title="Grabar audio"
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {/* Ícono de archivo/imagen */}
            <button
              onClick={() => {
                if (!conversationId) {
                  console.error('❌ No se puede subir archivo: conversationId no disponible');
                  alert('Error: No se puede subir archivos en este momento');
                  return;
                }
                
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement)?.files;
                  if (files) {
                    const fileArray = Array.from(files);
                    
                    // Si hay múltiples archivos, enviarlos todos juntos
                    if (fileArray.length > 1) {
                      sendMultipleFiles(fileArray);
                    } else {
                      // Si es un solo archivo, enviarlo individualmente
                      fileArray.forEach(file => {
                        infoLog('📁 Archivo seleccionado:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
                        
                        // Crear preview temporal mientras se sube
                        const fileUrl = URL.createObjectURL(file);
                        const fileType = file.type.startsWith('image/') ? 'image' : 
                                       file.type.startsWith('audio/') ? 'audio' : 
                                       file.type.startsWith('video/') ? 'video' : 'document';
                        
                        // Agregar archivo a la lista de uploads
                        const fileId = `${file.name}-${Date.now()}`;
                        setUploadingFiles(prev => [...prev, {
                          id: fileId,
                          name: file.name,
                          size: file.size,
                          type: file.type,
                          status: 'uploading',
                          progress: 0
                        }]);
                        
                        // Subir archivo al servidor y luego enviar mensaje con la URL
                        const uploadAndSend = async () => {
                          try {
                            infoLog('🚀 Subiendo archivo:', file.name);
                            
                            // Actualizar progreso
                            setUploadingFiles(prev => 
                              prev.map(f => f.id === fileId ? { ...f, progress: 25 } : f)
                            );
                            
                            // Importar el servicio dinámicamente para evitar dependencias circulares
                            const { fileUploadService } = await import('../../services/fileUpload');
                            
                            setUploadingFiles(prev => 
                              prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
                            );
                            
                            // Subir archivo y obtener URL del backend
                            const response = await fileUploadService.uploadFile(file, {
                              conversationId,
                              type: file.type
                            });
                            infoLog('✅ Archivo subido exitosamente:', response);
                            
                            setUploadingFiles(prev => 
                              prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'success' } : f)
                            );
                            
                            // Enviar mensaje con URL del servidor
                            onSendMessage(response.url, fileType, {
                              fileName: file.name,
                              fileSize: file.size,
                              fileType: file.type,
                              fileId: response.id,
                              duration: response.duration,
                              thumbnail: response.thumbnail
                            });
                            
                            // Limpiar URL temporal
                            URL.revokeObjectURL(fileUrl);
                            
                            // Remover archivo de la lista después de 2 segundos
                            setTimeout(() => {
                              setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
                            }, 2000);
                            
                          } catch (error) {
                            console.error('❌ Error subiendo archivo:', error);
                            
                            setUploadingFiles(prev => 
                              prev.map(f => f.id === fileId ? { 
                                ...f, 
                                status: 'error', 
                                error: 'Error al subir archivo' 
                              } : f)
                            );
                            
                            // En caso de error, enviar con URL temporal como fallback
                            onSendMessage(fileUrl, fileType, {
                              fileName: file.name,
                              fileSize: file.size,
                              fileType: file.type,
                              error: 'Error al subir archivo'
                            });
                          }
                        };
                        
                        uploadAndSend();
                      });
                    }
                  }
                };
                input.click();
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              disabled={disabled || !conversationId}
              title={conversationId ? "Adjuntar archivo" : "No se puede adjuntar archivos"}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            {/* Ícono de emoji */}
            <button
              onClick={() => {
                infoLog('🎯 Botón de emoji clickeado, estado actual:', showStickerPicker);
                setShowStickerPicker(!showStickerPicker);
              }}
              className={`p-1.5 rounded-full transition-all duration-200 ${
                showStickerPicker 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
              disabled={disabled}
              title="Emojis y stickers"
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {/* Ícono de ubicación */}
            <button
              onClick={handleLocationClick}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              disabled={disabled}
              title="Compartir ubicación"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 