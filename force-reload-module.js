// Script para forzar la recarga completa del módulo de inventario
// Ejecutar en la consola del navegador

console.log('🔄 Forzando recarga completa del módulo de inventario...');

// 1. Limpiar todos los caches posibles
console.log('🧹 Limpiando caches...');

// localStorage
const inventoryKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('inventory') || key.includes('platform') || key.includes('carga') || key.includes('utalk'))) {
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

// 2. Forzar recarga de módulos
console.log('🔄 Forzando recarga de módulos...');

// Limpiar require cache si existe
if (typeof require !== 'undefined' && require.cache) {
  Object.keys(require.cache).forEach(key => {
    if (key.includes('inventory') || key.includes('offlineExportService') || key.includes('printService')) {
      delete require.cache[key];
      console.log(`🗑️ Módulo removido del cache: ${key}`);
    }
  });
}

// 3. Agregar timestamp a la URL para forzar recarga
const url = new URL(window.location.href);
url.searchParams.set('t', Date.now());
url.searchParams.set('reload', 'true');
window.history.replaceState({}, '', url.toString());

// 4. Mostrar información de debug
console.log('📊 Información de debug:');
console.log('  - User Agent:', navigator.userAgent);
console.log('  - URL actual:', window.location.href);
console.log('  - Timestamp:', new Date().toISOString());

// 5. Recargar la página
console.log('🔄 Recargando página en 2 segundos...');
setTimeout(() => {
  console.log('🚀 Ejecutando recarga...');
  window.location.reload(true);
}, 2000);

console.log('✅ Script de recarga ejecutado. La página se recargará automáticamente.');
