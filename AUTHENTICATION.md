# SISTEMA DE AUTENTICACIÓN JWT - DOCUMENTACIÓN COMPLETA

## Descripción General

El sistema implementa autenticación JWT (JSON Web Tokens) completa con roles, permisos y protección de endpoints. Todos los endpoints críticos están protegidos y requieren autenticación válida.

---

## Características Implementadas

### ✅ **Autenticación JWT Completa**
- Registro de usuarios con validación robusta
- Login con username o email
- Tokens JWT seguros con expiración configurable
- Logout (invalidación en frontend)

### ✅ **Sistema de Roles y Permisos**
- **Roles**: `admin`, `agent`
- **Permisos granulares**: `messages.read`, `messages.write`, `crm.read`, etc.
- **Autorización por endpoint**: Middleware configurable

### ✅ **Seguridad Robusta**
- Passwords hasheados con bcrypt (12 rounds)
- Validación de contraseñas seguras (mayúscula, minúscula, número, carácter especial)
- Tokens firmados con secret configurable
- Headers de autorización Bearer estándar

### ✅ **Gestión de Usuarios**
- CRUD completo de usuarios
- Activación/desactivación de cuentas
- Cambio de contraseñas
- Estadísticas de usuarios

---

## Endpoints de Autenticación

### **POST /api/users/auth/login**
Iniciar sesión con username o email.

**Request:**
```json
{
  "identifier": "admin",  // username o email
  "password": "Admin123!@#"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "username": "admin",
      "email": "admin@company.com",
      "name": "Administrador del Sistema",
      "role": "admin",
      "department": "admin",
      "permissions": ["users.read", "users.write", "messages.read", "..."],
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
- `401` - Credenciales inválidas
- `403` - Cuenta desactivada
- `400` - Datos de entrada inválidos

### **POST /api/users/register**
Registrar nuevo usuario (solo admin).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request:**
```json
{
  "username": "nuevo_usuario",
  "email": "usuario@company.com",
  "password": "Password123!",
  "name": "Nombre del Usuario",
  "role": "agent",
  "department": "support"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "new-user-uuid",
      "username": "nuevo_usuario",
      "email": "usuario@company.com",
      "name": "Nombre del Usuario",
      "role": "agent",
      "department": "support",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### **GET /api/users/me**
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "username": "admin",
      "email": "admin@company.com",
      "name": "Administrador del Sistema",
      "role": "admin",
      "permissions": ["..."],
      "profile": {
        "avatar": null,
        "phone": null,
        "timezone": "America/Mexico_City",
        "language": "es"
      },
      "stats": {
        "totalLogins": 5,
        "lastLogin": "2024-01-15T10:30:00.000Z",
        "lastActivity": "2024-01-15T11:00:00.000Z"
      }
    }
  }
}
```

### **PUT /api/users/me/password**
Cambiar contraseña del usuario actual.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456@"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Uso del Token JWT

### **Estructura del Token**
```json
{
  "userId": "user-uuid",
  "username": "admin",
  "email": "admin@company.com",
  "role": "admin",
  "permissions": ["users.read", "users.write", "..."],
  "iat": 1642248600,
  "exp": 1642335000,
  "iss": "omnichannel-backend"
}
```

### **Envío en Requests**
Incluir el token en el header `Authorization`:

```javascript
// Frontend - JavaScript
const token = localStorage.getItem('authToken');

fetch('/api/channels/twilio/send/whatsapp', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '+1234567890',
    message: 'Hola desde el sistema!'
  })
});
```

```bash
# cURL
curl -X POST http://localhost:3000/api/channels/twilio/send/whatsapp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Hola!"}'
```

---

## Roles y Permisos

### **Roles Disponibles**

#### **Admin**
- **Descripción**: Acceso completo al sistema
- **Permisos**: Todos los permisos disponibles
- **Puede**: Gestionar usuarios, configuración, ver todo, enviar mensajes

#### **Agent**
- **Descripción**: Agente de atención al cliente
- **Permisos**: Limitados a operaciones de mensajería y CRM básico
- **Puede**: Ver conversaciones, enviar mensajes, acceder a CRM

### **Lista de Permisos**

```javascript
// Permisos de Admin
[
  'users.read',           // Ver usuarios
  'users.write',          // Crear/editar usuarios
  'users.delete',         // Eliminar usuarios
  'conversations.read',   // Ver conversaciones
  'conversations.write',  // Crear/editar conversaciones
  'conversations.delete', // Eliminar conversaciones
  'messages.read',        // Ver mensajes
  'messages.write',       // Enviar mensajes
  'campaigns.read',       // Ver campañas
  'campaigns.write',      // Crear/editar campañas
  'campaigns.delete',     // Eliminar campañas
  'dashboard.read',       // Ver dashboard
  'settings.read',        // Ver configuración
  'settings.write',       // Modificar configuración
  'crm.read',            // Ver CRM
  'crm.write'            // Editar CRM
]

