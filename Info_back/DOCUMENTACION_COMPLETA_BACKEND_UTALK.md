# DOCUMENTACIÓN COMPLETA BACKEND UTALK - FRONTEND INTEGRATION

## 1. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### Variables de entorno necesarias para el frontend

| Variable                     | Descripción                       | Ejemplo / Formato     | Entorno donde aplica |
| ---------------------------- | --------------------------------- | --------------------- | -------------------- |
| API_BASE_URL                 | URL base del backend REST         | https://api.utalk.app | dev, staging, prod   |
| WS_URL                       | URL de conexión WebSocket         | wss://api.utalk.app   | dev, staging, prod   |
| FIREBASE_API_KEY             | Clave API de Firebase             | Alfanumérico          | dev, staging, prod   |
| FIREBASE_AUTH_DOMAIN         | Dominio de autenticación Firebase | utalk.firebaseapp.com | dev, staging, prod   |
| FIREBASE_PROJECT_ID          | ID de proyecto Firebase           | utalk                 | dev, staging, prod   |
| FIREBASE_STORAGE_BUCKET      | Bucket de almacenamiento Firebase | utalk.appspot.com     | dev, staging, prod   |
| FIREBASE_MESSAGING_SENDER_ID | Sender ID de Firebase             | numérico              | dev, staging, prod   |
| FIREBASE_APP_ID              | App ID de Firebase                | alfanumérico          | dev, staging, prod   |
| TWILIO_ACCOUNT_SID           | SID de cuenta Twilio              | alfanumérico          | dev, staging, prod   |
| TWILIO_AUTH_TOKEN            | Token de autenticación Twilio     | alfanumérico          | dev, staging, prod   |
| TWILIO_PHONE_NUMBER          | Número de teléfono Twilio         | +1234567890           | dev, staging, prod   |
| JWT_PUBLIC_KEY               | Clave pública para validar JWT    | PEM                   | dev, staging, prod   |
| CORS_ALLOWED_ORIGINS         | Orígenes permitidos para CORS     | https://app.utalk.app | dev, staging, prod   |
| MAX_UPLOAD_SIZE_MB           | Tamaño máximo de archivos (MB)    | 25                    | dev, staging, prod   |

### URLs exactas por entorno

| Entorno    | API REST URL              | WebSocket URL           |
| ---------- | ------------------------- | ----------------------- |
| Desarrollo | http://localhost:3000/api | ws://localhost:3000     |
| Staging    | https://staging.utalk.app | wss://staging.utalk.app |
| Producción | https://api.utalk.app     | wss://api.utalk.app     |

### Configuración de CORS

- **Allowed Origins:**
  - Desarrollo: http://localhost:5173
  - Staging: https://staging.utalk.app
  - Producción: https://app.utalk.app
- **Métodos permitidos:** GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers permitidos:** Content-Type, Authorization, X-Requested-With

### Claves de API necesarias

- **Firebase:** Todas las variables FIREBASE\_\*
- **Twilio:** TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

### Configuración WebSocket

- **Protocolo:** ws (dev), wss (staging/prod)
- **Puerto:** 3000 (dev), 443 (staging/prod)
- **Autenticación:** JWT en el query param o header `Authorization: Bearer <token>`
- **Path:** `/socket.io/`

---

## 2. ENDPOINTS REST COMPLETOS

### URL base por entorno

| Entorno    | URL base REST                 |
| ---------- | ----------------------------- |
| Desarrollo | http://localhost:3000/api     |
| Staging    | https://staging.utalk.app/api |
| Producción | https://api.utalk.app/api     |

### Tabla de endpoints principales

