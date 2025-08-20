import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { LeftSidebar } from './LeftSidebar';
import { ChatModule } from '../chat/ChatModule';
import { DashboardModule } from '../../modules/dashboard';
import { TeamModule } from '../../modules/team';
import { ClientModule } from '../../modules/clients/ClientModule';

import { ModulePlaceholder } from './ModulePlaceholder';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { setCurrentModule } = useUIStore();
  
  // Determinar el módulo basado en la URL
  const getCurrentModule = () => {
    const path = location.pathname;
    if (path === '/chat') return 'chat';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/team') return 'team';
    if (path === '/clients') return 'clients';
    if (path === '/notifications') return 'notifications';
    return 'dashboard'; // default
  };
  
  const currentModule = getCurrentModule();
  
  // Sincronizar el módulo actual con el store cuando cambie la URL
  useEffect(() => {
    setCurrentModule(currentModule);
  }, [currentModule, setCurrentModule]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar izquierdo - Oculto en móviles, visible en desktop */}
      <div className="hidden lg:block">
        <LeftSidebar />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentModule === 'chat' && <ChatModule />}
        {currentModule === 'dashboard' && <DashboardModule />}
        {currentModule === 'team' && <TeamModule />}
        {currentModule === 'clients' && <ClientModule />}

        {currentModule !== 'chat' && currentModule !== 'dashboard' && currentModule !== 'team' && currentModule !== 'clients' && currentModule !== 'notifications' && (
          <ModulePlaceholder moduleName={currentModule} />
        )}
      </div>
    </div>
  );
}; 