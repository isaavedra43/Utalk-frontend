import React from 'react';
import type { NotificationFilters as NotificationFiltersType } from '../types/notification';

interface NotificationFiltersProps {
  filters: NotificationFiltersType;
  stats: {
    today: number;
    unread: number;
    actionable: number;
    urgent: number;
  };
  onCategoryChange: (category: NotificationFiltersType['category']) => void;
  onPriorityChange: (priority: NotificationFiltersType['priority']) => void;
  onTypeChange: (type: NotificationFiltersType['type']) => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  stats,
  onCategoryChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPriorityChange: _onPriorityChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTypeChange: _onTypeChange
}) => {
  return (
    <div className="notification-filters">
      <div className="notification-category-tabs">
        <button
          className={`notification-category-tab ${filters.category === 'today' ? 'active' : ''}`}
          onClick={() => onCategoryChange('today')}
        >
          Hoy ({stats.today})
        </button>
        <button
          className={`notification-category-tab ${filters.category === 'unread' ? 'active' : ''}`}
          onClick={() => onCategoryChange('unread')}
        >
          No leídas ({stats.unread})
        </button>
        <button
          className={`notification-category-tab ${filters.category === 'actionable' ? 'active' : ''}`}
          onClick={() => onCategoryChange('actionable')}
        >
          Accionables ({stats.actionable})
        </button>
        <button
          className={`notification-category-tab ${filters.category === 'urgent' ? 'active' : ''}`}
          onClick={() => onCategoryChange('urgent')}
        >
          Urgentes ({stats.urgent})
        </button>
      </div>
    </div>
  );
}; 