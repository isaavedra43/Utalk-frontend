import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  Moon, 
  Settings, 
  Download, 
  RefreshCw,
  Mail
} from 'lucide-react';
import { NotificationFilters } from './NotificationFilters';
import type { NotificationStats } from '../types/notification';

interface NotificationHeaderProps {
  title: string;
  subtitle: string;
  onSearch: (query: string) => void;
  onFilters: () => void;
  onMarkAllRead: () => void;
  onPause: () => void;
  onSettings: () => void;
  onExport: () => void;
  onRefresh: () => void;
  stats?: NotificationStats;
  currentCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  title,
  subtitle,
  onSearch,
  onFilters,
  onMarkAllRead,
  onPause,
  onSettings,
  onExport,
  onRefresh,
  stats,
  currentCategory = 'today',
  onCategoryChange
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      onPause();
    } else {
      onPause(); // Asumiendo que onPause maneja tanto pausar como reanudar
    }
  };

  const handleAction = (action: string) => {
    if (action === 'email') {
      // Implementar lógica de envío de email
      // Enviando email...
    }
  };

  return (
    <div className="notification-header">
      {/* Título y subtítulo */}
      <div className="notification-header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="notification-search">
        <input
          type="text"
          value={searchValue}
          placeholder="Buscar notificaciones... (from:, type:, priority:)"
          onChange={handleSearchChange}
          className="notification-search-input"
        />
        <Search className="notification-search-icon" size={16} />
      </div>

      {/* Controles globales */}
      <div className="notification-global-controls">
        <button 
          className="notification-control-btn"
          onClick={onFilters}
          title="Filtros avanzados"
        >
          <Filter size={16} />
          <span className="notification-control-text">Filtros</span>
        </button>
        
        <button 
          className="notification-control-btn"
          onClick={onMarkAllRead}
          title="Marcar todas como leídas"
        >
          <Check size={16} />
          <span className="notification-control-text">Marcar todo leído</span>
        </button>
        
        <button 
          className={`notification-control-btn ${isPaused ? 'paused' : ''}`}
          onClick={handlePauseToggle}
          title={isPaused ? 'Reanudar notificaciones' : 'Pausar notificaciones'}
        >
          <Moon size={16} />
          <span className="notification-control-text">Pausar</span>
        </button>
        
        <button 
          className="notification-control-btn icon-only"
          onClick={onSettings}
          title="Configuración"
        >
          <Settings size={16} />
        </button>
        
        <button 
          className="notification-control-btn icon-only"
          onClick={onExport}
          title="Exportar"
        >
          <Download size={16} />
        </button>
        
        <button 
          className="notification-control-btn icon-only"
          onClick={onRefresh}
          title="Actualizar"
        >
          <RefreshCw size={16} />
        </button>
        
        <button 
          onClick={() => handleAction('email')}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Email</span>
        </button>
      </div>

      {/* Pestañas de categorías */}
      {stats && onCategoryChange && (
        <NotificationFilters
          filters={{
            category: currentCategory as 'today' | 'unread' | 'actionable' | 'urgent' | 'all',
            priority: 'all',
            type: 'all',
            search: ''
          }}
          stats={{
            today: stats.total,
            unread: stats.unread,
            actionable: stats.actionable,
            urgent: stats.urgent
          }}
          onCategoryChange={onCategoryChange}
          onPriorityChange={() => {}}
          onTypeChange={() => {}}
        />
      )}
    </div>
  );
}; 