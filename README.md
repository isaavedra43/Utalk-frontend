# UTalk Frontend

Frontend modular profesional para plataforma de comunicación empresarial construido con React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui.

## 🚀 Tecnologías

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes UI
- **React Query** - Estado del servidor
- **React Router** - Enrutamiento
- **Socket.IO** - Comunicación en tiempo real
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## 📁 Estructura del Proyecto

```
src/
├── assets/             # Recursos estáticos (imágenes, logos, fuentes)
├── components/         # Componentes UI globales
│   ├── ui/            # Componentes shadcn/ui (NO SOBRESCRIBIR)
│   └── common/        # Componentes compartidos multi-módulo
├── layouts/           # Layouts globales (Dashboard, Auth, etc.)
├── modules/           # Módulos de negocio organizados por feature
│   ├── crm/          # Gestión de contactos y clientes
│   ├── chat/         # Sistema de mensajería
│   ├── campaigns/    # Campañas y segmentación
│   ├── team/         # Gestión de equipo
│   ├── knowledge/    # Base de conocimiento
│   ├── dashboard/    # Analytics y reportes
│   └── settings/     # Configuración de la aplicación
├── hooks/             # Custom hooks (useAuth, useFetch, etc.)
├── contexts/          # Contextos de React (Auth, Theme, etc.)
├── services/          # Servicios y clientes API
│   └── api/          # Endpoints organizados por módulo
├── types/             # Definiciones de tipos TypeScript
├── lib/               # Utilidades y helpers
├── pages/             # Componentes de rutas principales
├── tests/             # Configuración y utilities de testing
├── mocks/             # Datos mock para desarrollo
└── theme/             # Configuración de tema personalizado
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

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

### Variables de Entorno
Configura las siguientes variables en tu archivo `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_AUTH_DOMAIN=localhost
VITE_APP_NAME=UTalk
```

## 📜 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting con ESLint
- `npm run test` - Ejecutar tests
- `npm run test:ui` - Tests con interfaz visual

## 🏗️ Arquitectura y Convenciones

### Módulos de Negocio
Cada módulo en `/modules` debe seguir esta estructura:
```
modules/[modulo]/
├── components/     # Componentes específicos del módulo
├── hooks/         # Hooks específicos del módulo
├── services/      # Lógica de API específica
├── types/         # Tipos específicos del módulo
├── utils/         # Utilidades específicas
└── index.ts       # Exportaciones públicas del módulo
```

### Importaciones
Usa las rutas absolutas configuradas:
```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { ContactService } from '@/modules/crm/services'
```

### Componentes UI
- **shadcn/ui**: Componentes en `/components/ui` - NO modificar directamente
- **Personalizados**: Componentes propios en `/components/common`
- **Específicos**: Componentes de módulo en `/modules/[modulo]/components`

### Estado y Datos
- **React Query**: Para estado del servidor y cache
- **React Context**: Para estado global de UI
- **Local State**: useState/useReducer para estado local

## 🎨 Estilos y Temas

### Tailwind CSS
- Configuración optimizada para shadcn/ui
- Variables CSS para temas personalizados
- Responsive design mobile-first

### Personalización de Tema
Los tokens de color están en `/src/theme/colors.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... más tokens */
}
```

## 🧪 Testing

### Configuración
- **Vitest**: Framework de testing
- **@testing-library**: Testing utilities para React
- **jsdom**: Entorno DOM para tests

### Estructura de Tests
```
src/tests/
├── setup.ts           # Configuración global
├── utils/             # Utilities para testing
└── __mocks__/         # Mocks globales
```

## 📦 Extensiones Recomendadas (VSCode)

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "@typescript-eslint.typescript-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 🚨 Reglas Importantes

1. **NO sobrescribir** archivos en `/components/ui` con generadores externos
2. **Siempre usar** TypeScript estricto - no `any` sin justificación
3. **Seguir** estructura modular - no mezclar lógica entre módulos
4. **Usar** React Query para todas las llamadas a API
5. **Mantener** componentes pequeños y con responsabilidad única

## 🔗 Integración con Backend

El backend expone:
- **REST API**: Endpoints CRUD para todas las entidades
- **WebSocket**: Comunicación en tiempo real para chat
- **Autenticación**: JWT tokens con refresh automático

### Configuración de API
```typescript
// src/services/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})
```

## 📈 Próximos Pasos

1. **Configurar** autenticación y rutas protegidas
2. **Implementar** módulos por prioridad de negocio
3. **Integrar** WebSocket para funcionalidades en tiempo real
4. **Añadir** tests unitarios y de integración
5. **Configurar** CI/CD pipeline

## 👥 Contribución

1. Crear rama desde `develop`
2. Seguir convenciones de nomenclatura
3. Escribir tests para nuevas funcionalidades
4. Revisar código antes de merge
5. Mantener documentación actualizada

---

**Nota**: Esta estructura está diseñada para escalar con equipos enterprise. Cada módulo es independiente y puede desarrollarse en paralelo por diferentes desarrolladores. 