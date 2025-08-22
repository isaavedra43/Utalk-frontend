
import React, { memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { AuthModule } from './modules/auth'
import { ForgotPasswordForm } from './modules/auth/components/ForgotPasswordForm'
import { MainLayout } from './components/layout/MainLayout'
import { ErrorBoundary } from './components/dashboard/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'



// import { logger } from './utils/logger' // DESHABILITADO - No se usa

import { useAuthContext } from './contexts/useAuthContext'

// FORZAR ACTUALIZACIÓN DE VERCEL - Commit a00c0f1 aplicado
// Autenticación manual obligatoria implementada

// Componente de protección de rutas - OPTIMIZADO
const AuthProtectedRoute: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verificando autenticación...
          </h3>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
});

AuthProtectedRoute.displayName = 'AuthProtectedRoute';

// Componente para el módulo de chat
const ChatPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de dashboard
const DashboardPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de equipo
const TeamPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de clientes
const ClientsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};



function App() {


  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <WebSocketProvider>
            <div className="app">
              {/* Componente de debug para workspaceId - DESHABILITADO */}
      
              
              <Routes>
              <Route path="/login" element={<AuthModule />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route 
                path="/chat" 
                element={
                  <AuthProtectedRoute>
                    <ProtectedRoute moduleId="chat">
                      <ChatPage />
                    </ProtectedRoute>
                  </AuthProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <AuthProtectedRoute>
                    <ProtectedRoute moduleId="dashboard">
                      <DashboardPage />
                    </ProtectedRoute>
                  </AuthProtectedRoute>
                } 
              />
              <Route 
                path="/team" 
                element={
                  <AuthProtectedRoute>
                    <ProtectedRoute moduleId="team">
                      <TeamPage />
                    </ProtectedRoute>
                  </AuthProtectedRoute>
                } 
              />
              <Route 
                path="/clients" 
                element={
                  <AuthProtectedRoute>
                    <ProtectedRoute moduleId="clients">
                      <ClientsPage />
                    </ProtectedRoute>
                  </AuthProtectedRoute>
                } 
              />

              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            

          </div>
        </WebSocketProvider>
      </AuthProvider>
        </ErrorBoundary>
    </Router>
  )
}

export default App
