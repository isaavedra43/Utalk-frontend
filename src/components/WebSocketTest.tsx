import React, { useState } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuth } from '../modules/auth/hooks/useAuth';

export const WebSocketTest: React.FC = () => {
  const { isConnected, connectionError, connect, disconnect, emit } = useWebSocketContext();
  const { isAuthenticated } = useAuth();
  const [testMessage, setTestMessage] = useState('');

  const handleConnect = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('🔌 Intentando conectar manualmente...');
      connect(token);
    } else {
      console.error('❌ No hay token disponible');
    }
  };

  const handleDisconnect = () => {
    console.log('🔌 Desconectando manualmente...');
    disconnect();
  };

  const handleTestEmit = () => {
    if (testMessage.trim()) {
      console.log('📤 Enviando mensaje de prueba:', testMessage);
      emit('test-message', { message: testMessage, timestamp: new Date().toISOString() });
      setTestMessage('');
    }
  };

  const handleSyncState = () => {
    console.log('🔄 Solicitando sincronización de estado...');
    emit('sync-state', { syncId: Date.now() });
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-yellow-800 font-medium">WebSocket Test</h3>
        <p className="text-yellow-700 text-sm">Usuario no autenticado</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
      <h3 className="text-gray-800 font-medium">WebSocket Test</h3>
      
      {/* Estado de conexión */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm">
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
        {connectionError && (
          <span className="text-xs text-red-600 ml-2">{connectionError}</span>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={handleConnect}
          disabled={isConnected}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
        >
          Conectar
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:bg-gray-300"
        >
          Desconectar
        </button>
        <button
          onClick={handleSyncState}
          disabled={!isConnected}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
        >
          Sync State
        </button>
      </div>

      {/* Test de mensaje */}
      <div className="flex gap-2">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Mensaje de prueba"
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <button
          onClick={handleTestEmit}
          disabled={!isConnected || !testMessage.trim()}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm disabled:bg-gray-300"
        >
          Enviar
        </button>
      </div>

      {/* Información de debug */}
      <div className="text-xs text-gray-600">
        <p>Token: {localStorage.getItem('access_token') ? 'Disponible' : 'No disponible'}</p>
        <p>URL: {import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL}</p>
      </div>
    </div>
  );
}; 