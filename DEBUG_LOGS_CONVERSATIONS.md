# Logs Temporales para Debugging de Conversaciones

## Activación

Para activar los logs temporales, agregar el parámetro `LOG_VERBOSE_CONVERSATIONS=true` a la URL:

```
http://localhost:5173/chat?LOG_VERBOSE_CONVERSATIONS=true
```

## Logs Implementados

### 1. API Layer (src/lib/stores/conversations.store.ts)

**Líneas:** 67-85, 95-115, 125-145, 195-215

**Eventos:**
- `[CONV][api][fetch:start]` - Inicio de llamada a API
- `[CONV][api][fetch:done]` - Respuesta exitosa de API
- `[CONV][state][state:set]` - Actualización del estado
- `[CONV][api][fetch:error]` - Error en llamada a API

**Payload incluye:**
- URL y parámetros de la request
- Status code y longitud de datos
- Keys del primer elemento (si existe)
- Campos requeridos presentes/faltantes

### 2. Axios Interceptors (src/lib/services/axios.ts)

**Líneas:** 65-85, 95-115

**Eventos:**
- `[CONV][api][fetch:start]` - Request interceptor
- `[CONV][api][fetch:done]` - Response interceptor

**Filtro:** Solo se activa para URLs que contengan `/conversations`

### 3. Component Layer (src/routes/chat/+page.svelte)

**Líneas:** 45-65, 95-115

**Eventos:**
- `[CONV][selector][selector:mapped]` - Mapeo de datos en suscripción
- `[CONV][component][render:decision]` - Decisión de renderizado

**Payload incluye:**
- Estado de error y longitud de conversaciones
- Campos requeridos faltantes
- Razón para mostrar estado vacío

### 4. Socket Layer (src/lib/services/socket.ts)

**Líneas:** 140-160, 170-190, 200-220, 280-320

**Eventos:**
- `[CONV][socket][socket:connected]` - Conexión exitosa
- `[CONV][socket][socket:disconnected]` - Desconexión
- `[CONV][socket][socket:error]` - Errores de conexión
- `[CONV][socket][socket:join]` - Unirse a conversación

**Payload incluye:**
- Socket ID
- Información de usuario (si disponible)
- Estado de estructuras internas
- Notas descriptivas

## Formato Estándar

Todos los logs siguen el formato:

```javascript
{
  event: "<string>",
  layer: "api|state|selector|component|filter|socket",
  request: { url, method, queryParams },
  response: { status, ok, itemsLength, keysSample },
  clientFilters: { inbox, status, assignedTo, search, pagination },
  mapping: { requiredKeysPresent: [], missingKeys: [] },
  render: { willShowEmptyState: true|false, reason: "<string>" }
}
```

## Campos Requeridos Verificados

- `id` - Identificador de conversación
- `lastMessage` - Último mensaje
- `createdAt` - Fecha de creación

## Marcadores de Borrado

Todos los bloques están rodeados por:
- `// DEBUG-LOG-START(conversations-front)` / `// DEBUG-LOG-END(conversations-front)`
- `// DEBUG-LOG-START(conversations-socket)` / `// DEBUG-LOG-END(conversations-socket)`

## Uso

1. Agregar `?LOG_VERBOSE_CONVERSATIONS=true` a la URL
2. Abrir DevTools Console
3. Navegar a la página de chat
4. Revisar logs con prefijo `[CONV]`

## Información Capturada

- **API Calls:** URL, método, parámetros, status, longitud de respuesta
- **State Management:** Transformaciones, campos faltantes, decisiones de render
- **Socket Events:** Conexiones, errores, unión a conversaciones
- **Render Decisions:** Condiciones para mostrar "No hay conversaciones"

## Limpieza

Para remover todos los logs temporales, buscar y eliminar:
- Bloques marcados con `DEBUG-LOG-START` y `DEBUG-LOG-END`
- Condiciones `window.location.search.includes('LOG_VERBOSE_CONVERSATIONS=true')` 