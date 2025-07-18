# 🔐 **SISTEMA DE AUTENTICACIÓN UTalk**

## 📋 **RESUMEN EJECUTIVO**

El sistema de autenticación de UTalk implementa un flujo híbrido de **Firebase Auth + Backend JWT** que garantiza seguridad empresarial y escalabilidad.

**Flujo:** `Firebase Auth` → `idToken` → `Backend UTalk` → `JWT Propio` → `Sesión Persistente`

---

## 🔄 **FLUJO COMPLETO DE AUTENTICACIÓN**

### **1. Login del Usuario**
```typescript
// 1. Usuario ingresa email/password en LoginPage
await login(email, password)

// 2. AuthContext → Firebase Auth
const firebaseUser = await signInWithEmailAndPassword(auth, email, password)
const idToken = await firebaseUser.user.getIdToken()

// 3. AuthContext → Backend UTalk
const response = await apiClient.post('/auth/login', { idToken })
const { user, token } = response

// 4. Almacenamiento persistente
localStorage.setItem('auth_token', token)      // JWT del backend
localStorage.setItem('user_data', JSON.stringify(user))

// 5. Estado global actualizado
dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
```

### **2. Verificación de Sesión**
```typescript
// Al cargar la app o refrescar página
const token = localStorage.getItem('auth_token')

if (token) {
  // Verificar con backend UTalk
  const user = await apiClient.get('/auth/me')  // Con JWT en header
  // Si válido: mantener sesión
  // Si inválido: limpiar y redirigir a login
}
```

### **3. Logout Completo**
```typescript
// Logout en 3 pasos
await logout()

// 1. Invalidar sesión en backend
await apiClient.post('/auth/logout')

// 2. Cerrar sesión en Firebase
await signOut(auth)

// 3. Limpiar estado local
localStorage.removeItem('auth_token')
localStorage.removeItem('user_data')
dispatch({ type: 'AUTH_LOGOUT' })
```

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Componentes Principales**

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| **AuthContext** | `src/contexts/AuthContext.tsx` | Estado global, login/logout |
| **AuthTypes** | `src/contexts/auth-types.ts` | Tipos User, AuthState, actions |
| **useAuth Hook** | `src/hooks/useAuthContext.ts` | Hook para consumir contexto |
| **LoginPage** | `src/pages/auth/LoginPage.tsx` | UI de autenticación |
| **ProtectedRoute** | `src/pages/AppRoutes.tsx` | Protección de rutas |
| **Firebase Config** | `src/lib/firebase.ts` | Configuración Firebase |
| **API Client** | `src/services/apiClient.ts` | Cliente HTTP con interceptors |

### **Flujo de Datos**
```
LoginPage → useAuth() → AuthContext → Firebase Auth → Backend API → localStorage + Estado
```

---

## 📊 **ESTRUCTURA DE DATOS**

### **Usuario (User)**
```typescript
interface User {
  id: string                    // Firebase UID
  email: string                 // Email del usuario
  name: string                  // Nombre completo
  role: 'admin' | 'agent' | 'viewer'  // Rol en el sistema
  status: 'active' | 'inactive'       // Estado del usuario
  avatar?: string               // URL del avatar
  createdAt: string            // Timestamp de creación
  updatedAt?: string           // Última actualización
  performance?: {              // KPIs del usuario
    totalMessages?: number
    avgResponseTime?: number
    customerSatisfaction?: number
  }
}
```

### **Estado de Autenticación (AuthState)**
```typescript
interface AuthState {
  user: User | null           // Usuario autenticado
  token: string | null        // JWT del backend
  isAuthenticated: boolean    // Estado de autenticación
  isLoading: boolean         // Estado de carga
  error: string | null       // Mensajes de error
}
```

### **Almacenamiento Local**
```typescript
// localStorage keys utilizadas
'auth_token'    // JWT del backend UTalk
'user_data'     // JSON stringificado del objeto User
```

---

## 🔑 **ENDPOINTS DEL BACKEND**

### **POST /api/auth/login**
```typescript
// Request
{
  idToken: string  // Token de Firebase Auth
}

// Response
{
  user: User,      // Datos del usuario
  token: string    // JWT propio del backend
}
```

### **GET /api/auth/me**
```typescript
// Headers: Authorization: Bearer <jwt_token>
// Response: User object (si token válido)
// Error 401: Si token inválido/expirado
```