| Método | Endpoint                     | Headers requeridos                               | Body (ejemplo)                                        | Response (ejemplo)                                           | Códigos de error        | Rate limit | Validaciones                 |
| ------ | ---------------------------- | ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------ | ----------------------- | ---------- | ---------------------------- |
| POST   | /auth/login                  | Content-Type, Authorization                      | `{ "email": "user@utalk.app", "password": "123456" }` | `{ "token": "...", "refreshToken": "...", "user": { ... } }` | 401, 400, 429           | 10/min     | Email válido, password min 6 |
| POST   | /auth/refresh                | Content-Type, Authorization                      | `{ "refreshToken": "..." }`                           | `{ "token": "...", "refreshToken": "..." }`                  | 401, 400, 429           | 10/min     | Refresh token válido         |
| POST   | /auth/logout                 | Authorization                                    | -                                                     | `{ "success": true }`                                        | 401, 429                | 10/min     | Token válido                 |
| GET    | /users/me                    | Authorization                                    | -                                                     | `{ "user": { ... } }`                                        | 401, 429                | 30/min     | Token válido                 |
| GET    | /conversations               | Authorization                                    | -                                                     | `[ { "id": "...", ... } ]`                                   | 401, 429                | 30/min     | Token válido                 |
| POST   | /conversations               | Authorization, Content-Type                      | `{ "contactId": "...", "subject": "..." }`            | `{ "id": "...", ... }`                                       | 400, 401, 429           | 10/min     | contactId requerido          |
| GET    | /messages?conversationId=... | Authorization                                    | -                                                     | `[ { "id": "...", ... } ]`                                   | 400, 401, 429           | 60/min     | conversationId válido        |
| POST   | /messages                    | Authorization, Content-Type                      | `{ "conversationId": "...", "text": "Hola" }`         | `{ "id": "...", ... }`                                       | 400, 401, 429           | 60/min     | text: 1-2000 chars           |
| POST   | /media/upload                | Authorization, Content-Type: multipart/form-data | archivo                                               | `{ "url": "...", "id": "...", ... }`                         | 400, 401, 413, 415, 429 | 20/min     | MIME permitido, tamaño       |
| GET    | /media/:id                   | Authorization                                    | -                                                     | Archivo binario o JSON                                       | 404, 401, 429           | 60/min     | id válido                    |
| GET    | /contacts                    | Authorization                                    | -                                                     | `[ { "id": "...", ... } ]`                                   | 401, 429                | 30/min     | Token válido                 |
| POST   | /contacts                    | Authorization, Content-Type                      | `{ "name": "...", "phone": "..." }`                   | `{ "id": "...", ... }`                                       | 400, 401, 429           | 10/min     | name y phone requeridos      |
| GET    | /campaigns                   | Authorization                                    | -                                                     | `[ { "id": "...", ... } ]`                                   | 401, 429                | 30/min     | Token válido                 |
| POST   | /campaigns                   | Authorization, Content-Type                      | `{ "name": "...", "message": "..." }`                 | `{ "id": "...", ... }`                                       | 400, 401, 429           | 5/min      | name y message requeridos    |
| GET    | /dashboard/metrics           | Authorization                                    | -                                                     | `{ "summary": { ... }, ... }`                                | 401, 429                | 10/min     | Token válido                 |
| GET    | /team                        | Authorization                                    | -                                                     | `[ { "id": "...", ... } ]`                                   | 401, 403, 429           | 30/min     | Admin o agent                |
| GET    | /knowledge                   | Authorization                                    | -                                                     | `[ { "id": "...", ... } ]`                                   | 401, 429                | 30/min     | Token válido                 |
| POST   | /knowledge                   | Authorization, Content-Type                      | `{ "title": "...", "content": "..." }`                | `{ "id": "...", ... }`                                       | 400, 401, 429           | 10/min     | title y content requeridos   |

### Endpoints adicionales específicos

#### Conversaciones

- `GET /conversations/unassigned` - Conversaciones sin asignar
- `GET /conversations/stats` - Estadísticas de conversaciones
- `GET /conversations/search` - Búsqueda de conversaciones
- `PUT /conversations/:id/assign` - Asignar conversación
- `PUT /conversations/:id/unassign` - Desasignar conversación
- `POST /conversations/:id/transfer` - Transferir conversación
- `PUT /conversations/:id/status` - Cambiar estado
- `PUT /conversations/:id/priority` - Cambiar prioridad
- `PUT /conversations/:id/read-all` - Marcar como leída

#### Mensajes

- `GET /conversations/:conversationId/messages` - Mensajes de conversación
- `POST /conversations/:conversationId/messages` - Crear mensaje
- `PUT /conversations/:conversationId/messages/:messageId/read` - Marcar como leído
- `DELETE /conversations/:conversationId/messages/:messageId` - Eliminar mensaje
- `POST /messages/send` - Enviar mensaje independiente
- `POST /messages/webhook` - Webhook Twilio

