// ⚠️ LOG CRÍTICO INMEDIATO - Debe aparecer SIEMPRE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER ACTION - ARCHIVO CARGADO:', {
  timestamp: new Date().toISOString(),
  module: 'LoginPageServer',
  status: 'LOADED'
});

import { API_BASE_URL } from '$lib/env';
import { login as authLogin } from '$lib/services/auth.service';
import type { Actions } from './$types';

// ⚠️ LOG CRÍTICO POST-IMPORT - Debe aparecer SIEMPRE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER ACTION - IMPORTS COMPLETADOS:', {
  timestamp: new Date().toISOString(),
  API_BASE_URL: API_BASE_URL ? 'LOADED' : 'FAILED',
  authLogin: typeof authLogin === 'function' ? 'LOADED' : 'FAILED'
});

export const actions: Actions = {
  default: async ({ request, cookies: _cookies }) => {
    // ⚠️ LOG CRÍTICO PARA DEBUGGING VERCEL 500
    // eslint-disable-next-line no-console
    console.log('🔍 SERVER ACTION INICIADO:', {
      timestamp: new Date().toISOString(),
      API_BASE_URL,
      context: 'vercel-serverless-function'
    });

    try {
      // ⚠️ LOG ANTES DE FORM DATA
      // eslint-disable-next-line no-console
      console.log('📋 Intentando obtener formData...');

      const formData = await request.formData();

      // ⚠️ LOG DESPUÉS DE FORM DATA
      // eslint-disable-next-line no-console
      console.log('✅ FormData obtenido exitosamente');

      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // ⚠️ LOG DE DATOS OBTENIDOS
      // eslint-disable-next-line no-console
      console.log('📋 Datos del formulario:', {
        hasEmail: !!email,
        hasPassword: !!password,
        emailLength: email?.length || 0,
        passwordLength: password?.length || 0
      });

      // ⚠️ VALIDACIÓN CRÍTICA ANTES DE LLAMAR AL BACKEND
      if (!email || !password) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Datos de formulario inválidos:', {
          hasEmail: !!email,
          hasPassword: !!password
        });
        return {
          success: false,
          error: 'Email y contraseña son requeridos'
        };
      }

      if (!API_BASE_URL || API_BASE_URL.includes('localhost')) {
        // eslint-disable-next-line no-console
        console.error('🚨 PROBLEMA CRÍTICO: API_BASE_URL incorrecta en serverless');
        // eslint-disable-next-line no-console
        console.error('📋 API_BASE_URL actual:', API_BASE_URL);

        return {
          success: false,
          error: 'Error de configuración del servidor. Variables de entorno no configuradas.'
        };
      }

      // eslint-disable-next-line no-console
      console.log('✅ Intentando login con backend:', {
        email,
        passwordLength: password.length,
        backendUrl: API_BASE_URL,
        note: 'Llamando a authLogin service'
      });

      // Log antes de la llamada crítica
      const startTime = performance.now();

      // ⚠️ AQUÍ ES DONDE OCURRE EL ERROR 500 - Llamada al servicio
      const result = await authLogin({ email, password });

      const duration = performance.now() - startTime;

      // eslint-disable-next-line no-console
      console.log('✅ Login exitoso:', {
        duration: `${duration}ms`,
        hasAccessToken: !!result.accessToken,
        hasUser: !!result.user,
        userEmail: result.user?.email
      });

      if (result.accessToken && result.user) {
        return {
          success: true,
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        };
      } else {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Login falló - respuesta incompleta del backend');

        return {
          success: false,
          error: 'Respuesta inválida del servidor'
        };
      }
    } catch (error) {
      const duration = performance.now();

      // ⚠️ LOG CRÍTICO DEL ERROR 500
      // eslint-disable-next-line no-console
      console.error('🚨 ERROR 500 EN SERVER ACTION:', {
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
        context: 'vercel-serverless-error',
        possibleCauses: [
          'Error de importación de módulos',
          'Variables de entorno no resueltas',
          'Timeout de conexión a Railway',
          'Error en auth.service.ts',
          'Problema con Axios configuration'
        ]
      });

      // ⚠️ RESPUESTA ESTRUCTURADA PARA DEBUGGING
      return {
        success: false,
        error: 'Error interno del servidor. Revisar logs de Vercel.',
        debug: {
          timestamp: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Verificar configuración de variables de entorno en Vercel'
        }
      };
    }
  }
};