### **POST /api/auth/logout**
```typescript
// Headers: Authorization: Bearer <jwt_token>
// Response: { message: "Logout successful" }
// Invalida el token en el backend
```

---

## 🛡️ **SEGURIDAD Y PROTECCIÓN**

### **Interceptors HTTP**
```typescript
// src/services/apiClient.ts

// Request Interceptor - Agregar JWT automáticamente
config.headers.Authorization = `Bearer ${localStorage.getItem('auth_token')}`

// Response Interceptor - Manejo de errores 401/403
if (error.response?.status === 401) {
  // Token expirado → logout automático
  localStorage.clear()
  window.location.href = '/login'
}
```

### **Rutas Protegidas**
```typescript
// src/pages/AppRoutes.tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  return <>{children}</>
}
```

### **Roles y Permisos**
```typescript
// Roles disponibles en el sistema
type UserRole = 'admin' | 'agent' | 'viewer'

// admin:  Acceso completo al sistema
// agent:  Gestión de conversaciones y mensajes  
// viewer: Solo lectura en módulos específicos
```

---

## ⚠️ **MANEJO DE ERRORES**

### **Errores de Firebase Auth**
```typescript
switch (error.code) {
  case 'auth/user-not-found':
  case 'auth/wrong-password':
    return 'Email o contraseña incorrectos'
  case 'auth/user-disabled':
    return 'Usuario deshabilitado'
  case 'auth/too-many-requests':
    return 'Demasiados intentos fallidos. Intenta más tarde'
}
```

### **Errores del Backend**
```typescript
if (error.response) {
  switch (error.response.status) {
    case 401: return 'Sesión expirada'
    case 403: return 'Sin permisos'
    case 500: return 'Error del servidor'
    default: return error.response.data?.message || 'Error del servidor'
  }
}
```

---

## 🚀 **EJEMPLOS DE USO**

### **En un Componente**
```typescript
import { useAuth } from '@/hooks/useAuth'

function MiComponente() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()

  if (isLoading) return <div>Cargando...</div>
  if (!isAuthenticated) return <div>No autorizado</div>

  return (
    <div>
      <h1>Bienvenido, {user?.name}</h1>
      <p>Rol: {user?.role}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

### **En un Servicio**
```typescript
import { apiClient } from '@/services/apiClient'

// El token se agrega automáticamente por el interceptor
const contacts = await apiClient.get('/contacts')
const newContact = await apiClient.post('/contacts', contactData)
```

### **Verificación Manual de Sesión**
```typescript
import { useAuth } from '@/hooks/useAuth'

function useSessionCheck() {
  const { user } = useAuth()
  
  const isAdmin = user?.role === 'admin'
  const isActive = user?.status === 'active'
  const hasAccess = isAdmin || (user?.role === 'agent' && isActive)
  
  return { isAdmin, isActive, hasAccess }
}
```

---

## 🎯 **CARACTERÍSTICAS IMPLEMENTADAS**

✅ **Firebase Auth integrado** - Email/password  
✅ **Backend JWT propio** - Token del sistema UTalk  
✅ **Persistencia de sesión** - localStorage + verificación  
✅ **Logout completo** - Firebase + Backend + Local  
✅ **Interceptors HTTP** - Token automático en requests  
✅ **Rutas protegidas** - ProtectedRoute y PublicRoute  
✅ **Manejo de errores** - Firebase + Backend específicos  
✅ **Roles y permisos** - admin/agent/viewer  
✅ **Loading states** - UX durante autenticación  
✅ **Auto-logout** - En tokens inválidos/expirados  

---

## 🔮 **PRÓXIMAS MEJORAS (OPCIONALES)**

- [ ] **Refresh Token** - Renovación automática de tokens
- [ ] **2FA (Two-Factor Auth)** - Autenticación de dos factores
- [ ] **Login social** - Google, Microsoft, etc.
- [ ] **Remember Me** - Sesiones extendidas
- [ ] **Password Reset** - Recuperación de contraseña
- [ ] **Session Management** - Gestión de múltiples sesiones
- [ ] **Activity Logging** - Log de acciones de usuarios

---

## 🎊 **RESULTADO FINAL**

**✅ Sistema de autenticación empresarial completo**  
**✅ Integración Firebase + Backend UTalk perfecta**  
**✅ Seguridad, UX y escalabilidad garantizadas**  
**✅ Documentación exhaustiva para mantenimiento**

**🚀 LISTO PARA PRODUCCIÓN CON MÁXIMA SEGURIDAD** 