#### Contactos

- `GET /contacts/stats` - Estadísticas de contactos
- `GET /contacts/search` - Búsqueda de contactos
- `POST /contacts/import` - Importar contactos CSV
- `GET /contacts/export` - Exportar contactos
- `GET /contacts/tags` - Obtener tags de contactos
- `POST /contacts/:id/tags` - Agregar tags
- `DELETE /contacts/:id/tags` - Remover tags

#### Campañas

- `POST /campaigns/:id/send` - Enviar campaña
- `PUT /campaigns/:id/pause` - Pausar campaña
- `PUT /campaigns/:id/resume` - Reanudar campaña
- `PUT /campaigns/:id/stop` - Detener campaña
- `GET /campaigns/:id/report` - Reporte de campaña
- `GET /campaigns/stats` - Estadísticas de campañas

#### Dashboard

- `GET /dashboard/message-stats` - Estadísticas de mensajes
- `GET /dashboard/contact-stats` - Estadísticas de contactos
- `GET /dashboard/campaign-stats` - Estadísticas de campañas
- `GET /dashboard/recent-activity` - Actividad reciente
- `GET /dashboard/export-report` - Exportar reporte
- `GET /dashboard/performance-metrics` - Métricas de rendimiento

#### Equipo

- `POST /team/invite` - Invitar miembro
- `PUT /team/:id/activate` - Activar miembro
- `PUT /team/:id/deactivate` - Desactivar miembro
- `PUT /team/:id/role` - Cambiar rol
- `POST /team/:id/reset-password` - Resetear contraseña
- `GET /team/kpis` - KPIs del equipo

#### Conocimiento

- `GET /knowledge/search` - Buscar en base de conocimiento
- `GET /knowledge/categories` - Obtener categorías
- `PUT /knowledge/:id/publish` - Publicar conocimiento
- `PUT /knowledge/:id/unpublish` - Despublicar conocimiento
- `POST /knowledge/:id/vote` - Votar conocimiento
- `POST /knowledge/:id/rate` - Calificar conocimiento

#### Twilio

- `POST /twilio/webhook` - Webhook de Twilio
- `GET /twilio/status` - Estado de Twilio

#### Health Check

- `GET /health` - Estado del sistema
- `GET /metrics` - Métricas del sistema (si habilitado)

---

## 3. WEBSOCKET EVENTS COMPLETOS

### URL de conexión

| Entorno    | URL WebSocket                      |
| ---------- | ---------------------------------- |
| Desarrollo | ws://localhost:3000/socket.io/     |
| Staging    | wss://staging.utalk.app/socket.io/ |
| Producción | wss://api.utalk.app/socket.io/     |

### Eventos principales

| Evento             | Payload request (ejemplo)            | Payload response (ejemplo)               | Orden | Errores posibles | Notas         |
| ------------------ | ------------------------------------ | ---------------------------------------- | ----- | ---------------- | ------------- |
| connect            | `{ token: "<jwt>" }`                 | `{ "status": "connected" }`              | 1     | 401, 403         | JWT requerido |
| disconnect         | -                                    | `{ "reason": "..." }`                    | N/A   | -                | -             |
| message:send       | `{ conversationId, text, mediaId? }` | `{ "id": "...", "status": "sent" }`      | 2     | 400, 401, 429    | -             |
| message:status     | `{ messageId, status }`              | `{ "id": "...", "status": "delivered" }` | 3     | 400, 401         | -             |
| conversation:join  | `{ conversationId }`                 | `{ "status": "joined" }`                 | 2     | 400, 401         | -             |
| conversation:leave | `{ conversationId }`                 | `{ "status": "left" }`                   | 2     | 400, 401         | -             |
| typing             | `{ conversationId, typing: true }`   | `{ "userId": "...", "typing": true }`    | 2     | 400, 401         | -             |
| error              | `{ code, message }`                  | `{ code, message }`                      | N/A   | -                | -             |

#### Orden de eventos

1. connect
2. conversation:join
3. message:send / typing / message:status
4. disconnect

#### Reconexión automática

- Socket.IO maneja reconexión automática por defecto.
- Configuración recomendada:
  - reconnection: true
  - reconnectionAttempts: 5
  - reconnectionDelay: 2000ms

