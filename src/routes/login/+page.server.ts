// ⚠️ LOG CRÍTICO INMEDIATO - Debe aparecer SIEMPRE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER ACTION - ARCHIVO CARGADO:', {
  timestamp: new Date().toISOString(),
  module: 'LoginPageServer',
  status: 'LOADED'
});

// ✅ IMPORTACIONES ESTÁTICAS - SOLUCIÓN AL PROBLEMA #1
import { API_BASE_URL } from '$lib/env';
import { login as authLogin } from '$lib/services/auth.service';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// ⚠️ LOG CRÍTICO POST-IMPORT - Debe aparecer SIEMPRE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER ACTION - IMPORTS COMPLETADOS:', {
  timestamp: new Date().toISOString(),
  API_BASE_URL: API_BASE_URL ? 'LOADED' : 'FAILED',
  authLogin: typeof authLogin === 'function' ? 'LOADED' : 'FAILED',
  status: 'IMPORTS_STATIC_OK'
});

export const actions: Actions = {
  default: async ({ request, cookies: _cookies }) => {
    // ⚠️ LOG 1: INICIO DE SERVER ACTION
    // eslint-disable-next-line no-console
    console.log('🔍 LOG 1: SERVER ACTION INICIADO:', {
      timestamp: new Date().toISOString(),
      API_BASE_URL,
      context: 'vercel-serverless-function',
      importMethod: 'STATIC' // Confirmación de solución
    });

    try {
      // ⚠️ LOG 2: FORM DATA
      // eslint-disable-next-line no-console
      console.log('📋 LOG 2: Intentando obtener formData...');

      const formData = await request.formData();

      // ⚠️ LOG 3: FORM DATA EXITOSO
      // eslint-disable-next-line no-console
      console.log('✅ LOG 3: FormData obtenido exitosamente');

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // ⚠️ LOG 4: DATOS FORMULARIO
      // eslint-disable-next-line no-console
      console.log('📋 LOG 4: Datos del formulario:', {
        hasEmail: !!email,
        hasPassword: !!password,
        emailLength: email?.length || 0,
        passwordLength: password?.length || 0
      });

      // ⚠️ LOG 5: VALIDACIÓN
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 5: Validando datos...');

      if (!email || !password) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ LOG 6: Datos faltantes');

        return fail(400, {
          success: false,
          error: 'Email y contraseña son requeridos',
          credentials: false
        });
      }

      // ⚠️ LOG 7: VALIDACIÓN API_BASE_URL
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 7: Validando API_BASE_URL:', {
        API_BASE_URL,
        isValid: !!API_BASE_URL && !API_BASE_URL.includes('localhost')
      });

      if (!API_BASE_URL || API_BASE_URL.includes('localhost')) {
        // eslint-disable-next-line no-console
        console.error('🚨 LOG 8: API_BASE_URL inválida:', {
          API_BASE_URL,
          expected: 'https://utalk-backend-production.up.railway.app/api'
        });

        return fail(500, {
          success: false,
          error: 'Error de configuración del servidor',
          debug: 'API_BASE_URL no configurada correctamente'
        });
      }

      // ⚠️ LOG 9: PRE-LOGIN
      // eslint-disable-next-line no-console
      console.log('✅ LOG 9: Intentando login con backend:', {
        email,
        passwordLength: password.length,
        backendUrl: API_BASE_URL,
        note: 'Llamando a authLogin service'
      });

      const startTime = performance.now();

      // ⚠️ LOG 10: LLAMADA AL BACKEND
      // eslint-disable-next-line no-console
      console.log('🚀 LOG 10: Ejecutando authLogin...');

      const result = await authLogin({ email, password });

      const duration = performance.now() - startTime;

      // ⚠️ LOG 11: RESPUESTA RECIBIDA - ANÁLISIS CRÍTICO
      // eslint-disable-next-line no-console
      console.log('📥 LOG 11: RESPUESTA BACKEND RECIBIDA:', {
        duration: `${duration}ms`,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : 'null/undefined',
        resultIsArray: Array.isArray(result),
        resultJSON: JSON.stringify(result).substring(0, 500) + '...'
      });

      // ⚠️ LOG 12: ANÁLISIS ESTRUCTURA - SOLUCIÓN AL PROBLEMA #2
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 12: ANÁLISIS ESTRUCTURA RESPUESTA:', {
        hasAccessToken: !!result?.accessToken,
        hasUser: !!result?.user,
        userStructure: result?.user ? Object.keys(result.user) : 'no user',
        resultStructure: result ? Object.keys(result) : 'no result'
      });

      // ✅ MANEJO DEFENSIVO DE RESPUESTA - SOLUCIÓN AL PROBLEMA #2
      if (!result) {
        // eslint-disable-next-line no-console
        console.error('🚨 LOG 13: Result es null/undefined');
        return fail(500, {
          success: false,
          error: 'No se recibió respuesta del servidor de autenticación'
        });
      }

      // Extraer datos directamente de la respuesta esperada
      const accessToken = result.accessToken;
      const user = result.user;
      const refreshToken = result.refreshToken;

      // ⚠️ LOG 14: TOKENS EXTRAÍDOS
      // eslint-disable-next-line no-console
      console.log('🔑 LOG 14: TOKENS EXTRAÍDOS:', {
        hasAccessToken: !!accessToken,
        hasUser: !!user,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        userEmail: user?.email || 'no email'
      });

      if (!accessToken || !user) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ LOG 15: Credenciales inválidas o estructura inesperada');

        return fail(400, {
          success: false,
          error: 'Credenciales incorrectas',
          credentials: false
        });
      }

      // ✅ PREPARAR RESPUESTA SERIALIZABLE - SOLUCIÓN AL PROBLEMA #3
      const cleanUser = {
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        permissions: user.permissions,
        isAuthenticated: true
      };

      // ⚠️ LOG 16: LOGIN EXITOSO
      // eslint-disable-next-line no-console
      console.log('✅ LOG 16: Login exitoso - Preparando respuesta:', {
        duration: `${duration}ms`,
        userEmail: cleanUser.email,
        userName: cleanUser.name,
        userRole: cleanUser.role,
        hasAccessToken: !!accessToken,
        responseSize: JSON.stringify({
          success: true,
          user: cleanUser,
          accessToken
        }).length
      });

      // ✅ ESTABLECER COOKIES DE SESIÓN
      if (_cookies) {
        // Cookie de sesión
        _cookies.set('session', accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        // Cookie de refresh token
        if (refreshToken) {
          _cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/auth',
            maxAge: 60 * 60 * 24 * 30 // 30 días
          });
        }

        // Cookie de información del usuario
        _cookies.set('user_info', JSON.stringify(cleanUser), {
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        // eslint-disable-next-line no-console
        console.log('🍪 LOG 17: Cookies establecidas:', {
          hasSessionCookie: !!accessToken,
          hasRefreshCookie: !!refreshToken,
          hasUserInfoCookie: !!cleanUser
        });
      }

      // ✅ RETORNO CORRECTO - DATOS SERIALIZABLES
      return {
        success: true,
        user: cleanUser,
        accessToken,
        refreshToken: refreshToken || null
      };
    } catch (error) {
      const duration = performance.now();

      // ⚠️ LOG CRÍTICO DEL ERROR
      // eslint-disable-next-line no-console
      console.error('🚨 ERROR CRÍTICO EN SERVER ACTION:', {
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack?.substring(0, 500)
              }
            : String(error),
        API_BASE_URL,
        duration: `${duration}ms`,
        context: 'vercel-serverless-error',
        solutionApplied: [
          'Importaciones estáticas implementadas',
          'Manejo defensivo de respuesta',
          'Datos serializables garantizados'
        ]
      });

      // ✅ RESPUESTA ESTRUCTURADA PARA ERRORES - MEJORADA
      return fail(500, {
        success: false,
        error: 'Error interno del servidor. Revisar logs de Vercel.',
        debug: {
          timestamp: new Date().toISOString(),
          API_BASE_URL: API_BASE_URL?.substring(0, 30) + '...',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Importaciones dinámicas eliminadas, revisar logs para más detalles'
        }
      });
    }
  }
};
