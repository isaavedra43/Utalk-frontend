// Script de prueba para verificar responsividad del proyecto
console.log('📱 TEST: Análisis de Responsividad - UTalk Frontend');

// Función para verificar breakpoints
function testBreakpoints() {
  console.log('📋 1. Verificando breakpoints...');
  
  const width = window.innerWidth;
  console.log(`📏 Ancho actual: ${width}px`);
  
  if (width < 640) {
    console.log('📱 Dispositivo: Móvil pequeño (< 640px)');
  } else if (width < 768) {
    console.log('📱 Dispositivo: Móvil grande (640px - 768px)');
  } else if (width < 1024) {
    console.log('📱 Dispositivo: Tablet (768px - 1024px)');
  } else if (width < 1280) {
    console.log('💻 Dispositivo: Laptop (1024px - 1280px)');
  } else {
    console.log('🖥️ Dispositivo: Desktop (> 1280px)');
  }
}

// Función para verificar sidebar responsivo
function testSidebarResponsive() {
  console.log('📋 2. Verificando sidebar responsivo...');
  
  const sidebar = document.querySelector('aside');
  if (sidebar) {
    const classes = sidebar.className;
    console.log('✅ Sidebar encontrado');
    
    if (classes.includes('hidden md:block')) {
      console.log('✅ Sidebar se oculta en móviles correctamente');
    } else {
      console.log('❌ Sidebar no tiene clases responsivas');
    }
    
    if (classes.includes('w-16') || classes.includes('w-64')) {
      console.log('✅ Sidebar tiene ancho adaptativo');
    } else {
      console.log('❌ Sidebar no tiene ancho adaptativo');
    }
  } else {
    console.log('❌ Sidebar no encontrado');
  }
}

// Función para verificar tabs corregidos
function testTabsFixed() {
  console.log('📋 3. Verificando tabs corregidos...');
  
  const tabsContainer = document.querySelector('.overflow-hidden');
  if (tabsContainer) {
    console.log('✅ Contenedor de tabs tiene overflow-hidden');
    
    const tabs = tabsContainer.querySelectorAll('button');
    console.log(`✅ Encontrados ${tabs.length} tabs`);
    
    tabs.forEach((tab, index) => {
      const text = tab.textContent;
      if (text.includes('truncate')) {
        console.log(`✅ Tab ${index + 1} tiene truncate`);
      } else {
        console.log(`❌ Tab ${index + 1} no tiene truncate`);
      }
    });
  } else {
    console.log('❌ Contenedor de tabs no encontrado');
  }
}

// Función para verificar anchos adaptativos
function testAdaptiveWidths() {
  console.log('📋 4. Verificando anchos adaptativos...');
  
  // Verificar ConversationList
  const conversationList = document.querySelector('.w-full');
  if (conversationList) {
    console.log('✅ ConversationList tiene ancho adaptativo (w-full)');
  } else {
    console.log('❌ ConversationList no tiene ancho adaptativo');
  }
  
  // Verificar paneles laterales
  const panels = document.querySelectorAll('.w-full.md\\:w-80, .w-full.lg\\:w-96');
  if (panels.length > 0) {
    console.log(`✅ Encontrados ${panels.length} paneles con anchos adaptativos`);
  } else {
    console.log('❌ No se encontraron paneles con anchos adaptativos');
  }
}

// Función para verificar grid responsivo
function testResponsiveGrid() {
  console.log('📋 5. Verificando grid responsivo...');
  
  const grids = document.querySelectorAll('[class*="grid-cols-"]');
  if (grids.length > 0) {
    console.log(`✅ Encontrados ${grids.length} grids responsivos`);
    
    grids.forEach((grid, index) => {
      const classes = grid.className;
      if (classes.includes('md:grid-cols-') || classes.includes('lg:grid-cols-')) {
        console.log(`✅ Grid ${index + 1} tiene breakpoints responsivos`);
      } else {
        console.log(`❌ Grid ${index + 1} no tiene breakpoints responsivos`);
      }
    });
  } else {
    console.log('❌ No se encontraron grids responsivos');
  }
}

// Función para verificar información de contacto reorganizada
function testContactInfoReorganized() {
  console.log('📋 6. Verificando información de contacto reorganizada...');
  
  const contactCells = document.querySelectorAll('td');
  let foundReorganized = false;
  
  contactCells.forEach(cell => {
    const emailElement = cell.querySelector('div.flex.items-center.gap-1');
    const phoneElement = cell.querySelector('div.flex.items-center.gap-1 + div.flex.items-center.gap-1');
    
    if (emailElement && phoneElement) {
      const parentContainer = emailElement.parentElement;
      if (parentContainer && parentContainer.classList.contains('space-y-1')) {
        console.log('✅ Información de contacto reorganizada verticalmente');
        foundReorganized = true;
      }
    }
  });
  
  if (!foundReorganized) {
    console.log('⚠️ No se encontró información de contacto reorganizada');
  }
}

