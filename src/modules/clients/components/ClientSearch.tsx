import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, User, Building, Mail } from 'lucide-react';
import type { Client } from '../../../types/client';

interface ClientSearchProps {
  value: string;
  onSearch: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  clients?: Client[];
  loading?: boolean;
  disabled?: boolean;
}

interface SearchSuggestion {
  type: 'client' | 'company' | 'email';
  value: string;
  display: string;
  client?: Client;
}

export const ClientSearch: React.FC<ClientSearchProps> = ({
  value,
  onSearch,
  onClear,
  placeholder = "Buscar clientes, empresas...",
  clients = [],
  loading = false,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generar sugerencias basadas en el valor de búsqueda (ULTRA OPTIMIZADO)
  useEffect(() => {
    // Evitar re-renders durante la generación de sugerencias
    if (!value.trim() || value.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const searchTerm = value.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // Buscar en nombres de clientes solo si hay clientes
    if (clients && clients.length > 0) {
      clients.forEach(client => {
        // Verificar que el cliente tenga las propiedades necesarias
        if (!client || typeof client.name !== 'string') return;

        if (client.name.toLowerCase().includes(searchTerm)) {
          newSuggestions.push({
            type: 'client',
            value: client.name,
            display: `${client.name} - ${client.company || ''}`,
            client
          });
        }

        // Buscar en nombres de empresas
        if (client.company && client.company.toLowerCase().includes(searchTerm)) {
          newSuggestions.push({
            type: 'company',
            value: client.company,
            display: `${client.company} (${client.name})`,
            client
          });
        }

        // Buscar en emails
        if (client.email && client.email.toLowerCase().includes(searchTerm)) {
          newSuggestions.push({
            type: 'email',
            value: client.email,
            display: `${client.email} - ${client.name}`,
            client
          });
        }
      });
    }

    // Eliminar duplicados y limitar a 8 sugerencias
    const uniqueSuggestions = newSuggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.value === suggestion.value)
    ).slice(0, 8);

    // Solo actualizar si las sugerencias han cambiado realmente
    setSuggestions(prev => {
      if (prev.length !== uniqueSuggestions.length) return uniqueSuggestions;
      const hasChanged = prev.some((prevSugg, index) => 
        prevSugg.value !== uniqueSuggestions[index]?.value
      );
      return hasChanged ? uniqueSuggestions : prev;
    });
    setSelectedIndex(-1);
  }, [value, clients]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    onSearch(suggestion.value);
    setIsFocused(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Enfocar el input después de la selección
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onSearch]);

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          } else {
            onSearch(value);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          setSuggestions([]);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, suggestions, selectedIndex, value, onSearch, handleSuggestionSelect]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
   
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onSearch(newValue);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    // Delay para permitir clics en sugerencias
    setTimeout(() => {
      setIsFocused(false);
      setSuggestions([]);
      setSelectedIndex(-1);
    }, 200);
  };



  const handleClear = () => {
    onClear();
    setIsFocused(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Enfocar el input después de limpiar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'client':
        return <User className="h-4 w-4 text-gray-400" />;
      case 'company':
        return <Building className="h-4 w-4 text-gray-400" />;
      case 'email':
        return <Mail className="h-4 w-4 text-gray-400" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'client':
        return 'text-blue-600';
      case 'company':
        return 'text-green-600';
      case 'email':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Sugerencias */}
      {isFocused && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto no-scrollbar"
        >
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                  index === selectedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${getSuggestionColor(suggestion.type)}`}>
                    {suggestion.display}
                  </div>
                  {suggestion.client && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.client.email}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {suggestion.type === 'client' && 'Cliente'}
                  {suggestion.type === 'company' && 'Empresa'}
                  {suggestion.type === 'email' && 'Email'}
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer con información */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Usa ↑↓ para navegar, Enter para seleccionar</span>
              <span>{suggestions.length} resultado{suggestions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Estado de búsqueda reciente */}
      {isFocused && !value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
              <Clock className="h-4 w-4" />
              <span>Búsquedas recientes</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onSearch('Gabriela Vega')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Gabriela Vega
              </button>
              <button
                onClick={() => onSearch('TechAdvantage')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                TechAdvantage
              </button>
              <button
                onClick={() => onSearch('won')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Clientes ganados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 