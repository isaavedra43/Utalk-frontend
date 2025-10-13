// Script para forzar el uso del servicio PDF correcto
// Ejecutar en la consola del navegador

console.log('🔄 Forzando recarga del servicio PDF correcto...');

// 1. Limpiar todos los caches
console.log('🧹 Limpiando caches...');

// localStorage
const inventoryKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('inventory') || key.includes('platform') || key.includes('carga') || key.includes('pdf'))) {
    inventoryKeys.push(key);
  }
}

inventoryKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ localStorage removido: ${key}`);
});

// sessionStorage
sessionStorage.clear();
console.log('🗑️ sessionStorage limpiado');

// Service Worker caches
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log(`🗑️ Cache eliminado: ${name}`);
    });
  });
}

// 2. Verificar que se use PDFReportService
console.log('🔍 Verificando servicios PDF...');

// Buscar en el contexto global
const services = ['PDFReportService', 'OfflineExportService', 'PrintService', 'PdfExportService'];
services.forEach(serviceName => {
  try {
    const service = window[serviceName];
    if (service) {
      console.log(`✅ ${serviceName} encontrado en window:`, service);
    } else {
      console.log(`❌ ${serviceName} NO encontrado en window`);
    }
  } catch (error) {
    console.log(`❌ Error verificando ${serviceName}:`, error.message);
  }
});

// 3. Forzar recarga de módulos
console.log('🔄 Forzando recarga de módulos...');

// Limpiar require cache si existe
if (typeof require !== 'undefined' && require.cache) {
  Object.keys(require.cache).forEach(key => {
    if (key.includes('inventory') || key.includes('pdf') || key.includes('export')) {
      delete require.cache[key];
      console.log(`🗑️ Módulo removido del cache: ${key}`);
    }
  });
}

// 4. Agregar timestamp a la URL
const url = new URL(window.location.href);
url.searchParams.set('pdf_reload', Date.now());
url.searchParams.set('force_service', 'pdfReportService');
window.history.replaceState({}, '', url.toString());

// 5. Mostrar información de debug
console.log('📊 Información de debug:');
console.log('  - User Agent:', navigator.userAgent);
console.log('  - URL actual:', window.location.href);
console.log('  - Timestamp:', new Date().toISOString());
console.log('  - Servicio objetivo: PDFReportService (con nuevo diseño 3 columnas)');

// 6. Recargar la página
console.log('🔄 Recargando página en 3 segundos...');
setTimeout(() => {
  console.log('🚀 Ejecutando recarga...');
  window.location.reload(true);
}, 3000);

console.log('✅ Script ejecutado. El servicio PDFReportService debería cargar con el nuevo diseño 3 columnas.');
