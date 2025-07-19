// Script de prueba para verificar el scroll del CRM
// Ejecutar en la consola del navegador después de cargar la página del CRM

console.log('🔍 TESTING CRM SCROLL FUNCTIONALITY...');

// 1. Verificar que estamos en la página del CRM
const isCRM = window.location.pathname.includes('/crm');
console.log('📍 Current page:', {
  pathname: window.location.pathname,
  isCRM: isCRM
});

if (!isCRM) {
  console.log('❌ Not on CRM page. Navigate to /crm first.');
  console.log('💡 Instructions: Go to the CRM module and then run this script again.');
  return;
}

// 2. Verificar elementos del layout
const layoutElements = {
  mainContainer: document.querySelector('main'),
  crmContainer: document.querySelector('[class*="flex flex-col h-full"]'),
  scrollContainer: document.querySelector('[class*="overflow-y-auto"]'),
  tableContainer: document.querySelector('table'),
  kpiPanel: document.querySelector('[class*="KPIStatsPanel"]'),
  toolbar: document.querySelector('[class*="CRMToolbar"]')
};

console.log('🏗️ Layout elements found:', {
  mainContainer: !!layoutElements.mainContainer,
  crmContainer: !!layoutElements.crmContainer,
  scrollContainer: !!layoutElements.scrollContainer,
  tableContainer: !!layoutElements.tableContainer,
  kpiPanel: !!layoutElements.kpiPanel,
  toolbar: !!layoutElements.toolbar
});

// 3. Verificar dimensiones y scroll
const checkScrollFunctionality = () => {
  const scrollContainer = layoutElements.scrollContainer;
  const tableContainer = layoutElements.tableContainer;
  
  if (!scrollContainer) {
    console.log('❌ No scroll container found');
    return;
  }
  
  console.log('📏 Scroll container dimensions:', {
    scrollHeight: scrollContainer.scrollHeight,
    clientHeight: scrollContainer.clientHeight,
    scrollTop: scrollContainer.scrollTop,
    hasScroll: scrollContainer.scrollHeight > scrollContainer.clientHeight
  });
  
  if (tableContainer) {
    console.log('📊 Table dimensions:', {
      rows: tableContainer.querySelectorAll('tbody tr').length,
      scrollHeight: tableContainer.scrollHeight,
      clientHeight: tableContainer.clientHeight
    });
  }
  
  // 4. Verificar si hay contenido para hacer scroll
  const tableRows = document.querySelectorAll('tbody tr');
  console.log('📋 Table content:', {
    totalRows: tableRows.length,
    visibleRows: Array.from(tableRows).filter(row => {
      const rect = row.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }).length
  });
};

// 5. Función para simular scroll
const testScroll = () => {
  const scrollContainer = layoutElements.scrollContainer;
  if (!scrollContainer) {
    console.log('❌ Cannot test scroll - no scroll container found');
    return;
  }
  
  console.log('🔄 Testing scroll functionality...');
  
  // Scroll hacia abajo
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
  console.log('⬇️ Scrolled to bottom:', {
    scrollTop: scrollContainer.scrollTop,
    scrollHeight: scrollContainer.scrollHeight
  });
  
  // Scroll hacia arriba
  setTimeout(() => {
    scrollContainer.scrollTop = 0;
    console.log('⬆️ Scrolled to top:', {
      scrollTop: scrollContainer.scrollTop
    });
  }, 1000);
};

// 6. Función para verificar el estado actual
const checkCurrentState = () => {
  console.log('🔍 Current CRM state:');
  checkScrollFunctionality();
  
  // Verificar si hay filtros aplicados
  const filterElements = document.querySelectorAll('[class*="filter"], [class*="Filter"]');
  console.log('🔧 Active filters:', filterElements.length);
  
  // Verificar modo de vista
  const tableView = document.querySelector('table');
  const cardView = document.querySelector('[class*="grid"]');
  console.log('👁️ View mode:', {
    isTable: !!tableView,
    isCards: !!cardView
  });
};

// 7. Función para limpiar y recargar
const resetCRM = () => {
  console.log('🔄 Resetting CRM view...');
  
  // Limpiar filtros si existen
  const clearButtons = document.querySelectorAll('button');
  clearButtons.forEach(button => {
    if (button.textContent?.includes('Limpiar') || button.textContent?.includes('Clear')) {
      console.log('🧹 Found clear button, clicking...');
      button.click();
    }
  });
  
  // Recargar la página
  setTimeout(() => {
    console.log('🔄 Reloading page...');
    window.location.reload();
  }, 500);
};

// Ejecutar verificaciones
console.log('✅ Running CRM scroll tests...');
checkCurrentState();

// Exponer funciones para debugging
window.testCRMScroll = {
  checkScroll: checkScrollFunctionality,
  testScroll: testScroll,
  checkState: checkCurrentState,
  reset: resetCRM
};

console.log(`
📋 INSTRUCCIONES PARA PROBAR EL SCROLL:

1. ✅ Verifica que estés en la página del CRM (/crm)
2. 🔍 Revisa los logs arriba para ver el estado del layout
3. 🖱️ Intenta hacer scroll en el área de la tabla/tarjetas
4. 🔧 Si no funciona, ejecuta: testCRMScroll.checkScroll()
5. 🧪 Para probar scroll automático: testCRMScroll.testScroll()
6. 🔄 Para resetear: testCRMScroll.reset()

💡 Si el scroll no funciona:
- Verifica que la tabla tenga suficientes filas
- Asegúrate de que no haya filtros aplicados
- Comprueba que el contenedor tenga overflow-y-auto
- Verifica que la altura del contenedor sea correcta
`);

console.log('✅ CRM scroll test script loaded successfully!'); 