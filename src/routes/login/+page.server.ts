// ✅ IMPORTACIONES MÍNIMAS
import { buildApiUrl, getAuthHeaders, validateAuthResponse } from '$lib/config/api';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

// ✅ LOG INICIAL SIMPLE
// eslint-disable-next-line no-console
console.log('🚨 LOGIN SERVER - INICIADO');

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

      // ✅ PETICIÓN SEGÚN DOCUMENTACIÓN BACKEND
      // Endpoint: POST /api/auth/login
      // Headers: Content-Type, Authorization (requerido)
      // Body: { email, password }
      const loginUrl = buildApiUrl('/auth/login');

      // eslint-disable-next-line no-console
      console.log('🚀 BACKEND - Intentando autenticación con:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email,
          password
        })
      });

      // eslint-disable-next-line no-console
      console.log('📥 BACKEND - Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTENTICACIÓN - Error del backend:', errorData);

        return fail(400, {
          success: false,
          error: errorData.message || 'Credenciales incorrectas',
          credentials: false
        });
      }

      const result = await response.json();

      // Validar respuesta del backend según documentación
      if (!validateAuthResponse(result)) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ AUTENTICACIÓN - Respuesta inválida del backend');
        return fail(400, {
          success: false,
          error: 'Respuesta inválida del servidor',
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

      // Establecer cookies de sesión según documentación
      if (cookies) {
        // Cookie de sesión (httpOnly para seguridad)
        cookies.set('session', result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        // Cookie de refresh token si existe
        if (result.refreshToken) {
          cookies.set('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 días
          });
        }

        // Cookie para información del usuario (no httpOnly para acceso cliente)
        cookies.set('user_info', JSON.stringify(cleanUser), {
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });
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
