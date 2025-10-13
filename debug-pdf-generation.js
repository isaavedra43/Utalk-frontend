// Script para debug del PDF
// Ejecutar en la consola del navegador después de generar el PDF

console.log('🔍 Debug del PDF generado...');

// Verificar si la ventana de impresión existe
const printWindows = window.open('', '_blank');
if (printWindows) {
  console.log('✅ Ventana de impresión encontrada');

  // Verificar el contenido del documento
  const doc = printWindows.document;
  console.log('📄 Título del documento:', doc.title);

  // Buscar elementos específicos del nuevo diseño
  const tableContainers = doc.querySelectorAll('.table-container');
  console.log('📋 Número de contenedores de tabla encontrados:', tableContainers.length);

  const tableColumns = doc.querySelectorAll('.table-column');
  console.log('📊 Número de columnas de tabla encontradas:', tableColumns.length);

  const headers = doc.querySelectorAll('.column-header');
  console.log('🏷️ Headers de columna encontrados:', headers.length);
  headers.forEach((header, i) => {
    console.log(`  Header ${i + 1}:`, header.textContent);
  });

  // Verificar si la columna de materiales está oculta
  const materialHeaders = doc.querySelectorAll('th:contains("Material")');
  console.log('📝 Headers de Material encontrados:', materialHeaders.length);

  // Verificar el contenido del header
  const headerDiv = doc.querySelector('.header .version-info');
  if (headerDiv) {
    console.log('✅ Información de versión encontrada:', headerDiv.textContent);
  } else {
    console.log('❌ Información de versión NO encontrada');
  }

} else {
  console.log('❌ Ventana de impresión no encontrada');
}
