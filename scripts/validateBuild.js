#!/usr/bin/env node
/**
 * Build Validation Script
 * Valida que el build del frontend sea correcto y completo
 * Evita deployments con builds corruptos o incompletos
 * ENTERPRISE: Validación mejorada para detectar bundles vacíos
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

// NUEVO: Validaciones mejoradas para bundles
const MIN_JS_BUNDLE_SIZE = 10 * 1024; // 10KB mínimo para bundles JS principales
const MIN_CSS_BUNDLE_SIZE = 1 * 1024;  // 1KB mínimo para bundles CSS
const REQUIRED_JS_KEYWORDS = ['React', 'useState', 'render', 'createRoot', 'BrowserRouter'];

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

// NUEVO: Función para validar contenido de bundles JS
function validateJSBundle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasReactKeywords = REQUIRED_JS_KEYWORDS.some(keyword => 
      content.includes(keyword)
    );
    
    return {
      hasContent: content.length > 100,
      hasReactKeywords,
      contentLength: content.length
    };
  } catch (error) {
    return {
      hasContent: false,
      hasReactKeywords: false,
      contentLength: 0
    };
  }
}

// NUEVO: Función para validar referencias en index.html
function validateIndexReferences(indexPath) {
  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    const scriptMatches = content.match(/<script[^>]+src="([^"]+)"/g) || [];
    const linkMatches = content.match(/<link[^>]+href="([^"]+)"[^>]*rel="stylesheet"/g) || [];
    
    const issues = [];
    
    // Verificar que cada script referenciado existe y no está vacío
    scriptMatches.forEach(match => {
      const src = match.match(/src="([^"]+)"/)[1];
      if (src.startsWith('/assets/')) {
        const assetPath = path.join(DIST_PATH, src.substring(1));
        if (!fs.existsSync(assetPath)) {
          issues.push(`Script referenciado no existe: ${src}`);
        } else {
          const size = getFileSize(assetPath);
          if (size < MIN_JS_BUNDLE_SIZE) {
            issues.push(`Script muy pequeño: ${src} (${size} bytes)`);
          }
        }
      }
    });
    
    // Verificar que cada CSS referenciado existe y no está vacío
    linkMatches.forEach(match => {
      const href = match.match(/href="([^"]+)"/)[1];
      if (href.startsWith('/assets/')) {
        const assetPath = path.join(DIST_PATH, href.substring(1));
        if (!fs.existsSync(assetPath)) {
          issues.push(`CSS referenciado no existe: ${href}`);
        } else {
          const size = getFileSize(assetPath);
          if (size < MIN_CSS_BUNDLE_SIZE) {
            issues.push(`CSS muy pequeño: ${href} (${size} bytes)`);
          }
        }
      }
    });
    
    return {
      scriptCount: scriptMatches.length,
      cssCount: linkMatches.length,
      issues
    };
  } catch (error) {
    return {
      scriptCount: 0,
      cssCount: 0,
      issues: [`Error leyendo index.html: ${error.message}`]
    };
  }
}

// Función principal de validación
function validateBuild() {
  const errors = [];
  const warnings = [];
  const results = {
    valid: true,
    files: {},
    stats: {},
    bundles: {}
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

  // 4. NUEVO: Validar bundles JS específicamente
  const assetsDir = path.join(DIST_PATH, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
    const cssFiles = assetFiles.filter(f => f.endsWith('.css'));
    
    // Validar archivos JS
    jsFiles.forEach(jsFile => {
      const filePath = path.join(assetsDir, jsFile);
      const size = getFileSize(filePath);
      const validation = validateJSBundle(filePath);
      
      results.bundles[jsFile] = { size, ...validation };
      
      if (size < MIN_JS_BUNDLE_SIZE) {
        if (size < 1024) {
          errors.push(`❌ Bundle JS crítico muy pequeño: ${jsFile} (${size} bytes)`);
          results.valid = false;
        } else {
          warnings.push(`⚠️ Bundle JS pequeño: ${jsFile} (${size} bytes)`);
        }
      } else {
        console.log(`✅ Bundle JS válido: ${jsFile} (${Math.round(size/1024)}KB)`);
      }
      
      if (!validation.hasReactKeywords && size > MIN_JS_BUNDLE_SIZE) {
        warnings.push(`⚠️ Bundle JS sin palabras clave React: ${jsFile}`);
      } else if (validation.hasReactKeywords) {
        console.log(`✅ Bundle JS contiene código React: ${jsFile}`);
      }
    });
    
    // Validar archivos CSS
    cssFiles.forEach(cssFile => {
      const filePath = path.join(assetsDir, cssFile);
      const size = getFileSize(filePath);
      
      if (size < MIN_CSS_BUNDLE_SIZE) {
        warnings.push(`⚠️ Bundle CSS pequeño: ${cssFile} (${size} bytes)`);
      } else {
        console.log(`✅ Bundle CSS válido: ${cssFile} (${Math.round(size/1024)}KB)`);
      }
    });
  }

  // 5. Verificar estructura del index.html
  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const refValidation = validateIndexReferences(indexPath);
    
    // Verificar que contiene referencias a assets
    if (refValidation.scriptCount === 0 && refValidation.cssCount === 0) {
      errors.push('❌ index.html no contiene referencias a assets JS/CSS');
      results.valid = false;
    } else {
      console.log(`✅ index.html referencias: ${refValidation.scriptCount} JS, ${refValidation.cssCount} CSS`);
    }
    
    // Verificar issues con referencias
    refValidation.issues.forEach(issue => {
      errors.push(`❌ ${issue}`);
      results.valid = false;
    });
    
    // Verificar que no contiene rutas hardcodeadas problemáticas
    if (content.includes('localhost:') && process.env.NODE_ENV === 'production') {
      errors.push('❌ index.html contiene referencias a localhost en producción');
      results.valid = false;
    }
    
    results.stats.indexSize = content.length;
    console.log(`✅ index.html validado (${content.length} chars)`);
  }

  // 6. Calcular estadísticas generales
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
  
  // NUEVO: Reporte de bundles
  const bundleCount = Object.keys(results.bundles || {}).length;
  if (bundleCount > 0) {
    console.log(`  Bundles JS: ${bundleCount}`);
    Object.entries(results.bundles).forEach(([name, info]) => {
      console.log(`    ${name}: ${Math.round(info.size/1024)}KB ${info.hasReactKeywords ? '✅' : '⚠️'}`);
    });
  }
  
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