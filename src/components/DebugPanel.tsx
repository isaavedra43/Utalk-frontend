import React from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { WebSocketTest } from './WebSocketTest';

interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const { isConnected, connectionError, socket, emit } = useWebSocketContext();
  const auth = useAuth();

  if (!isVisible) return null;

  const handleTestConnection = () => {
    if (emit) {
      emit('test-connection', { timestamp: Date.now() });
    }
  };

  const handleManualConnect = () => {
    const token = localStorage.getItem('access_token');
    if (token && socket) {
      console.log('🔌 Conectando manualmente...');
      socket.connect();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Debug Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Estado de Autenticación */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔐 Estado de Autenticación</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Autenticado: <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{auth.isAuthenticated ? 'Sí' : 'No'}</span></div>
              <div>Cargando: <span className={auth.loading ? 'text-yellow-600' : 'text-green-600'}>{auth.loading ? 'Sí' : 'No'}</span></div>
              <div>Usuario Backend: <span className={auth.backendUser ? 'text-green-600' : 'text-red-600'}>{auth.backendUser ? 'Sí' : 'No'}</span></div>
              <div>Token: <span className={localStorage.getItem('access_token') ? 'text-green-600' : 'text-red-600'}>{localStorage.getItem('access_token') ? 'Disponible' : 'No disponible'}</span></div>
            </div>
          </div>

          {/* Estado del WebSocket */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔌 Estado del WebSocket</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Conectado: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'Sí' : 'No'}</span></div>
              <div>Socket ID: <span className="text-gray-600">{socket?.id || 'N/A'}</span></div>
              <div>Error: <span className={connectionError ? 'text-red-600' : 'text-green-600'}>{connectionError || 'Ninguno'}</span></div>
              <div>URL: <span className="text-gray-600">{import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL || 'No configurada'}</span></div>
            </div>
            
            <div className="mt-3 space-x-2">
              <button
                onClick={handleTestConnection}
                disabled={!isConnected}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
              >
                Test Connection
              </button>
              <button
                onClick={handleManualConnect}
                disabled={isConnected}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
              >
                Conectar Manualmente
              </button>
            </div>
          </div>

          {/* Variables de Entorno */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">⚙️ Variables de Entorno</h3>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div>VITE_WS_URL: <span className="text-gray-600">{import.meta.env.VITE_WS_URL || 'No definida'}</span></div>
              <div>VITE_BACKEND_URL: <span className="text-gray-600">{import.meta.env.VITE_BACKEND_URL || 'No definida'}</span></div>
              <div>VITE_API_URL: <span className="text-gray-600">{import.meta.env.VITE_API_URL || 'No definida'}</span></div>
              <div>VITE_DEV_MODE: <span className="text-gray-600">{import.meta.env.VITE_DEV_MODE || 'No definida'}</span></div>
            </div>
          </div>

          {/* Componente de Prueba WebSocket */}
          <WebSocketTest />

          {/* Logs Recientes */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📋 Logs Recientes</h3>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono h-32 overflow-y-auto">
              {/* Aquí podrías mostrar logs recientes */}
              <div>🔌 Socket configurado con URL: {import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL}</div>
              <div>🔐 AuthContext - Estado de autenticación verificado</div>
              <div>🔌 WebSocket {isConnected ? 'conectado' : 'desconectado'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 