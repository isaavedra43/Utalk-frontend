# 🏢 Componentes de Equipo & Performance

Esta carpeta contiene los componentes específicos para el módulo de gestión de equipos y análisis de rendimiento de UTalk.

## 🎯 Componentes Principales

### AgentList.svelte

- Lista de agentes con filtros y búsqueda
- Cards individuales con métricas y permisos
- Estados de selección y loading
- Responsive design con scroll

### AgentDetail.svelte ⭐ **NUEVO - FASE 3**

- Panel principal con detalles del agente seleccionado
- Header del agente con avatar, información y botones de acción
- Sistema de tabs: Overview, KPIs, Tendencias
- Estado sin selección con icono y mensaje informativo
- Integración con el store para gestión de estado

### OverviewTab.svelte ⭐ **NUEVO - FASE 3**

- **KPIs de Rendimiento**: Grid responsivo con 6 cards de 160px altura
- **Vista Rápida de Tendencias**: 3 cards con progress bars y métricas resumidas
- Estados de loading con skeletons estructurados
- Colores semánticos para badges de estado (Mejorando, Estable, Atención)

### KPIsTab.svelte ⭐ **NUEVO - FASE 3**

- **KPIs Extendidos**: Todos los KPIs principales en grid responsivo
- **Métricas Adicionales**: 4 cards específicas de 140px altura
- Incluye: Chats Resueltos Primera Vez, Tasa Upsell Cross-sell, Feedback IA, Eficiencia General
- Estados de loading y colores semánticos

### TrendsTab.svelte ⭐ **NUEVO - FASE 3**

- **5 Gráficos Obligatorios** con placeholders:
  1. Chats vs Ventas (BarChart3) - 320px altura
  2. Tiempo de Respuesta (Clock) - 320px altura
  3. Distribución por Canal (Activity) - 320px altura
  4. CSAT últimos 30 días (Star) - 320px altura
  5. Actividad por Hora (TrendingUp) - 340px altura, full width
- Layout responsive con grid 2 columnas en desktop
- Información adicional sobre los placeholders

### AgentActions.svelte ⭐ **NUEVO - FASE 4**

- Panel derecho con acciones e insights
- Sistema de tabs: Acciones | Insights
- Estado sin selección con icono y mensaje informativo
- Integración con el store para gestión de estado

### ActionsTab.svelte ⭐ **NUEVO - FASE 4**

- **3 Acordeones obligatorios** (todos abiertos por defecto):
  - **Acciones IA**: Botones "Sugerir Mejora" y "Enviar Recordatorio", análisis rápido con puntuación IA, acciones rápidas (Copiar/Guardar)
  - **Permisos y Accesos**: Grid 2x2 con switches funcionales, badges de nivel (Basic/Intermediate/Advanced), estado general con conteo, timestamp de última modificación
  - **Coaching**: Fortalezas IA (cards verdes), Áreas a mejorar (cards naranjas), Plan sugerido 7 días con estados (completado/pendiente)
- Estados de loading para acciones IA con texto dinámico
- Switches funcionales con confirmación para permisos

### InsightsTab.svelte ⭐ **NUEVO - FASE 4**

- **Cards de insights personalizados** con diferentes tipos:
  - **Achievement**: Logros y mejoras (icono CheckCircle, color verde)
  - **Alert**: Alertas y advertencias (icono AlertTriangle, color rojo)
  - **Recommendation**: Recomendaciones (icono Lightbulb, color azul)
  - **Trend**: Tendencias y patrones (icono TrendingUp, color naranja)
- Badges de severidad (Alta/Media/Baja)
- Botones de acción para cada insight
- Información adicional sobre la generación de insights

### AgentCard.svelte

- Card individual de agente
- Avatar, nombre, rol, status
- Sección PERMISOS obligatoria
- Métricas mini (Chats, CSAT, Conv.)
- Dropdown con acciones

## 🎨 Design System

### Layout

- **Desktop**: 3 columnas fijas `[260px_1fr_360px]`
- **Tablet**: 2 columnas `[220px_1fr]` (acciones en Sheet)
- **Mobile**: Sheet lateral para acciones

### Colores

- `green`: Mejorando (mejoras positivas)
- `red`: Atención (requiere atención)
- `blue`: Estable (rendimiento estable)
- `orange`: Advertencia (áreas a mejorar)

### Estados

- `loading`: Skeletons con animación pulse
- `empty`: Estados informativos con iconos
- `selected`: Ring border + indicador visual
- `error`: Mensaje + botón retry

## 📐 Responsive

- **2xl**: `[260px_minmax(820px,1fr)_360px]`
- **xl**: `[240px_minmax(640px,1fr)_320px]`
- **lg**: `[240px_minmax(560px,1fr)_300px]`
- **md**: `[220px_minmax(0,1fr)]` (panel derecho oculto)
- **<md**: Sheet lateral para acciones

## 🔧 Props Comunes

Todos los componentes incluyen:

- `loading: boolean` - Estado de carga
- `error: string | null` - Mensaje de error
- `className?: string` - Clases CSS adicionales
- `onAction?: (action: string, data: unknown) => void` - Callback de acciones

### Props Específicos - FASE 3

#### AgentDetail.svelte

```typescript
export let agent: Agent | null;
export let loading = false;
```

#### OverviewTab.svelte, KPIsTab.svelte, TrendsTab.svelte