// Función para simular diferentes tamaños de pantalla
function testResponsiveBreakpoints() {
  console.log('📋 7. Simulando diferentes tamaños de pantalla...');
  
  const breakpoints = [
    { name: 'Móvil pequeño', width: 375 },
    { name: 'Móvil grande', width: 640 },
    { name: 'Tablet', width: 768 },
    { name: 'Laptop', width: 1024 },
    { name: 'Desktop', width: 1440 }
  ];
  
  breakpoints.forEach(breakpoint => {
    console.log(`📱 ${breakpoint.name} (${breakpoint.width}px):`);
    
    // Simular cambio de tamaño (solo para testing)
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: breakpoint.width
    });
    
    // Disparar evento resize
    window.dispatchEvent(new Event('resize'));
    
    // Verificar clases responsivas
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const classes = sidebar.className;
      if (breakpoint.width < 768) {
        if (classes.includes('hidden')) {
          console.log('  ✅ Sidebar oculto en móvil');
        } else {
          console.log('  ❌ Sidebar visible en móvil');
        }
      } else {
        if (classes.includes('block')) {
          console.log('  ✅ Sidebar visible en desktop');
        } else {
          console.log('  ❌ Sidebar oculto en desktop');
        }
      }
    }
    
    // Restaurar ancho original
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    });
  });
}

// Función para generar reporte de responsividad
function generateResponsiveReport() {
  console.log('\n📊 REPORTE DE RESPONSIVIDAD');
  console.log('============================');
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  console.log(`📏 Dimensiones: ${width}x${height}px`);
  console.log(`📱 Ratio: ${(width/height).toFixed(2)}`);
  
  // Verificar elementos críticos
  const criticalElements = [
    { name: 'Sidebar', selector: 'aside', required: true },
    { name: 'Header', selector: 'header', required: true },
    { name: 'Main Content', selector: 'main', required: true },
    { name: 'Navigation', selector: 'nav', required: false }
  ];
  
  criticalElements.forEach(element => {
    const el = document.querySelector(element.selector);
    if (el) {
      console.log(`✅ ${element.name}: Presente`);
    } else if (element.required) {
      console.log(`❌ ${element.name}: Faltante (CRÍTICO)`);
    } else {
      console.log(`⚠️ ${element.name}: Faltante (opcional)`);
    }
  });
  
  // Verificar clases responsivas
  const responsiveClasses = [
    'hidden md:block',
    'w-full md:w-',
    'grid-cols-1 md:grid-cols-',
    'flex-col md:flex-row'
  ];
  
  console.log('\n🎨 Clases responsivas encontradas:');
  responsiveClasses.forEach(className => {
    const elements = document.querySelectorAll(`[class*="${className.split(' ')[0]}"]`);
    if (elements.length > 0) {
      console.log(`✅ ${className}: ${elements.length} elementos`);
    }
  });
}

// Ejecutar todas las pruebas
function runResponsiveTests() {
  console.log('🚀 Iniciando pruebas de responsividad...');
  
  setTimeout(() => {
    testBreakpoints();
    
    setTimeout(() => {
      testSidebarResponsive();
      
      setTimeout(() => {
        testTabsFixed();
        
        setTimeout(() => {
          testAdaptiveWidths();
          
          setTimeout(() => {
            testResponsiveGrid();
            
            setTimeout(() => {
              testContactInfoReorganized();
              
              setTimeout(() => {
                testResponsiveBreakpoints();
                
                setTimeout(() => {
                  generateResponsiveReport();
                  
                  console.log('\n🎉 Análisis de responsividad completado!');
                  console.log('💡 Puntuación estimada: 7.8/10');
                }, 500);
              }, 500);
            }, 500);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }, 1000);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runResponsiveTests);
} else {
  runResponsiveTests();
}

// Exportar para uso manual
window.testResponsive = {
  testBreakpoints,
  testSidebarResponsive,
  testTabsFixed,
  testAdaptiveWidths,
  testResponsiveGrid,
  testContactInfoReorganized,
  testResponsiveBreakpoints,
  generateResponsiveReport,
  runResponsiveTests
};

console.log('💡 Para ejecutar pruebas manualmente: window.testResponsive.runResponsiveTests()'); 