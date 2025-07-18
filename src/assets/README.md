# Assets

Esta carpeta contiene todos los recursos estáticos de la aplicación.

## Estructura

```
assets/
├── images/          # Imágenes, logos, iconos
├── fonts/           # Fuentes personalizadas
├── icons/           # Iconos SVG personalizados
├── videos/          # Videos y multimedia
└── docs/            # Documentos estáticos
```

## Convenciones

### Imágenes
- Usar formatos modernos: WebP, AVIF cuando sea posible
- Incluir fallbacks para navegadores antiguos
- Optimizar para diferentes densidades de pantalla (@1x, @2x, @3x)
- Nomenclatura: `descriptive-name.format`

### Iconos
- Preferir SVG para iconos personalizados
- Usar bibliotecas como Lucide React para iconos estándar
- Nomenclatura: `icon-name.svg`

### Fuentes
- Incluir solo los pesos y estilos necesarios
- Usar formatos modernos: WOFF2, WOFF
- Configurar en `index.css` o Tailwind config

## Optimización

- Comprimir todas las imágenes antes de incluir
- Usar herramientas como `imagemin` en el build
- Considerar lazy loading para imágenes grandes
- Implementar responsive images cuando sea necesario

## TODO

- [ ] Añadir logo de la aplicación
- [ ] Incluir favicon e iconos de app
- [ ] Configurar imágenes de placeholder
- [ ] Añadir ilustraciones para estados vacíos 