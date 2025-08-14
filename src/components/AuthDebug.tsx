import React, { useState } from 'react';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { useWebSocketContext } from '../contexts/useWebSocketContext';

export const AuthDebug: React.FC = () => {
  const auth = useAuth();
  const { isConnected, connectionError } = useWebSocketContext();
  const [showTokenDetails, setShowTokenDetails] = useState(false);

  const getTokenInfo = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return {
        exp: payload.exp,
        iat: payload.iat,
        currentTime,
        isValid: payload.exp > currentTime + 300,
        expiresIn: Math.floor(payload.exp - currentTime),
        payload
      };
    } catch {
      return null;
    }
  };

  const tokenInfo = getTokenInfo();

  const handleForceLogin = () => {
    // Simular un login forzado para testing
    const mockUser = {
      id: 'debug-user-' + Date.now(),
      email: 'debug@utalk.com',
      displayName: 'Usuario Debug',
      role: 'agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockToken = 'mock-token-' + Date.now();
    
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('refresh_token', 'mock-refresh-' + Date.now());
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    window.location.reload();
  };

  const handleClearAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleTestAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No hay token disponible para testing');
        return;
      }

      // Hacer una llamada de prueba al backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Test de autenticación exitoso:', userData);
      } else {
        console.error('❌ Test de autenticación fallido:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error en test de autenticación:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Estado de Autenticación */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <h3 className="text-blue-800 font-medium mb-3 flex items-center">
          🔐 Debug de Autenticación
          <span className={`ml-2 px-2 py-1 rounded text-xs ${auth.isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {auth.isAuthenticated ? 'AUTENTICADO' : 'NO AUTENTICADO'}
          </span>
        </h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Autenticado: <span className={auth.isAuthenticated ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{auth.isAuthenticated ? 'Sí' : 'No'}</span></div>
          <div>Cargando: <span className={auth.loading ? 'text-yellow-600' : 'text-green-600'}>{auth.loading ? 'Sí' : 'No'}</span></div>
          <div>Usuario: <span className={auth.user ? 'text-green-600' : 'text-red-600'}>{auth.user ? 'Disponible' : 'No disponible'}</span></div>
          <div>Backend User: <span className={auth.backendUser ? 'text-green-600' : 'text-red-600'}>{auth.backendUser ? 'Disponible' : 'No disponible'}</span></div>
        </div>
      </div>

      {/* Información del Usuario */}
      {auth.backendUser && (
        <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
          <h4 className="text-sm font-semibold text-green-700 mb-2">👤 Usuario Actual:</h4>
          <div className="text-sm space-y-1">
            <div>Email: <span className="text-gray-600 font-mono">{auth.backendUser.email}</span></div>
            <div>ID: <span className="text-gray-600 font-mono">{auth.backendUser.id}</span></div>
            <div>Rol: <span className="text-gray-600 font-mono">{auth.backendUser.role}</span></div>
            <div>Workspace ID: <span className="text-gray-600 font-mono">{(auth.backendUser as any).workspaceId || 'default'}</span></div>
            <div>Tenant ID: <span className="text-gray-600 font-mono">{(auth.backendUser as any).tenantId || 'na'}</span></div>
            <div>Creado: <span className="text-gray-600 font-mono">{new Date(auth.backendUser.createdAt).toLocaleString()}</span></div>
            <div>Actualizado: <span className="text-gray-600 font-mono">{new Date(auth.backendUser.updatedAt).toLocaleString()}</span></div>
          </div>
        </div>
      )}

      {/* Información del Token */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
        <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center justify-between">
          <span>🎫 Token JWT:</span>
          <button
            onClick={() => setShowTokenDetails(!showTokenDetails)}
            className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded hover:bg-purple-300"
          >
            {showTokenDetails ? 'Ocultar' : 'Mostrar'} Detalles
          </button>
        </h4>
        <div className="text-sm space-y-1">
          <div>Disponible: <span className={localStorage.getItem('access_token') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{localStorage.getItem('access_token') ? 'Sí' : 'No'}</span></div>
          {tokenInfo && (
            <>
              <div>Válido: <span className={tokenInfo.isValid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{tokenInfo.isValid ? 'Sí' : 'No'}</span></div>
              <div>Expira en: <span className="text-gray-600 font-mono">{tokenInfo.expiresIn} segundos</span></div>
              <div>Expira: <span className="text-gray-600 font-mono">{new Date(tokenInfo.exp * 1000).toLocaleString()}</span></div>
              
              {showTokenDetails && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <div className="text-xs font-mono break-all">
                    <div><strong>Payload:</strong></div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(tokenInfo.payload, null, 2)}</pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Estado del WebSocket */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <h4 className="text-sm font-semibold text-yellow-700 mb-2">🔌 Estado del WebSocket:</h4>
        <div className="text-sm space-y-1">
          <div>Conectado: <span className={isConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isConnected ? 'Sí' : 'No'}</span></div>
          {connectionError && (
            <div>Error: <span className="text-red-600 font-mono text-xs">{connectionError}</span></div>
          )}
        </div>
      </div>

      {/* Acciones de Debug */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🛠️ Acciones de Debug:</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              console.log('🔐 Estado completo de autenticación:', {
                auth,
                token: localStorage.getItem('access_token'),
                tokenInfo,
                isConnected,
                localStorage: {
                  accessToken: localStorage.getItem('access_token') ? 'Disponible' : 'No disponible',
                  refreshToken: localStorage.getItem('refresh_token') ? 'Disponible' : 'No disponible',
                  user: localStorage.getItem('user') ? 'Disponible' : 'No disponible'
                }
              });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Log Estado
          </button>
          <button
            onClick={handleTestAuth}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Test Auth
          </button>
          <button
            onClick={handleForceLogin}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          >
            Forzar Login
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Limpiar Auth
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Limpiar Todo
          </button>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-indigo-100">
        <h4 className="text-sm font-semibold text-indigo-700 mb-2">💻 Información del Sistema:</h4>
        <div className="text-sm space-y-1">
          <div>URL Actual: <span className="text-gray-600 font-mono text-xs break-all">{window.location.href}</span></div>
          <div>User Agent: <span className="text-gray-600 font-mono text-xs break-all">{navigator.userAgent}</span></div>
          <div>Timestamp: <span className="text-gray-600 font-mono text-xs">{new Date().toISOString()}</span></div>
          <div>Cookies Habilitadas: <span className="text-gray-600">{navigator.cookieEnabled ? 'Sí' : 'No'}</span></div>
          <div>LocalStorage: <span className="text-gray-600">{typeof Storage !== 'undefined' ? 'Disponible' : 'No disponible'}</span></div>
        </div>
      </div>
    </div>
  );
}; 