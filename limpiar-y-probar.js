/**
 * Script para limpiar estado y probar la aplicación
 * Ejecutar en la consola del navegador
 */

console.log('🧹 Limpiando estado de la aplicación...');

// Limpiar todo el estado
localStorage.clear();
sessionStorage.clear();

// Limpiar cookies
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log('✅ Estado limpiado');
console.log('🔄 Recargando página...');

// Recargar la página
window.location.reload();
