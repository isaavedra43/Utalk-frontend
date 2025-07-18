// Componentes skeleton para estados de carga
// Proporciona feedback visual mientras se cargan datos
interface SkeletonProps {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

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

export default {
  ConversationItemSkeleton,
  ConversationListSkeleton,
  MessageBubbleSkeleton,
  ChatWindowSkeleton,
  IAPanelSkeleton,
  InfoPanelSkeleton
} 