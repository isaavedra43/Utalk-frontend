# Tokens de Diseño - Módulo Equipo & Performance

## FASE 6: ESTILOS Y TOKENS

Este archivo contiene la documentación de los tokens de diseño implementados para el módulo "Equipo & Performance".

## 📁 Estructura de Archivos

```
src/lib/styles/
├── team-tokens.css          # Tokens principales de diseño
└── README.md               # Esta documentación
```

## 🎨 6.1 Espaciado Específico

### Cards Padding

```css
.team-card {
  @apply p-4;
}
```

- **Uso**: Padding estándar para todas las tarjetas del módulo
- **Valor**: `1rem` (16px) en todos los lados

### Secciones Gap

```css
.team-section {
  @apply space-y-6;
}
```

- **Uso**: Espaciado vertical entre secciones principales
- **Valor**: `1.5rem` (24px) entre elementos

### Grid Gaps

```css
.team-grid {
  @apply gap-3;
}
```

- **Uso**: Espaciado entre elementos en layouts de grid
- **Valor**: `0.75rem` (12px) entre elementos

### Headers Padding

```css
.team-header {
  @apply p-6;
}
```

- **Uso**: Padding para headers principales
- **Valor**: `1.5rem` (24px) en todos los lados

## 📏 6.2 Alturas Fijas Obligatorias

### KPI Cards

```css
.kpi-card {
  @apply h-40;
}
```

- **Altura**: `160px`
- **Uso**: Tarjetas de indicadores clave de rendimiento

### Gráficos

```css
.trend-chart {
  @apply h-80;
} /* 320px */
.trend-chart-large {
  @apply h-96;
} /* 384px */
```

- **Uso**: Gráficos de tendencias y visualizaciones

### Métricas Adicionales

```css
.metric-card {
  @apply h-36;
}
```

- **Altura**: `144px`
- **Uso**: Tarjetas de métricas secundarias

### Vista Rápida

```css
.quick-view {
  @apply h-32;
}
```

- **Altura**: `128px`
- **Uso**: Vistas rápidas y resúmenes

## 🎨 6.3 Colores Semánticos

### Mejorando

```css
.improving {
  @apply text-green-600 bg-green-50 border-green-200;
}
```

- **Uso**: Indicadores de mejora y tendencias positivas
- **Colores**: Verde para éxito y progreso

### Atención

```css
.attention {
  @apply text-red-600 bg-red-50 border-red-200;
}
```

- **Uso**: Alertas y elementos que requieren atención
- **Colores**: Rojo para advertencias y problemas

### Estable

```css
.stable {
  @apply text-blue-600 bg-blue-50 border-blue-200;
}
```

- **Uso**: Estados estables y neutrales
- **Colores**: Azul para información y estabilidad

## 🔧 Utilidades Adicionales

### Variantes de Texto

```css
.improving-text {
  @apply text-green-600;
}
.attention-text {
  @apply text-red-600;
}
.stable-text {
  @apply text-blue-600;
}
```

### Variantes de Fondo

```css
.improving-bg {
  @apply bg-green-50;
}
.attention-bg {
  @apply bg-red-50;
}
.stable-bg {
  @apply bg-blue-50;
}
```

### Variantes de Borde

```css
.improving-border {
  @apply border-green-200;
}
.attention-border {
  @apply border-red-200;
}
.stable-border {
  @apply border-blue-200;
}
```

## 📦 Componentes Creados

### KPICard.svelte

- Componente de tarjeta KPI con tokens de diseño
- Soporte para estados semánticos
- Indicadores de tendencia

### TrendChart.svelte

- Componente de gráfico con alturas fijas
- Skeleton de carga
- Estados vacíos

### MetricCard.svelte

- Componente de métrica adicional
- Altura fija de 144px
- Estados semánticos

### QuickView.svelte

- Componente de vista rápida
- Altura fija de 128px
- Truncado de texto

## 🚀 Uso

### Importar Tokens

```javascript
import '$lib/styles/team-tokens.css';
```

### Aplicar Clases

```html
<!-- KPI Card con altura fija -->
<div class="kpi-card team-card">
  <!-- Contenido -->
</div>

<!-- Gráfico con altura fija -->
<div class="trend-chart">
  <!-- Contenido del gráfico -->
</div>

<!-- Estado semántico -->
<div class="improving">Mejorando</div>
```

## 📋 Checklist de Implementación

- [x] **6.1 Espaciado Específico**
  - [x] Cards padding (`.team-card`)
  - [x] Secciones gap (`.team-section`)
  - [x] Grid gaps (`.team-grid`)
  - [x] Headers padding (`.team-header`)

- [x] **6.2 Alturas Fijas Obligatorias**
  - [x] KPI Cards (`.kpi-card` - 160px)
  - [x] Gráficos (`.trend-chart` - 320px, `.trend-chart-large` - 384px)
  - [x] Métricas adicionales (`.metric-card` - 144px)
  - [x] Vista rápida (`.quick-view` - 128px)

- [x] **6.3 Colores Semánticos**
  - [x] Mejorando (`.improving`)
  - [x] Atención (`.attention`)
  - [x] Estable (`.stable`)

- [x] **Componentes de Ejemplo**
  - [x] KPICard.svelte
  - [x] TrendChart.svelte
  - [x] MetricCard.svelte
  - [x] QuickView.svelte

## 🎯 Beneficios

1. **Consistencia Visual**: Todos los componentes usan los mismos tokens
2. **Mantenibilidad**: Cambios centralizados en un archivo
3. **Escalabilidad**: Fácil agregar nuevos tokens
4. **Accesibilidad**: Colores semánticos para mejor UX
5. **Performance**: Clases optimizadas de Tailwind CSS

## 🔄 Actualizaciones

Para agregar nuevos tokens:

1. Editar `team-tokens.css`
2. Actualizar esta documentación
3. Probar en componentes existentes
4. Actualizar componentes que usen los nuevos tokens
