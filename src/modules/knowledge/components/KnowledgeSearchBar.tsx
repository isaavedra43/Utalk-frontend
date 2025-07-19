// 🔍 BARRA DE BÚSQUEDA - Centro de Conocimiento
// Búsqueda inteligente con sugerencias y filtros rápidos

import React, { useState, useRef, useEffect } from 'react'
import { Search, Mic, Filter, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface KnowledgeSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isLoading?: boolean
  showSuggestions?: boolean
  recentSearches?: string[]
  popularSearches?: string[]
  onVoiceSearch?: () => void
}

/**
 * 🎯 BARRA DE BÚSQUEDA AVANZADA
 */
export function KnowledgeSearchBar({
  value,
  onChange,
  placeholder = "Buscar documentos, FAQs, cursos...",
  isLoading = false,
  showSuggestions = true,
  recentSearches = [],
  popularSearches = [],
  onVoiceSearch
}: KnowledgeSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ✅ SUGERENCIAS PREDETERMINADAS
  const defaultSuggestions = [
    "Configuración de productos",
    "Manual de procedimientos",
    "Políticas de la empresa",
    "Plantillas de contratos",
    "Capacitación de ventas",
    "Resolución de problemas técnicos"
  ]

  // ✅ BÚSQUEDAS POPULARES PREDETERMINADAS
  const defaultPopularSearches = [
    "Manual usuario",
    "Configuración",
    "Políticas",
    "Plantillas",
    "FAQ técnico",
    "Capacitación"
  ]

  const popularItems = popularSearches.length > 0 ? popularSearches : defaultPopularSearches
  const recentItems = recentSearches.length > 0 ? recentSearches : []

  // ✅ CERRAR SUGERENCIAS AL HACER CLICK FUERA
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestionsPanel(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // ✅ MANEJAR CAMBIO DE TEXTO
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Mostrar sugerencias si hay texto o está enfocado
    if (showSuggestions && (newValue.length > 0 || isFocused)) {
      setShowSuggestionsPanel(true)
    }
  }

  // ✅ MANEJAR FOCUS
  const handleFocus = () => {
    setIsFocused(true)
    if (showSuggestions) {
      setShowSuggestionsPanel(true)
    }
  }

  // ✅ MANEJAR BÚSQUEDA POR VOZ
  const handleVoiceSearch = () => {
    if (!onVoiceSearch) return
    
    setIsListening(true)
    onVoiceSearch()
    
    // Simular fin de grabación después de 3 segundos
    setTimeout(() => {
      setIsListening(false)
    }, 3000)
  }

  // ✅ SELECCIONAR SUGERENCIA
  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestionsPanel(false)
    setIsFocused(false)
    inputRef.current?.blur()
  }

  // ✅ LIMPIAR BÚSQUEDA
  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  // ✅ FILTRAR SUGERENCIAS BASADAS EN EL TEXTO
  const filteredSuggestions = defaultSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5)

  // ✅ MANEJAR TECLAS
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestionsPanel(false)
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      
      {/* 🔍 BARRA DE BÚSQUEDA PRINCIPAL */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''} text-gray-400`} />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pl-10 pr-20 py-3 text-base transition-all duration-200 ${
            isFocused 
              ? 'ring-2 ring-blue-500 border-blue-500' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          {/* Botón limpiar */}
          {value && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Botón búsqueda por voz */}
          {onVoiceSearch && (
            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              disabled={isListening}
            >
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* 💡 PANEL DE SUGERENCIAS */}
      {showSuggestionsPanel && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg">
          <div className="p-4 space-y-4">
            
            {/* Sugerencias basadas en texto */}
            {value && filteredSuggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Sugerencias
                </h4>
                <div className="space-y-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Búsquedas recientes */}
            {!value && recentItems.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Búsquedas recientes
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentItems.slice(0, 6).map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => handleSelectSuggestion(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Búsquedas populares */}
            {!value && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Búsquedas populares
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularItems.slice(0, 8).map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900 dark:hover:border-blue-600"
                      onClick={() => handleSelectSuggestion(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Consejos de búsqueda */}
            {!value && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  💡 Consejos de búsqueda
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• Usa palabras clave específicas como "manual", "tutorial", "configuración"</p>
                  <p>• Filtra por tipo de archivo: "PDF configuración" o "video tutorial"</p>
                  <p>• Busca por categoría: "ventas", "soporte", "productos"</p>
                </div>
              </div>
            )}

          </div>
        </Card>
      )}

      {/* 🎤 INDICADOR DE BÚSQUEDA POR VOZ */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <Card className="p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Escuchando... Habla ahora
              </span>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}

export default KnowledgeSearchBar 