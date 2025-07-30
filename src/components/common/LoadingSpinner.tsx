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
  // ✅ LOGGING CRÍTICO PARA ENCONTRAR EL ERROR
  console.log('[LOADING-SPINNER] Props received:', {
    size,
    className,
    text,
    sizeType: typeof size,
    classNameType: typeof className,
    textType: typeof text,
    hasLength: {
      size: size?.length,
      className: className?.length,
      text: text?.length
    }
  })

  // ✅ VALIDACIÓN DEFENSIVA ULTRA-ROBUSTA
  const safeSize = size || 'md'
  const safeClassName = className || ''
  const safeText = text || ''

  console.log('[LOADING-SPINNER] Safe values:', {
    safeSize,
    safeClassName,
    safeText
  })

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  // ✅ VALIDACIÓN DE SIZE CON LOGGING
  const sizeClass = sizeClasses[safeSize as keyof typeof sizeClasses] || sizeClasses.md
  console.log('[LOADING-SPINNER] Size class selected:', sizeClass)

  try {
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
  } catch (error) {
    console.error('[LOADING-SPINNER] Error during render:', error)
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8" />
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    )
  }
}

export default LoadingSpinner 