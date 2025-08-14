import React, { useState } from 'react';
import { X, Search, Filter } from 'lucide-react';
import type { ClientFilters, ClientStage, ClientStatus, ClientSource, ClientSegment, ClientTag } from '../../../types/client';

interface ClientFiltersComponentProps {
  filters: ClientFilters;
  filterOptions: {
    stages: readonly { readonly value: ClientStage; readonly label: string }[];
    statuses: readonly { readonly value: ClientStatus; readonly label: string }[];
    sources: readonly { readonly value: ClientSource; readonly label: string }[];
    segments: readonly { readonly value: ClientSegment; readonly label: string }[];
    tags: readonly { readonly value: ClientTag; readonly label: string }[];
    agents: readonly { readonly value: string; readonly label: string }[];
    sortOptions: readonly { readonly value: string; readonly label: string }[];
  };
  onStageChange: (stages: ClientStage[]) => void;
  onAgentChange: (agents: string[]) => void;
  onAIScoreChange: (min?: number, max?: number) => void;
  onValueChange: (min?: number, max?: number) => void;
  onProbabilityChange: (min?: number, max?: number) => void;
  onStatusChange: (statuses: ClientStatus[]) => void;
  onTagChange: (tags: ClientTag[]) => void;
  onSourceChange: (sources: ClientSource[]) => void;
  onSegmentChange: (segments: ClientSegment[]) => void;
  onDateChange: (after?: Date, before?: Date) => void;
  onSortingChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  onClose: () => void;
  activeFiltersSummary: string[];
}

