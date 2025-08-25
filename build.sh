#!/bin/bash

# Script de build para Railway - UTALK Frontend

echo "🚀 Iniciando build para Railway..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Limpiar instalaciones previas
echo "🧹 Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf dist

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# Verificar TypeScript
echo "🔍 Verificando TypeScript..."
npm run type-check

# Build de producción
echo "🏗️ Construyendo aplicación..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo "❌ Error: El directorio dist no fue creado"
    exit 1
fi

# Verificar archivos críticos
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: index.html no fue generado"
    exit 1
fi

echo "✅ Build completado exitosamente!"
echo "📁 Archivos generados en: dist/"
ls -la dist/

echo "🚀 Listo para deployment en Railway!"
