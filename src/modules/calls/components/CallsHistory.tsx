import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Eye,
  MessageSquare,
  Tag,
  Clock,
  User,
  Building,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  FileText,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Avatar } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { ScrollArea } from '../../../components/ui/scroll-area';

import { Call, CallFilter } from '../../../types/calls';

interface CallsHistoryProps {
  calls: Call[];
  loading: boolean;
  searchQuery: string;
  filters: CallFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedCalls: string[];
  onSearch: (query: string) => void;
  onFilterChange: (filters: CallFilter[]) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onCallSelect: (callIds: string[]) => void;
}

export const CallsHistory: React.FC<CallsHistoryProps> = ({
  calls,
  loading,
  searchQuery,
  filters,
  sortBy,
  sortOrder,
  selectedCalls,
  onSearch,
  onFilterChange,
  onSortChange,
  onCallSelect
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);

  // Datos mock para el historial
  const mockCalls: Call[] = [
    {
      id: '1',
      direction: 'inbound',
      from: '+52 55 1234 5678',
      to: '+1 555 0123',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
      status: 'completed',
      queueId: '1',
      agentId: '1',
      recordingUrl: '/recordings/call-1.mp3',
      transcriptId: '1',
      sentiment: 'positive',
      dispositions: ['Venta realizada'],
      talkTime: 180,
      holdTime: 30,
      silenceTime: 15,
      cost: 0.15,
      contactId: '1',
      ticketId: 'TKT-001',
      transferHistory: [],
      tags: ['venta', 'nuevo-cliente'],
      notes: 'Cliente interesado en el producto premium. Se programó seguimiento.',
      qaScore: 85,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      direction: 'outbound',
      from: '+1 555 0123',
      to: '+52 55 9876 5432',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 2 * 60 * 1000),
      status: 'completed',
      queueId: '2',
      agentId: '2',
      recordingUrl: '/recordings/call-2.mp3',
      transcriptId: '2',
      sentiment: 'neutral',
      dispositions: ['Información enviada'],
      talkTime: 120,
      holdTime: 0,
      silenceTime: 10,
      cost: 0.10,
      contactId: '2',
      transferHistory: [],
      tags: ['soporte', 'técnico'],
      notes: 'Cliente con problema técnico. Se envió documentación.',
      qaScore: 78,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: '3',
      direction: 'inbound',
      from: '+52 55 1111 2222',
      to: '+1 555 0123',
      startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 6 * 60 * 60 * 1000 + 5 * 60 * 1000),
      status: 'completed',
      queueId: '3',
      agentId: '3',
      recordingUrl: '/recordings/call-3.mp3',
      transcriptId: '3',
      sentiment: 'positive',
      dispositions: ['Callback solicitado'],
      talkTime: 300,
      holdTime: 60,
      silenceTime: 20,
      cost: 0.25,
      contactId: '3',
      transferHistory: [
        {
          id: '1',
          type: 'warm',
          fromAgentId: '3',
          toAgentId: '4',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000 + 2 * 60 * 1000),
          reason: 'Escalamiento a supervisor'
        }
      ],
      tags: ['vip', 'escalamiento'],
      notes: 'Cliente VIP con consulta compleja. Transferido a supervisor.',
      qaScore: 92,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ];

  // Filtrar y ordenar llamadas
  const filteredCalls = useMemo(() => {
    let filtered = mockCalls;

    // Aplicar búsqueda
    if (searchQuery) {
      filtered = filtered.filter(call =>
        call.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Aplicar filtros
    filters.forEach(filter => {
      switch (filter.field) {
        case 'direction':
          filtered = filtered.filter(call => call.direction === filter.value);
          break;
        case 'status':
          filtered = filtered.filter(call => call.status === filter.value);
          break;
        case 'sentiment':
          filtered = filtered.filter(call => call.sentiment === filter.value);
          break;
        case 'queueId':
          filtered = filtered.filter(call => call.queueId === filter.value);
          break;
        case 'dateRange':
          const start = new Date(filter.value.start);
          const end = new Date(filter.value.end);
          filtered = filtered.filter(call => 
            call.startTime >= start && call.startTime <= end
          );
          break;
      }
    });

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'startTime':
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
          break;
        case 'duration':
          aValue = a.talkTime;
          bValue = b.talkTime;
          break;
        case 'qaScore':
          aValue = a.qaScore || 0;
          bValue = b.qaScore || 0;
          break;
        default:
          aValue = a[sortBy as keyof Call];
          bValue = b[sortBy as keyof Call];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchQuery, filters, sortBy, sortOrder]);

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? (
      <PhoneIncoming className="w-4 h-4 text-green-600" />
    ) : (
      <PhoneOutgoing className="w-4 h-4 text-blue-600" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'no-answer': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando historial...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Historial de Llamadas</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              {filteredCalls.length} llamadas encontradas
            </p>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por número, notas, etiquetas..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 lg:p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Dirección</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                  <option value="">Todas</option>
                  <option value="inbound">Entrantes</option>
                  <option value="outbound">Salientes</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                  <option value="">Todos</option>
                  <option value="completed">Completadas</option>
                  <option value="failed">Fallidas</option>
                  <option value="busy">Ocupado</option>
                  <option value="no-answer">Sin respuesta</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Sentimiento</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                  <option value="">Todos</option>
                  <option value="positive">Positivo</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negativo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cola</label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                  <option value="">Todas</option>
                  <option value="1">Ventas</option>
                  <option value="2">Soporte</option>
                  <option value="3">VIP</option>
                  <option value="4">Español</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabla de llamadas */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header de la tabla */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          onCallSelect(filteredCalls.map(call => call.id));
                        } else {
                          onCallSelect([]);
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('direction')}
                      className="flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>Tipo</span>
                      {getSortIcon('direction')}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('from')}
                      className="flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>Número</span>
                      {getSortIcon('from')}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('startTime')}
                      className="flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>Hora</span>
                      {getSortIcon('startTime')}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('talkTime')}
                      className="flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>Duración</span>
                      {getSortIcon('talkTime')}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <span>Estado</span>
                  </div>
                  <div className="col-span-1">
                    <span>Sentimiento</span>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('qaScore')}
                      className="flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>QA</span>
                      {getSortIcon('qaScore')}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <span>Acciones</span>
                  </div>
                  <div className="col-span-1">
                    <span>Detalles</span>
                  </div>
                </div>
              </div>

              {/* Filas de llamadas */}
              <div className="divide-y divide-gray-200">
                {filteredCalls.map((call, index) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedCalls.includes(call.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onCallSelect([...selectedCalls, call.id]);
                            } else {
                              onCallSelect(selectedCalls.filter(id => id !== call.id));
                            }
                          }}
                        />
                      </div>

                      {/* Tipo */}
                      <div className="col-span-1">
                        {getDirectionIcon(call.direction)}
                      </div>

                      {/* Número */}
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900">
                          {call.direction === 'inbound' ? call.from : call.to}
                        </p>
                        <p className="text-xs text-gray-600">
                          {call.direction === 'inbound' ? 'Entrante' : 'Saliente'}
                        </p>
                      </div>

                      {/* Hora */}
                      <div className="col-span-1">
                        <p className="text-sm text-gray-900">{formatTime(call.startTime)}</p>
                        <p className="text-xs text-gray-600">{formatDate(call.startTime)}</p>
                      </div>

                      {/* Duración */}
                      <div className="col-span-1">
                        <p className="text-sm text-gray-900">{formatDuration(call.talkTime)}</p>
                        {call.holdTime > 0 && (
                          <p className="text-xs text-gray-600">Espera: {formatDuration(call.holdTime)}</p>
                        )}
                      </div>

                      {/* Estado */}
                      <div className="col-span-1">
                        <Badge className={getStatusColor(call.status)}>
                          {call.status === 'completed' ? 'Completada' :
                           call.status === 'failed' ? 'Fallida' :
                           call.status === 'busy' ? 'Ocupado' :
                           call.status === 'no-answer' ? 'Sin respuesta' : call.status}
                        </Badge>
                      </div>

                      {/* Sentimiento */}
                      <div className="col-span-1">
                        {call.sentiment && (
                          <Badge className={getSentimentColor(call.sentiment)}>
                            {call.sentiment === 'positive' ? 'Positivo' :
                             call.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                          </Badge>
                        )}
                      </div>

                      {/* QA Score */}
                      <div className="col-span-1">
                        {call.qaScore && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">{call.qaScore}</span>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          {call.recordingUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPlayingRecording(
                                playingRecording === call.id ? null : call.id
                              )}
                            >
                              {playingRecording === call.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedCall(
                            expandedCall === call.id ? null : call.id
                          )}
                        >
                          {expandedCall === call.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {expandedCall === call.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Información de la llamada */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Información de la llamada</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">ID de llamada:</span>
                                <span className="font-mono">{call.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cola:</span>
                                <span>Ventas</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Agente:</span>
                                <span>María González</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Costo:</span>
                                <span>${call.cost?.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Notas y etiquetas */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Notas y etiquetas</h4>
                            {call.notes && (
                              <p className="text-sm text-gray-600 mb-2">{call.notes}</p>
                            )}
                            {call.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {call.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Transferencias */}
                        {call.transferHistory.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Historial de transferencias</h4>
                            <div className="space-y-2">
                              {call.transferHistory.map((transfer) => (
                                <div key={transfer.id} className="flex items-center space-x-2 text-sm">
                                  <Badge variant="outline">
                                    {transfer.type === 'warm' ? 'Cálida' : 'Fría'}
                                  </Badge>
                                  <span className="text-gray-600">
                                    De: Agente {transfer.fromAgentId} → A: Agente {transfer.toAgentId}
                                  </span>
                                  <span className="text-gray-500">
                                    {formatTime(transfer.timestamp)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

