import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthContext } from '../../contexts/useAuthContext';
import { LeftSidebar } from './LeftSidebar';
import { MobileMenu } from './MobileMenu';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';
import { PermissionsDebug } from '../debug/PermissionsDebug';
import { AdminMigrationAlert } from '../AdminMigrationAlert';
import { AdminDetectionDebug } from '../debug/AdminDetectionDebug';
import '../../utils/adminMigrationScript';
// Lazy load de módulos
const ChatModule = lazy(() => import('../chat/ChatModule').then(m => ({ default: m.ChatModule })));
const DashboardModule = lazy(() => import('../../modules/dashboard').then(m => ({ default: m.DashboardModule })));
const TeamModule = lazy(() => import('../../modules/team/TeamModule').then(m => ({ default: m.default })));
const ClientModule = lazy(() => import('../../modules/clients/ClientModule').then(m => ({ default: m.ClientModule })));
const NotificationsModule = lazy(() => import('../../modules/notifications/NotificationsModule').then(m => ({ default: m.default })));
const InternalChatModule = lazy(() => import('../../modules/internal-chat/InternalChatModule').then(m => ({ default: m.default })));
const CampaignsModule = lazy(() => import('../../modules/campaigns/CampaignsModule').then(m => ({ default: m.default })));
const KnowledgeBaseModule = lazy(() => import('../../modules/knowledge-base/KnowledgeBaseModule').then(m => ({ default: m.default })));
const HRModule = lazy(() => import('../../modules/hr').then(m => ({ default: m.HRModule })));
const SupervisionModule = lazy(() => import('../../modules/supervision/SupervisionModule').then(m => ({ default: m.default })));
const CopilotModule = lazy(() => import('../../modules/copilot/CopilotModule').then(m => ({ default: m.default })));
const ProvidersModule = lazy(() => import('../../modules/providers/ProvidersModule').then(m => ({ default: m.default })));
const WarehouseModule = lazy(() => import('../../modules/warehouse/WarehouseModule').then(m => ({ default: m.default })));
const ShippingModule = lazy(() => import('../../modules/shipping/ShippingModule').then(m => ({ default: m.default })));
const ServicesModule = lazy(() => import('../../modules/services/ServicesModule').then(m => ({ default: m.default })));
import { CallsModule } from '../../modules';

import { ModulePlaceholder } from './ModulePlaceholder';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { setCurrentModule } = useUIStore();
  const { isAuthenticated, loading } = useAuthContext();
  const { isOpen: isMobileMenuOpen, closeMenu: closeMobileMenu } = useMobileMenuContext();
  
  // NUEVO: Protección contra estado de autenticación inválido
  if (loading) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verificando autenticación...
          </h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No autorizado
          </h3>
          <p className="text-gray-500 mb-4">
            Debes iniciar sesión para acceder a esta página
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }
  
  // Determinar el módulo basado en la URL
  const getCurrentModule = () => {
    const path = location.pathname;
    if (path === '/chat') return 'chat';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/team') return 'team';
    if (path === '/clients') return 'clients';
    if (path === '/notifications') return 'notifications';
    if (path === '/internal-chat') return 'internal-chat';
    if (path === '/campaigns') return 'campaigns';
    if (path === '/phone') return 'phone';
    if (path === '/knowledge-base') return 'knowledge-base';
    if (path === '/hr') return 'hr';
    if (path === '/supervision') return 'supervision';
    if (path === '/copilot') return 'copilot';
    if (path === '/providers') return 'providers';
    if (path === '/warehouse') return 'warehouse';
    if (path === '/shipping') return 'shipping';
    if (path === '/services') return 'services';
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
      {/* Sidebar izquierdo - Oculto en móviles, visible en desktop, oculto en knowledge-base */}
      <div className={`hidden lg:block ${currentModule === 'knowledge-base' ? 'hidden' : ''}`}>
        <LeftSidebar />
      </div>
      
      {/* Menú móvil global */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      
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
        {currentModule === 'internal-chat' && (
          <Suspense fallback={Fallback}>
            <InternalChatModule />
          </Suspense>
        )}
        {currentModule === 'campaigns' && (
          <Suspense fallback={Fallback}>
            <CampaignsModule />
          </Suspense>
        )}
        {currentModule === 'phone' && (
          <CallsModule />
        )}
        {currentModule === 'knowledge-base' && (
          <Suspense fallback={Fallback}>
            <KnowledgeBaseModule />
          </Suspense>
        )}
        {currentModule === 'hr' && (
          <Suspense fallback={Fallback}>
            <HRModule />
          </Suspense>
        )}
        {currentModule === 'supervision' && (
          <Suspense fallback={Fallback}>
            <SupervisionModule />
          </Suspense>
        )}
        {currentModule === 'copilot' && (
          <Suspense fallback={Fallback}>
            <CopilotModule />
          </Suspense>
        )}
        {currentModule === 'providers' && (
          <Suspense fallback={Fallback}>
            <ProvidersModule />
          </Suspense>
        )}
        {currentModule === 'warehouse' && (
          <Suspense fallback={Fallback}>
            <WarehouseModule />
          </Suspense>
        )}
        {currentModule === 'shipping' && (
          <Suspense fallback={Fallback}>
            <ShippingModule />
          </Suspense>
        )}
        {currentModule === 'services' && (
          <Suspense fallback={Fallback}>
            <ServicesModule />
          </Suspense>
        )}
        {currentModule !== 'chat' && currentModule !== 'dashboard' && currentModule !== 'team' && currentModule !== 'clients' && currentModule !== 'notifications' && currentModule !== 'internal-chat' && currentModule !== 'campaigns' && currentModule !== 'phone' && currentModule !== 'knowledge-base' && currentModule !== 'hr' && currentModule !== 'supervision' && currentModule !== 'copilot' && currentModule !== 'providers' && currentModule !== 'warehouse' && currentModule !== 'shipping' && currentModule !== 'services' && (
          <ModulePlaceholder moduleName={currentModule} />
        )}
      </div>
      
      {/* Debug de permisos (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && <PermissionsDebug />}
      
      {/* Debug de detección de admin (temporal) */}
      <AdminDetectionDebug />
      
      {/* Alerta de migración para admins */}
      <AdminMigrationAlert />
    </div>
  );
}; 