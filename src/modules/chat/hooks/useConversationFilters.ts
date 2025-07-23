// Hook para manejar filtros de conversación sincronizados con URL
// Permite compartir filtros y mantener estado en navegación
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConversationFilter } from '../types'

export function useConversationFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ConversationFilter>({})

  // Extraer filtros de URL al inicializar
  useEffect(() => {
    const urlFilters: ConversationFilter = {}
    
    // Estado
    const status = searchParams.get('status')
    if (status) urlFilters.status = status as any
    
    // Canal
    const channel = searchParams.get('channel')
    if (channel) urlFilters.channel = channel as any
    
    // Asignado
    const assignedTo = searchParams.get('assignedTo')
    if (assignedTo) urlFilters.assignedTo = assignedTo
    
    // Búsqueda
    const search = searchParams.get('search')
    if (search) urlFilters.search = search
    
    // Solo no leídas
    const unreadOnly = searchParams.get('unreadOnly')
    if (unreadOnly) urlFilters.unreadOnly = unreadOnly === 'true'
    
    // Tags
    const tags = searchParams.get('tags')
    if (tags) urlFilters.tags = tags.split(',')
    
    setFilters(urlFilters)
  }, [searchParams])

  // Actualizar filtros y sincronizar con URL
  const updateFilters = useCallback((newFilters: ConversationFilter) => {
    setFilters(newFilters)
    
    // Actualizar URL params
    const newSearchParams = new URLSearchParams()
    
    if (newFilters.status) newSearchParams.set('status', newFilters.status)
    if (newFilters.channel) newSearchParams.set('channel', newFilters.channel)
    if (newFilters.assignedTo) newSearchParams.set('assignedTo', newFilters.assignedTo)
    if (newFilters.search) newSearchParams.set('search', newFilters.search)
    if (newFilters.unreadOnly) newSearchParams.set('unreadOnly', 'true')
    if (newFilters.tags?.length) newSearchParams.set('tags', newFilters.tags.join(','))
    
    setSearchParams(newSearchParams, { replace: true })
  }, [setSearchParams])

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  // Actualizar filtro específico
  const updateFilter = useCallback((key: keyof ConversationFilter, value: any) => {
    const newFilters = { ...filters }
    
    if (value === undefined || value === null || value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    
    updateFilters(newFilters)
  }, [filters, updateFilters])

  return {
    filters,
    updateFilters,
    updateFilter,
    clearFilters
  }
} 