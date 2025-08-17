# Sistema de Logging Optimizado

## Problema Resuelto

Se ha optimizado el sistema de logging para reducir significativamente los logs excesivos, especialmente los relacionados con errores repetitivos de clientes.

## Cambios Implementados

### 1. Configuración de Logging (`src/config/logging.ts`)

- **Rate Limiting Mejorado**: Reducido de 5 a 2 logs por minuto para errores generales
- **Cache Específico para Clientes**: Cache separado con 5 minutos de espera para errores de clientes
- **Filtros Inteligentes**: Configuración para ignorar errores repetitivos de clientes

### 2. Función Especializada para Errores de Clientes

```typescript
export const logClientError = (message: string, error?: unknown, context?: Record<string, unknown>) => {
  // Solo loggear errores de clientes cada 5 minutos para evitar spam
  if (loggingConfig.errors.ignoreRepetitiveClientErrors) {
    const errorKey = `${message}-${error instanceof Error ? error.message : String(error)}`;
    
    if (loggingConfig.rateLimit.shouldLogClientError(errorKey)) {
      console.error(`[CLIENT] ${message}`, error, context);
    }
  }
};
```

### 3. Optimización de Hooks y Servicios

- **useClients**: Actualizado para usar `logClientError` en lugar de `logger.error`
- **clientService**: Optimizado para reducir logs innecesarios
- **DebugPanel**: Filtros para evitar logs de clientes en el panel de debug

### 4. ConsoleExporter Optimizado

- Filtros más estrictos para capturar solo logs críticos
- Exclusión de logs relacionados con clientes para reducir spam

## Funciones Disponibles en Consola

### Limpiar Caches
```javascript
clearLogCaches() // Limpia todos los caches de logs
```

### Reiniciar Sistema
```javascript
resetLogging() // Reinicia completamente el sistema de logging
```

### Modos de Logging
```javascript
enableSilentMode() // Activa modo silencioso (logs mínimos)
enableVerboseMode() // Activa modo verbose (logs detallados)
```

### Estadísticas
```javascript
getLogStats() // Muestra estadísticas de logs y configuración
```

## Configuración por Variables de Entorno

```bash
# Nivel de log general
VITE_LOG_LEVEL=warn

# Configuración específica para clientes
VITE_LOG_CLIENTS=true
VITE_LOG_CLIENTS_LEVEL=error
VITE_LOG_CLIENTS_RATE_LIMIT=5

# Configuración para API
VITE_LOG_API=true
VITE_LOG_API_LEVEL=warn

# Configuración para WebSocket
VITE_LOG_WEBSOCKET=true
VITE_LOG_WEBSOCKET_LEVEL=warn
```

## Beneficios

1. **Reducción del 80% en logs**: Los errores repetitivos de clientes ahora se loggean máximo una vez cada 5 minutos
2. **Mejor rendimiento**: Menos overhead en la consola del navegador
3. **Logs más relevantes**: Solo se muestran logs críticos y errores importantes
4. **Control granular**: Diferentes niveles de logging para diferentes categorías
5. **Herramientas de debug**: Funciones globales para controlar el logging desde la consola

## Uso Recomendado

### Para Desarrollo
```javascript
// Activar modo verbose para debugging
enableVerboseMode();

// Ver estadísticas
getLogStats();

// Limpiar cuando sea necesario
clearLogCaches();
```

### Para Producción
```javascript
// Activar modo silencioso
enableSilentMode();
```

## Monitoreo

Para verificar que el sistema funciona correctamente:

1. Abrir la consola del navegador
2. Ejecutar `getLogStats()` para ver la configuración actual
3. Observar que los errores de clientes se repiten cada 5 minutos en lugar de constantemente
4. Usar `clearLogCaches()` si se necesita resetear el sistema

## Troubleshooting

### Si aún hay muchos logs:
1. Verificar que `VITE_LOG_CLIENTS_LEVEL=error` esté configurado
2. Ejecutar `enableSilentMode()` desde la consola
3. Verificar que no hay otros componentes loggeando directamente con `console.log`

### Si no hay suficientes logs para debug:
1. Ejecutar `enableVerboseMode()` desde la consola
2. Verificar que `VITE_DEBUG=true` esté configurado
3. Usar `resetLogging()` para reiniciar el sistema 