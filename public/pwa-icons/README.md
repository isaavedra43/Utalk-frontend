# Íconos PWA Placeholder

⚠️ **IMPORTANTE**: Estos son íconos PLACEHOLDER para desarrollo.

Para producción, debes generar íconos PNG profesionales usando herramientas especializadas.

## 🔄 Convertir SVG a PNG

### Opción 1: Online (Recomendado)
1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube tu logo (mínimo 512x512px PNG)
3. Descarga los íconos generados
4. Reemplaza estos archivos SVG con los PNG

### Opción 2: ImageMagick (CLI)
```bash
# Instalar ImageMagick
# macOS: brew install imagemagick
# Ubuntu: apt-get install imagemagick

# Convertir todos los SVG a PNG
for file in *.svg; do
  filename="${file%.svg}"
  convert "$file" "${filename}.png"
  rm "$file"  # Eliminar SVG después de convertir
done
```

### Opción 3: Inkscape
```bash
# Convertir con Inkscape
inkscape icon-512x512.png.svg --export-filename=icon-512x512.png --export-width=512 --export-height=512
```

## 📚 Documentación

Lee `PWA_ICONS_GUIDE.md` en la raíz del proyecto para guía completa.

---

**Generado automáticamente por**: scripts/generate-pwa-icons-placeholder.js
