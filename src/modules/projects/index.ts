export { ProjectsModule } from './ProjectsModule';

// Exportar hooks para uso en otros componentes
export * from './hooks/useProjects';
export * from './hooks/useTasks';
export * from './hooks/useBudget';
export * from './hooks/useTeam';
export * from './hooks/useTimeline';
export * from './hooks/useCustomFields';
export * from './hooks/useViews';
export * from './hooks/useAutomations';
export * from './hooks/useIntegrations';
export * from './hooks/useMaterials';
export * from './hooks/useAnalytics';

// Exportar tipos principales
export type { Project, Task, ProjectMaterial, TeamMember, ProjectRisk } from './types';

// Exportar servicios
export { projectsService } from './services/projectsService';
export { tasksService } from './services/tasksService';
export { budgetService } from './services/budgetService';

// Exportar datos mock para testing
export { mockProjects, mockTasks, mockProject } from './data/mockData';

