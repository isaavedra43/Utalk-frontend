
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { AuthModule } from './modules/auth'
import { MainLayout } from './components/layout/MainLayout'
// import { WorkspaceDebug } from './components/WorkspaceDebug'
// import { DebugPanel } from './components/DebugPanel' // DEBUGPANEL DESHABILITADO TEMPORALMENTE


// import { logger } from './utils/logger' // DESHABILITADO - No se usa

import { useAuthContext } from './contexts/useAuthContext'

// FORZAR ACTUALIZACIÓN DE VERCEL - Commit a00c0f1 aplicado
// Autenticación manual obligatoria implementada

// Componente de protección de rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  // Debug: Log del estado de autenticación
  console.log('🔐 ProtectedRoute - Estado:', { isAuthenticated, loading });

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
};

// Componente para el módulo de chat
const ChatPage: React.FC = () => {
  return <MainLayout />;
};

// Componente para el módulo de dashboard
const DashboardPage: React.FC = () => {
  return <MainLayout />;
};

// Componente para el módulo de equipo
const TeamPage: React.FC = () => {
  return <MainLayout />;
};

// Componente para el módulo de clientes
const ClientsPage: React.FC = () => {
  return <MainLayout />;
};

// Componente para el módulo de notificaciones
const NotificationsPage: React.FC = () => {
  return <MainLayout />;
};

function App() {
  // const [showDebugPanel, setShowDebugPanel] = useState(import.meta.env.DEV); // DEBUGPANEL DESHABILITADO TEMPORALMENTE

  // const toggleDebugPanel = () => {
  //   setShowDebugPanel(!showDebugPanel);
  //   logger.systemInfo('Debug panel toggled', { 
  //     isVisible: !showDebugPanel,
  //     timestamp: new Date().toISOString()
  //   });
  // }; // DEBUGPANEL DESHABILITADO TEMPORALMENTE

  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <div className="app">
            {/* Componente de debug para workspaceId - DESHABILITADO */}
            {/* <WorkspaceDebug show={import.meta.env.DEV} /> */}
            
            <Routes>
              <Route path="/login" element={<AuthModule />} />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/team" 
                element={
                  <ProtectedRoute>
                    <TeamPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clients" 
                element={
                  <ProtectedRoute>
                    <ClientsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            
            {/* Debug Panel Toggle Button (solo en desarrollo) - DESHABILITADO TEMPORALMENTE */}
            {/* {import.meta.env.DEV && (
              <button
                onClick={toggleDebugPanel}
                className="fixed top-4 right-4 z-50 px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 text-sm"
              >
                {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
              </button>
            )} */}
            
            {/* Debug Panel - DESHABILITADO TEMPORALMENTE */}
            {/* <DebugPanel isVisible={showDebugPanel} onClose={() => setShowDebugPanel(false)} /> */}
          </div>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
