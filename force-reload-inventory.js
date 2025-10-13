/**
 * Script para forzar la recarga del módulo de inventario
 * Ejecutar en la consola del navegador
 */

console.log('🚀 Forzando recarga del módulo de inventario...');

// 1. Limpiar localStorage
const inventoryKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('inventory') || key.includes('platform') || key.includes('carga'))) {
    inventoryKeys.push(key);
  }
}

inventoryKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ Removido del localStorage: ${key}`);
});

// 2. Limpiar sessionStorage
sessionStorage.clear();
console.log('🗑️ sessionStorage limpiado');

// 3. Limpiar caché del navegador
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName.includes('inventory') || cacheName.includes('platform')) {
        caches.delete(cacheName);
        console.log(`🗑️ Cache eliminado: ${cacheName}`);
      }
    });
  });
}

// 4. Forzar recarga de la página
console.log('🔄 Recargando página en 2 segundos...');
setTimeout(() => {
  window.location.reload(true); // true = recarga forzada
}, 2000);
