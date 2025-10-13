// Script para verificar que se esté usando la versión correcta del servicio
// Ejecutar en la consola del navegador después de cargar el módulo de inventario

console.log('🔍 Verificando versión del servicio de exportación...');

try {
  // Intentar acceder al servicio desde el contexto global
  const services = [
    'OfflineExportService',
    'PrintService',
    'PdfExportService'
  ];
  
  services.forEach(serviceName => {
    try {
      // Buscar en el contexto global
      const service = window[serviceName];
      if (service) {
        console.log(`✅ ${serviceName} encontrado en window:`, service);
        
        // Verificar si tiene VERSION
        if (service.VERSION) {
          console.log(`📋 ${serviceName} VERSION:`, service.VERSION);
        }
        
        // Verificar métodos
        if (service.exportToPDF) {
          console.log(`📄 ${serviceName} tiene método exportToPDF`);
        }
        if (service.printPDF) {
          console.log(`🖨️ ${serviceName} tiene método printPDF`);
        }
      } else {
        console.log(`❌ ${serviceName} NO encontrado en window`);
      }
    } catch (error) {
      console.log(`❌ Error verificando ${serviceName}:`, error.message);
    }
  });
  
  // Verificar imports dinámicos
  console.log('🔄 Verificando imports dinámicos...');
  
  // Verificar OfflineExportService
  import('./src/modules/inventory/services/offlineExportService.ts').then(module => {
    console.log('✅ OfflineExportService importado dinámicamente:', module);
    if (module.OfflineExportService && module.OfflineExportService.VERSION) {
      console.log('📋 OfflineExportService VERSION:', module.OfflineExportService.VERSION);
    }
  }).catch(error => {
    console.log('❌ Error importando OfflineExportService:', error.message);
  });
  
  // Verificar PrintService
  import('./src/modules/inventory/services/printService.ts').then(module => {
    console.log('✅ PrintService importado dinámicamente:', module);
    if (module.PrintService) {
      console.log('📋 PrintService disponible');
    }
  }).catch(error => {
    console.log('❌ Error importando PrintService:', error.message);
  });
  
  // Verificar PdfExportService
  import('./src/modules/inventory/services/pdfExportService.ts').then(module => {
    console.log('✅ PdfExportService importado dinámicamente:', module);
    if (module.PdfExportService && module.PdfExportService.VERSION) {
      console.log('📋 PdfExportService VERSION:', module.PdfExportService.VERSION);
    }
  }).catch(error => {
    console.log('❌ Error importando PdfExportService:', error.message);
  });
  
} catch (error) {
  console.error('❌ Error general en verificación:', error);
}

console.log('✅ Verificación completada. Revisa los logs arriba para confirmar qué servicio se está usando.');
