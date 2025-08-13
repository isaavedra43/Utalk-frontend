import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, FileText, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isSending?: boolean;
  placeholder?: string;
  contextTags?: string[];
  onContextTagClick?: (tag: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isSending = false,
  placeholder = 'Escribe un mensaje...',
  contextTags = [],
  onContextTagClick
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Manejar envío de mensaje
  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    setIsTyping(false);
  };

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Indicar que está escribiendo
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  // Manejar click en tag de contexto
  const handleContextTagClick = (tag: string) => {
    if (onContextTagClick) {
      onContextTagClick(tag);
    }
  };

  // Focus en el input cuando se monta
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Tags de contexto */}
      {contextTags.length > 0 && (
        <div className="flex gap-2 mb-3">
          {contextTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleContextTagClick(tag)}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Input de mensaje */}
      <div className="flex items-end gap-2">
        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Adjuntar archivo"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Emoji"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Documentos"
          >
            <FileText className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Campo de texto */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isSending}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        
        {/* Botón de enviar */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Enviar mensaje"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Indicador de escritura */}
      {isTyping && (
        <div className="mt-2 text-xs text-gray-500">
          Escribiendo...
        </div>
      )}
    </div>
  );
}; 