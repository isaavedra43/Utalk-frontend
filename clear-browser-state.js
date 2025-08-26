// Script para limpiar completamente el estado del navegador
// Ejecutar en la consola del navegador (F12)

console.log('🧹 Limpiando estado del navegador...');

// Limpiar localStorage
localStorage.clear();
console.log('✅ localStorage limpiado');

// Limpiar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpiado');

// Limpiar cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies limpiadas');

// Limpiar cache del navegador
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
  console.log('✅ Cache limpiado');
}

// Limpiar IndexedDB
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
    });
  });
  console.log('✅ IndexedDB limpiado');
}

// Limpiar Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
  console.log('✅ Service Workers limpiados');
}

// Recargar la página
console.log('🔄 Recargando página...');
setTimeout(() => {
  window.location.reload();
}, 1000);
