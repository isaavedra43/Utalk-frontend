import React, { useState } from 'react';
import { Bot, Send, Lightbulb, TrendingUp, AlertTriangle, Users, DollarSign, Star, FileText, Clock } from 'lucide-react';

export const HRCopilot: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '¡Hola! Soy tu Copiloto de RH. Puedo ayudarte con análisis de nómina, recomendaciones de promociones, detección de riesgos de retención y más. ¿En qué puedo asistirte hoy?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    {
      icon: DollarSign,
      title: 'Explicar nómina de Ana García',
      description: 'Análisis detallado del último periodo',
      action: () => handleSuggestion('Explica la nómina de Ana García del último periodo')
    },
    {
      icon: TrendingUp,
      title: 'Recomendaciones de promoción',
      description: 'Candidatos para ascenso',
      action: () => handleSuggestion('¿Quiénes son los mejores candidatos para promoción este trimestre?')
    },
    {
      icon: AlertTriangle,
      title: 'Riesgos de retención',
      description: 'Empleados en riesgo de fuga',
      action: () => handleSuggestion('Identifica empleados con riesgo de rotación')
    },
    {
      icon: Users,
      title: 'Plan de sucesión',
      description: 'Preparar reemplazos clave',
      action: () => handleSuggestion('Crea un plan de sucesión para posiciones críticas')
    }
  ];

  const handleSuggestion = (message: string) => {
    setInputMessage(message);
    handleSendMessage(message);
  };

  const handleSendMessage = (message?: string) => {
    const userMessage = message || inputMessage;
    if (!userMessage.trim()) return;

    // Agregar mensaje del usuario
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage);
      const newBotMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    
    if (message.includes('promoción') || message.includes('promocion') || message.includes('ascenso')) {
      return `**Recomendaciones de Promoción - Q4 2024**

**Candidatos Destacados:**

🥇 **María Rodríguez** - Analista RH
- Score de desempeño: 4.5/5
- Evaluación 360°: Excelente
- Habilidades: Liderazgo, Análisis de datos
- Recomendación: Promoción a Senior Analyst

🥈 **Carlos López** - Desarrollador Senior  
- Score de desempeño: 4.2/5
- Evaluación técnica: Sobresaliente
- Habilidades: Arquitectura, Mentoring
- Recomendación: Promoción a Tech Lead

🥉 **Ana García** - Gerente Marketing
- Score de desempeño: 4.0/5
- Evaluación de gestión: Muy buena
- Habilidades: Estrategia, Equipos
- Recomendación: Promoción a Director

**Factores considerados:**
- Desempeño consistente (últimos 12 meses)
- Potencial de crecimiento
- Habilidades de liderazgo
- Contribución al negocio

¿Quieres que profundice en algún candidato específico?`;
    }
    
    if (message.includes('riesgo') || message.includes('retention') || message.includes('rotación')) {
      return `**Análisis de Riesgo de Retención**

**Empleados en Alto Riesgo (Score > 7/10):**

🔴 **José Martínez** - Sales Executive
- Factores de riesgo: Bajo score (3.2/5), Ausentismo (8%), Sin promoción (18 meses)
- Probabilidad de fuga: 85%
- Acción recomendada: Reunión 1:1 urgente, plan de desarrollo

🟡 **Laura Sánchez** - Marketing Specialist  
- Factores de riesgo: Salario por debajo del mercado, Sin crecimiento visible
- Probabilidad de fuga: 65%
- Acción recomendada: Revisión salarial, nuevas responsabilidades

**Empleados en Riesgo Medio (Score 4-6/10):**
- 8 empleados identificados
- Factores comunes: Falta de desarrollo, Salarios desactualizados

**Recomendaciones:**
1. Implementar programa de retención
2. Revisión salarial trimestral
3. Planes de desarrollo personalizados
4. Programa de reconocimiento

¿Quieres que genere un plan de retención específico?`;
    }
    
    if (message.includes('sucesión') || message.includes('sucesion') || message.includes('reemplazo')) {
      return `**Plan de Sucesión - Posiciones Críticas**

**Posiciones de Alto Riesgo:**

👑 **CEO** - Sin sucesor identificado
- Candidatos internos: 0
- Tiempo de preparación: 18-24 meses
- Acción: Iniciar búsqueda externa + desarrollo interno

💼 **CTO** - Sucesor parcialmente preparado
- Candidato principal: Carlos López (Tech Lead)
- Nivel de preparación: 70%
- Tiempo de preparación: 6-12 meses
- Acción: Acelerar programa de desarrollo

📊 **CFO** - Sin sucesor identificado
- Candidatos internos: 0
- Tiempo de preparación: 12-18 meses
- Acción: Búsqueda externa + desarrollo de analista senior

**Plan de Acción:**
1. Identificar 2-3 candidatos por posición
2. Crear planes de desarrollo específicos
3. Rotaciones y proyectos especiales
4. Mentoring con ejecutivos actuales
5. Evaluación trimestral de progreso

¿Quieres que detalle el plan para alguna posición específica?`;
    }
    
    return `Entiendo tu consulta sobre "${userMessage}". 

Como tu Copiloto de RH, puedo ayudarte con:

📊 **Análisis de Nómina**: Explicar percepciones, deducciones y detectar anomalías
👥 **Gestión de Talento**: Recomendaciones de promoción y planes de desarrollo  
⚠️ **Riesgos**: Detección temprana de rotación y empleados en riesgo
🎯 **Sucesión**: Planes de reemplazo para posiciones críticas
📈 **Métricas**: Análisis de KPIs y tendencias de RH
📋 **Cumplimiento**: Monitoreo de documentos y políticas

¿Podrías ser más específico sobre lo que necesitas? Por ejemplo:
- "Explica la nómina de [empleado]"
- "¿Quiénes son candidatos para promoción?"
- "Identifica riesgos de retención"
- "Crea plan de sucesión para [posición]"`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Copiloto RH</h2>
            <p className="text-sm text-gray-500">Asistente de IA para Recursos Humanos</p>
          </div>
        </div>
      </div>

      {/* Sugerencias rápidas */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Sugerencias rápidas</h3>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, index) => {
            const IconComponent = suggestion.icon;
            return (
              <button
                key={index}
                onClick={suggestion.action}
                className="flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconComponent className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{suggestion.title}</div>
                  <div className="text-xs text-gray-500">{suggestion.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Copiloto está escribiendo...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escribe tu pregunta sobre RH..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          El Copiloto puede analizar nómina, recomendar promociones, detectar riesgos y más.
        </p>
      </div>
    </div>
  );
};
