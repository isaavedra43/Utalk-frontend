import React from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Users,
  LogOut,
  Building2,
  Bell
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthContext } from '../../contexts/useAuthContext';
import { useTeamNotifications } from '../../modules/team/hooks/useTeamNotifications';

export const LeftSidebar: React.FC = () => {
  const { currentModule, navigateToModule, teamData } = useAppStore();
  const { logout, backendUser } = useAuthContext();
  
  // Obtener notificaciones del equipo
  const teamNotifications = useTeamNotifications(teamData?.members || []);
  
  const handleLogout = async () => {
    try {
      await logout();
      // El logout automáticamente redirigirá al login
    } catch (error) {
      console.error('Error en logout:', error);
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
      title: 'Customer Hub',
      badge: '5'
    },
    {
      id: 'team',
      icon: Users,
      title: 'Equipo & Performance',
      badge: teamNotifications.getBadgeText()
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Centro de Notificaciones',
      badge: '4'
    },
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'Mensajes',
      badge: '9+'
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
                
                {/* Badge de notificación */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
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