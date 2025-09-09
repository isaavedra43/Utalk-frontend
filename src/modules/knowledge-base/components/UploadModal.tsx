'use client';

import React, { useState, useCallback } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Music, 
  Link as LinkIcon,
  BookOpen,
  GraduationCap,
  File,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Eye,
  Download,
  Settings,
  Tag,
  User,
  Calendar,
  Globe,
  Lock,
  Users,
  ChevronDown,
  Info,
  Zap,
  Target,
  TrendingUp,
  Award,
  Brain,
  Lightbulb,
  HelpCircle,
  History,
  Edit,
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
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { 
  ResourceType, 
  ResourceStatus, 
  VisibilityLevel,
  Collection
} from '@/types/knowledge-base';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  resource?: {
    id: string;
    title: string;
    type: ResourceType;
    description: string;
    area: string;
    tags: string[];
    visibility: VisibilityLevel;
    status: ResourceStatus;
  };
}

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'configure' | 'preview'>('upload');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [autoTagging, setAutoTagging] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [notifyUsers, setNotifyUsers] = useState(true);

  // Mock collections
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'Ventas',
      description: 'Recursos y documentación para el equipo de ventas',
      icon: '📈',
      color: '#3B82F6',
      resources: [],
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
      resources: [],
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
      resources: [],
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-5 h-5" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="w-5 h-5" />;
    if (type.includes('powerpoint') || type.includes('presentation')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith('image/')) return '#06B6D4';
    if (type.startsWith('video/')) return '#8B5CF6';
    if (type.startsWith('audio/')) return '#EC4899';
    if (type.includes('pdf')) return '#EF4444';
    if (type.includes('word') || type.includes('document')) return '#3B82F6';
    if (type.includes('excel') || type.includes('spreadsheet')) return '#10B981';
    if (type.includes('powerpoint') || type.includes('presentation')) return '#F59E0B';
    return '#6B7280';
  };

  const getResourceType = (file: File): ResourceType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'doc';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'xls';
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return 'ppt';
    return 'text';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      resource: {
        id: '',
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: getResourceType(file),
        description: '',
        area: 'General',
        tags: [],
        visibility: 'internal',
        status: 'draft'
      }
    }));
    
    setFiles(prev => [...prev, ...uploadFiles]);
    setActiveTab('configure');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const updateFileResource = (id: string, updates: Partial<UploadFile['resource']>) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, resource: { ...file.resource!, ...updates } }
        : file
    ));
  };

  const startUpload = async () => {
    setActiveTab('preview');
    
    for (const file of files) {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // Simular upload
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress }
            : f
        ));
      }

      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'processing', progress: 100 }
          : f
      ));

      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'completed' }
          : f
      ));
    }
  };

  const handleUpload = () => {
    onUpload(files.map(f => f.file));
    onClose();
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Arrastra y suelta archivos aquí
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          O haz clic para seleccionar archivos
        </p>
        <Button onClick={() => document.getElementById('file-input')?.click()}>
          <Plus className="w-4 h-4 mr-2" />
          Seleccionar Archivos
        </Button>
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.m4a"
        />
      </div>

      {/* Supported Formats */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Formatos Soportados
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'Documentos', formats: 'PDF, Word, Excel, PowerPoint, TXT, Markdown' },
            { type: 'Imágenes', formats: 'JPG, PNG, GIF, SVG' },
            { type: 'Videos', formats: 'MP4, AVI, MOV, WebM' },
            { type: 'Audios', formats: 'MP3, WAV, M4A, OGG' }
          ].map((category) => (
            <div key={category.type} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {category.type}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {category.formats}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Opciones de Subida
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-tagging"
              checked={autoTagging}
              onCheckedChange={(checked) => setAutoTagging(checked as boolean)}
            />
            <Label htmlFor="auto-tagging" className="text-sm">
              Etiquetado automático con IA
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="require-approval"
              checked={requireApproval}
              onCheckedChange={(checked) => setRequireApproval(checked as boolean)}
            />
            <Label htmlFor="require-approval" className="text-sm">
              Requerir aprobación antes de publicar
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-users"
              checked={notifyUsers}
              onCheckedChange={(checked) => setNotifyUsers(checked as boolean)}
            />
            <Label htmlFor="notify-users" className="text-sm">
              Notificar a usuarios relevantes
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfigureTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Configurar Recursos ({files.length})
        </h3>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('upload')}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Más
        </Button>
      </div>

      <div className="space-y-4">
        {files.map((file) => (
          <Card key={file.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: getFileColor(file.file.type) }}
                  >
                    {getFileIcon(file.file.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.file.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.file.size)} • {file.resource?.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`title-${file.id}`} className="text-sm">
                    Título
                  </Label>
                  <Input
                    id={`title-${file.id}`}
                    value={file.resource?.title || ''}
                    onChange={(e) => updateFileResource(file.id, { title: e.target.value })}
                    placeholder="Título del recurso"
                  />
                </div>
                <div>
                  <Label htmlFor={`area-${file.id}`} className="text-sm">
                    Área
                  </Label>
                  <Select
                    value={file.resource?.area || ''}
                    onValueChange={(value) => updateFileResource(file.id, { area: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ventas">Ventas</SelectItem>
                      <SelectItem value="Soporte">Soporte</SelectItem>
                      <SelectItem value="Producto">Producto</SelectItem>
                      <SelectItem value="RH">Recursos Humanos</SelectItem>
                      <SelectItem value="Operaciones">Operaciones</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor={`description-${file.id}`} className="text-sm">
                  Descripción
                </Label>
                <Textarea
                  id={`description-${file.id}`}
                  value={file.resource?.description || ''}
                  onChange={(e) => updateFileResource(file.id, { description: e.target.value })}
                  placeholder="Descripción del recurso"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`visibility-${file.id}`} className="text-sm">
                    Visibilidad
                  </Label>
                  <Select
                    value={file.resource?.visibility || 'internal'}
                    onValueChange={(value) => updateFileResource(file.id, { visibility: value as VisibilityLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>Público</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="internal">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>Interno</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="restricted">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>Restringido</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>Privado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`status-${file.id}`} className="text-sm">
                    Estado
                  </Label>
                  <Select
                    value={file.resource?.status || 'draft'}
                    onValueChange={(value) => updateFileResource(file.id, { status: value as ResourceStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="review">En Revisión</SelectItem>
                      <SelectItem value="approved">Aprobado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor={`tags-${file.id}`} className="text-sm">
                  Etiquetas
                </Label>
                <Input
                  id={`tags-${file.id}`}
                  value={file.resource?.tags.join(', ') || ''}
                  onChange={(e) => updateFileResource(file.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="Etiquetas separadas por comas"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collection Selection */}
      <div className="space-y-3">
        <Label htmlFor="collection" className="text-sm font-medium">
          Colección
        </Label>
        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar colección (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {mockCollections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{collection.icon}</span>
                  <span>{collection.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Procesando Recursos ({files.length})
        </h3>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {files.filter(f => f.status === 'completed').length} de {files.length} completados
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: getFileColor(file.file.type) }}
                >
                  {getFileIcon(file.file.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.resource?.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {file.status === 'pending' && (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
                      {file.status === 'uploading' && (
                        <Badge variant="outline" className="text-blue-600">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Subiendo
                        </Badge>
                      )}
                      {file.status === 'processing' && (
                        <Badge variant="outline" className="text-yellow-600">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Procesando
                        </Badge>
                      )}
                      {file.status === 'completed' && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completado
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="outline" className="text-red-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {file.file.name} • {formatFileSize(file.file.size)}
                  </p>
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  )}
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {files.every(f => f.status === 'completed') && (
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            ¡Subida Completada!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Todos los recursos han sido procesados exitosamente.
          </p>
          <Button onClick={handleUpload} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Subir Recursos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Agrega nuevos recursos a la base de conocimiento
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Subir</TabsTrigger>
              <TabsTrigger value="configure" disabled={files.length === 0}>
                Configurar
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={files.length === 0}>
                Vista Previa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              {renderUploadTab()}
            </TabsContent>

            <TabsContent value="configure" className="mt-6">
              {renderConfigureTab()}
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              {renderPreviewTab()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {files.length > 0 && (
              <span>{files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {activeTab === 'configure' && (
              <Button onClick={startUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivos
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
