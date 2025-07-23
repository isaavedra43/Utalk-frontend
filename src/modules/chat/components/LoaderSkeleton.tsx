// ✅ OPTIMIZACIÓN: Re-exportar skeletons desde archivos separados
// Reduce bundle size y mejora organización
export { 
  Skeleton,
  ConversationItemSkeleton,
  ConversationListSkeleton,
  MessageBubbleSkeleton,
  ChatWindowSkeleton,
  IAPanelSkeleton,
  InfoPanelSkeleton
} from './skeletons'

// ✅ ELIMINADO: Componentes duplicados reemplazados por imports desde skeletons/ 