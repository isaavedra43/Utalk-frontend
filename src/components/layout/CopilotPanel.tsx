import React, { useState } from 'react';

interface CopilotPanelProps {
  copilotState: any;
  aiSuggestions: any[];
  onSetCopilotTab: (tab: 'suggestions' | 'chat') => void;
  onCopySuggestion: (suggestion: any) => void;
  onImproveSuggestion: (suggestionId: string) => void;
  onGenerateSuggestion: (context?: string) => void;
  isLoading?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
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
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Productos recomendados simulados
  const recommendedProducts: Product[] = [
    {
      id: '1',
      name: 'Plan Premium Pro',
      price: 299.99,
      description: 'Plan completo con soporte 24/7 y funciones avanzadas',
      category: 'Premium'
    },
    {
      id: '2',
      name: 'Servicio de Consultoría',
      price: 150.00,
      description: 'Sesión de consultoría personalizada de 2 horas',
      category: 'Consultoría'
    },
    {
      id: '3',
      name: 'Paquete Básico',
      price: 99.99,
      description: 'Plan básico ideal para pequeñas empresas',
      category: 'Básico'
    }
  ];

  const handleChatSend = () => {
    if (chatInput.trim()) {
      // Agregar mensaje del usuario
      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: chatInput.trim(),
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      setChatInput('');
      setIsTyping(true);

      // Simular respuesta de la IA después de 1 segundo
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: generateAIResponse(chatInput.trim()),
          timestamp: new Date().toISOString()
        };
        
        setChatHistory(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "Entiendo tu consulta. Te ayudo a resolverlo de inmediato.",
      "Excelente pregunta. Basándome en la información disponible, te recomiendo lo siguiente:",
      "Gracias por contactarnos. Aquí tienes una respuesta detallada:",
      "Perfecto, he analizado tu situación y aquí está mi recomendación:",
      "Basándome en los datos del cliente, te sugiero esta estrategia:",
      "Entiendo perfectamente. Aquí tienes una solución profesional:",
      "Excelente punto. Permíteme darte una respuesta completa:",
      "Gracias por la consulta. Te proporciono la siguiente información:"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse}\n\n${generateDetailedResponse(userMessage)}`;
  };

  const generateDetailedResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes('hola') || userMessage.toLowerCase().includes('hello')) {
      return "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy con la atención al cliente?";
    }
    
    if (userMessage.toLowerCase().includes('ayuda') || userMessage.toLowerCase().includes('help')) {
      return "Estoy aquí para ayudarte con:\n• Sugerencias de respuestas\n• Análisis de conversaciones\n• Estrategias de atención al cliente\n• Optimización de respuestas";
    }
    
    if (userMessage.toLowerCase().includes('cliente') || userMessage.toLowerCase().includes('customer')) {
      return "Basándome en el perfil del cliente actual, te recomiendo un enfoque personalizado y profesional. El cliente tiene etiquetas VIP y Premium, por lo que requiere atención especial.";
    }
    
    return "He procesado tu consulta y te proporciono una respuesta optimizada para mantener la calidad del servicio al cliente. ¿Te gustaría que profundice en algún aspecto específico?";
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handleViewProductDetails = (product: Product) => {
    console.log('Ver ficha técnica del producto:', product.name);
    // Aquí se implementaría la lógica para mostrar la ficha técnica
  };

  const handleSendProductToChat = (product: Product) => {
    const productMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: `📦 **${product.name}**\n💰 Precio: $${product.price}\n📝 Descripción: ${product.description}\n🏷️ Categoría: ${product.category}`,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, productMessage]);
    console.log('Producto enviado al chat:', product.name);
  };

  return (
    <div className="p-3 space-y-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 text-blue-600">✨</div>
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
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
            copilotState.activeTab === 'suggestions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sugerencias
        </button>
        <button
          onClick={() => onSetCopilotTab('chat')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
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
        <div className="space-y-3 flex flex-col h-full">
          {/* Sugerencias de IA */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-500">Generando sugerencias...</p>
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="text-center py-6">
                <div className="h-10 w-10 text-gray-300 mx-auto mb-2">💬</div>
                <p className="text-xs text-gray-500 mb-1">No hay sugerencias disponibles</p>
                <p className="text-xs text-gray-400">El copiloto generará sugerencias automáticamente</p>
              </div>
            ) : (
              aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-xs font-medium text-gray-900">{suggestion.title}</h4>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
                      Alta confianza
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-700 mb-2">{suggestion.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.tags.map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onCopySuggestion(suggestion)}
                        className="p-0.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Copiar"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => onImproveSuggestion(suggestion.id)}
                        className="p-0.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                        title="Mejorar"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2">🛍️ Productos Recomendados</h4>
            <p className="text-xs text-gray-600 mb-3">Basándome en la conversación, te recomiendo estos productos:</p>
          </div>

          {/* Productos Recomendados */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-2 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-medium text-gray-900">{product.name}</h5>
                    <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-green-600">${product.price}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleViewProductDetails(product)}
                    className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    📋 Ver Ficha Técnica
                  </button>
                  <button
                    onClick={() => handleSendProductToChat(product)}
                    className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    💬 Enviar al Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 flex flex-col h-full">
          {/* Chat History */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="text-center py-6">
                <div className="h-10 w-10 text-gray-300 mx-auto mb-2">💬</div>
                <p className="text-xs text-gray-500 mb-1">Pregunta lo que necesites</p>
                <p className="text-xs text-gray-400">El copiloto está aquí para ayudarte</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-2 py-1.5 rounded-lg text-xs ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {/* Indicador de escritura */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-2 py-1.5 rounded-lg text-xs">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
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
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
            </div>
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || isTyping}
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isTyping ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>📤</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Modo simulado - sin backend real
        </p>
      </div>
    </div>
  );
}; 