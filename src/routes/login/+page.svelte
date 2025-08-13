<script lang="ts">
  import { goto } from '$app/navigation';
  import { httpPost } from '$lib/api/http';
  import Button from '$lib/components/ui/button/button.svelte';
  import CardContent from '$lib/components/ui/card/card-content.svelte';
  import CardHeader from '$lib/components/ui/card/card-header.svelte';
  import CardTitle from '$lib/components/ui/card/card-title.svelte';
  import Card from '$lib/components/ui/card/card.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { authStore, setAccessToken } from '$lib/stores/auth.store';

  // Variables reactivas
  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  // ✅ PETICIÓN DIRECTA AL BACKEND - SIN SERVER ACTIONS
  async function handleLogin() {
    if (!email || !password) {
      error = 'Email y contraseña son requeridos';
      return;
    }

    loading = true;
    error = '';

    try {
      // eslint-disable-next-line no-console
      console.log('🚀 LOGIN CLIENT - Iniciando autenticación directa al backend');

      const payload = { email, password };
      const data = await httpPost<any>('auth/login', payload); // <-- no '/api/'

      // eslint-disable-next-line no-console
      console.log(
        '🔍 LOGIN CLIENT - Respuesta completa del backend:',
        JSON.stringify(data, null, 2)
      );

      // Validar respuesta del backend
      if (!data || !data.success || !data.accessToken) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ LOGIN CLIENT - Respuesta inválida del backend');
        if (!data?.accessToken) {
          throw new Error(
            'Login OK pero sin accessToken en el body. Revisa nombre del campo en back.'
          );
        }
        error = 'Credenciales incorrectas';
        return;
      }

      // Preparar datos del usuario según la estructura real del backend
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        isActive: data.user.isActive,
        phone: data.user.phone,
        permissions: data.user.permissions || [],
        department: data.user.department,
        settings: data.user.settings,
        lastLoginAt: data.user.lastLoginAt,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt,
        performance: data.user.performance
      };

      // Guardar el accessToken
      setAccessToken(data.accessToken);

      // Actualizar el store de autenticación
      authStore.login(user, data.accessToken, data.refreshToken);

      // eslint-disable-next-line no-console
      console.log('✅ LOGIN CLIENT - Exitoso para:', user.email);

      // Redirigir al dashboard después del login exitoso
      goto('/dashboard');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('🚨 LOGIN CLIENT - Error crítico:', err);
      error = 'Error de conexión. Intenta nuevamente.';
    } finally {
      loading = false;
    }
  }

  // Manejar submit del formulario
  function handleSubmit(event: any) {
    event.preventDefault();
    handleLogin();
  }
</script>

<svelte:head>
  <title>Iniciar Sesión - UTalk</title>
  <meta name="description" content="Inicia sesión en UTalk" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <Card class="w-full max-w-md">
    <CardHeader class="text-center">
      <CardTitle class="text-2xl font-bold text-gray-900">Iniciar Sesión en UTalk</CardTitle>
      <p class="text-gray-600 mt-2">Ingresa tus credenciales para acceder al sistema</p>
    </CardHeader>

    <CardContent>
      <!-- Mostrar errores si existen -->
      {#if error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800 text-sm">{error}</p>
        </div>
      {/if}

      <!-- Formulario de login -->
      <form on:submit={handleSubmit} class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1"> Email </label>
          <Input
            id="email"
            name="email"
            type="email"
            bind:value={email}
            required
            disabled={loading}
            placeholder="tu@email.com"
            class="w-full"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            bind:value={password}
            required
            disabled={loading}
            placeholder="••••••••"
            class="w-full"
          />
        </div>

        <Button type="submit" disabled={loading || !email || !password} className="w-full">
          {#if loading}
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              Iniciando sesión...
            </div>
          {:else}
            Iniciar Sesión
          {/if}
        </Button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">¿Problemas para acceder? Contacta al administrador</p>
      </div>
    </CardContent>
  </Card>
</div>
