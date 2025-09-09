'use client';

import React, { useState } from 'react';
import { 
  X, 
  Info, 
  MessageSquare, 
  Link, 
  History, 
  BarChart3, 
  Settings,
  Download,
  Share2,
  Bookmark,
  Star,
  Eye,
  Clock,
  User,
  Tag,
  Calendar,
  Globe,
  Lock,
  Users,
  FileText,
  Video,
  Image,
  Music,
  Link as LinkIcon,
  BookOpen,
  GraduationCap,
  File,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Smile,
  Frown,
  Bot,
  ChevronRight,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Archive,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  TrendingUp,
  Award,
  Zap,
  Target,
  Users as UsersIcon,
  MessageCircle,
  Send,
  Plus,
  Minus,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Progress } from '../../../components/ui/progress';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { 
  Resource, 
  Course, 
  Collection, 
  RightPanelTab,
  Comment,
  Reaction,
  Rating,
  User as UserType
} from '@/types/knowledge-base';

interface RightPanelProps {
  resource?: Resource;
  course?: Course;
  collection?: Collection;
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  onClose: () => void;
}

export function RightPanel({
  resource,
  course,
  collection,
  activeTab,
  onTabChange,
  onClose
}: RightPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Mock data para demo
  const mockComments: Comment[] = [
    {
      id: '1',
      resourceId: resource?.id,
      content: 'Excelente recurso, muy útil para el equipo de ventas.',
      authorId: '1',
      author: {
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
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    },
    {
      id: '2',
      resourceId: resource?.id,
      content: '¿Podrías agregar más ejemplos prácticos?',
      authorId: '2',
      author: {
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
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
    }
  ];

  const mockReactions: Reaction[] = [
    {
      id: '1',
      resourceId: resource?.id,
      type: 'thumbs-up',
      userId: '1',
      user: {
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
      createdAt: new Date()
    },
    {
      id: '2',
      resourceId: resource?.id,
      type: 'heart',
      userId: '2',
      user: {
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
      createdAt: new Date()
    }
  ];

  const mockRatings: Rating[] = [
    {
      id: '1',
      resourceId: resource?.id,
      userId: '1',
      user: {
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
      rating: 5,
      review: 'Muy completo y bien estructurado.',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      resourceId: resource?.id,
      userId: '2',
      user: {
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
      rating: 4,
      review: 'Buen contenido, podría tener más ejemplos.',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'link': return <LinkIcon className="w-5 h-5" />;
      case 'course': return <GraduationCap className="w-5 h-5" />;
      case 'blog': return <FileText className="w-5 h-5" />;
      case 'news': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'internal': return <Users className="w-4 h-4" />;
      case 'restricted': return <Lock className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'thumbs-up': return <ThumbsUp className="w-4 h-4" />;
      case 'thumbs-down': return <ThumbsDown className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'laugh': return <Smile className="w-4 h-4" />;
      case 'wow': return <Smile className="w-4 h-4" />;
      case 'sad': return <Frown className="w-4 h-4" />;
      case 'angry': return <Frown className="w-4 h-4" />;
      default: return <ThumbsUp className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      setIsAddingComment(true);
      // Simular envío de comentario
      setTimeout(() => {
        setNewComment('');
        setIsAddingComment(false);
      }, 1000);
    }
  };

  const handleReaction = (type: string) => {
    // Simular reacción
    console.log('Reaction:', type);
  };

  const handleRating = (rating: number) => {
    // Simular calificación
    console.log('Rating:', rating);
  };

  const renderInfoTab = () => {
    const item = resource || course || collection;
    if (!item) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                {getResourceIcon(item.type || 'file')}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(item.status || 'published')}>
                {item.status || 'published'}
              </Badge>
              {getVisibilityIcon(item.visibility || 'internal')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button variant="outline" size="sm">
              <Bot className="w-4 h-4 mr-2" />
              Preguntar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Autor</label>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={item.owner?.avatar} />
                  <AvatarFallback>{item.owner?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{item.owner?.name}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Área</label>
              <p className="text-sm mt-1">{item.area}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Idioma</label>
              <p className="text-sm mt-1">{item.language}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Creado</label>
              <p className="text-sm mt-1">{formatDate(item.createdAt)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Actualizado</label>
              <p className="text-sm mt-1">{formatDate(item.updatedAt)}</p>
            </div>
            
            {item.publishedAt && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Publicado</label>
                <p className="text-sm mt-1">{formatDate(item.publishedAt)}</p>
              </div>
            )}
          </div>

          {/* File-specific metadata */}
          {resource && (
            <div className="grid grid-cols-2 gap-4">
              {resource.metadata.fileSize && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamaño</label>
                  <p className="text-sm mt-1">{formatFileSize(resource.metadata.fileSize)}</p>
                </div>
              )}
              
              {resource.metadata.duration && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duración</label>
                  <p className="text-sm mt-1">{formatDuration(resource.metadata.duration)}</p>
                </div>
              )}
              
              {resource.metadata.pageCount && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Páginas</label>
                  <p className="text-sm mt-1">{resource.metadata.pageCount}</p>
                </div>
              )}
              
              {resource.metadata.resolution && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolución</label>
                  <p className="text-sm mt-1">{resource.metadata.resolution}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Summary */}
        {resource?.metadata.summary && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resumen</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {resource.metadata.summary}
            </p>
          </div>
        )}

        {/* Table of Contents */}
        {resource?.metadata.tableOfContents && resource.metadata.tableOfContents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Índice</h3>
            <div className="space-y-2">
              {resource.metadata.tableOfContents.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span>{item.title}</span>
                  {item.page && (
                    <Badge variant="outline" className="text-xs">
                      Página {item.page}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCommentsTab = () => (
    <div className="space-y-6">
      {/* Add Comment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comentarios</h3>
        <div className="space-y-3">
          <Textarea
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReaction('thumbs-up')}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReaction('heart')}
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReaction('laugh')}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAddingComment}
            >
              {isAddingComment ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Comments List */}
      <div className="space-y-4">
        {mockComments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{comment.author.name}</span>
                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Me gusta
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRelatedTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Recursos Relacionados</h3>
      
      <div className="space-y-4">
        {[
          {
            id: '1',
            title: 'Guía de Ventas Avanzada',
            type: 'pdf',
            description: 'Estrategias avanzadas para el equipo de ventas',
            views: 89,
            rating: 4.7
          },
          {
            id: '2',
            title: 'Tutorial CRM - Parte 2',
            type: 'video',
            description: 'Funciones avanzadas del CRM',
            views: 156,
            rating: 4.5
          },
          {
            id: '3',
            title: 'Certificación en Producto - Módulo 2',
            type: 'course',
            description: 'Segunda parte del curso de certificación',
            views: 234,
            rating: 4.8
          }
        ].map((item) => (
          <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {getResourceIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{item.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{item.rating}</span>
                    </div>
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
  );

  const renderVersionsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Versiones</h3>
      
      <div className="space-y-4">
        {[
          {
            id: '1',
            version: 3,
            title: 'Manual de Ventas 2024 - v3.0',
            description: 'Actualización con nuevas estrategias de Q4',
            publishedBy: 'María González',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            changes: ['Agregadas estrategias de Q4', 'Actualizado capítulo de CRM', 'Nuevos ejemplos prácticos']
          },
          {
            id: '2',
            version: 2,
            title: 'Manual de Ventas 2024 - v2.0',
            description: 'Correcciones y mejoras menores',
            publishedBy: 'María González',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            changes: ['Corregidos errores tipográficos', 'Mejorada estructura del capítulo 3']
          },
          {
            id: '3',
            version: 1,
            title: 'Manual de Ventas 2024 - v1.0',
            description: 'Versión inicial del manual',
            publishedBy: 'María González',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
            changes: ['Versión inicial', 'Estructura básica', 'Contenido principal']
          }
        ].map((version) => (
          <Card key={version.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {version.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      v{version.version}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {version.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{version.publishedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(version.publishedAt)}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cambios:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {version.changes.map((change, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Analítica</h3>
      
      {resource && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Vistas</p>
                    <p className="text-2xl font-bold">{resource.analytics.views}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Descargas</p>
                    <p className="text-2xl font-bold">{resource.analytics.downloads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Calificación</p>
                    <p className="text-2xl font-bold">{resource.analytics.rating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Tiempo Promedio</p>
                    <p className="text-2xl font-bold">{formatDuration(resource.analytics.averageTimeSpent * 60)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Compromiso</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasa de Rebote</span>
                  <span className="text-sm font-medium">{(resource.analytics.bounceRate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={resource.analytics.bounceRate * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasa de Finalización</span>
                  <span className="text-sm font-medium">{(resource.analytics.completionRate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={resource.analytics.completionRate * 100} className="h-2" />
              </div>
            </div>
          </div>

          {/* Top Searches */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Búsquedas Populares</h4>
            <div className="space-y-2">
              {resource.analytics.topSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{search}</span>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Actividad Reciente</h4>
            <div className="space-y-2">
              {[
                { action: 'Vista', user: 'María González', time: '2 horas' },
                { action: 'Descarga', user: 'Carlos Ruiz', time: '4 horas' },
                { action: 'Comentario', user: 'Ana Martínez', time: '1 día' },
                { action: 'Calificación', user: 'Luis Pérez', time: '2 días' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {activity.user} {activity.action.toLowerCase()} el recurso
                  </span>
                  <span className="text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Configuración</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Visibilidad</label>
          <div className="flex items-center space-x-2 mt-2">
            <Button variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Público
            </Button>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Interno
            </Button>
            <Button variant="outline" size="sm">
              <Lock className="w-4 h-4 mr-2" />
              Restringido
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Permisos</label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Lectura</span>
              <Badge variant="outline">Todos</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Escritura</span>
              <Badge variant="outline">Editores</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Administración</span>
              <Badge variant="outline">Administradores</Badge>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Acciones</label>
          <div className="flex items-center space-x-2 mt-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="w-4 h-4 mr-2" />
              Archivar
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="w-4 h-4 mr-2" />
              Reportar
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'comments':
        return renderCommentsTab();
      case 'related':
        return renderRelatedTab();
      case 'versions':
        return renderVersionsTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderInfoTab();
    }
  };

  if (!resource && !course && !collection) {
    return null;
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalles
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as RightPanelTab)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="info" className="text-xs">
              <Info className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="related" className="text-xs">
              <Link className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs">
              <History className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
