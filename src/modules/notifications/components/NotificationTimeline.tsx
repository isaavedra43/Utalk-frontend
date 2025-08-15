import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { TimelineEvent } from '../../../types/notification';

interface NotificationTimelineProps {
  events: TimelineEvent[];
  title?: string;
  className?: string;
}

export const NotificationTimeline: React.FC<NotificationTimelineProps> = ({
  events,
  title = 'Timeline',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className={`notification-timeline ${className}`}>
      {/* Header colapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <span className="text-xs text-gray-500">({events.length} eventos)</span>
        </div>
        
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-3 border-l-4 rounded-r-lg ${getEventColor(event.type)}`}
            >
              <div className="flex items-start gap-3">
                {/* Icono del evento */}
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Contenido del evento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {event.timestamp}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 