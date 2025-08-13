import React from 'react';
import { MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-screen w-16 bg-white border-r border-gray-200">
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
          {/* Dashboard */}
          <button
            onClick={() => navigateToModule('dashboard')}
            className={`w-full h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
              currentModule === 'dashboard' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5" />
          </button>

          {/* Chat */}
          <button
            onClick={() => navigateToModule('chat')}
            className={`w-full h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
              currentModule === 'chat' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Información del Usuario y Logout */}
      <div className="p-2 border-t border-gray-200 flex-shrink-0 bg-gray-50">
        {/* Información del usuario */}
        {backendUser && (
          <div className="mb-2 p-1 rounded-lg bg-white border border-gray-200">
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
          className="w-full h-10 flex items-center justify-center rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
          title="Cerrar Sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}; 