// Wrapper para asegurar que los componentes solo se rendericen cuando la auth esté lista
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthLoaded, isAuthenticated, user } = useAuth()

  // ✅ Mostrar loading mientras se carga la autenticación
  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">Cargando autenticación...</span>
      </div>
    )
  }

  // ✅ Si no está autenticado, mostrar mensaje
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No autenticado</h2>
          <p className="text-muted-foreground">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  // ✅ Si está autenticado, mostrar contenido
  return <>{children}</>
} 