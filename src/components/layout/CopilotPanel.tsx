import React, { useState } from 'react';
import { Filter, Send, Lightbulb, Users, TrendingUp, Shield, Zap, Star } from 'lucide-react';
import '../../styles/copilot.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CopilotPanel: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChatSend = () => {
    if (chatInput.trim()) {
      // Agregar mensaje del usuario
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: chatInput.trim(),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsTyping(true);

      // Simular respuesta de la IA después de 1 segundo
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(chatInput.trim()),
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiResponse]);
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

  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion);
  };

  const showIntro = messages.length === 0;

  const suggestedPrompts = [
    {
      id: 1,
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Generar respuesta profesional",
      description: "Ayúdame a crear una respuesta cordial y profesional para un cliente",
      prompt: "Genera una respuesta profesional y cordial para un cliente que pregunta sobre nuestros servicios"
    },
    {
      id: 2,
      icon: <Users className="w-4 h-4" />,
      title: "Analizar conversación",
      description: "Analiza el tono y sentimiento de una conversación reciente",
      prompt: "Analiza el tono y sentimiento de la conversación con el cliente para identificar oportunidades de mejora"
    },
    {
      id: 3,
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Optimizar respuesta",
      description: "Mejora una respuesta existente para que sea más efectiva",
      prompt: "Optimiza esta respuesta para que sea más clara y persuasiva"
    },
    {
      id: 4,
      icon: <Shield className="w-4 h-4" />,
      title: "Estrategia de atención",
      description: "Sugiere estrategias para mejorar la atención al cliente",
      prompt: "Sugiere estrategias para mejorar la atención al cliente en situaciones difíciles"
    },
    {
      id: 5,
      icon: <Zap className="w-4 h-4" />,
      title: "Respuesta rápida",
      description: "Crea una respuesta concisa para consultas urgentes",
      prompt: "Crea una respuesta rápida y efectiva para una consulta urgente del cliente"
    },
    {
      id: 6,
      icon: <Star className="w-4 h-4" />,
      title: "Mejorar experiencia",
      description: "Identifica oportunidades para mejorar la experiencia del cliente",
      prompt: "Identifica oportunidades para mejorar la experiencia del cliente en nuestro proceso de atención"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Header - solo se muestra si no hay mensajes */}
      {showIntro && (
        <div className="p-4 pb-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold animated-gradient-text relative" data-text="El Copiloto está aquí para ayudar. Solo pregunta.">
              El Copiloto está aquí para ayudar. Solo pregunta.
            </h1>
          </div>
        </div>
      )}

      {/* Peticiones Sugeridas - solo se muestra si no hay mensajes */}
      {showIntro && (
        <div className="px-4 pb-4 flex-1">
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="group relative p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Efecto de gradiente de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm overflow-hidden relative">
                    {/* Fondo animado del icono - siempre visible */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 animate-gradient-xy"></div>
                    <div className="relative z-10 text-white">
                      {suggestion.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 group-hover:text-blue-900 mb-1 transition-colors duration-300">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 group-hover:text-gray-700 leading-relaxed transition-colors duration-300">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages - ocupa el espacio disponible */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2 p-4 min-h-0">
          {messages.map((message) => (
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

      {/* Message Input with Radiant Colors Animation - siempre en la parte inferior */}
      <div className="p-4 pt-2">
        <div className="relative">
          {/* Radiant Colors Border Animation */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] animate-gradient-xy">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-sm"></div>
          </div>
          
          {/* Input Container */}
          <div className="relative bg-white rounded-lg p-[2px]">
            <div className="flex items-center space-x-2 p-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Haz una pregunta..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-xs focus:outline-none"
              />
              
              <div className="flex items-center space-x-1">
                <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <Filter className="w-3 h-3" />
                </button>
                
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isTyping}
                  className="p-1.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 