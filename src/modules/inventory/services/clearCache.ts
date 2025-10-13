/**
 * Script para limpiar caché y forzar recarga del servicio de exportación
 */

// Función para limpiar caché del módulo de inventario
export const clearInventoryCache = () => {
  console.log('🧹 Limpiando caché del módulo de inventario...');
  
  // Limpiar caché del localStorage relacionado con inventario
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('inventory') || key.includes('platform') || key.includes('carga'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido: ${key}`);
  });
  
  // Limpiar sessionStorage
  sessionStorage.clear();
  
  // Forzar recarga del módulo
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('inventory') || cacheName.includes('platform')) {
          caches.delete(cacheName);
          console.log(`🗑️ Cache eliminado: ${cacheName}`);
        }
      });
    });
  }
  
  console.log('✅ Caché limpiado exitosamente');
};

// Función para verificar la versión del servicio
export const checkServiceVersion = () => {
  try {
    // Intentar importar dinámicamente el servicio
    import('./offlineExportService').then(module => {
      console.log('🔍 Verificando versión del servicio...');
      
      // Verificar si el servicio tiene la propiedad VERSION
      if (module.OfflineExportService && 'VERSION' in module.OfflineExportService) {
        console.log(`✅ Servicio cargado correctamente`);
      } else {
        console.log('⚠️ Servicio no tiene control de versiones');
      }
    }).catch(error => {
      console.error('❌ Error cargando el servicio:', error);
    });
  } catch (error) {
    console.error('❌ Error verificando servicio:', error);
  }
};

// Función para forzar recarga completa
export const forceReload = () => {
  console.log('🔄 Forzando recarga completa...');
  
  // Limpiar caché
  clearInventoryCache();
  
  // Recargar la página después de un breve delay
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};
