import React from 'react';
import { useAppStore } from '../../stores/useAppStore';

interface ModulePlaceholderProps {
  moduleName: string;
  icon?: React.ReactNode;
  description?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  moduleName,
  icon,
  description
}) => {
  const { currentModule } = useAppStore();

  const getModuleInfo = (module: string) => {
    switch (module) {
      case 'contacts':
        return {
          title: 'Gestión de Contactos',
          description: 'Administra y organiza tus contactos de clientes',
          icon: '👥'
        };
      case 'agents':
        return {
          title: 'Gestión de Agentes',
          description: 'Administra el equipo de agentes y sus permisos',
          icon: '👨‍💼'
        };
      case 'analytics':
        return {
          title: 'Analytics Avanzados',
          description: 'Reportes detallados y análisis de rendimiento',
          icon: '📊'
        };
      case 'settings':
        return {
          title: 'Configuración',
          description: 'Configura las opciones de tu cuenta y sistema',
          icon: '⚙️'
        };
      case 'docs':
        return {
          title: 'Documentación',
          description: 'Guías y documentación del sistema',
          icon: '📚'
        };
      case 'automation':
        return {
          title: 'Automatización',
          description: 'Configura flujos de trabajo automatizados',
          icon: '🤖'
        };
      case 'support':
        return {
          title: 'Soporte',
          description: 'Centro de ayuda y soporte técnico',
          icon: '🎧'
        };
      case 'notifications':
        return {
          title: 'Notificaciones',
          description: 'Gestiona tus notificaciones y alertas',
          icon: '🔔'
        };
      case 'calendar':
        return {
          title: 'Calendario',
          description: 'Programa eventos y reuniones',
          icon: '📅'
        };
      default:
        return {
          title: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
          description: description || 'Módulo en desarrollo',
          icon: icon || '🚧'
        };
    }
  };

  const moduleInfo = getModuleInfo(moduleName);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">{moduleInfo.icon}</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {moduleInfo.title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {moduleInfo.description}
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Estado:</strong> En desarrollo
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Este módulo estará disponible próximamente
          </p>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          Módulo actual: <span className="font-medium">{currentModule}</span>
        </div>
      </div>
    </div>
  );
}; 