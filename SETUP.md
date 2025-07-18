# Configuración Inicial - UTalk Frontend

Esta guía te ayudará a configurar el proyecto desde cero.

## 📋 Prerrequisitos

- **Node.js** 18.0 o superior
- **npm** 8.0 o superior (o yarn/pnpm)
- **Git** para control de versiones

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu entorno
nano .env
```

### 3. Verificar configuración

```bash
# Ejecutar linter
npm run lint

# Ejecutar tests
npm run test

# Iniciar servidor de desarrollo
npm run dev
```

## ✅ Dependencias Incluidas

### Principales
- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** + **shadcn/ui** para UI
- **React Query** para estado del servidor
- **React Router** para navegación
- **Axios** para API calls
- **Socket.IO** para tiempo real

### UI y Estilos
- `class-variance-authority` - Variantes de componentes
- `clsx` + `tailwind-merge` - Utilidades de clases
- `@radix-ui/react-slot` - Primitivas UI
- `@radix-ui/react-avatar` - Componente Avatar
- `tailwindcss-animate` - Animaciones

### Formularios y Validación
- `react-hook-form` - Manejo de formularios
- `@hookform/resolvers` - Resolvers para validación
- `zod` - Esquemas de validación

### Testing
- `vitest` - Framework de testing
- `@testing-library/jest-dom` - Matchers de testing
- `jsdom` - DOM virtual para tests

## 🏗️ Estructura del Proyecto

```
src/
├── assets/             # Recursos estáticos
├── components/         # Componentes UI
│   ├── ui/            # shadcn/ui (Button, Card, Input, Badge, Avatar)
│   └── common/        # Componentes compartidos
├── contexts/          # Contextos de React
├── hooks/             # Custom hooks
├── layouts/           # Layouts de página
├── lib/               # Utilidades y configuración
├── modules/           # Módulos de negocio
│   ├── crm/          # Gestión de contactos
│   ├── chat/         # Sistema de mensajería
│   ├── campaigns/    # Campañas de marketing
│   ├── team/         # Gestión de equipo
│   ├── knowledge/    # Base de conocimiento
│   ├── dashboard/    # Panel principal
│   └── settings/     # Configuración
├── pages/             # Páginas y rutas
├── services/          # Servicios API
├── types/             # Tipos TypeScript
├── tests/             # Configuración de tests
├── mocks/             # Datos de prueba
└── theme/             # Configuración de tema
```

## 🔧 Próximos Pasos

### 1. Configurar Backend
- Asegúrate de que el backend esté corriendo en `http://localhost:8000`
- Actualiza `VITE_API_URL` en `.env` si usas otra URL

### 2. Añadir Componentes shadcn/ui

```bash
# Componentes adicionales disponibles:
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form

# Los componentes se añadirán automáticamente a src/components/ui/
```

### 3. Implementar Módulos
Cada módulo está preparado para implementación:

```bash
# Ejemplo: Implementar módulo CRM
# 1. Completar src/modules/crm/components/ContactList.tsx
# 2. Implementar src/modules/crm/services/contactService.ts
# 3. Añadir rutas en src/pages/AppRoutes.tsx
```

## 📦 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting con ESLint
- `npm run test` - Ejecutar tests
- `npm run test:ui` - Tests con interfaz visual

## 🎯 Componentes UI Disponibles

### ✅ Incluidos
- **Button** - Botón con variantes
- **Card** - Container con header/content/footer
- **Input** - Campo de entrada
- **Badge** - Etiquetas y estados
- **Avatar** - Fotos de perfil
- **LoadingSpinner** - Indicador de carga

### 📦 Fácil de añadir
```bash
npx shadcn-ui@latest add [component]
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de TypeScript
```bash
# Verificar configuración de paths
# Reiniciar TypeScript server en VSCode: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### Error de Tailwind/shadcn
Los componentes están configurados correctamente con:
- `tailwindcss-animate` para animaciones
- `class-variance-authority` para variantes
- `@radix-ui` primitives necesarias

## 📚 Recursos

- [React 18 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
- [Vite](https://vitejs.dev/)

## 🤝 Contribución

1. Sigue las convenciones de nomenclatura
2. Escribe tests para nuevas funcionalidades
3. Mantén la documentación actualizada
4. Usa TypeScript estricto
5. Revisa el código antes de commit

---

**¡Proyecto limpio y listo para desarrollo!** ✨ 