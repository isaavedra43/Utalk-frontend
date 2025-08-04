/**
 * Endpoint de Logout para UTalk Frontend
 * Limpia las cookies HttpOnly de manera segura y hace logout en el backend
 *
 * Basado en BACKEND_ADVANCED_LOGIC.md y DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import { API_BASE_URL } from '$lib/env';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, fetch }) => {
  try {
    // 1. Intentar hacer logout en el backend si tenemos sesión
    const sessionCookie = cookies.get('session');

    if (sessionCookie) {
      try {
        // Llamar al endpoint de logout del backend para invalidar tokens
        // Según DOCUMENTACION_COMPLETA_BACKEND_UTALK.md línea 252-254
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionCookie}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (backendError) {
        // Si el backend falla, continuar con logout local
        // eslint-disable-next-line no-console
        console.warn('Backend logout failed, continuing with local logout:', backendError);
      }
    }

    // 2. Limpiar todas las cookies de autenticación localmente
    // Establecer cookies con fecha de expiración pasada

    // Session cookie (Access Token)
    cookies.set('session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expirar inmediatamente
    });

    // Refresh Token cookie
    cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 0 // Expirar inmediatamente
    });

    // User Info cookie (accesible desde cliente)
    cookies.set('user_info', '', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expirar inmediatamente
    });

    return json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error en logout:', error);

    return json(
      {
        success: false,
        message: 'Error durante logout'
      },
      {
        status: 500
      }
    );
  }
};
