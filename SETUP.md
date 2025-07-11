# Setup y Configuración - Sistema Omnicanal Backend

## Descripción General

Este es un sistema backend omnicanal robusto que permite gestionar conversaciones de múltiples canales (WhatsApp, Facebook Messenger, Email, Webchat) desde una plataforma unificada. Está construido con Node.js, Express, Firebase/Firestore y Twilio como primer canal implementado.

## Características Principales

- **Omnicanal**: Soporte para múltiples canales de comunicación
- **Escalable**: Arquitectura modular lista para crecer
- **Seguro**: Autenticación, rate limiting, validación de webhooks
- **Monitoreable**: Logging completo y manejo de errores
- **Extensible**: Estructura preparada para nuevos canales y módulos

## Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase con Firestore habilitado
- Cuenta de Twilio (para WhatsApp/SMS)
- ngrok o similar para desarrollo local

## Instalación

### 1. Clonar y instalar dependencias

```bash
git clone <repository-url>
cd utalk-backend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=3000

# Entorno (development, production)
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_PHONE_NUMBER=+1234567890

# Webhook Security
WEBHOOK_SECRET=tu_webhook_secret_super_seguro

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

### 3. Configurar Firebase

#### Obtener credenciales:
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a "Configuración del proyecto" > "Cuentas de servicio"
4. Genera una nueva clave privada
5. Copia los valores al archivo `.env`

#### Configurar Firestore:
1. Habilita Firestore en Firebase Console
2. Aplica las reglas de seguridad:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Seleccionar proyecto
firebase use tu-proyecto-firebase

# Desplegar reglas de seguridad
firebase deploy --only firestore:rules
```

### 4. Configurar Twilio

