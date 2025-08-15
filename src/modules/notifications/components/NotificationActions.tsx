import React from 'react';

interface NotificationActionsProps {
  onFilters: () => void;
  onMarkAllRead: () => void;
  onPause: () => void;
  onSettings: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

export const NotificationActions: React.FC<NotificationActionsProps> = ({
  onFilters,
  onMarkAllRead,
  onPause,
  onSettings,
  onExport,
  onRefresh
}) => {
  return (
    <div className="notification-global-controls">
      <button onClick={onFilters}>
        <span>🔽</span>
        Filtros
      </button>
      <button onClick={onMarkAllRead}>
        <span>✅</span>
        Marcar todo leído
      </button>
      <button onClick={onPause}>
        <span>🌙</span>
        Pausar
      </button>
      <button onClick={onSettings}>
        <span>⚙️</span>
      </button>
      <button onClick={onExport}>
        <span>📥</span>
      </button>
      <button onClick={onRefresh}>
        <span>🔄</span>
      </button>
    </div>
  );
}; 