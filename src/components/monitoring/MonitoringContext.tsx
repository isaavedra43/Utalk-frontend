import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { MonitoringInterceptor } from './MonitoringInterceptor';

// Types
export interface ApiCall {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  requestHeaders?: Record<string, string>;
  requestData?: any;
  responseHeaders?: Record<string, string>;
  responseData?: any;
  duration?: number;
  error?: string;
  retryCount?: number;
}

export interface WebSocketEvent {
  id: string;
  timestamp: number;
  type: 'connect' | 'disconnect' | 'message' | 'error' | 'emit';
  event?: string;
  data?: any;
  error?: string;
  socketId?: string;
  url?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
  stack?: string;
  source?: string;
}

export interface ErrorEntry {
  id: string;
  timestamp: number;
  name: string;
  message: string;
  stack?: string;
  source?: string;
  componentStack?: string;
  errorBoundary?: string;
  props?: any;
  state?: any;
  url?: string;
  userAgent?: string;
}

export interface PerformanceMetric {
  id: string;
  timestamp: number;
  type: 'navigation' | 'resource' | 'measure' | 'paint' | 'render';
  name: string;
  value: number;
  unit: string;
  details?: any;
}

export interface StateChange {
  id: string;
  timestamp: number;
  store: string;
  action?: string;
  previousState?: any;
  newState?: any;
  diff?: any;
}

export interface ValidationResult {
  id: string;
  timestamp: number;
  field: string;
  value: any;
  rule: string;
  valid: boolean;
  error?: string;
  context?: string;
}

export interface MonitoringStats {
  apis: {
    total: number;
    success: number;
    errors: number;
    avgResponseTime: number;
  };
  websockets: {
    connected: boolean;
    events: number;
    errors: number;
    reconnections: number;
  };
  errors: {
    total: number;
    critical: number;
    warnings: number;
  };
  performance: {
    avgResponseTime: number;
    memoryUsage: number;
    renderCount: number;
  };
  validations: {
    total: number;
    passed: number;
    failed: number;
  };
}

export interface MonitoringState {
  apis: ApiCall[];
  websockets: WebSocketEvent[];
  logs: LogEntry[];
  errors: ErrorEntry[];
  performance: PerformanceMetric[];
  states: StateChange[];
  validations: ValidationResult[];
  stats: MonitoringStats;
  isRecording: boolean;
  maxEntries: number;
}

// Actions
type MonitoringAction =
  | { type: 'ADD_API_CALL'; payload: ApiCall }
  | { type: 'UPDATE_API_CALL'; payload: { id: string; updates: Partial<ApiCall> } }
  | { type: 'ADD_WEBSOCKET_EVENT'; payload: WebSocketEvent }
  | { type: 'ADD_LOG_ENTRY'; payload: LogEntry }
  | { type: 'ADD_ERROR'; payload: ErrorEntry }
  | { type: 'ADD_PERFORMANCE_METRIC'; payload: PerformanceMetric }
  | { type: 'ADD_STATE_CHANGE'; payload: StateChange }
  | { type: 'ADD_VALIDATION'; payload: ValidationResult }
  | { type: 'CLEAR_DATA' }
  | { type: 'TOGGLE_RECORDING' }
  | { type: 'SET_MAX_ENTRIES'; payload: number }
  | { type: 'UPDATE_STATS' };

// Initial state
const initialState: MonitoringState = {
  apis: [],
  websockets: [],
  logs: [],
  errors: [],
  performance: [],
  states: [],
  validations: [],
  stats: {
    apis: { total: 0, success: 0, errors: 0, avgResponseTime: 0 },
    websockets: { connected: false, events: 0, errors: 0, reconnections: 0 },
    errors: { total: 0, critical: 0, warnings: 0 },
    performance: { avgResponseTime: 0, memoryUsage: 0, renderCount: 0 },
    validations: { total: 0, passed: 0, failed: 0 }
  },
  isRecording: true,
  maxEntries: 1000
};

