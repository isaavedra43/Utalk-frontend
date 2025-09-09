'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  FileText,
  Video,
  Image,
  Music,
  Link,
  BookOpen,
  GraduationCap,
  File,
  Download,
  Eye,
  Clock,
  User,
  Tag,
  Star,
  Bookmark,
  Share2,
  MoreVertical,
  ChevronDown,
  X,
  Calendar,
  Globe,
  Lock,
  Users,
  TrendingUp,
  Award,
  Zap,
  Bot,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Smile,
  Frown
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Checkbox } from '../../../components/ui/checkbox';
import { Separator } from '../../../components/ui/separator';
import { Progress } from '../../../components/ui/progress';
import { 
  Resource, 
  Collection, 
  ResourceType, 
  ResourceStatus, 
  VisibilityLevel,
  SearchFilters,
  SearchSort,
  User as UserType
} from '@/types/knowledge-base';

interface KnowledgeExplorerProps {
  resources: Resource[];
  collections: Collection[];
  isLoading: boolean;
  error?: string;
  onResourceSelect: (resource: Resource) => void;
  onCollectionSelect: (collection: Collection) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  sort: SearchSort;
  onSortChange: (sort: SearchSort) => void;
}

export function KnowledgeExplorer({
  resources,
  collections,
  isLoading,
  error,
  onResourceSelect,
  onCollectionSelect,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearch,
  filters,
  onFiltersChange,
  sort,
  onSortChange
}: KnowledgeExplorerProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Mock data para demo
  const mockResources: Resource[] = [
    {
      id: '1',
      type: 'pdf',
      title: 'Manual de Ventas 2024',
      description: 'Guía completa para el equipo de ventas con estrategias y mejores prácticas.',
      content: '',
      ownerId: '1',
      owner: {
        id: '1',
        name: 'María González',
        email: 'maria@utalk.com',
        role: 'editor',
        skills: [],
        preferences: {
          language: 'es',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            newContent: true,
            mentions: true,
            comments: true,
            approvals: true
          },
          defaultView: 'grid',
          itemsPerPage: 20
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      area: 'Ventas',
      tags: ['ventas', 'manual', 'estrategia', '2024'],
      language: 'es',
      status: 'published',
      visibility: 'internal',
      permissions: {
        read: ['all'],
        write: ['editors'],
        admin: ['admins'],
        inheritFromCollection: true
      },
      metadata: {
        author: 'María González',
        fileSize: 2048576,
        pageCount: 45,
        extractedText: 'Contenido del manual...',
        summary: 'Manual completo de ventas con estrategias actualizadas para 2024.',
        tableOfContents: [
          { id: '1', title: 'Introducción', level: 1, page: 1, children: [] },
          { id: '2', title: 'Estrategias de Ventas', level: 1, page: 5, children: [] },
          { id: '3', title: 'Herramientas y Recursos', level: 1, page: 20, children: [] }
        ],
        customFields: {}
      },
      versions: [],
      chunks: [],
      embeddings: [],
      transcripts: [],
      collections: [],
      comments: [],
      reactions: [],
      bookmarks: [],
      ratings: [],
      analytics: {
        views: 156,
        uniqueViews: 89,
        downloads: 23,
        uniqueDownloads: 18,
        timeSpent: 2340,
        averageTimeSpent: 15.6,
        bounceRate: 0.12,
        completionRate: 0.88,
        rating: 4.5,
        ratingCount: 12,
        comments: 3,
        reactions: 8,
        bookmarks: 15,
        shares: 2,
        lastViewed: new Date(),
        topSearches: ['ventas', 'estrategia', 'manual'],
        topReferrers: ['google', 'direct'],
        userEngagement: [],
        dailyStats: []
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    },
    {
      id: '2',
      type: 'video',
      title: 'Capacitación: Uso del CRM',
      description: 'Video tutorial completo sobre el uso del sistema CRM de la empresa.',
      content: '',
      ownerId: '2',
      owner: {
        id: '2',
        name: 'Carlos Ruiz',
        email: 'carlos@utalk.com',
        role: 'author',
        skills: [],
        preferences: {
          language: 'es',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            newContent: true,
            mentions: true,
            comments: true,
            approvals: true
          },
          defaultView: 'grid',
          itemsPerPage: 20
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      area: 'Soporte',
      tags: ['crm', 'tutorial', 'video', 'capacitación'],
      language: 'es',
      status: 'published',
      visibility: 'internal',
      permissions: {
        read: ['all'],
        write: ['editors'],
        admin: ['admins'],
        inheritFromCollection: true
      },
      metadata: {
        author: 'Carlos Ruiz',
        duration: 1800,
        resolution: '1920x1080',
        format: 'mp4',
        transcriptText: 'Hola, en este video te voy a enseñar cómo usar el CRM...',
        summary: 'Tutorial completo sobre el uso del CRM con ejemplos prácticos.',
        customFields: {}
      },
      versions: [],
      chunks: [],
      embeddings: [],
      transcripts: [],
      collections: [],
      comments: [],
      reactions: [],
      bookmarks: [],
      ratings: [],
      analytics: {
        views: 89,
        uniqueViews: 67,
        downloads: 12,
        uniqueDownloads: 10,
        timeSpent: 1560,
        averageTimeSpent: 17.5,
        bounceRate: 0.08,
        completionRate: 0.92,
        rating: 4.8,
        ratingCount: 8,
        comments: 2,
        reactions: 12,
        bookmarks: 8,
        shares: 1,
        lastViewed: new Date(),
        topSearches: ['crm', 'tutorial', 'video'],
        topReferrers: ['direct', 'email'],
        userEngagement: [],
        dailyStats: []
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      id: '3',
      type: 'course',
      title: 'Certificación en Producto',
      description: 'Curso completo para obtener la certificación en productos de la empresa.',
      content: '',
      ownerId: '3',
      owner: {
        id: '3',
        name: 'Ana Martínez',
        email: 'ana@utalk.com',
        role: 'editor',
        skills: [],
        preferences: {
          language: 'es',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            newContent: true,
            mentions: true,
            comments: true,
            approvals: true
          },
          defaultView: 'grid',
          itemsPerPage: 20
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      area: 'Producto',
      tags: ['certificación', 'producto', 'curso', 'avanzado'],
      language: 'es',
      status: 'published',
      visibility: 'internal',
      permissions: {
        read: ['all'],
        write: ['editors'],
        admin: ['admins'],
        inheritFromCollection: true
      },
      metadata: {
        author: 'Ana Martínez',
        summary: 'Curso completo de certificación en productos con evaluaciones y certificado.',
        customFields: {
          duration: '8 horas',
          level: 'avanzado',
          certificate: true
        }
      },
      versions: [],
      chunks: [],
      embeddings: [],
      transcripts: [],
      collections: [],
      comments: [],
      reactions: [],
      bookmarks: [],
      ratings: [],
      analytics: {
        views: 234,
        uniqueViews: 156,
        downloads: 0,
        uniqueDownloads: 0,
        timeSpent: 4560,
        averageTimeSpent: 19.5,
        bounceRate: 0.05,
        completionRate: 0.95,
        rating: 4.9,
        ratingCount: 15,
        comments: 5,
        reactions: 18,
        bookmarks: 22,
        shares: 3,
        lastViewed: new Date(),
        topSearches: ['certificación', 'producto', 'curso'],
        topReferrers: ['direct', 'email', 'google'],
        userEngagement: [],
        dailyStats: []
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    }
  ];

  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'Ventas',
      description: 'Recursos y documentación para el equipo de ventas',
      icon: '📈',
      color: '#3B82F6',
      resources: mockResources.filter(r => r.area === 'Ventas'),
      permissions: {
        read: ['all'],
        write: ['editors'],
        admin: ['admins'],
        inheritToResources: true
      },
      settings: {
        autoTagging: true,
        requireApproval: false,
        allowComments: true,
        allowReactions: true,
        qualityChecklist: {
          enabled: true,
          items: []
        }
      },
      analytics: {
        totalResources: 15,
        totalViews: 1234,
        totalDownloads: 89,
        averageRating: 4.6,
        lastActivity: new Date(),
        growthRate: 0.15
      },
      children: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Soporte',
      description: 'Documentación técnica y guías de soporte',
      icon: '🛠️',
      color: '#10B981',
      resources: mockResources.filter(r => r.area === 'Soporte'),
      permissions: {
        read: ['all'],
        write: ['editors'],
        admin: ['admins'],
        inheritToResources: true
      },
      settings: {
        autoTagging: true,
        requireApproval: false,
        allowComments: true,
        allowReactions: true,
        qualityChecklist: {
          enabled: true,
          items: []
        }
      },
      analytics: {
        totalResources: 23,
        totalViews: 2156,
        totalDownloads: 156,
        averageRating: 4.4,
        lastActivity: new Date(),
        growthRate: 0.22
      },
      children: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Producto',
      description: 'Información sobre productos y certificaciones',
      icon: '🎯',
      color: '#F59E0B',
      resources: mockResources.filter(r => r.area === 'Producto'),
      permissions: {
        read: ['all'],
        write: ['editors'],
        admin: ['admins'],
        inheritToResources: true
      },
      settings: {
        autoTagging: true,
        requireApproval: false,
        allowComments: true,
        allowReactions: true,
        qualityChecklist: {
          enabled: true,
          items: []
        }
      },
      analytics: {
        totalResources: 18,
        totalViews: 1876,
        totalDownloads: 67,
        averageRating: 4.7,
        lastActivity: new Date(),
        growthRate: 0.18
      },
      children: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const resourceTypes: { type: ResourceType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" />, color: '#EF4444' },
    { type: 'doc', label: 'Word', icon: <FileText className="w-4 h-4" />, color: '#3B82F6' },
    { type: 'xls', label: 'Excel', icon: <FileText className="w-4 h-4" />, color: '#10B981' },
    { type: 'ppt', label: 'PowerPoint', icon: <FileText className="w-4 h-4" />, color: '#F59E0B' },
    { type: 'video', label: 'Video', icon: <Video className="w-4 h-4" />, color: '#8B5CF6' },
    { type: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" />, color: '#EC4899' },
    { type: 'image', label: 'Imagen', icon: <Image className="w-4 h-4" />, color: '#06B6D4' },
    { type: 'link', label: 'Enlace', icon: <Link className="w-4 h-4" />, color: '#84CC16' },
    { type: 'course', label: 'Curso', icon: <GraduationCap className="w-4 h-4" />, color: '#F97316' },
    { type: 'blog', label: 'Blog', icon: <FileText className="w-4 h-4" />, color: '#6366F1' },
    { type: 'news', label: 'Noticia', icon: <FileText className="w-4 h-4" />, color: '#14B8A6' }
  ];

  const getResourceIcon = (type: ResourceType) => {
    const resourceType = resourceTypes.find(rt => rt.type === type);
    return resourceType?.icon || <File className="w-4 h-4" />;
  };

  const getResourceColor = (type: ResourceType) => {
    const resourceType = resourceTypes.find(rt => rt.type === type);
    return resourceType?.color || '#6B7280';
  };

  const getVisibilityIcon = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'internal': return <Users className="w-4 h-4" />;
      case 'restricted': return <Lock className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'obsolete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleResourceSelect = (resource: Resource) => {
    onResourceSelect(resource);
  };

  const handleCollectionSelect = (collection: Collection) => {
    onCollectionSelect(collection);
  };

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const handleSortChange = (field: SearchSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    onSortChange({ field, direction: newDirection });
  };

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResources.length === mockResources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(mockResources.map(r => r.id));
    }
  };

  const renderResourceCard = (resource: Resource) => (
    <Card 
      key={resource.id} 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
      onClick={() => handleResourceSelect(resource)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: getResourceColor(resource.type) }}
            >
              {getResourceIcon(resource.type)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {resource.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {resource.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(resource.status)}>
              {resource.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Guardar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bot className="w-4 h-4 mr-2" />
                  Preguntar al documento
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{resource.owner.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(resource.updatedAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {getVisibilityIcon(resource.visibility)}
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{resource.analytics.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{resource.analytics.downloads}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{resource.analytics.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Bookmark className="w-3 h-3" />
              <span>{resource.analytics.bookmarks}</span>
            </div>
          </div>

          {/* Progress bar for courses */}
          {resource.type === 'course' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          )}

          {/* File size and duration */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              {resource.metadata.fileSize && (
                <span>{formatFileSize(resource.metadata.fileSize)}</span>
              )}
              {resource.metadata.duration && (
                <span>{formatDuration(resource.metadata.duration)}</span>
              )}
              {resource.metadata.pageCount && (
                <span>{resource.metadata.pageCount} páginas</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(resource.analytics.averageTimeSpent * 60)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResourceListItem = (resource: Resource) => (
    <div 
      key={resource.id}
      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => handleResourceSelect(resource)}
    >
      <Checkbox
        checked={selectedResources.includes(resource.id)}
        onCheckedChange={() => handleResourceToggle(resource.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: getResourceColor(resource.type) }}
      >
        {getResourceIcon(resource.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-600 truncate">
          {resource.description}
        </p>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-gray-500">{resource.area}</span>
          <span className="text-xs text-gray-500">{resource.owner.name}</span>
          <span className="text-xs text-gray-500">{formatDate(resource.updatedAt)}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(resource.status)}>
            {resource.status}
          </Badge>
          {getVisibilityIcon(resource.visibility)}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{resource.analytics.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>{resource.analytics.rating.toFixed(1)}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bookmark className="w-4 h-4 mr-2" />
              Guardar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium">Error al cargar recursos</div>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Explorar Conocimiento
          </h1>
          <p className="text-gray-600 mt-1">
            Descubre y accede a todo el conocimiento de la organización
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
            <div className="flex items-center border border-gray-200 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar en todo el conocimiento..."
            className="pl-10"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(localSearchQuery);
              }
            }}
          />
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Resource Types */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Recurso</label>
                  <div className="space-y-2">
                    {resourceTypes.map((type) => (
                      <div key={type.type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.type}
                          checked={filters.types?.includes(type.type) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange({
                                types: [...(filters.types || []), type.type]
                              });
                            } else {
                              handleFilterChange({
                                types: filters.types?.filter(t => t !== type.type)
                              });
                            }
                          }}
                        />
                        <label htmlFor={type.type} className="text-sm flex items-center space-x-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Área</label>
                  <div className="space-y-2">
                    {['Ventas', 'Soporte', 'Producto', 'RH', 'Operaciones', 'Legal'].map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={area}
                          checked={filters.areas?.includes(area) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange({
                                areas: [...(filters.areas || []), area]
                              });
                            } else {
                              handleFilterChange({
                                areas: filters.areas?.filter(a => a !== area)
                              });
                            }
                          }}
                        />
                        <label htmlFor={area} className="text-sm">{area}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <div className="space-y-2">
                    {['published', 'draft', 'review', 'approved', 'archived'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={status}
                          checked={filters.status?.includes(status as ResourceStatus) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleFilterChange({
                                status: [...(filters.status || []), status as ResourceStatus]
                              });
                            } else {
                              handleFilterChange({
                                status: filters.status?.filter(s => s !== status)
                              });
                            }
                          }}
                        />
                        <label htmlFor={status} className="text-sm capitalize">{status}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <div className="space-y-2">
                    {[
                      { field: 'relevance', label: 'Relevancia' },
                      { field: 'date', label: 'Fecha' },
                      { field: 'title', label: 'Título' },
                      { field: 'rating', label: 'Calificación' },
                      { field: 'views', label: 'Vistas' }
                    ].map((option) => (
                      <div key={option.field} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.field}
                          checked={sort.field === option.field}
                          onCheckedChange={() => handleSortChange(option.field as SearchSort['field'])}
                        />
                        <label htmlFor={option.field} className="text-sm">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Collections */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Colecciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCollections.map((collection) => (
            <Card 
              key={collection.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCollectionSelect(collection)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: collection.color }}
                  >
                    <span className="text-lg">{collection.icon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{collection.analytics.totalResources} recursos</span>
                  <span>{collection.analytics.totalViews} vistas</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recursos</h2>
          <div className="flex items-center space-x-2">
            {selectedResources.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedResources.length} seleccionados
                </span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedResources.length === mockResources.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : mockResources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay recursos disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza subiendo tu primer recurso o creando contenido nuevo.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Recurso
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-2'
          }>
            {mockResources.map((resource) => 
              viewMode === 'grid' 
                ? renderResourceCard(resource)
                : renderResourceListItem(resource)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