export const ClientFiltersComponent: React.FC<ClientFiltersComponentProps> = ({
  filters,
  filterOptions,
  onStageChange,
  onAgentChange,
  onAIScoreChange,
  onValueChange,
  onProbabilityChange,
  onStatusChange,
  onTagChange,
  onSourceChange,
  onSegmentChange,
  onDateChange,
  onSortingChange,
  onClearFilters,
  onClose,
  activeFiltersSummary
}) => {
  const [quickSearch, setQuickSearch] = useState(filters.search || '');
  const [selectedStages, setSelectedStages] = useState<ClientStage[]>(filters.stages || []);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(filters.agents || []);
  const [selectedStatuses, setSelectedStatuses] = useState<ClientStatus[]>(filters.statuses || []);
  const [selectedTags, setSelectedTags] = useState<ClientTag[]>(filters.tags || []);
  const [selectedSources, setSelectedSources] = useState<ClientSource[]>(filters.sources || []);
  const [selectedSegments, setSelectedSegments] = useState<ClientSegment[]>(filters.segments || []);
  const [aiScoreRange, setAiScoreRange] = useState<{ min?: number; max?: number }>({
    min: filters.aiScoreMin,
    max: filters.aiScoreMax
  });
  const [valueRange, setValueRange] = useState<{ min?: number; max?: number }>({
    min: filters.valueMin,
    max: filters.valueMax
  });
  const [probabilityRange, setProbabilityRange] = useState<{ min?: number; max?: number }>({
    min: filters.probabilityMin,
    max: filters.probabilityMax
  });

  const handleQuickSearchChange = (value: string) => {
    setQuickSearch(value);
    // TODO: Implementar búsqueda en tiempo real
  };

  const handleStageToggle = (stage: ClientStage) => {
    const newStages = selectedStages.includes(stage)
      ? selectedStages.filter(s => s !== stage)
      : [...selectedStages, stage];
    setSelectedStages(newStages);
    onStageChange(newStages);
  };

  const handleAgentToggle = (agentId: string) => {
    const newAgents = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    setSelectedAgents(newAgents);
    onAgentChange(newAgents);
  };

  const handleStatusToggle = (status: ClientStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    onStatusChange(newStatuses);
  };

  const handleTagToggle = (tag: ClientTag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onTagChange(newTags);
  };

  const handleSourceToggle = (source: ClientSource) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter(s => s !== source)
      : [...selectedSources, source];
    setSelectedSources(newSources);
    onSourceChange(newSources);
  };

  const handleSegmentToggle = (segment: ClientSegment) => {
    const newSegments = selectedSegments.includes(segment)
      ? selectedSegments.filter(s => s !== segment)
      : [...selectedSegments, segment];
    setSelectedSegments(newSegments);
    onSegmentChange(newSegments);
  };

  const handleAIScoreChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = { ...aiScoreRange, [type]: numValue };
    setAiScoreRange(newRange);
    onAIScoreChange(newRange.min, newRange.max);
  };

  const handleValueChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = { ...valueRange, [type]: numValue };
    setValueRange(newRange);
    onValueChange(newRange.min, newRange.max);
  };

  const handleProbabilityChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = { ...probabilityRange, [type]: numValue };
    setProbabilityRange(newRange);
    onProbabilityChange(newRange.min, newRange.max);
  };

  const handleDateChange = (type: 'after' | 'before', value: string) => {
    const dateValue = value === '' ? undefined : new Date(value);
    if (type === 'after') {
      onDateChange(dateValue, filters.createdBefore);
    } else {
      onDateChange(filters.createdAfter, dateValue);
    }
  };

  const handleSortingChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onSortingChange(sortBy, sortOrder);
  };

  const handleReset = () => {
    setQuickSearch('');
    setSelectedStages([]);
    setSelectedAgents([]);
    setSelectedStatuses([]);
    setSelectedTags([]);
    setSelectedSources([]);
    setSelectedSegments([]);
    setAiScoreRange({});
    setValueRange({});
    setProbabilityRange({});
    onClearFilters();
  };

  const hasActiveFilters = selectedStages.length > 0 || 
    selectedAgents.length > 0 || 
    selectedStatuses.length > 0 || 
    selectedTags.length > 0 || 
    selectedSources.length > 0 || 
    selectedSegments.length > 0 ||
    aiScoreRange.min !== undefined || 
    aiScoreRange.max !== undefined ||
    valueRange.min !== undefined || 
    valueRange.max !== undefined ||
    probabilityRange.min !== undefined || 
    probabilityRange.max !== undefined ||
    quickSearch !== '';

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 shadow-lg z-50 lg:relative lg:z-auto overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros & Segmentos
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Búsqueda rápida */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda rápida
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Filtrar por nombre..."
              value={quickSearch}
              onChange={(e) => handleQuickSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Etapa */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Etapa
          </label>
          <div className="space-y-2">
            {filterOptions.stages.map((stage) => (
              <label key={stage.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage.value)}
                  onChange={() => handleStageToggle(stage.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{stage.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Agente */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Agente
          </label>
          <div className="space-y-2">
            {filterOptions.agents.map((agent) => (
              <label key={agent.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent.value)}
                  onChange={() => handleAgentToggle(agent.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{agent.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Score IA */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Score IA (0-100)
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                min="0"
                max="100"
                value={aiScoreRange.min || ''}
                onChange={(e) => handleAIScoreChange('min', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                min="0"
                max="100"
                value={aiScoreRange.max || ''}
                onChange={(e) => handleAIScoreChange('max', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={aiScoreRange.max || 50}
              onChange={(e) => handleAIScoreChange('max', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Valor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Valor ($)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={valueRange.min || ''}
              onChange={(e) => handleValueChange('min', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={valueRange.max || ''}
              onChange={(e) => handleValueChange('max', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Probabilidad */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Probabilidad (%)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              max="100"
              value={probabilityRange.min || ''}
              onChange={(e) => handleProbabilityChange('min', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              min="0"
              max="100"
              value={probabilityRange.max || ''}
              onChange={(e) => handleProbabilityChange('max', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Estado
          </label>
          <div className="space-y-2">
            {filterOptions.statuses.map((status) => (
              <label key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => handleStatusToggle(status.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Etiquetas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Etiquetas
          </label>
          <div className="space-y-2">
            {filterOptions.tags.map((tag) => (
              <label key={tag.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.value)}
                  onChange={() => handleTagToggle(tag.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{tag.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fuente */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fuente
          </label>
          <div className="space-y-2">
            {filterOptions.sources.map((source) => (
              <label key={source.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.value)}
                  onChange={() => handleSourceToggle(source.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{source.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Segmento */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Segmento
          </label>
          <div className="space-y-2">
            {filterOptions.segments.map((segment) => (
              <label key={segment.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSegments.includes(segment.value)}
                  onChange={() => handleSegmentToggle(segment.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{segment.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtros por fecha */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fecha de creación
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={filters.createdAfter?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('after', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={filters.createdBefore?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('before', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ordenar por
          </label>
          <div className="space-y-3">
            <select
              value={filters.sortBy || 'name'}
              onChange={(e) => handleSortingChange(e.target.value, filters.sortOrder || 'asc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSortingChange(filters.sortBy || 'name', 'asc')}
                className={`flex-1 px-3 py-2 text-sm rounded-md ${
                  filters.sortOrder === 'asc' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ascendente
              </button>
              <button
                onClick={() => handleSortingChange(filters.sortBy || 'name', 'desc')}
                className={`flex-1 px-3 py-2 text-sm rounded-md ${
                  filters.sortOrder === 'desc' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Descendente
              </button>
            </div>
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Filtros activos:</h4>
            <div className="flex flex-wrap gap-1">
              {activeFiltersSummary.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botón restablecer */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}; 