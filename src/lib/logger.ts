// Sistema de logs profesional para UTalk Frontend
// Incluye todos los métodos necesarios para el proyecto

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'
export type LogCategory = 'AUTH' | 'API' | 'SOCKET' | 'RENDER' | 'VALIDATION' | 'PERFORMANCE' | 'ANALYSIS' | 'SYSTEM' | 'MODULE' | 'ENDPOINT' | 'NETWORK' | 'CONNECTION' | 'CONVERSATION' | 'MESSAGE' | 'URL' | 'UPLOAD' | 'CHAT' | 'INBOX'

export interface LogContext {
  [key: string]: any
}

// Helper functions requeridas por otros archivos
export function createLogContext(data: LogContext): LogContext {
  return {
    timestamp: new Date().toISOString(),
    ...data
  }
}

export function getComponentContext(componentName: string): LogContext {
  return {
    component: componentName,
    timestamp: new Date().toISOString()
  }
}

export function getErrorContext(error: any): LogContext {
  return {
    error: error?.message || 'Unknown error',
    stack: error?.stack?.split('\n').slice(0, 3).join('\n'),
    timestamp: new Date().toISOString()
  }
}

interface LogEntry {
  level: LogLevel
  category: LogCategory
  message: string
  context?: LogContext
  timestamp: string
  count: number
}

interface PerformanceEntry {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
}

class ProfessionalLogger {
  private static instance: ProfessionalLogger
  private logHistory: Map<string, LogEntry> = new Map()
  private performanceMap: Map<string, PerformanceEntry> = new Map()
  private isDev: boolean
  private throttleTime: number = 3000

  constructor() {
    this.isDev = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development'
  }

  static getInstance(): ProfessionalLogger {
    if (!ProfessionalLogger.instance) {
      ProfessionalLogger.instance = new ProfessionalLogger()
    }
    return ProfessionalLogger.instance
  }

  private logInternal(level: LogLevel, category: LogCategory, message: string, context?: LogContext) {
    if (!this.isDev && level === 'DEBUG') return

    const timestamp = new Date().toISOString()
    const logKey = `${level}_${category}_${message}`
    
    const existing = this.logHistory.get(logKey)
    const now = Date.now()
    
    if (existing && (now - new Date(existing.timestamp).getTime()) < this.throttleTime) {
      existing.count++
      return
    }

    const entry: LogEntry = {
      level,
      category,
      message,
      context,
      timestamp,
      count: existing ? existing.count + 1 : 1
    }

    this.logHistory.set(logKey, entry)

    const colors = {
      DEBUG: '\x1b[36m',   // Cyan
      INFO: '\x1b[34m',    // Blue
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      SUCCESS: '\x1b[32m', // Green
      RESET: '\x1b[0m'
    }

    const prefix = `[${colors[level]}${level}${colors.RESET}] [${category}]`
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    const countStr = entry.count > 1 ? ` (${entry.count}x)` : ''
    
    console.log(`${prefix} ${message}${contextStr}${countStr}`)
  }

  // Métodos principales
  debug(category: LogCategory, message: string, context?: LogContext) {
    this.logInternal('DEBUG', category, message, context)
  }

  info(category: LogCategory, message: string, context?: LogContext) {
    this.logInternal('INFO', category, message, context)
  }

  warn(category: LogCategory, message: string, context?: LogContext) {
    this.logInternal('WARN', category, message, context)
  }

  error(category: LogCategory, message: string, context?: LogContext) {
    this.logInternal('ERROR', category, message, context)
  }

  success(category: LogCategory, message: string, context?: LogContext) {
    this.logInternal('SUCCESS', category, message, context)
  }

  // Métodos especializados requeridos por otros archivos
  auth(message: string, context?: LogContext) {
    this.logInternal('INFO', 'AUTH', message, context)
  }

  authError(message: string, context?: LogContext) {
    this.logInternal('ERROR', 'AUTH', message, context)
  }

  api(message: string, context?: LogContext) {
    this.logInternal('INFO', 'API', message, context)
  }

  apiError(message: string, context?: LogContext) {
    this.logInternal('ERROR', 'API', message, context)
  }

  socket(message: string, context?: LogContext) {
    this.logInternal('INFO', 'SOCKET', message, context)
  }

  socketError(message: string, context?: LogContext) {
    this.logInternal('ERROR', 'SOCKET', message, context)
  }

  render(message: string, context?: LogContext) {
    this.logInternal('INFO', 'RENDER', message, context)
  }

  renderError(message: string, context?: LogContext) {
    this.logInternal('ERROR', 'RENDER', message, context)
  }

  validation(message: string, context?: LogContext) {
    this.logInternal('INFO', 'VALIDATION', message, context)
  }

  validationError(message: string, context?: LogContext) {
    this.logInternal('ERROR', 'VALIDATION', message, context)
  }

  performance(message: string, context?: LogContext) {
    this.logInternal('INFO', 'PERFORMANCE', message, context)
  }

  // Métodos de performance
  startPerformance(operation: string): string {
    const id = `${operation}_${Date.now()}`
    this.performanceMap.set(id, {
      operation,
      startTime: performance.now()
    })
    this.logInternal('DEBUG', 'PERFORMANCE', `Started: ${operation}`, { operationId: id })
    return id
  }

  endPerformance(id: string): number | null {
    const entry = this.performanceMap.get(id)
    if (!entry) return null

    entry.endTime = performance.now()
    entry.duration = entry.endTime - entry.startTime

    this.logInternal('INFO', 'PERFORMANCE', `Completed: ${entry.operation}`, {
      duration: `${entry.duration.toFixed(2)}ms`,
      operationId: id
    })

    this.performanceMap.delete(id)
    return entry.duration
  }

  // Cleanup
  cleanup() {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutos
    
    for (const [key, entry] of this.logHistory.entries()) {
      if (now - new Date(entry.timestamp).getTime() > maxAge) {
        this.logHistory.delete(key)
      }
    }
  }
}

// Instancia singleton
export const logger = ProfessionalLogger.getInstance()

// Contextos específicos para diferentes módulos
export const authContext = { module: 'auth' }
export const apiContext = { module: 'api' }
export const socketContext = { module: 'socket' }
export const renderContext = { module: 'render' }
export const validationContext = { module: 'validation' }
export const performanceContext = { module: 'performance' }
export const analysisContext = { module: 'analysis' }
export const projectAnalyzerContext = { module: 'projectAnalyzer' }
export const tokenManagerContext = { module: 'tokenManager' }
export const agentsServiceContext = { module: 'agentsService' }
export const uploadContext = { module: 'upload' }

// debugLogs para compatibilidad con projectAnalyzer
export const debugLogs = {
  moduleStatus: (moduleName: string, status: string, details?: string) => {
    logger.info('MODULE', `${moduleName}: ${status.toUpperCase()}`, { details })
  },
  mockUsage: (location: string, mockType: string) => {
    logger.warn('MODULE', `Mock data found: ${mockType} in ${location}`)
  },
  endpointStatus: (endpoint: string, status: string) => {
    if (status === 'connected') {
      logger.success('ENDPOINT', `${endpoint}: REAL API connected`)
    } else {
      logger.warn('ENDPOINT', `${endpoint}: ${status.toUpperCase()}`)
    }
  }
}

// Auto-cleanup cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => logger.cleanup(), 5 * 60 * 1000)
}

// Export default para compatibilidad
export default logger 