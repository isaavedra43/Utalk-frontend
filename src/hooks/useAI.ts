import { useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiService, mockAISuggestions } from '../services/ai';
import { infoLog } from '../config/logger';

export const useAI = (workspaceId: string = 'default_workspace') => {
  // Query para obtener configuración IA
  const {
    data: aiConfig,
    isLoading: isLoadingConfig
  } = useQuery({
    queryKey: ['ai-config', workspaceId],
    queryFn: () => aiService.getAIConfig(workspaceId),
    initialData: {
      enabled: true,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: 'Eres un asistente de atención al cliente profesional y amigable.',
      customPrompts: {
        greeting: 'Saluda al cliente de manera profesional',
        farewell: 'Despídete del cliente de manera cordial',
        problem_solving: 'Ayuda al cliente a resolver su problema'
      }
    },
    staleTime: 300000 // 5 minutos
  });

  // Query para obtener sugerencias
  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
    refetch: refetchSuggestions
  } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: () => Promise.resolve(mockAISuggestions),
    initialData: mockAISuggestions,
    staleTime: 10000 // 10 segundos
  });

  // Query para health check IA
  const {
    data: aiHealth,
    isLoading: isLoadingHealth
  } = useQuery({
    queryKey: ['ai-health'],
    queryFn: () => aiService.getAIHealth(),
    initialData: {
      status: 'healthy' as const,
      model: 'gpt-4',
      responseTime: 250,
      lastCheck: new Date().toISOString(),
      errors: []
    },
    staleTime: 60000 // 1 minuto
  });

  // Mutation para generar sugerencia
  const generateSuggestionMutation = useMutation({
    mutationFn: (suggestionData: {
      workspaceId: string;
      conversationId: string;
      messageId?: string;
      context?: string;
    }) => aiService.generateSuggestion(suggestionData),
    onSuccess: () => {
      refetchSuggestions();
    }
  });

  // Mutation para actualizar configuración IA
  const updateAIConfigMutation = useMutation({
    mutationFn: (config: {
      enabled?: boolean;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      customPrompts?: Record<string, string>;
    }) => aiService.updateAIConfig(workspaceId, config)
  });

  // Mutation para actualizar estado de sugerencia
  const updateSuggestionStatusMutation = useMutation({
    mutationFn: ({ conversationId, suggestionId, status }: {
      conversationId: string;
      suggestionId: string;
      status: 'used' | 'ignored' | 'improved';
    }) => aiService.updateSuggestionStatus(conversationId, suggestionId, status)
  });

  // Función para generar sugerencia
  const generateSuggestion = useCallback(async (conversationId: string, context?: string) => {
    try {
      return await generateSuggestionMutation.mutateAsync({
        workspaceId,
        conversationId,
        context
      });
    } catch (error) {
      infoLog('Error generando sugerencia:', error);
      throw error;
    }
  }, [workspaceId, generateSuggestionMutation]);

  // Función para actualizar configuración
  const updateAIConfig = useCallback(async (config: {
    enabled?: boolean;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    customPrompts?: Record<string, string>;
  }) => {
    try {
      await updateAIConfigMutation.mutateAsync(config);
    } catch (error) {
      infoLog('Error actualizando configuración IA:', error);
      throw error;
    }
  }, [updateAIConfigMutation]);

  // Función para actualizar estado de sugerencia
  const updateSuggestionStatus = useCallback(async (conversationId: string, suggestionId: string, status: 'used' | 'ignored' | 'improved') => {
    try {
      await updateSuggestionStatusMutation.mutateAsync({ conversationId, suggestionId, status });
    } catch (error) {
      infoLog('Error actualizando estado de sugerencia:', error);
      throw error;
    }
  }, [updateSuggestionStatusMutation]);

  // Función para analizar sentimiento
  const analyzeSentiment = useCallback(async (messageContent: string) => {
    try {
      return await aiService.analyzeSentiment(messageContent);
    } catch (error) {
      infoLog('Error analizando sentimiento:', error);
      throw error;
    }
  }, []);

  // Función para clasificar intención
  const classifyIntent = useCallback(async (messageContent: string) => {
    try {
      return await aiService.classifyIntent(messageContent);
    } catch (error) {
      infoLog('Error clasificando intención:', error);
      throw error;
    }
  }, []);

  // Función para generar respuesta automática
  const generateAutoResponse = useCallback(async (context: {
    conversationId: string;
    customerName: string;
    lastMessage: string;
    conversationHistory: string[];
    suggestedTone: 'professional' | 'friendly' | 'formal';
  }) => {
    try {
      return await aiService.generateAutoResponse(context);
    } catch (error) {
      infoLog('Error generando respuesta automática:', error);
      throw error;
    }
  }, []);

  // Función para obtener estadísticas IA
  const getAIStats = useCallback(async (days: number = 7) => {
    try {
      return await aiService.getAIStats(workspaceId, { days });
    } catch (error) {
      infoLog('Error obteniendo estadísticas IA:', error);
      throw error;
    }
  }, [workspaceId]);

  return {
    // Datos
    aiConfig,
    suggestions,
    aiHealth,

    // Estados
    isLoadingConfig,
    isLoadingSuggestions,
    isLoadingHealth,

    // Acciones
    generateSuggestion,
    updateAIConfig,
    updateSuggestionStatus,
    analyzeSentiment,
    classifyIntent,
    generateAutoResponse,
    getAIStats,
    refetchSuggestions,

    // Estados de mutaciones
    isGeneratingSuggestion: generateSuggestionMutation.isPending,
    isUpdatingConfig: updateAIConfigMutation.isPending,
    isUpdatingSuggestionStatus: updateSuggestionStatusMutation.isPending
  };
}; 