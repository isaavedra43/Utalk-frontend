# 📈 Componentes Charts

Esta carpeta contiene los componentes de visualización basados en Recharts para el dashboard.

## 🎯 Componentes Principales

### ActivityChart.svelte

- Gráfico de barras para actividad por horas
- Comparación con día anterior
- Identificación automática de hora pico
- Tooltip personalizado con formato español

### SentimentChart.svelte

- Gráfico donut para distribución de sentimientos
- Desglose por canales (WhatsApp, Facebook, etc.)
- Colores temáticos por canal
- Leyenda interactiva

### CalendarHeatmap.svelte

- Vista calendario con intensidad por actividad
- Gradientes de color basados en volumen
- Navegación mensual
- Tooltips con métricas del día

## 📊 Configuración Recharts

### Colores Base

```javascript
const chartColors = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#6b7280'
};
```

### Responsive

- `ResponsiveContainer` en todos los charts
- Altura mínima: 320px
- Márgenes adaptables por breakpoint
- Tooltips optimizados para mobile

## 🎨 Customización

### Tooltips

- Fondo blanco con shadow
- Texto en español
- Formato de números localizado
- Información contextual adicional

### Ejes y Grids

- Grid sutil (#f0f0f0)
- Ejes en color neutral (#6b7280)
- Labels con font-size responsive
- Formato 24h para horas

## 📐 Props Estándar

Todos los charts incluyen:

- `data: Array` - Datos del chart
- `loading: boolean` - Estado de carga
- `height?: number` - Altura personalizada
- `className?: string` - Clases adicionales
