// 🎣 HOOKS DE CAMPAÑAS - UTalk Frontend
// Gestión de estado para campañas con React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import type { 
  Campaign,
  CampaignFilters,
  CampaignResponse
} from '../types'
import { campaignService } from '../services/campaignService'

/**
 * 🎯 HOOK PRINCIPAL DE CAMPAÑAS
 */
export function useCampaigns(initialFilters?: CampaignFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<CampaignFilters>(initialFilters || {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // ✅ OBTENER CAMPAÑAS
  const {
    data: campaignsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => campaignService.getCampaigns(filters),
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false
  })

  const campaigns = campaignsData?.campaigns || []
  const total = campaignsData?.total || 0
  const hasMore = campaigns.length < total

  // ✅ CREAR CAMPAÑA
  const createCampaignMutation = useMutation({
    mutationFn: campaignService.createCampaign,
    onSuccess: (response: CampaignResponse) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.setQueryData(['campaign', response.campaign?.id], response.campaign)
      }
    }
  })

  // ✅ ACTUALIZAR CAMPAÑA
  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Campaign> }) =>
      campaignService.updateCampaign(id, updates),
    onSuccess: (response: CampaignResponse, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.setQueryData(['campaign', variables.id], response.campaign)
      }
    }
  })

  // ✅ ELIMINAR CAMPAÑA
  const deleteCampaignMutation = useMutation({
    mutationFn: campaignService.deleteCampaign,
    onSuccess: (response: { success: boolean; error?: string }, campaignId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.removeQueries({ queryKey: ['campaign', campaignId] })
      }
    }
  })

  // ✅ CLONAR CAMPAÑA
  const cloneCampaignMutation = useMutation({
    mutationFn: campaignService.cloneCampaign,
    onSuccess: (response: CampaignResponse) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }
    }
  })

  // ✅ ENVIAR CAMPAÑA
  const sendCampaignMutation = useMutation({
    mutationFn: campaignService.sendCampaign,
    onSuccess: (response: { success: boolean; error?: string }, campaignId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      }
    }
  })

  // ✅ PAUSAR/REANUDAR CAMPAÑA
  const pauseCampaignMutation = useMutation({
    mutationFn: campaignService.pauseCampaign,
    onSuccess: (response: { success: boolean; error?: string }, campaignId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      }
    }
  })

  const resumeCampaignMutation = useMutation({
    mutationFn: campaignService.resumeCampaign,
    onSuccess: (response: { success: boolean; error?: string }, campaignId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      }
    }
  })

  // ✅ CANCELAR CAMPAÑA
  const cancelCampaignMutation = useMutation({
    mutationFn: campaignService.cancelCampaign,
    onSuccess: (response: { success: boolean; error?: string }, campaignId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      }
    }
  })

  // ✅ FUNCIONES DE UTILIDAD
  const updateFilters = useCallback((newFilters: Partial<CampaignFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      updateFilters({ page: (filters.page || 1) + 1 })
    }
  }, [hasMore, isLoading, filters.page, updateFilters])

  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  // ✅ ACCIONES PRINCIPALES
  const createCampaign = useCallback(async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createCampaignMutation.mutateAsync(campaignData)
  }, [createCampaignMutation])

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    return updateCampaignMutation.mutateAsync({ id, updates })
  }, [updateCampaignMutation])

  const deleteCampaign = useCallback(async (id: string) => {
    return deleteCampaignMutation.mutateAsync(id)
  }, [deleteCampaignMutation])

  const cloneCampaign = useCallback(async (id: string, newName?: string) => {
    return cloneCampaignMutation.mutateAsync({ id, newName })
  }, [cloneCampaignMutation])

  const sendCampaign = useCallback(async (id: string) => {
    return sendCampaignMutation.mutateAsync(id)
  }, [sendCampaignMutation])

  const pauseCampaign = useCallback(async (id: string) => {
    return pauseCampaignMutation.mutateAsync(id)
  }, [pauseCampaignMutation])

  const resumeCampaign = useCallback(async (id: string) => {
    return resumeCampaignMutation.mutateAsync(id)
  }, [resumeCampaignMutation])

  const cancelCampaign = useCallback(async (id: string) => {
    return cancelCampaignMutation.mutateAsync(id)
  }, [cancelCampaignMutation])

  // ✅ ACCIONES EN LOTE
  const executeAction = useCallback(async (campaignIds: string[], action: any) => { // Changed CampaignAction to any as it's removed
    const results = await Promise.allSettled(
      campaignIds.map(id => {
        switch (action) {
          case 'delete':
            return deleteCampaign(id)
          case 'pause':
            return pauseCampaign(id)
          case 'resume':
            return resumeCampaign(id)
          case 'cancel':
            return cancelCampaign(id)
          case 'send':
            return sendCampaign(id)
          default:
            return Promise.reject(new Error(`Acción no soportada: ${action}`))
        }
      })
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    return { successful, failed, total: campaignIds.length }
  }, [deleteCampaign, pauseCampaign, resumeCampaign, cancelCampaign, sendCampaign])

  // ✅ ESTADO DE LOADING
  const isCreating = createCampaignMutation.isPending
  const isUpdating = updateCampaignMutation.isPending
  const isDeleting = deleteCampaignMutation.isPending
  const isCloning = cloneCampaignMutation.isPending
  const isSending = sendCampaignMutation.isPending
  const isPausing = pauseCampaignMutation.isPending
  const isResuming = resumeCampaignMutation.isPending
  const isCancelling = cancelCampaignMutation.isPending

  const isMutating = isCreating || isUpdating || isDeleting || isCloning || 
                   isSending || isPausing || isResuming || isCancelling

  return {
    // ✅ DATOS
    campaigns,
    total,
    hasMore,
    filters,

    // ✅ ESTADO
    isLoading,
    isError,
    error,
    isMutating,
    isCreating,
    isUpdating,
    isDeleting,
    isCloning,
    isSending,
    isPausing,
    isResuming,
    isCancelling,

    // ✅ ACCIONES
    createCampaign,
    updateCampaign,
    deleteCampaign,
    cloneCampaign,
    sendCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    executeAction,

    // ✅ UTILIDADES
    updateFilters,
    resetFilters,
    loadMore,
    refresh
  }
}

/**
 * 🎯 HOOK PARA CAMPAÑA INDIVIDUAL
 */
export function useCampaign(campaignId: string) {
  const queryClient = useQueryClient()

  const {
    data: campaignData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignService.getCampaign(campaignId),
    enabled: !!campaignId,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false
  })

  const campaign = campaignData?.campaign

  // ✅ ACTUALIZAR CAMPAÑA
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Campaign>) =>
      campaignService.updateCampaign(campaignId, updates),
    onSuccess: (response: CampaignResponse) => {
      if (response.success) {
        queryClient.setQueryData(['campaign', campaignId], response.campaign)
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }
    }
  })

  const updateCampaign = useCallback(async (updates: Partial<Campaign>) => {
    return updateMutation.mutateAsync(updates)
  }, [updateMutation])

  return {
    campaign,
    isLoading,
    isError,
    error,
    isUpdating: updateMutation.isPending,
    updateCampaign,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA ESTADÍSTICAS EN TIEMPO REAL
 */
export function useCampaignStats(campaignId: string, interval = 30000) {
  const {
    data: statsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: () => campaignService.getCampaignStats(campaignId),
    enabled: !!campaignId,
    refetchInterval: interval,
    refetchOnWindowFocus: true
  })

  return {
    stats: statsData?.stats,
    isLoading,
    error
  }
} 