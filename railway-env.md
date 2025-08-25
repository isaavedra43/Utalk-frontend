# Variables de Entorno para Railway - UTALK Frontend

## Variables Requeridas

Configura estas variables en tu proyecto de Railway:

### Configuración Base
```
NODE_ENV=production
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=warn
```

### URLs de la API
```
VITE_API_BASE_URL=https://tu-backend-url.com
VITE_WS_BASE_URL=wss://tu-backend-url.com
```

### Configuración de Firebase
```
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Configuración de WebSocket
```
VITE_WS_RECONNECT_ATTEMPTS=5
VITE_WS_RECONNECT_DELAY=1000
```

### Configuración de Caché
```
VITE_CACHE_TTL=300000
```

### Configuración de Rate Limiting
```
VITE_RATE_LIMIT_MAX_REQUESTS=100
VITE_RATE_LIMIT_WINDOW_MS=60000
```

## Instrucciones de Configuración

1. Ve a tu proyecto en Railway
2. Navega a la sección "Variables"
3. Agrega cada variable con su valor correspondiente
4. Guarda los cambios
5. Redespliega la aplicación

## Notas Importantes

- Asegúrate de que las URLs de la API apunten a tu backend desplegado
- Las credenciales de Firebase deben ser las correctas para tu proyecto
- Railway detectará automáticamente el puerto (variable PORT)
- La aplicación se construirá automáticamente al hacer push al repositorio
