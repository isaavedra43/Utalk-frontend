// Wrapper para asegurar que los componentes solo se rendericen cuando la auth esté lista
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean // ✅ NUEVO: Opcional para requerir autenticación
}

export function AuthWrapper({ children, fallback, requireAuth = false }: AuthWrapperProps) {
  const { isAuthReady, isAuthenticated, user } = useAuth()

  // ✅ MOSTRAR LOADING HASTA QUE AUTH ESTÉ COMPLETAMENTE LISTA
  if (!isAuthReady) {
    console.log('[AUTH_WRAPPER] Auth no está lista, mostrando loading...')
    return fallback || <LoadingSpinner />
  }

  // ✅ SI REQUIERE AUTH Y NO ESTÁ AUTENTICADO, NO RENDERIZAR
  if (requireAuth && (!isAuthenticated || !user)) {
    console.log('[AUTH_WRAPPER] Requiere auth pero usuario no autenticado, no renderizando contenido protegido')
    return null
  }

  console.log('[AUTH_WRAPPER] ✅ Auth lista, renderizando contenido', {
    isAuthenticated,
    hasUser: !!user,
    requireAuth
  })
  return <>{children}</>
} 