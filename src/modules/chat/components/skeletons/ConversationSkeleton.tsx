// Skeleton para elementos de conversación
import { Skeleton } from './Skeleton.tsx'

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 border-b border-gray-200 dark:border-gray-700">
      {/* Avatar skeleton */}
      <Skeleton className="w-10 h-10 rounded-full" />
      
      <div className="flex-1 space-y-2">
        {/* Nombre skeleton */}
        <Skeleton className="h-4 w-24" />
        
        {/* Mensaje skeleton */}
        <Skeleton className="h-3 w-32" />
      </div>
      
      <div className="text-right space-y-2">
        {/* Tiempo skeleton */}
        <Skeleton className="h-3 w-12" />
        
        {/* Badge skeleton */}
        <Skeleton className="h-4 w-8 ml-auto" />
      </div>
    </div>
  )
}

export function ConversationListSkeleton() {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header skeleton */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-32 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 p-3">
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Conversation items skeleton */}
      <div className="overflow-y-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ConversationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
} 