#!/usr/bin/env node

/**
 * Script para optimizar importaciones y reducir el tamaño del bundle
 * Analiza y sugiere optimizaciones para importaciones pesadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dependencias pesadas que deberían ser lazy loaded
const HEAVY_DEPENDENCIES = {
  'recharts': 'Considerar lazy loading para gráficos',
  'framer-motion': 'Considerar lazy loading para animaciones',
  'firebase': 'Considerar importaciones específicas',
  'socket.io-client': 'Ya está optimizado con lazy loading',
  'react-window': 'Ya está optimizado con lazy loading'
};

// Patrones de importación a optimizar
const OPTIMIZATION_PATTERNS = [
  {
    pattern: /import \* as React from 'react'/g,
    suggestion: "Usar 'import React from \"react\"' para mejor tree-shaking"
  },
  {
    pattern: /import \{ .* \} from 'firebase'/g,
    suggestion: "Usar importaciones específicas: 'import { auth } from \"firebase/auth\"'"
  },
  {
    pattern: /import \{ .* \} from 'recharts'/g,
    suggestion: "Considerar lazy loading para componentes de gráficos"
  }
];

function scanDirectory(dir, extensions = ['.ts', '.tsx']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Buscar importaciones pesadas
  for (const [dep, suggestion] of Object.entries(HEAVY_DEPENDENCIES)) {
    if (content.includes(`from '${dep}'`) || content.includes(`from "${dep}"`)) {
      issues.push({
        type: 'heavy-dependency',
        dependency: dep,
        suggestion,
        line: content.split('\n').findIndex(line => line.includes(dep)) + 1
      });
    }
  }
  
  // Buscar patrones de optimización
  for (const { pattern, suggestion } of OPTIMIZATION_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'optimization-pattern',
        suggestion,
        matches: matches.length
      });
    }
  }
  
  return issues;
}

function generateReport(issues) {
  console.log('\n📊 REPORTE DE OPTIMIZACIÓN DE BUNDLE\n');
  console.log('=' .repeat(50));
  
  if (issues.length === 0) {
    console.log('✅ No se encontraron problemas de optimización');
    return;
  }
  
  const heavyDeps = issues.filter(i => i.type === 'heavy-dependency');
  const optimizations = issues.filter(i => i.type === 'optimization-pattern');
  
  if (heavyDeps.length > 0) {
    console.log('\n⚠️  DEPENDENCIAS PESADAS DETECTADAS:');
    heavyDeps.forEach(issue => {
      console.log(`   • ${issue.dependency}: ${issue.suggestion}`);
      console.log(`     Archivo: ${issue.file} (línea ${issue.line})`);
    });
  }
  
  if (optimizations.length > 0) {
    console.log('\n🔧 OPTIMIZACIONES SUGERIDAS:');
    optimizations.forEach(issue => {
      console.log(`   • ${issue.suggestion}`);
      console.log(`     Ocurrencias: ${issue.matches}`);
    });
  }
  
  console.log('\n📈 RECOMENDACIONES GENERALES:');
  console.log('   1. Usar lazy loading para componentes pesados');
  console.log('   2. Implementar code splitting por rutas');
  console.log('   3. Optimizar importaciones de Firebase');
  console.log('   4. Considerar tree-shaking para librerías grandes');
  console.log('   5. Usar dynamic imports para funcionalidades opcionales');
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Directorio src no encontrado');
    process.exit(1);
  }
  
  console.log('🔍 Analizando archivos...');
  
  const files = scanDirectory(srcDir);
  const allIssues = [];
  
  for (const file of files) {
    const issues = analyzeFile(file);
    issues.forEach(issue => {
      issue.file = path.relative(process.cwd(), file);
    });
    allIssues.push(...issues);
  }
  
  generateReport(allIssues);
  
  console.log(`\n📁 Archivos analizados: ${files.length}`);
  console.log(`🔧 Problemas encontrados: ${allIssues.length}`);
}

main(); 