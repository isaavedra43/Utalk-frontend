/**
 * Servicio de autenticación para UTalk Frontend
 * Maneja login, logout, refresh token y comunicación con el backend
 *
 * Basado en la documentación backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 *
 * ⚠️ ALINEACIÓN CRÍTICA CON BACKEND:
 * El backend requiere Authorization header en todas las requests, incluso login.
 */

import { logger } from '$lib/logger';
import type { LoginResponse } from '$lib/types/auth';
import type { ApiError } from '$lib/types/http';
import { browser } from '$lib/utils/browser';
import { apiClient } from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Función para login con credenciales
 * Según BACKEND_ADVANCED_LOGIC.md línea 289-309 y documentación completa
 *
 * ⚠️ CORRECCIÓN CRÍTICA: El backend REQUIERE que todas las requests incluyan
 * el header Authorization, incluso el login inicial. Esta función ahora almacena
 * el token recibido para futuras requests.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const startTime = performance.now();

  logger.info('Login attempt started', {
    module: 'AuthService',
    function: 'login',
    userAction: 'login_attempt',
    userEmail: credentials.email,
    hasPassword: !!credentials.password
  });

  try {
    // Validación básica de credenciales
    if (!credentials.email || !credentials.password) {
      const error = new Error('Email y contraseña son requeridos');
      logger.warn('Login validation failed', {
        module: 'AuthService',
        function: 'login',
        errorType: 'missing_credentials'
      });
      throw error;
    }

    logger.debug('Sending login request to backend', {
      module: 'AuthService',
      function: 'login',
      endpoint: '/auth/login',
      note: 'Authorization header enviado vacío según requerimiento del backend'
    });

    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });

    const duration = performance.now() - startTime;

    if (!response.data.accessToken || !response.data.user) {
      const error = new Error('Respuesta de login inválida del servidor');
      logger.error('Invalid login response from server', error, {
        module: 'AuthService',
        function: 'login',
        responseStatus: response.status,
        hasAccessToken: !!response.data.accessToken,
        hasUser: !!response.data.user
      });
      throw error;
    }

    // ⚠️ ALINEACIÓN CON BACKEND: Guardar token para futuras requests
    // El interceptor de axios necesita acceso al token para enviar Authorization header
    if (browser && response.data.accessToken) {
      try {
        localStorage.setItem('accessToken', response.data.accessToken);
        logger.debug('Token stored for future requests', {
          module: 'AuthService',
          function: 'login',
          tokenLength: response.data.accessToken.length
        });
      } catch (storageError) {
        logger.warn('Failed to store token in localStorage', {
          module: 'AuthService',
          function: 'login',
          error: storageError
        });
      }
    }

    logger.info('Login successful', {
      module: 'AuthService',
      function: 'login',
      userId: response.data.user.email,
      loginDuration: duration,
      userAction: 'login_success',
      userRole: response.data.user.role
    });

    logger.logPerformance('Login Request', duration, {
      module: 'AuthService',
      performance: {
        metric: 'auth_login_duration',
        duration,
        threshold: 2000,
        resource: '/auth/login'
      }
    });

    return response.data;
  } catch (error) {
    const duration = performance.now() - startTime;

    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as ApiError;

      logger.error('Login API error', new Error(apiError.message || 'API Error'), {
        module: 'AuthService',
        function: 'login',
        networkMethod: 'POST',
        networkUrl: '/auth/login',
        networkStatus: apiError.response?.status,
        networkDuration: duration,
        userAction: 'login_failed',
        userEmail: credentials.email,
        errorCode: apiError.response?.status,
        backendResponse: apiError.response?.data,
        backendHeaders: apiError.response?.headers,
        fullError: JSON.stringify(apiError, null, 2),
        note: 'Error tras enviar Authorization header según requerimiento del backend'
      });

      // Mapear errores específicos del backend
      switch (apiError.response?.status) {
        case 401:
          logger.warn('Invalid login credentials', {
            module: 'AuthService',
            function: 'login',
            securityEvent: 'invalid_credentials'
          });
          throw new AuthError('EMAIL_OR_PASSWORD_INCORRECT', 'Credenciales incorrectas');
        case 429: {
          const retryAfter = apiError.response?.headers?.['retry-after'] as string;
          logger.warn('Login rate limit exceeded', {
            module: 'AuthService',
            function: 'login',
            securityEvent: 'rate_limit_exceeded',
            retryAfter: retryAfter ? parseInt(retryAfter) : undefined
          });
          throw new AuthError('RATE_LIMIT_EXCEEDED', 'Demasiados intentos de login');
        }
        case 423:
          logger.warn('Account locked', {
            module: 'AuthService',
            function: 'login',
            securityEvent: 'account_locked'
          });
          throw new AuthError('ACCOUNT_LOCKED', 'Cuenta bloqueada temporalmente');
        case 502:
          logger.error(
            '🚨 BACKEND BAD GATEWAY - Railway backend error',
            new Error(`Backend 502: ${apiError.message || 'Bad Gateway'}`),
            {
              module: 'AuthService',
              function: 'login',
              errorType: 'backend_gateway_error',
              backendUrl: 'https://utalk-backend-production.up.railway.app',
              suggestion: 'Verificar estado del backend en Railway',
              possibleCauses: [
                'CORS config',
                'Database connection',
                'Backend env vars',
                'Backend dependencies'
              ]
            }
          );
          throw new AuthError(
            'BACKEND_ERROR',
            '🚨 El backend en Railway tiene errores internos (502). Contacta al equipo de backend.'
          );
        case 503:
          logger.error(
            'Backend service unavailable',
            new Error(`Backend 503: ${apiError.message || 'Service Unavailable'}`),
            {
              module: 'AuthService',
              function: 'login',
              errorType: 'backend_unavailable'
            }
          );
          throw new AuthError(
            'SERVICE_UNAVAILABLE',
            'Servicio temporalmente no disponible. Intenta en unos minutos.'
          );
        default:
          logger.error(
            'Unexpected login error',
            new Error(apiError.message || 'Unexpected API Error'),
            {
              module: 'AuthService',
              function: 'login',
              errorType: 'unexpected_api_error'
            }
          );
          throw new AuthError('SERVER_ERROR', 'Error interno del servidor');
      }
    }

    // Error de red o desconocido
    logger.error(
      'Network or unknown login error',
      error instanceof Error ? error : new Error(String(error)),
      {
        module: 'AuthService',
        function: 'login',
        errorType: 'network_error',
        duration
      }
    );

    throw new AuthError('NETWORK_ERROR', 'Error de conexión');
  }
}

