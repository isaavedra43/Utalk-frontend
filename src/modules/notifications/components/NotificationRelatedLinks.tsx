import React from 'react';
import { MessageSquare, User, FileText, Calendar, Settings, ExternalLink } from 'lucide-react';
import type { RelatedLink } from '../../../types/notification';

interface NotificationRelatedLinksProps {
  links: RelatedLink[];
  title?: string;
  className?: string;
}

export const NotificationRelatedLinks: React.FC<NotificationRelatedLinksProps> = ({
  links,
  title = 'ENLACES RELACIONADOS',
  className = ''
}) => {
  const getLinkIcon = (iconName: string) => {
    switch (iconName) {
      case 'message-square':
        return <MessageSquare className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'file-text':
        return <FileText className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'external-link':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const handleLinkClick = (link: RelatedLink) => {
    link.action();
  };

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className={`notification-related-links ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      
      <div className="space-y-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => handleLinkClick(link)}
            className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
          >
            {/* Icono del enlace */}
            <div className="flex-shrink-0 text-gray-500 group-hover:text-blue-600 transition-colors">
              {getLinkIcon(link.icon)}
            </div>
            
            {/* Etiqueta del enlace */}
            <span className="flex-1 text-sm text-gray-900 font-medium">
              {link.label}
            </span>
            
            {/* Indicador de acción */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 