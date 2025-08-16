import React, { useState, useEffect } from 'react';
import { useRateLimiter } from '../hooks/useRateLimiter';

interface RateLimitStat {
  requestCount: number;
  maxRequests: number;
  timeWindow: number;
  lastRequestTime: number;
  lastResetTime: number;
}

export const RateLimitStats: React.FC = () => {
  const rateLimiter = useRateLimiter();
  const [stats, setStats] = useState<Record<string, RateLimitStat>>({});

  useEffect(() => {
    const updateStats = () => {
      const eventTypes = [
        'typing',
        'typing-stop', 
        'join-conversation',
        'leave-conversation',
        'new-message',
        'message-read',
        'user-status-change',
        'sync-state'
      ];

      const newStats: Record<string, RateLimitStat> = {};
      eventTypes.forEach(eventType => {
        newStats[eventType] = rateLimiter.getStats();
      });

      setStats(newStats);
    };

    // Actualizar stats cada segundo
    const interval = setInterval(updateStats, 1000);
    updateStats(); // Actualizar inmediatamente

    return () => clearInterval(interval);
  }, [rateLimiter]);

  const getStatusColor = (eventType: string) => {
    const stat = stats[eventType];
    if (!stat) return 'text-gray-500';
    
    if (stat.requestCount >= stat.maxRequests) return 'text-red-600';
    if (stat.requestCount > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">📊 Rate Limiting Stats</h3>
      <div className="space-y-2 text-xs">
        {Object.entries(stats).map(([eventType, stat]) => (
          <div key={eventType} className="flex justify-between items-center">
            <span className="font-mono">{eventType}:</span>
            <div className="flex items-center gap-2">
              <span className={getStatusColor(eventType)}>
                {stat.requestCount >= stat.maxRequests ? `⏳ ${stat.requestCount}/${stat.maxRequests}` : '✅'}
              </span>
              <span className="text-gray-500">
                {stat.requestCount > 0 ? `${stat.requestCount}` : '0'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <div>⏳ = En cola</div>
        <div>✅ = Disponible</div>
        <div>Número = Intentos recientes</div>
      </div>
    </div>
  );
}; 