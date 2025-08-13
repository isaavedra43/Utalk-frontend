import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { NotificationSettings, AISuggestion, CopilotState } from '../types';
import { sidebarService, mockClientProfile, mockConversationDetails, mockNotificationSettings, mockAISuggestions } from '../services/sidebar';

export const useSidebar = (conversationId: string | null) => {
  const [copilotState, setCopilotState] = useState<CopilotState>({
    isMockMode: true,
    activeTab: 'suggestions',
    suggestions: [],
    chatHistory: [],
    isLoading: false
  });

  // Query para obtener perfil del cliente
  const {
    data: clientProfile,
    isLoading: isLoadingClientProfile
  } = useQuery({
    queryKey: ['client-profile', conversationId],
    queryFn: () => conversationId ? sidebarService.getClientProfile(conversationId) : Promise.resolve(mockClientProfile),
    initialData: mockClientProfile,
    enabled: !!conversationId,
    staleTime: 30000
  });

  // Query para obtener detalles de la conversación
  const {
    data: conversationDetails,
    isLoading: isLoadingConversationDetails
  } = useQuery({
    queryKey: ['conversation-details', conversationId],
    queryFn: () => conversationId ? sidebarService.getConversationDetails(conversationId) : Promise.resolve(mockConversationDetails),
    initialData: mockConversationDetails,
    enabled: !!conversationId,
    staleTime: 30000
  });

  // Query para obtener configuración de notificaciones
  const {
    data: notificationSettings,
    isLoading: isLoadingNotificationSettings
  } = useQuery({
    queryKey: ['notification-settings', conversationId],
    queryFn: () => conversationId ? sidebarService.getNotificationSettings(conversationId) : Promise.resolve(mockNotificationSettings),
    initialData: mockNotificationSettings,
    enabled: !!conversationId,
    staleTime: 30000
  });

  // Query para obtener sugerencias de IA
  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions
  } = useQuery({
    queryKey: ['ai-suggestions', conversationId],
    queryFn: () => conversationId ? sidebarService.getAISuggestions(conversationId) : Promise.resolve(mockAISuggestions),
    initialData: mockAISuggestions,
    enabled: !!conversationId,
    staleTime: 10000
  });

  // Mutation para actualizar configuración de notificaciones
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: ({ conversationId, settings }: { conversationId: string; settings: Partial<NotificationSettings> }) =>
      sidebarService.updateNotificationSettings(conversationId, settings),
    onSuccess: () => {
      // Refetch para obtener datos actualizados
      // queryClient.invalidateQueries(['notification-settings', conversationId]);
    }
  });

  // Mutation para generar sugerencia de IA
  const generateAISuggestionMutation = useMutation({
    mutationFn: ({ conversationId, context }: { conversationId: string; context?: string }) =>
      sidebarService.generateAISuggestion(conversationId, context),
    onSuccess: (newSuggestion) => {
      setCopilotState(prev => ({
        ...prev,
        suggestions: [newSuggestion, ...prev.suggestions]
      }));
    }
  });

  // Función para actualizar configuración de notificaciones
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    if (!conversationId) return;

    try {
      await updateNotificationSettingsMutation.mutateAsync({ conversationId, settings });
    } catch (error) {
      console.error('Error actualizando configuración de notificaciones:', error);
    }
  }, [conversationId, updateNotificationSettingsMutation]);

  // Función para generar sugerencia de IA
  const generateAISuggestion = useCallback(async (context?: string) => {
    if (!conversationId) return;

    try {
      setCopilotState(prev => ({ ...prev, isLoading: true }));
      await generateAISuggestionMutation.mutateAsync({ conversationId, context });
    } catch (error) {
      console.error('Error generando sugerencia de IA:', error);
    } finally {
      setCopilotState(prev => ({ ...prev, isLoading: false }));
    }
  }, [conversationId, generateAISuggestionMutation]);

  // Función para cambiar tab del copilot
  const setCopilotTab = useCallback((tab: 'suggestions' | 'chat') => {
    setCopilotState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Función para copiar sugerencia
  const copySuggestion = useCallback((suggestion: AISuggestion) => {
    navigator.clipboard.writeText(suggestion.content);
  }, []);

  // Función para mejorar sugerencia
  const improveSuggestion = useCallback(async (suggestionId: string) => {
    if (!conversationId) return;

    try {
      await generateAISuggestion(`Mejora esta sugerencia: ${aiSuggestions?.find(s => s.id === suggestionId)?.content}`);
    } catch (error) {
      console.error('Error mejorando sugerencia:', error);
    }
  }, [conversationId, aiSuggestions, generateAISuggestion]);

  return {
    // Datos
    clientProfile,
    conversationDetails,
    notificationSettings,
    aiSuggestions,
    copilotState,
    
    // Estados de loading
    isLoadingClientProfile,
    isLoadingConversationDetails,
    isLoadingNotificationSettings,
    isLoadingAISuggestions,
    
    // Acciones
    updateNotificationSettings,
    generateAISuggestion,
    setCopilotTab,
    copySuggestion,
    improveSuggestion,
    
    // Estados de mutaciones
    isUpdatingNotifications: updateNotificationSettingsMutation.isPending,
    isGeneratingSuggestion: generateAISuggestionMutation.isPending
  };
}; 