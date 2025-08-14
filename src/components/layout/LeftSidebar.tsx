import React from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Users, 
  Settings, 
  BookOpen, 
  Zap, 
  Headphones, 
  User, 
  BarChart3, 
  Bell, 
  Calendar 
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthContext } from '../../contexts/useAuthContext';

export const LeftSidebar: React.FC = () => {
  const { currentModule, navigateToModule } = useAppStore();
  const { logout, backendUser } = useAuthContext();
  
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
      id: 'chat',
      icon: MessageSquare,
      title: 'Chat',
      badge: '9+'
    },
    {
      id: 'contacts',
      icon: Users,
      title: 'Contactos',
      badge: '3'
    },
    {
      id: 'agents',
      icon: User,
      title: 'Agentes',
      badge: '5'
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard'
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Configuración'
    },
    {
      id: 'docs',
      icon: BookOpen,
      title: 'Documentación'
    },
    {
      id: 'automation',
      icon: Zap,
      title: 'Automatización'
    },
    {
      id: 'support',
      icon: Headphones,
      title: 'Soporte'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analytics'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notificaciones',
      badge: '3'
    },
    {
      id: 'calendar',
      icon: Calendar,
      title: 'Calendario'
    }
  ];

  return (
    <div className="flex flex-col h-screen w-16 bg-gray-800 border-r border-gray-700">
      {/* Header con logo */}
      <div className="p-3 border-b border-gray-700 flex-shrink-0">
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
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
      <div className="p-2 border-t border-gray-700 flex-shrink-0 bg-gray-900">
        {/* Información del usuario */}
        {backendUser && (
          <div className="mb-2 p-1 rounded-lg bg-gray-800 border border-gray-600">
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
          className="w-full h-10 flex items-center justify-center rounded-lg text-sm text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors border border-gray-600 hover:border-red-500"
          title="Cerrar Sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}; 