/**
 * Hooks del Servidor para UTalk Frontend
 * Middleware global para autenticación, protección de rutas y manejo SSR
 *
 * Basado en la documentación backend:
 * - BACKEND_ADVANCED_LOGIC_CORREGIDO.md
 * - BACKEND_ADVANCED_LOGIC.md
 * - DOCUMENTACION_COMPLETA_BACKEND_UTALK.md
 */

import { authStore } from '$lib/stores/auth.store';
import { redirect, type Handle } from '@sveltejs/kit';

/**
 * Lista de rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  '/', // Homepage
  '/login', // Página de login
  '/api', // Endpoints API (maneja auth internamente)
  '/_app', // Assets de la aplicación
  '/favicon.ico', // Favicon
  '/robots.txt', // Robots.txt
  '/sitemap.xml' // Sitemap
];

/**
 * Lista de rutas privadas que requieren autenticación
 * Todo lo que no esté en PUBLIC_ROUTES se considera privado por defecto
 * Esta lista es informativa - la lógica usa isPrivateRoute()
 */
// const PRIVATE_ROUTES = [
//   '/dashboard',     // Dashboard principal
//   '/chat',          // Sistema de chat
//   '/conversations', // Gestión de conversaciones
//   '/contacts',      // Gestión de contactos
//   '/campaigns',     // Gestión de campañas
//   '/profile',       // Perfil de usuario
//   '/settings',      // Configuraciones
//   '/admin',         // Panel de administración
//   '/team'          // Gestión de equipo
// ];

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
function isAuthenticated(cookies: any): boolean {
  const sessionCookie = cookies.get('session');
  const userInfoCookie = cookies.get('user_info');

  // Verificar que existan ambas cookies
  return !!(sessionCookie && userInfoCookie);
}

/**
 * Obtener información del usuario desde cookies
 */
function getUserFromCookies(cookies: any): any {
  try {
    const userInfoCookie = cookies.get('user_info');
    if (!userInfoCookie) return null;

    const userData = JSON.parse(userInfoCookie);

    // Validar que tenemos los campos mínimos requeridos
    if (userData.email && userData.name && userData.role) {
      return {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions || [],
        isAuthenticated: true
      };
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error al parsear información del usuario:', error);
    return null;
  }
}

/**
 * Handle principal - Middleware global
 */
export const handle: Handle = async ({ event, resolve }) => {
  const { url, cookies } = event;
  const pathname = url.pathname;

  // ✅ 1. VERIFICAR ESTADO DE AUTENTICACIÓN
  const authenticated = isAuthenticated(cookies);
  const userData = getUserFromCookies(cookies);

  // ✅ 2. ESTABLECER USUARIO EN LOCALS PARA SSR
  if (authenticated && userData) {
    event.locals.user = userData;

    // Inicializar el store desde el servidor
    authStore.initFromServer(event);
  } else {
    // No asignar undefined explícitamente
    delete event.locals.user;
  }

  // ✅ 3. LÓGICA DE PROTECCIÓN DE RUTAS

  // Si el usuario está autenticado e intenta acceder a /login
  if (authenticated && pathname === '/login') {
    // Redirigir al dashboard en lugar de login
    throw redirect(302, '/dashboard');
  }

  // Si el usuario NO está autenticado e intenta acceder a ruta privada
  if (!authenticated && isPrivateRoute(pathname)) {
    // Guardar la URL original para redirigir después del login
    const redirectTo = encodeURIComponent(pathname + url.search);

    // Redirigir a login con parámetro de retorno
    throw redirect(302, `/login?redirect=${redirectTo}`);
  }

  // ✅ 4. LOGGING DE ACCESO (solo en desarrollo)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(
      `${authenticated ? '🔐' : '🔓'} ${event.request.method} ${pathname} ${authenticated ? `[${userData?.email}]` : '[anonymous]'}`
    );
  }

  // ✅ 5. HEADERS DE SEGURIDAD
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Inyectar headers de seguridad en el HTML si es necesario
      return html;
    }
  });

  // Agregar headers de seguridad a todas las respuestas
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // CSP básico para desarrollo
  if (import.meta.env.DEV) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:; img-src 'self' data: blob: https:;"
    );
  }

  return response;
};

/**
 * Hook para manejo de errores del servidor
 */
export async function handleError({ error, event }: { error: any; event: any }) {
  // Log del error real en servidor
  // eslint-disable-next-line no-console
  console.error('Server error:', {
    error: error?.message || 'Unknown error',
    url: event.url.pathname,
    user: event.locals.user?.email || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // NO exponer detalles del error al cliente
  return {
    message: 'Error interno del servidor'
  } as any;
}

/**
 * Hook para fetch del servidor - Interceptor para requests del servidor
 */
export async function handleFetch({
  request,
  fetch,
  event
}: {
  request: any;
  fetch: any;
  event: any;
}) {
  // Si la request es hacia nuestra API, agregar headers de autenticación
  if (request.url.includes('/api/') && event.locals.user) {
    // Agregar cookie de sesión a requests internos
    const sessionCookie = event.cookies.get('session');
    if (sessionCookie) {
      request.headers.set('Cookie', `session=${sessionCookie}`);
    }
  }

  return fetch(request);
}
