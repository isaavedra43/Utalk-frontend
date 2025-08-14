import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { ChatModule } from '../chat/ChatModule';
import { DashboardModule } from '../../modules/dashboard';
import { ModulePlaceholder } from './ModulePlaceholder';
import { useAppStore } from '../../stores/useAppStore';

export const MainLayout: React.FC = () => {
  const { currentModule } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar izquierdo - Siempre presente */}
      <LeftSidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentModule === 'chat' && <ChatModule />}
        {currentModule === 'dashboard' && <DashboardModule />}
        {currentModule !== 'chat' && currentModule !== 'dashboard' && (
          <ModulePlaceholder moduleName={currentModule} />
        )}
      </div>
    </div>
  );
}; 