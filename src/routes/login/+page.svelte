<script lang="ts">
  import AlertDescription from '$lib/components/ui/alert/alert-description.svelte';
  import Alert from '$lib/components/ui/alert/alert.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { logger } from '$lib/logger';
  import { pageStore } from '$lib/stores/page.store';
  import type { PageFormData } from '$lib/types/auth';

  // ⚠️ LOG 42: PÁGINA DE LOGIN CARGADA
  // eslint-disable-next-line no-console
  console.log('🚨 LOG 42: PÁGINA DE LOGIN CARGADA:', {
    timestamp: new Date().toISOString(),
    module: 'LoginPage',
    status: 'LOADED',
    url: window.location.href
  });

  // Log al montar la página de login
  logger.info('Página de login cargada', {
    module: 'LoginPage',
    function: 'onMount',
    userAction: 'login_page_load',
    url: '/login'
  });

  // Estado del formulario
  let email = '';
  let password = '';
  let loading = false;
  let errors: Record<string, string> = {};

  // ⚠️ LOG 43: ESTADO INICIAL DEL FORMULARIO
  // eslint-disable-next-line no-console
  console.log('📋 LOG 43: Estado inicial del formulario:', {
    email: email ? email.substring(0, 10) + '...' : 'vacío',
    password: password ? '***' + password.length + '***' : 'vacío',
    loading,
    errorsCount: Object.keys(errors).length
  });

  // Obtener datos del formulario después del submit y parámetros de redirect
  $: formData = $pageStore.form as PageFormData;
  $: redirectTo = $pageStore.url ? new URL($pageStore.url).searchParams.get('redirect') : null;

  $: if (formData) {
    // ⚠️ LOG 44: DATOS DEL FORMULARIO RECIBIDOS
    // eslint-disable-next-line no-console
    console.log('📋 LOG 44: Datos del formulario recibidos del servidor:', {
      hasFormData: !!formData,
      hasError: !!formData.error,
      errorType: formData.error,
      hasEmail: !!formData['email'],
      hasSuccess: !!formData.success
    });

    // Preservar email en caso de error
    if (formData['email']) {
      email = formData['email'];
    }
    // Limpiar contraseña por seguridad
    password = '';
    // Actualizar estado de loading
    loading = false;
  }

  // Validación en tiempo real
  $: {
    errors = {};

    // Validar email
    if (email && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors['email'] = 'Formato de email inválido';
      }
    }

    // Validar contraseña
    if (password && password.length > 0 && password.length < 6) {
      errors['password'] = 'La contraseña debe tener al menos 6 caracteres';
    }

    // ⚠️ LOG 45: VALIDACIÓN EN TIEMPO REAL
    // eslint-disable-next-line no-console
    console.log('🔍 LOG 45: Validación en tiempo real:', {
      emailLength: email.length,
      passwordLength: password.length,
      errorsCount: Object.keys(errors).length,
      errors: Object.keys(errors)
    });
  }

  // Verificar si el formulario es válido
  $: isFormValid = email.length > 0 && password.length >= 6 && Object.keys(errors).length === 0;

  // ⚠️ LOG 46: ESTADO DE VALIDACIÓN DEL FORMULARIO
  $: {
    // eslint-disable-next-line no-console
    console.log('✅ LOG 46: Estado de validación del formulario:', {
      isFormValid,
      emailValid: email.length > 0,
      passwordValid: password.length >= 6,
      noErrors: Object.keys(errors).length === 0
    });
  }

  // Función para manejar el submit del formulario
  function handleSubmit() {
    // ⚠️ LOG 47: SUBMIT DEL FORMULARIO INICIADO
    // eslint-disable-next-line no-console
    console.log('🚀 LOG 47: Submit del formulario iniciado:', {
      timestamp: new Date().toISOString(),
      email: email ? email.substring(0, 10) + '...' : 'vacío',
      passwordLength: password.length,
      isFormValid,
      errorsCount: Object.keys(errors).length
    });

    logger.info('Usuario inició proceso de login', {
      module: 'LoginPage',
      function: 'handleSubmit',
      userAction: 'login_form_submit',
      userEmail: email
    });

    // ✅ CORREGIDO: Validar ANTES de establecer loading
    if (
      !email ||
      !password ||
      email.length === 0 ||
      password.length < 6 ||
      Object.keys(errors).length > 0
    ) {
      // ⚠️ LOG 48: FORMULARIO INVÁLIDO
      // eslint-disable-next-line no-console
      console.warn('⚠️ LOG 48: Formulario inválido - submit cancelado:', {
        hasEmail: !!email,
        hasPassword: !!password,
        emailLength: email.length,
        passwordLength: password.length,
        errorsCount: Object.keys(errors).length,
        errors: Object.keys(errors)
      });

      logger.warn('Formulario de login inválido', {
        module: 'LoginPage',
        function: 'handleSubmit',
        userAction: 'login_form_validation_failed',
        errors: Object.keys(errors),
        hasEmail: !!email,
        hasPassword: !!password,
        passwordLength: password.length
      });
      return;
    }

    // ✅ CORREGIDO: Establecer loading DESPUÉS de la validación
    loading = true;

    // ⚠️ LOG 49: FORMULARIO VÁLIDO - ENVIANDO
    // eslint-disable-next-line no-console
    console.log('✅ LOG 49: Formulario válido - enviando al servidor:', {
      email: email.substring(0, 10) + '...',
      passwordLength: password.length,
      loading: true,
      formAction: '?/default',
      method: 'POST'
    });

    // El form se enviará de manera tradicional a la action
    logger.info('✅ FORMULARIO VÁLIDO - Enviando al backend', {
      module: 'LoginPage',
      function: 'handleSubmit',
      userAction: 'login_form_sent',
      hasEmail: !!email,
      hasPassword: !!password,
      emailLength: email.length,
      passwordLength: password.length,
      errorsCount: Object.keys(errors).length,
      isFormValid: true
    });
  }

  // Función para mostrar mensaje de error amigable
  function getErrorMessage(error: string): string {
    // ⚠️ LOG 50: PROCESANDO ERROR PARA MOSTRAR
    // eslint-disable-next-line no-console
    console.log('🔍 LOG 50: Procesando error para mostrar:', {
      error,
      errorType: typeof error
    });

    switch (error) {
      case 'INVALID_CREDENTIALS':
        return 'Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Demasiados intentos de login. Espera unos minutos antes de intentar nuevamente.';
      case 'SERVER_ERROR':
        return 'Nuestros servidores están experimentando problemas. Intenta más tarde.';
      case 'NETWORK_ERROR':
        return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
      case 'MISSING_CREDENTIALS':
        return 'Por favor, completa todos los campos requeridos.';
      case 'INVALID_EMAIL_FORMAT':
        return 'El formato del email no es válido.';
      case 'PASSWORD_TOO_SHORT':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Error inesperado al iniciar sesión. Si el problema persiste, contacta soporte.';
    }
  }

  // Función para obtener variante de alerta según tipo de error
  function getErrorVariant(error: string): 'default' | 'destructive' {
    switch (error) {
      case 'RATE_LIMIT_EXCEEDED':
        return 'default'; // Usar default para warnings
      case 'SERVER_ERROR':
      case 'NETWORK_ERROR':
        return 'destructive';
      default:
        return 'destructive';
    }
  }
