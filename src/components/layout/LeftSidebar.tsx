import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Users,
  LogOut,
  Building2,
  Bell,
  Download,
  MessageCircle,
  Megaphone,
  Phone,
  BookOpen,
  UserCheck,
  Eye,
  Bot,
  Truck,
  Warehouse,
  Package,
  Settings
} from 'lucide-react';
import { useAuthContext } from '../../contexts/useAuthContext';
import { infoLog } from '../../config/logger';
import { useModulePermissions } from '../../hooks/useModulePermissions';
// import { useTeamNotifications } from '../../modules/team/hooks/useTeamNotifications'; // DESHABILITADO TEMPORALMENTE

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, backendUser } = useAuthContext();
  const { currentModule, navigateToModule: setCurrentModule } = useUIStore();
  const { canAccessModule, loading: permissionsLoading } = useModulePermissions();
  
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

  // Definir todos los módulos disponibles
  const allNavigationItems = useMemo(() => [
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
    },
    {
      id: 'internal-chat',
      icon: MessageCircle,
      title: 'Chat Interno'
    },
    {
      id: 'campaigns',
      icon: Megaphone,
      title: 'Campañas'
    },
    {
      id: 'phone',
      icon: Phone,
      title: 'Teléfono'
    },
    {
      id: 'knowledge-base',
      icon: BookOpen,
      title: 'Base de Conocimiento'
    },
    {
      id: 'hr',
      icon: UserCheck,
      title: 'Recursos Humanos'
    },
    {
      id: 'supervision',
      icon: Eye,
      title: 'Supervisión'
    },
    {
      id: 'copilot',
      icon: Bot,
      title: 'Copiloto IA'
    },
    {
      id: 'providers',
      icon: Truck,
      title: 'Proveedores'
    },
    {
      id: 'warehouse',
      icon: Warehouse,
      title: 'Almacén'
    },
    {
      id: 'shipping',
      icon: Package,
      title: 'Envíos'
    },
    {
      id: 'services',
      icon: Settings,
      title: 'Servicios'
    }
  ], []);

  // Filtrar módulos según permisos del usuario
  const navigationItems = React.useMemo(() => {
    // Si está cargando permisos, no mostrar ningún módulo para evitar parpadeo
    if (permissionsLoading) {
      return [];
    }

    // Filtrar solo los módulos a los que tiene acceso
    return allNavigationItems.filter((item: { id: string; icon: React.ComponentType<{ className?: string }>; title: string }) => canAccessModule(item.id));
  }, [allNavigationItems, canAccessModule, permissionsLoading]);

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
          {permissionsLoading ? (
            // Mostrar skeleton de carga mientras se cargan los permisos
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-full h-10 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </>
          ) : (
            // Mostrar módulos cuando los permisos estén cargados
            navigationItems.map((item: { id: string; icon: React.ComponentType<{ className?: string }>; title: string }) => {
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
            })
          )}
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