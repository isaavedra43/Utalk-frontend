// ⚠️ LOG CRÍTICO INMEDIATO - AUTH.SERVICE.TS CARGADO
// eslint-disable-next-line no-console
console.log('🚨 LOG 28: AUTH.SERVICE.TS - ARCHIVO CARGADO:', {
  timestamp: new Date().toISOString(),
  module: 'AuthService',
  status: 'LOADED'
});

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
 *
 * ⚠️ FALLBACK CRÍTICO: Si las variables de entorno fallan, usa URL hardcodeada de Railway
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const startTime = performance.now();

  // ⚠️ LOG 29: INICIO DE LOGIN
  // eslint-disable-next-line no-console
  console.log('🚀 LOG 29: Iniciando función login:', {
    timestamp: new Date().toISOString(),
    hasEmail: !!credentials.email,
    hasPassword: !!credentials.password,
    emailLength: credentials.email?.length || 0
  });

  // ⚠️ VALIDACIÓN CRÍTICA: Verificar configuración antes de hacer request
  const currentBaseUrl = apiClient.defaults.baseURL;
  // eslint-disable-next-line no-console
  console.log('🔍 LOG 30: AUTH SERVICE DEBUG:', {
    baseURL: currentBaseUrl,
    hasBaseURL: !!currentBaseUrl,
    isLocalhost: currentBaseUrl?.includes('localhost'),
    timestamp: new Date().toISOString()
  });

  // ⚠️ FALLBACK DE EMERGENCIA: Si API_BASE_URL está mal, usar Railway directamente
  if (!currentBaseUrl || currentBaseUrl.includes('localhost')) {
    const railwayUrl = 'https://utalk-backend-production.up.railway.app/api';
    // eslint-disable-next-line no-console
    console.warn('🚨 LOG 31: FALLBACK CRÍTICO: Usando URL hardcodeada de Railway');
    // eslint-disable-next-line no-console
    console.warn('📋 LOG 31: Original baseURL:', currentBaseUrl);
    // eslint-disable-next-line no-console
    console.warn('📋 LOG 31: Fallback URL:', railwayUrl);

    // Temporalmente cambiar la baseURL para esta request
    apiClient.defaults.baseURL = railwayUrl;
  }

  logger.info('Login attempt started', {
    module: 'AuthService',
    function: 'login',
    userAction: 'login_attempt',
    userEmail: credentials.email,
    hasPassword: !!credentials.password,
    baseURL: apiClient.defaults.baseURL
  });

  try {
    // Validación básica de credenciales
    if (!credentials.email || !credentials.password) {
      const error = new Error('Email y contraseña son requeridos');
      logger.warn('Login validation failed', {
        module: 'AuthService',
        function: 'login',
        validationError: 'missing_credentials'
      });
      throw error;
    }

    // ⚠️ LOG 32: ANTES DE LA LLAMADA AL BACKEND
    // eslint-disable-next-line no-console
    console.log('🔍 LOG 32: Preparando llamada al backend:', {
      endpoint: '/auth/login',
      baseURL: apiClient.defaults.baseURL,
      email: credentials.email.substring(0, 10) + '...',
      passwordLength: credentials.password.length
    });

    logger.debug('Sending login request to backend', {
      module: 'AuthService',
      function: 'login',
      endpoint: '/auth/login',
      baseURL: apiClient.defaults.baseURL,
      note: 'Authorization header enviado vacío según requerimiento del backend'
    });

    // ⚠️ LOG 33: LLAMADA CRÍTICA AL BACKEND
    // eslint-disable-next-line no-console
    console.log('🚀 LOG 33: Realizando llamada POST al backend...');

    // ⚠️ LLAMADA CRÍTICA AL BACKEND - Aquí puede fallar con 500
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });

    // ⚠️ LOG 34: RESPUESTA DEL BACKEND
    // eslint-disable-next-line no-console
    console.log('✅ LOG 34: Respuesta del backend recibida:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {})
    });

    const { accessToken, refreshToken, user } = response.data;
    const duration = performance.now() - startTime;

    // ⚠️ VALIDACIÓN DE RESPUESTA ROBUSTA
    if (!accessToken || !user || !user.email) {
      // eslint-disable-next-line no-console
      console.error('🚨 LOG 35: Respuesta inválida del backend:', {
        hasAccessToken: !!accessToken,
        hasUser: !!user,
        hasUserEmail: !!user?.email,
        responseData: response.data
      });
      throw new Error('Respuesta inválida del backend: datos incompletos');
    }

    // ✅ GUARDAR TOKEN EN LOCALSTORAGE según requerimiento del usuario
    if (browser) {
      try {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // ⚠️ LOG 36: TOKENS GUARDADOS
        // eslint-disable-next-line no-console
        console.log('💾 LOG 36: Tokens guardados en localStorage:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        logger.debug('Tokens stored in localStorage', {
          module: 'AuthService',
          function: 'login',
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
      } catch (storageError) {
        // ⚠️ LOG 37: ERROR AL GUARDAR TOKENS
        // eslint-disable-next-line no-console
        console.error('🚨 LOG 37: Error al guardar tokens en localStorage:', storageError);

        logger.warn('Failed to store tokens in localStorage', {
          module: 'AuthService',
          function: 'login',
          error: storageError
        });
      }
    }

    // ⚠️ LOG 38: LOGIN EXITOSO
    // eslint-disable-next-line no-console
    console.log('🎉 LOG 38: Login exitoso:', {
      userEmail: user.email,
      userRole: user.role,
      duration: Math.round(duration),
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    logger.info('Login successful', {
      module: 'AuthService',
      function: 'login',
      userAction: 'login_success',
      userEmail: user.email,
      userRole: user.role,
      duration: Math.round(duration),
      resource: '/auth/login'
    });

    return { accessToken, refreshToken, user };
  } catch (error) {
    const duration = performance.now() - startTime;

    // ⚠️ LOG 39: ERROR EN LOGIN
    // eslint-disable-next-line no-console
    console.error('🚨 LOG 39: ERROR EN LOGIN CLIENTE:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      duration: Math.round(duration),
      context: 'browser-client-error',
      suggestion: 'Verificar respuesta del backend'
    });

    // Manejo específico de errores de red
    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        logger.error('Network error during login', error, {
          module: 'AuthService',
          function: 'login',
          userAction: 'login_network_error',
          errorType: 'network'
        });
        throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }

      if (error.message.includes('timeout')) {
        logger.error('Timeout error during login', error, {
          module: 'AuthService',
          function: 'login',
          userAction: 'login_timeout_error',
          errorType: 'timeout'
        });
        throw new Error('Timeout de conexión. El servidor tardó demasiado en responder.');
      }
    }

    // Manejo de errores de respuesta HTTP
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as {
        response?: { status?: number; statusText?: string; data?: unknown };
        config?: { url?: string };
      };
      const status = httpError.response?.status;
      const data = httpError.response?.data;

      // ⚠️ LOG 40: ERROR HTTP ESPECÍFICO
      // eslint-disable-next-line no-console
      console.error('🚨 LOG 40: Error HTTP específico:', {
        status,
        statusText: httpError.response?.statusText,
        data,
        url: httpError.config?.url
      });

      logger.error(
        'HTTP error during login',
        error instanceof Error ? error : new Error(String(error)),
        {
          module: 'AuthService',
          function: 'login',
          userAction: 'login_http_error',
          status,
          data
        }
      );

      // Manejo específico por código de estado
      switch (status) {
        case 401:
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        case 429:
          throw new Error('Demasiados intentos. Espera unos minutos antes de intentar nuevamente.');
        case 502:
          // eslint-disable-next-line no-console
          console.error('🚨 LOG 41: Error 502 - Bad Gateway:', {
            backendUrl: apiClient.defaults.baseURL,
            suggestion: 'El backend puede estar caído o sobrecargado'
          });
          throw new Error('Error del servidor. Intenta nuevamente en unos minutos.');
        case 500:
          throw new Error('Error interno del servidor. Contacta soporte si el problema persiste.');
        default:
          throw new Error(`Error del servidor (${status}). Intenta nuevamente.`);
      }
    }

    // Error genérico
    logger.error('Unexpected error during login', error as Error, {
      module: 'AuthService',
      function: 'login',
      userAction: 'login_unexpected_error',
      errorType: error instanceof Error ? error.name : typeof error
    });

    throw new Error('Error inesperado al iniciar sesión. Intenta nuevamente.');
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