</script>

<svelte:head>
  <title>Iniciar Sesión - UTalk</title>
  <meta
    name="description"
    content="Accede a tu cuenta de UTalk para gestionar tus conversaciones y contactos"
  />
</svelte:head>

<!-- Layout centrado para login con mejor responsive -->
<div
  class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <!-- Header mejorado -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-secondary-900 mb-2">Iniciar Sesión</h1>
      <p class="text-secondary-600">Accede a tu cuenta de UTalk</p>
      {#if redirectTo}
        <p class="text-sm text-secondary-500 mt-2">
          Serás redirigido a tu página solicitada después del login
        </p>
      {/if}
    </div>

    <!-- Mensaje de error global con Alert component -->
    {#if formData?.error}
      <Alert variant={getErrorVariant(formData.error)}>
        <AlertDescription>
          <div class="flex items-start space-x-3">
            <svg
              class="h-5 w-5 text-current flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1">
              <h4 class="text-sm font-medium mb-1">Error al iniciar sesión</h4>
              <p class="text-sm">{getErrorMessage(formData.error)}</p>

              <!-- Rate limiting específico con tiempo -->
              {#if formData.retryAfter}
                <p class="mt-2 text-sm opacity-90">
                  Podrás intentar nuevamente en {Math.ceil(formData.retryAfter / 60)} minutos.
                </p>
              {/if}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    {/if}

    <!-- Formulario de login mejorado -->
    <form
      method="POST"
      action="?/default"
      on:submit={handleSubmit}
      class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md border border-secondary-200"
      novalidate
    >
      <div class="space-y-5">
        <!-- Campo Email mejorado -->
        <div>
          <label for="email" class="block text-sm font-medium text-secondary-700 mb-2">
            Email <span class="text-red-500">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            bind:value={email}
            placeholder="tu@email.com"
            className={`w-full transition-colors ${
              errors['email']
                ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500'
                : 'focus-visible:ring-primary-500 focus-visible:border-primary-500'
            }`}
            disabled={loading}
            autocomplete="email"
          />
          {#if errors['email']}
            <p class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {errors['email']}
            </p>
          {/if}
        </div>

        <!-- Campo Password mejorado -->
        <div>
          <label for="password" class="block text-sm font-medium text-secondary-700 mb-2">
            Contraseña <span class="text-red-500">*</span>
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            placeholder="••••••••"
            className={`w-full transition-colors ${
              errors['password']
                ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500'
                : 'focus-visible:ring-primary-500 focus-visible:border-primary-500'
            }`}
            disabled={loading}
            autocomplete="current-password"
          />
          {#if errors['password']}
            <p class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              {errors['password']}
            </p>
          {/if}
        </div>
      </div>

      <!-- Botón de submit con spinner y mejor UX -->
      <div>
        <Button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full flex justify-center items-center h-12 text-base font-medium transition-all duration-200 ${
            loading
              ? 'cursor-not-allowed opacity-75'
              : isFormValid
                ? 'hover:bg-primary-700 focus:ring-4 focus:ring-primary-200'
                : 'opacity-50 cursor-not-allowed'
          }`}
          variant="default"
        >
          {#if loading}
            <!-- Spinner animado -->
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Iniciando sesión...
          {:else}
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              ></path>
            </svg>
            Iniciar Sesión
          {/if}
        </Button>
      </div>

      <!-- Información de ayuda -->
      <div class="text-center space-y-3">
        <div class="text-sm text-secondary-600">
          ¿Olvidaste tu contraseña?
          <span class="text-secondary-400 cursor-not-allowed inline-flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            Próximamente
          </span>
        </div>

        <!-- Información adicional en mobile -->
        <div class="text-xs text-secondary-500 sm:hidden">
          Asegúrate de tener una conexión estable a internet
        </div>
      </div>
    </form>

    <!-- Footer informativo -->
    <div class="text-center text-xs text-secondary-500 space-y-1">
      <p>UTalk - Sistema de mensajería multicanal</p>
      <p>Versión 1.0.0 | Seguro y cifrado</p>
      <div class="flex justify-center items-center space-x-4 mt-2">
        <span class="flex items-center">
          <svg class="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          Seguro
        </span>
        <span class="flex items-center">
          <svg class="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z"
              clip-rule="evenodd"
            />
          </svg>
          Responsive
        </span>
      </div>
    </div>
  </div>
</div>

<style>
  /* Mejoras de accesibilidad y UX específicas */

  /* Evitar auto-zoom en iOS para inputs */
  :global(input[type='email'], input[type='password']) {
    font-size: 16px;
  }

  /* Animaciones suaves para estados */
  :global(.transition-all) {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Focus mejorado para accesibilidad */
  :global(input:focus-visible) {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  /* Estados de loading */
  :global(.loading-button) {
    pointer-events: none;
  }

  /* Mejoras responsive específicas */
  @media (max-width: 640px) {
    :global(.space-y-5 > *) {
      margin-bottom: 1.5rem;
    }
  }

  /* Spin animation optimizada */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }
</style>
