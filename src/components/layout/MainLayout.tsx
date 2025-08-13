import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { ConversationList } from '../chat/ConversationList';
import { ChatArea } from '../chat/ChatArea';
import { RightSidebar } from './RightSidebar';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Izquierdo - Navegación y Canales */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <LeftSidebar />
      </div>

      {/* Columna Central - Lista de Conversaciones */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <ConversationList />
      </div>

      {/* Columna Derecha - Chat + Sidebar de Detalles */}
      <div className="flex-1 flex">
        {/* Área de Chat */}
        <div className="flex-1 bg-white flex flex-col">
          <ChatArea />
        </div>

        {/* Sidebar Derecho - Detalles y Copilot */}
        <div className="w-80 bg-gray-50 border-l border-gray-200">
          <RightSidebar />
        </div>
      </div>

      {/* Debug Info - Esquina inferior izquierda */}
      <div className="fixed bottom-2 left-2 z-50">
        <div className="bg-black text-white text-xs p-2 rounded">
          <div>App: MOUNTED</div>
          <div>Route: /</div>
          <div>Mount: #root</div>
        </div>
      </div>
    </div>
  );
}; 