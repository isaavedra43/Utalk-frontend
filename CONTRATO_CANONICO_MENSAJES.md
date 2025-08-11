# 📋 CONTRATO CANÓNICO - ENVÍO DE MENSAJES

## 🔗 Endpoint

```
POST /api/conversations/:conversationId/messages
```

## 📝 Body Mínimo Requerido

```json
{
  "messageId": "uuid-v4",
  "type": "text",
  "content": "string (1..1000)",
  "senderIdentifier": "agent:<email>",
  "recipientIdentifier": "whatsapp:+52XXXXXXXXXX",
  "metadata": {
    "source": "web",
    "agentId": "<id|email>",
    "timestamp": "2025-08-11T16:58:00.388Z"
  }
}
```

## 🔧 Implementación Frontend

### Campos Generados Automáticamente:

- **messageId**: UUID v4 generado en el cliente
- **senderIdentifier**: `agent:<email>` del usuario autenticado
- **recipientIdentifier**: `whatsapp:<phone>` del cliente de la conversación
- **metadata.source**: Siempre "web"
- **metadata.agentId**: ID o email del agente
- **metadata.timestamp**: Timestamp de envío

### Validaciones Implementadas:

- ✅ **Content**: Trim + longitud 1-1000 caracteres
- ✅ **Type**: "text" por defecto
- ✅ **URL Encoding**: `encodeURIComponent` para conversationId
- ✅ **Error Handling**: Manejo específico de errores 400 y 5xx

### Manejo de Errores:

- **400 Validation Error**: Mapeo específico de campos a mensajes de usuario
- **500 Server Error**: Mensaje genérico de error interno
- **Toast Notifications**: Feedback visual para el usuario

## 🧪 Pruebas de Aceptación

1. ✅ **Happy Path**: Enviar "hola" → 201 y mensaje visible en UI
2. ✅ **Validación**: Campos faltantes → 400 con toast específico
3. ✅ **URL Encoding**: conversationId con %2B → OK
4. ✅ **Network Inspection**: Body contiene todos los campos requeridos

## 📊 Logs y Telemetría

- **Dev Mode**: Log del payload (sin datos sensibles)
- **Response Time**: Medición de tiempo de respuesta
- **Request ID**: Tracking de requests si el backend lo expone
- **Error Logging**: Logs detallados para debugging

## 🔄 Flujo Completo

1. Usuario escribe mensaje
2. Validación de contenido (1-1000 chars)
3. Generación de UUID v4
4. Construcción de sender/recipient identifiers
5. POST request con encodeURIComponent
6. Manejo de respuesta/errores
7. Actualización de UI y stores
8. Toast de confirmación/error 