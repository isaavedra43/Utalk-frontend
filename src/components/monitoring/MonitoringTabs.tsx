import React, { useState, useMemo } from 'react';
import { useMonitoring } from './MonitoringContext';
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
  ExternalLink
} from 'lucide-react';
import './MonitoringTabs.css';

interface MonitoringTabsProps {
  activeTab: 'apis' | 'websockets' | 'logs' | 'errors' | 'performance' | 'state';
}

export const MonitoringTabs: React.FC<MonitoringTabsProps> = ({ activeTab }) => {
  const { apis, websockets, logs, errors, performance, states, validations } = useMonitoring();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
          </div>
        </div>

        <div className="tab-body">
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
          </div>
        </div>

        <div className="tab-body">
          {filteredStates.length === 0 ? (
            <div className="empty-state">
              <Database className="w-12 h-12 text-gray-300" />
              <p>No hay cambios de estado que mostrar</p>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'apis': return renderApiTab();
      case 'websockets': return renderWebSocketTab();
      case 'logs': return renderLogsTab();
      case 'errors': return renderErrorsTab();
      case 'performance': return renderPerformanceTab();
      case 'state': return renderStateTab();
      default: return <div>Tab not implemented</div>;
    }
  };

  return (
    <div className="monitoring-tabs-container">
      {renderContent()}
    </div>
  );
};
