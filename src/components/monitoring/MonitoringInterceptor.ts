import { ApiCall, WebSocketEvent, LogEntry, ErrorEntry, PerformanceMetric, StateChange, ValidationResult } from './MonitoringContext';

interface MonitoringCallbacks {
  addApiCall: (apiCall: Omit<ApiCall, 'id' | 'timestamp'>) => string;
  updateApiCall: (id: string, updates: Partial<ApiCall>) => void;
  addWebSocketEvent: (event: Omit<WebSocketEvent, 'id' | 'timestamp'>) => void;
  addLogEntry: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addError: (error: Omit<ErrorEntry, 'id' | 'timestamp'>) => void;
  addPerformanceMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void;
  addStateChange: (change: Omit<StateChange, 'id' | 'timestamp'>) => void;
  addValidation: (validation: Omit<ValidationResult, 'id' | 'timestamp'>) => void;
}

export class MonitoringInterceptor {
  private callbacks: MonitoringCallbacks;
  private originalFetch: typeof fetch;
  private originalXMLHttpRequest: typeof XMLHttpRequest;
  private originalConsole: Console;
  private originalWebSocket: typeof WebSocket;
  private originalAddEventListener: typeof EventTarget.prototype.addEventListener;
  private isInitialized = false;
  private apiCallMap = new Map<string, string>(); // Request key -> API call ID

  constructor(callbacks: MonitoringCallbacks) {
    this.callbacks = callbacks;
    this.originalFetch = window.fetch;
    this.originalXMLHttpRequest = window.XMLHttpRequest;
    this.originalConsole = window.console;
    this.originalWebSocket = window.WebSocket;
    this.originalAddEventListener = EventTarget.prototype.addEventListener;
  }

  initialize() {
    if (this.isInitialized) return;
    
    this.interceptFetch();
    this.interceptXMLHttpRequest();
    this.interceptConsole();
    this.interceptWebSocket();
    this.interceptErrors();
    this.interceptPerformance();
    this.interceptStateChanges();
    this.interceptValidations();
    
    this.isInitialized = true;
    console.log('🔍 MonitoringInterceptor initialized');
  }

  cleanup() {
    if (!this.isInitialized) return;

    // Restore original functions
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXMLHttpRequest;
    window.console = this.originalConsole;
    window.WebSocket = this.originalWebSocket;
    EventTarget.prototype.addEventListener = this.originalAddEventListener;

    this.isInitialized = false;
    console.log('🔍 MonitoringInterceptor cleaned up');
  }

  private generateRequestKey(method: string, url: string): string {
    return `${method}:${url}:${Date.now()}`;
  }

  private interceptFetch() {
    const self = this;
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const requestKey = self.generateRequestKey(method, url);
      
      // Create initial API call record
      const apiCallId = self.callbacks.addApiCall({
        method: method.toUpperCase(),
        url,
        requestHeaders: self.extractHeaders(init?.headers),
        requestData: self.extractRequestData(init?.body)
      });
      
      self.apiCallMap.set(requestKey, apiCallId);
      
      const startTime = performance.now();
      
      try {
        // Call original fetch with proper context binding
        const response = await self.originalFetch.call(window, input, init);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Clone response to read data without consuming it
        const responseClone = response.clone();
        let responseData;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            responseData = await responseClone.json();
          } else if (contentType?.includes('text/')) {
            responseData = await responseClone.text();
          }
        } catch (e) {
          // Ignore response parsing errors
        }
        
        // Update API call record
        self.callbacks.updateApiCall(apiCallId, {
          status: response.status,
          statusText: response.statusText,
          responseHeaders: self.extractResponseHeaders(response.headers),
          responseData,
          duration
        });
        
        // Add performance metric
        self.callbacks.addPerformanceMetric({
          type: 'resource',
          name: `API: ${method} ${url}`,
          value: duration,
          unit: 'ms',
          details: {
            method,
            url,
            status: response.status,
            size: response.headers.get('content-length') || 0
          }
        });
        
