# UTalk Frontend - Sistema de Autenticación JWT

## Descripción General

Este es el frontend de UTalk construido con React 18 + TypeScript + Vite + Tailwind CSS. El sistema está completamente integrado con el backend Node.js/Express que utiliza Firebase Auth y emite tokens JWT propios.

## 🔐 Sistema de Autenticación

### Arquitectura de Autenticación

El sistema de autenticación está implementado con las siguientes tecnologías:

- **Frontend**: React Context API + JWT storage
- **Backend**: Node.js + Express + Firebase Auth + JWT
- **HTTP Client**: Axios con interceptores automáticos
- **Storage**: localStorage con clave única `jwt_token_utalk`

### Endpoints de Autenticación

El frontend consume los siguientes endpoints del backend:

| Endpoint | Método | Descripción | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/auth/login` | POST | Iniciar sesión | `{ email, password }` | `{ token, user, expiresIn }` |
| `/api/auth/me` | GET | Obtener perfil | Header: `Authorization: Bearer {token}` | `{ user }` |
| `/api/auth/logout` | POST | Cerrar sesión | Header: `Authorization: Bearer {token}` | `{ message }` |
| `/api/auth/profile` | PUT | Actualizar perfil | `{ name }` | `{ user, message }` |
| `/api/auth/refresh` | POST | Renovar token (futuro) | - | `{ token, expiresIn }` |

### Estructura del JWT

El token JWT contiene la siguiente información:

```json
{
  "id": "string",
  "email": "string", 
  "role": "string",
  "exp": "timestamp"
}
```

**Duración**: 24 horas

### Flujo de Autenticación

1. **Login**:
   - Usuario ingresa email y contraseña en `/login`
   - Frontend valida formato y llama a `POST /api/auth/login`
   - Backend valida credenciales y retorna JWT + datos de usuario
   - Frontend guarda JWT en localStorage y usuario en contexto
   - Redirección automática a dashboard `/`

2. **Verificación de Sesión**:
   - Al cargar la app, se ejecuta `checkSession()`
   - Si hay JWT en localStorage, llama a `GET /api/auth/me`
   - Si el token es válido, carga el usuario al contexto
   - Si no es válido, ejecuta logout automático

3. **Logout**:
   - Llama a `POST /api/auth/logout`
   - Limpia JWT del localStorage
   - Limpia usuario del contexto
   - Redirige a `/login`

4. **Expiración de Token**:
   - Los interceptores de Axios detectan respuestas 401/403
   - Ejecutan logout automático y redirigen a login

## 📁 Estructura de Archivos

### Archivos de Autenticación

```
client/
├── lib/
│   └── apiClient.ts          # Cliente Axios con interceptores JWT
├── hooks/
│   └── useAuth.tsx           # Hook principal de autenticación
├── components/
│   └── RequireAuth.tsx       # Componente de protección de rutas
├── pages/
│   ├── LoginPage.tsx         # Página de inicio de sesión
│   └── ForgotPasswordPage.tsx
└── main.tsx                  # Configuración de rutas protegidas

shared/
└── api.ts                    # Tipos TypeScript compartidos
```

### Componentes Principales

#### `useAuth` Hook

Proporciona toda la funcionalidad de autenticación:

```typescript
const {
  user,              // Usuario actual (null si no autenticado)
  isAuthenticated,   // Boolean: ¿está autenticado?
  isLoading,         // Boolean: ¿está cargando?
  error,             // String: mensaje de error
  login,             // Function: (email, password) => Promise<void>
  logout,            // Function: () => void
  checkSession,      // Function: () => Promise<void>
  updateProfile,     // Function: (name) => Promise<void>
  clearError         // Function: () => void
} = useAuth();
```

#### `RequireAuth` Component

Protege rutas que requieren autenticación:

```jsx
<RequireAuth>
  <Dashboard />
</RequireAuth>
```

#### `apiClient` 

Cliente HTTP con interceptores automáticos:

```typescript
import apiClient from '@/lib/apiClient';

