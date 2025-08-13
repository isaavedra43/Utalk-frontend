import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { ThinSidebar } from './ThinSidebar';
import { ChatModule } from '../chat/ChatModule';
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

  // Para el módulo de dashboard, mostrar una estructura simple
  if (currentModule === 'dashboard') {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar izquierdo */}
        <LeftSidebar />
        
        {/* Área principal del dashboard */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            <div className="flex-1">
              <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Dashboard
                  </h3>
                  <p className="text-gray-500">
                    Panel de control en desarrollo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConnectionBadge />
      </div>
    );
  }

  // Para otros módulos, mostrar la estructura general
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
            {/* Aquí iría el contenido específico de cada módulo */}
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bienvenido a UTalk
                </h3>
                <p className="text-gray-500">
                  Módulo: {currentModule}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar derecho */}
      <RightSidebar />
      <ConnectionBadge />
    </div>
  );
}; 