// Componentes lazy para InfoPanel e IAPanel
// Reduce el bundle size cargando solo cuando se necesitan
import { lazy, Suspense } from 'react'
import { InfoPanelSkeleton, IAPanelSkeleton } from './LoaderSkeleton'

// Lazy load de InfoPanel
const InfoPanel = lazy(() => import('./InfoPanel').then(module => ({
  default: module.default
})))

// Lazy load de IAPanel
const IAPanel = lazy(() => import('./IAPanel').then(module => ({
  default: module.default
})))

// Wrapper para InfoPanel con loading
export function LazyInfoPanel(props: any) {
  return (
    <Suspense fallback={<InfoPanelSkeleton />}>
      <InfoPanel {...props} />
    </Suspense>
  )
}

// Wrapper para IAPanel con loading
export function LazyIAPanel(props: any) {
  return (
    <Suspense fallback={<IAPanelSkeleton />}>
      <IAPanel {...props} />
    </Suspense>
  )
}

export default {
  LazyInfoPanel,
  LazyIAPanel
} 