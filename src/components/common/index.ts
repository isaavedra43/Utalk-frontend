// Componentes comunes exportados
export { LoadingSpinner } from './LoadingSpinner'
export { AuthWrapper } from './AuthWrapper'

// Utilidades de componentes
export type { LoadingSpinnerProps } from './LoadingSpinner'

// Configuraciones comunes
export const SPINNER_SIZES = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
  xlarge: 'w-12 h-12'
} as const