/**
 * Función para logout
 * Invalidar tokens en el backend y limpiar estado local
 *
 * ⚠️ ALINEACIÓN CON BACKEND: También limpia el token local para que futuras
 * requests envíen Authorization header vacío hasta el próximo login.
 */
export async function logout(): Promise<void> {
  const startTime = performance.now();

  logger.info('Logout started', {
    module: 'AuthService',
    function: 'logout',
    userAction: 'logout_attempt'
  });

  try {
    logger.debug('Sending logout request to backend', {
      module: 'AuthService',
      function: 'logout',
      endpoint: '/auth/logout'
    });

    // Llamar al endpoint de logout del backend para invalidar tokens
    await apiClient.post('/auth/logout');

    const duration = performance.now() - startTime;

    logger.info('Logout successful', {
      module: 'AuthService',
      function: 'logout',
      userAction: 'logout_success',
      logoutDuration: duration
    });

    logger.logPerformance('Logout Request', duration, {
      module: 'AuthService',
      performance: {
        metric: 'auth_logout_duration',
        duration,
        threshold: 1000,
        resource: '/auth/logout'
      }
    });
  } catch (error) {
    const duration = performance.now() - startTime;

    // En caso de error del backend, continuar con logout local
    // El frontend debe limpiar su estado independientemente
    logger.warn('Logout backend error - continuing with local cleanup', {
      module: 'AuthService',
      function: 'logout',
      errorMessage: error instanceof Error ? error.message : String(error),
      duration,
      note: 'Local cleanup will proceed despite backend error'
    });
  } finally {
    // ⚠️ ALINEACIÓN CON BACKEND: Limpiar token local SIEMPRE
    // Esto asegura que futuras requests envíen Authorization header vacío
    if (browser) {
      try {
        localStorage.removeItem('accessToken');
        logger.debug('Token removed from localStorage', {
          module: 'AuthService',
          function: 'logout',
          note: 'Futuras requests enviarán Authorization header vacío'
        });
      } catch (storageError) {
        logger.warn('Failed to remove token from localStorage', {
          module: 'AuthService',
          function: 'logout',
          error: storageError
        });
      }
    }
  }
}

