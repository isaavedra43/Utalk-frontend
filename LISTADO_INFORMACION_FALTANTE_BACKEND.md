# 📋 LISTADO DE INFORMACIÓN FALTANTE PARA INTEGRACIÓN FRONTEND-BACKEND

## 🎯 OBJETIVO
Identificar TODA la información que falta para poder construir y conectar completamente el frontend del chat, sin inventar ni usar datos mocks en ningún momento.

---

## 1. 📊 MODELOS JSON INCOMPLETOS O AMBIGUOS

### 1.1 Modelo de Usuario/Autenticación
- **❓ ¿Cuál es el modelo JSON completo de respuesta del login?**
  - ¿Incluye `role`, `permissions`, `avatar`, `lastSeen`, `isOnline`?
  - ¿Qué campos exactos tiene la entidad "usuario" que se muestra en el sidebar?
  - Ejemplo real de respuesta: `{ user: {...}, token: "..." }`

- **❓ ¿Cuál es el modelo de refresh token?**
  - ¿Qué campos devuelve el endpoint `/auth/refresh`?
  - ¿El nuevo token incluye la misma información de usuario?

### 1.2 Modelo de Conversación
- **❓ ¿Cuál es el modelo JSON completo de una conversación?**
  - ¿Incluye `participants`, `tags`, `priority`, `status`?
  - ¿Qué campos tiene `contact` cuando existe?
  - ¿Qué significa exactamente `assignedTo`? ¿Es un ID o un objeto completo?
  - Ejemplo real de respuesta: `{ id: "...", contact: {...}, assignedTo: "...", ... }`

### 1.3 Modelo de Mensaje
- **❓ ¿Cuál es el modelo JSON completo de un mensaje?**
  - ¿Qué campos tiene cuando es un mensaje de texto simple?
  - ¿Qué campos adicionales tiene cuando incluye archivos adjuntos?
  - ¿Cómo se representan los diferentes tipos de mensaje (texto, imagen, audio, video, archivo)?
  - ¿Qué significa exactamente `status: "failed"` y qué metadata incluye?
  - Ejemplo real de respuesta para cada tipo de mensaje

### 1.4 Modelo de Contacto
- **❓ ¿Cuál es el modelo JSON completo de un contacto?**
  - ¿Incluye `avatar`, `email`, `company`, `notes`?
  - ¿Qué campos son opcionales vs requeridos?
  - ¿Cómo se maneja cuando no hay nombre (solo teléfono)?

### 1.5 Modelo de Archivo Adjunto
- **❓ ¿Cuál es el modelo JSON de un archivo adjunto?**
  - ¿Incluye `url`, `filename`, `size`, `mimeType`, `thumbnail`?
  - ¿Cómo se representan las imágenes vs documentos vs audio/video?
  - ¿Qué campos tiene cuando el archivo está siendo subido vs ya subido?

---

## 2. 🔌 ENDPOINTS REST Y SOCKET.IO FALTANTES O AMBIGUOS

### 2.1 Endpoints de Autenticación
- **❓ ¿Existe endpoint para logout?**
  - ¿Cuál es el método y payload?
  - ¿Qué respuesta devuelve?

- **❓ ¿Existe endpoint para refresh token?**
  - ¿Cuál es la URL exacta?
  - ¿Qué headers requiere?

### 2.2 Endpoints de Conversaciones
- **❓ ¿Existe endpoint para crear una nueva conversación?**
  - ¿Cuál es el método y payload?
  - ¿Qué campos son requeridos?

- **❓ ¿Existe endpoint para asignar/reasignar agente a conversación?**
  - ¿Cuál es el método y payload?
  - ¿Qué sucede si se intenta asignar al mismo agente?

- **❓ ¿Existe endpoint para marcar conversación como favorita?**
  - ¿Cuál es el método y payload?

- **❓ ¿Existe endpoint para archivar/eliminar conversación?**
  - ¿Cuál es el método y payload?

- **❓ ¿Existe endpoint para buscar/filtrar conversaciones?**
  - ¿Qué parámetros de búsqueda soporta?
  - ¿Cómo funciona la paginación?

### 2.3 Endpoints de Mensajes
- **❓ ¿Existe endpoint para editar un mensaje?**
  - ¿Cuál es el método y payload?
  - ¿Qué restricciones tiene (tiempo, permisos)?

- **❓ ¿Existe endpoint para eliminar un mensaje?**
  - ¿Cuál es el método y payload?
  - ¿Qué sucede con los mensajes en cascada?

- **❓ ¿Existe endpoint para reenviar un mensaje?**
  - ¿Cuál es el método y payload?

- **❓ ¿Existe endpoint para marcar mensajes como leídos?**
  - ¿Cuál es el método y payload?
  - ¿Se marca automáticamente o manualmente?

### 2.4 Endpoints de Contactos
- **❓ ¿Existe endpoint para crear/editar contactos?**
  - ¿Cuál es el método y payload?
  - ¿Qué validaciones tiene?

- **❓ ¿Existe endpoint para buscar contactos?**
  - ¿Qué parámetros de búsqueda soporta?

