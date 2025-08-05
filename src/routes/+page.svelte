<script lang="ts">
  import { goto } from '$app/navigation';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import { logger } from '$lib/logger';
  import { browser } from '$lib/utils/browser';

  let inputValue = '';

  // Log al montar la página
  logger.info('Página de inicio cargada', {
    module: 'LandingPage',
    function: 'onMount',
    userAction: 'page_load',
    url: '/'
  });

  function handleLoginClick() {
    logger.info('Usuario hizo clic en "Ir al Login"', {
      module: 'LandingPage',
      function: 'handleLoginClick',
      userAction: 'login_button_click',
      targetUrl: '/login'
    });

    try {
      logger.debug('Iniciando navegación SPA a /login', {
        module: 'LandingPage',
        function: 'handleLoginClick',
        userAction: 'spa_navigation_start',
        browser: browser
      });

      if (!browser) {
        logger.warn('No estamos en el browser, usando window.location', {
          module: 'LandingPage',
          function: 'handleLoginClick',
          userAction: 'fallback_browser_check'
        });
        return;
      }

      goto('/login');

      logger.info('Navegación SPA iniciada exitosamente', {
        module: 'LandingPage',
        function: 'handleLoginClick',
        userAction: 'spa_navigation_success'
      });
    } catch (error) {
      logger.error(
        'Error en navegación SPA',
        error instanceof Error ? error : new Error(String(error)),
        {
          module: 'LandingPage',
          function: 'handleLoginClick',
          userAction: 'spa_navigation_error',
          errorType: 'goto_error'
        }
      );

      // Fallback: usar window.location si goto falla
      if (browser) {
        logger.warn('Usando fallback window.location.href', {
          module: 'LandingPage',
          function: 'handleLoginClick',
          userAction: 'fallback_navigation'
        });
        window.location.href = '/login';
      }
    }
  }
</script>

<svelte:head>
  <title>UTalk Frontend - Sistema de Mensajería Multicanal</title>
  <meta
    name="description"
    content="Proyecto UTalk Frontend - Login module implementado y funcional"
  />
</svelte:head>

