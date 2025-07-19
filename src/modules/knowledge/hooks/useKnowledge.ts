// 🎣 HOOK PRINCIPAL - Centro de Conocimiento
// Maneja el estado global de documentos, FAQs y cursos con React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import type { 
  KnowledgeDocument,
  KnowledgeFAQ,
  KnowledgeCourse,
  KnowledgeFilters,
  KnowledgeDocumentsResponse,
  KnowledgeDocumentResponse,
  KnowledgeFAQsResponse,
  KnowledgeCoursesResponse,
  KnowledgeAction 
} from '../types'
import { knowledgeService } from '../services/knowledgeService'

/**
 * 🎯 HOOK PRINCIPAL DE DOCUMENTOS
 */
export function useKnowledgeDocuments(initialFilters?: KnowledgeFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<KnowledgeFilters>(initialFilters || {
    page: 1,
    limit: 12,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // ✅ CONSULTAR DOCUMENTOS
  const {
    data: documentsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['knowledge-documents', filters],
    queryFn: () => knowledgeService.getDocuments(filters),
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false
  })

  const documents = documentsData?.documents || []
  const total = documentsData?.total || 0
  const hasMore = documents.length < total

  // ✅ CREAR DOCUMENTO
  const createDocumentMutation = useMutation({
    mutationFn: knowledgeService.createDocument,
    onSuccess: (response: KnowledgeDocumentResponse) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
        queryClient.setQueryData(['knowledge-document', response.document?.id], response.document)
      }
    }
  })

  // ✅ ACTUALIZAR DOCUMENTO
  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<KnowledgeDocument> }) =>
      knowledgeService.updateDocument(id, updates),
    onSuccess: (response: KnowledgeDocumentResponse, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
        queryClient.setQueryData(['knowledge-document', variables.id], response.document)
      }
    }
  })

  // ✅ ELIMINAR DOCUMENTO
  const deleteDocumentMutation = useMutation({
    mutationFn: knowledgeService.deleteDocument,
    onSuccess: (response: { success: boolean; error?: string }, documentId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
        queryClient.removeQueries({ queryKey: ['knowledge-document', documentId] })
      }
    }
  })

  // ✅ MARCAR COMO FAVORITO
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string, isFavorite: boolean }) =>
      knowledgeService.toggleFavorite(id, isFavorite),
    onSuccess: (response: { success: boolean; error?: string }, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
        queryClient.invalidateQueries({ queryKey: ['knowledge-document', variables.id] })
      }
    }
  })

  // ✅ REGISTRAR VISTA
  const viewDocumentMutation = useMutation({
    mutationFn: knowledgeService.viewDocument,
    onSuccess: (response: { success: boolean; error?: string }, documentId: string) => {
      if (response.success) {
        // Actualizar contadores sin invalidar toda la query
        queryClient.setQueryData(['knowledge-documents', filters], (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            documents: oldData.documents.map((doc: KnowledgeDocument) =>
              doc.id === documentId 
                ? { ...doc, views: doc.views + 1 }
                : doc
            )
          }
        })
      }
    }
  })

  // ✅ FUNCIONES DE UTILIDAD
  const updateFilters = useCallback((newFilters: Partial<KnowledgeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'updatedAt',
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
  const createDocument = useCallback(async (documentData: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createDocumentMutation.mutateAsync(documentData)
  }, [createDocumentMutation])

  const updateDocument = useCallback(async (id: string, updates: Partial<KnowledgeDocument>) => {
    return updateDocumentMutation.mutateAsync({ id, updates })
  }, [updateDocumentMutation])

  const deleteDocument = useCallback(async (id: string) => {
    return deleteDocumentMutation.mutateAsync(id)
  }, [deleteDocumentMutation])

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    return toggleFavoriteMutation.mutateAsync({ id, isFavorite })
  }, [toggleFavoriteMutation])

  const viewDocument = useCallback(async (id: string) => {
    return viewDocumentMutation.mutateAsync(id)
  }, [viewDocumentMutation])

  // ✅ ACCIONES EN LOTE
  const executeAction = useCallback(async (documentIds: string[], action: KnowledgeAction) => {
    const results = await Promise.allSettled(
      documentIds.map(id => {
        switch (action) {
          case 'delete':
            return deleteDocument(id)
          case 'favorite':
            return toggleFavorite(id, true)
          case 'archive':
            return updateDocument(id, { status: 'archived' })
          default:
            return Promise.reject(new Error(`Acción no soportada: ${action}`))
        }
      })
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    return { successful, failed, total: documentIds.length }
  }, [deleteDocument, toggleFavorite, updateDocument])

  // ✅ ESTADO DE LOADING
  const isCreating = createDocumentMutation.isPending
  const isUpdating = updateDocumentMutation.isPending
  const isDeleting = deleteDocumentMutation.isPending
  const isToggling = toggleFavoriteMutation.isPending
  const isViewing = viewDocumentMutation.isPending

  const isMutating = isCreating || isUpdating || isDeleting || isToggling || isViewing

  return {
    // ✅ DATOS
    documents,
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
    isToggling,
    isViewing,

    // ✅ ACCIONES
    createDocument,
    updateDocument,
    deleteDocument,
    toggleFavorite,
    viewDocument,
    executeAction,

    // ✅ UTILIDADES
    updateFilters,
    resetFilters,
    loadMore,
    refresh
  }
}

