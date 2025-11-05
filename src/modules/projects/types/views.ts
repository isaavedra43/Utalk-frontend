// Múltiples vistas del proyecto

export type ViewType = 
  | 'table'      // Vista de tabla (tipo Excel)
  | 'kanban'     // Vista Kanban
  | 'gantt'      // Vista Gantt
  | 'calendar'   // Vista calendario
  | 'timeline'   // Vista timeline horizontal
  | 'board'      // Vista board (Notion-style)
  | 'list'       // Vista lista jerárquica
  | 'map'        // Vista de mapa
  | 'resource'   // Vista de recursos
  | 'bim';       // Vista 3D/BIM

export interface ProjectView {
  id: string;
  projectId: string;
  
  // Básico
  name: string;
  description?: string;
  type: ViewType;
  
  // Configuración específica del tipo de vista
  config: ViewConfig;
  
  // Filtros
  filters: ViewFilters;
  
  // Agrupación y ordenamiento
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Columnas visibles (para tabla/board)
  visibleColumns?: string[];
  columnOrder?: string[];
  columnWidths?: { [columnId: string]: number };
  
  // Compartir
  isPublic: boolean;
  sharedWith: string[]; // User IDs
  
  // Favorito
  isFavorite: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUsedAt?: Date;
  usageCount: number;
}

export interface ViewConfig {
  // Configuración común
  showCompleted?: boolean;
  showArchived?: boolean;
  compactMode?: boolean;
  
  // Específico por tipo de vista
  table?: TableViewConfig;
  kanban?: KanbanViewConfig;
  gantt?: GanttViewConfig;
  calendar?: CalendarViewConfig;
  timeline?: TimelineViewConfig;
  board?: BoardViewConfig;
  list?: ListViewConfig;
  map?: MapViewConfig;
  resource?: ResourceViewConfig;
  bim?: BIMViewConfig;
}

export interface TableViewConfig {
  columns: TableColumn[];
  frozenColumns?: number; // Número de columnas congeladas
  showRowNumbers: boolean;
  showFooter: boolean;
  footerCalculations?: { [columnId: string]: 'sum' | 'avg' | 'count' | 'min' | 'max' };
  rowHeight: 'compact' | 'normal' | 'comfortable';
  zebraStriping: boolean;
  conditionalFormatting?: ConditionalFormat[];
}

export interface TableColumn {
  id: string;
  field: string;
  header: string;
  width?: number;
  minWidth?: number;
  resizable: boolean;
  sortable: boolean;
  filterable: boolean;
  type: 'text' | 'number' | 'date' | 'status' | 'progress' | 'user' | 'custom';
  format?: string; // Para fechas, números, etc.
  align?: 'left' | 'center' | 'right';
  visible: boolean;
  pinned?: 'left' | 'right';
}

export interface ConditionalFormat {
  columnId: string;
  condition: {
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
    value: any;
    value2?: any; // Para 'between'
  };
  format: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: 'normal' | 'bold';
    icon?: string;
  };
}

export interface KanbanViewConfig {
  columns: KanbanColumn[];
  swimlanes?: KanbanSwimlane[];
  showWIPLimits: boolean;
  cardFields: string[]; // Campos a mostrar en la card
  cardSize: 'small' | 'medium' | 'large';
  groupSubtasksWithParent: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: string; // Estado de tarea que representa
  wipLimit?: number; // Work In Progress limit
  color?: string;
  order: number;
}

export interface KanbanSwimlane {
  id: string;
  title: string;
  groupBy: string; // Campo por el cual agrupar
  value: any;
  collapsed: boolean;
  order: number;
}

