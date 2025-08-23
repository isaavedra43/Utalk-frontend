import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { LeftSidebar } from './LeftSidebar';
// Lazy load de módulos
const ChatModule = lazy(() => import('../chat/ChatModule').then(m => ({ default: m.ChatModule })));
const DashboardModule = lazy(() => import('../../modules/dashboard').then(m => ({ default: m.DashboardModule })));
const TeamModule = lazy(() => import('../../modules/team/TeamModule').then(m => ({ default: m.default })));
const ClientModule = lazy(() => import('../../modules/clients/ClientModule').then(m => ({ default: m.ClientModule })));
const NotificationsModule = lazy(() => import('../../modules/notifications/NotificationsModule').then(m => ({ default: m.default })));

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

  const Fallback = <div className="p-4 text-sm text-gray-500">Cargando módulo...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar izquierdo - Oculto en móviles, visible en desktop */}
      <div className="hidden lg:block">
        <LeftSidebar />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentModule === 'chat' && (
          <Suspense fallback={Fallback}>
            <ChatModule />
          </Suspense>
        )}
        {currentModule === 'dashboard' && (
          <Suspense fallback={Fallback}>
            <DashboardModule />
          </Suspense>
        )}
        {currentModule === 'team' && (
          <Suspense fallback={Fallback}>
            <TeamModule />
          </Suspense>
        )}
        {currentModule === 'clients' && (
          <Suspense fallback={Fallback}>
            <ClientModule />
          </Suspense>
        )}
        {currentModule === 'notifications' && (
          <Suspense fallback={Fallback}>
            <NotificationsModule />
          </Suspense>
        )}

        {currentModule !== 'chat' && currentModule !== 'dashboard' && currentModule !== 'team' && currentModule !== 'clients' && currentModule !== 'notifications' && (
          <ModulePlaceholder moduleName={currentModule} />
        )}
      </div>
    </div>
  );
}; 