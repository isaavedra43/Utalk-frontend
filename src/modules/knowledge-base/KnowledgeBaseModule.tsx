'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Newspaper, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Upload,
  Bookmark,
  Star,
  MessageSquare,
  Share2,
  Download,
  Eye,
  Clock,
  Tag,
  Users,
  TrendingUp,
  Award,
  Target,
  Zap,
  Bot
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import { 
  KnowledgeBaseState, 
  KnowledgeBaseView, 
  Resource, 
  Course, 
  Collection, 
  User as KBUser, 
  Notification,
  RightPanelTab
} from '@/types/knowledge-base';

// Importar componentes específicos
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { ResourceViewer } from './components/ResourceViewer';
import { CourseModule } from './components/CourseModule';
import { BlogModule } from './components/BlogModule';
import { NewsModule } from './components/NewsModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { AdminModule } from './components/AdminModule';
import { RightPanel } from './components/RightPanel';
import { SearchModal } from './components/SearchModal';
import { UploadModal } from './components/UploadModal';
import { CreateResourceModal } from './components/CreateResourceModal';
import { CreateCourseModal } from './components/CreateCourseModal';
import { CreateCollectionModal } from './components/CreateCollectionModal';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';
import { RAGPanel } from './components/RAGPanel';

export default function KnowledgeBaseModule() {
  const [state, setState] = useState<KnowledgeBaseState>({
    // Navigation
    currentView: 'explore',
    currentResource: undefined,
    currentCourse: undefined,
    currentCollection: undefined,
    
    // Search
    searchQuery: '',
    searchResults: [],
    searchFilters: {},
    searchSort: { field: 'relevance', direction: 'desc' },
    searchPagination: { page: 1, limit: 20, offset: 0 },
    isSearching: false,
    searchError: undefined,
    
    // RAG
    ragQuery: '',
    ragResponse: undefined,
    isRAGLoading: false,
    ragError: undefined,
    
    // Resources
    resources: [],
    isLoadingResources: false,
    resourcesError: undefined,
    
    // Collections
    collections: [],
    isLoadingCollections: false,
    collectionsError: undefined,
    
    // Courses
    courses: [],
    isLoadingCourses: false,
    coursesError: undefined,
    
    // User
    user: undefined,
    userProgress: {
      enrolledCourses: [],
      completedCourses: [],
      inProgressCourses: [],
      bookmarks: [],
      ratings: [],
      skills: [],
      badges: [],
      certifications: [],
      totalTimeSpent: 0,
      totalResourcesViewed: 0,
      totalCoursesCompleted: 0
    },
    userBookmarks: [],
    userRatings: [],
    
    // UI
    sidebarOpen: true,
    rightPanelOpen: false,
    rightPanelTab: 'info',
    selectedResources: [],
    viewMode: 'grid',
    sortBy: 'relevance',
    filterBy: 'all',
    
    // Modals
    modals: {
      upload: false,
      createResource: false,
      createCourse: false,
      createCollection: false,
      settings: false,
      share: false,
      export: false
    },
    
    // Notifications
    notifications: [],
    unreadCount: 0
  });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRAGPanel, setShowRAGPanel] = useState(false);

  // Mock data para demo
  const mockUser: KBUser = {
    id: '1',
    name: 'Israel Saavedra',
    email: 'israel@utalk.com',
    avatar: '/avatars/israel.jpg',
    role: 'admin',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'AI/ML'],
    preferences: {
      language: 'es',
      theme: 'dark',
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
  };

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'new-content',
      title: 'Nuevo contenido disponible',
      message: 'Se ha publicado "Guía de Ventas 2024"',
      resourceId: '1',
      userId: '1',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '2',
      type: 'course-assigned',
      title: 'Curso asignado',
      message: 'Te han asignado "Certificación en Producto"',
      courseId: '1',
      userId: '1',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
  ];

  useEffect(() => {
    setState(prev => ({
      ...prev,
      user: mockUser,
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.read).length
    }));
  }, []);

  const handleViewChange = (view: KnowledgeBaseView) => {
    setState(prev => ({
      ...prev,
      currentView: view,
      currentResource: undefined,
      currentCourse: undefined,
      currentCollection: undefined
    }));
  };

  const handleResourceSelect = (resource: Resource) => {
    setState(prev => ({
      ...prev,
      currentResource: resource,
      rightPanelOpen: true,
      rightPanelTab: 'info'
    }));
  };

  const handleCourseSelect = (course: Course) => {
    setState(prev => ({
      ...prev,
      currentCourse: course,
      rightPanelOpen: true,
      rightPanelTab: 'info'
    }));
  };

  const handleCollectionSelect = (collection: Collection) => {
    setState(prev => ({
      ...prev,
      currentCollection: collection,
      rightPanelOpen: true,
      rightPanelTab: 'info'
    }));
  };

  const handleRightPanelTabChange = (tab: RightPanelTab) => {
    setState(prev => ({
      ...prev,
      rightPanelTab: tab
    }));
  };

  const handleModalToggle = (modal: keyof KnowledgeBaseState['modals']) => {
    setState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modal]: !prev.modals[modal]
      }
    }));
  };

  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      isSearching: true
    }));
    
    // Simular búsqueda
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isSearching: false,
        searchResults: []
      }));
    }, 1000);
  };

  const handleRAGQuery = (query: string) => {
    setState(prev => ({
      ...prev,
      ragQuery: query,
      isRAGLoading: true
    }));
    
    // Simular RAG
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isRAGLoading: false,
        ragResponse: {
          answer: 'Esta es una respuesta simulada del RAG.',
          sources: [],
          citations: [],
          confidence: 0.85,
          query: query,
          processingTime: 1200,
          metadata: {
            totalChunks: 100,
            retrievedChunks: 5,
            rerankedChunks: 3,
            searchTime: 800,
            embeddingTime: 200,
            rerankTime: 150,
            summaryTime: 50
          }
        }
      }));
    }, 2000);
  };

  const renderContent = () => {
    switch (state.currentView) {
      case 'explore':
        return (
          <KnowledgeExplorer
            resources={state.resources}
            collections={state.collections}
            isLoading={state.isLoadingResources}
            error={state.resourcesError}
            onResourceSelect={handleResourceSelect}
            onCollectionSelect={handleCollectionSelect}
            viewMode={state.viewMode}
            onViewModeChange={(mode) => setState(prev => ({ ...prev, viewMode: mode }))}
            searchQuery={state.searchQuery}
            onSearch={handleSearch}
            filters={state.searchFilters}
            onFiltersChange={(filters) => setState(prev => ({ ...prev, searchFilters: filters }))}
            sort={state.searchSort}
            onSortChange={(sort) => setState(prev => ({ ...prev, searchSort: sort }))}
          />
        );
      case 'collections':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Colecciones</h2>
              <Button onClick={() => handleModalToggle('createCollection')}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Colección
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.collections.map((collection) => (
                <Card key={collection.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: collection.color + '20' }}>
                        <span className="text-lg">{collection.icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <p className="text-sm text-gray-600">{collection.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{collection.resources.length} recursos</span>
                      <span>{collection.analytics.totalViews} vistas</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return (
          <CourseModule
            courses={state.courses}
            userProgress={state.userProgress}
            isLoading={state.isLoadingCourses}
            error={state.coursesError}
            onCourseSelect={handleCourseSelect}
            onEnroll={(courseId) => {
              // Handle enrollment
            }}
          />
        );
      case 'blogs':
        return (
          <BlogModule
            onPostSelect={(post) => {
              // Handle post selection
            }}
          />
        );
      case 'news':
        return (
          <NewsModule
            onNewsSelect={(news) => {
              // Handle news selection
            }}
          />
        );
      case 'analytics':
        return <AnalyticsModule />;
      case 'admin':
        return <AdminModule />;
      default:
        return <KnowledgeExplorer
          resources={state.resources}
          collections={state.collections}
          isLoading={state.isLoadingResources}
          error={state.resourcesError}
          onResourceSelect={handleResourceSelect}
          onCollectionSelect={handleCollectionSelect}
          viewMode={state.viewMode}
          onViewModeChange={(mode) => setState(prev => ({ ...prev, viewMode: mode }))}
          searchQuery={state.searchQuery}
          onSearch={handleSearch}
          filters={state.searchFilters}
          onFiltersChange={(filters) => setState(prev => ({ ...prev, searchFilters: filters }))}
          sort={state.searchSort}
          onSortChange={(sort) => setState(prev => ({ ...prev, searchSort: sort }))}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${state.sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {state.sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Base de Conocimiento</h1>
                <p className="text-xs text-gray-600">UTalk Ultra</p>
              </div>
            )}
          </div>
          </div>
          
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'explore', label: 'Explorar', icon: Search, count: state.resources.length },
            { id: 'collections', label: 'Colecciones', icon: BookOpen, count: state.collections.length },
            { id: 'courses', label: 'Cursos', icon: GraduationCap, count: state.courses.length },
            { id: 'blogs', label: 'Blogs', icon: FileText, count: 0 },
            { id: 'news', label: 'Noticias', icon: Newspaper, count: 0 },
            { id: 'analytics', label: 'Analítica', icon: BarChart3, count: 0 },
            { id: 'admin', label: 'Administración', icon: Settings, count: 0 }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id as KnowledgeBaseView)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                state.currentView === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {state.sidebarOpen && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        {state.sidebarOpen && state.user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={state.user.avatar} />
                <AvatarFallback>{state.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {state.user.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {state.user.role}
                </p>
              </div>
            </div>
                </div>
        )}
                </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {state.currentView === 'explore' && 'Explorar Conocimiento'}
                  {state.currentView === 'collections' && 'Colecciones'}
                  {state.currentView === 'courses' && 'Cursos'}
                  {state.currentView === 'blogs' && 'Blogs'}
                  {state.currentView === 'news' && 'Noticias'}
                  {state.currentView === 'analytics' && 'Analítica'}
                  {state.currentView === 'admin' && 'Administración'}
                </h2>
                </div>
                </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar conocimiento... (Cmd+K)"
                  className="pl-10 w-80"
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(state.searchQuery);
                    }
                  }}
                />
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalToggle('upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRAGPanel(true)}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Copiloto
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleModalToggle('createResource')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Nuevo Recurso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModalToggle('createCourse')}>
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Nuevo Curso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModalToggle('createCollection')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Nueva Colección
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleModalToggle('createResource')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Nuevo Blog
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModalToggle('createResource')}>
                      <Newspaper className="w-4 h-4 mr-2" />
                      Nueva Noticia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {state.unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {state.unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={state.user?.avatar} />
                        <AvatarFallback>{state.user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModalToggle('settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
                </div>
                </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              <div className="max-w-[1400px] mx-auto p-6">
                {renderContent()}
              </div>
            </div>

            {/* Right Panel */}
            {state.rightPanelOpen && (
              <RightPanel
                resource={state.currentResource}
                course={state.currentCourse}
                collection={state.currentCollection}
                activeTab={state.rightPanelTab}
                onTabChange={handleRightPanelTabChange}
                onClose={() => setState(prev => ({ ...prev, rightPanelOpen: false }))}
              />
            )}
          </div>
        </div>
      </div>

      {/* RAG Panel */}
      {showRAGPanel && (
        <RAGPanel
          onClose={() => setShowRAGPanel(false)}
          onQuery={handleRAGQuery}
          response={state.ragResponse}
          isLoading={state.isRAGLoading}
          error={state.ragError}
        />
      )}

      {/* Modals */}
      {state.modals.upload && (
        <UploadModal
          onClose={() => handleModalToggle('upload')}
          onUpload={(files) => {
            // Handle upload
            handleModalToggle('upload');
          }}
        />
      )}

      {state.modals.createResource && (
        <CreateResourceModal
          onClose={() => handleModalToggle('createResource')}
          onCreate={(resource) => {
            // Handle create
            handleModalToggle('createResource');
          }}
        />
      )}

      {state.modals.createCourse && (
        <CreateCourseModal
          onClose={() => handleModalToggle('createCourse')}
          onCreate={(course) => {
            // Handle create
            handleModalToggle('createCourse');
          }}
        />
      )}

      {state.modals.createCollection && (
        <CreateCollectionModal
          onClose={() => handleModalToggle('createCollection')}
          onCreate={(collection) => {
            // Handle create
            handleModalToggle('createCollection');
          }}
        />
      )}

      {state.modals.settings && (
        <SettingsModal
          onClose={() => handleModalToggle('settings')}
          onSave={(settings) => {
            // Handle save
            handleModalToggle('settings');
          }}
        />
      )}

      {state.modals.share && (
        <ShareModal
          resource={state.currentResource}
          onClose={() => handleModalToggle('share')}
          onShare={(shareData) => {
            // Handle share
            handleModalToggle('share');
          }}
        />
      )}

      {state.modals.export && (
        <ExportModal
          resources={state.selectedResources}
          onClose={() => handleModalToggle('export')}
          onExport={(exportData) => {
            // Handle export
            handleModalToggle('export');
          }}
        />
      )}
    </div>
  );
}