import React from 'react';
import { LeftSidebar, RightSidebar, ThinSidebar } from './index';
import { ConversationList, ChatArea } from '../chat/index';
import { useAppStore } from '../../stores/useAppStore';

export const MainLayout: React.FC = () => {
  const { activeConversation } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar delgado con iconos */}
      <ThinSidebar />

      {/* Columna 1: Canales (Navegación Principal) */}
      <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
        <LeftSidebar />
      </div>

      {/* Columna 2: Listado de Conversaciones */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <ConversationList />
      </div>

      {/* Columna 3: Área de Chat (Conversación Activa) - Toma el espacio restante */}
      <div className="flex-1 bg-white flex flex-col min-w-0">
        <ChatArea />
      </div>

      {/* Columna 4: Detalles del Cliente y Copiloto */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
        <RightSidebar />
      </div>

      {/* Debug Info - Esquina inferior izquierda */}
      <div className="fixed bottom-2 left-2 z-50">
        <div className="bg-black text-white text-xs p-2 rounded">
          <div>App: MOUNTED</div>
          <div>Route: /</div>
          <div>Mount: #root</div>
          <div>Active: {activeConversation?.customerName || 'None'}</div>
        </div>
      </div>
    </div>
  );
}; 