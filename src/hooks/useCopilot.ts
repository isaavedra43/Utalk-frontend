import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { copilotService, type CopilotResponse, type CopilotAnalysis, type CopilotImprovements, type ConversationMemory } from '../services/copilot';

export const useCopilot = () => {
  const chatMutation = useMutation({
    mutationFn: (payload: { message: string; conversationId: string; agentId: string }) => copilotService.chat(payload)
  });

  const generateResponseMutation = useMutation({
    mutationFn: (payload: { conversationId: string; agentId: string; message?: string }) => copilotService.generateResponse(payload)
  });

  const analyzeConversationMutation = useMutation({
    mutationFn: (payload: { conversationMemory: ConversationMemory }) => copilotService.analyzeConversation(payload)
  });

  const optimizeResponseMutation = useMutation({
    mutationFn: (payload: { response: string }) => copilotService.optimizeResponse(payload)
  });

  const strategySuggestionsMutation = useMutation({
    mutationFn: (payload: { agentId: string; analysis?: Record<string, unknown>; conversationMemory?: ConversationMemory }) => copilotService.strategySuggestions(payload)
  });

  const quickResponseMutation = useMutation({
    mutationFn: (payload: { urgency: 'low' | 'normal' | 'medium' | 'high'; context?: { lastMessage?: string; conversationId?: string; customerInfo?: Record<string, unknown>; productInfo?: Record<string, unknown>; } }) => copilotService.quickResponse(payload)
  });

  const improveExperienceMutation = useMutation({
    mutationFn: (payload: { agentId: string; conversationMemory: ConversationMemory; analysis?: Record<string, unknown> }) => copilotService.improveExperience(payload)
  });

  const chat = useCallback(async (payload: { message: string; conversationId: string; agentId: string }): Promise<CopilotResponse> => {
    return await chatMutation.mutateAsync(payload);
  }, [chatMutation]);

  const generateResponse = useCallback(async (payload: { conversationId: string; agentId: string; message?: string }): Promise<CopilotResponse> => {
    return await generateResponseMutation.mutateAsync(payload);
  }, [generateResponseMutation]);

  const analyzeConversation = useCallback(async (payload: { conversationMemory: ConversationMemory }): Promise<CopilotAnalysis> => {
    return await analyzeConversationMutation.mutateAsync(payload);
  }, [analyzeConversationMutation]);

  const optimizeResponse = useCallback(async (payload: { response: string }): Promise<{ optimized: string }> => {
    return await optimizeResponseMutation.mutateAsync(payload);
  }, [optimizeResponseMutation]);

  const strategySuggestions = useCallback(async (payload: { agentId: string; analysis?: Record<string, unknown>; conversationMemory?: ConversationMemory }): Promise<{ strategies: string[]; actionPlan: string[] }> => {
    return await strategySuggestionsMutation.mutateAsync(payload);
  }, [strategySuggestionsMutation]);

  const quickResponse = useCallback(async (payload: { urgency: 'low' | 'normal' | 'medium' | 'high'; context?: { lastMessage?: string; conversationId?: string; customerInfo?: Record<string, unknown>; productInfo?: Record<string, unknown>; } }): Promise<{ quick: string }> => {
    return await quickResponseMutation.mutateAsync(payload);
  }, [quickResponseMutation]);

  const improveExperience = useCallback(async (payload: { agentId: string; conversationMemory: ConversationMemory; analysis?: Record<string, unknown> }): Promise<CopilotImprovements> => {
    return await improveExperienceMutation.mutateAsync(payload);
  }, [improveExperienceMutation]);

  return {
    // acciones
    chat,
    generateResponse,
    analyzeConversation,
    optimizeResponse,
    strategySuggestions,
    quickResponse,
    improveExperience,

    // estados de carga/errores por acción
    isChatLoading: chatMutation.isPending,
    isGenerateLoading: generateResponseMutation.isPending,
    isAnalyzeLoading: analyzeConversationMutation.isPending,
    isOptimizeLoading: optimizeResponseMutation.isPending,
    isStrategyLoading: strategySuggestionsMutation.isPending,
    isQuickLoading: quickResponseMutation.isPending,
    isImproveLoading: improveExperienceMutation.isPending,

    chatError: chatMutation.error,
    generateError: generateResponseMutation.error,
    analyzeError: analyzeConversationMutation.error,
    optimizeError: optimizeResponseMutation.error,
    strategyError: strategySuggestionsMutation.error,
    quickError: quickResponseMutation.error,
    improveError: improveExperienceMutation.error,
  };
};


