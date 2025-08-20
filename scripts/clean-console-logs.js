#!/usr/bin/env node

/**
 * Script para limpiar console.logs del proyecto
 * Reemplaza console.log con infoLog para logs condicionales
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuración
const SRC_DIR = 'src';
const FILE_PATTERNS = ['**/*.ts', '**/*.tsx'];
const EXCLUDE_PATTERNS = ['**/node_modules/**', '**/dist/**', '**/build/**'];

// Patrones de reemplazo
const REPLACEMENTS = [
  // console.log simple
  {
    pattern: /console\.log\(([^)]+)\)/g,
    replacement: 'infoLog($1)',
    description: 'console.log simple'
  },
  // console.log con múltiples argumentos
  {
    pattern: /console\.log\(([^)]+), ([^)]+)\)/g,
    replacement: 'infoLog($1, $2)',
    description: 'console.log con dos argumentos'
  },
  // console.log con objeto
  {
    pattern: /console\.log\(([^,]+), \{([^}]+)\}\)/g,
    replacement: 'infoLog(`$1: $2`)',
    description: 'console.log con objeto'
  },
  // console.log con template literal
  {
    pattern: /console\.log\(`([^`]+)`\)/g,
    replacement: 'infoLog(`$1`)',
    description: 'console.log con template literal'
  }
];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar si ya tiene import de infoLog
    const hasInfoLogImport = content.includes('import { infoLog }') || content.includes('import { infoLog,');
    
    // Aplicar reemplazos
    REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`  ✅ ${description}`);
      }
    });
    
    // Agregar import de infoLog si no existe y se hizo algún cambio
    if (modified && !hasInfoLogImport) {
      // Buscar la primera línea de import
      const importMatch = content.match(/^import .+ from ['"]/m);
      if (importMatch) {
        const importIndex = content.indexOf(importMatch[0]);
        const insertIndex = content.indexOf('\n', importIndex) + 1;
        content = content.slice(0, insertIndex) + 
                 "import { infoLog } from '../config/logger';\n" +
                 content.slice(insertIndex);
      }
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
  console.log('🧹 Iniciando limpieza de console.logs...\n');
  
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
  
  console.log(`\n🎉 Limpieza completada!`);
  console.log(`📊 Resumen:`);
  console.log(`  - Archivos procesados: ${processedCount}`);
  console.log(`  - Archivos modificados: ${modifiedCount}`);
  console.log(`  - Archivos sin cambios: ${processedCount - modifiedCount}`);
}

// Ejecutar si es llamado directamente
main(); 