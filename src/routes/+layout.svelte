<script lang="ts">
  import { browser } from '$app/environment';
  import { API_BASE_URL } from '$lib/env';
  import '../app.css';

  // Función para ping al backend
  async function pingBackend() {
    if (!browser) return;

    try {
      // eslint-disable-next-line no-console
      console.log('🚀 PING BACKEND - Iniciando ping automático...');

      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/ping`, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        // eslint-disable-next-line no-console
        console.log('✅ PING BACKEND - Conexión exitosa:', {
          status: response.status,
          url: API_BASE_URL
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn('⚠️ PING BACKEND - Respuesta no exitosa:', response.status);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('🚨 PING BACKEND - Error de conexión:', error);
    }
  }

  // Ejecutar ping al cargar la app
  if (browser) {
    pingBackend();
  }
</script>

<main>
  <slot />
</main>
