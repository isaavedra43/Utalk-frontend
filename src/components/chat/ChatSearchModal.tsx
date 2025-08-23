import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import type { Message } from '../../types';

interface ChatSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

interface SearchResult {
  message: Message;
  matchIndex: number;
  matchLength: number;
  highlightedText: string;
}

export const ChatSearchModal: React.FC<ChatSearchModalProps> = ({
  isOpen,
  onClose,
  messages
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Buscar en los mensajes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !messages.length) return [];

    const query = searchQuery.toLowerCase();
    const found: SearchResult[] = [];

    messages.forEach((message) => {
      // Buscar en el contenido del mensaje
      if (message.content && typeof message.content === 'string') {
        const content = message.content.toLowerCase();
        let index = content.indexOf(query);
        
        while (index !== -1) {
          const highlightedText = message.content.substring(
            Math.max(0, index - 20),
            index
          ) + 
          '<mark>' + 
          message.content.substring(index, index + query.length) + 
          '</mark>' + 
          message.content.substring(
            index + query.length,
            Math.min(message.content.length, index + query.length + 20)
          );

          found.push({
            message,
            matchIndex: index,
            matchLength: query.length,
            highlightedText
          });

          index = content.indexOf(query, index + 1);
        }
      }

      // Buscar en metadatos si existen
      if (message.metadata) {
        const metadataStr = JSON.stringify(message.metadata).toLowerCase();
        if (metadataStr.includes(query)) {
          found.push({
            message,
            matchIndex: 0,
            matchLength: query.length,
            highlightedText: 'Encontrado en metadatos del mensaje'
          });
        }
      }
    });

    return found;
  }, [searchQuery, messages]);

  // Actualizar resultados cuando cambie la búsqueda
  useEffect(() => {
    setResults(searchResults);
    setCurrentResultIndex(0);
  }, [searchResults]);

  // Navegar entre resultados
  const goToNextResult = () => {
    if (results.length > 0) {
      setCurrentResultIndex((prev) => (prev + 1) % results.length);
    }
  };

  const goToPreviousResult = () => {
    if (results.length > 0) {
      setCurrentResultIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  };

  // Formatear fecha del mensaje
  const formatMessageDate = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obtener nombre del remitente
  const getSenderName = (message: Message) => {
    return message.senderIdentifier || 'Usuario';
  };

  // Manejar teclas de navegación
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPreviousResult();
      } else {
        goToNextResult();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Buscar en la conversación</h2>
            <p className="text-sm text-gray-500">
              {results.length > 0 
                ? `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`
                : searchQuery 
                  ? 'No se encontraron resultados'
                  : 'Escribe para buscar'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar en mensajes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          {/* Navegación de resultados */}
          {results.length > 0 && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousResult}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Resultado anterior (Shift + Enter)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentResultIndex + 1} de {results.length}
                </span>
                <button
                  onClick={goToNextResult}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Siguiente resultado (Enter)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                Enter: Siguiente | Shift+Enter: Anterior | Esc: Cerrar
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Search className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">No se encontraron resultados</p>
              <p className="text-sm">Intenta con otras palabras</p>
            </div>
          ) : !searchQuery ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">Busca en los mensajes</p>
              <p className="text-sm">Escribe algo para comenzar la búsqueda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={`${result.message.id}-${result.matchIndex}`}
                  className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                    index === currentResultIndex
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentResultIndex(index)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {getSenderName(result.message)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatMessageDate(result.message.createdAt)}
                      </span>
                    </div>
                    {index === currentResultIndex && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div 
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: result.highlightedText }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
