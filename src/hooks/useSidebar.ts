import { useState, useCallback } from 'react';
import { infoLog } from '../config/logger';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { NotificationSettings } from '../types';
import { sidebarService } from '../services/sidebar';

export const useSidebar = (conversationId: string | null) => {
  const [copilotTab, setCopilotTab] = useState<'suggestions' | 'chat'>('suggestions');

  // Query para perfil del cliente
  const {
    data: clientProfile,
    isLoading: isLoadingClientProfile
  } = useQuery({
    queryKey: ['client-profile', conversationId],
    queryFn: () => conversationId ? sidebarService.getClientProfile(conversationId) : Promise.resolve(null),
    enabled: !!conversationId,
    staleTime: 30000
  });

  // Query para detalles de conversación
  const {
    data: conversationDetails,
    isLoading: isLoadingConversationDetails
  } = useQuery({
    queryKey: ['conversation-details', conversationId],
    queryFn: () => conversationId ? sidebarService.getConversationDetails(conversationId) : Promise.resolve(null),
    enabled: !!conversationId,
    staleTime: 30000
  });

  // Query para configuraciones de notificación
  const {
    data: notificationSettings,
    isLoading: isLoadingNotificationSettings,
    refetch: refetchNotificationSettings
  } = useQuery({
    queryKey: ['notification-settings', conversationId],
    queryFn: () => conversationId ? sidebarService.getNotificationSettings(conversationId) : Promise.resolve(null),
    enabled: !!conversationId,
    staleTime: 30000
  });

  // Query para sugerencias de IA
  const {
    data: aiSuggestions,
    isLoading: isLoadingAISuggestions,
    refetch: refetchAISuggestions
  } = useQuery({
    queryKey: ['ai-suggestions', conversationId],
    queryFn: () => conversationId ? sidebarService.getAISuggestions(conversationId) : Promise.resolve([]),
    enabled: !!conversationId,
    staleTime: 10000
  });

  // Mutation para actualizar configuraciones de notificación
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: ({ conversationId, settings }: { conversationId: string; settings: Partial<NotificationSettings> }) =>
      sidebarService.updateNotificationSettings(conversationId, settings),
    onSuccess: () => {
      refetchNotificationSettings();
    }
  });

  // Mutation para generar sugerencia
  const generateAISuggestionMutation = useMutation({
    mutationFn: ({ conversationId, context }: { conversationId: string; context?: string }) =>
      sidebarService.generateAISuggestion(conversationId, context),
    onSuccess: () => {
      refetchAISuggestions();
    }
  });

  // Función para actualizar configuraciones de notificación
  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    if (!conversationId) return;

    try {
      await updateNotificationSettingsMutation.mutateAsync({ conversationId, settings });
    } catch (error) {
      infoLog('Error actualizando configuraciones:', error);
    }
  }, [conversationId, updateNotificationSettingsMutation]);

  // Función para copiar sugerencia
  const copySuggestion = useCallback((suggestionId: string) => {
    // Implementación simple para copiar al portapapeles
    const suggestion = aiSuggestions?.find(s => s.id === suggestionId);
    if (suggestion) {
      navigator.clipboard.writeText(suggestion.content);
      infoLog('Sugerencia copiada al portapapeles');
    }
  }, [aiSuggestions]);

  // Función para mejorar sugerencia
  const improveSuggestion = useCallback(async (suggestionId: string) => {
    if (!conversationId) return;

    try {
      const suggestion = aiSuggestions?.find(s => s.id === suggestionId);
      if (suggestion) {
        await generateAISuggestionMutation.mutateAsync({ 
          conversationId, 
          context: `Mejora esta sugerencia: ${suggestion.content}` 
        });
      }
    } catch (error) {
      infoLog('Error mejorando sugerencia:', error);
    }
  }, [conversationId, aiSuggestions, generateAISuggestionMutation]);

  // Función para generar sugerencia de IA
  const generateAISuggestion = useCallback(async (context?: string) => {
    if (!conversationId) return;

    try {
      await generateAISuggestionMutation.mutateAsync({ conversationId, context });
    } catch (error) {
      infoLog('Error generando sugerencia:', error);
    }
  }, [conversationId, generateAISuggestionMutation]);

  // Estado del copilot
  const copilotState = {
    tab: copilotTab,
    isGenerating: generateAISuggestionMutation.isPending
  };

  return {
    // Datos del cliente y conversación
    clientProfile: clientProfile || null,
    conversationDetails: conversationDetails || null,
    notificationSettings: notificationSettings || null,
    aiSuggestions: aiSuggestions || [],
    copilotState,
    
    // Estados de carga
    isLoadingClientProfile,
    isLoadingConversationDetails,
    isLoadingNotificationSettings,
    isLoadingAISuggestions,
    
    // Acciones
    updateNotificationSettings,
    setCopilotTab,
    copySuggestion,
    improveSuggestion,
    generateAISuggestion,
    
    // Estados de mutaciones
    isUpdatingNotifications: updateNotificationSettingsMutation.isPending,
    isGeneratingSuggestion: generateAISuggestionMutation.isPending
  };
}; 