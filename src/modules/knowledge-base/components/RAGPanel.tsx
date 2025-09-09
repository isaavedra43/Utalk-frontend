'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Loader2, 
  Copy, 
  ExternalLink, 
  FileText, 
  Video, 
  Image, 
  Music, 
  Link as LinkIcon,
  BookOpen,
  GraduationCap,
  File,
  Star,
  Clock,
  User,
  Tag,
  Calendar,
  Globe,
  Lock,
  Users,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  Share2,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  Award,
  Brain,
  Lightbulb,
  HelpCircle,
  Settings,
  History,
  Trash2,
  Edit,
  Plus,
  Minus,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Progress } from '../../../components/ui/progress';
import { Textarea } from '../../../components/ui/textarea';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  RAGResponse, 
  RAGSource, 
  RAGCitation,
  Resource,
  ResourceType
} from '@/types/knowledge-base';

interface RAGPanelProps {
  onClose: () => void;
  onQuery: (query: string) => void;
  response?: RAGResponse;
  isLoading: boolean;
  error?: string;
}

export function RAGPanel({
  onClose,
  onQuery,
  response,
  isLoading,
  error
}: RAGPanelProps) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<RAGResponse[]>([]);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'chat' | 'sources' | 'history'>('chat');
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock chat history para demo
  const mockChatHistory: RAGResponse[] = [
    {
      answer: 'Para crear un nuevo recurso en la base de conocimiento, puedes usar el botón "Crear" en la barra superior o arrastrar y soltar archivos directamente. Los formatos soportados incluyen PDF, Word, Excel, PowerPoint, videos, audios e imágenes.',
      sources: [
        {
          id: '1',
          type: 'pdf',
          title: 'Guía de Usuario - Base de Conocimiento',
          url: '/resources/1',
          chunkId: 'chunk-1',
          score: 0.95,
          metadata: {
            section: 'Creación de Recursos',
            paragraph: 1,
            wordCount: 150,
            language: 'es',
            sentiment: 'positive',
            importance: 0.9,
            customFields: {}
          }
        },
        {
          id: '2',
          type: 'video',
          title: 'Tutorial: Subir Recursos',
          url: '/resources/2',
          chunkId: 'chunk-2',
          score: 0.87,
          metadata: {
            section: 'Tutoriales',
            paragraph: 2,
            wordCount: 200,
            language: 'es',
            sentiment: 'positive',
            importance: 0.8,
            customFields: {}
          }
        }
      ],
      citations: [
        {
          id: '1',
          text: 'Para crear un nuevo recurso en la base de conocimiento, puedes usar el botón "Crear"',
          sourceId: '1',
          chunkId: 'chunk-1',
          start: 0,
          end: 80,
          page: 1,
          url: '/resources/1#page=1'
        },
        {
          id: '2',
          text: 'Los formatos soportados incluyen PDF, Word, Excel, PowerPoint, videos, audios e imágenes',
          sourceId: '1',
          chunkId: 'chunk-1',
          start: 120,
          end: 200,
          page: 1,
          url: '/resources/1#page=1'
        }
      ],
      confidence: 0.92,
      query: '¿Cómo puedo crear un nuevo recurso?',
      processingTime: 1200,
      metadata: {
        totalChunks: 150,
        retrievedChunks: 8,
        rerankedChunks: 5,
        searchTime: 800,
        embeddingTime: 200,
        rerankTime: 150,
        summaryTime: 50
      }
    },
    {
      answer: 'El sistema de búsqueda utiliza una combinación de búsqueda semántica (vectorial) y búsqueda por palabras clave (BM25) para encontrar los recursos más relevantes. También incluye re-ranking para mejorar la precisión de los resultados.',
      sources: [
        {
          id: '3',
          type: 'pdf',
          title: 'Documentación Técnica - Motor de Búsqueda',
          url: '/resources/3',
          chunkId: 'chunk-3',
          score: 0.91,
          metadata: {
            section: 'Arquitectura de Búsqueda',
            paragraph: 1,
            wordCount: 180,
            language: 'es',
            sentiment: 'neutral',
            importance: 0.85,
            customFields: {}
          }
        }
      ],
      citations: [
        {
          id: '3',
          text: 'El sistema de búsqueda utiliza una combinación de búsqueda semántica (vectorial) y búsqueda por palabras clave (BM25)',
          sourceId: '3',
          chunkId: 'chunk-3',
          start: 0,
          end: 100,
          page: 2,
          url: '/resources/3#page=2'
        }
      ],
      confidence: 0.88,
      query: '¿Cómo funciona el sistema de búsqueda?',
      processingTime: 980,
      metadata: {
        totalChunks: 200,
        retrievedChunks: 6,
        rerankedChunks: 4,
        searchTime: 600,
        embeddingTime: 180,
        rerankTime: 120,
        summaryTime: 80
      }
    }
  ];

  useEffect(() => {
    setChatHistory(mockChatHistory);
  }, []);

  useEffect(() => {
    if (response) {
      setChatHistory(prev => [...prev, response]);
      setActiveTab('chat');
    }
  }, [response]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'course': return <GraduationCap className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'news': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: ResourceType) => {
    switch (type) {
      case 'pdf': return '#EF4444';
      case 'video': return '#8B5CF6';
      case 'audio': return '#EC4899';
      case 'image': return '#06B6D4';
      case 'link': return '#84CC16';
      case 'course': return '#F97316';
      case 'blog': return '#6366F1';
      case 'news': return '#14B8A6';
      default: return '#6B7280';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuery(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

  const handleCopyAnswer = (answer: string) => {
    navigator.clipboard.writeText(answer);
  };

  const handleSourceClick = (source: RAGSource) => {
    // Simular navegación al recurso
    console.log('Navigate to source:', source);
  };

  const handleCitationClick = (citation: RAGCitation) => {
    // Simular navegación a la cita específica
    console.log('Navigate to citation:', citation);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    // Simular envío de feedback
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
  };

  const renderChatMessage = (response: RAGResponse, index: number) => (
    <div key={index} className="space-y-4">
      {/* User Question */}
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-600 text-white">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-900 dark:text-white">
              {response.query}
            </p>
          </div>
        </div>
      </div>

      {/* Bot Answer */}
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-600 text-white">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Copiloto IA
                </span>
                <div className={`flex items-center space-x-1 ${getConfidenceColor(response.confidence)}`}>
                  {getConfidenceIcon(response.confidence)}
                  <span className="text-xs">
                    {(response.confidence * 100).toFixed(0)}% confianza
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyAnswer(response.answer)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('positive')}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('negative')}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {response.answer}
              </p>
            </div>

            {/* Citations */}
            {response.citations && response.citations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Referencias:
                </h4>
                <div className="space-y-2">
                  {response.citations.map((citation, citationIndex) => (
                    <div
                      key={citation.id}
                      className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleCitationClick(citation)}
                    >
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        [{citationIndex + 1}]
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                        {citation.text}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sources */}
          {response.sources && response.sources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Fuentes ({response.sources.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('sources')}
                >
                  Ver todas
                </Button>
              </div>
              <div className="space-y-2">
                {response.sources.slice(0, 3).map((source) => (
                  <Card
                    key={source.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSourceClick(source)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: getResourceColor(source.type) }}
                        >
                          {getResourceIcon(source.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {source.title}
                          </h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {(source.score * 100).toFixed(0)}% relevancia
                            </Badge>
                            {source.metadata.section && (
                              <Badge variant="secondary" className="text-xs">
                                {source.metadata.section}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(response.processingTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Search className="w-3 h-3" />
              <span>{response.metadata.retrievedChunks} chunks</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Re-ranking activado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSourcesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fuentes</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <SortAsc className="w-4 h-4 mr-2" />
            Ordenar
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {chatHistory.flatMap(response => response.sources).map((source) => (
          <Card
            key={source.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSourceClick(source)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: getResourceColor(source.type) }}
                >
                  {getResourceIcon(source.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {source.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {source.metadata.section} • {source.metadata.wordCount} palabras
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {(source.score * 100).toFixed(0)}% relevancia
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {source.type.toUpperCase()}
                    </Badge>
                    {source.metadata.sentiment && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          source.metadata.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          source.metadata.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {source.metadata.sentiment}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial</h3>
        <Button variant="outline" size="sm" onClick={handleClearHistory}>
          <Trash2 className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>

      <div className="space-y-3">
        {chatHistory.map((response, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {response.query}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {response.answer}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(response.processingTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{response.sources.length} fuentes</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${getConfidenceColor(response.confidence)}`}>
                    {getConfidenceIcon(response.confidence)}
                    <span>{(response.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Copiloto IA
              </h2>
              <p className="text-xs text-gray-600">
                Asistente inteligente de conocimiento
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="sources" className="text-xs">
              <FileText className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <>
            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      ¡Hola! Soy tu Copiloto IA
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Puedo ayudarte a encontrar información en la base de conocimiento.
                      Hazme cualquier pregunta.
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery('¿Cómo puedo crear un nuevo recurso?')}
                      >
                        ¿Cómo crear un recurso?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery('¿Qué tipos de archivos puedo subir?')}
                      >
                        ¿Qué archivos puedo subir?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery('¿Cómo funciona la búsqueda?')}
                      >
                        ¿Cómo funciona la búsqueda?
                      </Button>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((response, index) => renderChatMessage(response, index))
                )}

                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Procesando tu consulta...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-red-600 text-white">
                        <XCircle className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-800 dark:text-red-200">
                            Error: {error}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                  ref={textareaRef}
                  placeholder="Pregunta algo sobre el conocimiento..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery('¿Cómo puedo crear un nuevo recurso?')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Sugerencias
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}

        {activeTab === 'sources' && (
          <div className="flex-1 p-4">
            {renderSourcesTab()}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 p-4">
            {renderHistoryTab()}
          </div>
        )}
      </div>
    </div>
  );
}
