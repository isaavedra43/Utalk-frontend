// Módulo de Configuración
// Configuración de usuario, aplicación, integraciones y preferencias

// Rutas del módulo
export const settingsRoutes = {
  index: '/settings',
  profile: '/settings/profile',
  account: '/settings/account',
  notifications: '/settings/notifications',
  integrations: '/settings/integrations',
  appearance: '/settings/appearance',
  security: '/settings/security',
  billing: '/settings/billing'
}

// Componentes del módulo
export { Settings } from './Settings'

// TODO: Exportar servicios cuando estén implementados
// export { settingsService } from './services/settingsService'

// TODO: Exportar hooks cuando estén implementados
// export { useSettings } from './hooks/useSettings'

// TODO: Exportar tipos cuando estén implementados
// export type { UserSettings, AppSettings, Integration, Notification } from './types'