#### Timeouts y heartbeats

- Heartbeat cada 25s (ping/pong de Socket.IO)
- Timeout de conexión: 10s

#### Manejo de errores

- Todos los errores se emiten como evento `error` con payload `{ code, message }`.

---

## 4. AUTENTICACIÓN Y AUTORIZACIÓN

### Flujo de login

1. POST `/auth/login` con email y password
2. Recibe `{ token, refreshToken, user }`
3. Usa `token` en header `Authorization` para todas las requests
4. Cuando el token expira, usa `/auth/refresh` con el `refreshToken`
5. Logout: POST `/auth/logout` (invalida refreshToken)

### Formato exacto de JWT

- **Header:**
  ```json
  { "alg": "RS256", "typ": "JWT" }
  ```
- **Payload:**
  ```json
  {
    "id": "userId",
    "email": "user@utalk.app",
    "role": "admin|agent|user",
    "iat": 1710000000,
    "exp": 1710003600
  }
  ```
- **Firma:** RS256

### Refresh token

- Se entrega en login y en refresh.
- POST `/auth/refresh` con `{ refreshToken }`
- Expira a los 7 días o al hacer logout.

### Logout

- POST `/auth/logout` con header Authorization y body vacío.

### Roles y permisos

| Endpoint       | admin | agent | user |
| -------------- | ----- | ----- | ---- |
| /users/me      | ✔    | ✔    | ✔   |
| /conversations | ✔    | ✔    | ✔   |
| /messages      | ✔    | ✔    | ✔   |
| /media/upload  | ✔    | ✔    | ✔   |
| /team          | ✔    | ✔    |      |
| /dashboard     | ✔    |       |      |

### Manejo de tokens expirados

- Código 401, mensaje: `"Token expirado o inválido"`

### Sesiones múltiples

- Permitidas. Cada dispositivo tiene su propio refreshToken.

---

## 5. MODELOS DE DATOS COMPLETOS

### User

```json
{
  "id": "u_123",
  "email": "user@utalk.app",
  "name": "Juan Pérez",
  "role": "agent",
  "avatarUrl": "https://cdn.utalk.app/avatars/u_123.png",
  "status": "online",
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-01T12:00:00Z"
}
```

- **Campos requeridos:** id, email, name, role, status
- **Opcionales:** avatarUrl
- **Tipos:** string, Date

### Conversation

```json
{
  "id": "c_456",
  "subject": "Soporte técnico",
  "contactId": "ct_789",
  "agentId": "u_123",
  "status": "open",
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-01T12:00:00Z"
}
```

- **Campos requeridos:** id, contactId, status
- **Opcionales:** agentId, subject

### Message

```json
{
  "id": "m_001",
  "conversationId": "c_456",
  "senderId": "u_123",
  "text": "Hola, ¿en qué puedo ayudarte?",
  "mediaUrl": null,
  "status": "sent",
  "createdAt": "2024-06-01T12:01:00Z"
}
```

- **Campos requeridos:** id, conversationId, senderId, text/status
- **Opcionales:** mediaUrl

### Contact

```json
{
  "id": "ct_789",
  "name": "María García",
  "phone": "+1234567890",
  "email": "maria@example.com",
  "tags": ["cliente", "vip"],
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-01T12:00:00Z"
}
```

- **Campos requeridos:** id, name, phone
- **Opcionales:** email, tags

### Campaign

```json
{
  "id": "cp_001",
  "name": "Campaña de bienvenida",
  "message": "¡Bienvenido a nuestro servicio!",
  "status": "active",
  "createdBy": "u_123",
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-01T12:00:00Z"
}
```

- **Campos requeridos:** id, name, message, status
- **Opcionales:** createdBy

### Knowledge

```json
{
  "id": "k_001",
  "title": "Cómo resetear contraseña",
  "content": "Pasos para resetear contraseña...",
  "category": "soporte",
  "tags": ["contraseña", "reset"],
  "isPublic": true,
  "status": "published",
  "authorEmail": "admin@utalk.app",
  "createdAt": "2024-06-01T12:00:00Z",
  "updatedAt": "2024-06-01T12:00:00Z"
}
```

- **Campos requeridos:** id, title, content, category, status
- **Opcionales:** tags, isPublic, authorEmail

