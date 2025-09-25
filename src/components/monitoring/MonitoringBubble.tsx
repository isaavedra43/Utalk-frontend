import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minimize2, Maximize2, Monitor, Download, Settings, Bug, Wifi, Database, Activity, Shield, Server, Network, AlertTriangle } from 'lucide-react';
import { MonitoringProvider, useMonitoring } from './MonitoringContext';
import { MonitoringTabs } from './MonitoringTabs';
import { ExportModal } from './ExportModal';
import { useZustandMonitoring } from './useZustandMonitoring';
import './MonitoringBubble.css';

interface Position {
  x: number;
  y: number;
}

interface MonitoringBubbleProps {
  enabled?: boolean;
  position?: Position;
  onClose?: () => void;
}

const MonitoringBubbleContent: React.FC<MonitoringBubbleProps> = ({
  enabled = true,
  position: initialPosition = { x: window.innerWidth - 80, y: window.innerHeight - 80 },
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'apis' | 'websockets' | 'logs' | 'errors' | 'performance' | 'state' | 'permissions' | 'system' | 'network' | 'alerts'>('apis');
  
  const bubbleRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const { stats, clearData } = useMonitoring();
  
  // Integrar monitoreo de Zustand
  useZustandMonitoring();

  // Drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!bubbleRef.current) return;
    
    const rect = bubbleRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))
    };
    
    setPosition(newPosition);
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Auto-hide when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  if (!enabled) return null;

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setIsExpanded(false);
    }
  };

  const getStatusColor = () => {
    const { apis, websockets, errors } = stats;
    const errorRate = apis.total > 0 ? (apis.errors / apis.total) * 100 : 0;
    const wsConnected = websockets.connected;
    
    if (errors.total > 0 || errorRate > 10) return 'bg-red-500';
    if (!wsConnected || errorRate > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <>
      {/* Floating Bubble */}
      <div
        ref={bubbleRef}
        className={`monitoring-bubble ${isExpanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999,
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        {!isExpanded && !isMinimized && (
          <div
            className="monitoring-bubble-collapsed"
            onClick={handleExpand}
            title="Abrir Monitor del Sistema"
          >
            <div className={`status-indicator ${getStatusColor()}`}></div>
            <Monitor className="w-6 h-6 text-white" />
            <div className="stats-preview">
              <div className="stat-item">
                <span className="stat-number">{stats.apis.total}</span>
                <span className="stat-label">APIs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.errors.total}</span>
                <span className="stat-label">Errores</span>
              </div>
            </div>
          </div>
        )}

        {isMinimized && (
          <div
            className="monitoring-bubble-minimized"
            onClick={handleMinimize}
            title="Restaurar Monitor"
          >
            <Monitor className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div
          ref={expandedRef}
          className="monitoring-panel"
          style={{
            position: 'fixed',
            left: Math.max(10, Math.min(window.innerWidth - 800, position.x - 200)),
            top: Math.max(10, Math.min(window.innerHeight - 600, position.y - 100)),
            zIndex: 10000
          }}
        >
          {/* Header */}
          <div className="monitoring-header">
            <div className="header-left">
              <Monitor className="w-5 h-5" />
              <span className="header-title">Monitor del Sistema</span>
              <div className={`connection-status ${stats.websockets.connected ? 'connected' : 'disconnected'}`}>
                <Wifi className="w-4 h-4" />
                <span>{stats.websockets.connected ? 'Conectado' : 'Desconectado'}</span>
              </div>
            </div>
            
            <div className="header-actions">
              <button
                onClick={() => setShowExportModal(true)}
                className="action-btn"
                title="Exportar Datos"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearData}
                className="action-btn"
                title="Limpiar Datos"
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                onClick={handleMinimize}
                className="action-btn"
                title="Minimizar"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="action-btn close-btn"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-group">
              <Activity className="w-4 h-4" />
              <span>APIs: {stats.apis.total} ({stats.apis.success} ✓, {stats.apis.errors} ✗)</span>
            </div>
            <div className="stat-group">
              <Wifi className="w-4 h-4" />
              <span>WS: {stats.websockets.events} eventos</span>
            </div>
            <div className="stat-group">
              <Bug className="w-4 h-4" />
              <span>Errores: {stats.errors.total}</span>
            </div>
            <div className="stat-group">
              <Settings className="w-4 h-4" />
              <span>Rendimiento: {stats.performance.avgResponseTime}ms</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="monitoring-tabs">
            <div className="tab-buttons">
              {[
                { id: 'apis', label: 'APIs', icon: Database },
                { id: 'websockets', label: 'WebSockets', icon: Wifi },
                { id: 'logs', label: 'Logs', icon: Settings },
                { id: 'errors', label: 'Errores', icon: Bug },
                { id: 'performance', label: 'Rendimiento', icon: Activity },
                { id: 'state', label: 'Estado', icon: Monitor },
                { id: 'permissions', label: 'Permisos', icon: Shield },
                { id: 'system', label: 'Sistema', icon: Server },
                { id: 'network', label: 'Red', icon: Network },
                { id: 'alerts', label: 'Alertas', icon: AlertTriangle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`tab-button ${activeTab === id ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {id === 'errors' && stats.errors.total > 0 && (
                    <span className="error-badge">{stats.errors.total}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              <MonitoringTabs activeTab={activeTab} />
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={(format) => {
            // Export logic will be implemented
            console.log('Exporting in format:', format);
            setShowExportModal(false);
          }}
        />
      )}
    </>
  );
};

export const MonitoringBubble: React.FC<MonitoringBubbleProps> = (props) => {
  return (
    <MonitoringProvider>
      <MonitoringBubbleContent {...props} />
    </MonitoringProvider>
  );
};

export default MonitoringBubble;