### 2.5 Endpoints de Archivos
- **❓ ¿Existe endpoint para subir archivos?**
  - ¿Cuál es el método y payload?
  - ¿Qué tipos de archivo soporta?
  - ¿Cuál es el límite de tamaño?

- **❓ ¿Existe endpoint para obtener URL de descarga?**
  - ¿Cuál es el método y payload?

### 2.6 Eventos Socket.IO
- **❓ ¿Cuál es el formato exacto del evento "new-message"?**
  - ¿Qué campos incluye el payload?
  - ¿Se envía a todos los participantes o solo al remitente?

- **❓ ¿Cuál es el formato exacto del evento "user-typing"?**
  - ¿Qué campos incluye el payload?
  - ¿Se envía a todos los participantes de la conversación?

- **❓ ¿Cuál es el formato exacto del evento "message-status-updated"?**
  - ¿Qué campos incluye el payload?
  - ¿Qué estados posibles tiene?

- **❓ ¿Cuál es el formato exacto del evento "user-online/offline"?**
  - ¿Qué campos incluye el payload?

- **❓ ¿Cuál es el formato exacto del evento "conversation-assigned"?**
  - ¿Qué campos incluye el payload?

- **❓ ¿Cuál es el formato exacto del evento "sync-state"?**
  - ¿Qué datos devuelve cuando se solicita?

---

## 3. 🎨 REGLAS Y METADATOS REQUERIDOS

### 3.1 Estados Visuales
- **❓ ¿Cómo se determina el color del estado de una conversación?**
  - ¿Viene del backend o se calcula en frontend?
  - ¿Qué estados existen: "pending", "active", "resolved", "archived"?

- **❓ ¿Cómo se determina el avatar de un usuario?**
  - ¿Viene una URL del backend o se generan iniciales?
  - ¿Qué sucede si no hay avatar?

- **❓ ¿Cómo se determina el indicador de "online/offline"?**
  - ¿Viene del backend o se calcula con `lastSeen`?
  - ¿Cuánto tiempo sin actividad se considera "offline"?

### 3.2 Permisos y Roles
- **❓ ¿Cuáles son todos los roles posibles?**
  - ¿"admin", "agent", "viewer" son los únicos?
  - ¿Qué permisos tiene cada rol exactamente?

- **❓ ¿Qué acciones puede realizar cada rol?**
  - ¿Puede un "viewer" ver conversaciones pero no enviar mensajes?
  - ¿Puede un "agent" asignar conversaciones a otros agentes?

### 3.3 Validaciones Específicas
- **❓ ¿Cuál es el límite exacto de caracteres para nombres de contacto?**
- **❓ ¿Cuál es el límite exacto de caracteres para notas de contacto?**
- **❓ ¿Cuál es el límite exacto de archivos por mensaje?**
- **❓ ¿Cuál es el límite exacto de tamaño por archivo?**

---

## 4. ⚠️ CASOS LÍMITE Y ERRORES

### 4.1 Errores de Archivos
- **❓ ¿Qué error devuelve si un archivo es demasiado grande?**
  - ¿Código de error específico?
  - ¿Mensaje de error para mostrar al usuario?

- **❓ ¿Qué error devuelve si se sube un tipo de archivo no permitido?**
  - ¿Código de error específico?
  - ¿Mensaje de error para mostrar al usuario?

- **❓ ¿Qué sucede si falla la subida de un archivo?**
  - ¿Se guarda el mensaje sin el archivo?
  - ¿Se elimina todo el mensaje?

### 4.2 Errores de Mensajes
- **❓ ¿Qué sucede si se intenta enviar un mensaje a una conversación sin agente asignado?**
  - ¿Error 403 con mensaje específico?
  - ¿Qué mensaje exacto debe mostrar el frontend?

- **❓ ¿Qué sucede si se intenta editar un mensaje muy antiguo?**
  - ¿Hay límite de tiempo para editar?
  - ¿Qué error devuelve?

### 4.3 Errores de Autenticación
- **❓ ¿Qué sucede si el token expira durante una operación larga?**
  - ¿Error 401 con código `TOKEN_EXPIRED_DURING_PROCESSING`?
  - ¿Qué debe hacer el frontend exactamente?

### 4.4 Errores de Rate Limiting
- **❓ ¿Qué headers exactos devuelve cuando se acerca al límite?**
  - ¿`X-RateLimit-Remaining`, `X-RateLimit-Reset`?
  - ¿Qué valores tienen?

- **❓ ¿Qué error devuelve cuando se excede el límite?**
  - ¿Error 429 con `retryAfter`?
  - ¿Qué mensaje debe mostrar el frontend?

---

## 5. 🔄 REGLAS DE NEGOCIO ESPECÍFICAS

### 5.1 Asignación de Conversaciones
- **❓ ¿Puede un agente asignarse a sí mismo una conversación?**
- **❓ ¿Puede un agente reasignar una conversación a otro agente?**
- **❓ ¿Qué sucede si se intenta asignar una conversación ya asignada?**