### File

```json
{
  "id": "f_001",
  "originalName": "documento.pdf",
  "mimeType": "application/pdf",
  "size": 1024000,
  "url": "https://cdn.utalk.app/media/f_001",
  "uploadedBy": "u_123",
  "createdAt": "2024-06-01T12:00:00Z"
}
```

- **Campos requeridos:** id, originalName, mimeType, size, url
- **Opcionales:** uploadedBy

---

## 6. VALIDACIONES Y RESTRICCIONES

### Validaciones de campos

- **Email:** Formato RFC, único, máx. 100 caracteres
- **Password:** Mín. 6, máx. 64 caracteres
- **Nombre:** 1-50 caracteres, solo letras y espacios
- **Mensaje:** 1-2000 caracteres
- **Archivo:** Máx. 25MB, tipos permitidos: image/jpeg, image/png, video/mp4, audio/mpeg, application/pdf
- **Teléfono:** E.164, 10-15 dígitos
- **IDs:** Prefijo + UUID (ej: u_123, c_456)
- **Paginación:** limit 1-100, page >= 1

### Mensajes de error específicos

- `"Email inválido"`
- `"Password incorrecto"`
- `"Archivo demasiado grande"`
- `"Tipo de archivo no permitido"`
- `"Token expirado o inválido"`
- `"Conversación no encontrada"`
- `"Mensaje no encontrado"`
- `"Contacto no encontrado"`
- `"Campaña no encontrada"`
- `"Sin permisos para esta operación"`

### Códigos de error

| Código | Categoría  | Descripción                  |
| ------ | ---------- | ---------------------------- |
| 400    | validation | Parámetros inválidos         |
| 401    | auth       | No autorizado                |
| 403    | auth       | Prohibido                    |
| 404    | validation | No encontrado                |
| 409    | validation | Conflicto                    |
| 413    | validation | Archivo demasiado grande     |
| 415    | validation | Tipo de archivo no permitido |
| 422    | validation | Entidad no procesable        |
| 429    | rate limit | Demasiadas peticiones        |
| 500    | server     | Error interno del servidor   |

---

## 7. MANEJO DE ARCHIVOS

### Tipos de archivo permitidos

- **Imágenes:** image/jpeg, image/png
- **Videos:** video/mp4
- **Audio:** audio/mpeg
- **Documentos:** application/pdf

### Tamaños máximos

- **Imágenes:** 25MB
- **Videos:** 25MB
- **Audio:** 25MB
- **PDFs:** 10MB

### Proceso de upload

1. POST `/media/upload` con multipart/form-data
2. Campo del archivo debe llamarse `file`
3. Respuesta: `{ "url": "...", "id": "...", "mimeType": "...", "size": 12345 }`
4. URL de acceso: `https://cdn.utalk.app/media/<id>`

### URLs de archivos

- **Formato:** `https://cdn.utalk.app/media/<id>`
- **Expiración:** Solo si es temporal (campo `expiresAt`)
- **Acceso:** Requiere Authorization header

### Compresión automática

- Automática para imágenes >2MB
- Mantiene calidad original
- Reduce tamaño en ~60%

### Virus scanning

- Implementado con ClamAV
- Rechaza archivos infectados
- Código de error: 415

---

## 8. ESTADOS Y TRANSICIONES

### Estados de mensajes

- **sending** → **sent** → **delivered** → **read** → **failed**

### Estados de conversaciones

- **open** → **closed** → **archived**

### Estados de usuarios

- **online**, **offline**, **away**

### Estados de campañas

- **draft** → **active** → **paused** → **completed** → **cancelled**

### Transiciones permitidas

- **Mensaje:** sending→sent→delivered→read, cualquier estado puede ir a failed
- **Conversación:** open→closed, closed→archived
- **Usuario:** online↔away↔offline
- **Campaña:** draft→active, active↔paused, active→completed, active→cancelled

### Eventos que disparan cambios

- message:send → sending
- message:status (delivered/read)
- conversation:close
- user:disconnect
- campaign:send → active

---

## 9. ERRORES Y EXCEPCIONES

### Códigos y mensajes completos

