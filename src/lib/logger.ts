// Sistema de logs inteligente para UTalk Frontend
// Incluye throttling, colores, performance tracking y debugging avanzado

interface LogEntry {
  message: string
  timestamp: number
  count: number
}

interface PerformanceEntry {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
}

class Logger {
  private static instance: Logger
  private logHistory: Map<string, LogEntry> = new Map()
  private performanceMap: Map<string, PerformanceEntry> = new Map()
  private isDev: boolean
  private throttleTime: number = 3000 // 3 segundos entre logs repetidos

  constructor() {
    this.isDev = import.meta.env.DEV
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  // Helper para logs que solo aparecen una vez por ciclo y luego cada X tiempo
  private shouldLog(key: string): boolean {
    if (!this.isDev) return false
    
    const existing = this.logHistory.get(key)
    const now = Date.now()
    
    if (!existing) {
      this.logHistory.set(key, { message: key, timestamp: now, count: 1 })
      return true
    }
    
    // Si han pasado más de X segundos desde el último log, permitir
    if (now - existing.timestamp > this.throttleTime) {
      existing.timestamp = now
      existing.count++
      return true
    }
    
    return false
  }

  // Logs con colores y categorías
  info(message: string, data?: any, key?: string) {
    const logKey = key || message
    if (this.shouldLog(logKey)) {
      console.log(`%c[UTalk INFO]%c ${message}`, 
        'color: #2563eb; font-weight: bold;', 
        'color: #374151;',
        data || ''
      )
    }
  }

  success(message: string, data?: any, key?: string) {
    const logKey = key || message
    if (this.shouldLog(logKey)) {
      console.log(`%c[UTalk SUCCESS]%c ${message}`, 
        'color: #059669; font-weight: bold;', 
        'color: #374151;',
        data || ''
      )
    }
  }

  warn(message: string, data?: any, key?: string) {
    const logKey = key || message
    if (this.shouldLog(logKey)) {
      console.warn(`%c[UTalk WARNING]%c ${message}`, 
        'color: #d97706; font-weight: bold;', 
        'color: #374151;',
        data || ''
      )
    }
  }

  error(message: string, error?: any, key?: string) {
    const logKey = key || message
    if (this.shouldLog(logKey)) {
      console.error(`%c[UTalk ERROR]%c ${message}`, 
        'color: #dc2626; font-weight: bold;', 
        'color: #374151;'
      )
      if (error) {
        console.error('Error details:', error)
        if (error.stack) {
          console.error('Stack trace:', error.stack)
        }
      }
    }
  }

  // Performance tracking
  startPerformance(operation: string): string {
    if (!this.isDev) return ''
    
    const id = `${operation}_${Date.now()}_${Math.random()}`
    this.performanceMap.set(id, {
      operation,
      startTime: performance.now()
    })
    return id
  }

  endPerformance(id: string, additionalInfo?: string): number | null {
    if (!this.isDev || !id) return null
    
    const entry = this.performanceMap.get(id)
    if (!entry) return null
    
    entry.endTime = performance.now()
    entry.duration = entry.endTime - entry.startTime
    
    const duration = entry.duration
    const message = `${entry.operation} completed in ${duration.toFixed(2)}ms${additionalInfo ? ` - ${additionalInfo}` : ''}`
    
    if (duration > 1000) {
      this.warn(message, null, `perf_${entry.operation}`)
    } else if (duration > 500) {
      this.info(message, null, `perf_${entry.operation}`)
    } else {
      this.success(message, null, `perf_${entry.operation}`)
    }
    
    this.performanceMap.delete(id)
    return duration
  }

  // Log específico para hooks
  hook(hookName: string, data: { 
    input?: any
    output?: any
    loading?: boolean
    error?: any
    dataLength?: number
  }) {
    if (!this.isDev) return
    
    const { input, output, loading, error, dataLength } = data
    const key = `hook_${hookName}`
    
    if (error) {
      this.error(`Hook ${hookName} failed`, error, `${key}_error`)
      return
    }
    
    if (loading) {
      this.info(`Hook ${hookName} loading...`, null, `${key}_loading`)
      return
    }
    
    const outputInfo = dataLength !== undefined 
      ? `${dataLength} items` 
      : output ? `shape: ${Object.keys(output).join(', ')}` : 'data ready'
    
    this.success(`Hook ${hookName} success: ${outputInfo}`, 
      input ? { input: this.sanitizeData(input) } : null, 
      key
    )
  }

  // Log específico para requests API
  api(method: string, url: string, data: {
    status?: number
    duration?: number
    error?: any
    headers?: Record<string, string>
    responseSize?: number
  }) {
    if (!this.isDev) return
    
    const { status, duration, error, headers, responseSize } = data
    const key = `api_${method}_${url.replace(/\//g, '_')}`
    
    if (error) {
      this.error(`API ${method} ${url} failed`, error, `${key}_error`)
      return
    }
    
    const authHeader = headers?.['Authorization']
    const token = authHeader ? `${authHeader.substring(0, 13)}...` : 'No token'
    
    const message = `API ${method} ${url} → ${status} (${duration?.toFixed(0)}ms${responseSize ? `, ${responseSize} bytes` : ''})`
    const details = { token, status, duration }
    
    if (status && status >= 400) {
      this.error(message, details, key)
    } else if (duration && duration > 2000) {
      this.warn(message, details, key)
    } else {
      this.success(message, details, key)
    }
  }

  // Log específico para componentes
  component(componentName: string, action: 'mount' | 'unmount' | 'update', data?: any) {
    if (!this.isDev) return
    
    const key = `component_${componentName}_${action}`
    const message = `Component ${componentName} ${action}`
    
    if (action === 'mount') {
      this.info(message, data ? this.sanitizeData(data) : null, key)
    } else if (action === 'unmount') {
      this.info(message, null, key)
    } else {
      // Solo loguear updates importantes, no todos
      if (data?.forceLog) {
        this.info(message, this.sanitizeData(data), key)
      }
    }
  }

  // Log específico para autenticación
  auth(action: string, data?: { user?: any, error?: any, token?: string }) {
    if (!this.isDev) return
    
    const key = `auth_${action}`
    
    if (data?.error) {
      this.error(`Auth ${action} failed`, data.error, key)
      return
    }
    
    const logData: any = {}
    if (data?.user) {
      logData.user = { id: data.user.id, email: data.user.email, role: data.user.role }
    }
    if (data?.token) {
      logData.token = `${data.token.substring(0, 10)}...`
    }
    
    this.success(`Auth ${action} success`, logData, key)
  }

  // Sanitizar datos sensibles
  private sanitizeData(data: any): any {
    if (!data) return data
    
    if (typeof data === 'string' && data.length > 100) {
      return `${data.substring(0, 100)}... (${data.length} chars)`
    }
    
    if (Array.isArray(data)) {
      return `Array(${data.length})`
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('password')) {
          sanitized[key] = typeof value === 'string' ? `${(value as string).substring(0, 6)}...` : '[HIDDEN]'
        } else if (Array.isArray(value)) {
          sanitized[key] = `Array(${value.length})`
        } else {
          sanitized[key] = value
        }
      }
      return sanitized
    }
    
