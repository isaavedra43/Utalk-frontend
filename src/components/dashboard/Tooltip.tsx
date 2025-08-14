import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  maxWidth = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.top - tooltipRect.height - 8 + scrollY;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
        y = triggerRect.bottom + 8 + scrollY;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
      case 'right':
        x = triggerRect.right + 8 + scrollX;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
        break;
    }

    // Asegurar que el tooltip no se salga de la pantalla
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
    if (y < 0) y = 8;
    if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

    setCoords({ x, y });
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800';
      default:
        return '';
    }
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
          style={{
            left: coords.x,
            top: coords.y,
            maxWidth: maxWidth
          }}
        >
          {/* Flecha del tooltip */}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${getArrowPosition()}`} />
          
          {/* Contenido del tooltip */}
          <div className="relative z-10">
            {typeof content === 'string' ? (
              <span>{content}</span>
            ) : (
              content
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de tooltip especializado para métricas
export const MetricTooltip: React.FC<{
  title: string;
  value: string | number;
  description: string;
  trend?: string;
  children: React.ReactNode;
}> = ({ title, value, description, trend, children }) => (
  <Tooltip
    content={
      <div className="space-y-2">
        <div className="font-semibold">{title}</div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-gray-300 text-xs">{description}</div>
        {trend && (
          <div className="text-xs">
            <span className={trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
              {trend}
            </span>
          </div>
        )}
      </div>
    }
    maxWidth={250}
  >
    {children}
  </Tooltip>
);

// Componente de tooltip para agentes
export const AgentTooltip: React.FC<{
  name: string;
  performance: number;
  status: string;
  lastActivity: string;
  children: React.ReactNode;
}> = ({ name, performance, status, lastActivity, children }) => (
  <Tooltip
    content={
      <div className="space-y-2">
        <div className="font-semibold">{name}</div>
        <div className="text-sm">
          <span className="text-green-400">{performance}%</span> rendimiento
        </div>
        <div className="text-xs text-gray-300">
          Estado: {status}
        </div>
        <div className="text-xs text-gray-300">
          {lastActivity}
        </div>
      </div>
    }
    maxWidth={200}
  >
    {children}
  </Tooltip>
); 