export interface GanttViewConfig {
  zoom: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  showBaseline: boolean;
  showCriticalPath: boolean;
  showDependencies: boolean;
  showProgress: boolean;
  showMilestones: boolean;
  showToday: boolean;
  showWeekends: boolean;
  groupBy?: 'phase' | 'status' | 'assignee' | 'none';
  rowHeight: number;
  barColors: {
    normal: string;
    critical: string;
    completed: string;
    delayed: string;
    milestone: string;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarViewConfig {
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  startDay: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo
  showWeekends: boolean;
  showEventDetails: boolean;
  eventSources: ('tasks' | 'milestones' | 'inspections' | 'deliveries' | 'meetings')[];
  colorBy: 'status' | 'priority' | 'assignee' | 'phase' | 'custom';
  timeFormat: '12h' | '24h';
}

export interface TimelineViewConfig {
  orientation: 'horizontal' | 'vertical';
  scale: 'day' | 'week' | 'month' | 'quarter';
  showProgress: boolean;
  showMilestones: boolean;
  groupBy?: 'phase' | 'category';
  highlightToday: boolean;
  compactMode: boolean;
}

export interface BoardViewConfig {
  cardLayout: 'compact' | 'comfortable' | 'spacious';
  cardsPerRow: number;
  showCover: boolean; // Mostrar imagen de portada
  coverField?: string; // Campo para la imagen
  fieldsVisible: string[]; // Campos a mostrar en la card
  groupBy: string;
  sortBy: string;
  showEmptyGroups: boolean;
}

export interface ListViewConfig {
  showSubtasks: boolean;
  indentSize: number; // Pixels
  showIcons: boolean;
  showProgress: boolean;
  expandAll: boolean;
  maxNestingLevel?: number;
  showPath: boolean; // Mostrar path completo
}

export interface MapViewConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  
  // Markers
  showTaskMarkers: boolean;
  showDeliveryMarkers: boolean;
  showStorageMarkers: boolean;
  markerClustering: boolean;
  
  // Zonas
  zones: MapZone[];
  showZones: boolean;
  
  // Routing
  showRoutes: boolean;
  optimizeRoutes: boolean;
  
  // Heatmap
  showHeatmap: boolean;
  heatmapMetric?: 'tasks' | 'progress' | 'issues' | 'cost';
}

export interface MapZone {
  id: string;
  name: string;
  type: 'construction' | 'storage' | 'office' | 'restricted' | 'custom';
  coordinates: {
    lat: number;
    lng: number;
  }[];
  color?: string;
  description?: string;
  taskIds: string[];
}

export interface ResourceViewConfig {
  resourceType: 'employee' | 'equipment' | 'material' | 'all';
  viewMode: 'utilization' | 'allocation' | 'availability' | 'cost';
  timeScale: 'day' | 'week' | 'month';
  showConflicts: boolean;
  showAvailability: boolean;
  colorBy: 'utilization' | 'project' | 'role';
  utilizationThresholds: {
    underutilized: number; // < %
    optimal: number; // %
    overutilized: number; // > %
  };
}

export interface BIMViewConfig {
  modelUrl?: string;
  defaultView: 'perspective' | 'top' | 'front' | 'side';
  showGrid: boolean;
  showAxis: boolean;
  enableMeasurements: boolean;
  enableSectioning: boolean;
  
  // Integración con tareas
  linkTasksToElements: boolean;
  highlightCompletedElements: boolean;
  showProgressOverlay: boolean;
  
  // Colisiones
  detectCollisions: boolean;
  showCollisions: boolean;
  
  // Navegación
  allowRotation: boolean;
  allowZoom: boolean;
  allowPan: boolean;
}

export interface ViewFilters {
  // Filtros comunes
  search?: string;
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  tags?: string[];
  dateRange?: {
    field: 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt';
    from?: Date;
    to?: Date;
  };
  
  // Filtros de progreso
  progressRange?: {
    min: number;
    max: number;
  };
  
  // Filtros de presupuesto
  budgetRange?: {
    min: number;
    max: number;
  };
  
  // Filtros de ubicación
  location?: {
    floor?: string[];
    zone?: string[];
    area?: string[];
  };
  
  // Filtros custom
  customFilters?: {
    [fieldId: string]: any;
  };
  
  // Opciones de filtro
  matchAll: boolean; // AND vs OR
}

// Configuración guardada de vista
export interface SavedView {
  id: string;
  name: string;
  type: ViewType;
  config: ViewConfig;
  filters: ViewFilters;
  
  // Favorito
  isFavorite: boolean;
  isDefault: boolean;
  
  // Compartir
  isPublic: boolean;
  sharedWith: string[];
  
  // Uso
  usageCount: number;
  lastUsedAt?: Date;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// Layout del proyecto (drag & drop de vistas)
export interface ProjectLayout {
  id: string;
  projectId: string;
  name: string;
  
  // Layout de vistas
  sections: LayoutSection[];
  
  // Configuración
  isDefault: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LayoutSection {
  id: string;
  title: string;
  viewType: ViewType;
  viewId?: string; // Vista guardada a usar
  
  // Posición y tamaño
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Configuración
  collapsible: boolean;
  collapsed: boolean;
  
  // Orden
  order: number;
}

