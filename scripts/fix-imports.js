#!/usr/bin/env node

/**
 * Script para arreglar rutas de import incorrectas de infoLog
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuración
const SRC_DIR = 'src';
const FILE_PATTERNS = ['**/*.ts', '**/*.tsx'];
const EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/build/**'];

// Función para obtener la ruta correcta de import
function getCorrectImportPath(filePath) {
  const relativePath = path.relative('.', filePath);
  const dirDepth = relativePath.split('/').length - 2; // -2 porque estamos en src/
  
  if (dirDepth === 0) {
    return './config/logger';
  } else {
    return '../'.repeat(dirDepth) + 'config/logger';
  }
}

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Buscar import incorrecto de infoLog
    const incorrectImportRegex = /import\s+\{\s*infoLog\s*\}\s+from\s+['"]\.\.\/config\/logger['"];?/g;
    
    if (incorrectImportRegex.test(content)) {
      const correctPath = getCorrectImportPath(filePath);
      content = content.replace(incorrectImportRegex, `import { infoLog } from '${correctPath}';`);
      modified = true;
      console.log(`  ✅ Ruta de import corregida: ${correctPath}`);
    }
    
    // Escribir archivo si se modificó
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔧 Iniciando corrección de rutas de import...\n');
  
  // Encontrar archivos
  const files = await glob(path.join(SRC_DIR, '**/*.{ts,tsx}'), {
    ignore: EXCLUDE_PATTERNS
  });
  
  console.log(`📁 Encontrados ${files.length} archivos para procesar\n`);
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  files.forEach(filePath => {
    const relativePath = path.relative('.', filePath);
    console.log(`📄 Procesando: ${relativePath}`);
    
    const wasModified = processFile(filePath);
    if (wasModified) {
      modifiedCount++;
      console.log(`  ✅ Modificado`);
    } else {
      console.log(`  ⏭️  Sin cambios`);
    }
    
    processedCount++;
  });
  
  console.log(`\n🎉 Corrección completada!`);
  console.log(`📊 Resumen:`);
  console.log(`  - Archivos procesados: ${processedCount}`);
  console.log(`  - Archivos modificados: ${modifiedCount}`);
  console.log(`  - Archivos sin cambios: ${processedCount - modifiedCount}`);
}

// Ejecutar
main(); 