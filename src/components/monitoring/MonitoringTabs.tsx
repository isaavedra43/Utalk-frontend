import React, { useState, useMemo } from 'react';
import { useMonitoring } from './MonitoringContext';
import { AIAnalysisModal } from './AIAnalysisModal';
import { AdvancedMetrics } from './AdvancedMetrics';
import { AlertSystem } from './AlertSystem';
import { useAuthContext } from '../../contexts/useAuthContext';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import '../monitoring/AdvancedMetrics.css';
import '../monitoring/AlertSystem.css';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Database, 
  Wifi, 
  Activity,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Brain,
  Shield,
  Server,
  Network,
  User,
  Settings,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Lock,
  Eye,
  UserCheck
} from 'lucide-react';
import './MonitoringTabs.css';

interface MonitoringTabsProps {
  activeTab: 'apis' | 'websockets' | 'logs' | 'errors' | 'performance' | 'state' | 'permissions' | 'system' | 'network' | 'alerts';
}

export const MonitoringTabs: React.FC<MonitoringTabsProps> = ({ activeTab }) => {
  const { apis, websockets, logs, errors, performance, states, validations } = useMonitoring();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIcon = (status?: number, error?: string) => {
    if (error) return <XCircle className="w-4 h-4 text-red-500" />;
    if (!status) return <Clock className="w-4 h-4 text-gray-400" />;
    if (status >= 200 && status < 300) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status >= 400) return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Activity className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderApiTab = () => {
    const filteredApis = apis.filter(api => {
      const matchesSearch = searchTerm === '' || 
        api.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        api.method.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterLevel === 'all' || 
        (filterLevel === 'success' && api.status && api.status >= 200 && api.status < 300) ||
        (filterLevel === 'error' && (api.error || (api.status && api.status >= 400))) ||
        (filterLevel === 'pending' && !api.status && !api.error);
      
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar APIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="success">Exitosos</option>
              <option value="error">Errores</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>

        <div className="tab-body">
          {filteredApis.length === 0 ? (
            <div className="empty-state">
              <Database className="w-12 h-12 text-gray-300" />
              <p>No hay llamadas API que mostrar</p>
            </div>
          ) : (
            <div className="api-list">
              {filteredApis.map((api) => (
                <div key={api.id} className="api-item">
                  <div className="api-header" onClick={() => toggleExpanded(api.id)}>
                    <div className="api-status">
                      {getStatusIcon(api.status, api.error)}
                      <span className="method-badge" data-method={api.method.toLowerCase()}>
                        {api.method}
                      </span>
                    </div>
                    
                    <div className="api-info">
                      <span className="api-url">{api.url}</span>
                      <div className="api-meta">
                        <span className="timestamp">{formatTimestamp(api.timestamp)}</span>
                        {api.duration && <span className="duration">{api.duration}ms</span>}
                        {api.status && <span className="status-code">{api.status}</span>}
                      </div>
                    </div>
                    
                    <div className="api-actions">
                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(api.url); }}>
                        <Copy className="w-4 h-4" />
                      </button>
                      {expandedItems.has(api.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  {expandedItems.has(api.id) && (
                    <div className="api-details">
                      {api.requestHeaders && Object.keys(api.requestHeaders).length > 0 && (
                        <div className="detail-section">
                          <h4>Request Headers</h4>
                          <pre>{JSON.stringify(api.requestHeaders, null, 2)}</pre>
                        </div>
                      )}
                      
                      {api.requestData && (
                        <div className="detail-section">
                          <h4>Request Data</h4>
                          <pre>{JSON.stringify(api.requestData, null, 2)}</pre>
                        </div>
                      )}
                      
                      {api.responseHeaders && Object.keys(api.responseHeaders).length > 0 && (
                        <div className="detail-section">
                          <h4>Response Headers</h4>
                          <pre>{JSON.stringify(api.responseHeaders, null, 2)}</pre>
                        </div>
                      )}
                      
                      {api.responseData && (
                        <div className="detail-section">
                          <h4>Response Data</h4>
                          <pre>{JSON.stringify(api.responseData, null, 2)}</pre>
                        </div>
                      )}
                      
                      {api.error && (
                        <div className="detail-section error">
                          <h4>Error</h4>
                          <pre>{api.error}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWebSocketTab = () => {
    const filteredWs = websockets.filter(ws => {
      return searchTerm === '' || 
        ws.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.url?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos WebSocket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="tab-body">
          {filteredWs.length === 0 ? (
            <div className="empty-state">
              <Wifi className="w-12 h-12 text-gray-300" />
              <p>No hay eventos WebSocket que mostrar</p>
            </div>
          ) : (
            <div className="ws-list">
              {filteredWs.map((ws) => (
                <div key={ws.id} className="ws-item">
                  <div className="ws-header" onClick={() => toggleExpanded(ws.id)}>
                    <div className="ws-type">
                      <div className={`ws-type-indicator ${ws.type}`}>
                        {ws.type === 'connect' && <CheckCircle className="w-4 h-4" />}
                        {ws.type === 'disconnect' && <XCircle className="w-4 h-4" />}
                        {ws.type === 'message' && <Activity className="w-4 h-4" />}
                        {ws.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                        {ws.type === 'emit' && <Zap className="w-4 h-4" />}
                      </div>
                      <span className="ws-type-label">{ws.type}</span>
                    </div>
                    
                    <div className="ws-info">
                      <span className="ws-event">{ws.event || 'N/A'}</span>
                      <div className="ws-meta">
                        <span className="timestamp">{formatTimestamp(ws.timestamp)}</span>
                        {ws.socketId && <span className="socket-id">{ws.socketId.substring(0, 8)}...</span>}
                      </div>
                    </div>
                    
                    <div className="ws-actions">
                      {expandedItems.has(ws.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  {expandedItems.has(ws.id) && (
                    <div className="ws-details">
                      {ws.url && (
                        <div className="detail-section">
                          <h4>URL</h4>
                          <pre>{ws.url}</pre>
                        </div>
                      )}
                      
                      {ws.data && (
                        <div className="detail-section">
                          <h4>Data</h4>
                          <pre>{JSON.stringify(ws.data, null, 2)}</pre>
                        </div>
                      )}
                      
                      {ws.error && (
                        <div className="detail-section error">
                          <h4>Error</h4>
                          <pre>{ws.error}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLogsTab = () => {
    const filteredLogs = logs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterLevel === 'all' || log.level === filterLevel;
      
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div className="tab-body">
          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <Activity className="w-12 h-12 text-gray-300" />
              <p>No hay logs que mostrar</p>
            </div>
          ) : (
            <div className="log-list">
              {filteredLogs.map((log) => (
                <div key={log.id} className={`log-item ${log.level}`}>
                  <div className="log-header" onClick={() => toggleExpanded(log.id)}>
                    <div className="log-level">
                      {getLevelIcon(log.level)}
                      <span className="level-label">{log.level.toUpperCase()}</span>
                    </div>
                    
                    <div className="log-info">
                      <span className="log-message">{log.message}</span>
                      <div className="log-meta">
                        <span className="timestamp">{formatTimestamp(log.timestamp)}</span>
                        <span className="category">{log.category}</span>
                        {log.source && <span className="source">{log.source}</span>}
                      </div>
                    </div>
                    
                    <div className="log-actions">
                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(log.message); }}>
                        <Copy className="w-4 h-4" />
                      </button>
                      {expandedItems.has(log.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  {expandedItems.has(log.id) && (
                    <div className="log-details">
                      {log.data && (
                        <div className="detail-section">
                          <h4>Data</h4>
                          <pre>{JSON.stringify(log.data, null, 2)}</pre>
                        </div>
                      )}
                      
                      {log.stack && (
                        <div className="detail-section">
                          <h4>Stack Trace</h4>
                          <pre>{log.stack}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderErrorsTab = () => {
    const filteredErrors = errors.filter(error => {
      return searchTerm === '' || 
        error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.source?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar errores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="tab-body">
          {filteredErrors.length === 0 ? (
            <div className="empty-state">
              <CheckCircle className="w-12 h-12 text-green-300" />
              <p>¡No hay errores! Todo funciona correctamente.</p>
            </div>
          ) : (
            <div className="error-list">
              {filteredErrors.map((error) => (
                <div key={error.id} className="error-item">
                  <div className="error-header" onClick={() => toggleExpanded(error.id)}>
                    <div className="error-icon">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    
                    <div className="error-info">
                      <span className="error-name">{error.name}</span>
                      <span className="error-message">{error.message}</span>
                      <div className="error-meta">
                        <span className="timestamp">{formatTimestamp(error.timestamp)}</span>
                        {error.source && <span className="source">{error.source}</span>}
                        {error.url && <span className="url">{error.url}</span>}
                      </div>
                    </div>
                    
                    <div className="error-actions">
                      <button onClick={(e) => { e.stopPropagation(); copyToClipboard(error.stack || error.message); }}>
                        <Copy className="w-4 h-4" />
                      </button>
                      {expandedItems.has(error.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  {expandedItems.has(error.id) && (
                    <div className="error-details">
                      {error.stack && (
                        <div className="detail-section">
                          <h4>Stack Trace</h4>
                          <pre>{error.stack}</pre>
                        </div>
                      )}
                      
                      {error.componentStack && (
                        <div className="detail-section">
                          <h4>Component Stack</h4>
                          <pre>{error.componentStack}</pre>
                        </div>
                      )}
                      
                      {error.props && (
                        <div className="detail-section">
                          <h4>Props</h4>
                          <pre>{JSON.stringify(error.props, null, 2)}</pre>
                        </div>
                      )}
                      
                      {error.state && (
                        <div className="detail-section">
                          <h4>State</h4>
                          <pre>{JSON.stringify(error.state, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    const [performanceView, setPerformanceView] = useState<'advanced' | 'detailed'>('advanced');
    
    const filteredPerformance = performance.filter(metric => {
      return searchTerm === '' || 
        metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.type.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const groupedMetrics = useMemo(() => {
      const groups: Record<string, typeof filteredPerformance> = {};
      filteredPerformance.forEach(metric => {
        if (!groups[metric.type]) {
          groups[metric.type] = [];
        }
        groups[metric.type].push(metric);
      });
      return groups;
    }, [filteredPerformance]);

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar métricas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="performance-view-toggle">
              <button
                onClick={() => setPerformanceView('advanced')}
                className={`view-toggle-btn ${performanceView === 'advanced' ? 'active' : ''}`}
              >
                <Activity className="w-4 h-4" />
                Métricas Avanzadas
              </button>
              <button
                onClick={() => setPerformanceView('detailed')}
                className={`view-toggle-btn ${performanceView === 'detailed' ? 'active' : ''}`}
              >
                <Database className="w-4 h-4" />
                Vista Detallada
              </button>
            </div>
          </div>
        </div>

        <div className="tab-body">
          {performanceView === 'advanced' ? (
            <AdvancedMetrics />
          ) : (
            <>
              {Object.keys(groupedMetrics).length === 0 ? (
                <div className="empty-state">
                  <Activity className="w-12 h-12 text-gray-300" />
                  <p>No hay métricas de rendimiento que mostrar</p>
                </div>
              ) : (
                <div className="performance-groups">
                  {Object.entries(groupedMetrics).map(([type, metrics]) => (
                    <div key={type} className="performance-group">
                      <h3 className="group-title">{type.toUpperCase()}</h3>
                      <div className="metrics-list">
                        {metrics.map((metric) => (
                          <div key={metric.id} className="metric-item">
                            <div className="metric-header" onClick={() => toggleExpanded(metric.id)}>
                              <div className="metric-info">
                                <span className="metric-name">{metric.name}</span>
                                <div className="metric-value">
                                  <span className="value">{metric.value}</span>
                                  <span className="unit">{metric.unit}</span>
                                </div>
                                <span className="timestamp">{formatTimestamp(metric.timestamp)}</span>
                              </div>
                              
                              <div className="metric-actions">
                                {expandedItems.has(metric.id) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </div>
                            </div>
                            
                            {expandedItems.has(metric.id) && metric.details && (
                              <div className="metric-details">
                                <div className="detail-section">
                                  <h4>Details</h4>
                                  <pre>{JSON.stringify(metric.details, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStateTab = () => {
    const filteredStates = states.filter(state => {
      return searchTerm === '' || 
        state.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.action?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalDataItems = apis.length + websockets.length + logs.length + errors.length + performance.length + states.length;

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cambios de estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              onClick={() => setShowAIAnalysis(true)}
              className="ai-analysis-button"
              title="Análisis Inteligente con IA"
            >
              <Brain className="w-4 h-4" />
              <span>Análisis IA</span>
            </button>
          </div>
        </div>

        <div className="tab-body">
          {filteredStates.length === 0 ? (
            <div className="empty-state">
              <Database className="w-12 h-12 text-gray-300" />
              <p>No hay cambios de estado que mostrar</p>
              {totalDataItems > 0 && (
                <div className="ai-analysis-cta">
                  <p>💡 Tienes {totalDataItems} elementos de monitoreo disponibles</p>
                  <button
                    onClick={() => setShowAIAnalysis(true)}
                    className="cta-analysis-button"
                  >
                    <Brain className="w-5 h-5" />
                    Generar Análisis Completo con IA
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="state-list">
              {filteredStates.map((state) => (
                <div key={state.id} className="state-item">
                  <div className="state-header" onClick={() => toggleExpanded(state.id)}>
                    <div className="state-info">
                      <span className="store-name">{state.store}</span>
                      {state.action && <span className="action-name">{state.action}</span>}
                      <span className="timestamp">{formatTimestamp(state.timestamp)}</span>
                    </div>
                    
                    <div className="state-actions">
                      {expandedItems.has(state.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </div>
                  
                  {expandedItems.has(state.id) && (
                    <div className="state-details">
                      {state.previousState && (
                        <div className="detail-section">
                          <h4>Previous State</h4>
                          <pre>{JSON.stringify(state.previousState, null, 2)}</pre>
                        </div>
                      )}
                      
                      {state.newState && (
                        <div className="detail-section">
                          <h4>New State</h4>
                          <pre>{JSON.stringify(state.newState, null, 2)}</pre>
                        </div>
                      )}
                      
                      {state.diff && (
                        <div className="detail-section">
                          <h4>Diff</h4>
                          <pre>{JSON.stringify(state.diff, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPermissionsTab = () => {
    const { backendUser } = useAuthContext();
    const { permissions, accessibleModules, canAccessModule, hasPermission, loading, error } = useModulePermissions();

    // Módulos definidos en el sistema
    const allModules = [
      { id: 'dashboard', name: 'Dashboard', description: 'Panel principal' },
      { id: 'chat', name: 'Chat', description: 'Mensajería y conversaciones' },
      { id: 'clients', name: 'Clientes', description: 'Gestión de clientes' },
      { id: 'team', name: 'Equipo', description: 'Gestión de agentes' },
      { id: 'hr', name: 'Recursos Humanos', description: 'Empleados y nómina' },
      { id: 'campaigns', name: 'Campañas', description: 'Marketing y envíos' },
      { id: 'phone', name: 'Teléfono', description: 'Llamadas VoIP' },
      { id: 'knowledge-base', name: 'Base de Conocimiento', description: 'Documentación' },
      { id: 'supervision', name: 'Supervisión', description: 'Monitoreo de agentes' },
      { id: 'copilot', name: 'Copiloto IA', description: 'Asistente inteligente' },
      { id: 'providers', name: 'Proveedores', description: 'Gestión de proveedores' },
      { id: 'warehouse', name: 'Almacén', description: 'Inventario y stock' },
      { id: 'shipping', name: 'Envíos', description: 'Logística de entrega' },
      { id: 'services', name: 'Servicios', description: 'Configuración de servicios' }
    ];

    const validateModuleAccess = (moduleId: string) => {
      const hasAccess = canAccessModule(moduleId);
      const canRead = hasPermission(moduleId, 'read');
      const canWrite = hasPermission(moduleId, 'write');
      const canConfigure = hasPermission(moduleId, 'configure');
      
      return {
        hasAccess,
        permissions: { read: canRead, write: canWrite, configure: canConfigure },
        status: hasAccess ? 'allowed' : 'denied'
      };
    };

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="permissions-header">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3>Permisos y Acceso de Usuario</h3>
            {loading && <span className="loading-indicator">Cargando...</span>}
            {error && <span className="error-indicator">Error: {error}</span>}
          </div>
        </div>

        <div className="tab-body">
          {/* Información del Usuario */}
          <div className="user-info-section">
            <h4>Información del Usuario Actual</h4>
            <div className="user-details">
              <div className="user-detail-item">
                <User className="w-4 h-4" />
                <span><strong>Nombre:</strong> {backendUser?.name || 'N/A'}</span>
              </div>
              <div className="user-detail-item">
                <Globe className="w-4 h-4" />
                <span><strong>Email:</strong> {backendUser?.email || 'N/A'}</span>
              </div>
              <div className="user-detail-item">
                <Shield className="w-4 h-4" />
                <span><strong>Rol:</strong> {backendUser?.role || 'N/A'}</span>
              </div>
              <div className="user-detail-item">
                <Settings className="w-4 h-4" />
                <span><strong>Departamento:</strong> {backendUser?.department || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Permisos Generales */}
          {backendUser?.permissions && (
            <div className="permissions-section">
              <h4>Permisos Generales del Sistema</h4>
              <div className="permissions-grid">
                {backendUser.permissions.map((permission, index) => (
                  <div key={index} className="permission-item granted">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acceso a Módulos */}
          <div className="modules-access-section">
            <h4>Acceso a Módulos del Sistema</h4>
            <div className="modules-grid">
              {allModules.map((module) => {
                const validation = validateModuleAccess(module.id);
                return (
                  <div key={module.id} className={`module-access-item ${validation.status}`}>
                    <div className="module-header">
                      <div className="module-status">
                        {validation.hasAccess ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="module-name">{module.name}</span>
                      </div>
                      <span className={`access-badge ${validation.status}`}>
                        {validation.hasAccess ? 'PERMITIDO' : 'DENEGADO'}
                      </span>
                    </div>
                    <p className="module-description">{module.description}</p>
                    
                    {validation.hasAccess && (
                      <div className="module-permissions">
                        <div className={`permission-badge ${validation.permissions.read ? 'granted' : 'denied'}`}>
                          <Eye className="w-3 h-3" />
                          <span>Leer</span>
                        </div>
                        <div className={`permission-badge ${validation.permissions.write ? 'granted' : 'denied'}`}>
                          <Settings className="w-3 h-3" />
                          <span>Escribir</span>
                        </div>
                        <div className={`permission-badge ${validation.permissions.configure ? 'granted' : 'denied'}`}>
                          <Lock className="w-3 h-3" />
                          <span>Configurar</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Módulos Accesibles desde Backend */}
          {accessibleModules && accessibleModules.length > 0 && (
            <div className="backend-modules-section">
              <h4>Módulos Configurados en Backend ({accessibleModules.length})</h4>
              <div className="backend-modules-list">
                {accessibleModules.map((module) => (
                  <div key={module.id} className="backend-module-item">
                    <div className="backend-module-header">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="backend-module-name">{module.name}</span>
                      <span className="backend-module-id">({module.id})</span>
                    </div>
                    <p className="backend-module-description">{module.description}</p>
                    {module.permissions && (
                      <div className="backend-module-permissions">
                        {module.permissions.read && <span className="permission-tag">READ</span>}
                        {module.permissions.write && <span className="permission-tag">WRITE</span>}
                        {module.permissions.configure && <span className="permission-tag">CONFIGURE</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSystemTab = () => {
    const [systemStats, setSystemStats] = useState({
      memory: { used: 0, total: 0, percentage: 0 },
      performance: { fps: 0, renderTime: 0 },
      browser: { name: '', version: '', userAgent: '' },
      screen: { width: 0, height: 0, colorDepth: 0 },
      connection: { type: 'unknown', speed: 'unknown' },
      storage: { localStorage: 0, sessionStorage: 0 },
      cache: { size: 0, entries: 0 }
    });

    React.useEffect(() => {
      const updateSystemStats = () => {
        // Memoria del navegador
        const memory = (performance as any).memory;
        const memoryUsed = memory ? memory.usedJSHeapSize : 0;
        const memoryTotal = memory ? memory.totalJSHeapSize : 0;
        const memoryPercentage = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

        // Performance
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const renderTime = navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.navigationStart : 0;

        // Browser info
        const userAgent = navigator.userAgent;
        const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
        const browserName = browserMatch ? browserMatch[1] : 'Unknown';
        const browserVersion = browserMatch ? browserMatch[2] : 'Unknown';

        // Connection info
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const connectionType = connection ? connection.effectiveType || connection.type || 'unknown' : 'unknown';
        const connectionSpeed = connection ? connection.downlink || 'unknown' : 'unknown';

        // Storage info
        let localStorageSize = 0;
        let sessionStorageSize = 0;
        try {
          localStorageSize = JSON.stringify(localStorage).length;
          sessionStorageSize = JSON.stringify(sessionStorage).length;
        } catch (e) {
          // Storage might be disabled
        }

        setSystemStats({
          memory: {
            used: memoryUsed,
            total: memoryTotal,
            percentage: memoryPercentage
          },
          performance: {
            fps: 60, // Estimado
            renderTime: renderTime
          },
          browser: {
            name: browserName,
            version: browserVersion,
            userAgent: userAgent
          },
          screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
          },
          connection: {
            type: connectionType,
            speed: connectionSpeed
          },
          storage: {
            localStorage: localStorageSize,
            sessionStorage: sessionStorageSize
          },
          cache: {
            size: 0, // Placeholder
            entries: 0 // Placeholder
          }
        });
      };

      updateSystemStats();
      const interval = setInterval(updateSystemStats, 5000);
      return () => clearInterval(interval);
    }, []);

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="system-header">
            <Server className="w-5 h-5 text-purple-500" />
            <h3>Estado del Sistema</h3>
          </div>
        </div>

        <div className="tab-body">
          {/* Métricas de Rendimiento */}
          <div className="system-section">
            <h4><Cpu className="w-4 h-4" /> Rendimiento</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <MemoryStick className="w-4 h-4 text-blue-500" />
                  <span>Memoria</span>
                </div>
                <div className="metric-value">
                  {formatBytes(systemStats.memory.used)} / {formatBytes(systemStats.memory.total)}
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-bar-fill" 
                    style={{ width: `${systemStats.memory.percentage}%` }}
                  ></div>
                </div>
                <div className="metric-percentage">{systemStats.memory.percentage.toFixed(1)}%</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>Tiempo de Carga</span>
                </div>
                <div className="metric-value">{systemStats.performance.renderTime.toFixed(0)}ms</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Monitor className="w-4 h-4 text-orange-500" />
                  <span>FPS Estimado</span>
                </div>
                <div className="metric-value">{systemStats.performance.fps} fps</div>
              </div>
            </div>
          </div>

          {/* Información del Navegador */}
          <div className="system-section">
            <h4><Globe className="w-4 h-4" /> Navegador</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Navegador:</span>
                <span className="info-value">{systemStats.browser.name} {systemStats.browser.version}</span>
              </div>
              <div className="info-item">
                <span className="info-label">User Agent:</span>
                <span className="info-value user-agent">{systemStats.browser.userAgent}</span>
              </div>
            </div>
          </div>

          {/* Información de Pantalla */}
          <div className="system-section">
            <h4><Monitor className="w-4 h-4" /> Pantalla</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Resolución:</span>
                <span className="info-value">{systemStats.screen.width} x {systemStats.screen.height}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Profundidad de Color:</span>
                <span className="info-value">{systemStats.screen.colorDepth} bits</span>
              </div>
            </div>
          </div>

          {/* Información de Conexión */}
          <div className="system-section">
            <h4><Network className="w-4 h-4" /> Conexión</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{systemStats.connection.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Velocidad:</span>
                <span className="info-value">{systemStats.connection.speed} Mbps</span>
              </div>
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="system-section">
            <h4><HardDrive className="w-4 h-4" /> Almacenamiento</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">localStorage:</span>
                <span className="info-value">{formatBytes(systemStats.storage.localStorage)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">sessionStorage:</span>
                <span className="info-value">{formatBytes(systemStats.storage.sessionStorage)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNetworkTab = () => {
    const [networkStats, setNetworkStats] = useState({
      online: navigator.onLine,
      latency: 0,
      bandwidth: { download: 0, upload: 0 },
      requests: { active: 0, completed: 0, failed: 0 },
      websocketStatus: 'unknown' as 'connected' | 'disconnected' | 'connecting' | 'unknown',
      backendHealth: 'unknown' as 'healthy' | 'degraded' | 'down' | 'unknown',
      lastPing: 0
    });

    React.useEffect(() => {
      const updateNetworkStats = async () => {
        // Verificar estado online
        const online = navigator.onLine;
        
        // Medir latencia con ping al backend
        let latency = 0;
        let backendHealth: 'healthy' | 'degraded' | 'down' | 'unknown' = 'unknown';
        
        try {
          const startTime = performance.now();
          const response = await fetch('/api/health', { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          const endTime = performance.now();
          latency = endTime - startTime;
          
          if (response.ok) {
            backendHealth = latency < 500 ? 'healthy' : 'degraded';
          } else {
            backendHealth = 'down';
          }
        } catch (error) {
          backendHealth = 'down';
          latency = 0;
        }

        // Obtener información de conexión
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const bandwidth = {
          download: connection?.downlink || 0,
          upload: connection?.uplink || 0
        };

        // Contar requests activos (aproximado basado en APIs monitoreadas)
        const recentApis = apis.filter(api => Date.now() - api.timestamp < 60000); // Último minuto
        const activeRequests = recentApis.filter(api => !api.status && !api.error).length;
        const completedRequests = recentApis.filter(api => api.status && api.status < 400).length;
        const failedRequests = recentApis.filter(api => api.error || (api.status && api.status >= 400)).length;

        // Estado de WebSocket basado en eventos monitoreados
        const recentWsEvents = websockets.filter(ws => Date.now() - ws.timestamp < 30000); // Últimos 30 segundos
        const hasRecentConnect = recentWsEvents.some(ws => ws.type === 'connect');
        const hasRecentDisconnect = recentWsEvents.some(ws => ws.type === 'disconnect');
        const hasRecentError = recentWsEvents.some(ws => ws.type === 'error');
        
        let websocketStatus: 'connected' | 'disconnected' | 'connecting' | 'unknown' = 'unknown';
        if (hasRecentError) {
          websocketStatus = 'disconnected';
        } else if (hasRecentConnect && !hasRecentDisconnect) {
          websocketStatus = 'connected';
        } else if (hasRecentDisconnect) {
          websocketStatus = 'disconnected';
        }

        setNetworkStats({
          online,
          latency,
          bandwidth,
          requests: {
            active: activeRequests,
            completed: completedRequests,
            failed: failedRequests
          },
          websocketStatus,
          backendHealth,
          lastPing: Date.now()
        });
      };

      updateNetworkStats();
      const interval = setInterval(updateNetworkStats, 10000); // Cada 10 segundos
      return () => clearInterval(interval);
    }, [apis, websockets]);

    const getHealthColor = (health: string) => {
      switch (health) {
        case 'healthy': return 'text-green-500';
        case 'degraded': return 'text-yellow-500';
        case 'down': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    const getHealthIcon = (health: string) => {
      switch (health) {
        case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
        default: return <Clock className="w-4 h-4 text-gray-500" />;
      }
    };

    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="network-header">
            <Network className="w-5 h-5 text-indigo-500" />
            <h3>Estado de Red y Conectividad</h3>
            <div className={`connection-indicator ${networkStats.online ? 'online' : 'offline'}`}>
              {networkStats.online ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        <div className="tab-body">
          {/* Estado General de Conectividad */}
          <div className="network-section">
            <h4><Globe className="w-4 h-4" /> Estado General</h4>
            <div className="connectivity-grid">
              <div className="connectivity-card">
                <div className="connectivity-header">
                  <Wifi className={`w-5 h-5 ${networkStats.online ? 'text-green-500' : 'text-red-500'}`} />
                  <span>Conexión a Internet</span>
                </div>
                <div className={`connectivity-status ${networkStats.online ? 'connected' : 'disconnected'}`}>
                  {networkStats.online ? 'CONECTADO' : 'DESCONECTADO'}
                </div>
              </div>

              <div className="connectivity-card">
                <div className="connectivity-header">
                  <Server className="w-5 h-5" />
                  <span>Backend</span>
                </div>
                <div className={`connectivity-status ${networkStats.backendHealth}`}>
                  {getHealthIcon(networkStats.backendHealth)}
                  <span className={getHealthColor(networkStats.backendHealth)}>
                    {networkStats.backendHealth.toUpperCase()}
                  </span>
                </div>
                {networkStats.latency > 0 && (
                  <div className="connectivity-detail">
                    Latencia: {networkStats.latency.toFixed(0)}ms
                  </div>
                )}
              </div>

              <div className="connectivity-card">
                <div className="connectivity-header">
                  <Zap className="w-5 h-5" />
                  <span>WebSocket</span>
                </div>
                <div className={`connectivity-status ${networkStats.websocketStatus}`}>
                  {networkStats.websocketStatus === 'connected' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {networkStats.websocketStatus === 'disconnected' && <XCircle className="w-4 h-4 text-red-500" />}
                  {networkStats.websocketStatus === 'connecting' && <Clock className="w-4 h-4 text-yellow-500" />}
                  {networkStats.websocketStatus === 'unknown' && <AlertTriangle className="w-4 h-4 text-gray-500" />}
                  <span>{networkStats.websocketStatus.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de Red */}
          <div className="network-section">
            <h4><Activity className="w-4 h-4" /> Métricas de Red</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span>Requests Activos</span>
                </div>
                <div className="metric-value">{networkStats.requests.active}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Completados (1min)</span>
                </div>
                <div className="metric-value">{networkStats.requests.completed}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Fallidos (1min)</span>
                </div>
                <div className="metric-value">{networkStats.requests.failed}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <Network className="w-4 h-4 text-purple-500" />
                  <span>Ancho de Banda</span>
                </div>
                <div className="metric-value">
                  ↓ {networkStats.bandwidth.download} Mbps
                  {networkStats.bandwidth.upload > 0 && (
                    <><br />↑ {networkStats.bandwidth.upload} Mbps</>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Conexión Reciente */}
          <div className="network-section">
            <h4><Clock className="w-4 h-4" /> Actividad Reciente</h4>
            <div className="recent-activity">
              {/* APIs Recientes */}
              <div className="activity-group">
                <h5>APIs Recientes (últimos 10)</h5>
                <div className="activity-list">
                  {apis.slice(-10).reverse().map((api) => (
                    <div key={api.id} className="activity-item">
                      <div className="activity-status">
                        {getStatusIcon(api.status, api.error)}
                      </div>
                      <div className="activity-info">
                        <span className="activity-method">{api.method}</span>
                        <span className="activity-url">{api.url.split('/').pop()}</span>
                        <span className="activity-time">{formatTimestamp(api.timestamp)}</span>
                      </div>
                      {api.duration && (
                        <div className="activity-duration">{api.duration}ms</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* WebSocket Reciente */}
              {websockets.length > 0 && (
                <div className="activity-group">
                  <h5>WebSocket Reciente (últimos 5)</h5>
                  <div className="activity-list">
                    {websockets.slice(-5).reverse().map((ws) => (
                      <div key={ws.id} className="activity-item">
                        <div className="activity-status">
                          {ws.type === 'connect' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {ws.type === 'disconnect' && <XCircle className="w-4 h-4 text-red-500" />}
                          {ws.type === 'message' && <Activity className="w-4 h-4 text-blue-500" />}
                          {ws.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="activity-info">
                          <span className="activity-method">{ws.type}</span>
                          <span className="activity-url">{ws.event || 'N/A'}</span>
                          <span className="activity-time">{formatTimestamp(ws.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlertsTab = () => {
    return (
      <div className="monitoring-tab-content">
        <div className="tab-header">
          <div className="alerts-tab-header">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3>Sistema de Alertas Inteligentes</h3>
          </div>
        </div>

        <div className="tab-body">
          <AlertSystem />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'apis': return renderApiTab();
      case 'websockets': return renderWebSocketTab();
      case 'logs': return renderLogsTab();
      case 'errors': return renderErrorsTab();
      case 'performance': return renderPerformanceTab();
      case 'state': return renderStateTab();
      case 'permissions': return renderPermissionsTab();
      case 'system': return renderSystemTab();
      case 'network': return renderNetworkTab();
      case 'alerts': return renderAlertsTab();
      default: return <div>Tab not implemented</div>;
    }
  };

  return (
    <div className="monitoring-tabs-container">
      {renderContent()}
      {showAIAnalysis && (
        <AIAnalysisModal onClose={() => setShowAIAnalysis(false)} />
      )}
    </div>
  );
};
