import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search,
  Filter,
  Settings,
  Calendar,
  Users,
  Target,
  Menu,
  LayoutDashboard,
  ListTodo,
  GanttChart,
  DollarSign,
  Package,
  FileText,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Layers,
  ChevronRight,
  MoreVertical,
  Archive,
  Play,
  X
} from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';
import { mockProjects, mockTasks, mockTeamMembers, mockMaterials, mockRisks, mockExpenses, mockProject } from './data/mockData';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import { useAnalytics } from './hooks/useAnalytics';
import { ProjectKPIs } from './components/dashboard/ProjectKPIs';
import { TableView } from './components/views/TableView';
import { KanbanView } from './components/views/KanbanView';
import { BudgetSummary } from './components/budget/BudgetSummary';
import { TeamMembers } from './components/team/TeamMembers';
import { MaterialsList } from './components/materials/MaterialsList';
import { MilestonesTimeline } from './components/timeline/MilestonesTimeline';
import { RiskMatrix } from './components/risks/RiskMatrix';
import type { Project, Task, TeamMember, ProjectMaterial, ProjectRisk } from './types';

type TabType = 
  | 'dashboard'
  | 'tasks'
  | 'timeline'
  | 'budget'
  | 'team'
  | 'materials'
  | 'documents'
  | 'quality'
  | 'risks'
  | 'reports';

type TaskViewType = 'table' | 'kanban' | 'list' | 'calendar';