    return data
  }

  // Obtener reporte de logs
  getReport(): {
    totalLogs: number
    logsByType: Record<string, number>
    performanceMetrics: PerformanceEntry[]
  } {
    const logsByType: Record<string, number> = {}
    
    this.logHistory.forEach((entry) => {
      const type = entry.message.split('_')[0]
      logsByType[type] = (logsByType[type] || 0) + entry.count
    })
    
    return {
      totalLogs: this.logHistory.size,
      logsByType,
      performanceMetrics: Array.from(this.performanceMap.values())
    }
  }

  // Limpiar logs antiguos (llamar ocasionalmente)
  cleanup() {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutos
    
    for (const [key, entry] of this.logHistory.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.logHistory.delete(key)
      }
    }
  }
}

// Instancia singleton
export const logger = Logger.getInstance()

// Logs específicos para debugging del proyecto
export const debugLogs = {
  // Análisis de módulos
  moduleStatus: (moduleName: string, status: 'complete' | 'partial' | 'empty', details?: string) => {
    logger.info(`Module ${moduleName}: ${status.toUpperCase()}`, details, `module_${moduleName}`)
  },
  
  // Análisis de mocks
  mockUsage: (location: string, mockType: string) => {
    logger.warn(`Mock data found: ${mockType} in ${location}`, null, `mock_${location}`)
  },
  
  // Análisis de endpoints
  endpointStatus: (endpoint: string, status: 'connected' | 'mock' | 'missing') => {
    if (status === 'connected') {
      logger.success(`Endpoint ${endpoint}: REAL API connected`)
    } else {
      logger.warn(`Endpoint ${endpoint}: ${status.toUpperCase()}`)
    }
  }
}

// Auto-cleanup cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => logger.cleanup(), 5 * 60 * 1000)
} 