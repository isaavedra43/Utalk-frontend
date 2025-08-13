# 📊 Componentes Dashboard

Esta carpeta contiene los componentes específicos para el dashboard de analytics de UTalk.

## 🎯 Componentes Principales

### KPICard.svelte

- Card para mostrar métricas clave (KPIs)
- Incluye valor, cambio porcentual, tendencia e icono
- Soporte para 5 esquemas de color
- Estados loading/error incluidos

### AgentRanking.svelte

- Lista clasificada de agentes por rendimiento
- Métricas: conversaciones, tiempo respuesta, satisfacción
- Estados en tiempo real (activo/ocupado/ausente)
- Top performer destacado con efectos especiales

### TopicsPanel.svelte

- Panel con tabs para temas emergentes y alertas
- Detección automática por IA
- Niveles de prioridad y acciones sugeridas

## 🎨 Design System

### Colores

- `green`: Métricas positivas (sentimiento, satisfacción)
- `blue`: Métricas de rendimiento (tiempo, eficiencia)
- `yellow`: Métricas de revenue (ventas, conversiones)
- `red`: Alertas críticas (errores, riesgos)
- `purple`: Métricas de volumen (conversaciones, mensajes)

### Estados

- `loading`: Skeleton con animación pulse
- `error`: Mensaje + botón retry
- `empty`: Estado sin datos con ilustración
- `normal`: Vista completa con datos

## 📐 Responsive

- **Mobile**: Stack vertical, padding reducido
- **Tablet**: Grid 2 columnas
- **Desktop**: Grid 3-4 columnas según componente
- **XL**: Máximo ancho 1280px

## 🔧 Props Comunes

Todos los componentes incluyen:

- `loading: boolean` - Estado de carga
- `error: string | null` - Mensaje de error
- `className?: string` - Clases CSS adicionales
