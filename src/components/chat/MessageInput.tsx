import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { useWebSocketContext } from '../../hooks/useWebSocketContext';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'document' | 'location') => void;
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
  const [isTyping, setIsTyping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implementar subida de archivo
      console.log('Archivo seleccionado:', file);
      onSendMessage(`Archivo: ${file.name}`, 'document');
    }
    // Limpiar input
    e.target.value = '';
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

      {/* Input principal */}
      <div className="flex items-end space-x-2">
        {/* Botón de adjuntar archivo */}
        <button
          onClick={handleFileClick}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Adjuntar archivo"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input de texto */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={currentValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isSending}
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px'
            }}
          />
          
          {/* Botón de emoji */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
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
        </div>

        {/* Botón de enviar */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Enviar mensaje"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}; 