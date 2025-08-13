import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuth } from '../modules/auth/hooks/useAuth';

export const WebSocketTest: React.FC = () => {
  const { isConnected, connectionError, socket, connect, disconnect, emit } = useWebSocketContext();
  const auth = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Función para obtener información del token
  const getTokenInfo = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return {
        exp: payload.exp,
        iat: payload.iat,
        currentTime,
        isValid: payload.exp > currentTime + 300,
        expiresIn: Math.floor(payload.exp - currentTime)
      };
    } catch {
      return null;
    }
  };

  const testConnection = () => {
    addTestResult('🔌 Iniciando prueba de conexión WebSocket...');
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      addTestResult('❌ No hay token disponible');
      return;
    }

    const tokenInfo = getTokenInfo(token);
    if (tokenInfo) {
      addTestResult(`🔐 Token expira en ${tokenInfo.expiresIn} segundos`);
      if (!tokenInfo.isValid) {
        addTestResult('❌ Token expirado o próximo a expirar');
        return;
      }
    }

    addTestResult('🔌 Token válido, intentando conectar...');
    connect(token);
  };

  const testEmit = () => {
    if (!isConnected) {
      addTestResult('❌ WebSocket no está conectado');
      return;
    }

    addTestResult('📤 Enviando evento de prueba...');
    const success = emit('test-event', { message: 'Hello from frontend', timestamp: Date.now() });
    
    if (success) {
      addTestResult('✅ Evento enviado exitosamente');
    } else {
      addTestResult('❌ Error enviando evento');
    }
  };

  const testBackendConnection = async () => {
    addTestResult('🌐 Probando conexión HTTP al backend...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        addTestResult('✅ Backend HTTP responde correctamente');
      } else {
        addTestResult(`❌ Backend HTTP error: ${response.status}`);
      }
    } catch (error) {
      addTestResult(`❌ Error conectando al backend HTTP: ${error}`);
    }
  };

  const testWebSocketEndpoint = async () => {
    addTestResult('🔌 Probando endpoint WebSocket...');
    
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${wsUrl}/socket.io/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      
      addTestResult(`📊 Respuesta del endpoint WebSocket: ${response.status}`);
    } catch (error) {
      addTestResult(`❌ Error probando endpoint WebSocket: ${error}`);
    }
  };

  const analyzeToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      addTestResult('❌ No hay token disponible para analizar');
      return;
    }

    const tokenInfo = getTokenInfo(token);
    if (tokenInfo) {
      addTestResult(`🔐 Análisis del token:`);
      addTestResult(`   - Expira en: ${tokenInfo.expiresIn} segundos`);
      addTestResult(`   - Válido: ${tokenInfo.isValid ? 'Sí' : 'No'}`);
      addTestResult(`   - Timestamp de expiración: ${new Date(tokenInfo.exp * 1000).toLocaleString()}`);
    } else {
      addTestResult('❌ Token inválido o malformado');
    }
  };

  useEffect(() => {
    if (isConnected) {
      addTestResult('✅ WebSocket conectado exitosamente');
    } else if (connectionError) {
      addTestResult(`❌ Error de conexión: ${connectionError}`);
    }
  }, [isConnected, connectionError]);

  const token = localStorage.getItem('access_token');
  const tokenInfo = token ? getTokenInfo(token) : null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🔌 Prueba de WebSocket</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Estado Actual</h3>
          <div className="space-y-1 text-sm">
            <div>Conectado: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'Sí' : 'No'}</span></div>
            <div>Socket ID: <span className="text-gray-600">{socket?.id || 'N/A'}</span></div>
            <div>Error: <span className={connectionError ? 'text-red-600' : 'text-green-600'}>{connectionError || 'Ninguno'}</span></div>
            <div>Autenticado: <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{auth.isAuthenticated ? 'Sí' : 'No'}</span></div>
          </div>
        </div>
        
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Configuración</h3>
          <div className="space-y-1 text-sm">
            <div>WS URL: <span className="text-gray-600">{import.meta.env.VITE_WS_URL || 'No definida'}</span></div>
            <div>Backend URL: <span className="text-gray-600">{import.meta.env.VITE_BACKEND_URL || 'No definida'}</span></div>
            <div>Token: <span className={token ? 'text-green-600' : 'text-red-600'}>{token ? 'Disponible' : 'No disponible'}</span></div>
            {tokenInfo && (
              <div>Token Válido: <span className={tokenInfo.isValid ? 'text-green-600' : 'text-red-600'}>{tokenInfo.isValid ? 'Sí' : 'No'}</span></div>
            )}
            {tokenInfo && (
              <div>Expira en: <span className="text-gray-600">{tokenInfo.expiresIn}s</span></div>
            )}
          </div>
        </div>
      </div>

      <div className="space-x-2 mb-4">
        <button
          onClick={testConnection}
          disabled={isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Conectar WebSocket
        </button>
        
        <button
          onClick={testEmit}
          disabled={!isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          Enviar Evento de Prueba
        </button>
        
        <button
          onClick={testBackendConnection}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Probar Backend HTTP
        </button>
        
        <button
          onClick={testWebSocketEndpoint}
          className="px-4 py-2 bg-orange-500 text-white rounded"
        >
          Probar Endpoint WS
        </button>
        
        <button
          onClick={analyzeToken}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Analizar Token
        </button>
        
        <button
          onClick={() => {
            disconnect();
            addTestResult('🔌 WebSocket desconectado manualmente');
          }}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Desconectar
        </button>
      </div>

      <div className="border rounded p-3">
        <h3 className="font-semibold mb-2">Logs de Prueba</h3>
        <div className="bg-gray-100 p-3 rounded text-sm font-mono h-48 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500">No hay logs de prueba</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))
          )}
        </div>
        <button
          onClick={() => setTestResults([])}
          className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm"
        >
          Limpiar Logs
        </button>
      </div>
    </div>
  );
}; 