// Reducer
function monitoringReducer(state: MonitoringState, action: MonitoringAction): MonitoringState {
  const limitEntries = <T,>(array: T[], maxEntries: number): T[] => {
    return array.length > maxEntries ? array.slice(-maxEntries) : array;
  };

  const calculateStats = (newState: MonitoringState): MonitoringStats => {
    const apis = newState.apis;
    const websockets = newState.websockets;
    const errors = newState.errors;
    const validations = newState.validations;

    const apiSuccess = apis.filter(api => api.status && api.status >= 200 && api.status < 300).length;
    const apiErrors = apis.filter(api => api.error || (api.status && api.status >= 400)).length;
    const avgResponseTime = apis.length > 0 
      ? apis.reduce((sum, api) => sum + (api.duration || 0), 0) / apis.length 
      : 0;

    const wsConnected = websockets.some(ws => ws.type === 'connect') && 
                       !websockets.some(ws => ws.type === 'disconnect');
    const wsErrors = websockets.filter(ws => ws.type === 'error').length;
    const wsReconnections = websockets.filter(ws => ws.event === 'reconnect').length;

    const criticalErrors = errors.filter(err => err.name.includes('Critical') || err.name.includes('Fatal')).length;
    const warnings = errors.filter(err => err.name.includes('Warning')).length;

    const validationsPassed = validations.filter(v => v.valid).length;
    const validationsFailed = validations.filter(v => !v.valid).length;

    return {
      apis: {
        total: apis.length,
        success: apiSuccess,
        errors: apiErrors,
        avgResponseTime: Math.round(avgResponseTime)
      },
      websockets: {
        connected: wsConnected,
        events: websockets.length,
        errors: wsErrors,
        reconnections: wsReconnections
      },
      errors: {
        total: errors.length,
        critical: criticalErrors,
        warnings: warnings
      },
      performance: {
        avgResponseTime: Math.round(avgResponseTime),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        renderCount: newState.performance.filter(p => p.type === 'render').length
      },
      validations: {
        total: validations.length,
        passed: validationsPassed,
        failed: validationsFailed
      }
    };
  };

  switch (action.type) {
    case 'ADD_API_CALL': {
      if (!state.isRecording) return state;
      const newApis = limitEntries([...state.apis, action.payload], state.maxEntries);
      const newState = { ...state, apis: newApis };
      return { ...newState, stats: calculateStats(newState) };
    }

    case 'UPDATE_API_CALL': {
      if (!state.isRecording) return state;
      const newApis = state.apis.map(api => 
        api.id === action.payload.id 
          ? { ...api, ...action.payload.updates }
          : api
      );
      const newState = { ...state, apis: newApis };
      return { ...newState, stats: calculateStats(newState) };
    }

    case 'ADD_WEBSOCKET_EVENT': {
      if (!state.isRecording) return state;
      const newWebsockets = limitEntries([...state.websockets, action.payload], state.maxEntries);
      const newState = { ...state, websockets: newWebsockets };
      return { ...newState, stats: calculateStats(newState) };
    }

    case 'ADD_LOG_ENTRY': {
      if (!state.isRecording) return state;
      const newLogs = limitEntries([...state.logs, action.payload], state.maxEntries);
      return { ...state, logs: newLogs };
    }

    case 'ADD_ERROR': {
      if (!state.isRecording) return state;
      const newErrors = limitEntries([...state.errors, action.payload], state.maxEntries);
      const newState = { ...state, errors: newErrors };
      return { ...newState, stats: calculateStats(newState) };
    }

    case 'ADD_PERFORMANCE_METRIC': {
      if (!state.isRecording) return state;
      const newPerformance = limitEntries([...state.performance, action.payload], state.maxEntries);
      const newState = { ...state, performance: newPerformance };
      return { ...newState, stats: calculateStats(newState) };
    }

    case 'ADD_STATE_CHANGE': {
      if (!state.isRecording) return state;
      const newStates = limitEntries([...state.states, action.payload], state.maxEntries);
      return { ...state, states: newStates };
    }

    case 'ADD_VALIDATION': {
      if (!state.isRecording) return state;
      const newValidations = limitEntries([...state.validations, action.payload], state.maxEntries);
      const newState = { ...state, validations: newValidations };
      return { ...newState, stats: calculateStats(newState) };
    }

    case 'CLEAR_DATA': {
      const clearedState = { ...initialState, isRecording: state.isRecording, maxEntries: state.maxEntries };
      return clearedState;
    }

    case 'TOGGLE_RECORDING': {
      return { ...state, isRecording: !state.isRecording };
    }

    case 'SET_MAX_ENTRIES': {
      return { ...state, maxEntries: action.payload };
    }

    case 'UPDATE_STATS': {
      return { ...state, stats: calculateStats(state) };
    }

    default:
      return state;
  }
}

