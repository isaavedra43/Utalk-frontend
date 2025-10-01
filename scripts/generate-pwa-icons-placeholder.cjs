/**
 * Script para generar íconos PWA placeholder
 * Estos son íconos simples para desarrollo/testing
 * Para producción, usa herramientas profesionales (ver PWA_ICONS_GUIDE.md)
 */

const fs = require('fs');
const path = require('path');

// Directorio de salida
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'pwa-icons');

// Asegurar que el directorio existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Tamaños de íconos necesarios
const SIZES = [16, 32, 60, 72, 76, 96, 120, 128, 144, 152, 167, 180, 192, 384, 512];

// Color principal (azul UTalk)
const PRIMARY_COLOR = '#3B82F6';
const TEXT_COLOR = '#FFFFFF';

/**
 * Genera un ícono SVG simple
 */
function generateSVGIcon(size) {
  const fontSize = Math.floor(size * 0.6);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${PRIMARY_COLOR}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="central">U</text>
</svg>`;
  return svg;
}

/**
 * Genera un ícono HTML para convertir a imagen
 * Nota: Esta es una versión simplificada. Para mejor calidad, usa herramientas especializadas
 */
function generateHTMLIcon(size) {
  const fontSize = Math.floor(size * 0.6);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; }
    body { 
      width: ${size}px; 
      height: ${size}px; 
      background: ${PRIMARY_COLOR}; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border-radius: ${size * 0.2}px;
    }
    .text { 
      font-family: Arial, sans-serif; 
      font-size: ${fontSize}px; 
      font-weight: bold; 
      color: ${TEXT_COLOR}; 
    }
  </style>
</head>
<body>
  <div class="text">U</div>
</body>
</html>`;
}

// Generar íconos SVG
console.log('🎨 Generando íconos PWA placeholder...\n');

SIZES.forEach(size => {
  const filename = `icon-${size}x${size}.png.svg`;
  const filepath = path.join(OUTPUT_DIR, filename);
  const svg = generateSVGIcon(size);
  
  // Guardamos como .svg temporalmente (en producción se deben convertir a PNG)
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generado: ${filename}`);
});

// Generar favicon.ico como SVG temporal
const faviconSVG = generateSVGIcon(32);
fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.svg'), faviconSVG);
console.log(`✅ Generado: favicon.svg (temporal)`);

// Generar splash screen
const splashSize = 2048;
const splashSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${splashSize}" height="${splashSize}" viewBox="0 0 ${splashSize} ${splashSize}">
  <rect width="${splashSize}" height="${splashSize}" fill="#FFFFFF"/>
  <circle cx="${splashSize/2}" cy="${splashSize/2}" r="${splashSize * 0.15}" fill="${PRIMARY_COLOR}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${splashSize * 0.12}" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="central">U</text>
  <text x="50%" y="${splashSize * 0.65}" font-family="Arial, sans-serif" font-size="${splashSize * 0.04}" fill="#6B7280" text-anchor="middle" dominant-baseline="central">UTalk</text>
</svg>`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'splash-screen.svg'), splashSVG);
console.log(`✅ Generado: splash-screen.svg`);

// Crear archivo README en el directorio de íconos
const readme = `# Íconos PWA Placeholder

⚠️ **IMPORTANTE**: Estos son íconos PLACEHOLDER para desarrollo.

Para producción, debes generar íconos PNG profesionales usando herramientas especializadas.

## 🔄 Convertir SVG a PNG

### Opción 1: Online (Recomendado)
1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube tu logo (mínimo 512x512px PNG)
3. Descarga los íconos generados
4. Reemplaza estos archivos SVG con los PNG

### Opción 2: ImageMagick (CLI)
\`\`\`bash
# Instalar ImageMagick
# macOS: brew install imagemagick
# Ubuntu: apt-get install imagemagick

# Convertir todos los SVG a PNG
for file in *.svg; do
  filename="\${file%.svg}"
  convert "$file" "\${filename}.png"
  rm "$file"  # Eliminar SVG después de convertir
done
\`\`\`

### Opción 3: Inkscape
\`\`\`bash
# Convertir con Inkscape
inkscape icon-512x512.png.svg --export-filename=icon-512x512.png --export-width=512 --export-height=512
\`\`\`

## 📚 Documentación

Lee \`PWA_ICONS_GUIDE.md\` en la raíz del proyecto para guía completa.

---

**Generado automáticamente por**: scripts/generate-pwa-icons-placeholder.js
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme);
console.log(`✅ Generado: README.md`);

console.log('\n✨ ¡Íconos placeholder generados exitosamente!');
console.log('\n⚠️  IMPORTANTE:');
console.log('   Estos son íconos SVG temporales para desarrollo.');
console.log('   Para producción, genera íconos PNG profesionales.');
console.log('   Lee PWA_ICONS_GUIDE.md para más información.\n');

