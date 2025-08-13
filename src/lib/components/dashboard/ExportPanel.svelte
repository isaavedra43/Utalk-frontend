<!--
 * ExportPanel Component - UTalk Dashboard
 * Panel para exportar datos y generar reportes del dashboard
 * 
 * Features:
 * - Exportación a PDF, Excel, CSV
 * - Reportes programados
 * - Configuración de contenido a exportar
 * - Previsualización de reportes
 * - Envío automático por email
 -->

<script lang="ts">
  import { Calendar, Download, FileText, Mail, X } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let isOpen = false;

  let selectedFormat = 'pdf';
  let selectedSections = new Set(['kpis', 'activity', 'agents', 'sentiment']);
  let includeCharts = true;
  let includeRawData = false;
  let scheduledReports = false;
  let emailRecipients = '';

  const formats = [
    { id: 'pdf', label: 'PDF', description: 'Documento completo con gráficos' },
    { id: 'excel', label: 'Excel', description: 'Datos estructurados en hojas' },
    { id: 'csv', label: 'CSV', description: 'Datos tabulares simples' }
  ];

  const sections = [
    { id: 'kpis', label: 'KPIs principales', description: 'Métricas clave del período' },
    { id: 'activity', label: 'Actividad por horas', description: 'Gráfico de mensajes por hora' },
    { id: 'agents', label: 'Ranking de agentes', description: 'Rendimiento del equipo' },
    { id: 'sentiment', label: 'Análisis de sentimiento', description: 'Distribución por canales' },
    { id: 'topics', label: 'Temas emergentes', description: 'Insights de IA y alertas' },
    { id: 'calendar', label: 'Calendario de actividad', description: 'Vista mensual' }
  ];

  function toggleSection(sectionId: string) {
    if (selectedSections.has(sectionId)) {
      selectedSections.delete(sectionId);
    } else {
      selectedSections.add(sectionId);
    }
    selectedSections = new Set(selectedSections);
  }

  function selectAllSections() {
    selectedSections = new Set(sections.map(s => s.id));
  }

  function clearAllSections() {
    selectedSections = new Set();
  }

  async function generateReport() {
    const exportConfig = {
      format: selectedFormat,
      sections: Array.from(selectedSections),
      includeCharts,
      includeRawData,
      timestamp: new Date().toISOString()
    };

    // Simular generación de reporte
    dispatch('export', exportConfig);

    // Simular descarga
    const filename = `UTalk_Dashboard_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
    console.log(`Generando reporte: ${filename}`);

    // Cerrar panel
    isOpen = false;
  }

  function scheduleReport() {
    const scheduleConfig = {
      format: selectedFormat,
      sections: Array.from(selectedSections),
      includeCharts,
      includeRawData,
      recipients: emailRecipients.split(',').map(email => email.trim()),
      frequency: 'weekly' // Por defecto semanal
    };

    dispatch('schedule', scheduleConfig);
    console.log('Reporte programado:', scheduleConfig);
    isOpen = false;
  }
</script>

{#if isOpen}
  <!-- Overlay -->
  <button
    type="button"
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
    on:click={() => (isOpen = false)}
    on:keydown={e => e.key === 'Escape' && (isOpen = false)}
    aria-label="Cerrar panel de exportación"
  ></button>

  <!-- Panel de exportación -->
  <div
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-xl z-50 max-h-[90vh] overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <Download class="w-5 h-5 text-gray-600" />
        <h3 class="text-lg font-semibold text-gray-900">Exportar Dashboard</h3>
      </div>
      <button
        type="button"
        on:click={() => (isOpen = false)}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X class="w-4 h-4 text-gray-500" />
      </button>
    </div>

    <!-- Contenido -->
    <div class="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
      <!-- Formato -->
      <div>
        <div class="block text-sm font-medium text-gray-900 mb-3">Formato de exportación</div>
        <div class="grid grid-cols-3 gap-3">
          {#each formats as format}
            <label class="relative cursor-pointer">
              <input type="radio" bind:group={selectedFormat} value={format.id} class="sr-only" />
              <div
                class="p-4 border-2 rounded-lg transition-all {selectedFormat === format.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'}"
              >
                <div class="text-sm font-medium text-gray-900 mb-1">{format.label}</div>
                <div class="text-xs text-gray-500">{format.description}</div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Secciones a incluir -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-medium text-gray-900">Contenido a incluir</div>
          <div class="flex gap-1">
            <button
              type="button"
              on:click={selectAllSections}
              class="text-xs text-blue-600 hover:text-blue-700"
            >
              Todos
            </button>
            <span class="text-xs text-gray-400">•</span>
            <button
              type="button"
              on:click={clearAllSections}
              class="text-xs text-gray-600 hover:text-gray-700"
            >
              Ninguno
            </button>
          </div>
        </div>

        <div class="space-y-2">
          {#each sections as section}
            <label class="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSections.has(section.id)}
                on:change={() => toggleSection(section.id)}
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900">{section.label}</div>
                <div class="text-xs text-gray-500">{section.description}</div>
              </div>
            </label>
          {/each}
        </div>
      </div>

      <!-- Opciones avanzadas -->
      <div>
        <div class="block text-sm font-medium text-gray-900 mb-3">Opciones avanzadas</div>
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={includeCharts}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-3 text-sm text-gray-700">Incluir gráficos e imágenes</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={includeRawData}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-3 text-sm text-gray-700">Incluir datos sin procesar</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={scheduledReports}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-3 text-sm text-gray-700">Configurar reporte programado</span>
          </label>
        </div>
      </div>

      <!-- Configuración de programación -->
      {#if scheduledReports}
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 class="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            Programar reportes automáticos
          </h4>

          <div class="space-y-3">
            <div>
              <label for="frequency-select" class="block text-xs font-medium text-blue-800 mb-1"
                >Frecuencia</label
              >
              <select
                id="frequency-select"
                class="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Diario</option>
                <option value="weekly" selected>Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label for="email-recipients" class="block text-xs font-medium text-blue-800 mb-1"
                >Destinatarios (emails separados por comas)</label
              >
              <input
                id="email-recipients"
                type="text"
                bind:value={emailRecipients}
                placeholder="admin@empresa.com, manager@empresa.com"
                class="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      {/if}

      <!-- Previsualización -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
          <FileText class="w-4 h-4" />
          Previsualización del reporte
        </h4>
        <div class="text-xs text-gray-600 space-y-1">
          <div>Formato: {formats.find(f => f.id === selectedFormat)?.label}</div>
          <div>Secciones: {selectedSections.size} seleccionadas</div>
          <div>Incluye gráficos: {includeCharts ? 'Sí' : 'No'}</div>
          <div>Datos sin procesar: {includeRawData ? 'Sí' : 'No'}</div>
          {#if scheduledReports}
            <div>Programado: Semanal a {emailRecipients || 'sin destinatarios'}</div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <div class="p-6 bg-gray-50 border-t border-gray-200">
      <div class="flex gap-3">
        <button
          type="button"
          on:click={() => (isOpen = false)}
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>

        {#if scheduledReports}
          <button
            type="button"
            on:click={scheduleReport}
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Mail class="w-4 h-4" />
            Programar reporte
          </button>
        {:else}
          <button
            type="button"
            on:click={generateReport}
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            disabled={selectedSections.size === 0}
          >
            <Download class="w-4 h-4" />
            Descargar reporte
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
