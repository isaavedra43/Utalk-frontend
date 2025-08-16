import React, { useEffect, useState } from 'react';
import { getUserInfo } from '../utils/jwtUtils';
import { WORKSPACE_CONFIG } from '../config/workspace';

interface WorkspaceDebugProps {
  show?: boolean;
}

export const WorkspaceDebug: React.FC<WorkspaceDebugProps> = ({ show = false }) => {
  const [userInfo, setUserInfo] = useState(getUserInfo());
  const [workspaceConfig, setWorkspaceConfig] = useState(WORKSPACE_CONFIG);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const updateInfo = () => {
      setUserInfo(getUserInfo());
      setWorkspaceConfig(WORKSPACE_CONFIG);
      setToken(localStorage.getItem('access_token'));
    };

    // Actualizar cada 5 segundos
    const interval = setInterval(updateInfo, 5000);
    updateInfo(); // Actualizar inmediatamente

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔧 Workspace Debug</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token:</strong> {token ? '✅ Presente' : '❌ Ausente'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Info:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>workspaceId: <span style={{ color: userInfo.workspaceId === 'default' ? '#ff6b6b' : '#00ff00' }}>
            {userInfo.workspaceId}
          </span></div>
          <div>tenantId: <span style={{ color: userInfo.tenantId === 'na' ? '#ff6b6b' : '#00ff00' }}>
            {userInfo.tenantId}
          </span></div>
          <div>userId: <span style={{ color: userInfo.userId ? '#00ff00' : '#ff6b6b' }}>
            {userInfo.userId || 'null'}
          </span></div>
          <div>email: <span style={{ color: userInfo.email ? '#00ff00' : '#ff6b6b' }}>
            {userInfo.email || 'null'}
          </span></div>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Workspace Config:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>workspaceId: <span style={{ color: workspaceConfig.workspaceId === 'default' ? '#ff6b6b' : '#00ff00' }}>
            {workspaceConfig.workspaceId}
          </span></div>
          <div>tenantId: <span style={{ color: workspaceConfig.tenantId === 'na' ? '#ff6b6b' : '#00ff00' }}>
            {workspaceConfig.tenantId}
          </span></div>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Variables de Entorno:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>VITE_WORKSPACE_ID: <span style={{ color: import.meta.env.VITE_WORKSPACE_ID ? '#00ff00' : '#ff6b6b' }}>
            {import.meta.env.VITE_WORKSPACE_ID || 'no definida'}
          </span></div>
          <div>VITE_TENANT_ID: <span style={{ color: import.meta.env.VITE_TENANT_ID ? '#00ff00' : '#ff6b6b' }}>
            {import.meta.env.VITE_TENANT_ID || 'no definida'}
          </span></div>
        </div>
      </div>
      
      <div style={{ fontSize: '10px', color: '#888' }}>
        Actualizado: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}; 