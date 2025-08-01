// Tipos específicos del módulo de conocimiento
// Extiende los tipos base compartidos

import { KnowledgeDocument, DocumentStatus, DocumentType, DocumentFilters } from '@/types/shared'

// Tipos específicos del módulo que no están en shared
export interface KnowledgeCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  children?: KnowledgeCategory[]
  articleCount: number
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeSearchResult {
  documents: KnowledgeDocument[]
  total: number
  query: string
  filters: DocumentFilters
  searchTime: number
}

export interface KnowledgeAnalytics {
  totalDocuments: number
  totalViews: number
  popularCategories: Array<{
    category: string
    viewCount: number
  }>
  recentSearches: string[]
  period: 'day' | 'week' | 'month'
}

// Re-exportar tipos compartidos para compatibilidad
export type { KnowledgeDocument, DocumentStatus, DocumentType, DocumentFilters } 