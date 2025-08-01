// Componente de loading spinner reutilizable
// Spinner animado para estados de carga
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({
  size = 'md',
  className,
  text
}: LoadingSpinnerProps) {
  // ✅ VALIDACIÓN DEFENSIVA PARA EVITAR ERRORES
  const safeSize = size || 'md'
  const safeClassName = className || ''
  const safeText = text || ''

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  // ✅ VALIDACIÓN DE SIZE
  const sizeClass = sizeClasses[safeSize as keyof typeof sizeClasses] || sizeClasses.md

  return (
    <div className={cn('flex flex-col items-center space-y-2', safeClassName)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClass
        )}
      />
      {safeText && (
        <p className="text-sm text-muted-foreground">
          {safeText}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner