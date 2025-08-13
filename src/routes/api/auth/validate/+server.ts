import { authStore } from '$lib/stores/auth.store';
import { json, type RequestEvent } from '@sveltejs/kit';

export const GET = async ({ request }: RequestEvent) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Token no proporcionado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Validar el token localmente primero
    if (!authStore.validateToken()) {
      return json({ error: 'Token inválido o expirado' }, { status: 401 });
    }

    // Llamar al backend para validar la sesión
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/validate`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return json({ error: 'Sesión inválida' }, { status: response.status });
    }

    const userData = await response.json();

    return json({
      success: true,
      user: userData.user,
      message: 'Sesión válida'
    });
  } catch (error) {
    console.error('Error validando sesión:', error);
    return json({ error: 'Error interno del servidor' }, { status: 500 });
  }
};