### 5.2 Visibilidad de Conversaciones
- **❓ ¿Qué conversaciones puede ver cada rol?**
  - ¿Un "agent" ve solo las suyas o todas?
  - ¿Un "viewer" ve alguna conversación?

### 5.3 Edición de Mensajes
- **❓ ¿Quién puede editar mensajes?**
  - ¿Solo el autor?
  - ¿Los administradores pueden editar cualquier mensaje?

### 5.4 Eliminación de Mensajes
- **❓ ¿Quién puede eliminar mensajes?**
  - ¿Solo el autor?
  - ¿Los administradores pueden eliminar cualquier mensaje?

---

## 6. 📱 CASOS ESPECÍFICOS DE UI

### 6.1 Indicadores de Estado
- **❓ ¿Cómo se determina si un mensaje está "enviando", "enviado", "entregado", "leído"?**
  - ¿Viene del backend o se calcula en frontend?
  - ¿Qué eventos Socket.IO indican cada cambio?

### 6.2 Notificaciones
- **❓ ¿Qué notificaciones debe mostrar el frontend?**
  - ¿Nuevos mensajes, conversaciones asignadas, errores?
  - ¿Vienen del backend o se calculan en frontend?

### 6.3 Búsqueda y Filtros
- **❓ ¿Qué filtros soporta la búsqueda de conversaciones?**
  - ¿Por estado, agente, fecha, contacto?
  - ¿Cómo se implementan en el backend?

### 6.4 Paginación
- **❓ ¿Cómo funciona la paginación de conversaciones?**
  - ¿Parámetros `page`, `limit`?
  - ¿Qué información de paginación devuelve el backend?

---

## 7. 🔧 CONFIGURACIÓN Y ENTORNOS

### 7.1 URLs y Endpoints
- **❓ ¿Cuáles son las URLs exactas de todos los endpoints?**
  - ¿Base URL para desarrollo vs producción?
  - ¿URL del WebSocket?

### 7.2 Credenciales de Prueba
- **❓ ¿Cuáles son las credenciales de prueba válidas?**
  - ¿`admin@company.com` / `123456` son correctas?
  - ¿Hay otros usuarios de prueba?

### 7.3 Configuración de Entornos
- **❓ ¿Cuáles son las variables de entorno necesarias?**
  - ¿`API_URL`, `SOCKET_URL`?
  - ¿Valores para desarrollo, staging, producción?

---

## 8. ❓ PREGUNTAS ABIERTAS/AMBIGÜEDADES

### 8.1 Funcionalidades No Documentadas
- **❓ ¿El sistema soporta replies/threads anidados?**
  - Si sí, ¿cómo se modela en la base de datos?
  - ¿Qué endpoints manejan los replies?

- **❓ ¿El sistema soporta mensajes de voz?**
  - Si sí, ¿cómo se suben y procesan?
  - ¿Hay transcripción automática?

- **❓ ¿El sistema soporta mensajes de ubicación?**
  - Si sí, ¿cómo se representan?

### 8.2 Comportamientos No Claros
- **❓ ¿Qué sucede cuando un usuario se desconecta abruptamente?**
  - ¿Se marca automáticamente como offline?
  - ¿Se notifica a otros usuarios?

- **❓ ¿Qué sucede con los mensajes no leídos cuando un usuario se conecta?**
  - ¿Se marcan automáticamente como leídos?
  - ¿Se notifica al remitente?

- **❓ ¿Cómo se maneja la sincronización cuando un usuario se reconecta?**
  - ¿Se recargan todas las conversaciones?
  - ¿Solo los mensajes nuevos?

---

## 9. 📋 CHECKLIST DE VERIFICACIÓN

### 9.1 Modelos JSON
- [ ] Modelo completo de usuario/autenticación
- [ ] Modelo completo de conversación
- [ ] Modelo completo de mensaje (todos los tipos)
- [ ] Modelo completo de contacto
- [ ] Modelo completo de archivo adjunto

### 9.2 Endpoints REST
- [ ] Todos los endpoints de autenticación
- [ ] Todos los endpoints de conversaciones
- [ ] Todos los endpoints de mensajes
- [ ] Todos los endpoints de contactos
- [ ] Todos los endpoints de archivos

### 9.3 Eventos Socket.IO
- [ ] Formato exacto de todos los eventos
- [ ] Payload de cada evento
- [ ] Quién recibe cada evento

### 9.4 Reglas de Negocio
- [ ] Todos los roles y permisos
- [ ] Todas las validaciones
- [ ] Todos los casos límite
- [ ] Todos los errores específicos

### 9.5 Configuración
- [ ] URLs de todos los entornos
- [ ] Variables de entorno
- [ ] Credenciales de prueba

---

## 🎯 RESULTADO ESPERADO

Una vez completada esta información, el frontend podrá:
- ✅ Conectarse correctamente al backend
- ✅ Manejar todos los casos especiales
- ✅ Mostrar la UI correcta para cada situación
- ✅ Validar datos antes de enviar
- ✅ Manejar errores específicos
- ✅ Trabajar con datos reales sin inventar nada

**NO se debe inventar ninguna información. Solo documentar lo que ya existe en el backend.** 