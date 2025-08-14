import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { ThinSidebar } from './ThinSidebar';
import { ChatModule } from '../chat/ChatModule';
import { DashboardModule } from '../../modules/dashboard';
import { ModulePlaceholder } from './ModulePlaceholder';
import { useAppStore } from '../../stores/useAppStore';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';

const ConnectionBadge: React.FC = () => {
  const { isConnected, connectionError } = useWebSocketContext();
  if (isConnected && !connectionError) return null;
  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 50 }} className="rounded bg-red-600 text-white px-3 py-1 text-sm shadow">
      {connectionError ? `WS: ${connectionError}` : 'Reconectando...'}
    </div>
  );
};

export const MainLayout: React.FC = () => {
  const { currentModule } = useAppStore();

  // Si estamos en el módulo de chat, mostrar la estructura de chat completa
  if (currentModule === 'chat') {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar izquierdo */}
        <LeftSidebar />
        
        {/* Módulo de Chat completo */}
        <ChatModule />
        <ConnectionBadge />
      </div>
    );
  }

  // Para el módulo de dashboard, mostrar el DashboardModule
  if (currentModule === 'dashboard') {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar izquierdo */}
        <LeftSidebar />
        
        {/* Módulo de Dashboard */}
        <DashboardModule />
        <ConnectionBadge />
      </div>
    );
  }

  // Para otros módulos, mostrar la estructura general con placeholder
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar izquierdo */}
      <LeftSidebar />
      
      {/* Sidebar delgado */}
      <ThinSidebar />
      
      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Contenido del módulo */}
        <div className="flex-1 flex">
          <div className="flex-1">
            {/* Placeholder para módulos en desarrollo */}
            <ModulePlaceholder moduleName={currentModule} />
          </div>
        </div>
      </div>
      
      {/* Sidebar derecho */}
      <RightSidebar />
      
      <ConnectionBadge />
    </div>
  );
}; 