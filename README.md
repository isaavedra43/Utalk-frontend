# 🚀 UTalk Frontend

Sistema de mensajería multicanal con CRM integrado - Interfaz de usuario moderna desarrollada con SvelteKit.

## 📋 Descripción

UTalk Frontend es la interfaz de usuario para el sistema UTalk, una plataforma de mensajería multicanal que permite gestionar conversaciones desde WhatsApp, SMS, Email y chat web en una sola interfaz.

## 🛠️ Stack Tecnológico

- **Framework**: SvelteKit 2.x
- **Lenguaje**: TypeScript 5.5.4 (compatible con ESLint)
- **Estilos**: Tailwind CSS 3.4.17
- **Componentes UI**: shadcn-svelte + bits-ui
- **Estado**: TanStack Query + Svelte Stores
- **Testing**: Vitest + @testing-library/svelte
- **Quality**: ESLint 8.x + Prettier + Husky
- **Build**: Vite 7.x + SvelteKit Adapter Auto

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18.x o 20.x
- npm 9.x o superior

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd utalk-frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### Configuración de Variables de Entorno

```bash
# .env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

## 🛠️ Configuración de VS Code (CRÍTICA PARA ZERO WARNINGS)

### Extensiones Requeridas

Instala automáticamente las extensiones recomendadas ejecutando:

1. Abre VS Code en el directorio del proyecto
2. Ve a la pestaña de Extensiones (Ctrl+Shift+X)
3. Busca `@recommended` y instala todas las extensiones recomendadas

**Extensiones críticas para Tailwind:**

- `bradlc.vscode-tailwindcss` - Tailwind CSS IntelliSense
- `esbenp.prettier-vscode` - Prettier formatter
- `ms-vscode.vscode-eslint` - ESLint

### Configuración Automática

El proyecto incluye configuración pre-configurada en `.vscode/`:

- **`.vscode/settings.json`**: Configuración del editor
- **`.vscode/extensions.json`**: Extensiones recomendadas
- **`.vscode/css_custom_data.json`**: Definiciones de Tailwind CSS

### Verificación de Configuración

Para verificar que NO hay warnings en VS Code:

1. Abre cualquier archivo `.css` o `.svelte`
2. **NO** deberías ver warnings de "Unknown at rule" para `@tailwind`, `@apply`, `@layer`
3. El autocompletado de Tailwind debe funcionar en atributos `class=""`
4. ESLint debe mostrar errores en tiempo real sin warnings de configuración

### Troubleshooting de VS Code

Si aún ves warnings después de instalar extensiones:

```bash
# 1. Reinicia VS Code completamente
# 2. Reload window: Ctrl+Shift+P -> "Developer: Reload Window"
# 3. Verifica que la extensión de Tailwind esté activa
# 4. Verifica que css.validate está habilitado en settings
```

## 📁 Estructura del Proyecto

```
utalk-frontend/
├── .vscode/                 # Configuración VS Code
│   ├── extensions.json      # Extensiones recomendadas
│   ├── settings.json        # Configuración del editor
│   └── css_custom_data.json # Definiciones Tailwind CSS
├── src/
│   ├── routes/              # Rutas de SvelteKit
│   ├── lib/
│   │   ├── components/ui/   # Componentes shadcn-svelte
│   │   ├── stores/          # Stores de Svelte
│   │   ├── services/        # Servicios API/WebSocket
│   │   ├── utils/           # Utilidades generales
│   │   ├── types/           # Tipos TypeScript
│   │   ├── constants.ts     # Constantes globales
│   │   └── env.ts           # Validación de entorno
│   ├── app.css              # Estilos globales Tailwind
│   └── tests/setup.ts       # Configuración de tests
├── .husky/                  # Git hooks
├── .github/workflows/       # CI/CD GitHub Actions
└── docs/                    # Documentación
```

## 🎯 Scripts Disponibles

### Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
```

### Calidad y Testing

```bash
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check
npm run type-check   # TypeScript check
npm run test         # Tests interactivos
npm run test:run     # Tests CI mode
npm run test:coverage # Coverage report
```

### Validación y Auditoría

```bash
npm run validate     # Lint + Format + Type + Test
npm run validate:fast # Validación rápida
npm run audit:security # Auditoría de seguridad
npm run audit:deps   # Dependencias outdated
npm run clean        # Limpiar cache y builds
```

## 🎨 Sistema de Diseño

### Colores Principales

- **Primary**: Azul (blue-600 como base)
- **Secondary**: Gris (slate-50 a slate-900)
- **Success**: Verde (green-500)
- **Warning**: Amarillo (yellow-500)
- **Error**: Rojo (red-500)

### Tipografía

- **Sans**: Inter (principal)
- **Mono**: JetBrains Mono (código)

### Componentes Base

- Button, Badge, Card, Dialog, Input, Alert, Avatar
- Todos los componentes incluyen variantes y son totalmente tipados

## 🧪 Testing

```bash
# Ejecutar tests
npm run test:run

# Tests con UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Estrategia de Testing

- **Unit**: Utilidades y constantes
- **Component**: Componentes UI (configuración pendiente para Svelte 5)
- **Integration**: Flujos completos (en desarrollo)

## ✅ Quality Gates

Todos los commits y pushes pasan por validación automática:

### Pre-commit

- ESLint auto-fix
- Prettier formatting
- Lint validation

### Pre-push

- Full validation suite
- Build verification
- Security audit

### CI/CD Pipeline

- Multi-version Node.js testing (18.x, 20.x)
- Full quality validation
- Security checks
- Build artifacts

## 🔧 Configuración

### Tailwind CSS

- Versión 3.4.17 (estable y compatible)
- Configuración personalizada en `tailwind.config.js`
- PostCSS con autoprefixer

### ESLint

- Versión 8.x (compatible con TypeScript 5.5.4)
- Configuración flat config
- Reglas estrictas para Svelte y TypeScript

### TypeScript

- Versión 5.5.4 (compatible con ESLint)
- Modo estricto habilitado
- Configuración optimizada para Svelte

## 🐛 Troubleshooting

### VS Code Warnings de CSS

**Problema**: "Unknown at rule @tailwind, @apply"
**Solución**:

1. Instalar extensión `bradlc.vscode-tailwindcss`
2. Reiniciar VS Code
3. Verificar que `.vscode/css_custom_data.json` existe

### ESLint TypeScript Compatibility

**Problema**: Warnings de versión TypeScript no soportada
**Solución**: El proyecto usa TypeScript 5.5.4 (compatible). Warnings son informativos únicamente.

### Build Errors

**Problema**: Errores de build en producción
**Solución**:

```bash
npm run clean
npm install
npm run build
```

### Testing Issues

**Problema**: Tests fallan por variables de entorno
**Solución**: Tests incluyen mocking automático de env vars

## 📚 Documentación Adicional

- [Arquitectura Frontend](./Info_back/arquitectrua.md)
- [Plan de Trabajo](./Info_back/plan%20de%20trabajo.md)
- [Documentación Backend](./Info_back/DOCUMENTACION_COMPLETA_BACKEND_UTALK.md)
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [shadcn-svelte Docs](https://shadcn-svelte.com/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'Add nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Pull Request

### Reglas de Contribución

- Todos los commits deben pasar quality gates
- Tests requeridos para nuevas features
- Documentación actualizada para cambios mayores
- Seguir convenciones de código establecidas

## 📄 Licencia

Este proyecto es propiedad privada. Todos los derechos reservados.

---

**Versión del proyecto**: 1.0.0  
**Última actualización**: Diciembre 2024
