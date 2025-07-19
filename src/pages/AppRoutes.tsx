// Configuración principal de rutas de la aplicación
// Define todas las rutas, layouts y protección de autenticación
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Páginas de autenticación
import LoginPage from './auth/LoginPage'
import RegisterPage from './auth/RegisterPage'

// Páginas principales
import DashboardPage from './DashboardPage'
import NotFoundPage from './NotFoundPage'

// Módulos implementados
import { Inbox } from '@/modules/chat/Inbox'
import { CRM } from '@/modules/crm'

// Módulos de Agentes, Campañas y Conocimiento
import { AgentsDashboard } from '@/modules/agents/components/AgentsDashboard'
import { CampaignsDashboard } from '@/modules/campaigns/components/CampaignsDashboard'
import { KnowledgeDashboard } from '@/modules/knowledge/components/KnowledgeDashboard'

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth()

  if (!isAuthReady) {
    // ✅ CORRECCIÓN: Usar isAuthReady en lugar de isLoading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente para rutas públicas (solo accesibles sin autenticación)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth()

  if (!isAuthReady) {
    // ✅ CORRECCIÓN: Usar isAuthReady en lugar de isLoading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
      </Route>

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Módulos implementados */}
        <Route path="chat" element={<Inbox />} />
        <Route path="chat/:conversationId" element={<Inbox />} />
        <Route path="crm" element={<CRM />} />
        
        {/* 🎯 MÓDULOS NUEVOS - Agentes, Campañas y Conocimiento */}
        <Route path="agents" element={<AgentsDashboard />} />
        <Route path="campaigns" element={<CampaignsDashboard />} />
        <Route path="knowledge" element={<KnowledgeDashboard />} />
        
        {/* TODO: Rutas de módulos futuros */}
        {/* <Route path="team/*" element={<TeamPage />} /> */}
        {/* <Route path="settings/*" element={<SettingsPage />} /> */}
      </Route>

      {/* Rutas de autenticación directas (redirects) */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes 