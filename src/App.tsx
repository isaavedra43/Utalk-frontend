
import React, { memo, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { MobileMenuProvider } from './contexts/MobileMenuContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useToast } from './hooks/useToast'
import { AppInitializer } from './components/AppInitializer'
import { SafeAuthWrapper } from './components/SafeAuthWrapper'

// ✅ OPTIMIZACIÓN: Lazy loading de módulos para carga más rápida
const AuthModule = lazy(() => import('./modules/auth').then(m => ({ default: m.AuthModule })));
const ForgotPasswordForm = lazy(() => import('./modules/auth/components/ForgotPasswordForm').then(m => ({ default: m.ForgotPasswordForm })));
const MainLayout = lazy(() => import('./components/layout/MainLayout').then(m => ({ default: m.MainLayout })));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(m => ({ default: m.ProtectedRoute })));
const MonitoringBubble = lazy(() => import('./components/monitoring').then(m => ({ default: m.MonitoringBubble })));
const ToastContainer = lazy(() => import('./components/ui/ToastContainer').then(m => ({ default: m.default })));
const PWAInstallPrompt = lazy(() => import('./components/pwa/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })));
const PWAUpdatePrompt = lazy(() => import('./components/pwa/PWAUpdatePrompt').then(m => ({ default: m.PWAUpdatePrompt })));

// ✅ Lazy loading de módulos pesados
const InternalChatModule = lazy(() => import('./modules').then(m => ({ default: m.InternalChatModule })));
const CampaignsModule = lazy(() => import('./modules').then(m => ({ default: m.CampaignsModule })));
const CallsModule = lazy(() => import('./modules').then(m => ({ default: m.CallsModule })));
const KnowledgeBaseModule = lazy(() => import('./modules').then(m => ({ default: m.KnowledgeBaseModule })));
const HRModule = lazy(() => import('./modules').then(m => ({ default: m.HRModule })));
const SupervisionModule = lazy(() => import('./modules').then(m => ({ default: m.SupervisionModule })));
const CopilotModule = lazy(() => import('./modules').then(m => ({ default: m.CopilotModule })));
const InventoryModule = lazy(() => import('./modules').then(m => ({ default: m.InventoryModule })));
const ShippingModule = lazy(() => import('./modules').then(m => ({ default: m.ShippingModule })));
const ServicesModule = lazy(() => import('./modules').then(m => ({ default: m.ServicesModule })));

// ✅ Loading component optimizado
const PageLoader = () => (
  <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-sm text-gray-600">Cargando...</p>
    </div>
  </div>
);

// ✅ ELIMINADO: SafeAuthWrapper problemático
// Ahora usamos SafeAuthWrapper que es más robusto

// ✅ SIMPLIFICADO: Componente sin useAuthContext directo
const ChatPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const DashboardPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

// ✅ COMPONENTES SIMPLIFICADOS SIN useAuthContext DIRECTO
const TeamPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const ClientsPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const NotificationsPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

// ✅ COMPONENTES NUEVOS SIMPLIFICADOS
const InternalChatPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const CampaignsPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const PhonePage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

// ✅ TODOS LOS COMPONENTES SIMPLIFICADOS SIN useAuthContext DIRECTO
const KnowledgeBasePage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const HRPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const SupervisionPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const CopilotPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const ShippingPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);

const ServicesPage: React.FC = () => (
  <ErrorBoundary>
    <MainLayout />
  </ErrorBoundary>
);


function App() {
  console.log('🔍 App - Componente App renderizado');

  // ✅ Inicializar monitor de salud de la app
  useEffect(() => {
    import('./utils/appHealthMonitor').then(({ AppHealthMonitor }) => {
      const monitor = AppHealthMonitor.getInstance();
      console.log('✅ Monitor de salud de la app iniciado');
      
      // Cleanup al desmontar
      return () => {
        monitor.stop();
      };
    });
  }, []);

  // Mostrar el módulo de monitoreo siempre (desarrollo y producción)
  const showMonitoring = true; // Siempre visible para debugging urgente
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <ErrorBoundary>
        {/* ✅ SOLUCIÓN CRÍTICA: AuthProvider debe estar FUERA de Suspense
            para evitar que componentes se monten antes del contexto */}
        <AuthProvider>
          <WebSocketProvider>
            <MobileMenuProvider>
              <NotificationProvider>
                <AppInitializer>
                  <div className="app">
                    {/* ✅ SUSPENSE INDIVIDUAL por ruta para mejor control */}
                    <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<AuthModule />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route 
                  path="/chat" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="chat">
                        <ChatPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="dashboard">
                        <DashboardPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/team" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="team">
                        <TeamPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/clients" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="clients">
                        <ClientsPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="notifications">
                        <NotificationsPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/internal-chat" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="internal-chat">
                        <InternalChatPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/campaigns" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="campaigns">
                        <CampaignsPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/phone" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="phone">
                        <PhonePage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/knowledge-base" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="knowledge-base">
                        <KnowledgeBasePage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/hr" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="hr">
                        <HRPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/supervision" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="supervision">
                        <SupervisionPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/copilot" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="copilot">
                        <CopilotPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/inventory/*" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="inventory">
                        <MainLayout />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/shipping" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="shipping">
                        <ShippingPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />
                <Route 
                  path="/services" 
                  element={
                    <SafeAuthWrapper>
                      <ProtectedRoute moduleId="services">
                        <ServicesPage />
                      </ProtectedRoute>
                    </SafeAuthWrapper>
                  } 
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
                    </Suspense>
                    
                    {/* Módulo de Monitoreo - Solo en desarrollo o con flag habilitado */}
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
                  </div>
                </AppInitializer>
              </NotificationProvider>
            </MobileMenuProvider>
          </WebSocketProvider>
        </AuthProvider>
        
        {/* Contenedor de Toasts */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </ErrorBoundary>
    </Router>
  );
}

export default App
