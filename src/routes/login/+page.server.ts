// ✅ IMPORTACIONES ESTÁTICAS LIMPIAS
import { API_BASE_URL } from '$lib/env';
import { login as authLogin } from '$lib/services/auth.service';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// ✅ LOG INICIAL SIMPLE Y SERIALIZABLE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER - INICIADO:', {
  timestamp: new Date().toISOString(),
  hasApiUrl: !!API_BASE_URL,
  hasAuthService: !!authLogin
});

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    // eslint-disable-next-line no-console
    console.log('🔍 LOGIN ACTION - Iniciado');

    try {
      const formData = await request.formData();
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // eslint-disable-next-line no-console
      console.log('📋 FORM DATA - Datos recibidos:', {
        hasEmail: !!email,
        hasPassword: !!password,
        emailLength: email?.length || 0
      });

      if (!email || !password) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ VALIDACIÓN - Datos faltantes');
        return fail(400, {
          success: false,
          error: 'Email y contraseña son requeridos',
          credentials: false
        });
      }

      // Validar configuración del backend
      if (!API_BASE_URL || API_BASE_URL.includes('localhost')) {
        // eslint-disable-next-line no-console
        console.error('🚨 CONFIGURACIÓN - API_BASE_URL inválida');
        return fail(500, {
          success: false,
          error: 'Error de configuración del servidor'
        });
      }

      // eslint-disable-next-line no-console
      console.log('🚀 BACKEND - Intentando autenticación con:', API_BASE_URL);

      // Llamada al servicio de autenticación
      const result = await authLogin({ email, password });

      // eslint-disable-next-line no-console
      console.log('📥 BACKEND - Respuesta recibida:', {
        hasResult: !!result,
        hasToken: !!result?.accessToken,
        hasUser: !!result?.user
      });

      if (!result || !result.accessToken || !result.user) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTENTICACIÓN - Credenciales inválidas');
        return fail(400, {
          success: false,
          error: 'Credenciales incorrectas',
          credentials: false
        });
      }

      // Preparar datos del usuario (serializables)
      const cleanUser = {
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        avatarUrl: result.user.avatarUrl || null,
        permissions: result.user.permissions || [],
        isAuthenticated: true
      };

      // Establecer cookies de sesión
      if (cookies) {
        cookies.set('session', result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        if (result.refreshToken) {
          cookies.set('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 días
          });
        }
      }

      // eslint-disable-next-line no-console
      console.log('✅ LOGIN - Exitoso para:', cleanUser.email);

      return {
        success: true,
        user: cleanUser,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || null
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('🚨 ERROR CRÍTICO:', {
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });

      return fail(500, {
        success: false,
        error: 'Error interno del servidor. Intenta nuevamente.',
        debug: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};
