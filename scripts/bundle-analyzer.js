#!/usr/bin/env node

/**
 * Script para analizar el tamaño del bundle y generar reportes
 * Ayuda a identificar chunks grandes y oportunidades de optimización
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de límites de tamaño
const SIZE_LIMITS = {
  CRITICAL: 500 * 1024, // 500KB
  WARNING: 300 * 1024,  // 300KB
  INFO: 100 * 1024      // 100KB
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getGzipSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    // Estimación de compresión gzip (aproximadamente 30% del tamaño original)
    return Math.round(stats.size * 0.3);
  } catch (error) {
    return 0;
  }
}

function analyzeBundle() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Directorio dist no encontrado. Ejecuta npm run build primero.');
    process.exit(1);
  }

  console.log('📊 ANALIZANDO BUNDLE...\n');
  console.log('=' .repeat(60));

  const files = [];
  
  function scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(relativePath, item));
      } else if (stat.isFile()) {
        const relativeFilePath = path.join(relativePath, item);
        const size = stat.size;
        const gzipSize = getGzipSize(fullPath);
        
        files.push({
          name: relativeFilePath,
          size,
          gzipSize,
          fullPath
        });
      }
    }
  }
  
  scanDirectory(distDir);
  
  // Ordenar por tamaño
  files.sort((a, b) => b.size - a.size);
  
  // Filtrar solo archivos JavaScript y CSS
  const jsFiles = files.filter(f => f.name.endsWith('.js'));
  const cssFiles = files.filter(f => f.name.endsWith('.css'));
  const otherFiles = files.filter(f => !f.name.endsWith('.js') && !f.name.endsWith('.css'));
  
  // Análisis de archivos JS
  console.log('\n📦 ARCHIVOS JAVASCRIPT:');
  console.log('-'.repeat(60));
  
  let totalJsSize = 0;
  let totalJsGzipSize = 0;
  
  jsFiles.forEach(file => {
    const sizeFormatted = formatBytes(file.size);
    const gzipFormatted = formatBytes(file.gzipSize);
    
    let status = '✅';
    if (file.size > SIZE_LIMITS.CRITICAL) {
      status = '🚨';
    } else if (file.size > SIZE_LIMITS.WARNING) {
      status = '⚠️';
    } else if (file.size > SIZE_LIMITS.INFO) {
      status = 'ℹ️';
    }
    
    console.log(`${status} ${file.name.padEnd(40)} ${sizeFormatted.padStart(10)} (${gzipFormatted} gzip)`);
    
    totalJsSize += file.size;
    totalJsGzipSize += file.gzipSize;
  });
  
  // Análisis de archivos CSS
  console.log('\n🎨 ARCHIVOS CSS:');
  console.log('-'.repeat(60));
  
  let totalCssSize = 0;
  let totalCssGzipSize = 0;
  
  cssFiles.forEach(file => {
    const sizeFormatted = formatBytes(file.size);
    const gzipFormatted = formatBytes(file.gzipSize);
    
    console.log(`✅ ${file.name.padEnd(40)} ${sizeFormatted.padStart(10)} (${gzipFormatted} gzip)`);
    
    totalCssSize += file.size;
    totalCssGzipSize += file.gzipSize;
  });
  
  // Resumen
  console.log('\n📈 RESUMEN:');
  console.log('=' .repeat(60));
  
  const totalSize = totalJsSize + totalCssSize;
  const totalGzipSize = totalJsGzipSize + totalCssGzipSize;
  
  console.log(`📦 Total JavaScript: ${formatBytes(totalJsSize)} (${formatBytes(totalJsGzipSize)} gzip)`);
  console.log(`🎨 Total CSS: ${formatBytes(totalCssSize)} (${formatBytes(totalCssGzipSize)} gzip)`);
  console.log(`📊 Total Bundle: ${formatBytes(totalSize)} (${formatBytes(totalGzipSize)} gzip)`);
  
  // Análisis de chunks
  console.log('\n🔍 ANÁLISIS DE CHUNKS:');
  console.log('-'.repeat(60));
  
  const largeChunks = jsFiles.filter(f => f.size > SIZE_LIMITS.WARNING);
  const mediumChunks = jsFiles.filter(f => f.size > SIZE_LIMITS.INFO && f.size <= SIZE_LIMITS.WARNING);
  
  if (largeChunks.length > 0) {
    console.log('\n🚨 CHUNKS GRANDES (>300KB):');
    largeChunks.forEach(chunk => {
      console.log(`   • ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
  }
  
  if (mediumChunks.length > 0) {
    console.log('\n⚠️  CHUNKS MEDIANOS (100-300KB):');
    mediumChunks.forEach(chunk => {
      console.log(`   • ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(60));
  
  if (largeChunks.length > 0) {
    console.log('🚨 Optimizaciones críticas necesarias:');
    console.log('   1. Implementar lazy loading para chunks grandes');
    console.log('   2. Considerar code splitting más granular');
    console.log('   3. Optimizar importaciones de librerías pesadas');
  }
  
  if (totalSize > 2 * 1024 * 1024) { // 2MB
    console.log('⚠️  Bundle total muy grande:');
    console.log('   1. Revisar dependencias innecesarias');
    console.log('   2. Implementar tree-shaking más agresivo');
    console.log('   3. Considerar bundle splitting por rutas');
  }
  
  console.log('\n✅ Optimizaciones generales:');
  console.log('   1. Usar compresión gzip/brotli en producción');
  console.log('   2. Implementar cache de navegador');
  console.log('   3. Considerar CDN para assets estáticos');
  
  // Generar reporte JSON
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSize,
      totalGzipSize,
      jsFiles: jsFiles.length,
      cssFiles: cssFiles.length,
      otherFiles: otherFiles.length
    },
    chunks: {
      large: largeChunks.map(f => ({ name: f.name, size: f.size, gzipSize: f.gzipSize })),
      medium: mediumChunks.map(f => ({ name: f.name, size: f.size, gzipSize: f.gzipSize })),
      all: jsFiles.map(f => ({ name: f.name, size: f.size, gzipSize: f.gzipSize }))
    }
  };
  
  const reportPath = path.join(__dirname, '..', 'bundle-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Reporte detallado guardado en: ${reportPath}`);
}

analyzeBundle(); 