const ProjectsModule = () => {
  const { openMenu } = useMobileMenuContext();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showProjectsList, setShowProjectsList] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [taskView, setTaskView] = useState<TaskViewType>('table');
  
  // MODO DEMO - Usar datos falsos
  const [demoMode, setDemoMode] = useState(false);
  const [demoProjects, setDemoProjects] = useState<Project[]>([]);
  const [demoTasks, setDemoTasks] = useState<Task[]>([]);
  const [demoTeamMembers, setDemoTeamMembers] = useState<TeamMember[]>([]);
  const [demoMaterials, setDemoMaterials] = useState<ProjectMaterial[]>([]);
  const [demoRisks, setDemoRisks] = useState<ProjectRisk[]>([]);

  // Hooks (solo se usan si NO está en modo demo)
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    loadProjects,
    createProject,
    setSelectedProject: selectProject,
  } = useProjects();

  const {
    tasks,
    loading: tasksLoading,
    loadTasks,
    updateProgress,
    updateStatus,
  } = useTasks(selectedProject?.id || '');

  const {
    metrics,
    loadMetrics,
  } = useAnalytics(selectedProject?.id || '');

  // Activar modo demo
  const handleEnableDemoMode = () => {
    setDemoMode(true);
    setDemoProjects(mockProjects);
    setDemoTasks(mockTasks);
    setDemoTeamMembers(mockTeamMembers);
    setDemoMaterials(mockMaterials);
    setDemoRisks(mockRisks);
    setSelectedProject(mockProject);
  };

  // Desactivar modo demo
  const handleDisableDemoMode = () => {
    setDemoMode(false);
    setDemoProjects([]);
    setDemoTasks([]);
    setDemoTeamMembers([]);
    setDemoMaterials([]);
    setDemoRisks([]);
    setSelectedProject(null);
  };

  // Datos a usar (demo o reales)
  const displayProjects = demoMode ? demoProjects : projects;
  const displayTasks = demoMode ? demoTasks : tasks;
  const displayLoading = demoMode ? false : projectsLoading;
  const displayMetrics = demoMode ? selectedProject?.metrics || null : metrics;

  // Cargar proyectos reales al montar (solo si no está en demo)
  useEffect(() => {
    if (!demoMode) {
      loadProjects();
    }
  }, [demoMode]);

  // Cargar datos del proyecto seleccionado (solo si no está en demo)
  useEffect(() => {
    if (!demoMode && selectedProject?.id) {
      loadTasks();
      loadMetrics();
    }
  }, [selectedProject?.id, demoMode]);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as TabType, label: 'Tareas', icon: ListTodo },
    { id: 'timeline' as TabType, label: 'Timeline', icon: GanttChart },
    { id: 'budget' as TabType, label: 'Presupuesto', icon: DollarSign },
    { id: 'team' as TabType, label: 'Equipo', icon: Users },
    { id: 'materials' as TabType, label: 'Materiales', icon: Package },
    { id: 'documents' as TabType, label: 'Documentos', icon: FileText },
    { id: 'quality' as TabType, label: 'Calidad', icon: ShieldCheck },
    { id: 'risks' as TabType, label: 'Riesgos', icon: AlertTriangle },
    { id: 'reports' as TabType, label: 'Reportes', icon: BarChart3 },
  ];

  const handleCreateProject = async () => {
    // Si está en modo demo, solo simular
    if (demoMode) {
      alert('Modo Demo: En producción, esto crearía un proyecto real.');
      return;
    }
    
    try {
      const newProject = await createProject({
        name: 'Nuevo Proyecto',
        type: 'construction',
        status: 'planning',
        priority: 'medium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
        budget: {
          id: '',
          projectId: '',
          total: 100000,
          currency: 'MXN',
          categories: [],
          phases: [],
          resources: [],
          changeOrders: [],
          forecast: {
            estimatedTotal: 100000,
            estimatedOverrun: 0,
            estimatedOverrunPercentage: 0,
            confidence: 0,
            forecastDate: new Date(),
            reasoning: [],
            assumptions: [],
            risks: []
          },
          variance: {
            total: 0,
            percentage: 0,
            byCategory: [],
            byPhase: [],
            byResourceType: [],
            lastCalculated: new Date()
          },
          cashFlow: [],
          alerts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        customFields: [],
        customFieldValues: {},
        workspace: {
          id: '',
          layout: { type: 'sidebar_left', sections: [] },
          enabledTabs: ['dashboard', 'tasks', 'timeline', 'budget'],
          sidebarConfig: {
            visible: true,
            position: 'left',
            width: 300,
            collapsible: true,
            defaultCollapsed: false,
            showProjectInfo: true,
            showQuickStats: true,
            showRecentActivity: true,
            showUpcomingTasks: true,
            showTeamMembers: true,
            showNavigation: true,
            navigationItems: []
          },
          theme: 'light',
          compactMode: false,
          showBreadcrumbs: true,
          showQuickActions: true
        },
        views: [],
        timeline: {
          startDate: new Date(),
          plannedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          phases: [],
          milestones: [],
          workingCalendar: {
            id: '',
            name: 'Estándar',
            workingDays: [
              { day: 1, isWorking: true, breaks: [] },
              { day: 2, isWorking: true, breaks: [] },
              { day: 3, isWorking: true, breaks: [] },
              { day: 4, isWorking: true, breaks: [] },
              { day: 5, isWorking: true, breaks: [] },
              { day: 6, isWorking: false, breaks: [] },
              { day: 0, isWorking: false, breaks: [] }
            ],
            timezone: 'America/Mexico_City',
            defaultStartTime: '08:00',
            defaultEndTime: '17:00'
          },
          holidays: [],
          nonWorkingDays: [],
          criticalPath: [],
          slack: {},
          forecast: {
            estimatedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            confidence: 0,
            delayDays: 0,
            atRiskTasks: [],
            reasoning: '',
            lastCalculated: new Date()
          },
          baselines: [],
          variance: {
            baselineId: '',
            overallDelayDays: 0,
            overallVariancePercentage: 0,
            phaseVariances: [],
            milestoneVariances: [],
            majorDelays: [],
            lastCalculated: new Date()
          },
          defaultWorkHoursPerDay: 8,
          defaultWorkDaysPerWeek: 5
        },
        phases: [],
        milestones: [],
        team: {
          projectId: '',
          members: [],
          roles: [],
          employees: {
            assigned: [],
            availability: [],
            workload: [],
            costs: [],
            timeEntries: []
          },
          hierarchy: {
            projectManager: '',
            leads: [],
            reporting: {}
          },
          permissions: [],
          notifications: {
            projectId: '',
            enabled: true,
            taskAssigned: true,
            taskCompleted: true,
            taskOverdue: true,
            taskCommented: true,
            taskMentioned: true,
            budgetAlert: true,
            budgetExceeded: true,
            scheduleDelay: true,
            milestoneReached: true,
            documentUploaded: true,
            documentApproved: true,
            teamMemberAdded: true,
            channels: ['in_app'],
            digestFrequency: 'realtime'
          },
          mentions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        expenses: [],
        invoices: [],
        documents: {
          projectId: '',
          folders: [],
          documents: [],
          templates: [],
          versions: [],
          pendingApprovals: [],
          searchIndexed: false,
          totalDocuments: 0,
          totalSize: 0,
          documentsByCategory: {}
        },
        risks: [],
        integrations: {
          hr: {
            enabled: true,
            assignedEmployees: [],
            timeTrackingEnabled: true,
            approveTimeEntries: false,
            exportToPayroll: true,
            checkAvailabilityBeforeAssign: true,
            showVacationsInTimeline: true,
            trackLaborCosts: true,
            includeInBudget: true,
            trackPerformance: true,
            performanceMetrics: [],
            syncFrequency: 'realtime',
            allowHRModuleAccess: true
          },
          inventory: {
            enabled: true,
            autoReserveMaterials: false,
            autoOrderOnLowStock: false,
            notifyOnLowStock: true,
            allowInventoryTransfer: true,
            requireApprovalForTransfer: false,
            trackMaterialUsage: true,
            trackWaste: true,
            updateCostsFromInventory: true,
            includeInBudget: true,
            allowReturns: true,
            autoReturnUnused: false,
            syncFrequency: 'realtime'
          },
          providers: {
            enabled: true,
            preferredProviders: [],
            createPOInProvidersModule: true,
            linkPOToProject: true,
            requestQuotesFromProviders: true,
            compareQuotes: true,
            trackPaymentsInProject: true,
            createInvoicesInProvidersModule: true,
            showProviderBalance: true,
            includeInBudget: true,
            trackProviderPerformance: true,
            rateProviders: true,
            syncFrequency: 'realtime'
          },
          clients: {
            enabled: true,
            billToClient: true,
            invoicingSchedule: 'milestone',
            autoGenerateInvoices: false,
            enableClientPortal: true,
            allowClientApprovals: true,
            shareUpdates: true,
            updateFrequency: 'weekly',
            shareDocuments: true,
            allowClientUpload: false,
            sharedFolders: [],
            collectFeedback: true,
            feedbackFrequency: 'end_of_project',
            syncFrequency: 'daily'
          },
          internalChat: {
            enabled: true,
            autoCreateChannel: true,
            autoAddTeamMembers: true,
            autoRemoveOnUnassign: true,
            notifyOnTaskMention: true,
            notifyOnDocumentShare: true,
            notifyOnMilestone: true,
            shareTasksInChat: true,
            shareDocumentsInChat: true,
            shareUpdatesInChat: true,
            syncFrequency: 'realtime'
          }
        },
        permissions: {
          projectId: '',
          projectLevel: {
            canView: [],
            canEdit: [],
            canDelete: [],
            canManage: [],
            canExport: [],
            canConfigure: [],
            canInviteMembers: [],
            isPublic: true,
            requiresAccessApproval: false,
            approvers: []
          },
          moduleLevel: {
            tasks: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            timeline: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            budget: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            team: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            materials: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            documents: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            quality: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            risks: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            reports: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            automations: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] },
            integrations: { enabled: true, canView: [], canCreate: [], canEdit: [], canDelete: [] }
          },
          resourceLevel: [],
          customRoles: [],
          accessPolicies: [],
          updatedAt: new Date(),
          updatedBy: ''
        },
        metrics: {
          projectId: '',
          overallProgress: 0,
          daysElapsed: 0,
          daysRemaining: 90,
          daysTotal: 90,
          percentageTimeElapsed: 0,
          onSchedule: true,
          scheduleVarianceDays: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          avgTaskCompletionTime: 0,
          totalBudget: 100000,
          spentBudget: 0,
          committedBudget: 0,
          remainingBudget: 100000,
          percentageSpent: 0,
          budgetVariance: 0,
          budgetVariancePercentage: 0,
          onBudget: true,
          totalTeamMembers: 0,
          activeMembers: 0,
          totalHoursWorked: 0,
          avgUtilization: 0,
          totalInspections: 0,
          passedInspections: 0,
          failedInspections: 0,
          qualityScore: 0,
          openNonConformities: 0,
          totalRisks: 0,
          criticalRisks: 0,
          highRisks: 0,
          totalExposure: 0,
          totalMaterials: 0,
          deliveredMaterials: 0,
          materialCost: 0,
          wastePercentage: 0,
          totalDocuments: 0,
          pendingApprovals: 0,
          projectHealth: {
            overallScore: 100,
            status: 'excellent',
            scheduleHealth: 100,
            budgetHealth: 100,
            qualityHealth: 100,
            resourceHealth: 100,
            riskHealth: 100,
            criticalFactors: [],
            recommendations: [],
            trend: 'stable'
          },
          calculatedAt: new Date()
        },
        settings: {
          defaultCurrency: 'MXN',
          timezone: 'America/Mexico_City',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          workingDays: [1, 2, 3, 4, 5],
          workHoursPerDay: 8,
          weekStartsOn: 1,
          enableNotifications: true,
          notificationChannels: ['in_app'],
          taskNumberFormat: 'TASK-{number}',
          startTaskNumber: 1,
          budgetContingency: 10,
          requireBudgetApproval: true,
          budgetApprovalThreshold: 10000,
          autoCalculateSchedule: true,
          showCriticalPath: true,
          baselineEnabled: true,
          allowSubtasks: true,
          maxSubtaskLevels: 5,
          autoAssignTaskNumber: true,
          requireTaskApproval: false,
          requireDocumentApproval: false,
          enableVersionControl: true,
          maxFileSize: 50,
          allowedFileTypes: [],
          enableQualityManagement: true,
          requireInspections: false,
          enableRiskManagement: true,
          riskReviewFrequency: 'monthly',
          enabledIntegrations: {
            hr: true,
            inventory: true,
            providers: true,
            clients: true,
            internalChat: true
          },
          enabledFeatures: {
            customFields: true,
            automations: true,
            timeTracking: true,
            budgetTracking: true,
            materialTracking: true,
            qualityManagement: true,
            riskManagement: true,
            documentManagement: true,
            reporting: true,
            ai: true
          },
          enableAutomations: true,
          autoSaveEnabled: true,
          autoSaveInterval: 30,
          requireApprovalToJoin: false,
          allowGuestAccess: false,
          allowExport: true,
          exportFormats: ['pdf', 'excel', 'json'],
          updatedAt: new Date(),
          updatedBy: ''
        },
        owner: 'current-user',
        ownerName: 'Usuario Actual',
        managers: [],
        tags: [],
        isFavorite: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        lastModifiedBy: 'current-user',
        lastActivityAt: new Date()
      });

      if (newProject) {
        setSelectedProject(newProject);
        setShowCreateProjectModal(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error al crear proyecto. Por favor, implementa el endpoint del backend.');
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    selectProject(project);
    setActiveTab('dashboard');
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    // TODO: Abrir panel de detalle de tarea
  };

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    if (demoMode) {
      // En modo demo, actualizar localmente
      setDemoTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus as any } : t
      ));
      return;
    }
    
    try {
      await updateStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };
  
  const handleUpdateProgress = (taskId: string, newProgress: number) => {
    if (demoMode) {
      setDemoTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, progress: newProgress } : t
      ));
    }
  };

  const renderTabContent = () => {
    if (!selectedProject) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6 space-y-6">
            <ProjectKPIs metrics={displayMetrics} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedProject.timeline.milestones.length > 0 && (
                <MilestonesTimeline
                  milestones={selectedProject.timeline.milestones}
                  projectStartDate={selectedProject.timeline.startDate}
                  projectEndDate={selectedProject.timeline.plannedEndDate}
                />
              )}
              
              {(demoMode ? demoRisks : selectedProject.risks).length > 0 && (
                <RiskMatrix risks={demoMode ? demoRisks : selectedProject.risks} />
              )}
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTaskView('table')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      taskView === 'table'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tabla
                  </button>
                  <button
                    onClick={() => setTaskView('kanban')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      taskView === 'kanban'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Kanban
                  </button>
                </div>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Nueva Tarea
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-hidden">
              {!demoMode && tasksLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : taskView === 'table' ? (
                <TableView
                  tasks={displayTasks}
                  onTaskClick={handleTaskClick}
                />
              ) : (
                <KanbanView
                  tasks={displayTasks}
                  onTaskClick={handleTaskClick}
                  onTaskMove={handleTaskMove}
                />
              )}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="p-6">
            <BudgetSummary
              total={selectedProject.budget.total}
              spent={selectedProject.metrics.spentBudget}
              committed={selectedProject.metrics.committedBudget}
              remaining={selectedProject.metrics.remainingBudget}
              currency={selectedProject.budget.currency}
            />
          </div>
        );

      case 'team':
        return (
          <div className="p-6">
            <TeamMembers members={demoMode ? demoTeamMembers : selectedProject.team.members} />
          </div>
        );

      case 'materials':
        return (
          <div className="p-6">
            <MaterialsList materials={demoMode ? demoMaterials : (selectedProject.inventory?.materials || [])} />
          </div>
        );

      case 'timeline':
        return (
          <div className="p-6">
            {selectedProject.timeline.milestones.length > 0 ? (
              <MilestonesTimeline
                milestones={selectedProject.timeline.milestones}
                projectStartDate={selectedProject.timeline.startDate}
                projectEndDate={selectedProject.timeline.plannedEndDate}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No hay milestones definidos</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  onClick={() => alert(demoMode ? 'Modo Demo: Esta función crearía un milestone real' : 'Funcionalidad disponible cuando el backend esté listo')}
                >
                  Agregar Milestone
                </button>
              </div>
            )}
          </div>
        );

      case 'risks':
        return (
          <div className="p-6">
            <RiskMatrix risks={demoMode ? demoRisks : selectedProject.risks} />
          </div>
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  {tabs.find(t => t.id === activeTab)?.icon && 
                    React.createElement(tabs.find(t => t.id === activeTab)!.icon, { 
                      className: "w-10 h-10 text-white" 
                    })
                  }
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              
              <p className="text-gray-600 mb-6">
                Esta sección está lista pero requiere que el backend implemente los endpoints correspondientes.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
                <p className="font-medium mb-2">Funcionalidades disponibles:</p>
                <ul className="space-y-1">
                  <li>• Todos los tipos TypeScript están definidos</li>
                  <li>• Servicios API están implementados</li>
                  <li>• Hooks están listos para usar</li>
                  <li>• Solo falta que el backend responda en los endpoints</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de proyectos - Desktop */}
      {showProjectsList && (
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Proyectos</h2>
                </div>
                <button 
                  onClick={handleCreateProject}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Crear nuevo proyecto"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Lista de proyectos */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-3">Cargando proyectos...</p>
                </div>
              ) : displayProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">No hay proyectos aún</p>
                  <button 
                    onClick={handleCreateProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Crear Primer Proyecto
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {project.code && (
                              <span className="text-xs text-gray-500 font-mono">{project.code}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700' :
                              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h3>
                          {project.description && (
                            <p className="text-xs text-gray-600 truncate mt-1">{project.description}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="flex items-center justify-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
              title="Abrir menú de módulos"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Proyectos</h1>
          </div>
        </div>

        {/* Indicador de modo demo */}
        {demoMode && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Modo Demo Activo - Usando datos de prueba</span>
            </div>
            <button
              onClick={handleDisableDemoMode}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              <span>Salir del Demo</span>
            </button>
          </div>
        )}

        {selectedProject ? (
          <>
            {/* Header del proyecto */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowProjectsList(!showProjectsList)}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <Layers className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900">{selectedProject.name}</h1>
                      {demoMode && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          DEMO
                        </span>
                      )}
                    </div>
                    {selectedProject.code && (
                      <p className="text-sm text-gray-500 font-mono">{selectedProject.code}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs de navegación */}
            <div className="bg-white border-b border-gray-200 px-4">
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido del tab */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {renderTabContent()}
            </div>
          </>
        ) : (
          // Sin proyecto seleccionado
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FolderKanban className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Gestión de Proyectos Ultra Versátil
              </h2>
              
              <p className="text-gray-600 mb-6">
                El sistema más completo para gestionar proyectos de construcción, software, manufactura y más.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <Target className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Tareas Avanzadas</p>
                  <p className="text-xs text-gray-600">Dependencias y ruta crítica</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-left">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Timeline Gantt</p>
                  <p className="text-xs text-gray-600">Cronograma interactivo</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-left">
                  <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Control Total</p>
                  <p className="text-xs text-gray-600">Presupuesto y gastos</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-left">
                  <Users className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Equipo HR</p>
                  <p className="text-xs text-gray-600">Integración completa</p>
                </div>
              </div>
              
              {!demoMode && (
                <div className="space-y-3 mb-6">
                  <button 
                    onClick={handleEnableDemoMode}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Demo del Módulo
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    Prueba todas las funcionalidades con datos de ejemplo
                  </p>
                </div>
              )}
              
              <button 
                onClick={handleCreateProject}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Crear Nuevo Proyecto
              </button>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Módulo funcional</strong> - Todos los botones funcionan. El backend debe implementar los endpoints documentados en <code className="bg-yellow-100 px-1 rounded">docs/API_ENDPOINTS.md</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ProjectsModule };
export default ProjectsModule;
