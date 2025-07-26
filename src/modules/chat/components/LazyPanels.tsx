// Lazy loading para paneles de chat
import { lazy, Suspense } from 'react'

const InfoPanel = lazy(() => 
  import('./InfoPanel').then(module => ({
    default: module.InfoPanel
  }))
)

const IAPanel = lazy(() => 
  import('./IAPanel').then(module => ({
    default: module.IAPanel
  }))
)

export function LazyInfoPanel(props: any) {
  return (
    <Suspense fallback={<div className="w-80 bg-gray-100 animate-pulse" />}>
      <InfoPanel {...props} />
    </Suspense>
  )
}

export function LazyIAPanel(props: any) {
  return (
    <Suspense fallback={<div className="w-80 bg-gray-100 animate-pulse" />}>
      <IAPanel {...props} />
    </Suspense>
  )
} 