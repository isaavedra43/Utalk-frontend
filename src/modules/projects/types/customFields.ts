// Sistema de campos personalizables tipo Notion

export type CustomFieldType = 
  | 'text'           // Texto simple
  | 'number'         // Números
  | 'currency'       // Moneda
  | 'date'           // Fecha
  | 'datetime'       // Fecha y hora
  | 'select'         // Selección única
  | 'multiselect'    // Selección múltiple
  | 'checkbox'       // Checkbox
  | 'url'            // URL
  | 'email'          // Email
  | 'phone'          // Teléfono
  | 'file'           // Archivo
  | 'image'          // Imagen
  | 'relation'       // Relación con otro objeto
  | 'formula'        // Fórmula calculada
  | 'rollup'         // Agregación de datos relacionados
  | 'progress'       // Barra de progreso
  | 'rating'         // Calificación (estrellas)
  | 'color'          // Selector de color
  | 'location'       // Ubicación GPS
  | 'duration'       // Duración de tiempo
  | 'percentage'     // Porcentaje
  | 'template'       // Template reutilizable
  | 'conditional';   // Campos condicionales

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string; // Función de validación personalizada
  errorMessage?: string;
}

export interface FieldCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface FieldVisibility {
  showIf?: FieldCondition[];
  hideIf?: FieldCondition[];
  readOnly?: boolean;
  readOnlyIf?: FieldCondition[];
}

export interface FieldPermissions {
  canView: string[]; // Roles que pueden ver
  canEdit: string[]; // Roles que pueden editar
  canConfigure: string[]; // Roles que pueden configurar
}

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  description?: string;
  required: boolean;
  defaultValue?: any;
  
  // Validación
  validation?: FieldValidation;
  
  // Opciones para select/multiselect
  options?: SelectOption[];
  
  // Para fórmulas
  formula?: string;
  formulaError?: string;
  
  // Para relaciones
  relationConfig?: RelationConfig;
  
  // Para rollup
  rollupConfig?: RollupConfig;
  
  // Para campos de ubicación
  locationConfig?: LocationConfig;
  
  // Condicionales
  conditions?: FieldCondition[];
  
  // Visibilidad y permisos
  visibility?: FieldVisibility;
  permissions?: FieldPermissions;
  
  // UI
  group?: string; // Agrupar campos
  order?: number; // Orden de visualización
  width?: 'full' | 'half' | 'third' | 'quarter';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface RelationConfig {
  targetType: 'task' | 'project' | 'employee' | 'material' | 'document' | 'custom';
  targetEntity?: string;
  allowMultiple: boolean;
  required: boolean;
  displayField?: string;
  filterBy?: FieldCondition[];
}

export interface RollupConfig {
  relationField: string; // Campo de relación a usar
  propertyToRollup: string; // Propiedad a agregar
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'concat' | 'unique';
}

export interface LocationConfig {
  defaultLocation?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  allowGeofencing?: boolean;
  geofenceRadius?: number; // metros
  showMap?: boolean;
  captureAccuracy?: boolean;
}

// Valor de un custom field
export interface CustomFieldValue {
  fieldId: string;
  value: any;
  calculatedValue?: any; // Para fórmulas
  lastModified: Date;
  modifiedBy: string;
}

// Configuración de custom fields para un proyecto
export interface CustomFieldsConfig {
  fields: CustomField[];
  groups: FieldGroup[];
  layout: 'single_column' | 'two_columns' | 'grid' | 'custom';
}

export interface FieldGroup {
  id: string;
  name: string;
  description?: string;
  fields: string[]; // IDs de campos
  collapsible: boolean;
  defaultExpanded: boolean;
  order: number;
}