// Las peticiones incluyen automáticamente el JWT
const response = await apiClient.get('/protected-endpoint');
```

## 🛡️ Seguridad

### Almacenamiento del Token

- **Clave**: `jwt_token_utalk` (única para evitar conflictos)
- **Storage**: localStorage (persiste entre sesiones)
- **Limpieza automática**: En logout y errores 401/403

### Protección de Rutas

- **Rutas públicas**: `/login`, `/forgot-password`
- **Rutas protegidas**: Todas las demás (requieren JWT válido)
- **Verificación automática**: En cada carga de página
- **Redirección automática**: Si no hay sesión válida

### Interceptores HTTP

- **Request**: Agrega automáticamente `Authorization: Bearer {token}`
- **Response**: Detecta errores de autenticación y ejecuta logout
- **Scope**: Solo peticiones a `/api/**`

## 🔧 Configuración y Uso

### Para Desarrolladores

1. **Consumir autenticación en componentes**:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }
  
  return (
    <div>
      <p>Hola {user?.name || user?.email}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

2. **Hacer peticiones a APIs protegidas**:

```tsx
import apiClient from '@/lib/apiClient';

// El JWT se incluye automáticamente
const fetchData = async () => {
  try {
    const response = await apiClient.get('/protected-data');
    return response.data;
  } catch (error) {
    // Los errores 401/403 ejecutan logout automático
    console.error('Error:', error);
  }
};
```

3. **Agregar nuevos endpoints protegidos**:

```tsx
// Solo usar apiClient para endpoints que requieren autenticación
const updateData = async (data: any) => {
  return await apiClient.put('/my-endpoint', data);
};
```

### Validaciones Implementadas

#### Frontend

- **Email**: Formato válido requerido
- **Contraseña**: Mínimo 6 caracteres
- **Campos requeridos**: Email y contraseña obligatorios
- **Feedback visual**: Errores mostrados en tiempo real

#### Backend Integration

- **Error handling**: Mensajes específicos del backend
- **Loading states**: Durante peticiones de autenticación
- **Network errors**: Manejo de errores de conexión

## ⚠️ Consideraciones Importantes

### Estado Actual del Backend

- **Validación de contraseña**: Actualmente el backend NO valida la contraseña, solo verifica el email y emite JWT
- **Preparado para futuro**: La lógica está implementada para manejar validación de contraseña cuando se habilite

### Refresh Token (Futuro)

El sistema está preparado para implementar refresh tokens:

- Endpoint `/api/auth/refresh` definido en tipos
- Lógica de renovación automática lista para implementar
- Lugar específico marcado en el código para agregar esta funcionalidad

### Roles y Permisos (Futuro)

- El JWT incluye el campo `role`
- La UI muestra el rol del usuario
- Sistema preparado para implementar lógica de permisos

## 🚀 Scripts de Desarrollo

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Verificar tipos de TypeScript
npm run typecheck

# Formatear código
npm run format.fix
```

## 🛠️ Troubleshooting

### Token Expirado

Si el token expira, el sistema:
1. Detecta automáticamente el error 401/403
2. Ejecuta logout automático
3. Redirige a `/login`
4. Muestra mensaje apropiado

### Pérdida de Sesión

Si se pierde la sesión (localStorage borrado):
1. `checkSession()` detecta la ausencia de token
2. No intenta peticiones innecesarias
3. Mantiene al usuario en estado no autenticado

### Errores de Red

Los interceptores manejan:
- Errores de conexión
- Timeouts (10 segundos)
- Reintentos automáticos (excepto 401/403)

## 📞 Soporte

Para problemas relacionados con autenticación:

1. Verificar que el backend esté corriendo
2. Revisar la consola del navegador para errores
3. Comprobar Network tab para ver peticiones HTTP
4. Verificar localStorage para presencia del token

---

**Versión**: 1.0.0
**Última actualización**: $(date)
**Backend compatible**: Node.js + Express + Firebase Auth + JWT 