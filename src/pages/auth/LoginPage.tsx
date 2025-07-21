// Página de login con formulario y validación
// Integra con el contexto de autenticación
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuth()

  // Log de mount del componente
  useEffect(() => {
    logger.component('LoginPage', 'mount', {
      redirectFrom: window.location.search,
      timestamp: new Date().toISOString()
    })

    return () => {
      logger.component('LoginPage', 'unmount')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const perfId = logger.startPerformance('login_attempt')
    
    logger.info('🚀 Login attempt started (Firebase Auth + idToken)', { 
      email,
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname
    }, 'login_attempt_start')

    // ✅ LOGS CRÍTICOS: Verificar estado antes del login
    logger.info('🔍 Pre-login state check', {
      hasEmail: !!email,
      hasPassword: !!password,
      emailLength: email.length,
      passwordLength: password.length,
      isLoading,
      currentError: error
    }, 'pre_login_state')

    // Validación básica
    if (!email || !password) {
      const message = 'Por favor completa todos los campos'
      setError(message)
      setIsSubmitting(false)
      logger.warn('❌ Login validation failed', { 
        email, 
        hasEmail: !!email, 
        hasPassword: !!password, 
        reason: 'missing_fields' 
      }, 'login_validation_error')
      logger.endPerformance(perfId, 'Validation failed')
      return
    }

    try {
      // ✅ LOGS CRÍTICOS: Antes de llamar al contexto de auth
      logger.info('🔥 Calling auth context login (Firebase + Backend)', {
        email,
        authContextExists: !!login,
        authContextType: typeof login
      }, 'auth_context_call')

      // Login con Firebase Auth + Backend idToken validation
      await login(email, password)
      
      logger.endPerformance(perfId, 'Login successful')
      logger.success('✅ Login completed successfully', { 
        email,
        redirectPath: window.location.pathname 
      }, 'login_success')
      
      // Redirección automática manejada por ProtectedRoute
    } catch (err: any) {
      // ✅ Mostrar el mensaje de error que viene del contexto de auth
      const errorMessage = err.message || 'Los datos enviados no son válidos.'
      setError(errorMessage)
      
      logger.error('❌ Login failed', {
        email,
        error: errorMessage,
        errorCode: err.code,
        errorType: typeof err,
        errorStack: err.stack?.substring(0, 200),
        errorDetails: err
      }, 'login_error')
      
      logger.endPerformance(perfId, `Login failed: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <p className="text-muted-foreground">
          Ingresa tus credenciales para acceder
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isSubmitting || isLoading}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting || isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            ¿Necesitas acceso? Contacta a tu administrador
          </span>
        </div>

        <div className="mt-4 text-center">
          <Link to="#" className="text-sm text-muted-foreground hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginPage 