import React, { useState } from 'react';
import { MessageCircle, Copy, RefreshCw, Send, Sparkles } from 'lucide-react';
import type { AISuggestion, CopilotState } from '../../types';

interface CopilotPanelProps {
  copilotState: CopilotState;
  aiSuggestions: AISuggestion[];
  onSetCopilotTab: (tab: 'suggestions' | 'chat') => void;
  onCopySuggestion: (suggestion: AISuggestion) => void;
  onImproveSuggestion: (suggestionId: string) => void;
  onGenerateSuggestion: (context?: string) => void;
  isLoading?: boolean;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  copilotState,
  aiSuggestions,
  onSetCopilotTab,
  onCopySuggestion,
  onImproveSuggestion,
  onGenerateSuggestion,
  isLoading = false
}) => {
  const [chatInput, setChatInput] = useState('hola');

  // Obtener color de confianza
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener texto de confianza
  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'Alta confianza';
      case 'medium':
        return 'Confianza media';
      case 'low':
        return 'Baja confianza';
      default:
        return 'Confianza desconocida';
    }
  };

  // Manejar envío de chat
  const handleChatSend = () => {
    if (chatInput.trim()) {
      onGenerateSuggestion(chatInput.trim());
      setChatInput('');
    }
  };

  // Manejar tecla Enter en chat
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Copiloto IA</h3>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          Mock Mode
        </span>
      </div>

      <p className="text-xs text-gray-600">Copilot is here to help. Just ask.</p>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onSetCopilotTab('suggestions')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            copilotState.activeTab === 'suggestions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sugerencias
        </button>
        <button
          onClick={() => onSetCopilotTab('chat')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            copilotState.activeTab === 'chat'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chat IA
        </button>
      </div>

      {/* Contenido de tabs */}
      {copilotState.activeTab === 'suggestions' ? (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">Generando sugerencias...</p>
            </div>
          ) : aiSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No hay sugerencias disponibles</p>
              <p className="text-xs text-gray-400">El copiloto generará sugerencias automáticamente</p>
            </div>
          ) : (
            aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                    {getConfidenceText(suggestion.confidence)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{suggestion.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {suggestion.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {suggestion.actions.copy && (
                      <button
                        onClick={() => onCopySuggestion(suggestion)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Copiar"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                    {suggestion.actions.improve && (
                      <button
                        onClick={() => onImproveSuggestion(suggestion.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Mejorar"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chat History */}
          <div className="flex-1 min-h-0">
            {copilotState.chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">Pregunta lo que necesites</p>
                <p className="text-xs text-gray-400">El copiloto está aquí para ayudarte</p>
              </div>
            ) : (
              <div className="space-y-3">
                {copilotState.chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Escribe tu pregunta..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || copilotState.isLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {copilotState.isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Modo simulado - sin backend real
        </p>
      </div>
    </div>
  );
}; 