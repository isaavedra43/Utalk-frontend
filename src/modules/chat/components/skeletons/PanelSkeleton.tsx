// Skeleton para paneles laterales
import { Skeleton } from './Skeleton'

export function IAPanelSkeleton() {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      {/* Header skeleton */}
      <Skeleton className="h-6 w-32 mb-4" />
      
      {/* AI Assistant card skeleton */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Suggested responses skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
      
      {/* Input skeleton */}
      <div className="mt-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function InfoPanelSkeleton() {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
      {/* Header skeleton */}
      <Skeleton className="h-6 w-32 mb-4" />
      
      {/* Contact info skeleton */}
      <div className="text-center mb-6">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
        <Skeleton className="h-5 w-24 mx-auto mb-1" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      
      {/* Details skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
      
      {/* Tags skeleton */}
      <div className="mt-6">
        <Skeleton className="h-4 w-16 mb-3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
} 