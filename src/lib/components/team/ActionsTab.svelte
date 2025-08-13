<!--
 * ActionsTab - Componente para mostrar las acciones disponibles para el agente
 * Incluye 3 acordeones: Acciones IA, Permisos y Accesos, Coaching
 -->

<script lang="ts">
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { Agent } from '$lib/types/team';
  import {
    AlertTriangle,
    Award,
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Copy,
    MessageSquare,
    Save,
    Settings,
    Shield,
    Sparkles
  } from 'lucide-svelte';

  // Props del componente
  export let agent: Agent;
  export let loading = false;

  // Estado local para los acordeones (todos abiertos por defecto)
  let aiActionsOpen = true;
  let permissionsOpen = true;
  let coachingOpen = true;

  // Estado local para loading de acciones IA
  let aiActionLoading = false;

  function handleAIAction(action: string) {
    aiActionLoading = true;
    // Simular llamada a la API
    setTimeout(() => {
      aiActionLoading = false;
      console.log(`Acción IA ejecutada: ${action} para ${agent.name}`);
    }, 2000);
  }

  function handlePermissionToggle(permission: string, enabled: boolean) {
    console.log(`Permiso ${permission} ${enabled ? 'activado' : 'desactivado'} para ${agent.name}`);
  }
</script>

