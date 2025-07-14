#!/usr/bin/env node
/**
 * Build Validation Script
 * Valida que el build del frontend sea correcto y completo
 * Evita deployments con builds corruptos o incompletos
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST_PATH = path.join(__dirname, '../dist');
const REQUIRED_FILES = ['index.html'];
const REQUIRED_DIRS = ['assets'];
const MIN_FILE_SIZES = {
  'index.html': 100, // bytes mínimos
};

console.log('🔍 Validando build del frontend...');

// Función para obtener tamaño de archivo
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

// Función para calcular hash de archivo
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

// Función principal de validación
function validateBuild() {
  const errors = [];
  const warnings = [];
  const results = {
    valid: true,
    files: {},
    stats: {}
  };

  // 1. Verificar que existe el directorio dist
  if (!fs.existsSync(DIST_PATH)) {
    errors.push('❌ Directorio /dist no existe');
    results.valid = false;
    return { errors, warnings, results };
  }

  console.log(`✅ Directorio encontrado: ${DIST_PATH}`);

  // 2. Verificar archivos requeridos
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(DIST_PATH, file);
    const exists = fs.existsSync(filePath);
    const size = getFileSize(filePath);
    const hash = getFileHash(filePath);

    results.files[file] = { exists, size, hash, path: filePath };

    if (!exists) {
      errors.push(`❌ Archivo requerido faltante: ${file}`);
      results.valid = false;
    } else {
      console.log(`✅ Archivo encontrado: ${file} (${size} bytes)`);
      
      // Verificar tamaño mínimo
      const minSize = MIN_FILE_SIZES[file];
      if (minSize && size < minSize) {
        errors.push(`❌ Archivo ${file} demasiado pequeño: ${size} bytes (mínimo: ${minSize})`);
        results.valid = false;
      }
    }
  }

  // 3. Verificar directorios requeridos
  for (const dir of REQUIRED_DIRS) {
    const dirPath = path.join(DIST_PATH, dir);
    const exists = fs.existsSync(dirPath);
    
    if (!exists) {
      warnings.push(`⚠️ Directorio esperado faltante: ${dir}`);
    } else {
      const files = fs.readdirSync(dirPath);
      console.log(`✅ Directorio encontrado: ${dir} (${files.length} archivos)`);
      results.stats[dir] = { files: files.length };
    }
  }

  // 4. Verificar estructura del index.html
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Verificar que contiene referencias a assets
    if (!content.includes('<script') && !content.includes('<link')) {
      warnings.push('⚠️ index.html no contiene referencias a assets JS/CSS');
    }
    
    // Verificar que no contiene rutas hardcodeadas problemáticas
    if (content.includes('localhost:') && process.env.NODE_ENV === 'production') {
      errors.push('❌ index.html contiene referencias a localhost en producción');
      results.valid = false;
    }
    
    results.stats.indexSize = content.length;
    console.log(`✅ index.html validado (${content.length} chars)`);
  }

  // 5. Calcular estadísticas generales
  const allFiles = getAllFiles(DIST_PATH);
  results.stats.totalFiles = allFiles.length;
  results.stats.totalSize = allFiles.reduce((sum, file) => sum + getFileSize(file), 0);
  
  console.log(`📊 Estadísticas: ${allFiles.length} archivos, ${(results.stats.totalSize / 1024).toFixed(1)} KB total`);

  return { errors, warnings, results };
}

// Función auxiliar para obtener todos los archivos recursivamente
function getAllFiles(dirPath) {
  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        traverse(itemPath);
      } else {
        files.push(itemPath);
      }
    }
  }
  
  traverse(dirPath);
  return files;
}

// Función para reportar resultados
function reportResults(errors, warnings, results) {
  console.log('\n📋 REPORTE DE VALIDACIÓN:');
  
  if (errors.length > 0) {
    console.log('\n🚨 ERRORES CRÍTICOS:');
    errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ ADVERTENCIAS:');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n📊 ESTADÍSTICAS:');
  console.log(`  Archivos totales: ${results.stats.totalFiles || 0}`);
  console.log(`  Tamaño total: ${((results.stats.totalSize || 0) / 1024).toFixed(1)} KB`);
  
  if (results.valid) {
    console.log('\n✅ BUILD VÁLIDO - Listo para deploy');
    return 0;
  } else {
    console.log('\n❌ BUILD INVÁLIDO - Deploy bloqueado');
    return 1;
  }
}

// Ejecutar validación
if (require.main === module) {
  try {
    const { errors, warnings, results } = validateBuild();
    const exitCode = reportResults(errors, warnings, results);
    process.exit(exitCode);
  } catch (error) {
    console.error('💥 Error durante validación:', error.message);
    process.exit(1);
  }
}

module.exports = { validateBuild }; 