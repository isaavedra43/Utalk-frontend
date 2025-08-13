import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Smile, Mic, MapPin } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { AudioRecorder } from './AudioRecorder';
import { StickerPicker } from './StickerPicker';
import { FileUploadManager } from './FileUploadManager';
import { useWebSocketContext } from '../../hooks/useWebSocketContext';
import { fileUploadService } from '../../services/fileUpload';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker') => void;
  isSending?: boolean;
  placeholder?: string;
  contextTags?: string[];
  onContextTagClick?: (tag: string) => void;
  conversationId?: string | null;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isSending = false,
  placeholder = 'Escribe un mensaje...',
  contextTags = [],
  onContextTagClick,
  conversationId,
  value: externalValue,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  onKeyPress: externalOnKeyPress
}) => {
  const [inputValue, setInputValue] = useState('');
  
  // Usar valor externo si se proporciona, sino usar estado interno
  const currentValue = externalValue !== undefined ? externalValue : inputValue;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // WebSocket context para typing
  const { startTyping, stopTyping } = useWebSocketContext();

  // Función para manejar typing
  const handleTyping = useCallback(() => {
    if (!isTyping && conversationId) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (conversationId) {
        stopTyping(conversationId);
      }
    }, 3000);
  }, [isTyping, startTyping, stopTyping, conversationId]);

  // Función para detener typing
  const handleStopTyping = useCallback(() => {
    setIsTyping(false);
    if (conversationId) {
      stopTyping(conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [stopTyping, conversationId]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    try {
      await onSendMessage(inputValue.trim());
      setInputValue('');
      handleStopTyping();
      setShowEmojiPicker(false);
      setShowStickerPicker(false);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (externalOnChange) {
      externalOnChange(e);
    } else {
      setInputValue(e.target.value);
    }
    handleTyping();
  };

  const handleInputBlur = () => {
    if (externalOnBlur) {
      externalOnBlur();
    }
    handleStopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (externalOnKeyPress) {
      externalOnKeyPress(e);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  const handleAudioRecordingComplete = async (audioBlob: Blob, fileName: string) => {
    if (conversationId) {
      try {
        setIsUploading(true);
        
        // Crear archivo desde el blob
        const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
        
        // Subir audio
        const uploadResponse = await fileUploadService.uploadAudio(audioFile, conversationId);
        
        // Enviar mensaje
        await onSendMessage(uploadResponse.url, 'voice');
        
        setShowAudioRecorder(false);
      } catch (error) {
        console.error('Error enviando audio:', error);
        alert('Error al enviar el audio. Inténtalo de nuevo.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleStickerSelect = (sticker: string) => {
    onSendMessage(sticker, 'sticker');
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Obtener dirección usando reverse geocoding
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_API_KEY`
            );
            const data = await response.json();
            const address = data.results[0]?.formatted_address || '';
            
            const locationData = {
              latitude,
              longitude,
              address,
              timestamp: new Date().toISOString()
            };
            
            await onSendMessage(JSON.stringify(locationData), 'location');
          } catch {
            // Si falla el geocoding, enviar solo coordenadas
            const locationData = {
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            };
            await onSendMessage(JSON.stringify(locationData), 'location');
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Verifica los permisos.');
        }
      );
    } else {
      alert('La geolocalización no está soportada en este navegador.');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleContextTagClick = (tag: string) => {
    onContextTagClick?.(tag);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* Tags de contexto */}
      {contextTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {contextTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleContextTagClick(tag)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <div className="mb-3">
          <AudioRecorder
            onRecordingComplete={handleAudioRecordingComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      {/* Input principal */}
      <div className="flex items-end space-x-2">
        {/* Gestión avanzada de archivos */}
        <FileUploadManager
          conversationId={conversationId || ''}
          onSendMessage={onSendMessage}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />

        {/* Botón de grabar audio */}
        <button
          onClick={() => setShowAudioRecorder(true)}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Grabar audio"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Botón de ubicación */}
        <button
          onClick={handleLocationClick}
          disabled={isUploading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Enviar ubicación"
        >
          <MapPin className="w-5 h-5" />
        </button>

        {/* Input de texto */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={currentValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder={isUploading ? 'Subiendo archivo...' : placeholder}
            disabled={isSending || isUploading}
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px'
            }}
          />
          
          {/* Botón de emoji */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowStickerPicker(false);
            }}
            disabled={isUploading}
            className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker 
                onEmojiSelect={handleEmojiSelect} 
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}

          {/* Sticker picker */}
          {showStickerPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <StickerPicker
                onStickerSelect={handleStickerSelect}
                onClose={() => setShowStickerPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Botón de enviar */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending || isUploading}
          className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Enviar mensaje"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>


    </div>
  );
}; 