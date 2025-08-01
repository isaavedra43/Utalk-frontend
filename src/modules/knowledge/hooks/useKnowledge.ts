// Hook para manejar base de conocimientos
// Simplificado sin react-query
import { useState, useEffect } from 'react'
import { KnowledgeDocument } from '../types'
import { knowledgeService } from '../services/knowledgeService'

export function useKnowledge() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await knowledgeService.searchDocuments('', undefined, 'date', 1, 20)
      if (result.success) {
        setDocuments(result.data)
      } else {
        setError('Error al cargar documentos')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  return {
    documents,
    loading,
    error,
    refetch: loadDocuments
  }
} 