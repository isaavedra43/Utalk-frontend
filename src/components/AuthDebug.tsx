import React from 'react';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { useWebSocketContext } from '../contexts/useWebSocketContext';

export const AuthDebug: React.FC = () => {
  const auth = useAuth();
  const { isConnected, connectionError } = useWebSocketContext();

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
        expiresIn: Math.floor(payload.exp - currentTime)
      };
    } catch {
      return null;
    }
  };

  const tokenInfo = getTokenInfo();

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      <h3 className="text-blue-800 font-medium">🔐 Debug de Autenticación</h3>
      
      {/* Estado de Autenticación */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-700">Estado de Autenticación:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Autenticado: <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{auth.isAuthenticated ? 'Sí' : 'No'}</span></div>
          <div>Cargando: <span className={auth.loading ? 'text-yellow-600' : 'text-green-600'}>{auth.loading ? 'Sí' : 'No'}</span></div>
          <div>Usuario: <span className={auth.user ? 'text-green-600' : 'text-red-600'}>{auth.user ? 'Disponible' : 'No disponible'}</span></div>
          <div>Backend User: <span className={auth.backendUser ? 'text-green-600' : 'text-red-600'}>{auth.backendUser ? 'Disponible' : 'No disponible'}</span></div>
        </div>
      </div>

      {/* Información del Usuario */}
      {auth.backendUser && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-700">Usuario:</h4>
          <div className="text-sm space-y-1">
            <div>Email: <span className="text-gray-600">{auth.backendUser.email}</span></div>
            <div>ID: <span className="text-gray-600">{auth.backendUser.id}</span></div>
            <div>Rol: <span className="text-gray-600">{auth.backendUser.role}</span></div>
          </div>
        </div>
      )}

      {/* Información del Token */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-700">Token JWT:</h4>
        <div className="text-sm space-y-1">
          <div>Disponible: <span className={localStorage.getItem('access_token') ? 'text-green-600' : 'text-red-600'}>{localStorage.getItem('access_token') ? 'Sí' : 'No'}</span></div>
          {tokenInfo && (
            <>
              <div>Válido: <span className={tokenInfo.isValid ? 'text-green-600' : 'text-red-600'}>{tokenInfo.isValid ? 'Sí' : 'No'}</span></div>
              <div>Expira en: <span className="text-gray-600">{tokenInfo.expiresIn} segundos</span></div>
              <div>Expira: <span className="text-gray-600">{new Date(tokenInfo.exp * 1000).toLocaleString()}</span></div>
            </>
          )}
        </div>
      </div>

      {/* Estado del WebSocket */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-700">WebSocket:</h4>
        <div className="text-sm space-y-1">
          <div>Conectado: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'Sí' : 'No'}</span></div>
          {connectionError && (
            <div>Error: <span className="text-red-600">{connectionError}</span></div>
          )}
        </div>
      </div>

      {/* Acciones de Debug */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-700">Acciones:</h4>
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('🔐 Estado completo de autenticación:', {
                auth,
                token: localStorage.getItem('access_token'),
                tokenInfo,
                isConnected
              });
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Log Estado
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Limpiar Auth
          </button>
        </div>
      </div>
    </div>
  );
}; 