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

  // TODO: Implementar formulario completo
  // - Integrar react-hook-form
  // - Validación con loginSchema
  // - Manejo de errores
  // - Remember me
  // - Forgot password
  // - Loading states

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const perfId = logger.startPerformance('login_attempt')
    
    logger.info('Login attempt started', { email }, 'login_attempt_start')

    // Validación básica
    if (!email || !password) {
      const message = 'Por favor completa todos los campos'
      setError(message)
      logger.warn('Login validation failed', { email, reason: 'missing_fields' }, 'login_validation_error')
      logger.endPerformance(perfId, 'Validation failed')
      return
    }

    try {
      // Login real: Firebase Auth + Backend UTalk
      await login(email, password)
      
      logger.endPerformance(perfId, 'Login successful')
      logger.success('Login completed successfully', { email }, 'login_success')
      
      // Redirección automática manejada por ProtectedRoute
    } catch (err: any) {
      // Mostrar mensaje de error específico del AuthContext
      const errorMessage = err.message || 'Error de autenticación'
      setError(errorMessage)
      
      logger.error('Login failed', {
        email,
        error: errorMessage,
        errorCode: err.code
      }, 'login_error')
      
      logger.endPerformance(perfId, `Login failed: ${errorMessage}`)
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
            />
          </div>

          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            ¿Necesitas acceso? Contacta a tu administrador
          </span>
        </div>

        {/* TODO: Añadir links de forgot password, help, etc. */}
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