/**
 * Hooks del Servidor para UTalk Frontend
 * Middleware global para autenticación, protección de rutas y manejo SSR
 */

import type { User } from '$lib/types/auth';
import { redirect, type Cookies, type Handle, type HandleServerError } from '@sveltejs/kit';

/**
 * Lista de rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  '/login', // Página de login
  '/api', // Endpoints API (maneja auth internamente)
  '/_app', // Assets de la aplicación
  '/favicon.ico', // Favicon
  '/robots.txt', // Robots.txt
  '/sitemap.xml' // Sitemap
];

/**
 * Verificar si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    // Rutas exactas
    if (route === pathname) return true;

    // Rutas que comienzan con el patrón (ej: /api/*)
    if (route.endsWith('/') || route === '/api') {
      return pathname.startsWith(route);
    }

    return false;
  });
}

/**
 * Verificar si una ruta es privada
 */
function isPrivateRoute(pathname: string): boolean {
  // Si no es pública y no es un asset estático, es privada
  if (isPublicRoute(pathname)) return false;

  // Ignorar assets estáticos
  if (pathname.includes('.')) return false;

  return true;
}

/**
 * Verificar si el usuario está autenticado mediante cookies
 */
function isAuthenticated(cookies: Cookies): boolean {
  const sessionCookie = cookies.get('session');
  const userInfoCookie = cookies.get('user_info');

  // Verificar que existan ambas cookies
  return !!(sessionCookie && userInfoCookie);
}

/**
 * Obtener información del usuario desde cookies
 */
function getUserFromCookies(cookies: Cookies): User | null {
  try {
    const userInfoCookie = cookies.get('user_info');
    if (!userInfoCookie) return null;

    const userData = JSON.parse(userInfoCookie) as Record<string, unknown>;

    // Validar que tenemos los campos mínimos requeridos
    if (
      typeof userData['email'] === 'string' &&
      typeof userData['name'] === 'string' &&
      typeof userData['role'] === 'string'
    ) {
      const user: User = {
        email: userData['email'],
        name: userData['name'],
        role: userData['role'] as User['role'],
        isAuthenticated: true
      };

      // Agregar campos opcionales solo si existen y son válidos
      if (typeof userData['avatarUrl'] === 'string') {
        user.avatarUrl = userData['avatarUrl'];
      }

      if (Array.isArray(userData['permissions'])) {
        user.permissions = userData['permissions'].filter(
          (p): p is string => typeof p === 'string'
        );
      }

      return user;
    }

    return null;
  } catch (error) {
    // Cookie corrupta o inválida
    // eslint-disable-next-line no-console
    console.warn('Error parsing user_info cookie:', error);
    return null;
  }
}

/**
 * Limpiar cookies corruptas o inválidas
 */
function clearInvalidCookies(cookies: Cookies): void {
  cookies.set('session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 0
  });

  cookies.set('user_info', '', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

/**
 * Hook principal del servidor - maneja autenticación y protección de rutas
 */
export const handle: Handle = async ({ event, resolve }) => {
  const { url, cookies, locals } = event;
  const pathname = url.pathname;

  // Log simple para debug
  // eslint-disable-next-line no-console
  console.log('🔍 HOOK - Request:', pathname);

  try {
    // 1. REDIRECCIÓN AUTOMÁTICA DESDE LA RAÍZ
    if (pathname === '/') {
      if (!isAuthenticated(cookies)) {
        // Usuario no autenticado - redirigir directamente a login
        throw redirect(302, '/login');
      } else {
        // Usuario autenticado - redirigir al dashboard
        throw redirect(302, '/dashboard');
      }
    }

    // 2. VERIFICAR SI LA RUTA REQUIERE AUTENTICACIÓN
    if (isPrivateRoute(pathname)) {
      // 3. VERIFICAR AUTENTICACIÓN
      if (!isAuthenticated(cookies)) {
        // Usuario no autenticado - redirigir a login con redirect param
        const redirectParam = encodeURIComponent(pathname + url.search);
        throw redirect(302, `/login?redirect=${redirectParam}`);
      }

      // 4. OBTENER INFORMACIÓN DEL USUARIO
      const user = getUserFromCookies(cookies);
      if (!user) {
        // Cookie corrupta - limpiar y redirigir
        clearInvalidCookies(cookies);
        const redirectParam = encodeURIComponent(pathname + url.search);
        throw redirect(302, `/login?redirect=${redirectParam}`);
      }

      // 5. ESTABLECER USUARIO EN LOCALS PARA SSR
      locals.user = user;
    }

    // 6. RESOLVER REQUEST CON CONFIGURACIÓN DE HEADERS
    const response = await resolve(event, {
      filterSerializedResponseHeaders(name) {
        // Mantener headers de seguridad y CORS
        return name === 'content-range' || name === 'x-custom-header';
      }
    });

    // 7. AGREGAR HEADERS DE SEGURIDAD
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    // Si es un redirect, re-lanzarlo
    if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
      throw error;
    }

    // Log simple del error
    // eslint-disable-next-line no-console
    console.error('🚨 HOOK ERROR:', error instanceof Error ? error.message : String(error));

    // Limpiar cookies por seguridad en caso de error
    clearInvalidCookies(cookies);

    // Dejar que SvelteKit maneje el error
    throw error;
  }
};

/**
 * Manejo de errores del servidor
 */
export const handleError: HandleServerError = async ({ error, event }) => {
  const errorId = Date.now();

  // Log simple del error
  // eslint-disable-next-line no-console
  console.error('🚨 SERVER ERROR:', {
    errorId,
    message: error instanceof Error ? error.message : 'Unknown error',
    url: event.url.pathname
  });

  // Retornar error sanitizado para el cliente
  return {
    message: 'Ocurrió un error interno del servidor',
    errorId
  };
};