// Context
interface MonitoringContextType extends MonitoringState {
  addApiCall: (apiCall: Omit<ApiCall, 'id' | 'timestamp'>) => string;
  updateApiCall: (id: string, updates: Partial<ApiCall>) => void;
  addWebSocketEvent: (event: Omit<WebSocketEvent, 'id' | 'timestamp'>) => void;
  addLogEntry: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addError: (error: Omit<ErrorEntry, 'id' | 'timestamp'>) => void;
  addPerformanceMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void;
  addStateChange: (change: Omit<StateChange, 'id' | 'timestamp'>) => void;
  addValidation: (validation: Omit<ValidationResult, 'id' | 'timestamp'>) => void;
  clearData: () => void;
  toggleRecording: () => void;
  setMaxEntries: (max: number) => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

// Provider
export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);
  const interceptorRef = useRef<MonitoringInterceptor | null>(null);

  // Generate unique IDs
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Actions
  const addApiCall = useCallback((apiCall: Omit<ApiCall, 'id' | 'timestamp'>) => {
    const id = generateId();
    dispatch({
      type: 'ADD_API_CALL',
      payload: {
        ...apiCall,
        id,
        timestamp: Date.now()
      }
    });
    return id;
  }, [generateId]);

  const updateApiCall = useCallback((id: string, updates: Partial<ApiCall>) => {
    dispatch({
      type: 'UPDATE_API_CALL',
      payload: { id, updates }
    });
  }, []);

  const addWebSocketEvent = useCallback((event: Omit<WebSocketEvent, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_WEBSOCKET_EVENT',
      payload: {
        ...event,
        id: generateId(),
        timestamp: Date.now()
      }
    });
  }, [generateId]);

  const addLogEntry = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_LOG_ENTRY',
      payload: {
        ...log,
        id: generateId(),
        timestamp: Date.now()
      }
    });
  }, [generateId]);

  const addError = useCallback((error: Omit<ErrorEntry, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_ERROR',
      payload: {
        ...error,
        id: generateId(),
        timestamp: Date.now()
      }
    });
  }, [generateId]);

  const addPerformanceMetric = useCallback((metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_PERFORMANCE_METRIC',
      payload: {
        ...metric,
        id: generateId(),
        timestamp: Date.now()
      }
    });
  }, [generateId]);

  const addStateChange = useCallback((change: Omit<StateChange, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_STATE_CHANGE',
      payload: {
        ...change,
        id: generateId(),
        timestamp: Date.now()
      }
    });
  }, [generateId]);

  const addValidation = useCallback((validation: Omit<ValidationResult, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_VALIDATION',
      payload: {
        ...validation,
        id: generateId(),
        timestamp: Date.now()
      }
    });
  }, [generateId]);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  const toggleRecording = useCallback(() => {
    dispatch({ type: 'TOGGLE_RECORDING' });
  }, []);

  const setMaxEntries = useCallback((max: number) => {
    dispatch({ type: 'SET_MAX_ENTRIES', payload: max });
  }, []);

  // Initialize interceptors
  useEffect(() => {
    if (!interceptorRef.current) {
      interceptorRef.current = new MonitoringInterceptor({
        addApiCall,
        updateApiCall,
        addWebSocketEvent,
        addLogEntry,
        addError,
        addPerformanceMetric,
        addStateChange,
        addValidation
      });
      
      interceptorRef.current.initialize();
    }

    return () => {
      if (interceptorRef.current) {
        interceptorRef.current.cleanup();
        interceptorRef.current = null;
      }
    };
  }, [addApiCall, updateApiCall, addWebSocketEvent, addLogEntry, addError, addPerformanceMetric, addStateChange, addValidation]);

  const value: MonitoringContextType = {
    ...state,
    addApiCall,
    updateApiCall,
    addWebSocketEvent,
    addLogEntry,
    addError,
    addPerformanceMetric,
    addStateChange,
    addValidation,
    clearData,
    toggleRecording,
    setMaxEntries
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
};

// Hook
export const useMonitoring = (): MonitoringContextType => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
