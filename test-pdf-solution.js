// Script para probar la solución del PDF con diseño de 3 columnas
// Ejecutar en la consola del navegador (F12)

console.log('🧪 Probando solución del PDF con diseño de 3 columnas...');

// 1. Limpiar caché completo
console.log('🧹 Limpiando caché...');
localStorage.clear();
sessionStorage.clear();

if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
    console.log('🗑️ Caches del navegador limpiados');
  });
}

// 2. Verificar que solo existe PDFReportService
console.log('🔍 Verificando servicios disponibles...');
const services = ['PDFReportService', 'OfflineExportService', 'PrintService', 'PdfExportService'];
services.forEach(serviceName => {
  try {
    const service = window[serviceName];
    if (service) {
      console.log(`✅ ${serviceName} encontrado:`, service);
    } else {
      console.log(`❌ ${serviceName} NO encontrado (correcto si era el antiguo)`);
    }
  } catch (error) {
    console.log(`❌ Error verificando ${serviceName}:`, error.message);
  }
});

// 3. Agregar parámetros de debug
const url = new URL(window.location.href);
url.searchParams.set('debug_pdf', 'true');
url.searchParams.set('timestamp', Date.now());
window.history.replaceState({}, '', url.toString());

// 4. Información de debug
console.log('📊 Información de debug:');
console.log('  - Servicio correcto: PDFReportService');
console.log('  - Diseño: 3 columnas horizontales');
console.log('  - Lógica: Columna Material oculta si no hay materiales especificados');
console.log('  - Título esperado: "DETALLE DE PIEZAS - DISEÑO 3 COLUMNAS"');
console.log('  - Layout esperado:');
console.log('    ┌─────────────┬─────────────┬─────────────┐');
console.log('    │ Parte 1     │ Parte 2     │ Parte 3     │');
console.log('    │ (67 reg.)   │ (67 reg.)   │ (67 reg.)   │');
console.log('    ├─────────────┼─────────────┼─────────────┤');
console.log('    │ No.|Long|Met│ No.|Long|Met│ No.|Long|Met│');
console.log('    │  1 |1.0|0.3│ 68 |1.0|0.3│135|1.0|0.3│');
console.log('    └─────────────┴─────────────┴─────────────┘');

// 5. Recargar página
console.log('🔄 Recargando página en 2 segundos...');
setTimeout(() => {
  console.log('🚀 Ejecutando recarga...');
  window.location.reload(true);
}, 2000);

console.log('✅ Script ejecutado. El PDF ahora debería mostrar el diseño de 3 columnas horizontales.');
