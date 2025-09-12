// Script para habilitar/deshabilitar el módulo de monitoreo
// Ejecutar en la consola del navegador (F12)

console.log('🔍 UTALK MONITORING CONTROL v2.0');
console.log('=================================');

// Configuración
const MONITORING_KEY = 'utalk_monitoring_enabled';

// Función para habilitar monitoreo
window.enableMonitoring = function() {
  localStorage.setItem(MONITORING_KEY, 'true');
  console.log('✅ Monitoreo habilitado. Recarga la página para ver la burbuja de monitoreo.');
  console.log('💡 La burbuja aparecerá en la esquina inferior derecha.');
  console.log('🎯 Haz clic en la burbuja para expandir el panel de monitoreo.');
};

// Función para deshabilitar monitoreo
window.disableMonitoring = function() {
  localStorage.removeItem(MONITORING_KEY);
  console.log('❌ Monitoreo deshabilitado. Recarga la página para ocultar la burbuja.');
};

// Función para verificar estado
window.checkMonitoring = function() {
  const isEnabled = localStorage.getItem(MONITORING_KEY) === 'true';
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('dev') ||
                window.location.hostname.includes('127.0.0.1');
  
  console.log('📊 Estado del monitoreo:');
  console.log('- Habilitado manualmente:', isEnabled ? '✅' : '❌');
  console.log('- Entorno de desarrollo:', isDev ? '✅' : '❌');
  console.log('- Estado final:', (isEnabled || isDev) ? '🟢 ACTIVO' : '🔴 INACTIVO');
  
  if (!isEnabled && !isDev) {
    console.log('💡 Para activar en producción: enableMonitoring()');
  }
  
  return isEnabled || isDev;
};

// Función para limpiar datos de monitoreo
window.clearMonitoringData = function() {
  window.dispatchEvent(new CustomEvent('monitoring:clear-data'));
  console.log('🧹 Datos de monitoreo limpiados.');
};

// Función para exportar datos de monitoreo
window.exportMonitoringData = function(format = 'excel') {
  const validFormats = ['excel', 'csv', 'txt'];
  if (!validFormats.includes(format)) {
    console.warn(`⚠️ Formato "${format}" no válido. Formatos disponibles:`, validFormats);
    return;
  }
  
  window.dispatchEvent(new CustomEvent('monitoring:export-data', { detail: { format } }));
  console.log(`📤 Exportando datos de monitoreo en formato ${format}...`);
};

// Función para configurar límites de datos
window.setMonitoringLimits = function(limits = {}) {
  const config = JSON.parse(localStorage.getItem('utalk_monitoring_config') || '{}');
  config.MAX_ENTRIES = { ...config.MAX_ENTRIES, ...limits };
  localStorage.setItem('utalk_monitoring_config', JSON.stringify(config));
  
  console.log('⚙️ Límites de monitoreo actualizados:', limits);
  console.log('🔄 Recarga la página para aplicar los cambios.');
};

// Función para ver estadísticas rápidas
window.getMonitoringStats = function() {
  const bubble = document.querySelector('[class*="monitoring-bubble"]');
  if (!bubble) {
    console.log('❌ El monitoreo no está activo o visible.');
    return null;
  }
  
  console.log('📈 Para ver estadísticas detalladas, abre el panel de monitoreo.');
  console.log('💡 Haz clic en la burbuja flotante para expandir.');
};

// Función para ayuda avanzada
window.monitoringHelp = function() {
  console.log('🆘 AYUDA DEL MÓDULO DE MONITOREO');
  console.log('===============================');
  console.log('');
  console.log('🎯 COMANDOS BÁSICOS:');
  console.log('- enableMonitoring()         - Activar monitoreo');
  console.log('- disableMonitoring()        - Desactivar monitoreo');
  console.log('- checkMonitoring()          - Ver estado actual');
  console.log('');
  console.log('📊 DATOS Y EXPORTACIÓN:');
  console.log('- clearMonitoringData()      - Limpiar todos los datos');
  console.log('- exportMonitoringData("excel") - Exportar a Excel');
  console.log('- exportMonitoringData("csv")   - Exportar a CSV');
  console.log('- exportMonitoringData("txt")   - Exportar a texto');
  console.log('');
  console.log('⚙️ CONFIGURACIÓN:');
  console.log('- setMonitoringLimits({apis: 500}) - Configurar límites');
  console.log('- getMonitoringStats()       - Ver estadísticas rápidas');
  console.log('');
  console.log('🔍 QUÉ MONITOREA:');
  console.log('- APIs: Todas las peticiones HTTP (GET, POST, PUT, DELETE)');
  console.log('- WebSockets: Conexiones, eventos, mensajes');
  console.log('- Logs: console.log, info, warn, error');
  console.log('- Errores: JavaScript errors, React errors');
  console.log('- Rendimiento: Tiempos de carga, memoria');
  console.log('- Estados: Cambios en stores de Zustand');
  console.log('');
  console.log('📱 INTERFAZ:');
  console.log('- Burbuja flotante en esquina inferior derecha');
  console.log('- Arrastrable por toda la pantalla');
  console.log('- Panel expandible con pestañas');
  console.log('- Filtros y búsqueda en tiempo real');
  console.log('');
  console.log('🚀 ¡Listo para debuggear!');
};

// Mostrar comandos disponibles
console.log('📋 Comandos disponibles:');
console.log('- enableMonitoring()     - Habilitar monitoreo');
console.log('- disableMonitoring()    - Deshabilitar monitoreo'); 
console.log('- checkMonitoring()      - Verificar estado');
console.log('- monitoringHelp()       - Ver ayuda completa');
console.log('');

// Mostrar estado actual
const isActive = window.checkMonitoring();

if (isActive) {
  console.log('');
  console.log('🎉 ¡El monitoreo está ACTIVO!');
  console.log('👀 Busca la burbuja flotante en la esquina inferior derecha.');
  console.log('🖱️ Haz clic para expandir el panel de monitoreo.');
} else {
  console.log('');
  console.log('💤 El monitoreo está INACTIVO.');
  console.log('🚀 Ejecuta enableMonitoring() para activarlo.');
}
