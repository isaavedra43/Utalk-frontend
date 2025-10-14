// Script para probar la información compacta en el PDF
// Ejecutar en la consola del navegador (F12)

console.log('📄 Probando información compacta en el PDF...');

// Limpiar caché
localStorage.clear();
sessionStorage.clear();

if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
    console.log('🗑️ Caches limpiados');
  });
}

// Agregar parámetros de debug
const url = new URL(window.location.href);
url.searchParams.set('compact_info', 'true');
url.searchParams.set('timestamp', Date.now());
window.history.replaceState({}, '', url.toString());

console.log('📊 Cambios aplicados:');
console.log('  ✅ Título de sección más pequeño (FONTS.normal en lugar de FONTS.heading)');
console.log('  ✅ Espaciado reducido (5mm en lugar de 8mm)');
console.log('  ✅ Texto más pequeño (FONTS.small)');
console.log('  ✅ Altura de línea reducida (4mm en lugar de 6mm)');
console.log('  ✅ Información agrupada en menos líneas');
console.log('  ✅ Formato: "Campo: Valor | Campo2: Valor2"');

console.log('🔄 Recargando página en 2 segundos...');
setTimeout(() => {
  console.log('🚀 Ejecutando recarga...');
  window.location.reload(true);
}, 2000);

console.log('✅ La sección "INFORMACIÓN DE LA CARGA" ahora debería ser más compacta y ocupar menos espacio.');
