// Sistema de testing de conexión para debugging de integración frontend-backend
// Prueba endpoints, URLs, CORS, y conectividad

import { logger } from './logger'
import { API_ENDPOINTS } from './constants'

interface ConnectionTestResult {
  endpoint: string
  status: 'success' | 'failed' | 'timeout' | 'cors_error' | 'not_found'
  statusCode?: number
  responseTime?: number
  error?: string
  details?: any
}

class ConnectionTester {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  }

  // ✅ Test principal que ejecuta todas las pruebas
  async runAllTests(): Promise<ConnectionTestResult[]> {
    logger.info('🧪 Starting connection tests...', { baseURL: this.baseURL }, 'connection_test_start')

    const tests = [
      () => this.testBaseURL(),
      () => this.testHealthEndpoint(),
      () => this.testAuthEndpoint(),
      () => this.testCORS(),
      () => this.testWebSocketURL()
    ]

    const results: ConnectionTestResult[] = []

    for (const test of tests) {
      try {
        const result = await test()
        results.push(result)
      } catch (error) {
        results.push({
          endpoint: 'unknown',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    this.printTestResults(results)
    return results
  }

  // ✅ Test 1: URL base del backend
  private async testBaseURL(): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(this.baseURL.replace('/api', ''), {
        method: 'GET',
        mode: 'cors'
      })
      
      return {
        endpoint: this.baseURL.replace('/api', ''),
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        details: { headers: Object.fromEntries(response.headers.entries()) }
      }
    } catch (error) {
      return {
        endpoint: this.baseURL.replace('/api', ''),
        status: this.getErrorType(error),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ✅ Test 2: Health check endpoint
  private async testHealthEndpoint(): Promise<ConnectionTestResult> {
    const endpoint = `${this.baseURL}/health`
    const startTime = Date.now()
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      return {
        endpoint,
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        details: { data }
      }
    } catch (error) {
      return {
        endpoint,
        status: this.getErrorType(error),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ✅ Test 3: Auth endpoint (sin token)
  private async testAuthEndpoint(): Promise<ConnectionTestResult> {
    const endpoint = `${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`
    const startTime = Date.now()
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken: 'test-token' })
      })
      
      // Esperamos error 401 o 400, no 200
      return {
        endpoint,
        status: response.status === 401 || response.status === 400 ? 'success' : 'failed',
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        details: { note: 'Test with invalid token - expecting 401/400' }
      }
    } catch (error) {
      return {
        endpoint,
        status: this.getErrorType(error),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ✅ Test 4: CORS headers
  private async testCORS(): Promise<ConnectionTestResult> {
    const endpoint = this.baseURL.replace('/api', '')
    const startTime = Date.now()
    
    try {
      const response = await fetch(endpoint, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      })
      
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      }
      
      return {
        endpoint: `${endpoint} (CORS)`,
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        details: { corsHeaders }
      }
    } catch (error) {
      return {
        endpoint: `${endpoint} (CORS)`,
        status: 'cors_error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'CORS blocked'
      }
    }
  }

  // ✅ Test 5: WebSocket URL
  private async testWebSocketURL(): Promise<ConnectionTestResult> {
    const wsURL = import.meta.env.VITE_WS_URL || 'http://localhost:8000'
    
    return new Promise((resolve) => {
      const startTime = Date.now()
      
      try {
        // Intentar conexión WebSocket básica
        const ws = new WebSocket(wsURL.replace('http', 'ws'))
        
        const timeout = setTimeout(() => {
          ws.close()
          resolve({
            endpoint: wsURL,
            status: 'timeout',
            responseTime: Date.now() - startTime,
            error: 'WebSocket connection timeout'
          })
        }, 5000)
        
        ws.onopen = () => {
          clearTimeout(timeout)
          ws.close()
          resolve({
            endpoint: wsURL,
            status: 'success',
            responseTime: Date.now() - startTime,
            details: { note: 'WebSocket connection successful' }
          })
        }
        
        ws.onerror = (_error) => {
          clearTimeout(timeout)
          resolve({
            endpoint: wsURL,
            status: 'failed',
            responseTime: Date.now() - startTime,
            error: 'WebSocket connection failed'
          })
        }
      } catch (error) {
        resolve({
          endpoint: wsURL,
          status: 'failed',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'WebSocket error'
        })
      }
    })
  }

  // ✅ Clasificar tipo de error
  private getErrorType(error: any): ConnectionTestResult['status'] {
    const message = error?.message?.toLowerCase() || ''
    
    if (message.includes('cors')) return 'cors_error'
    if (message.includes('timeout')) return 'timeout'
    if (message.includes('404') || message.includes('not found')) return 'not_found'
    
    return 'failed'
  }

  // ✅ Imprimir resultados en consola
  private printTestResults(results: ConnectionTestResult[]) {
    console.log('\n🧪 =================== CONNECTION TEST RESULTS ===================')
    
    results.forEach((result, index) => {
      const icon = result.status === 'success' ? '✅' : '❌'
      const time = result.responseTime ? `(${result.responseTime}ms)` : ''
      
      console.log(`${icon} Test ${index + 1}: ${result.endpoint} ${time}`)
      console.log(`   Status: ${result.status.toUpperCase()}`)
      
      if (result.statusCode) {
        console.log(`   HTTP: ${result.statusCode}`)
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
      console.log('')
    })
    
    const successCount = results.filter(r => r.status === 'success').length
    const totalCount = results.length
    
    console.log(`📊 Summary: ${successCount}/${totalCount} tests passed`)
    console.log('=================== END TEST RESULTS ===================\n')
    
    // Guardar en localStorage para debugging
    localStorage.setItem('utalk_connection_tests', JSON.stringify(results, null, 2))
  }
}

export const connectionTester = new ConnectionTester()

// Auto-ejecutar tests en desarrollo
if (import.meta.env.DEV) {
  // Ejecutar tests después de 3 segundos
  setTimeout(() => {
    connectionTester.runAllTests().catch(error => {
      logger.error('Connection tests failed', error, 'connection_test_error')
    })
  }, 3000)
} 