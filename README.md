# UTalk Frontend

Sistema de mensajería multicanal con CRM integrado - Frontend desarrollado con SvelteKit y Tailwind CSS.

## 🚀 Tecnologías

- **SvelteKit 2.22.0** con **Svelte 5.0.0**
- **TypeScript 5.5.4** (modo estricto)
- **Tailwind CSS 3.4.17** con configuración optimizada
- **shadcn-svelte** para componentes UI
- **Vitest** para testing
- **ESLint + Prettier** para calidad de código
- **Husky + lint-staged** para hooks de Git

## 📋 Requisitos Previos

- **Node.js 18+**
- **npm** o **pnpm**
- **VS Code** (recomendado)

## 🛠 Instalación

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd Utalk-frontend
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con las URLs correctas de tu backend:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### 3. Configurar VS Code (Recomendado)

Instala las siguientes extensiones **obligatorias**:

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Svelte for VS Code** (`svelte.svelte-vscode`)
- **Prettier** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

La configuración de VS Code ya está incluida en `.vscode/settings.json`.

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Servidor de desarrollo (localhost:5173)

# Build y Producción
npm run build             # Build de producción
npm run preview           # Preview del build

# Calidad de Código
npm run lint              # Ejecutar ESLint
npm run lint:fix          # Ejecutar ESLint con auto-fix
npm run format            # Formatear con Prettier
npm run format:check      # Verificar formato
npm run type-check        # Verificar tipos TypeScript

# Testing
npm run test              # Ejecutar tests
npm run test:ui           # Tests con interfaz gráfica
npm run test:coverage     # Tests con coverage

# Validación Completa
npm run validate          # Lint + Format + Type-check + Tests
```

## 📁 Estructura del Proyecto

```
src/
├── routes/                 # Rutas de SvelteKit
├── lib/
│   ├── components/ui/      # Componentes base (shadcn-svelte)
│   ├── stores/            # Stores de Svelte
│   ├── services/          # Servicios (API, WebSocket)
│   ├── utils/             # Utilidades
│   ├── types/             # Tipos TypeScript
│   ├── constants.ts       # Constantes globales
│   └── env.ts            # Validación de variables de entorno
├── app.css               # Estilos globales y Tailwind
└── app.html              # Template HTML base
```

## 🎨 Sistema de Estilos

### Tailwind CSS

El proyecto utiliza **Tailwind CSS 3.4.17** con configuración optimizada:

- **Purge automático**: CSS final ~16kB (gzipped ~3.9kB)
- **Colores personalizados**: `primary` y `secondary` con escalas completas
- **Fuentes**: Inter (sans) y JetBrains Mono (mono)

### Configuración de Colores

```js
// Primario (azul)
primary: {
  50: '#f0faff',   100: '#e0f2ff',   200: '#b9e6ff',
  300: '#7ccfff',  400: '#36b8ff',   500: '#099cff',
  600: '#007fff',  700: '#006aff',   800: '#0058ff',
  900: '#004fff',  950: '#002b91'
}