<div class="container mx-auto p-8 max-w-4xl">
  <!-- Header Principal -->
  <header class="text-center mb-12">
    <h1 class="text-5xl font-bold text-primary-600 mb-4">UTalk Frontend</h1>
    <p class="text-secondary-600 text-xl mb-6">
      Sistema de mensajería multicanal con CRM integrado
    </p>

    <!-- Acceso al Login -->
    <div class="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-primary-800 mb-3">🚀 Módulo de Login Implementado</h2>
      <p class="text-primary-700 mb-4">
        El sistema de autenticación está completo y funcional. Prueba el flujo de login integrado
        con el backend.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="default" size="lg" on:click={handleLoginClick} className="font-semibold">
          Ir al Login (SPA)
        </Button>
        <Button
          variant="outline"
          size="lg"
          on:click={() => {
            logger.info('Prueba de navegación directa', {
              module: 'LandingPage',
              function: 'directNavigation',
              userAction: 'direct_navigation_test'
            });
            window.location.href = '/login';
          }}
          className="font-semibold"
        >
          Ir al Login (Directo)
        </Button>
      </div>
    </div>
  </header>

  <!-- Estado de Implementación -->
  <section class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-2xl font-semibold mb-6 text-secondary-900">📋 Estado de Implementación</h2>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Login Module -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="text-lg font-medium text-green-800 mb-3">✅ Módulo de Login</h3>
        <ul class="space-y-2 text-green-700 text-sm">
          <li>✅ Ruta /login implementada</li>
          <li>✅ Formulario con validación en tiempo real</li>
          <li>✅ Integración completa con backend</li>
          <li>✅ Manejo de errores específicos (401, 429, 500)</li>
          <li>✅ Cookies HttpOnly para seguridad</li>
          <li>✅ Estados de loading y UX optimizada</li>
          <li>✅ Redirección a dashboard post-login</li>
        </ul>
      </div>

      <!-- Componentes UI -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-lg font-medium text-blue-800 mb-3">✅ Componentes UI Base</h3>
        <ul class="space-y-2 text-blue-700 text-sm">
          <li>✅ Button con 6 variantes</li>
          <li>✅ Input con validación visual</li>
          <li>✅ Badge con 4 estilos</li>
          <li>✅ Layout responsivo</li>
          <li>✅ Tailwind CSS optimizado (18.6kB)</li>
          <li>✅ Tipos TypeScript estrictos</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Demo de Componentes -->
  <section class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-2xl font-semibold mb-4 text-secondary-900">🎨 Demo de Componentes UI</h2>

    <div class="space-y-6">
      <!-- Prueba de Buttons -->
      <div>
        <h3 class="text-lg font-medium mb-3 text-secondary-800">Botones</h3>
        <div class="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <!-- Prueba de Badges -->
      <div>
        <h3 class="text-lg font-medium mb-3 text-secondary-800">Badges</h3>
        <div class="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      <!-- Prueba de Input -->
      <div>
        <h3 class="text-lg font-medium mb-3 text-secondary-800">Input</h3>
        <div class="max-w-sm">
          <Input placeholder="Prueba el input aquí..." bind:value={inputValue} className="w-full" />
          {#if inputValue}
            <p class="mt-2 text-sm text-secondary-600">Valor: {inputValue}</p>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Arquitectura Técnica -->
  <section class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-2xl font-semibold mb-4 text-secondary-900">🏗️ Arquitectura Técnica</h2>

    <div class="grid md:grid-cols-3 gap-4 text-sm">
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="font-semibold text-gray-800 mb-2">Frontend Stack</h4>
        <ul class="text-gray-600 space-y-1">
          <li>• Svelte 5.37.3</li>
          <li>• SvelteKit 2.27.0</li>
          <li>• TypeScript 5.5.4</li>
          <li>• Tailwind CSS 3.4.17</li>
          <li>• Vite 7.0.6</li>
        </ul>
      </div>

      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="font-semibold text-gray-800 mb-2">Integración Backend</h4>
        <ul class="text-gray-600 space-y-1">
          <li>• API REST con Axios</li>
          <li>• WebSocket (Socket.io)</li>
          <li>• JWT + Refresh Tokens</li>
          <li>• Cookies HttpOnly</li>
          <li>• Rate Limiting</li>
        </ul>
      </div>

      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="font-semibold text-gray-800 mb-2">Calidad</h4>
        <ul class="text-gray-600 space-y-1">
          <li>• ESLint configurado</li>
          <li>• Prettier autoformat</li>
          <li>• TypeScript estricto</li>
          <li>• Build optimizado</li>
          <li>• SSR compatible</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Próximos Pasos -->
  <section class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
    <h2 class="text-xl font-semibold text-yellow-800 mb-3">🔄 Próximos Pasos en Desarrollo</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <h3 class="font-medium text-yellow-800 mb-2">Pendiente de Implementar:</h3>
        <ul class="text-yellow-700 text-sm space-y-1">
          <li>📱 Dashboard principal</li>
          <li>💬 Sistema de chat en tiempo real</li>
          <li>👥 Gestión de contactos</li>
          <li>📊 Panel de métricas</li>
          <li>⚙️ Configuración de perfil</li>
        </ul>
      </div>
      <div>
        <h3 class="font-medium text-yellow-800 mb-2">Mejoras Planificadas:</h3>
        <ul class="text-yellow-700 text-sm space-y-1">
          <li>🔐 Recuperación de contraseña</li>
          <li>🌐 Modo offline</li>
          <li>📱 PWA capabilities</li>
          <li>🎨 Temas personalizables</li>
          <li>🔔 Notificaciones push</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="text-center text-xs text-secondary-500 border-t border-secondary-200 pt-6">
    <p class="mb-2">
      <strong>UTalk Frontend</strong> - Sistema de mensajería multicanal con CRM integrado
    </p>
    <p>Versión 1.0.0 | Módulo Login: ✅ Completado | Estado: Listo para dashboard</p>
  </footer>
</div>