```typescript
export let agent: Agent;
export let loading = false;
```

## 📊 Métricas Principales

### KPIs de Rendimiento

- **Chats Atendidos**: Número total de conversaciones
- **CSAT**: Customer Satisfaction Score (0-5)
- **Tasa de Conversión**: Porcentaje de ventas exitosas
- **Tiempo Medio de Respuesta**: Formato "2:15"
- **Chats Cerrados sin Escalamiento**: Eficiencia del agente

### Métricas Adicionales (FASE 3)

- **Chats Resueltos Primera Vez**: Porcentaje de resolución inmediata
- **Tasa Upsell Cross-sell**: Porcentaje de ventas adicionales
- **Feedback IA (Calidad)**: Puntuación de calidad de respuestas IA
- **Eficiencia General**: Métrica compuesta de rendimiento

### Permisos

- **Lectura**: Ver conversaciones y datos
- **Escritura**: Enviar mensajes y responder
- **Aprobación**: Aprobar campañas y decisiones
- **Configuración**: Acceso a configuración del sistema

### Coaching

- **Fortalezas IA**: Aspectos positivos identificados
- **Áreas a mejorar**: Oportunidades de desarrollo
- **Plan sugerido**: Tareas personalizadas de mejora

## 🚀 Funcionalidades

### Búsqueda y Filtros

- Búsqueda en tiempo real por nombre, rol, email
- Filtros por estado (Activo/Inactivo)
- Ordenamiento por nombre, rendimiento, actividad
- Sincronización con URL params

### Acciones IA

- Sugerir mejoras personalizadas
- Enviar recordatorios automáticos
- Análisis rápido de rendimiento
- Insertar respuestas tipo

### Permisos Dinámicos

- Toggles funcionales con confirmación
- Niveles: Basic, Intermediate, Advanced
- Conteo de permisos activos
- Timestamp de última modificación

## 📱 Interacciones

### Selección de Agente

- Click en card → Selecciona + actualiza URL
- Auto-selección del primer agente al cargar
- Indicador visual de selección

### Navegación por Tabs (FASE 3)

- **Overview** (por defecto): KPIs principales + vista rápida de tendencias
- **KPIs**: Métricas extendidas + métricas adicionales
- **Tendencias**: 5 gráficos con placeholders

### Acciones Rápidas

- Editar perfil
- Reasignar permisos
- Ejecutar acciones IA
- Ver insights personalizados

## 🔄 Estados de Carga

### Loading States

- **Lista agentes**: 4 skeletons estructurados
- **Panel principal**: Skeletons por sección
- **Tabs**: Skeletons específicos para cada tab
- **Acciones IA**: Botones con loading + texto dinámico
- **Sin selección**: Estados informativos con iconos

### Error States

- Mensaje contextual según el error
- Botón de reintento
- Fallback a datos anteriores si es posible

## 📈 Integración con Backend

### Endpoints Principales

- `GET /api/team/agents` - Lista de agentes
- `GET /api/team/agents/:id` - Detalles del agente
- `PATCH /api/team/agents/:id/permissions` - Actualizar permisos
- `POST /api/team/ai-actions` - Ejecutar acciones IA

### Data Contracts

- Interfaces TypeScript completas
- Validación de tipos en tiempo de compilación
- Manejo de errores consistente
- Mocks de datos para desarrollo

## 🎯 Progreso del Desarrollo

### ✅ **FASE 1: ANÁLISIS Y PREPARACIÓN** - COMPLETADA

- ✅ Tipos TypeScript definidos
- ✅ Store de estado configurado
- ✅ Servicios y mocks creados
- ✅ Estructura de carpetas organizada

### ✅ **FASE 2: DESARROLLO DE COMPONENTES BASE** - COMPLETADA

- ✅ AgentList.svelte
- ✅ AgentCard.svelte
- ✅ HeaderPrincipal.svelte

### ✅ **FASE 3: PANEL PRINCIPAL** - COMPLETADA ⭐

- ✅ AgentDetail.svelte
- ✅ OverviewTab.svelte
- ✅ KPIsTab.svelte
- ✅ TrendsTab.svelte

### ✅ **FASE 4: PANEL DE ACCIONES** - COMPLETADA ⭐

- ✅ AgentActions.svelte
- ✅ ActionsTab.svelte
- ✅ InsightsTab.svelte
- ✅ Acciones IA con loading states
- ✅ Permisos y accesos con switches funcionales
- ✅ Coaching con fortalezas y áreas a mejorar
- ✅ Plan sugerido 7 días con estados
- ✅ Insights personalizados con diferentes tipos

### ⏳ **FASE 5: FUNCIONALIDADES AVANZADAS** - PENDIENTE

- ⏳ Gestión de estado y sincronización
- ⏳ Interacciones y lógica de negocio
- ⏳ Estados de carga y manejo de errores

### ⏳ **FASE 6: REFINAMIENTO Y PRUEBAS** - PENDIENTE

- ⏳ Pruebas de integración
- ⏳ Pruebas de responsividad
- ⏳ Optimización de rendimiento
- ⏳ Documentación final

## 🎯 Próximos Pasos

1. **Fase 4**: Panel de acciones (AgentActions.svelte)
2. **Fase 5**: Funcionalidades avanzadas e integración
3. **Fase 6**: Testing y optimización
4. **Fase 7**: Documentación y deploy
