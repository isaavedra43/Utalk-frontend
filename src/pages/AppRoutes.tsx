// Configuración de rutas principales de la aplicación
// ✅ EMAIL-FIRST: Rutas protegidas y autenticación
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

// Auth pages
import { LoginPage } from './auth/LoginPage'
import { RegisterPage } from './auth/RegisterPage'

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Protected pages (lazy loaded)
const DashboardPage = lazy(() => import('./DashboardPage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))

// Module components (lazy loaded)
const AgentsDashboard = lazy(() => import('@/modules/agents/components/AgentsDashboard'))
const KnowledgeDashboard = lazy(() => import('@/modules/knowledge/components/KnowledgeDashboard'))
const CRMDashboard = lazy(() => import('@/modules/crm/CRM'))

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route index element={<Navigate to="/auth/login" replace />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />

        <Route
          path="crm"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CRMDashboard />
            </Suspense>
          }
        />

        <Route
          path="agents"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AgentsDashboard />
            </Suspense>
          }
        />


        <Route
          path="knowledge"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <KnowledgeDashboard />
            </Suspense>
          }
        />

        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback for unmatched routes */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}