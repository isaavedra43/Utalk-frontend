import React, { useState, useRef } from 'react';
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
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      onSendMessage(message.trim());
      setMessage('');
      // Resetear altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileUpload = () => {
    // Implementar lógica de subida de archivos
    console.log('Subir archivo');
  };

  const handleEmojiClick = () => {
    // Implementar selector de emojis
    console.log('Abrir selector de emojis');
  };

  const handleDocumentClick = () => {
    // Implementar selector de documentos
    console.log('Abrir selector de documentos');
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Tags de contexto */}
      {contextTags.length > 0 && (
        <div className="flex gap-2 mb-3">
          {contextTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onContextTagClick?.(tag)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Input de mensaje */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Iconos de acción */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleFileUpload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleEmojiClick}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleDocumentClick}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileText className="h-5 w-5" />
          </button>
        </div>

        {/* Campo de texto */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}; 