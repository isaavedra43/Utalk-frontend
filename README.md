# 🚀 UTalk Frontend

Sistema de mensajería multicanal con CRM integrado - Frontend desarrollado con SvelteKit.

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 📋 Descripción

UTalk Frontend es la interfaz de usuario para el sistema de mensajería multicanal UTalk, que permite:

- 💬 **Mensajería en tiempo real** con WebSocket
- 🔐 **Autenticación segura** con JWT
- 📱 **Interfaz responsive** tipo Slack/Discord
- 🎨 **UI moderna** con shadcn-svelte
- ♿ **Accesible** con estándares WCAG
- 🔄 **Notificaciones push** (PWA-ready)

## 🛠️ Stack Tecnológico

| Tecnología           | Versión | Propósito                |
| -------------------- | ------- | ------------------------ |
| **SvelteKit**        | ^2.22.0 | Framework principal      |
| **TypeScript**       | ^5.0.0  | Tipado estático          |
| **Tailwind CSS**     | ^3.4.17 | Sistema de estilos       |
| **shadcn-svelte**    | ^1.0.6  | Componentes UI           |
| **Axios**            | ^1.7.8  | Cliente HTTP             |
| **Socket.IO Client** | ^4.8.1  | Comunicación tiempo real |
| **TanStack Query**   | ^5.61.5 | Gestión estado servidor  |
| **Vitest**           | ^3.2.4  | Testing framework        |
| **ESLint**           | ^9.32.0 | Linting                  |
| **Prettier**         | ^3.6.2  | Formateo de código       |

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git** >= 2.30
- **VS Code** (recomendado) con extensiones sugeridas

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd utalk-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en [http://localhost:5173](http://localhost:5173)

### 🔧 Configuración del Editor

**Para VS Code (recomendado):**

1. **Extensiones automáticas**: Al abrir el proyecto, VS Code sugerirá instalar las extensiones recomendadas
2. **Configuración automática**: Las configuraciones de formato y lint están preconfiguradas
3. **Tailwind CSS**: Autocompletado y validación incluidos

**Extensiones esenciales:**

- Svelte para VS Code
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter
- Error Lens (para ver errores inline)

## 📁 Estructura del Proyecto

```
utalk-frontend/
├── src/
│   ├── routes/                    # Páginas de SvelteKit
│   │   ├── +layout.svelte        # Layout principal
│   │   └── +page.svelte          # Página inicial
│   ├── lib/
│   │   ├── components/
│   │   │   └── ui/               # Componentes shadcn-svelte
│   │   ├── stores/               # Estado global (Svelte stores)
│   │   ├── services/             # Servicios API y WebSocket
│   │   ├── utils/                # Utilidades y helpers
│   │   ├── types/                # Definiciones TypeScript
│   │   └── constants.ts          # Constantes globales
│   ├── app.css                   # Estilos globales
│   └── tests/
│       ├── unit/                 # Tests unitarios
│       ├── component/            # Tests de componentes
│       └── e2e/                  # Tests end-to-end
├── static/                       # Archivos estáticos
├── .github/workflows/            # CI/CD con GitHub Actions
├── .vscode/                      # Configuraciones de VS Code
│   ├── extensions.json          # Extensiones recomendadas
│   └── settings.json            # Configuraciones del editor
└── scripts/                      # Scripts de utilidad
```

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Servidor de desarrollo
npm run build             # Build de producción
npm run preview           # Vista previa del build

# Testing
npm test                  # Tests en modo watch
npm run test:run          # Tests una sola vez
npm run test:ui           # Tests con interfaz visual
npm run test:coverage     # Tests con coverage

# Calidad de código
npm run lint              # Ejecutar ESLint
npm run lint:fix          # Corregir errores de ESLint
npm run format            # Formatear código con Prettier
npm run format:check      # Verificar formato sin cambios

# Verificación completa
npm run validate          # Lint + Format + TypeCheck + Tests
npm run validate:full     # Validación completa con reinstall y build
npm run type-check        # Verificación de tipos TypeScript
npm run check             # Verificación de Svelte

# Auditoría y mantenimiento
npm run audit:security    # Audit de seguridad
npm run audit:deps        # Verificar dependencias desactualizadas
npm run clean             # Limpiar archivos generados

# Hooks (ejecutados automáticamente)
npm run precommit         # Hook pre-commit (lint-staged)
npm run prepush           # Hook pre-push (validación + build)
```

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# URLs del Backend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Firebase (notificaciones push)
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_PROJECT_ID=tu_project_id
# ... más configuraciones
```

### Configuración del Backend

Asegúrate de que el backend UTalk esté ejecutándose en el puerto 3001 y configure CORS para permitir requests desde `http://localhost:5173`.

## 🎨 Sistema de Diseño

### Colores Principales

```css
/* Colores primarios (azul) */
primary-500: #3b82f6
primary-600: #2563eb

/* Colores secundarios (gris) */
secondary-500: #64748b
secondary-600: #475569

/* Estados */
success-500: #22c55e
warning-500: #f59e0b
error-500: #ef4444
```

### Componentes UI

Utilizamos shadcn-svelte para componentes base:

- ✅ Button
- ✅ Dialog
- ✅ Input
- ✅ Alert
- ✅ Avatar
- ✅ Badge
- ✅ Card

```svelte
<script>
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
</script>

<Button variant="default">Click me</Button>
<Input placeholder="Escribe aquí..." />
```

## 📱 Funcionalidades Implementadas

### ✅ Configuración Base

- [x] SvelteKit con TypeScript
- [x] Tailwind CSS v3 configurado
- [x] shadcn-svelte integrado
- [x] ESLint + Prettier configurados
- [x] Husky + lint-staged
- [x] Vitest para testing
- [x] CI/CD con GitHub Actions
- [x] Axios para HTTP requests
- [x] Socket.IO para tiempo real
- [x] TanStack Query para estado
- [x] TypeScript modo estricto
- [x] Configuración VS Code

### 🔜 Por Implementar (Roadmap)

- [ ] Sistema de autenticación
- [ ] Interfaz de chat en tiempo real
- [ ] Gestión de conversaciones
- [ ] Envío de archivos multimedia
- [ ] Notificaciones push
- [ ] Panel de administración

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests en modo watch
npm test

# Tests una sola vez
npm run test:run

# Tests con interfaz visual
npm run test:ui

# Tests con coverage
npm run test:coverage
```

### Estructura de Tests

```typescript
// Ejemplo de test unitario
import { describe, it, expect } from 'vitest';
import { APP_CONFIG } from '$lib/constants';

describe('Constants', () => {
  it('should have correct app name', () => {
    expect(APP_CONFIG.NAME).toBe('UTalk');
  });
});
```

## 🔍 Calidad de Código

### Pre-commit Hooks

Automáticamente se ejecutan antes de cada commit:

- ✅ ESLint (linting)
- ✅ Prettier (formateo)
- ✅ Type checking

### Pre-push Hooks

Antes de cada push se verifica:

- ✅ Validación completa (lint + format + types + tests)
- ✅ Build exitoso
- ✅ Audit de seguridad

### CI/CD Pipeline

En cada push/PR se verifica:

1. **Lint** - Calidad de código
2. **Format** - Formateo consistente
3. **Type Check** - Verificación de tipos
4. **Svelte Check** - Validación de Svelte
5. **Tests** - Tests unitarios
6. **Build** - Compilación exitosa
7. **Security Audit** - Vulnerabilidades

## 🤝 Contribución

### Workflow de Desarrollo

1. **Fork** del repositorio
2. **Branch** desde `develop`: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollo** con commits descriptivos
4. **Tests** - Asegurar que pasen todos los tests
5. **Pull Request** hacia `develop`

### Estándares

- ✅ **Commits**: Seguir [Conventional Commits](https://conventionalcommits.org)
- ✅ **Código**: Debe pasar ESLint sin warnings
- ✅ **Tests**: Coverage mínimo del 80%
- ✅ **Documentación**: Actualizar README si es necesario

### Ejemplo de Commit

```bash
git commit -m "feat(auth): add login form validation

- Add Joi validation schema
- Implement form error handling
- Add unit tests for validation logic

Closes #123"
```

## 📚 Documentación Adicional

- [Arquitectura del Frontend](./Info_back/arquitectrua.md)
- [Integración Backend](./Info_back/BACKEND_ADVANCED_LOGIC_CORREGIDO.md)
- [Plan de Trabajo](./Info_back/plan%20de%20trabajo.md)
- [SvelteKit Docs](https://kit.svelte.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## 🐛 Troubleshooting

### Problemas Comunes

**Error: Cannot connect to backend**

```bash
# Verificar que el backend esté corriendo
curl http://localhost:3001/health
```

**Error: TypeScript errors**

```bash
# Verificar tipos
npm run type-check
```

**Error: Linting failures**

```bash
# Corregir automáticamente
npm run lint:fix
```

**Error: Unknown at-rule warnings en VS Code**

```bash
# Instalar extensión Tailwind CSS IntelliSense
# Asegurar que VS Code usa las configuraciones del proyecto
```

## 📄 Licencia

Este proyecto es privado y propietario de UTalk.

## 👥 Equipo

- **Frontend Lead**: [Nombre]
- **Backend Integration**: [Nombre]
- **UI/UX Design**: [Nombre]

---

**🔗 Enlaces útiles:**

- [Backend Repository](https://github.com/isaavedra43/Utalk-backend)
- [Figma Designs](link-to-figma)
- [Production App](link-to-production)

**📞 Soporte:** frontend-team@utalk.com
