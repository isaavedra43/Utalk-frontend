import React, { useState, useEffect } from 'react';
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

  // Escuchar eventos de sugerencias enviadas al Copiloto
  useEffect(() => {
    const handleSendToCopilot = (event: CustomEvent) => {
      const { content, type, action } = event.detail;
      
      if (type === 'response' && action === 'improve') {
        // Cambiar a modo chat si no está activo
        if (messages.length === 0) {
          setMessages([]);
        }
        
        // Agregar la respuesta sugerida como mensaje del usuario
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `Mejora esta respuesta: "${content}"`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simular respuesta del Copiloto mejorando la respuesta
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: generateImprovedResponse(content),
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);
        }, 1500);
      }
      
      if (type === 'product' && action === 'analyze') {
        // Cambiar a modo chat si no está activo
        if (messages.length === 0) {
          setMessages([]);
        }
        
        // Agregar el producto como mensaje del usuario
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `Analiza este producto y sugiere mejoras: ${content}`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simular respuesta del Copiloto analizando el producto
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: generateProductAnalysis(content),
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);
        }, 1500);
      }
    };

    window.addEventListener('sendToCopilot', handleSendToCopilot as EventListener);
    
    return () => {
      window.removeEventListener('sendToCopilot', handleSendToCopilot as EventListener);
    };
  }, [messages.length]);

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

  // Función para generar respuestas mejoradas
  const generateImprovedResponse = (originalResponse: string): string => {
    const improvements = [
      "Aquí tienes una versión mejorada de tu respuesta:\n\n",
      "He optimizado tu respuesta para que sea más efectiva:\n\n",
      "Aquí está la respuesta mejorada con más contexto:\n\n",
      "He refinado tu respuesta para que sea más profesional:\n\n"
    ];
    
    const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)];
    
    // Simular mejoras en la respuesta original
    let improvedResponse = originalResponse;
    
    // Agregar más contexto si es necesario
    if (originalResponse.includes('gracias')) {
      improvedResponse += "\n\nEspero que esta información te sea útil. Si tienes alguna otra pregunta, no dudes en contactarnos.";
    }
    
    if (originalResponse.includes('ayudar')) {
      improvedResponse += "\n\nNuestro equipo está comprometido en brindarte la mejor atención posible.";
    }
    
    if (originalResponse.includes('información')) {
      improvedResponse += "\n\nTe proporcionamos esta información de manera clara y detallada para que puedas tomar la mejor decisión.";
    }
    
    return randomImprovement + improvedResponse;
  };

  // Función para generar análisis de productos
  const generateProductAnalysis = (productContent: string): string => {
    const analyses = [
      "Aquí tienes mi análisis del producto:\n\n",
      "He analizado el producto y aquí están mis recomendaciones:\n\n",
      "Basándome en la información del producto, te sugiero:\n\n"
    ];
    
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    
    let analysis = randomAnalysis;
    
    // Análisis específico basado en el contenido
    if (productContent.includes('Premium')) {
      analysis += "• **Posicionamiento Premium**: El producto está bien posicionado para clientes de alto valor.\n";
      analysis += "• **Estrategia de Precio**: Considera ofrecer descuentos por volumen o suscripciones anuales.\n";
      analysis += "• **Diferenciación**: Destaca las características exclusivas que justifican el precio premium.\n\n";
    }
    
    if (productContent.includes('Consultoría')) {
      analysis += "• **Servicio Personalizado**: Excelente para clientes que requieren atención especializada.\n";
      analysis += "• **Valor Agregado**: Considera incluir un reporte escrito o seguimiento post-consulta.\n";
      analysis += "• **Upselling**: Ofrece paquetes de múltiples sesiones con descuento.\n\n";
    }
    
    if (productContent.includes('Kit')) {
      analysis += "• **Producto Físico**: Asegúrate de tener un buen sistema de inventario.\n";
      analysis += "• **Logística**: Considera opciones de envío rápido y seguimiento.\n";
      analysis += "• **Garantía**: Ofrece garantía extendida para aumentar la confianza del cliente.\n\n";
    }
    
    analysis += "**Recomendaciones generales**:\n";
    analysis += "• Incluye testimonios de clientes satisfechos\n";
    analysis += "• Crea contenido educativo sobre el uso del producto\n";
    analysis += "• Implementa un programa de referidos\n";
    analysis += "• Considera ofrecer una versión de prueba gratuita";
    
    return analysis;
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
      icon: <Lightbulb className="w-3 h-3" />,
      title: "Generar respuesta profesional",
      description: "Ayúdame a crear una respuesta cordial y profesional para un cliente",
      prompt: "Genera una respuesta profesional y cordial para un cliente que pregunta sobre nuestros servicios"
    },
    {
      id: 2,
      icon: <Users className="w-3 h-3" />,
      title: "Analizar conversación",
      description: "Analiza el tono y sentimiento de una conversación reciente",
      prompt: "Analiza el tono y sentimiento de la conversación con el cliente para identificar oportunidades de mejora"
    },
    {
      id: 3,
      icon: <TrendingUp className="w-3 h-3" />,
      title: "Optimizar respuesta",
      description: "Mejora una respuesta existente para que sea más efectiva",
      prompt: "Optimiza esta respuesta para que sea más clara y persuasiva"
    },
    {
      id: 4,
      icon: <Shield className="w-3 h-3" />,
      title: "Estrategia de atención",
      description: "Sugiere estrategias para mejorar la atención al cliente",
      prompt: "Sugiere estrategias para mejorar la atención al cliente en situaciones difíciles"
    },
    {
      id: 5,
      icon: <Zap className="w-3 h-3" />,
      title: "Respuesta rápida",
      description: "Crea una respuesta concisa para consultas urgentes",
      prompt: "Crea una respuesta rápida y efectiva para una consulta urgente del cliente"
    },
    {
      id: 6,
      icon: <Star className="w-3 h-3" />,
      title: "Mejorar experiencia",
      description: "Identifica oportunidades para mejorar la experiencia del cliente",
      prompt: "Identifica oportunidades para mejorar la experiencia del cliente en nuestro proceso de atención"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 overflow-hidden">
      {/* Header - solo se muestra si no hay mensajes */}
      {showIntro && (
        <div className="p-3 pb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold animated-gradient-text relative">
              El Copiloto está aquí para ayudar. Solo pregunta.
            </h1>
          </div>
        </div>
      )}

      {/* Peticiones Sugeridas - solo se muestra si no hay mensajes */}
      {showIntro && (
        <div className="px-3 pb-2 flex-1 overflow-y-auto pt-4 no-scrollbar">
          <div className="grid grid-cols-2 gap-1.5">
            {suggestedPrompts.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="group relative p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-left overflow-hidden"
              >
                <div className="relative flex items-start space-x-1.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm overflow-hidden relative">
                    {/* Fondo animado del icono - siempre visible */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600"></div>
                    <div className="relative z-10 text-white">
                      {suggestion.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 group-hover:text-blue-900 mb-0.5 transition-colors duration-200">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 group-hover:text-gray-700 leading-tight transition-colors duration-200">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages - ocupa el espacio disponible */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2 p-3 min-h-0 max-h-[calc(100vh-200px)] no-scrollbar">
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
      <div className="p-3 pt-1 border-t border-gray-100">
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