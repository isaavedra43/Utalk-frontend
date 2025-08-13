import React from 'react';
import { MessageSquare } from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

export const ThinSidebar: React.FC = () => {
  const sidebarItems: SidebarItem[] = [
    {
      icon: <MessageSquare className="h-4 w-4" />,
      label: 'Chat',
      badge: 12
    }
  ];

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      {/* Título del proyecto */}
      <div className="mb-6 px-2">
        <h1 className="text-xs font-bold text-gray-800 text-center leading-tight">
          UTALK
        </h1>
        <div className="w-8 h-0.5 bg-blue-500 mx-auto mt-1 rounded-full"></div>
      </div>

      {/* Iconos de navegación */}
      <div className="flex-1 flex flex-col items-center space-y-3">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={item.onClick}
          >
            {/* Icono con badge */}
            <div className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                {item.icon}
              </div>
              
              {/* Badge */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              {item.label}
              {/* Flecha del tooltip */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 