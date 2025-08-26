
import React, { memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { AuthModule } from './modules/auth'
import { ForgotPasswordForm } from './modules/auth/components/ForgotPasswordForm'
import { MainLayout } from './components/layout/MainLayout'
import { ErrorBoundary } from './components/dashboard/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'

import { useAuthContext } from './contexts/useAuthContext'

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

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
});

AuthProtectedRoute.displayName = 'AuthProtectedRoute';

// Componente para el módulo de chat - CON PROTECCIÓN ADICIONAL
const ChatPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  
  // Protección adicional para evitar renderizado con estado inválido
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando chat...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de dashboard - CON PROTECCIÓN ADICIONAL
const DashboardPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  
  // Protección adicional para evitar renderizado con estado inválido
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando dashboard...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de equipo - CON PROTECCIÓN ADICIONAL
const TeamPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  
  // Protección adicional para evitar renderizado con estado inválido
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando equipo...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de clientes - CON PROTECCIÓN ADICIONAL
const ClientsPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  
  // Protección adicional para evitar renderizado con estado inválido
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando clientes...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

// Componente para el módulo de notificaciones - CON PROTECCIÓN ADICIONAL
const NotificationsPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuthContext();
  
  // Protección adicional para evitar renderizado con estado inválido
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando notificaciones...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout />
    </ErrorBoundary>
  );
};

function App() {
  console.log('🔍 App - Componente App renderizado');

  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <WebSocketProvider>
            <div className="app">
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
                <Route 
                  path="/notifications" 
                  element={
                    <AuthProtectedRoute>
                      <ProtectedRoute moduleId="notifications">
                        <NotificationsPage />
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
  );
}

export default App
