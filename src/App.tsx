
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { AuthModule } from './modules/auth'
import { MainLayout } from './components/layout/MainLayout'
import { DebugPanel } from './components/DebugPanel'
import { logger } from './utils/logger'
import { useAppStore } from './stores/useAppStore'

// Componente para establecer el módulo de chat
const ChatPage: React.FC = () => {
  const { setCurrentModule } = useAppStore();
  
  useEffect(() => {
    setCurrentModule('chat');
  }, [setCurrentModule]);
  
  return <MainLayout />;
};

// Componente para establecer el módulo de dashboard
const DashboardPage: React.FC = () => {
  const { setCurrentModule } = useAppStore();
  
  useEffect(() => {
    setCurrentModule('dashboard');
  }, [setCurrentModule]);
  
  return <MainLayout />;
};

function App() {
  const [showDebugPanel, setShowDebugPanel] = useState(import.meta.env.DEV);

  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
    logger.systemInfo('Debug panel toggled', { 
      isVisible: !showDebugPanel,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Router>
      <AuthProvider>
        <WebSocketProvider>
          <div className="app">
            <Routes>
              <Route path="/login" element={<AuthModule />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            
            {/* Debug Panel Toggle Button (solo en desarrollo) */}
            {import.meta.env.DEV && (
              <button
                onClick={toggleDebugPanel}
                className="fixed top-4 right-4 z-50 px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 text-sm"
              >
                {showDebugPanel ? 'Hide Debug' : 'Show Debug'}
              </button>
            )}
            
            {/* Debug Panel */}
            <DebugPanel isVisible={showDebugPanel} onClose={() => setShowDebugPanel(false)} />
          </div>
        </WebSocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
