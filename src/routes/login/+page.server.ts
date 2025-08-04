import { login as authLogin } from '$lib/services/auth.service';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Cargar página de login - redirigir si ya está autenticado
export const load: PageServerLoad = async ({ cookies }) => {
  // Verificar si ya hay sesión activa mediante cookie segura
  const accessToken = cookies.get('session');

  if (accessToken) {
    // TODO: En futuras iteraciones, validar token con backend
    // Por ahora solo verificamos si existe la cookie
    throw redirect(302, '/dashboard');
  }

  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    // Validaciones básicas del lado del servidor
    if (!email || !password) {
      return fail(400, {
        error: 'MISSING_CREDENTIALS',
        message: 'Email y contraseña son requeridos',
        email: email || '',
        missing: !email ? 'email' : 'password'
      });
    }

    // Validación de formato de email (RFC 5322 básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'INVALID_EMAIL_FORMAT',
        message: 'Formato de email inválido',
        email,
        field: 'email'
      });
    }

    // Validación de contraseña mínima
    if (password.length < 6) {
      return fail(400, {
        error: 'PASSWORD_TOO_SHORT',
        message: 'La contraseña debe tener al menos 6 caracteres',
        email,
        field: 'password'
      });
    }

    try {
      // Usar el servicio de autenticación que maneja toda la lógica
      const loginResponse = await authLogin({ email, password });

      const { accessToken, refreshToken, user } = loginResponse;

      // ✅ CONFIGURACIÓN SEGURA DE COOKIES HTTPONLY
      // Según mejores prácticas de seguridad y documentación backend:

      // 1. Access Token - Cookie principal de sesión (15 minutos TTL según backend)
      cookies.set('session', accessToken, {
        httpOnly: true, // ✅ NO accesible desde JavaScript del cliente
        secure: true, // ✅ Solo HTTPS en producción
        sameSite: 'lax', // ✅ Protección CSRF, permite navegación normal
        path: '/', // ✅ Disponible en toda la aplicación
        maxAge: 60 * 15 // ✅ 15 minutos según documentación backend
      });

      // 2. Refresh Token - Cookie separada para renovación (7 días TTL según backend)
      cookies.set('refresh_token', refreshToken, {
        httpOnly: true, // ✅ NO accesible desde JavaScript del cliente
        secure: true, // ✅ Solo HTTPS en producción
        sameSite: 'strict', // ✅ Más restrictivo para refresh token
        path: '/api/auth', // ✅ Solo disponible para endpoints de auth
        maxAge: 60 * 60 * 24 * 7 // ✅ 7 días según documentación backend
      });

      // 3. Información básica del usuario (NO sensible, accesible para UI)
      cookies.set(
        'user_info',
        JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl || null,
          permissions: user.permissions || []
        }),
        {
          httpOnly: false, // ✅ Accesible desde cliente para UI
          secure: true, // ✅ Solo HTTPS en producción
          sameSite: 'lax', // ✅ Permite navegación normal
          path: '/', // ✅ Disponible en toda la aplicación
          maxAge: 60 * 60 * 24 * 7 // ✅ 7 días
        }
      );

      // 4. Guardar usuario en locals para SSR (disponible en toda la request)
      locals.user = {
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions || [],
        isAuthenticated: true
      };

      // ✅ NUNCA RETORNAR TOKENS AL FRONTEND
      // Los tokens se mantienen seguros en cookies HttpOnly

      // Redirigir a dashboard después de login exitoso
      throw redirect(302, '/dashboard');
    } catch (error) {
      // ✅ MANEJO SEGURO DE ERRORES
      // No exponer información sensible sobre el sistema interno

      const errorMessage =
        error instanceof Error ? error.message : 'Error inesperado al iniciar sesión';

      // Log del error real en servidor (para debugging), pero NO exponer al cliente
      // eslint-disable-next-line no-console
      console.error('Login error server-side:', {
        email: email.toLowerCase(),
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      // Determinar tipo de error y código HTTP apropiado
      if (errorMessage.includes('Correo o contraseña incorrectos')) {
        return fail(401, {
          error: 'INVALID_CREDENTIALS',
          message: 'Correo o contraseña incorrectos', // ✅ Mensaje seguro y genérico
          email
        });
      }

      if (errorMessage.includes('Demasiados intentos')) {
        return fail(429, {
          error: 'RATE_LIMIT_EXCEEDED',
          message: errorMessage, // Este mensaje ya es seguro del auth service
          email
        });
      }

      if (errorMessage.includes('servidor no está disponible')) {
        return fail(500, {
          error: 'SERVER_ERROR',
          message: 'El servidor no está disponible, intenta más tarde', // ✅ Mensaje genérico
          email
        });
      }

      if (errorMessage.includes('Error de conexión')) {
        return fail(500, {
          error: 'NETWORK_ERROR',
          message: 'Error de conexión. Verifica tu internet e intenta nuevamente.', // ✅ Mensaje seguro
          email
        });
      }

      // Error genérico para casos no manejados específicamente
      return fail(500, {
        error: 'LOGIN_FAILED',
        message: 'Error inesperado al iniciar sesión', // ✅ Mensaje genérico y seguro
        email
      });
    }
  }
};
