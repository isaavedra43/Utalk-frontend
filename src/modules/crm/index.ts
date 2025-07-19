// Exportaciones del módulo CRM de UTalk
// Punto de entrada para todos los componentes del CRM

// Componente principal
export { default as CRM } from './CRM'

// Componentes individuales
export { default as KPIStatsPanel } from './KPIStatsPanel'
export { default as CRMToolbar } from './CRMToolbar'
export { default as ContactsTable } from './ContactsTable'
export { default as ContactsCards } from './ContactsCards'
export { default as CRMLeftSidebar } from './CRMLeftSidebar'

// Datos mock y tipos
export * from './mockContacts'

// Tipos para consumo externo
export type { CRMViewMode } from './CRMToolbar'
export type { CRMFilters } from './CRMLeftSidebar' 