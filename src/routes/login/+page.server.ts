// ⚠️ LOG CRÍTICO INMEDIATO - Debe aparecer SIEMPRE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER ACTION - ARCHIVO CARGADO:', {
  timestamp: new Date().toISOString(),
  module: 'LoginPageServer',
  status: 'LOADED'
});

import type { Actions } from './$types';

// ⚠️ LOG CRÍTICO POST-IMPORT - Debe aparecer SIEMPRE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER ACTION - IMPORTS COMPLETADOS:', {
  timestamp: new Date().toISOString(),
  status: 'IMPORTS_LOADED'
});

export const actions: Actions = {
  default: async ({ request }) => {
    // ⚠️ LOG 1: INICIO DE SERVER ACTION
    // eslint-disable-next-line no-console
    console.log('🔍 LOG 1: SERVER ACTION INICIADO:', {
      timestamp: new Date().toISOString(),
      context: 'vercel-serverless-function',
      requestMethod: request.method,
      requestUrl: request.url
    });

    try {
      // ⚠️ LOG 2: ANTES DE FORM DATA
      // eslint-disable-next-line no-console
      console.log('📋 LOG 2: Intentando obtener formData...');

      const formData = await request.formData();

      // ⚠️ LOG 3: DESPUÉS DE FORM DATA
      // eslint-disable-next-line no-console
      console.log('✅ LOG 3: FormData obtenido exitosamente');

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // ⚠️ LOG 4: DATOS OBTENIDOS
      // eslint-disable-next-line no-console
      console.log('📋 LOG 4: Datos del formulario:', {
        hasEmail: !!email,
        hasPassword: !!password,
        emailLength: email?.length || 0,
        passwordLength: password?.length || 0,
        emailValue: email ? email.substring(0, 10) + '...' : 'undefined',
        passwordValue: password ? '***' + password.length + '***' : 'undefined'
      });

      // ⚠️ LOG 5: VALIDACIÓN DE DATOS
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 5: Iniciando validación de datos...');

      // ⚠️ VALIDACIÓN CRÍTICA ANTES DE LLAMAR AL BACKEND
      if (!email || !password) {
        // ⚠️ LOG 6: DATOS INVÁLIDOS
        // eslint-disable-next-line no-console
        console.warn('⚠️ LOG 6: Datos de formulario inválidos:', {
          hasEmail: !!email,
          hasPassword: !!password,
          emailType: typeof email,
          passwordType: typeof password
        });
        return {
          success: false,
          error: 'Email y contraseña son requeridos'
        };
      }

      // ⚠️ LOG 7: DATOS VÁLIDOS
      // eslint-disable-next-line no-console
      console.log('✅ LOG 7: Datos de formulario válidos, procediendo...');

      // ⚠️ LOG 8: ANTES DE IMPORTAR SERVICIOS
      // eslint-disable-next-line no-console
      console.log('📋 LOG 8: Intentando importar servicios...');

      // Importación dinámica para evitar errores de carga
      const { API_BASE_URL } = await import('$lib/env');
      const authService = await import('$lib/services/auth.service');
      const authLogin = authService.login;

      // ⚠️ LOG 9: DESPUÉS DE IMPORTAR SERVICIOS
      // eslint-disable-next-line no-console
      console.log('✅ LOG 9: Servicios importados:', {
        API_BASE_URL: API_BASE_URL ? 'LOADED' : 'FAILED',
        authLogin: typeof authLogin === 'function' ? 'LOADED' : 'FAILED',
        authServiceType: typeof authService
      });

      // ⚠️ LOG 10: VALIDACIÓN DE API_BASE_URL
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 10: Validando API_BASE_URL:', {
        API_BASE_URL,
        isString: typeof API_BASE_URL === 'string',
        length: API_BASE_URL?.length,
        includesLocalhost: API_BASE_URL?.includes('localhost'),
        includesRailway: API_BASE_URL?.includes('railway')
      });

      if (!API_BASE_URL || API_BASE_URL.includes('localhost')) {
        // ⚠️ LOG 11: PROBLEMA CON API_BASE_URL
        // eslint-disable-next-line no-console
        console.error('🚨 LOG 11: PROBLEMA CRÍTICO: API_BASE_URL incorrecta en serverless');
        // eslint-disable-next-line no-console
        console.error('📋 LOG 11: API_BASE_URL actual:', API_BASE_URL);

        return {
          success: false,
          error: 'Error de configuración del servidor. Variables de entorno no configuradas.'
        };
      }

      // ⚠️ LOG 12: API_BASE_URL VÁLIDA
      // eslint-disable-next-line no-console
      console.log('✅ LOG 12: API_BASE_URL válida:', API_BASE_URL);

      // ⚠️ LOG 13: PREPARANDO LLAMADA AL BACKEND
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 13: Preparando llamada al backend:', {
        email: email.substring(0, 10) + '...',
        passwordLength: password.length,
        backendUrl: API_BASE_URL,
        authLoginType: typeof authLogin
      });

      // ⚠️ LOG 14: ANTES DE LLAMAR AUTHLOGIN
      // eslint-disable-next-line no-console
      console.log('🚀 LOG 14: Llamando a authLogin...');

      // Log antes de la llamada crítica
      const startTime = performance.now();

      // ⚠️ AQUÍ ES DONDE OCURRE EL ERROR 500 - Llamada al servicio
      const result = await authLogin({ email, password });

      const duration = performance.now() - startTime;

      // ⚠️ LOG 15: DESPUÉS DE AUTHLOGIN
      // eslint-disable-next-line no-console
      console.log('✅ LOG 15: authLogin completado:', {
        duration: `${duration}ms`,
        hasAccessToken: !!result.accessToken,
        hasUser: !!result.user,
        userEmail: result.user?.email,
        resultType: typeof result
      });

      // ⚠️ LOG 16: VALIDACIÓN DE RESULTADO
      // eslint-disable-next-line no-console
      console.log('🔍 LOG 16: Validando resultado del backend...');

      if (result.accessToken && result.user) {
        // ⚠️ LOG 17: LOGIN EXITOSO
        // eslint-disable-next-line no-console
        console.log('🎉 LOG 17: Login exitoso:', {
          userEmail: result.user.email,
          userRole: result.user.role,
          hasRefreshToken: !!result.refreshToken
        });

        return {
          success: true,
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        };
      } else {
        // ⚠️ LOG 18: RESPUESTA INCOMPLETA
        // eslint-disable-next-line no-console
        console.warn('⚠️ LOG 18: Login falló - respuesta incompleta del backend:', {
          hasAccessToken: !!result.accessToken,
          hasUser: !!result.user,
          hasUserEmail: !!result.user?.email,
          resultKeys: Object.keys(result || {})
        });

        return {
          success: false,
          error: 'Respuesta inválida del servidor'
        };
      }
    } catch (error) {
      const duration = performance.now();

      // ⚠️ LOG 19: ERROR CAPTURADO
      // eslint-disable-next-line no-console
      console.error('🚨 LOG 19: ERROR 500 EN SERVER ACTION:', {
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack?.substring(0, 500)
              }
            : String(error),
        duration: `${duration}ms`,
        context: 'vercel-serverless-error'
      });

      // ⚠️ LOG 20: ANÁLISIS DEL ERROR
      // eslint-disable-next-line no-console
      console.error('🔍 LOG 20: Análisis detallado del error:', {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : 'Unknown',
        hasStack: !!(error instanceof Error && error.stack)
      });

      // ⚠️ LOG 21: POSIBLES CAUSAS
      // eslint-disable-next-line no-console
      console.error('📋 LOG 21: Posibles causas del error:', [
        'Error de importación de módulos',
        'Variables de entorno no resueltas',
        'Timeout de conexión a Railway',
        'Error en auth.service.ts',
        'Problema con Axios configuration',
        'Error de sintaxis en el código',
        'Problema con Vercel serverless environment'
      ]);

      // ⚠️ LOG 22: INFORMACIÓN DEL ENTORNO
      // eslint-disable-next-line no-console
      console.error('🌐 LOG 22: Información del entorno:', {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        env: process.env['NODE_ENV'],
        vercel: process.env['VERCEL'],
        timestamp: new Date().toISOString()
      });

      // ⚠️ LOG 23: STACK TRACE COMPLETO
      if (error instanceof Error && error.stack) {
        // eslint-disable-next-line no-console
        console.error('📚 LOG 23: Stack trace completo:', error.stack);
      }

      // ⚠️ LOG 24: RESPUESTA DE ERROR
      // eslint-disable-next-line no-console
      console.log('📤 LOG 24: Enviando respuesta de error al cliente...');

      // ⚠️ RESPUESTA ESTRUCTURADA PARA DEBUGGING
      return {
        success: false,
        error: 'Error interno del servidor. Revisar logs de Vercel.',
        debug: {
          timestamp: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.name : typeof error,
          suggestion: 'Verificar configuración de variables de entorno en Vercel'
        }
      };
    }
  }
};