/**
 * Función para refresh token
 * Según BACKEND_ADVANCED_LOGIC.md línea 452-462 y documentación completa
 */
export async function refreshToken(): Promise<LoginResponse> {
  const startTime = performance.now();

  logger.debug('Refresh token started', {
    module: 'AuthService',
    function: 'refreshToken',
    userAction: 'token_refresh_attempt'
  });

  try {
    logger.trace('Sending refresh token request', {
      module: 'AuthService',
      function: 'refreshToken',
      endpoint: '/auth/refresh',
      note: 'Refresh token sent via HttpOnly cookies + Authorization header'
    });

    // El refresh token se envía automáticamente en cookies HttpOnly
    // No necesitamos enviarlo explícitamente en el body
    const response = await apiClient.post<LoginResponse>('/auth/refresh');

    const duration = performance.now() - startTime;

    if (!response.data.accessToken || !response.data.user) {
      const error = new Error('Respuesta de refresh token inválida');
      logger.error('Invalid refresh token response', error, {
        module: 'AuthService',
        function: 'refreshToken',
        hasAccessToken: !!response.data.accessToken,
        hasUser: !!response.data.user,
        duration
      });
      throw error;
    }

    // ⚠️ ALINEACIÓN CON BACKEND: Actualizar token para futuras requests
    if (browser && response.data.accessToken) {
      try {
        localStorage.setItem('accessToken', response.data.accessToken);
        logger.debug('New token stored after refresh', {
          module: 'AuthService',
          function: 'refreshToken',
          tokenLength: response.data.accessToken.length
        });
      } catch (storageError) {
        logger.warn('Failed to store refreshed token in localStorage', {
          module: 'AuthService',
          function: 'refreshToken',
          error: storageError
        });
      }
    }

    logger.info('Refresh token successful', {
      module: 'AuthService',
      function: 'refreshToken',
      userId: response.data.user.email,
      userAction: 'token_refresh_success',
      userEmail: response.data.user.email,
      refreshDuration: duration
    });

    logger.logPerformance('Refresh Token Request', duration, {
      module: 'AuthService',
      performance: {
        metric: 'auth_refresh_duration',
        duration,
        threshold: 1000,
        resource: '/auth/refresh'
      }
    });

    return response.data;
  } catch (error) {
    const duration = performance.now() - startTime;

    logger.error(
      'Refresh token failed',
      error instanceof Error ? error : new Error(String(error)),
      {
        module: 'AuthService',
        function: 'refreshToken',
        userAction: 'token_refresh_failed',
        duration,
        securityEvent: 'session_expired'
      }
    );

    // Si el refresh falla, el usuario debe hacer login nuevamente
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
}

/**
 * Función para validar si el usuario está autenticado
 * Útil para guards de rutas y verificaciones de estado
 */
export async function validateSession(): Promise<boolean> {
  try {
    // TODO: Implementar endpoint de validación cuando esté disponible
    const response = await apiClient.get('/auth/validate');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Clase para errores de autenticación personalizados
 */
class AuthError extends Error {
  public code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