// Permisos de Agent
[
  'conversations.read',
  'conversations.write',
  'messages.read',
  'messages.write',
  'crm.read',
  'dashboard.read'
]
```

---

## Endpoints Protegidos

### **Twilio (WhatsApp/SMS)**
```
POST /api/channels/twilio/send/whatsapp    # Requiere: messages.write
POST /api/channels/twilio/send/sms         # Requiere: messages.write
GET  /api/channels/twilio/message/:id/status # Requiere: messages.read
```

### **CRM**
```
GET  /api/crm/clients                      # Requiere: crm.read
POST /api/crm/clients                      # Requiere: crm.write
```

### **Campaigns**
```
GET  /api/campaigns/campaigns              # Requiere: campaigns.read
POST /api/campaigns/campaigns              # Requiere: campaigns.write
```

### **Dashboard**
```
GET  /api/dashboard/overview               # Requiere: dashboard.read
```

### **Settings**
```
GET  /api/settings/channels                # Requiere: role admin
PUT  /api/settings/channels/:channel       # Requiere: role admin
```

### **Users**
```
GET  /api/users/users                      # Requiere: role admin
POST /api/users/register                   # Requiere: role admin
PUT  /api/users/users/:id/status           # Requiere: role admin
```

---

## Configuración

### **Variables de Entorno**
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_ISSUER=omnichannel-backend
```

### **Configuración en config.js**
```javascript
jwt: {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  issuer: process.env.JWT_ISSUER || 'omnichannel-backend'
}
```

---

## Inicialización del Sistema

### **1. Crear el Primer Admin**
```bash
# Ejecutar script de inicialización
node scripts/createAdmin.js
```

**Output:**
```
🔧 Iniciando creación del usuario administrador...

✅ Usuario administrador creado exitosamente!

📋 Detalles del usuario:
   Username: admin
   Email: admin@company.com
   Role: admin
   ID: admin-uuid-here

🔑 Credenciales de acceso:
   Username/Email: admin
   Password: Admin123!@#

⚠️  IMPORTANTE:
   1. Cambia la contraseña inmediatamente después del primer login
   2. Guarda estas credenciales en un lugar seguro
   3. No compartas estas credenciales por medios inseguros
```

### **2. Primer Login**
```bash
curl -X POST http://localhost:3000/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin",
    "password": "Admin123!@#"
  }'
```

### **3. Cambiar Contraseña**
```bash
curl -X PUT http://localhost:3000/api/users/me/password \
  -H "Authorization: Bearer <token-del-login>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin123!@#",
    "newPassword": "NuevaPasswordSegura456@"
  }'
```

---

## Manejo de Errores

### **Errores de Autenticación**

#### **401 - No Autorizado**
```json
{
  "success": false,
  "error": "AUTHENTICATION_REQUIRED",
  "message": "Authorization header is required"
}
```

```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "Token has expired"
}
```

```json
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "Invalid token"
}
```

#### **403 - Prohibido**
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "You do not have permission to access this resource"
}
```

```json
{
  "success": false,
  "error": "ACCOUNT_DEACTIVATED",
  "message": "Your account has been deactivated"
}
```

---

## Ejemplos de Integración Frontend

### **React - Hook de Autenticación**
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const login = async (identifier, password) => {
    const response = await fetch('/api/users/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('authToken', data.data.token);
      return data;
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const sendMessage = async (to, message) => {
    const response = await fetch('/api/channels/twilio/send/whatsapp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, message })
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout(); // Token expirado
      }
      throw new Error('Failed to send message');
    }

    return response.json();
  };

  return { user, token, login, logout, sendMessage };
};
```

### **Interceptor de Axios**
```javascript
import axios from 'axios';

// Configurar interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Seguridad y Mejores Prácticas

### ✅ **Implementado**
- Passwords hasheados con bcrypt (12 rounds)
- Validación robusta de contraseñas
- Tokens JWT firmados con secret seguro
- Expiración configurable de tokens
- Logging de intentos de autenticación
- Validación de usuarios activos

### 🔄 **Recomendaciones Futuras**
- Implementar refresh tokens
- Blacklist de tokens para logout real
- Rate limiting en login
- 2FA (autenticación de dos factores)
- OAuth2 integration
- Session management avanzado

---

## Troubleshooting

### **Token Expirado**
```
Error: TOKEN_EXPIRED
Solución: Hacer login nuevamente
```

### **Permisos Insuficientes**
```
Error: INSUFFICIENT_PERMISSIONS
Solución: Verificar rol y permisos del usuario
```

### **Usuario No Encontrado**
```
Error: USER_NOT_FOUND
Solución: Verificar que el usuario existe y está activo
```

### **Password No Válido**
```
Error: Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character
Solución: Usar password que cumpla los requisitos de seguridad
```

---

## Testing del Sistema

### **Script de Pruebas**
```bash
# 1. Crear admin
node scripts/createAdmin.js

# 2. Test login
curl -X POST http://localhost:3000/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin", "password": "Admin123!@#"}'

# 3. Test endpoint protegido
curl -X POST http://localhost:3000/api/channels/twilio/send/whatsapp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test"}'

# 4. Test sin token (debe fallar)
curl -X POST http://localhost:3000/api/channels/twilio/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test"}'
```

**¡El sistema de autenticación JWT está completamente implementado y listo para producción!** 🔐🚀 