// Secundario (gris-azul)
secondary: {
  50: '#f0f3f8',   100: '#e1e7f0',   200: '#c4d0e2',
  300: '#a0b1ce',  400: '#7c8fb5',   500: '#60739c',
  600: '#4e5b7f',  700: '#414b67',   800: '#384055',
  900: '#32394a',  950: '#202531'
}
```

## 🧩 Componentes UI

El proyecto incluye componentes base de **shadcn-svelte**:

- `Button` - Botones con variantes y tamaños
- `Badge` - Etiquetas y estados
- `Card` - Contenedores de información
- `Dialog` - Modales y overlays
- `Input` - Campos de formulario
- `Alert` - Notificaciones y avisos
- `Avatar` - Imágenes de perfil

Todos los componentes están tipados con TypeScript estricto.

## ⚙️ Configuración de Desarrollo

### ESLint + Prettier

El proyecto usa configuración estricta:

- **Auto-fix** al guardar archivos
- **Organización automática** de imports
- **Hooks de Git** para validación pre-commit

### Husky Hooks

- **Pre-commit**: ESLint + Prettier en archivos modificados
- **Pre-push**: Validación completa (lint + type-check + tests)

## 🚧 Limitaciones Conocidas y Deuda Técnica

### Warnings de CSS en VS Code

**Problema**: VS Code muestra warnings "Unknown at rule @tailwind" y "Unknown at rule @apply".

**Causa**: VS Code no reconoce nativamente las directivas de Tailwind CSS.

**Solución Implementada**:

- Configuración `"*.css": "tailwindcss"` en `.vscode/settings.json`
- Uso del modo "Tailwind CSS Language Mode" del plugin oficial

**Estado**: Los warnings pueden aparecer dependiendo de la versión del plugin. **NO afectan el funcionamiento** del proyecto.

**Referencia**: [Documentación oficial de Tailwind CSS](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Testing con Svelte 5

**Limitación**: Svelte 5 introduce cambios en el sistema de tipos (`Snippet`) que pueden causar incompatibilidades con algunas librerías de testing.

**Estado**: Los componentes están listos para testing, pero algunos tests complejos pueden requerir ajustes futuros.

## 🔒 Seguridad

### Variables de Entorno

- Variables **VITE\_\*** son públicas (se incluyen en el bundle)
- Variables sensibles deben manejarse en el backend
- Validación automática al inicio de la aplicación

### Dependencias

- Sin vulnerabilidades críticas conocidas
- Algunas vulnerabilidades de severidad baja en dependencias transitivas (sin fix disponible)
- Configurado `audit-level=moderate` en `.npmrc`

## 🚫 Prácticas Prohibidas

### NO usar estos workarounds:

```js
// ❌ PROHIBIDO
"css.lint.unknownAtRules": "ignore"
"css.validate": false

// ❌ PROHIBIDO
/* eslint-disable */
// @ts-ignore (sin justificación)

// ❌ PROHIBIDO
.vscode/css_custom_data.json (hacks CSS)
```

### Usar en su lugar:

```js
// ✅ CORRECTO
"files.associations": { "*.css": "tailwindcss" }

// ✅ CORRECTO
// eslint-disable-next-line rule-name -- Justificación específica

// ✅ CORRECTO
Configuración oficial del plugin de Tailwind
```

## 📊 Métricas de Calidad

- **Build CSS**: ~16kB (gzipped ~3.9kB)
- **TypeScript**: Modo estricto habilitado
- **ESLint**: 0 errores, 0 warnings
- **Prettier**: Formato consistente
- **Tests**: Configurados y listos

## 🔄 Plan de Migración Futuro

### Tailwind CSS v4

- **Cuando**: Disponible versión estable
- **Impacto**: Cambios en configuración y sintaxis
- **Preparación**: Documentar diferencias de sintaxis actual

### Testing Library

- **Cuando**: Soporte completo para Svelte 5
- **Impacto**: Expansión de tests de componentes
- **Preparación**: Componentes ya tipados correctamente

## 🆘 Troubleshooting

### Error: "Missing environment variables"

```bash
# Solución
cp .env.example .env
# Editar .env con URLs correctas
```

### Warnings de @tailwind en VS Code

```bash
# Verificar extensión instalada
code --list-extensions | grep bradlc.vscode-tailwindcss

# Recargar VS Code
Cmd+Shift+P -> "Developer: Reload Window"
```

### Error de tipos en componentes

```bash
# Verificar imports
npm run type-check

# Si persiste, verificar configuración TypeScript
```

### Build falla

```bash
# Limpiar cache
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Soporte

Para problemas técnicos:

1. **Verificar** este README y troubleshooting
2. **Ejecutar** `npm run validate` para diagnosticar
3. **Revisar** configuración de VS Code y extensiones
4. **Consultar** documentación oficial de Tailwind y SvelteKit

---

## ✅ Estado del Proyecto

**🟢 LISTO PARA DESARROLLO**

- ✅ Configuración completa y funcional
- ✅ Build optimizado (16kB CSS)
- ✅ Linting sin errores
- ✅ TypeScript estricto
- ✅ Componentes UI listos
- ✅ Variables de entorno configuradas
- ✅ Hooks de Git activos
- ✅ Documentación completa

**Próximo paso**: Implementar módulo de Login/Autenticación
