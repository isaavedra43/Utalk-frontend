/**
 * Script para limpiar completamente el estado de autenticación
 * Ejecutar en la consola del navegador cuando hay problemas de autenticación
 */

console.log('🧹 Limpiando estado de autenticación...');

// Limpiar localStorage
localStorage.clear();

// Limpiar sessionStorage
sessionStorage.clear();

// Limpiar cookies
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Limpiar cache del navegador
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

// Disparar evento de limpieza
window.dispatchEvent(new CustomEvent('auth:force-clean', {
  detail: { timestamp: Date.now() }
}));

console.log('✅ Estado de autenticación limpiado completamente');
console.log('🔄 Recargando página...');

// Recargar la página después de 1 segundo
setTimeout(() => {
  window.location.reload();
}, 1000);
