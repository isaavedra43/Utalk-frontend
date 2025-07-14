#!/usr/bin/env node
/**
 * Clean Logs Script
 * Elimina todos los console.log del frontend para producción
 * Reemplaza con logging condicional solo en desarrollo
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CLIENT_DIR = path.join(__dirname, '../client');
const PATTERNS_TO_CLEAN = [
  'console.log(',
  'console.info(',
  'console.debug(',
  'console.warn(',
  'console.error('
];

const LOGGING_REPLACEMENT = `
// Logging condicional solo en desarrollo
const isDev = import.meta.env.DEV;
const devLog = (...args: any[]) => { if (isDev) console.info(...args); };
const devWarn = (...args: any[]) => { if (isDev) console.warn(...args); };
const devError = (...args: any[]) => { if (isDev) console.error(...args); };
`;

console.log('🧹 Limpiando console.log del frontend...');

// Encontrar todos los archivos TypeScript/JavaScript
const files = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: CLIENT_DIR });

let totalFiles = 0;
let totalReplacements = 0;

files.forEach(file => {
  const filePath = path.join(CLIENT_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileReplacements = 0;
  
  // Reemplazar console.log con devLog condicional
  const consoleLogRegex = /console\.log\(/g;
  if (consoleLogRegex.test(content)) {
    newContent = newContent.replace(consoleLogRegex, 'devLog(');
    fileReplacements += (content.match(consoleLogRegex) || []).length;
  }
  
  // Reemplazar console.warn con devWarn condicional
  const consoleWarnRegex = /console\.warn\(/g;
  if (consoleWarnRegex.test(content)) {
    newContent = newContent.replace(consoleWarnRegex, 'devWarn(');
    fileReplacements += (content.match(consoleWarnRegex) || []).length;
  }
  
  // Reemplazar console.error con devError condicional (solo en algunos casos)
  const consoleErrorRegex = /console\.error\(/g;
  if (consoleErrorRegex.test(content)) {
    newContent = newContent.replace(consoleErrorRegex, 'devError(');
    fileReplacements += (content.match(consoleErrorRegex) || []).length;
  }
  
  // Si hay cambios, agregar helpers de logging si no existen
  if (fileReplacements > 0 && !content.includes('const isDev = import.meta.env.DEV')) {
    // Insertar después de los imports
    const importRegex = /^(import.*?;?\n)*\n*/;
    newContent = newContent.replace(importRegex, (match) => {
      return match + LOGGING_REPLACEMENT + '\n';
    });
  }
  
  // Escribir archivo si hay cambios
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    totalFiles++;
    totalReplacements += fileReplacements;
    console.log(`✅ ${file}: ${fileReplacements} reemplazos`);
  }
});

console.log(`\n📊 RESUMEN:`);
console.log(`  Archivos modificados: ${totalFiles}`);
console.log(`  Total reemplazos: ${totalReplacements}`);
console.log(`\n✅ Limpieza completada`);

if (totalReplacements === 0) {
  console.log('ℹ️  No se encontraron console.log para limpiar');
} 