<div class="p-4 space-y-4">
  {#if loading}
    <!-- Skeleton loading -->
    <div class="space-y-4">
      <div class="h-32 bg-muted rounded-lg animate-pulse"></div>
      <div class="h-48 bg-muted rounded-lg animate-pulse"></div>
      <div class="h-64 bg-muted rounded-lg animate-pulse"></div>
    </div>
  {:else}
    <!-- Acordeón: Acciones IA -->
    <div class="border border-gray-200 rounded-lg">
      <button
        type="button"
        class="w-full flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        on:click={() => (aiActionsOpen = !aiActionsOpen)}
      >
        <Sparkles class="w-5 h-5 text-muted-foreground" />
        <span class="font-medium">Acciones IA</span>
        {#if aiActionsOpen}
          <ChevronUp class="w-4 h-4 ml-auto text-muted-foreground" />
        {:else}
          <ChevronDown class="w-4 h-4 ml-auto text-muted-foreground" />
        {/if}
      </button>

      {#if aiActionsOpen}
        <div class="p-4 border-t border-gray-200 space-y-4">
          <!-- Botones de Acciones IA -->
          <div class="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={aiActionLoading}
              on:click={() => handleAIAction('sugerir-mejora')}
            >
              <Sparkles class="w-4 h-4 mr-2" />
              {aiActionLoading ? 'Sugiriendo mejora...' : 'Sugerir Mejora'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={aiActionLoading}
              on:click={() => handleAIAction('enviar-recordatorio')}
            >
              <Bell class="w-4 h-4 mr-2" />
              {aiActionLoading ? 'Enviando recordatorio...' : 'Enviar Recordatorio'}
            </Button>
          </div>

          <!-- Análisis Rápido -->
          <div class="space-y-3">
            <Button
              className="w-full"
              disabled={aiActionLoading}
              on:click={() => handleAIAction('analizar')}
            >
              <BarChart3 class="w-4 h-4 mr-2" />
              {aiActionLoading ? 'Analizando...' : 'Analizar'}
            </Button>

            <!-- Card de resultado -->
            <div class="bg-muted/50 rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">Puntuación IA</span>
                <span class="text-sm font-bold text-primary">85/100</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-primary h-2 rounded-full" style="width: 85%"></div>
              </div>
              <p class="text-xs text-muted-foreground">Confianza: 92%</p>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">Acciones rápidas</p>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Copy class="w-4 h-4 mr-1" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Save class="w-4 h-4 mr-1" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Acordeón: Permisos y Accesos -->
    <div class="border border-gray-200 rounded-lg">
      <button
        type="button"
        class="w-full flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        on:click={() => (permissionsOpen = !permissionsOpen)}
      >
        <Shield class="w-5 h-5 text-muted-foreground" />
        <span class="font-medium">Permisos y Accesos</span>
        {#if permissionsOpen}
          <ChevronUp class="w-4 h-4 ml-auto text-muted-foreground" />
        {:else}
          <ChevronDown class="w-4 h-4 ml-auto text-muted-foreground" />
        {/if}
      </button>

      {#if permissionsOpen}
        <div class="p-4 border-t border-gray-200 space-y-4">
          <!-- Grid de permisos -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Lectura -->
            <div class="border rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <BookOpen class="w-4 h-4 text-muted-foreground" />
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked
                    on:change={e =>
                      handlePermissionToggle('read', (e.target as HTMLInputElement).checked)}
                  />
                  <div
                    class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <p class="text-xs font-medium mb-1">Lectura</p>
              <p class="text-xs text-muted-foreground mb-2">Ver conversaciones y datos</p>
              <Badge variant="secondary" class="text-xs">Advanced</Badge>
            </div>

            <!-- Escritura -->
            <div class="border rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <MessageSquare class="w-4 h-4 text-muted-foreground" />
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked
                    on:change={e =>
                      handlePermissionToggle('write', (e.target as HTMLInputElement).checked)}
                  />
                  <div
                    class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <p class="text-xs font-medium mb-1">Escritura</p>
              <p class="text-xs text-muted-foreground mb-2">Enviar mensajes</p>
              <Badge variant="secondary" class="text-xs">Advanced</Badge>
            </div>

            <!-- Aprobación -->
            <div class="border rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <CheckCircle class="w-4 h-4 text-muted-foreground" />
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked
                    on:change={e =>
                      handlePermissionToggle('approve', (e.target as HTMLInputElement).checked)}
                  />
                  <div
                    class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <p class="text-xs font-medium mb-1">Aprobación</p>
              <p class="text-xs text-muted-foreground mb-2">Aprobar campañas</p>
              <Badge variant="secondary" class="text-xs">Intermediate</Badge>
            </div>

            <!-- Configuración -->
            <div class="border rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <Settings class="w-4 h-4 text-muted-foreground" />
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    on:change={e =>
                      handlePermissionToggle('configure', (e.target as HTMLInputElement).checked)}
                  />
                  <div
                    class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <p class="text-xs font-medium mb-1">Configuración</p>
              <p class="text-xs text-muted-foreground mb-2">Acceso al sistema</p>
              <Badge variant="secondary" class="text-xs">Basic</Badge>
            </div>
          </div>

          <!-- Estado general -->
          <div class="bg-muted/50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">Estado general</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked />
                <div
                  class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"
                ></div>
              </label>
            </div>
            <p class="text-xs text-muted-foreground">3 de 4 permisos activos</p>
          </div>

          <!-- Última modificación -->
          <div class="text-xs text-muted-foreground">Última modificación: 10/01/2024, 14:30</div>
        </div>
      {/if}
    </div>

    <!-- Acordeón: Coaching -->
    <div class="border border-gray-200 rounded-lg">
      <button
        type="button"
        class="w-full flex items-center gap-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        on:click={() => (coachingOpen = !coachingOpen)}
      >
        <Award class="w-5 h-5 text-muted-foreground" />
        <span class="font-medium">Coaching</span>
        {#if coachingOpen}
          <ChevronUp class="w-4 h-4 ml-auto text-muted-foreground" />
        {:else}
          <ChevronDown class="w-4 h-4 ml-auto text-muted-foreground" />
        {/if}
      </button>

      {#if coachingOpen}
        <div class="p-4 border-t border-gray-200 space-y-4">
          <!-- Fortalezas IA -->
          <div>
            <h4 class="text-sm font-medium mb-3">Fortalezas IA</h4>
            <div class="space-y-2">
              <div
                class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle class="w-4 h-4 text-green-600" />
                <span class="text-sm">Excelente tiempo de respuesta</span>
              </div>
              <div
                class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle class="w-4 h-4 text-green-600" />
                <span class="text-sm">Alta satisfacción del cliente</span>
              </div>
              <div
                class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle class="w-4 h-4 text-green-600" />
                <span class="text-sm">Comunicación empática y clara</span>
              </div>
            </div>
          </div>

          <!-- Áreas a mejorar -->
          <div>
            <h4 class="text-sm font-medium mb-3">Áreas a mejorar</h4>
            <div class="space-y-2">
              <div
                class="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <AlertTriangle class="w-4 h-4 text-orange-600" />
                <span class="text-sm">Técnicas de cierre de ventas</span>
              </div>
              <div
                class="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <AlertTriangle class="w-4 h-4 text-orange-600" />
                <span class="text-sm">Manejo de objeciones complejas</span>
              </div>
              <div
                class="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <AlertTriangle class="w-4 h-4 text-orange-600" />
                <span class="text-sm">Uso de plantillas predefinidas</span>
              </div>
            </div>
          </div>

          <!-- Plan sugerido 7 días -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium">Plan sugerido 7 días</h4>
              <span class="text-xs text-muted-foreground">1/3</span>
            </div>
            <div class="space-y-3">
              <div class="border rounded-lg p-3">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium">Revisar técnicas de cierre</span>
                  </div>
                  <Badge variant="destructive" class="text-xs">High</Badge>
                </div>
                <p class="text-xs text-muted-foreground mb-2">
                  Estudiar y practicar 3 técnicas de cierre de ventas efectivas
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">60 min</span>
                  <Button variant="outline" size="sm">
                    <Calendar class="w-3 h-3 mr-1" />
                    Agendar
                  </Button>
                </div>
              </div>

              <div class="border rounded-lg p-3">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-muted-foreground" />
                    <span class="text-sm font-medium">Roleplay con supervisor</span>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground mb-2">
                  Sesión práctica de manejo de objeciones con supervisor
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">45 min</span>
                  <Button variant="outline" size="sm">
                    <Calendar class="w-3 h-3 mr-1" />
                    Agendar
                  </Button>
                </div>
              </div>

              <div class="border rounded-lg p-3 bg-green-50 border-green-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-4 h-4 text-green-600" />
                    <span class="text-sm font-medium">Crear plantillas personalizadas</span>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground mb-2">
                  Desarrollar 5 plantillas para respuestas frecuentes
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">90 min</span>
                  <span class="text-xs text-green-600 font-medium">Completado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
