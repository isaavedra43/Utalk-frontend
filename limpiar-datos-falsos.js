/**
 * Script para limpiar TODOS los datos falsos del módulo de inventario
 * Ejecutar en la consola del navegador para limpiar LocalStorage
 */

(function limpiarDatosFalsos() {
  console.log('🧹 Iniciando limpieza de datos falsos del módulo de inventario...');
  
  try {
    // 1. Limpiar configuración del módulo de inventario
    const configKey = 'inventory_module_config';
    if (localStorage.getItem(configKey)) {
      localStorage.removeItem(configKey);
      console.log('✅ Configuración del módulo eliminada');
    }
    
    // 2. Limpiar plataformas locales
    const platformsKey = 'inventory_platforms';
    if (localStorage.getItem(platformsKey)) {
      localStorage.removeItem(platformsKey);
      console.log('✅ Plataformas locales eliminadas');
    }
    
    // 3. Limpiar proveedores locales
    const providersKey = 'inventory_providers';
    if (localStorage.getItem(providersKey)) {
      localStorage.removeItem(providersKey);
      console.log('✅ Proveedores locales eliminados');
    }
    
    // 4. Limpiar materiales locales
    const materialsKey = 'inventory_materials';
    if (localStorage.getItem(materialsKey)) {
      localStorage.removeItem(materialsKey);
      console.log('✅ Materiales locales eliminados');
    }
    
    // 5. Limpiar cualquier otra clave relacionada con inventario
    const keys = Object.keys(localStorage);
    const inventoryKeys = keys.filter(key => key.toLowerCase().includes('inventory'));
    
    inventoryKeys.forEach(key => {
      if (!['inventory_module_config', 'inventory_platforms', 'inventory_providers', 'inventory_materials'].includes(key)) {
        localStorage.removeItem(key);
        console.log(`✅ ${key} eliminado`);
      }
    });
    
    // 6. Limpiar IndexedDB si existe
    if (window.indexedDB) {
      const inventoryDBs = ['inventoryDB', 'inventory-db', 'inventory_db'];
      
      inventoryDBs.forEach(dbName => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        
        deleteRequest.onsuccess = function() {
          console.log(`✅ Base de datos IndexedDB "${dbName}" eliminada`);
        };
        
        deleteRequest.onerror = function() {
          console.log(`ℹ️ Base de datos IndexedDB "${dbName}" no existe`);
        };
        
        deleteRequest.onblocked = function() {
          console.log(`⚠️ Base de datos IndexedDB "${dbName}" bloqueada - Cerrar otras pestañas`);
        };
      });
    }
    
    console.log('');
    console.log('🎉 LIMPIEZA COMPLETADA');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Refrescar la página (F5)');
    console.log('2. Abrir módulo de inventario');
    console.log('3. Ir a "Configuración del Módulo"');
    console.log('4. Crear proveedores y materiales REALES');
    console.log('5. ¡Listo! Ahora puedes crear plataformas con datos reales');
    console.log('');
    console.log('✅ TODOS los datos ahora vendrán del backend');
    console.log('✅ NO habrá más datos falsos');
    console.log('');
    
    // Confirmar limpieza
    const remaining = Object.keys(localStorage).filter(key => key.toLowerCase().includes('inventory'));
    if (remaining.length === 0) {
      console.log('✅ VERIFICACIÓN: No quedan datos de inventario en LocalStorage');
    } else {
      console.log('⚠️ ADVERTENCIA: Todavía hay datos de inventario:');
      remaining.forEach(key => console.log(`   - ${key}`));
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    console.log('');
    console.log('💡 SOLUCIÓN ALTERNATIVA:');
    console.log('1. Abrir DevTools (F12)');
    console.log('2. Ir a Application → Storage');
    console.log('3. Clic derecho en LocalStorage');
    console.log('4. Clear');
    console.log('5. Refrescar página');
  }
})();

