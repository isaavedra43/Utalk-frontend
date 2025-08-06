<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/button/button.svelte';
  import CardContent from '$lib/components/ui/card/card-content.svelte';
  import CardHeader from '$lib/components/ui/card/card-header.svelte';
  import CardTitle from '$lib/components/ui/card/card-title.svelte';
  import Card from '$lib/components/ui/card/card.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import type { PageFormData } from '$lib/types/auth';

  // Variables reactivas
  let email = '';
  let password = '';
  let loading = false;

  // Obtener datos del formulario después del submit
  $: formData = $page.form as PageFormData;

  // Manejar respuesta del servidor
  $: if (formData) {
    // eslint-disable-next-line no-console
    console.log('📋 LOGIN RESPONSE:', {
      hasFormData: !!formData,
      hasError: !!formData.error,
      hasSuccess: !!formData.success
    });

    // Preservar email en caso de error
    if (formData.email) {
      email = formData.email;
    }

    // Limpiar contraseña por seguridad
    password = '';

    // Actualizar estado de loading
    loading = false;

    // Si login exitoso, redirigir al dashboard
    if (formData.success && formData.user) {
      // eslint-disable-next-line no-console
      console.log('✅ LOGIN EXITOSO - Redirigiendo al dashboard');
      goto('/dashboard');
    }
  }

  // Manejar submit del formulario
  function handleSubmit() {
    if (!email || !password) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log('🚀 LOGIN SUBMIT - Procesando formulario');
    loading = true;
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
      {#if formData?.error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800 text-sm">{formData.error}</p>
        </div>
      {/if}

      <!-- Formulario de login -->
      <form method="POST" action="?/default" use:enhance on:submit={handleSubmit} class="space-y-4">
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
