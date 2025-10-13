// Script para limpiar completamente el caché del navegador
// Ejecutar en la consola del navegador (F12)

console.log('🧹 Limpiando completamente el caché del navegador...');

// 1. Limpiar localStorage
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('inventory') || key.includes('platform') || key.includes('carga')) {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido localStorage: ${key}`);
  }
});

// 2. Limpiar sessionStorage
sessionStorage.clear();
console.log('🗑️ sessionStorage limpiado');

// 3. Limpiar Service Worker cache
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      if (name.includes('inventory') || name.includes('platform') || name.includes('utalk')) {
        caches.delete(name);
        console.log(`🗑️ Cache eliminado: ${name}`);
      }
    });
  });
}

// 4. Forzar recarga de todos los módulos
console.log('🔄 Forzando recarga de módulos...');
window.location.reload(true);

// También agregar un timestamp a la URL para forzar recarga
const url = new URL(window.location.href);
url.searchParams.set('t', Date.now());
window.history.replaceState({}, '', url.toString());

console.log('✅ Caché limpiado. La página se recargará automáticamente.');