        self.apiCallMap.delete(requestKey);
        return response;
        
      } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Update API call with error
        self.callbacks.updateApiCall(apiCallId, {
          error: error instanceof Error ? error.message : String(error),
          duration
        });
        
        // Add error entry
        self.callbacks.addError({
          name: 'API Error',
          message: `Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`,
          stack: error instanceof Error ? error.stack : undefined,
          source: 'fetch',
          url
        });
        
        self.apiCallMap.delete(requestKey);
        throw error;
      }
    };
  }

  private interceptXMLHttpRequest() {
    const self = this;
    const OriginalXHR = this.originalXMLHttpRequest;
    
    window.XMLHttpRequest = function() {
      const xhr = new OriginalXHR();
      let apiCallId: string | null = null;
      let startTime: number;
      let method: string;
      let url: string;
      
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      const originalSetRequestHeader = xhr.setRequestHeader;
      
      const requestHeaders: Record<string, string> = {};
      
      xhr.open = function(m: string, u: string | URL, ...args: any[]) {
        method = m.toUpperCase();
        url = u.toString();
        return originalOpen.call(this, m, u, ...args);
      };
      
      xhr.setRequestHeader = function(name: string, value: string) {
        requestHeaders[name] = value;
        return originalSetRequestHeader.call(this, name, value);
      };
      
      xhr.send = function(data?: Document | BodyInit | null) {
        startTime = performance.now();
        
        apiCallId = self.callbacks.addApiCall({
          method,
          url,
          requestHeaders,
          requestData: self.extractRequestData(data)
        });
        
        return originalSend.call(this, data);
      };
      
      // Intercept state changes
      const originalOnReadyStateChange = xhr.onreadystatechange;
      xhr.onreadystatechange = function(ev) {
        if (xhr.readyState === XMLHttpRequest.DONE && apiCallId) {
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);
          
          let responseData;
          try {
            const contentType = xhr.getResponseHeader('content-type');
            if (contentType?.includes('application/json')) {
              responseData = JSON.parse(xhr.responseText);
            } else {
              responseData = xhr.responseText;
            }
          } catch (e) {
            responseData = xhr.responseText;
          }
          
          self.callbacks.updateApiCall(apiCallId, {
            status: xhr.status,
            statusText: xhr.statusText,
            responseHeaders: self.extractXHRResponseHeaders(xhr),
            responseData,
            duration
          });
          
          if (xhr.status >= 400) {
            self.callbacks.addError({
              name: 'XHR Error',
              message: `XHR request failed: ${method} ${url} - ${xhr.status} ${xhr.statusText}`,
              source: 'xhr',
              url
            });
          }
        }
        
        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.call(this, ev);
        }
      };
      
      return xhr;
    };
    
    // Copy static properties
    Object.setPrototypeOf(window.XMLHttpRequest, OriginalXHR);
    Object.defineProperty(window.XMLHttpRequest, 'prototype', {
      value: OriginalXHR.prototype,
      writable: false
    });
  }

  private interceptConsole() {
    const self = this;
    const originalMethods = {
      log: this.originalConsole.log,
      info: this.originalConsole.info,
      warn: this.originalConsole.warn,
      error: this.originalConsole.error,
      debug: this.originalConsole.debug
    };
    
    const createInterceptedMethod = (level: 'debug' | 'info' | 'warn' | 'error', originalMethod: Function) => {
      return function(...args: any[]) {
        // Call original method first
        originalMethod.apply(console, args);
        
        // ✅ FILTRAR errores vacíos o sin información útil
        const isEmptyError = args.length === 1 && (
          !args[0] ||
          (typeof args[0] === 'object' && Object.keys(args[0]).length === 0) ||
          (typeof args[0] === 'object' && args[0].toString() === '{}') ||
          (typeof args[0] === 'object' && JSON.stringify(args[0]) === '{}') ||
          (typeof args[0] === 'string' && args[0].trim() === '')
        );
        
        // Si es un error vacío, no registrar en monitoreo
        if (isEmptyError && level === 'error') {
          return;
        }
        
        // Extract meaningful information
        const message = args.map(arg => {
          if (typeof arg === 'string') return arg;
          if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
          return String(arg);
        }).join(' ');
        
        // Filtrar mensajes de error vacíos
        if (level === 'error' && (message === '{}' || message.trim() === '' || message === '[object Object]')) {
          return;
        }
        
        // Add to monitoring
        self.callbacks.addLogEntry({
          level,
          category: 'console',
          message,
          data: args.length === 1 ? args[0] : args,
          source: self.getCallerInfo()
        });
        
        // Add as error if it's an error log (solo si no es vacío)
        if (level === 'error' && !isEmptyError && message !== '{}' && message.trim() !== '') {
          self.callbacks.addError({
            name: 'Console Error',
            message,
            source: 'console',
            stack: self.getStackTrace()
          });
        }
      };
    };
    
    window.console.log = createInterceptedMethod('info', originalMethods.log);
    window.console.info = createInterceptedMethod('info', originalMethods.info);
    window.console.warn = createInterceptedMethod('warn', originalMethods.warn);
    window.console.error = createInterceptedMethod('error', originalMethods.error);
    window.console.debug = createInterceptedMethod('debug', originalMethods.debug);
  }

  private interceptWebSocket() {
    const self = this;
    const OriginalWebSocket = this.originalWebSocket;
    
    window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
      const ws = new OriginalWebSocket(url, protocols);
      const wsUrl = url.toString();
      
      // Track connection events
      ws.addEventListener('open', (event) => {
        self.callbacks.addWebSocketEvent({
          type: 'connect',
          url: wsUrl,
          socketId: self.getWebSocketId(ws)
        });
      });
      
      ws.addEventListener('close', (event) => {
        self.callbacks.addWebSocketEvent({
          type: 'disconnect',
          url: wsUrl,
          socketId: self.getWebSocketId(ws),
          data: {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          }
        });
      });
      
      ws.addEventListener('error', (event) => {
        self.callbacks.addWebSocketEvent({
          type: 'error',
          url: wsUrl,
          socketId: self.getWebSocketId(ws),
          error: 'WebSocket error occurred'
        });
        
        self.callbacks.addError({
          name: 'WebSocket Error',
          message: `WebSocket connection error for ${wsUrl}`,
          source: 'websocket',
          url: wsUrl
        });
      });
      
      ws.addEventListener('message', (event) => {
        let parsedData;
        try {
          parsedData = JSON.parse(event.data);
        } catch (e) {
          parsedData = event.data;
        }
        
        self.callbacks.addWebSocketEvent({
          type: 'message',
          url: wsUrl,
          socketId: self.getWebSocketId(ws),
          data: parsedData
        });
      });
      
      // Intercept send method
      const originalSend = ws.send;
      ws.send = function(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        let parsedData;
        try {
          parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
          parsedData = data;
        }
        
        self.callbacks.addWebSocketEvent({
          type: 'emit',
          url: wsUrl,
          socketId: self.getWebSocketId(ws),
          data: parsedData
        });
        
        return originalSend.call(this, data);
      };
      
      return ws;
    };
    
    // Copy static properties
    Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
    Object.defineProperty(window.WebSocket, 'prototype', {
      value: OriginalWebSocket.prototype,
      writable: false
    });
  }

  private interceptErrors() {
    const self = this;
    
    // Global error handler
    window.addEventListener('error', (event) => {
      self.callbacks.addError({
        name: event.error?.name || 'JavaScript Error',
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        source: event.filename || 'unknown',
        url: event.filename,
        userAgent: navigator.userAgent
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      self.callbacks.addError({
        name: 'Unhandled Promise Rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        source: 'promise',
        userAgent: navigator.userAgent
      });
    });
  }

  private interceptPerformance() {
    const self = this;
    
    // Performance observer for various metrics
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              
              self.callbacks.addPerformanceMetric({
                type: 'navigation',
                name: 'Page Load',
                value: Math.round(navEntry.loadEventEnd - navEntry.navigationStart),
                unit: 'ms',
                details: {
                  domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.navigationStart),
                  firstPaint: Math.round(navEntry.loadEventStart - navEntry.navigationStart),
                  dnsLookup: Math.round(navEntry.domainLookupEnd - navEntry.domainLookupStart),
                  tcpConnection: Math.round(navEntry.connectEnd - navEntry.connectStart)
                }
              });
            }
          });
        });
        
        navObserver.observe({ entryTypes: ['navigation'] });
        
        // Paint timing
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            self.callbacks.addPerformanceMetric({
              type: 'paint',
              name: entry.name,
              value: Math.round(entry.startTime),
              unit: 'ms'
            });
          });
        });
        
        paintObserver.observe({ entryTypes: ['paint'] });
        
        // Resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            self.callbacks.addPerformanceMetric({
              type: 'resource',
              name: resourceEntry.name,
              value: Math.round(resourceEntry.responseEnd - resourceEntry.startTime),
              unit: 'ms',
              details: {
                type: resourceEntry.initiatorType,
                size: resourceEntry.transferSize,
                cached: resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0
              }
            });
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        
      } catch (e) {
        console.warn('Performance monitoring not fully supported:', e);
      }
    }
    
    // Memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        self.callbacks.addPerformanceMetric({
          type: 'measure',
          name: 'Memory Usage',
          value: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          unit: 'MB',
          details: {
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          }
        });
      }, 10000); // Every 10 seconds
    }
  }

  private interceptStateChanges() {
    // This would need to be integrated with your state management
    // For now, we'll listen to custom events that stores can dispatch
    const self = this;
    
    window.addEventListener('state-change', ((event: CustomEvent) => {
      self.callbacks.addStateChange({
        store: event.detail.store || 'unknown',
        action: event.detail.action,
        previousState: event.detail.previousState,
        newState: event.detail.newState,
        diff: event.detail.diff
      });
    }) as EventListener);
  }

  private interceptValidations() {
    // Listen to custom validation events
    const self = this;
    
    window.addEventListener('validation-result', ((event: CustomEvent) => {
      self.callbacks.addValidation({
        field: event.detail.field,
        value: event.detail.value,
        rule: event.detail.rule,
        valid: event.detail.valid,
        error: event.detail.error,
        context: event.detail.context
      });
    }) as EventListener);
  }

  // Helper methods
  private extractHeaders(headers?: HeadersInit): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (!headers) return result;
    
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        result[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        result[key] = value;
      });
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        result[key] = value;
      });
    }
    
    return result;
  }

  private extractResponseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private extractXHRResponseHeaders(xhr: XMLHttpRequest): Record<string, string> {
    const result: Record<string, string> = {};
    const headerString = xhr.getAllResponseHeaders();
    
    if (headerString) {
      headerString.split('\r\n').forEach(line => {
        const [key, value] = line.split(': ');
        if (key && value) {
          result[key.toLowerCase()] = value;
        }
      });
    }
    
    return result;
  }

  private extractRequestData(data?: BodyInit | Document | null): any {
    if (!data) return null;
    
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    
    if (data instanceof FormData) {
      const result: Record<string, any> = {};
      data.forEach((value, key) => {
        result[key] = value instanceof File ? `[File: ${value.name}]` : value;
      });
      return result;
    }
    
    if (data instanceof URLSearchParams) {
      const result: Record<string, string> = {};
      data.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
    
    return '[Binary Data]';
  }

  private getWebSocketId(ws: WebSocket): string {
    // Create a unique identifier for the WebSocket
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCallerInfo(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    // Skip first few lines (Error, this function, intercepted method)
    const callerLine = lines[4] || lines[3] || lines[2];
    
    const match = callerLine?.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      const [, functionName, fileName, lineNumber] = match;
      return `${functionName} (${fileName}:${lineNumber})`;
    }
    
    return callerLine || 'unknown';
  }

  private getStackTrace(): string | undefined {
    return new Error().stack;
  }
}
