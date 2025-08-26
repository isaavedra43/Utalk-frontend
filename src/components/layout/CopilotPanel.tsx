import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Filter, Send, Lightbulb, Users, TrendingUp, Shield, Zap, Star } from 'lucide-react';
import '../../styles/copilot.css';
import { useCopilot } from '../../hooks/useCopilot';
import { useAuthContext } from '../../contexts/useAuthContext';
import { useChatStore } from '../../stores/useChatStore';
import type { ConversationMemory, CopilotAnalysis, CopilotImprovements } from '../../services/copilot';
import { copilotService } from '../../services/copilot';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentNotes?: string;
  suggestions?: string[];
}

// Memoizar el componente principal para evitar re-renders innecesarios
export const CopilotPanel: React.FC = React.memo(() => {
  const [chatInput, setChatInput] = useState('');
  // ✅ SOLUCIÓN: Eliminar estado local y usar store global
  // const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CopilotAnalysis | null>(null);
  const [strategyResult, setStrategyResult] = useState<{ strategies: string[]; actionPlan: string[] } | null>(null);
  const [experienceResult, setExperienceResult] = useState<CopilotImprovements | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isStrategyLoading, setIsStrategyLoading] = useState(false);
  const [isQuickLoading, setIsQuickLoading] = useState(false);
  const [isExperienceLoading, setIsExperienceLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [tokenCount, setTokenCount] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Refs para evitar dependencias inestables
  const isTypingRef = useRef(false);
  const activeConversationIdRef = useRef('');
  const currentAgentIdRef = useRef('');
  const socketRef = useRef<unknown>(null);
  
  // Refs para funciones estables
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const chatRef = useRef<Function | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const generateResponseRef = useRef<Function | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const analyzeConversationRef = useRef<Function | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const optimizeResponseRef = useRef<Function | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const strategySuggestionsRef = useRef<Function | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const quickResponseRef = useRef<Function | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const improveExperienceRef = useRef<Function | null>(null);
  
  // Memoizar el contexto de autenticación para evitar re-renders
  const authContext = useAuthContext();
  const { user, backendUser } = useMemo(() => ({
    user: authContext.user,
    backendUser: authContext.backendUser
  }), [authContext.user, authContext.backendUser]);
  
  const {
    chat,
    generateResponse,
    analyzeConversation,
    optimizeResponse,
    strategySuggestions,
    quickResponse,
    improveExperience,
  } = useCopilot();

  // Actualizar refs de funciones de forma estable
  useEffect(() => {
    chatRef.current = chat;
    generateResponseRef.current = generateResponse;
    analyzeConversationRef.current = analyzeConversation;
    optimizeResponseRef.current = optimizeResponse;
    strategySuggestionsRef.current = strategySuggestions;
    quickResponseRef.current = quickResponse;
    improveExperienceRef.current = improveExperience;
  }, [chat, generateResponse, analyzeConversation, optimizeResponse, strategySuggestions, quickResponse, improveExperience]);

  // Suscribirse al ID de conversación activa de forma estable desde el store
  const activeConversationId = useChatStore((s) => s.activeConversation?.id ?? null);
  
  // ✅ SOLUCIÓN: Obtener la función addMessage del store
  const addMessage = useChatStore((s) => s.addMessage);
  
  // Memoizar la actualización del ref para evitar re-renders
  useEffect(() => {
    const id = activeConversationId || '';
    activeConversationIdRef.current = id;
  }, [activeConversationId]);

  // Seleccionar mensajes desde el store sin crear nuevos arrays
  const storeMessages = useChatStore((s) => (activeConversationId ? s.messages[activeConversationId] : undefined));
  
  // Memoizar el array de mensajes para evitar recreaciones
  const storeMessagesArray = useMemo(() => {
    return Array.isArray(storeMessages) ? storeMessages : [];
  }, [storeMessages]);

  // Memoizar la actualización del ref del agente actual
  useEffect(() => {
    const id = backendUser?.id || user?.uid || null;
    currentAgentIdRef.current = id || '';
    
    // 🔍 DEBUG TEMPORAL: Log para verificar valores del agentId
    console.log('🔍 DEBUG agentId en CopilotPanel:', {
      backendUserId: backendUser?.id,
      userUid: user?.uid,
      finalId: id,
      refValue: currentAgentIdRef.current,
      hasBackendUser: !!backendUser,
      hasUser: !!user,
      backendUserKeys: backendUser ? Object.keys(backendUser) : null,
      userKeys: user ? Object.keys(user) : null
    });
  }, [backendUser?.id, user?.uid]);

  // Obtener socket de forma estable sin usar el contexto
  useEffect(() => {
    // Obtener socket del contexto de forma segura
    const getSocket = () => {
      try {
        // Intentar obtener el socket del contexto global si existe
        const wsContext = (window as unknown as { __websocketContext?: { socket?: unknown } }).__websocketContext;
        if (wsContext?.socket) {
          socketRef.current = wsContext.socket;
          return wsContext.socket;
        }
        return null;
      } catch {
        return null;
      }
    };
    
    socketRef.current = getSocket();
  }, []);

  // Memoizar getCurrentConversationMemory para evitar recreaciones
  const getCurrentConversationMemory = useCallback((): ConversationMemory => {
    const recent = (storeMessagesArray || []).slice(-10).map((m: { direction?: string; content: string; createdAt?: string }) => ({
      role: m.direction === 'outbound' ? 'user' as const : 'assistant' as const,
      content: m.content,
      timestamp: m.createdAt || new Date().toISOString()
    }));
    return {
      messages: recent,
      summary: `Conversación ${activeConversationIdRef.current}`,
      context: {
        conversationId: activeConversationIdRef.current,
        agentId: currentAgentIdRef.current,
        messageCount: recent.length
      }
    };
  }, [storeMessagesArray]);

  const extractAgentNotes = useCallback((raw: string): { text: string; notes?: string } => {
    // ✅ SOLUCIÓN: Validación para evitar error cuando raw es undefined
    if (!raw || typeof raw !== 'string') {
      return { text: raw || '', notes: undefined };
    }
    
    // ✅ SOLUCIÓN: Manejar el formato específico del backend
    const marker = /---\s*\n?\s*Notas para el agente\s*\(no enviar al cliente\)\s*:\s*/i;
    const idx = raw.search(marker);
    
    if (idx === -1) {
      // No hay notas, devolver todo el contenido como texto principal
      return { text: raw.trim(), notes: undefined };
    }
    
    // Separar el contenido principal de las notas
    const before = raw.substring(0, idx).trim();
    const match = raw.match(marker);
    const after = raw.substring(idx + (match?.[0]?.length || 0)).trim();
    
    // ✅ SOLUCIÓN: Asegurar que el texto principal no esté vacío
    const mainText = before || raw.trim();
    
    return { 
      text: mainText, 
      notes: after || undefined 
    };
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
    window.setTimeout(() => setError(null), 5000);
  }, []);

  const withLoading = useCallback(async <T,>(
    loadingSetter: (loading: boolean) => void,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    loadingSetter(true);
    try {
      return await asyncFn();
    } finally {
      loadingSetter(false);
    }
  }, []);

  const updateTokenCount = useCallback((text: string) => {
    const estimatedTokens = Math.ceil(text.length / 4);
    setTokenCount(prev => prev + estimatedTokens);
  }, []);

  const addToHistory = useCallback((command: string) => {
    setCommandHistory(prev => [command, ...prev.slice(0, 9)]);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  }, [isDarkMode]);

  const getThemeClasses = useCallback(() => ({
    container: isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300',
    button: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
  }), [isDarkMode]);

  // ✅ SOLUCIÓN: Función helper para extraer agentId como string
  const getAgentIdString = useCallback((): string => {
    const agentId = currentAgentIdRef.current;
    if (typeof agentId === 'string') {
      return agentId;
    } else if (typeof agentId === 'object' && agentId !== null) {
      const agentObj = agentId as { id?: string; uid?: string };
      return agentObj?.id || agentObj?.uid || '';
    }
    return '';
  }, []);

  // SOLUCIÓN: Validación robusta antes de cualquier operación
  const validateAgentAndConversation = useCallback((): { isValid: boolean; error?: string } => {
    const agentIdString = getAgentIdString();
    
    if (!agentIdString) {
      return { isValid: false, error: 'No hay agente identificado. Por favor, inicia sesión.' };
    }
    if (!activeConversationIdRef.current) {
      return { isValid: false, error: 'No hay conversación activa.' };
    }
    return { isValid: true };
  }, [getAgentIdString]);

  const validateBeforeCall = useCallback((): boolean => {
    const validation = validateAgentAndConversation();
    if (!validation.isValid) {
      showError(validation.error || 'Error de validación');
      return false;
    }
    return true;
  }, [validateAgentAndConversation, showError]);

  const handleChatSend = useCallback(async (override?: string) => {
    const text = typeof override === 'string' ? override : chatInput.trim();
    if (!text) return;

    // SOLUCIÓN: Validación robusta antes de enviar
    const validation = validateAgentAndConversation();
    if (!validation.isValid) {
      showError(validation.error || 'No se puede enviar el mensaje');
      return;
    }

    updateTokenCount(text);

    // ✅ SOLUCIÓN: Usar la estructura correcta del store global
    const userMessage = {
      id: Date.now().toString(),
      conversationId: activeConversationIdRef.current,
      content: text,
      direction: 'outbound' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sent' as const,
      type: 'text' as const,
      metadata: {
        agentId: getAgentIdString(),
        ip: '127.0.0.1',
        requestId: 'copilot-panel',
        sentBy: getAgentIdString(),
        source: 'web' as const,
        timestamp: new Date().toISOString()
      }
    };
    
    // ✅ SOLUCIÓN: Agregar mensaje al store global
    if (activeConversationIdRef.current) {
      addMessage(activeConversationIdRef.current, userMessage);
    }
    setChatInput('');
    setIsTyping(true);
    isTypingRef.current = true;

    const agentId = currentAgentIdRef.current;
    const conversationId = activeConversationIdRef.current;

    // ✅ SOLUCIÓN: Usar función helper para extraer agentId como string
    const agentIdString = getAgentIdString();

    // 🔍 DEBUG TEMPORAL: Log para verificar valores antes del envío
    console.log('🔍 DEBUG agentId antes del envío:', {
      agentId,
      agentIdString,
      conversationId,
      hasAgentId: !!agentIdString,
      agentIdLength: agentIdString?.length,
      agentIdType: typeof agentIdString,
      refValue: currentAgentIdRef.current,
      backendUserId: backendUser?.id,
      userUid: user?.uid
    });

    // SOLUCIÓN: Verificación adicional antes de enviar
    if (!agentIdString || !conversationId) {
      console.error('❌ Datos faltantes para envío:', { agentIdString, conversationId });
      setIsTyping(false);
      isTypingRef.current = false;
      showError('Error: Datos de sesión incompletos');
      return;
    }

    const appendAssistant = (content: string) => {
      // ✅ SOLUCIÓN: Limpiar la respuesta del backend
      let cleanContent = content;
      
      // Remover caracteres de escape extra del backend
      if (typeof cleanContent === 'string') {
        // Remover comillas dobles al inicio y final si existen
        cleanContent = cleanContent.replace(/^"|"$/g, '');
        // Remover caracteres de escape de newline
        cleanContent = cleanContent.replace(/\\n/g, '\n');
        // Remover caracteres de escape de comillas
        cleanContent = cleanContent.replace(/\\"/g, '"');
        // Limpiar espacios extra
        cleanContent = cleanContent.trim();
      }
      
      // Validar que el contenido no esté vacío
      if (!cleanContent || cleanContent.length === 0) {
        cleanContent = 'Lo siento, no pude procesar la respuesta. Inténtalo de nuevo.';
      }
      
      const parsed = extractAgentNotes(cleanContent);
      // ✅ SOLUCIÓN: Usar la estructura correcta del store global para mensaje del asistente
      const aiResponse = { 
        id: (Date.now() + 1).toString(),
        conversationId: activeConversationIdRef.current,
        content: parsed.text, 
        direction: 'inbound' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'received' as const,
        type: 'text' as const,
        metadata: {
          agentId: getAgentIdString(),
          ip: '127.0.0.1',
          requestId: 'copilot-panel',
          sentBy: 'copilot',
          source: 'web' as const,
          timestamp: new Date().toISOString()
        }
      };
      
      // ✅ SOLUCIÓN: Agregar mensaje del asistente al store global
      if (activeConversationIdRef.current) {
        addMessage(activeConversationIdRef.current, aiResponse);
      }
      
      // ✅ SOLUCIÓN: Agregar log para debug
      console.log('🔍 DEBUG appendAssistant:', {
        originalContent: content,
        cleanContent,
        parsedText: parsed.text,
        messageId: aiResponse.id,
        messageCount: storeMessagesArray.length + 1 // Usar storeMessagesArray para contar mensajes
      });
      
      // setMessages(prev => { // Eliminar esta línea
      //   const newMessages = [...prev, aiResponse];
      //   console.log('🔍 DEBUG setMessages:', {
      //     previousCount: prev.length,
      //     newCount: newMessages.length,
      //     lastMessage: newMessages[newMessages.length - 1]
      //   });
      //   return newMessages;
      // });
      setIsTyping(false);
      isTypingRef.current = false;
    };

    try {
      const socket = socketRef.current as { connected: boolean; emit: (event: string, data: unknown) => void; once: (event: string, callback: (data: unknown) => void) => void } | null;
      if (socket?.connected) {
        socket.emit('copilot_chat_message', { message: text, conversationId, agentId: agentIdString });
        const wsTimeout = window.setTimeout(async () => {
          if (isTypingRef.current) {
            try {
              if (chatRef.current) {
                const res = await chatRef.current({ message: text, conversationId, agentId: agentIdString });
                appendAssistant(res.response);
              }
            } catch (error) {
              console.error('Error en REST fallback:', error);
              appendAssistant('Lo siento, hubo un problema. Inténtalo de nuevo.');
            }
          }
        }, 3000);

        socket.once('copilot_response', (data: unknown) => {
          window.clearTimeout(wsTimeout);
          const responseData = data as { response: string; suggestions?: string[] };
          appendAssistant(responseData.response);
        });
      } else {
        if (chatRef.current) {
          const res = await chatRef.current({ message: text, conversationId, agentId: agentIdString });
          appendAssistant(res.response);
        }
      }
    } catch (error) {
      console.error('Error en handleChatSend:', error);
      setIsTyping(false);
      isTypingRef.current = false;
      appendAssistant('Lo siento, hubo un problema. Inténtalo de nuevo.');
    }
  }, [chatInput, extractAgentNotes, updateTokenCount, validateAgentAndConversation, showError, getAgentIdString, storeMessagesArray]);

  // SOLUCIÓN PRINCIPAL: handleSendToCopilot usando refs para evitar dependencias inestables
  const handleSendToCopilot = useCallback(async (event: Event) => {
    const { content, type, action, payload } = (event as CustomEvent).detail || {};

    const pushAssistant = (text: string, suggestions?: string[]) => {
      // ✅ SOLUCIÓN: Limpiar la respuesta del backend
      let cleanText = text;
      
      // Remover caracteres de escape extra del backend
      if (typeof cleanText === 'string') {
        // Remover comillas dobles al inicio y final si existen
        cleanText = cleanText.replace(/^"|"$/g, '');
        // Remover caracteres de escape de newline
        cleanText = cleanText.replace(/\\n/g, '\n');
        // Remover caracteres de escape de comillas
        cleanText = cleanText.replace(/\\"/g, '"');
        // Limpiar espacios extra
        cleanText = cleanText.trim();
      }
      
      // Validar que el contenido no esté vacío
      if (!cleanText || cleanText.length === 0) {
        cleanText = 'Lo siento, no pude procesar la respuesta. Inténtalo de nuevo.';
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanText,
        timestamp: new Date().toISOString(),
        suggestions
      };
      
      // ✅ SOLUCIÓN: Agregar log para debug
      console.log('🔍 DEBUG pushAssistant:', {
        originalText: text,
        cleanText,
        messageId: aiResponse.id
      });
      
      // setMessages(prev => { // Eliminar esta línea
      //   const newMessages = [...prev, aiResponse];
      //   console.log('🔍 DEBUG pushAssistant setMessages:', {
      //     previousCount: prev.length,
      //     newCount: newMessages.length,
      //     lastMessage: newMessages[newMessages.length - 1]
      //   });
      //   return newMessages;
      // });
      setIsTyping(false);
      isTypingRef.current = false;
    };

    if (content) {
      setIsTyping(true);
      isTypingRef.current = true;
    }

    try {
      if (type === 'response' && action === 'improve') {
        await withLoading(setIsOptimizing, async () => {
          if (optimizeResponseRef.current) {
            const { optimized } = await optimizeResponseRef.current({ response: content });
            pushAssistant(optimized);
          }
        });
        return;
      }

      if (type === 'product' && action === 'analyze') {
        if (!validateBeforeCall()) return;
        await withLoading(setIsAnalyzing, async () => {
          if (analyzeConversationRef.current) {
            const analysis = await analyzeConversationRef.current({ conversationMemory: getCurrentConversationMemory() });
            setAnalysisResult(analysis);
          }
        });
        return;
      }

      if (type === 'strategy') {
        if (!validateBeforeCall()) return;
        await withLoading(setIsStrategyLoading, async () => {
          if (strategySuggestionsRef.current) {
            const res = await strategySuggestionsRef.current({ 
              agentId: getAgentIdString(), 
              analysis: payload?.analysis, 
              conversationMemory: getCurrentConversationMemory() 
            });
            setStrategyResult(res);
          }
        });
        return;
      }

      if (type === 'quick') {
        await withLoading(setIsQuickLoading, async () => {
          if (quickResponseRef.current) {
            const res = await quickResponseRef.current({
              urgency: payload?.urgency || 'normal',
              context: {
                lastMessage: typeof content === 'string' ? content : undefined,
                conversationId: activeConversationIdRef.current,
                customerInfo: payload?.customerInfo,
                productInfo: payload?.productInfo
              }
            });
            pushAssistant(res.quick);
          }
        });
        return;
      }

      if (type === 'experience') {
        if (!validateBeforeCall()) return;
        await withLoading(setIsExperienceLoading, async () => {
          if (improveExperienceRef.current) {
            const res = await improveExperienceRef.current({ 
              agentId: getAgentIdString(), 
              conversationMemory: getCurrentConversationMemory(), 
              analysis: payload?.analysis 
            });
            setExperienceResult(res);
          }
        });
        return;
      }

      if (content) {
        await handleChatSend(content);
      }
    } catch (err) {
      console.error('Error en sendToCopilot:', err);
      showError('Hubo un problema con el copiloto. Inténtalo de nuevo.');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect optimizado: registrar listener UNA sola vez
  useEffect(() => {
    const handler = (e: Event) => handleSendToCopilot(e);
    window.addEventListener('sendToCopilot', handler);
    return () => window.removeEventListener('sendToCopilot', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderAnalysisResult = useCallback(() => {
    if (!analysisResult) return null;
    return (
      <div className="px-3 pb-2">
        <div className="max-w-full bg-white border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Análisis de Conversación</h4>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 mb-2">
            <p><span className="font-medium">Tono:</span> {analysisResult.tone.tone}</p>
            <p><span className="font-medium">Sentimiento:</span> {analysisResult.tone.sentiment}</p>
            <p><span className="font-medium">Urgencia:</span> {analysisResult.tone.urgency}</p>
          </div>
          {analysisResult.opportunities?.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-900 mb-1">Oportunidades</h5>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                {analysisResult.opportunities.map((opp, i) => (
                  <li key={i}>{opp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }, [analysisResult]);

  const renderStrategyResult = useCallback(() => {
    if (!strategyResult) return null;
    return (
      <div className="px-3 pb-2">
        <div className="max-w-full bg-white border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Estrategia de Atención</h4>
          {strategyResult.strategies?.length > 0 && (
            <div className="mb-2">
              <h5 className="text-xs font-medium text-gray-900 mb-1">Estrategias</h5>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                {strategyResult.strategies.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {strategyResult.actionPlan?.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-900 mb-1">Plan de acción</h5>
              <ul className="list-decimal list-inside text-xs text-gray-700 space-y-0.5">
                {strategyResult.actionPlan.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }, [strategyResult]);

  const renderExperienceResult = useCallback(() => {
    if (!experienceResult) return null;
    return (
      <div className="px-3 pb-2">
        <div className="max-w-full bg-white border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Mejora de Experiencia</h4>
          {experienceResult.gaps?.length > 0 && (
            <div className="mb-2">
              <h5 className="text-xs font-medium text-gray-900 mb-1">Gaps identificados</h5>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                {experienceResult.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          {experienceResult.improvements?.length > 0 && (
            <div className="mb-2">
              <h5 className="text-xs font-medium text-gray-900 mb-1">Mejoras sugeridas</h5>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                {experienceResult.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          )}
          {experienceResult.plan?.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-900 mb-1">Plan de implementación</h5>
              <ul className="list-decimal list-inside text-xs text-gray-700 space-y-0.5">
                {experienceResult.plan.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }, [experienceResult]);

  const handleChatKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  }, [handleChatSend]);

  const handleSuggestionClick = useCallback(async (suggestion: { id: number; prompt: string; title: string }) => {
    if (!validateBeforeCall()) return;
    addToHistory(suggestion.title);

    const push = (text: string) => {
      // Función placeholder para futuras implementaciones
      console.log('Push function called with:', text);
    };

    try {
      if (suggestion.id === 1) {
        await withLoading(setIsGenerating, async () => {
          if (generateResponseRef.current) {
            const result = await generateResponseRef.current({ 
              conversationId: activeConversationIdRef.current, 
              agentId: getAgentIdString(), 
              message: suggestion.prompt 
            });
            push(result.response);
          }
        });
      } else if (suggestion.id === 2) {
        await withLoading(setIsAnalyzing, async () => {
          if (analyzeConversationRef.current) {
            const analysis = await analyzeConversationRef.current({ conversationMemory: getCurrentConversationMemory() });
            setAnalysisResult(analysis);
            push(`Tono: ${analysis.tone.tone} | Sentimiento: ${analysis.tone.sentiment} | Urgencia: ${analysis.tone.urgency}\nOportunidades:\n- ${analysis.opportunities.join('\n- ')}`);
          }
        });
      } else if (suggestion.id === 3) {
        await withLoading(setIsOptimizing, async () => {
          if (optimizeResponseRef.current) {
            const res = await optimizeResponseRef.current({ response: suggestion.prompt });
            push(res.optimized);
          }
        });
      } else if (suggestion.id === 4) {
        await withLoading(setIsStrategyLoading, async () => {
          if (strategySuggestionsRef.current) {
            const res = await strategySuggestionsRef.current({ 
              agentId: getAgentIdString(), 
              conversationMemory: getCurrentConversationMemory() 
            });
            setStrategyResult(res);
            push(`Estrategias:\n- ${res.strategies.join('\n- ')}\n\nPlan de Acción:\n- ${res.actionPlan.join('\n- ')}`);
          }
        });
      } else if (suggestion.id === 5) {
        await withLoading(setIsQuickLoading, async () => {
          if (quickResponseRef.current) {
            const res = await quickResponseRef.current({ 
              urgency: 'normal', 
              context: { conversationId: activeConversationIdRef.current } 
            });
            setChatInput(res.quick);
          }
        });
      } else if (suggestion.id === 6) {
        await withLoading(setIsExperienceLoading, async () => {
          if (improveExperienceRef.current) {
            const res = await improveExperienceRef.current({ 
              agentId: getAgentIdString(), 
              conversationMemory: getCurrentConversationMemory() 
            });
            setExperienceResult(res);
            push(`Gaps Identificados:\n- ${res.gaps.join('\n- ')}\n\nMejoras:\n- ${res.improvements.join('\n- ')}\n\nPlan:\n- ${res.plan.join('\n- ')}`);
          }
        });
      }
    } catch (error) {
      console.error('Error en handleSuggestionClick:', error);
      showError('Error al procesar la sugerencia. Inténtalo de nuevo.');
    }
  }, [
    validateBeforeCall, 
    addToHistory, 
    extractAgentNotes, 
    withLoading, 
    setIsGenerating, 
    setAnalysisResult, 
    setIsOptimizing, 
    setIsStrategyLoading, 
    setStrategyResult, 
    setIsQuickLoading, 
    setChatInput, 
    setIsExperienceLoading, 
    setExperienceResult, 
    showError,
    getAgentIdString
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const showIntro = storeMessagesArray.length === 0; // Usar storeMessagesArray para determinar si es intro

      // ✅ SOLUCIÓN: Log para verificar el estado de los mensajes en el render
    console.log('🔍 DEBUG CopilotPanel render:', {
      messagesCount: storeMessagesArray.length, // Usar storeMessagesArray para contar mensajes
      showIntro,
      messages: storeMessagesArray.map(m => ({ 
        id: m.id, 
        direction: m.direction, 
        content: m.content?.substring(0, 50) + '...',
        contentLength: m.content?.length,
        hasContent: !!m.content,
        createdAt: m.createdAt
      }))
    });

  const suggestedPrompts = useMemo(() => [
    {
      id: 1,
      icon: <Lightbulb className="w-3 h-3" />,
      title: isGenerating ? 'Generando respuesta...' : "Generar respuesta profesional",
      description: "Ayúdame a crear una respuesta cordial y profesional para un cliente",
      prompt: "Genera una respuesta profesional y cordial para un cliente que pregunta sobre nuestros servicios",
      disabled: isGenerating
    },
    {
      id: 2,
      icon: <Users className="w-3 h-3" />,
      title: isAnalyzing ? 'Analizando conversación...' : "Analizar conversación",
      description: "Analiza el tono y sentimiento de una conversación reciente",
      prompt: "Analiza el tono y sentimiento de la conversación con el cliente para identificar oportunidades de mejora",
      disabled: isAnalyzing
    },
    {
      id: 3,
      icon: <TrendingUp className="w-3 h-3" />,
      title: isOptimizing ? 'Optimizando respuesta...' : "Optimizar respuesta",
      description: "Mejora una respuesta existente para que sea más efectiva",
      prompt: "Optimiza esta respuesta para que sea más clara y persuasiva",
      disabled: isOptimizing
    },
    {
      id: 4,
      icon: <Shield className="w-3 h-3" />,
      title: isStrategyLoading ? 'Generando estrategias...' : "Estrategia de atención",
      description: "Sugiere estrategias para mejorar la atención al cliente",
      prompt: "Sugiere estrategias para mejorar la atención al cliente en situaciones difíciles",
      disabled: isStrategyLoading
    },
    {
      id: 5,
      icon: <Zap className="w-3 h-3" />,
      title: isQuickLoading ? 'Generando respuesta rápida...' : "Respuesta rápida",
      description: "Crea una respuesta concisa para consultas urgentes",
      prompt: "Crea una respuesta rápida y efectiva para una consulta urgente del cliente",
      disabled: isQuickLoading
    },
    {
      id: 6,
      icon: <Star className="w-3 h-3" />,
      title: isExperienceLoading ? 'Analizando experiencia...' : "Mejorar experiencia",
      description: "Identifica oportunidades para mejorar la experiencia del cliente",
      prompt: "Identifica oportunidades para mejorar la experiencia del cliente en nuestro proceso de atención",
      disabled: isExperienceLoading
    }
  ], [isGenerating, isAnalyzing, isOptimizing, isStrategyLoading, isQuickLoading, isExperienceLoading]);

  // Atajos de teclado optimizados
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Enter para enviar mensaje
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (chatInput.trim()) {
          handleChatSend();
        }
      }
      
      // Ctrl/Cmd + 1-6 para sugerencias
      if ((event.ctrlKey || event.metaKey) && /^[1-6]$/.test(event.key)) {
        event.preventDefault();
        const suggestionIndex = parseInt(event.key) - 1;
        if (suggestedPrompts[suggestionIndex]) {
          handleSuggestionClick(suggestedPrompts[suggestionIndex] as unknown as { id: number; prompt: string; title: string });
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [chatInput, suggestedPrompts, handleChatSend, handleSuggestionClick]);

  // Verificar estado del sistema optimizado
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        await copilotService.health();
        setSystemStatus('connected');
      } catch {
        setSystemStatus('disconnected');
      }
    };
    
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${getThemeClasses().container}`}>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}
      
      {/* Header con estado del sistema */}
      {showIntro && (
        <div className="p-3 pb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold animated-gradient-text relative">
              El Copiloto está aquí para ayudar. Solo pregunta.
            </h1>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus === 'connected' ? 'bg-green-500' :
                  systemStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className={
                  systemStatus === 'connected' ? 'text-green-600' :
                  systemStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
                }>
                  {systemStatus === 'connected' ? 'IA Conectada' :
                   systemStatus === 'connecting' ? 'Conectando...' : 'IA Desconectada'}
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
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
                onClick={() => handleSuggestionClick(suggestion as unknown as { id: number; prompt: string; title: string })}
                disabled={suggestion.disabled || isTyping}
                className={`group relative p-2 border rounded-lg transition-all duration-200 text-left overflow-hidden ${
                  suggestion.disabled || isTyping
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                    : `${getThemeClasses().card} hover:border-blue-300 hover:shadow-sm`
                }`}
              >
                <div className="relative flex items-start space-x-1.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm overflow-hidden relative">
                    {/* Fondo animado del icono - siempre visible */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600"></div>
                    <div className="relative z-10 text-white">
                      {suggestion.disabled ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        suggestion.icon
                      )}
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
      {storeMessagesArray.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2 p-3 min-h-0 max-h-[calc(100vh-200px)] no-scrollbar">
          {storeMessagesArray.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-2 py-1.5 rounded-lg text-xs ${
                  message.direction === 'outbound'
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

      {/* Resultados de análisis/estrategia/experiencia */}
      {renderAnalysisResult()}
      {renderStrategyResult()}
      {renderExperienceResult()}

      {/* Historial de comandos */}
      {commandHistory.length > 0 && (
        <div className="px-3 pb-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comandos recientes:</h4>
            <div className="space-y-1">
              {commandHistory.map((cmd, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Input with Radiant Colors Animation - siempre en la parte inferior */}
      <div className="p-3 pt-1 border-t border-gray-100 dark:border-gray-700">
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
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-xs focus:outline-none"
                onKeyPress={handleChatKeyPress}
                placeholder="Haz una pregunta..."
              />
              
              <div className="flex items-center space-x-1">
                <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <Filter className="w-3 h-3" />
                </button>
                
                <button
                  onClick={() => handleChatSend()}
                  disabled={!chatInput.trim() || isTyping}
                  className="p-1.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de tokens y atajos */}
        <div className="px-3 pb-2">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>Tokens estimados: {tokenCount.toLocaleString()}</span>
            <span>Atajos: Ctrl+Enter (enviar) | Ctrl+1-6 (sugerencias)</span>
          </div>
        </div>
      </div>
    </div>
  );
}); 