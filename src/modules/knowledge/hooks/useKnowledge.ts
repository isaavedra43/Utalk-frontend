// Hook para manejar base de conocimientos
// Simplificado sin react-query
import { useState, useEffect } from 'react'
import { Article } from '../types'
import { knowledgeService } from '../services/knowledgeService'

export function useKnowledge() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadArticles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await knowledgeService.getArticles()
      if (result.success) {
        setArticles(result.data)
      } else {
        setError(result.error || 'Error al cargar artículos')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  return {
    articles,
    loading,
    error,
    refetch: loadArticles
  }
} 