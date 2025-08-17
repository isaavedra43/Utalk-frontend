import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MapPin, Smile, Paperclip } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { StickerPicker } from './StickerPicker';

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
  conversationId?: string;
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

  const handleAudioComplete = useCallback((audioBlob: Blob) => {
    // Aquí podrías subir el audio y enviar el mensaje
    console.log('Audio grabado:', audioBlob);
    setShowAudioRecorder(false);
  }, []);

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
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación');
        }
      );
    } else {
      alert('Geolocalización no soportada en este navegador');
    }
  }, [onSendMessage]);

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
        <div className="mb-3 sm:mb-4">
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
            {/* Ícono de micrófono */}
            <button
              onClick={() => setShowAudioRecorder(!showAudioRecorder)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              disabled={disabled}
              title="Grabar audio"
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {/* Ícono de archivo/imagen */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement)?.files;
                  if (files) {
                    Array.from(files).forEach(file => {
                      const fileUrl = URL.createObjectURL(file);
                      const fileType = file.type.startsWith('image/') ? 'image' : 
                                     file.type.startsWith('audio/') ? 'audio' : 
                                     file.type.startsWith('video/') ? 'video' : 'document';
                      onSendMessage(fileUrl, fileType, {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                      });
                    });
                  }
                };
                input.click();
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              disabled={disabled}
              title="Adjuntar archivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            {/* Ícono de emoji */}
            <button
              onClick={() => setShowStickerPicker(!showStickerPicker)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              disabled={disabled}
              title="Emojis y stickers"
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {/* Ícono de enviar */}
            <button
              onClick={handleSend}
              disabled={!currentValue.trim() || disabled || isSending}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
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