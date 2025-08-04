/**
 * Endpoint de Refresh Token para UTalk Frontend
 * Renueva access token usando refresh token de manera segura
 *
 * Basado en:
 * - BACKEND_ADVANCED_LOGIC.md línea 452-462
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md línea 204-208
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md línea 247-250
 */

import { API_BASE_URL } from '$lib/env';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, fetch }) => {
  try {
    // 1. Verificar que tenemos refresh token
    const refreshToken = cookies.get('refresh_token');

    if (!refreshToken) {
      throw error(401, {
        message: 'No hay refresh token disponible'
      });
    }

    // 2. Llamar al backend para refresh
    // El refresh token se envía automáticamente en cookies
    const backendResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Los cookies se envían automáticamente por SvelteKit
      }
    });

    if (!backendResponse.ok) {
      // Manejar errores específicos del backend
      if (backendResponse.status === 401) {
        // Refresh token expirado o inválido
        // Limpiar cookies automáticamente
        cookies.set('session', '', { path: '/', maxAge: 0 });
        cookies.set('refresh_token', '', { path: '/api/auth', maxAge: 0 });
        cookies.set('user_info', '', { path: '/', maxAge: 0 });

        throw error(401, {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
        });
      }

      if (backendResponse.status === 403) {
        // Token family comprometido según BACKEND_ADVANCED_LOGIC_CORREGIDO.md línea 204-208
        // Limpiar todas las cookies por seguridad
        cookies.set('session', '', { path: '/', maxAge: 0 });
        cookies.set('refresh_token', '', { path: '/api/auth', maxAge: 0 });
        cookies.set('user_info', '', { path: '/', maxAge: 0 });

        throw error(403, {
          message: 'Sesión comprometida. Por favor, inicia sesión nuevamente.'
        });
      }

      throw error(backendResponse.status, {
        message: 'Error al renovar la sesión'
      });
    }

    // 3. Procesar respuesta exitosa del backend
    const refreshData = await backendResponse.json();

    if (!refreshData.accessToken || !refreshData.refreshToken || !refreshData.user) {
      throw error(500, {
        message: 'Respuesta inválida del servidor'
      });
    }

    // 4. Establecer nuevas cookies con los tokens renovados
    // Access Token (15 minutos TTL según backend)
    cookies.set('session', refreshData.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15 // 15 minutos
    });

    // Refresh Token (7 días TTL según backend)
    cookies.set('refresh_token', refreshData.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    // User Info (NO sensible, accesible para UI)
    cookies.set(
      'user_info',
      JSON.stringify({
        email: refreshData.user.email,
        name: refreshData.user.name,
        role: refreshData.user.role,
        avatarUrl: refreshData.user.avatarUrl || null,
        permissions: refreshData.user.permissions || []
      }),
      {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 días
      }
    );

    // 5. Retornar respuesta exitosa (SIN tokens)
    // Los tokens se mantienen seguros en cookies HttpOnly
    return json({
      success: true,
      message: 'Sesión renovada exitosamente',
      user: {
        email: refreshData.user.email,
        name: refreshData.user.name,
        role: refreshData.user.role,
        avatarUrl: refreshData.user.avatarUrl,
        permissions: refreshData.user.permissions
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error en refresh token:', err);

    // Si es un error ya formateado por SvelteKit, re-lanzarlo
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    // Error genérico
    throw error(500, {
      message: 'Error interno durante renovación de sesión'
    });
  }
};
