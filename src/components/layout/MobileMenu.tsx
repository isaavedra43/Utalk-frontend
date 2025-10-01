import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Menu, 
  LayoutDashboard, 
  Building2, 
  Users, 
  Bell, 
  MessageSquare, 
  MessageCircle, 
  Megaphone, 
  Phone, 
  BookOpen, 
  UserCheck, 
  Eye, 
  Bot, 
  Package, 
  Settings,
  Archive
} from 'lucide-react';
import { useModulePermissions } from '../../hooks/useModulePermissions';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { canAccessModule, loading: permissionsLoading } = useModulePermissions();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menú */}
      <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h2 className="text-lg font-semibold">Menú</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navegación del menú */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {(() => {
                const allMenuItems = [
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
                  { id: 'clients', icon: Building2, label: 'Customer Hub', path: '/clients' },
                  { id: 'team', icon: Users, label: 'Equipo & Performance', path: '/team' },
                  { id: 'notifications', icon: Bell, label: 'Centro de Notificaciones', path: '/notifications' },
                  { id: 'chat', icon: MessageSquare, label: 'Mensajes', path: '/chat' },
                  { id: 'internal-chat', icon: MessageCircle, label: 'Chat Interno', path: '/internal-chat' },
                  { id: 'campaigns', icon: Megaphone, label: 'Campañas', path: '/campaigns' },
                  { id: 'phone', icon: Phone, label: 'Teléfono', path: '/phone' },
                  { id: 'knowledge-base', icon: BookOpen, label: 'Base de Conocimiento', path: '/knowledge-base' },
                  { id: 'hr', icon: UserCheck, label: 'Recursos Humanos', path: '/hr' },
                  { id: 'supervision', icon: Eye, label: 'Supervisión', path: '/supervision' },
                  { id: 'copilot', icon: Bot, label: 'Copiloto IA', path: '/copilot' },
                  { id: 'inventory', icon: Archive, label: 'Inventario', path: '/inventory' },
                  { id: 'shipping', icon: Package, label: 'Envíos', path: '/shipping' },
                  { id: 'services', icon: Settings, label: 'Servicios', path: '/services' }
                ];

                // Si está cargando permisos, no mostrar ningún elemento para evitar parpadeo
                if (permissionsLoading) {
                  return (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Cargando...</span>
                    </div>
                  );
                }

                // Filtrar solo los elementos a los que tiene acceso
                return allMenuItems
                  .filter(item => canAccessModule(item.id))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                    </button>
                  ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para manejar el estado del menú móvil
export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu
  };
};