/**
 * 🎯 HOOK PARA DOCUMENTO INDIVIDUAL
 */
export function useKnowledgeDocument(documentId: string) {
  const queryClient = useQueryClient()

  const {
    data: documentData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['knowledge-document', documentId],
    queryFn: () => knowledgeService.getDocument(documentId),
    enabled: !!documentId,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false
  })

  const document = documentData?.document

  // ✅ ACTUALIZAR DOCUMENTO
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<KnowledgeDocument>) =>
      knowledgeService.updateDocument(documentId, updates),
    onSuccess: (response: KnowledgeDocumentResponse) => {
      if (response.success) {
        queryClient.setQueryData(['knowledge-document', documentId], response.document)
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
      }
    }
  })

  const updateDocument = useCallback(async (updates: Partial<KnowledgeDocument>) => {
    return updateMutation.mutateAsync(updates)
  }, [updateMutation])

  return {
    document,
    isLoading,
    isError,
    error,
    isUpdating: updateMutation.isPending,
    updateDocument,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA FAQs
 */
export function useKnowledgeFAQs(initialFilters?: KnowledgeFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<KnowledgeFilters>(initialFilters || {
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // ✅ CONSULTAR FAQs
  const {
    data: faqsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['knowledge-faqs', filters],
    queryFn: () => knowledgeService.getFAQs(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const faqs = faqsData?.faqs || []
  const total = faqsData?.total || 0

  // ✅ CREAR FAQ
  const createFAQMutation = useMutation({
    mutationFn: knowledgeService.createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-faqs'] })
    }
  })

  // ✅ ACTUALIZAR FAQ
  const updateFAQMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<KnowledgeFAQ> }) =>
      knowledgeService.updateFAQ(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-faqs'] })
    }
  })

  // ✅ MARCAR COMO ÚTIL
  const markHelpfulMutation = useMutation({
    mutationFn: ({ id, isHelpful }: { id: string, isHelpful: boolean }) =>
      knowledgeService.markFAQHelpful(id, isHelpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-faqs'] })
    }
  })

  const updateFilters = useCallback((newFilters: Partial<KnowledgeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const createFAQ = useCallback(async (faqData: Omit<KnowledgeFAQ, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createFAQMutation.mutateAsync(faqData)
  }, [createFAQMutation])

  const updateFAQ = useCallback(async (id: string, updates: Partial<KnowledgeFAQ>) => {
    return updateFAQMutation.mutateAsync({ id, updates })
  }, [updateFAQMutation])

  const markHelpful = useCallback(async (id: string, isHelpful: boolean) => {
    return markHelpfulMutation.mutateAsync({ id, isHelpful })
  }, [markHelpfulMutation])

  return {
    faqs,
    total,
    filters,
    isLoading,
    isError,
    error,
    isMutating: createFAQMutation.isPending || updateFAQMutation.isPending || markHelpfulMutation.isPending,
    createFAQ,
    updateFAQ,
    markHelpful,
    updateFilters,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA CURSOS
 */
export function useKnowledgeCourses(initialFilters?: KnowledgeFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<KnowledgeFilters>(initialFilters || {
    page: 1,
    limit: 12,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // ✅ CONSULTAR CURSOS
  const {
    data: coursesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['knowledge-courses', filters],
    queryFn: () => knowledgeService.getCourses(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const courses = coursesData?.courses || []
  const total = coursesData?.total || 0

  // ✅ INSCRIBIRSE EN CURSO
  const enrollCourseMutation = useMutation({
    mutationFn: knowledgeService.enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-progress'] })
    }
  })

  // ✅ COMPLETAR LECCIÓN
  const completeLessonMutation = useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string, lessonId: string }) =>
      knowledgeService.completeLesson(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-progress'] })
    }
  })

  const updateFilters = useCallback((newFilters: Partial<KnowledgeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const enrollInCourse = useCallback(async (courseId: string) => {
    return enrollCourseMutation.mutateAsync(courseId)
  }, [enrollCourseMutation])

  const completeLesson = useCallback(async (courseId: string, lessonId: string) => {
    return completeLessonMutation.mutateAsync({ courseId, lessonId })
  }, [completeLessonMutation])

  return {
    courses,
    total,
    filters,
    isLoading,
    isError,
    error,
    isMutating: enrollCourseMutation.isPending || completeLessonMutation.isPending,
    enrollInCourse,
    completeLesson,
    updateFilters,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA ESTADÍSTICAS
 */
export function useKnowledgeStats() {
  const {
    data: statsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: () => knowledgeService.getStats(),
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false
  })

  return {
    stats: statsData?.stats,
    isLoading,
    error
  }
}

/**
 * 🎯 HOOK PARA CATEGORÍAS
 */
export function useKnowledgeCategories() {
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => knowledgeService.getCategories(),
    staleTime: 300000, // 5 minutos
    refetchOnWindowFocus: false
  })

  return {
    categories: categoriesData?.categories || [],
    isLoading,
    error,
    refresh: refetch
  }
} 