#### Configurar WhatsApp:
1. Ve a [Twilio Console](https://console.twilio.com)
2. Configura WhatsApp Business API
3. Configura el webhook URL: `https://tu-dominio.com/api/channels/twilio/webhook`
4. Copia las credenciales al archivo `.env`

#### Para desarrollo local con ngrok:
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto local
ngrok http 3000

# Usar la URL de ngrok para webhooks
# Ejemplo: https://abc123.ngrok.io/api/channels/twilio/webhook
```

## Ejecutar el Sistema

### Desarrollo

```bash
# Modo desarrollo con auto-reload
npm run dev

# O manualmente
node server.js
```

### Producción

```bash
# Instalar dependencias de producción
npm ci --only=production

# Ejecutar en producción
npm start
```

## Estructura del Proyecto

```
src/
├── api/                    # Rutas de API
│   ├── channels/          # Canales de comunicación
│   │   ├── twilio.js      # WhatsApp/SMS (implementado)
│   │   ├── facebook.js    # Facebook Messenger (placeholder)
│   │   ├── email.js       # Email (placeholder)
│   │   └── webchat.js     # Webchat (placeholder)
│   ├── crm.js             # Gestión de clientes (placeholder)
│   ├── campaigns.js       # Campañas de marketing (placeholder)
│   ├── dashboard.js       # Analytics y reportes (placeholder)
│   ├── settings.js        # Configuración (placeholder)
│   └── users.js           # Gestión de usuarios (placeholder)
├── controllers/           # Controladores de negocio
│   └── channels/
│       └── twilioController.js
├── services/              # Servicios de dominio
│   └── twilioService.js
├── models/                # Modelos de datos
│   ├── clientModel.js
│   ├── messageModel.js
│   └── conversationModel.js
├── middlewares/           # Middlewares
│   └── errorHandler.js
├── utils/                 # Utilidades
│   └── logger.js
├── app.js                 # Configuración de Express
└── config.js              # Configuración centralizada
```

## Endpoints Principales

### Health Check
```bash
GET /health
```

### Twilio (WhatsApp/SMS)
```bash
POST /api/channels/twilio/webhook          # Recibir mensajes
POST /api/channels/twilio/send/whatsapp    # Enviar WhatsApp
POST /api/channels/twilio/send/sms         # Enviar SMS
GET  /api/channels/twilio/message/:id/status # Estado de mensaje
```

### Otros Módulos (Placeholders)
- `/api/channels/facebook/*` - Facebook Messenger
- `/api/channels/email/*` - Email
- `/api/channels/webchat/*` - Webchat
- `/api/crm/*` - Gestión de clientes
- `/api/campaigns/*` - Campañas
- `/api/dashboard/*` - Analytics
- `/api/settings/*` - Configuración
- `/api/users/*` - Usuarios

## Testing

### Probar webhook de Twilio

```bash
# Usando curl
curl -X POST http://localhost:3000/api/channels/twilio/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+1234567890&To=whatsapp:+0987654321&Body=Hola%20mundo"
```

### Probar envío de WhatsApp

```bash
curl -X POST http://localhost:3000/api/channels/twilio/send/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Hola desde el backend!",
    "conversationId": "optional-conversation-id"
  }'
```

## Monitoreo y Logs

### Ubicación de logs
- Desarrollo: Console + archivo `./logs/app.log`
- Producción: Archivo con rotación automática

### Niveles de log
- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Información detallada

### Ejemplo de log estructurado
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Mensaje WhatsApp enviado exitosamente",
  "metadata": {
    "to": "+1234567890",
    "messageId": "msg_123",
    "conversationId": "conv_456"
  }
}
```

## Seguridad

### Medidas implementadas:
- Rate limiting por IP
- Validación de webhooks de Twilio
- Sanitización de inputs
- Headers de seguridad (helmet)
- CORS configurado
- Logging de actividad sospechosa

### Firestore Security Rules:
- Solo el backend (Admin SDK) puede acceder a datos
- Frontend/móvil no tiene acceso directo
- Todas las operaciones pasan por el backend

## Escalabilidad

### Agregar nuevo canal:
1. Crear archivo en `src/api/channels/nuevo-canal.js`
2. Implementar controlador en `src/controllers/channels/`
3. Crear servicio en `src/services/`
4. Agregar ruta en `src/app.js`
5. Configurar variables de entorno

### Agregar nuevo módulo:
1. Crear archivo en `src/api/nuevo-modulo.js`
2. Implementar lógica de negocio
3. Agregar ruta en `src/app.js`
4. Actualizar documentación

## Troubleshooting

### Problemas comunes:

#### 1. Error de conexión a Firebase
```
Error: Error: Could not load the default credentials
```
**Solución**: Verificar variables de entorno de Firebase

#### 2. Webhook no recibe mensajes
```
Error: Webhook validation failed
```
**Solución**: Verificar URL del webhook y WEBHOOK_SECRET

#### 3. Error de rate limiting
```
Error: Too many requests
```
**Solución**: Ajustar RATE_LIMIT_MAX_REQUESTS en .env

#### 4. Logs no se generan
```
Error: ENOENT: no such file or directory, open './logs/app.log'
```
**Solución**: Crear directorio logs: `mkdir logs`

## Próximos Pasos

### Desarrollo inmediato:
1. Implementar modelo de conversación completo
2. Crear endpoints de Facebook Messenger
3. Desarrollar sistema de usuarios y autenticación
4. Implementar dashboard básico

### Desarrollo a mediano plazo:
1. Agregar soporte para email
2. Crear sistema de campañas
3. Implementar analytics avanzados
4. Desarrollar webchat widget

### Producción:
1. Configurar CI/CD
2. Implementar monitoring (Prometheus/Grafana)
3. Configurar backups automáticos
4. Implementar load balancing

## Soporte

Para soporte técnico o preguntas:
1. Revisar logs en `./logs/app.log`
2. Verificar configuración en `.env`
3. Consultar documentación de APIs externas (Twilio, Firebase)
4. Revisar health checks: `GET /health`

---

**Nota**: Este sistema está en desarrollo activo. Los módulos marcados como "placeholder" están listos para implementación pero requieren desarrollo adicional. 