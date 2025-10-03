
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { MobileMenuProvider } from './contexts/MobileMenuContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useToast } from './hooks/useToast'
import { AppInitializer } from './components/AppInitializer'

// ✅ Módulos principales - lazy loading para optimización
const AuthModule = lazy(() => import('./modules/auth').then(m => ({ default: m.AuthModule })));
const ForgotPasswordForm = lazy(() => import('./modules/auth/components/ForgotPasswordForm').then(m => ({ default: m.ForgotPasswordForm })));
const MainLayout = lazy(() => import('./components/layout/MainLayout').then(m => ({ default: m.MainLayout })));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));
const MonitoringBubble = lazy(() => import('./components/monitoring').then(m => ({ default: m.MonitoringBubble })));
const ToastContainer = lazy(() => import('./components/ui/ToastContainer').then(m => ({ default: m.default })));
const PWAInstallPrompt = lazy(() => import('./components/pwa/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })));
const PWAUpdatePrompt = lazy(() => import('./components/pwa/PWAUpdatePrompt').then(m => ({ default: m.PWAUpdatePrompt })));

// ✅ Loading component optimizado
const PageLoader = () => (
  <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-sm text-gray-600">Cargando...</p>
    </div>
  </div>
);

// ✅ Componente principal de contenido - completamente seguro
const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const showMonitoring = true;

  return (
    <div className="app">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AuthModule />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />

          {/* ✅ TODAS las rutas protegidas usan el mismo componente MainLayout */}
          <Route path="/dashboard/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="dashboard">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/team/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="team">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/hr/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="hr">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/chat/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="chat">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/clients/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="clients">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/inventory/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="inventory">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/contacts/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="contacts">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/campaigns/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="campaigns">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/analytics/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="analytics">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/ai/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="ai">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/settings/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="settings">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/notifications/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="notifications">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/internal-chat/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="internal-chat">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/phone/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="phone">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/knowledge-base/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="knowledge-base">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/supervision/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="supervision">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/copilot/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="copilot">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/shipping/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="shipping">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          <Route path="/services/*" element={
            <ErrorBoundary>
              <ProtectedRoute moduleId="services">
                <MainLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          } />

          {/* ✅ CRÍTICO: Redirección inicial SOLO si NO hay autenticación */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>

      {/* Módulo de Monitoreo */}
      {showMonitoring && (
        <Suspense fallback={null}>
          <MonitoringBubble enabled={true} />
        </Suspense>
      )}

      {/* Componentes PWA */}
      <Suspense fallback={null}>
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
      </Suspense>

      {/* Contenedor de Toasts */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

function App() {
  console.log('🔍 App - Componente App renderizado');

  // ✅ Inicializar monitor de salud de la app
  useEffect(() => {
    import('./utils/appHealthMonitor').then(({ AppHealthMonitor }) => {
      const monitor = AppHealthMonitor.getInstance();
      console.log('✅ Monitor de salud de la app iniciado');

      return () => {
        monitor.stop();
      };
    });
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        {/* ✅ ESTRUCTURA CRÍTICA: AuthProvider debe estar en el nivel más alto */}
        <AuthProvider>
          <WebSocketProvider>
            <MobileMenuProvider>
              <NotificationProvider>
                <AppInitializer>
                  <AppContent />
                </AppInitializer>
              </NotificationProvider>
            </MobileMenuProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App
