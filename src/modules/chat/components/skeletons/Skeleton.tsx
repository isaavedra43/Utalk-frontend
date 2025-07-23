// Componente Skeleton base para estados de carga
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
    />
  )
} 