| Código | Mensaje                        | Categoría  | Acción recomendada         |
| ------ | ------------------------------ | ---------- | -------------------------- |
| 400    | "Parámetros inválidos"         | validation | Verificar datos de entrada |
| 401    | "No autorizado"                | auth       | Reautenticar               |
| 403    | "Prohibido"                    | auth       | Verificar permisos         |
| 404    | "No encontrado"                | validation | Verificar ID/URL           |
| 409    | "Conflicto"                    | validation | Verificar duplicados       |
| 413    | "Archivo demasiado grande"     | validation | Reducir tamaño             |
| 415    | "Tipo de archivo no permitido" | validation | Cambiar formato            |
| 422    | "Entidad no procesable"        | validation | Verificar datos            |
| 429    | "Demasiadas peticiones"        | rate limit | Esperar y reintentar       |
| 500    | "Error interno del servidor"   | server     | Contactar soporte          |

### Manejo en frontend

- **400-422:** Mostrar mensaje exacto al usuario
- **401:** Redirigir a login
- **403:** Mostrar error de permisos
- **429:** Mostrar "Intenta de nuevo en unos minutos"
- **500:** Mostrar error genérico, contactar soporte

### Logs de error

- Se registra: endpoint, usuario, IP, error, timestamp
- Stack trace en desarrollo
- Información sensible filtrada

---

## 10. PERFORMANCE Y LÍMITES

### Rate limiting por endpoint

- **Login/Refresh:** 10 req/min
- **Mensajes:** 60 req/min
- **Uploads:** 20 req/min
- **Dashboard:** 10 req/min
- **Campañas:** 5 req/min
- **General:** 100 req/min

### Timeouts

- **REST requests:** 15s
- **WebSocket conexión:** 10s
- **WebSocket heartbeat:** 25s
- **Upload:** 60s

### Paginación

- **Máximo por página:** 100 registros
- **Default:** 20-50 registros
- **Cursors:** Para datasets grandes

### Caché

- **Respuestas de usuarios:** 60s
- **Conversaciones:** 60s
- **Dashboard metrics:** 5-30 min
- **Archivos:** 1 hora

### Optimizaciones recomendadas

- Cachear usuarios/conversaciones localmente
- Reintentar en 429 con backoff exponencial
- Usar paginación para listas grandes
- Implementar infinite scroll

---

## 11. SEGURIDAD

### Headers requeridos

- **Authorization:** Bearer <token>
- **Content-Type:** application/json
- **X-Requested-With:** XMLHttpRequest

### CORS configuración

- **Orígenes permitidos:** Exactos por entorno
- **Métodos:** GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With
- **Credentials:** true

### CSRF protection

- No aplica (solo API REST + JWT)
- Tokens JWT son stateless

### Sanitización

- Todos los inputs se sanitizan
- Protección contra XSS
- Protección contra SQLi
- Validación de tipos

### Logs de seguridad

- Accesos exitosos/fallidos
- Cambios de rol
- Uploads de archivos
- Errores de autenticación

---

## 12. TESTING Y DEBUGGING

### Endpoints de testing

- **GET /health:** `{ "status": "ok", "timestamp": "..." }`
- **GET /metrics:** Métricas Prometheus (si habilitado)

### Datos de prueba

- **Usuario test:** test@utalk.app / 123456
- **Conversación test:** c_test
- **Mensaje test:** m_test
- **Contacto test:** ct_test

### Herramientas de debugging

- **Logs en consola:** Desarrollo
- **Sentry:** Producción
- **Debug mode:** `DEBUG=true`

### Logs de desarrollo

- Activar con `DEBUG=true`
- Nivel: debug, info, warn, error
- Formato: JSON estructurado

### Métricas disponibles

- **GET /metrics:** Prometheus format
- **Health checks:** /health
- **Performance:** Logs de timing

---

## 13. DEPLOYMENT Y ENTORNOS

### URLs por entorno

| Entorno    | API URL                   | WebSocket URL           | Frontend URL              |
| ---------- | ------------------------- | ----------------------- | ------------------------- |
| Desarrollo | http://localhost:3000     | ws://localhost:3000     | http://localhost:5173     |
| Staging    | https://staging.utalk.app | wss://staging.utalk.app | https://staging.utalk.app |
| Producción | https://api.utalk.app     | wss://api.utalk.app     | https://app.utalk.app     |

### Variables por entorno

