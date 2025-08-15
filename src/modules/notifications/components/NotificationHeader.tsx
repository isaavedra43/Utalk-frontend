import React, { useState } from 'react';
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
        <span className="notification-search-icon">🔍</span>
      </div>

      {/* Controles globales */}
      <div className="notification-global-controls">
        <button 
          className="notification-control-btn"
          onClick={onFilters}
          title="Filtros avanzados"
        >
          <span className="notification-control-icon">🔽</span>
          <span className="notification-control-text">Filtros</span>
        </button>
        
        <button 
          className="notification-control-btn"
          onClick={onMarkAllRead}
          title="Marcar todas como leídas"
        >
          <span className="notification-control-icon">✅</span>
          <span className="notification-control-text">Marcar todo leído</span>
        </button>
        
        <button 
          className={`notification-control-btn ${isPaused ? 'paused' : ''}`}
          onClick={handlePauseToggle}
          title={isPaused ? 'Reanudar notificaciones' : 'Pausar notificaciones'}
        >
          <span className="notification-control-icon">
            {isPaused ? '▶️' : '🌙'}
          </span>
          <span className="notification-control-text">
            {isPaused ? 'Reanudar' : 'Pausar'}
          </span>
        </button>
        
        <button 
          className="notification-control-btn icon-only"
          onClick={onSettings}
          title="Configuración"
        >
          <span className="notification-control-icon">⚙️</span>
        </button>
        
        <button 
          className="notification-control-btn icon-only"
          onClick={onExport}
          title="Exportar notificaciones"
        >
          <span className="notification-control-icon">📥</span>
        </button>
        
        <button 
          className="notification-control-btn icon-only"
          onClick={onRefresh}
          title="Actualizar"
        >
          <span className="notification-control-icon">🔄</span>
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