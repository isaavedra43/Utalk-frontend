// Skeleton para componentes de chat
import { Skeleton } from './Skeleton'

export function MessageBubbleSkeleton({ isAgent = false }: { isAgent?: boolean }) {
  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isAgent && (
        <Skeleton className="w-8 h-8 rounded-full mr-2 flex-shrink-0" />
      )}
      
      <div className={`max-w-xs ${isAgent ? 'ml-8' : 'mr-8'}`}>
        <div className={`p-3 rounded-lg ${
          isAgent 
            ? 'bg-blue-500/10' 
            : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <Skeleton className="h-3 w-12 mt-1" />
      </div>
    </div>
  )
}

export function ChatWindowSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-8 h-8 rounded" />
          ))}
        </div>
      </div>
      
      {/* Messages skeleton */}
      <div className="flex-1 overflow-y-auto p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <MessageBubbleSkeleton 
            key={i} 
            isAgent={i % 3 === 0} 
          />
        ))}
      </div>
      
      {/* Input skeleton */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  )
} 