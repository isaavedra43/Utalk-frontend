import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Users,
  LogOut,
  Building2,
  Bell,
  Download
} from 'lucide-react';
import { useAuthContext } from '../../contexts/useAuthContext';
import { infoLog } from '../../config/logger';
// import { useTeamNotifications } from '../../modules/team/hooks/useTeamNotifications'; // DESHABILITADO TEMPORALMENTE

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, backendUser } = useAuthContext();
  const { currentModule, navigateToModule: setCurrentModule } = useUIStore();
  
  // Función para navegar a un módulo
  const navigateToModule = (moduleId: string) => {
    navigate(`/${moduleId}`);
    setCurrentModule(moduleId);
  };
  
  // Obtener notificaciones del equipo - DESHABILITADO TEMPORALMENTE
  // const teamNotifications = useTeamNotifications(teamData?.members || []);
  
  const handleLogout = async () => {
    try {
      await logout();
      // El logout automáticamente redirigirá al login
    } catch (error) {
      infoLog('Error en logout:', error);
    }
  };

  const handleExportLogs = () => {
    // Usar la función de exportación de logs
    if (typeof window.exportLogs === 'function') {
      window.exportLogs('json');
    } else {
      // Fallback si por alguna razón no está disponible
      alert('Función de exportación de logs no disponible');
    }
  };

  const navigationItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard'
    },
    {
      id: 'clients',
      icon: Building2,
      title: 'Customer Hub'
    },
    {
      id: 'team',
      icon: Users,
      title: 'Equipo & Performance'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Centro de Notificaciones'
    },
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'Mensajes'
    }
  ];

  return (
    <div className="flex flex-col h-screen w-16 bg-white border-r border-gray-200 shadow-sm">
      {/* Header con logo */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">U</span>
          </div>
        </div>
      </div>

      {/* Navegación entre módulos */}
      <div className="flex-1 p-2">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentModule === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => navigateToModule(item.id)}
                className={`relative w-full h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                }`}
                title={item.title}
              >
                <IconComponent className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Información del Usuario y Logout */}
      <div className="p-2 border-t border-gray-200 flex-shrink-0 bg-gray-50">
        {/* Información del usuario */}
        {backendUser && (
          <div className="mb-2 p-1 rounded-lg bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {backendUser.displayName?.charAt(0) || backendUser.email?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botón de Exportar Logs */}
        <button
          onClick={handleExportLogs}
          className="w-full h-10 flex items-center justify-center rounded-lg text-sm text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 hover:border-blue-300 mb-2"
          title="Exportar Logs"
        >
          <Download className="h-5 w-5" />
        </button>

        {/* Botón de Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-10 flex items-center justify-center rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-200 hover:border-red-300"
          title="Cerrar Sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}; 