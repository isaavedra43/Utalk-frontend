# 📱 UTalk PWA - Progressive Web App

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Características PWA](#características-pwa)
3. [Instalación](#instalación)
4. [Permisos Nativos](#permisos-nativos)
5. [Modo Offline](#modo-offline)
6. [Notificaciones Push](#notificaciones-push)
7. [Actualización de la App](#actualización-de-la-app)
8. [Desarrollo](#desarrollo)
9. [Testing](#testing)
10. [Despliegue](#despliegue)

---

## 🎯 Introducción

UTalk es una Progressive Web App (PWA) completa que funciona como una aplicación nativa en Android e iOS sin necesidad de usar las app stores. Ofrece experiencia offline, notificaciones push, acceso a cámara, ubicación y más.

### ¿Qué es una PWA?

Una Progressive Web App es una aplicación web que utiliza tecnologías modernas para ofrecer una experiencia similar a las aplicaciones nativas:

- ✅ Instalable en dispositivos móviles
- ✅ Funciona offline
- ✅ Notificaciones push
- ✅ Acceso a hardware del dispositivo
- ✅ Actualizaciones automáticas
- ✅ No requiere app stores

---

## 🚀 Características PWA

### ✨ Funcionalidades Implementadas

- **Instalación sin App Store**: Instalable directamente desde el navegador
- **Modo Offline**: Funciona sin conexión a internet
- **Cache Inteligente**: Cache de assets, imágenes y respuestas API
- **Notificaciones Push**: Recibe notificaciones en tiempo real
- **Permisos Nativos**:
  - 📷 Cámara (captura de fotos)
  - 🎤 Micrófono (grabación de audio)
  - 📍 Ubicación (geolocalización)
  - 🔔 Notificaciones
- **Actualización Automática**: Notifica cuando hay nueva versión
- **Sincronización**: Sincroniza datos cuando vuelve la conexión
- **Optimización Móvil**: UI adaptada a pantallas pequeñas

---

## 📥 Instalación

### Android

#### Desde Chrome/Edge:

1. Abre UTalk en Chrome o Edge en tu dispositivo Android
2. Aparecerá un banner en la parte inferior con el botón **"Instalar UTalk"**
3. Toca el botón "Instalar"
4. Confirma la instalación
5. La app aparecerá en tu pantalla de inicio

#### Manualmente (si no aparece el banner):

1. Abre el menú del navegador (⋮)
2. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
3. Confirma la instalación

### iOS (Safari)

1. Abre UTalk en Safari en tu iPhone/iPad
2. Toca el botón de **Compartir** (□↑) en la barra inferior
3. Desplázate y selecciona **"Agregar a pantalla de inicio"**
4. Edita el nombre si deseas (por defecto "UTalk")
5. Toca **"Agregar"**
6. La app aparecerá en tu pantalla de inicio

> **Nota iOS**: En iOS, la instalación debe hacerse manualmente a través de Safari. El banner automático no está disponible debido a limitaciones de Apple.

### Computadora (Desktop)

#### Chrome/Edge:

1. Abre UTalk en tu navegador
2. Busca el ícono de instalación (⊕) en la barra de direcciones
3. Haz clic en **"Instalar"**
4. La app se abrirá en una ventana independiente

---

## 🔐 Permisos Nativos

UTalk puede solicitar los siguientes permisos para funcionar completamente:

### 📷 Cámara

**Uso**: Capturar fotos para compartir con clientes

**Cómo funciona**:
- Al hacer clic en el botón de cámara en el chat, se solicitará permiso
- Puedes tomar fotos directamente desde la app
- Las fotos se envían directamente al chat

**Gestión del permiso**:
- **Android**: Configuración > Aplicaciones > UTalk > Permisos
- **iOS**: Configuración > Safari > Cámara

### 🎤 Micrófono

**Uso**: Grabar notas de voz y audio

**Cómo funciona**:
- Mantén presionado el botón de micrófono para grabar
- Suelta para enviar, desliza para cancelar
- El audio se envía como mensaje de voz

### 📍 Ubicación

**Uso**: Compartir ubicación actual con clientes

**Cómo funciona**:
- Al compartir ubicación, se solicitará permiso
- La app obtiene tu ubicación actual con precisión
- Se envía como mensaje con mapa

**Privacidad**:
- La ubicación solo se accede cuando tú lo solicitas
- No se rastrea en segundo plano

### 🔔 Notificaciones

**Uso**: Recibir alertas de nuevos mensajes

**Cómo funciona**:
- Al iniciar sesión por primera vez, se solicita permiso
- Recibirás notificaciones push incluso con la app cerrada
- Las notificaciones muestran remitente y mensaje

**Gestión**:
- Puedes desactivar/activar desde Configuración de la app
- **Android**: Configuración > Notificaciones > UTalk
- **iOS**: Configuración > Notificaciones > Safari (para PWA)

### 🛠️ Gestionar Todos los Permisos

Desde la app:
1. Toca tu perfil
2. Ve a **Configuración**
3. Selecciona **Permisos**
4. Activa/desactiva los permisos que necesites

---

## 📴 Modo Offline

UTalk funciona incluso sin conexión a internet gracias a tecnologías de cache y almacenamiento local.

### ¿Qué funciona offline?

✅ **Disponible sin conexión**:
- Ver conversaciones recientes (últimas 100)
- Leer mensajes guardados
- Ver información de clientes
- Ver tu perfil y configuración
- Navegar por la interfaz

❌ **Requiere conexión**:
- Enviar nuevos mensajes
- Recibir mensajes en tiempo real
- Actualizar datos
- Iniciar nuevas conversaciones

### Cache de Datos

La app almacena automáticamente en cache:

1. **Assets estáticos** (JS, CSS, imágenes): 30 días
2. **Respuestas API**: 1 hora
3. **Imágenes de mensajes**: 30 días
4. **Conversaciones**: Hasta que se actualicen

### Sincronización

Cuando vuelves a tener conexión:

1. La app detecta automáticamente la reconexión
2. Sincroniza mensajes pendientes
3. Actualiza conversaciones
4. Envía acciones pendientes (mensajes, cambios de estado, etc.)

### Ver Estado de Cache

```typescript
import { getStorageStats } from './services/offlineStorage';

const stats = await getStorageStats();
console.log('Conversaciones en cache:', stats.conversations);
console.log('Mensajes en cache:', stats.messages);
```

### Limpiar Cache

Para limpiar datos offline manualmente:

```typescript
import { clearAllOfflineData } from './services/offlineStorage';

await clearAllOfflineData();
```

---

## 🔔 Notificaciones Push

### Configuración Inicial

#### Backend (Node.js/Express)

1. **Instalar dependencias**:
```bash
npm install web-push
```

2. **Generar VAPID keys**:
```bash
npx web-push generate-vapid-keys
```

Esto generará:
```
Public Key: BK...xyz
Private Key: ab...123
```

3. **Configurar variables de entorno**:
```env
VAPID_PUBLIC_KEY=BK...xyz
VAPID_PRIVATE_KEY=ab...123
VAPID_SUBJECT=mailto:admin@utalk.com
```

4. **Configurar en frontend** (`.env`):
```env
VITE_VAPID_PUBLIC_KEY=BK...xyz
```

#### Implementación Backend

```typescript
// backend/services/pushService.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Guardar suscripción
app.post('/api/push/subscribe', async (req, res) => {
  const { subscription, userId } = req.body;
  // Guardar subscription en base de datos asociada al userId
  await db.saveSubscription(userId, subscription);
  res.json({ success: true });
});

// Enviar notificación
export const sendPushNotification = async (userId: string, payload: any) => {
  const subscription = await db.getSubscription(userId);
  if (!subscription) return;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Error sending push:', error);
  }
};
```

### Uso en la App

```typescript
import { setupPushNotifications } from './services/webPush';

// Al iniciar sesión
const userId = user.id;
await setupPushNotifications(userId);
```

### Enviar Notificación desde Backend

```typescript
// Cuando llegue un nuevo mensaje
await sendPushNotification(agentId, {
  title: 'Nuevo mensaje de Juan Pérez',
  body: 'Hola, necesito ayuda con...',
  icon: '/pwa-icons/icon-192x192.png',
  badge: '/pwa-icons/icon-72x72.png',
  tag: 'new-message',
  data: {
    url: '/chat?id=123',
    conversationId: '123'
  }
});
```

---

## 🔄 Actualización de la App

### Actualización Automática

La app verifica automáticamente si hay nuevas versiones:

1. **Verificación periódica**: Cada 1 hora
2. **Al reabrir**: Cuando vuelves a la app
3. **Manual**: Puedes forzar verificación en Configuración

### Cuando Hay Actualización

1. Aparece una notificación en la parte superior:
   ```
   Nueva versión disponible
   Hay una actualización de UTalk lista para instalar
   [Actualizar ahora] [Más tarde]
   ```

2. Si tocas **"Actualizar ahora"**:
   - Se descarga la nueva versión
   - Se recarga la app
   - Ya tienes la última versión

3. Si tocas **"Más tarde"**:
   - Se actualiza en la próxima recarga

### Forzar Actualización (Dev)

```typescript
import { usePWA } from './hooks/usePWA';

const { updateServiceWorker } = usePWA();

// Forzar actualización inmediata
await updateServiceWorker(true);
```

---

## 🛠️ Desarrollo

### Requisitos

- **Node.js**: >= 20.19.0
- **npm**: >= 10.0.0
- **Navegador**: Chrome/Edge/Safari (moderno)

### Instalación de Dependencias

```bash
npm install
```

### Variables de Entorno

Crear `.env` en la raíz:

```env
# Backend
VITE_BACKEND_URL=https://utalk-backend-production.up.railway.app
VITE_API_BASE_URL=https://utalk-backend-production.up.railway.app
VITE_WS_BASE_URL=wss://utalk-backend-production.up.railway.app

# VAPID (Web Push)
VITE_VAPID_PUBLIC_KEY=tu_clave_publica_vapid

# Opcional
VITE_DEBUG=false
```

### Comandos de Desarrollo

```bash
# Desarrollo (con PWA habilitada)
npm run dev

# Build de producción
npm run build

# Preview de producción (con PWA)
npm run preview

# Type check
npm run type-check

# Lint
npm run lint

# Análisis de bundle
npm run analyze
```

### Desarrollo de PWA

La PWA está habilitada incluso en desarrollo gracias a la configuración:

```typescript
// vite.config.ts
devOptions: {
  enabled: true,
  type: 'module'
}
```

Para probar en dispositivo móvil:

1. Asegúrate de estar en la misma red
2. Ejecuta `npm run dev`
3. Accede desde tu móvil a: `http://TU_IP:5173`

### Debugging

#### Chrome DevTools

1. Abre DevTools (F12)
2. Ve a **Application** > **Service Workers**
3. Verifica que el SW esté activo
4. Ve a **Application** > **Manifest** para ver el manifest
5. Ve a **Application** > **Cache Storage** para ver el cache

#### Simular Offline

1. DevTools > **Network** > **Offline**
2. Recarga la app
3. Verifica que funcione sin conexión

### Estructura de Archivos PWA

```
src/
├── components/
│   └── pwa/
│       ├── PWAInstallPrompt.tsx    # Prompt de instalación
│       ├── PWAUpdatePrompt.tsx     # Notificación de actualización
│       └── PermissionsManager.tsx  # Gestor de permisos
├── hooks/
│   ├── usePWA.ts                   # Hook principal PWA
│   └── usePermissions.ts           # Hook de permisos
├── services/
│   ├── permissions.ts              # Servicio de permisos nativos
│   ├── offlineStorage.ts           # IndexedDB para offline
│   └── webPush.ts                  # Web Push notifications
└── main.tsx                        # Registro de Service Worker

public/
├── pwa-icons/                      # Iconos PWA (varios tamaños)
├── manifest.webmanifest            # Manifest generado por Vite
└── sw.js                           # Service Worker (generado)
```

---

## 🧪 Testing

### Testing con Lighthouse

1. Abre la app en Chrome
2. Abre DevTools (F12)
3. Ve a **Lighthouse**
4. Selecciona:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ SEO
5. Ejecuta el análisis

**Meta**: 100 en PWA score

### Checklist PWA

- [ ] ✅ Se puede instalar (installable)
- [ ] ✅ Funciona offline
- [ ] ✅ Tiene manifest.json válido
- [ ] ✅ Tiene Service Worker registrado
- [ ] ✅ Usa HTTPS
- [ ] ✅ Iconos en todos los tamaños
- [ ] ✅ Theme color configurado
- [ ] ✅ Splash screen en móviles
- [ ] ✅ Notificaciones push funcionan
- [ ] ✅ Permisos se solicitan correctamente

### Testing en Dispositivos Reales

#### Android

1. Conecta dispositivo via USB
2. Habilita **Depuración USB**
3. En Chrome: `chrome://inspect`
4. Selecciona tu dispositivo
5. Abre UTalk
6. Inspecciona con DevTools remoto

#### iOS

1. Conecta iPhone/iPad via USB
2. En Safari del dispositivo: Configuración > Safari > Avanzado > Web Inspector
3. En Mac: Safari > Desarrollador > [Tu dispositivo] > UTalk
4. Inspecciona con Web Inspector

---

## 🚀 Despliegue

### Requisitos de Producción

1. **HTTPS obligatorio**: PWA solo funciona en HTTPS
2. **Manifest accesible**: El manifest debe estar en la raíz
3. **Service Worker**: Debe registrarse correctamente
4. **Iconos**: Todos los tamaños deben estar presentes

### Despliegue en Vercel/Netlify

#### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

`vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/manifest.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

#### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### Despliegue en Railway

```bash
# Railway CLI
railway up
```

`railway.toml`:
```toml
[build]
  builder = "NIXPACKS"
  buildCommand = "npm run build"

[deploy]
  startCommand = "npm start"
  healthcheckPath = "/"
  healthcheckTimeout = 300
```

### Post-Deployment

1. Verificar que HTTPS esté activo
2. Probar instalación en dispositivo real
3. Verificar Lighthouse score
4. Probar notificaciones push
5. Verificar modo offline

---

## 📊 Métricas y Monitoreo

### Performance

- **FCP (First Contentful Paint)**: < 1.8s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.8s
- **CLS (Cumulative Layout Shift)**: < 0.1

### Service Worker

Monitorear:
- Tasa de cache hit
- Tiempo de respuesta offline
- Errores de sincronización
- Número de actualizaciones

### Notificaciones

Monitorear:
- Tasa de suscripción
- Tasa de entrega
- Tasa de clicks
- Errores de push

---

## 🐛 Troubleshooting

### La app no se puede instalar

**Posible causa**: No se cumple el criterio de instalabilidad

**Solución**:
1. Verifica que estés en HTTPS
2. Abre DevTools > Application > Manifest
3. Verifica que el manifest sea válido
4. Verifica que el Service Worker esté registrado

### Las notificaciones no funcionan

**Posible causa**: Permisos denegados o VAPID keys incorrectas

**Solución**:
1. Verifica permisos en el navegador
2. Verifica que VAPID keys estén configuradas
3. Verifica que el backend envíe correctamente
4. Revisa la consola de errores

### El modo offline no funciona

**Posible causa**: Service Worker no está cacheando correctamente

**Solución**:
1. DevTools > Application > Service Workers > Update
2. Verifica Cache Storage
3. Limpia cache y recarga
4. Verifica configuración de Workbox

### La app no se actualiza

**Posible causa**: Service Worker antiguo está activo

**Solución**:
1. DevTools > Application > Service Workers > Unregister
2. Recarga la página con Ctrl+Shift+R
3. Verifica que `skipWaiting` esté habilitado

---

## 📚 Recursos

- [PWA Documentation (Google)](https://web.dev/progressive-web-apps/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

## 📄 Licencia

UTalk PWA © 2025 - Todos los derechos reservados.

---

## 👥 Soporte

Para soporte técnico o dudas:
- **Email**: support@utalk.com
- **Documentación**: https://docs.utalk.com
- **GitHub Issues**: https://github.com/utalk/frontend/issues

---

**¡Disfruta de UTalk en cualquier dispositivo! 📱💻**

