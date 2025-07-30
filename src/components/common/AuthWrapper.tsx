// Wrapper para asegurar que los componentes solo se rendericen cuando la auth esté lista
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { isAuthReady, isAuthenticated, user } = useAuth()

  // ✅ MOSTRAR LOADING HASTA QUE AUTH ESTÉ COMPLETAMENTE LISTA
  if (!isAuthReady) {
    console.log('[AUTH_WRAPPER] Auth no está lista, mostrando loading...')
    return fallback || <LoadingSpinner />
  }

  // ✅ SI NO ESTÁ AUTENTICADO, NO RENDERIZAR CONTENIDO PROTEGIDO
  if (!isAuthenticated || !user) {
    console.log('[AUTH_WRAPPER] Usuario no autenticado, no renderizando contenido protegido')
    return null
  }

  console.log('[AUTH_WRAPPER] ✅ Auth lista y usuario autenticado, renderizando contenido')
  return <>{children}</>
} 