- **Desarrollo:** .env.local
- **Staging:** Variables de entorno del servidor
- **Producción:** Variables de entorno del servidor

### Proceso de deployment

- **Docker:** Dockerfile incluido
- **Railway:** railway.json configurado
- **Health check:** /health endpoint
- **Rollback:** Automático en fallo

### Configuración específica

- **CORS:** Orígenes específicos por entorno
- **JWT:** Claves diferentes por entorno
- **Firebase:** Proyectos separados
- **Twilio:** Números de prueba/producción

---

## 14. INTEGRACIONES EXTERNAS

### Firebase

- **Configuración:** Todas las claves en variables de entorno
- **Uso:** Notificaciones, almacenamiento, autenticación
- **Proyectos:** Separados por entorno

### Twilio

- **Webhooks:** POST /twilio/webhook
- **Payload:** `{ "From": "...", "Body": "...", "MessageSid": "..." }`
- **Autenticación:** Basic Auth (SID/TOKEN)
- **Números:** Separados por entorno

### Otros servicios

- **Sentry:** Logs y monitoreo
- **ClamAV:** Antivirus para uploads
- **Redis:** Caché (opcional)

### Webhooks

- **URLs:** Específicas por entorno
- **Payloads:** JSON estructurado
- **Autenticación:** JWT o Basic Auth
- **Retry:** 3 intentos automáticos

---

## 15. MIGRACIONES Y CAMBIOS

### Versiones de API

- **v1:** Actual (sin versionado en URL)
- **Compatibilidad:** Backward compatible

### Cambios breaking recientes

- JWT ahora usa RS256 (antes HS256)
- Uploads solo aceptan tipos MIME listados
- Rate limiting más estricto
- WebSocket requiere autenticación

### Deprecations próximas

- Ninguna actualmente
- Aviso de 6 meses para cambios breaking

### Migración de datos

- Scripts en `/scripts/`
- Migración de archivos a sistema indexado
- Backup automático antes de migraciones

---

## RESPUESTAS A PREGUNTAS ESPECÍFICAS

1. **¿Cuál es la URL exacta del backend en producción?**  
   https://api.utalk.app

2. **¿Qué puerto usa WebSocket en cada entorno?**
   - dev: 3000
   - staging/prod: 443 (wss)

3. **¿Cuál es el formato exacto del JWT payload?**

   ```json
   {
     "id": "userId",
     "email": "user@utalk.app",
     "role": "admin|agent|user",
     "iat": 1710000000,
     "exp": 1710003600
   }
   ```

4. **¿Qué headers exactos requiere cada endpoint?**
   - Authorization: Bearer <token>
   - Content-Type: application/json (o multipart/form-data en uploads)

5. **¿Cuáles son los límites exactos de rate limiting?**
   - 60 req/min mensajes
   - 10 req/min login/refresh
   - 20 uploads/min

6. **¿Qué tipos de archivo acepta el upload?**
   - image/jpeg, image/png, video/mp4, audio/mpeg, application/pdf

7. **¿Cómo se maneja la reconexión de WebSocket?**
   - Automática, 5 intentos, 2s delay

8. **¿Qué eventos WebSocket se emiten en qué orden?**
   - connect → conversation:join → message:send/typing → disconnect

9. **¿Cuáles son los códigos de error exactos?**
   - 400, 401, 403, 404, 409, 413, 415, 422, 429, 500

10. **¿Qué validaciones específicas tiene cada campo?**
    - Ver sección 6

---

## EJEMPLOS DE USO COMPLETOS

### Login y autenticación

```javascript
// Login
const response = await fetch('https://api.utalk.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@utalk.app',
    password: '123456'
  })
});

const { token, refreshToken, user } = await response.json();

// Usar token en requests
const conversations = await fetch('https://api.utalk.app/api/conversations', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### WebSocket connection

```javascript
import { io } from 'socket.io-client';

const socket = io('wss://api.utalk.app', {
  auth: {
    token: 'your-jwt-token'
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('message:new', message => {
  console.log('New message:', message);
});
```

### Upload de archivo

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://api.utalk.app/api/media/upload', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});

const { url, id } = await response.json();
```

---

**¿Necesitas algún ejemplo JSON adicional, diagrama o detalle de algún flujo específico? ¡Avísame!**
