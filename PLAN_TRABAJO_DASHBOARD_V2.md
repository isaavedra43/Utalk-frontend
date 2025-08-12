 # 📊 PLAN DE TRABAJO DASHBOARD V2
## Migración Segura con Feature Flags y Rutas Paralelas

---

## 📋 RESUMEN EJECUTIVO

### Objetivo
Migrar el dashboard actual (básico con cards estáticas) al nuevo diseño V2 con widgets avanzados, KPIs en tiempo real, y análisis de IA, manteniendo producción intacta mediante feature flags y rutas paralelas.

### Estado Actual
- **Frontend**: Dashboard básico con 6 cards estáticas (bienvenida, acciones, funcionalidades, estado, ayuda, panel)
- **Backend**: Endpoints de dashboard existentes con caching y rate limiting
- **UI**: Componentes básicos (Card, Button, Badge, Avatar) disponibles
- **Stores**: Auth, conversations, messages, notifications operativos

### Nuevo Diseño V2
- **4 KPIs principales**: Sentimiento, 1ª respuesta, Resueltas, Ventas
- **Actividad del día**: Gráfico de barras por hora con comparación
- **Ranking de agentes**: Top performers con métricas
- **Sentimiento**: Donut chart + breakdown detallado
- **Temas/Alertas IA**: Análisis automático con severidad
- **Calendario heatmap**: Actividad mensual
- **Insights IA**: Resumen y recomendaciones

### Estrategia de Migración
- **Fase 0**: Scaffolding `/dashboard-v2` con feature flag
- **Fases 1-5**: Implementación incremental por widgets
- **Riesgo**: Mínimo (0%) - rutas paralelas, no toca producción

---

## 🏗️ INVENTARIO FRONTEND (PATHS REALES)

### Rutas Actuales
```
/dashboard → src/routes/dashboard/+page.svelte (607 líneas)
/analytics → src/routes/analytics/+page.svelte (placeholder)
```

### Layouts y Componentes
```
src/routes/+layout.svelte (layout principal)
src/routes/chat/+layout.svelte (layout de chat)
```

### Primitivos UI Disponibles
```
src/lib/components/ui/
├── alert/ (Alert, AlertDescription, AlertTitle)
├── avatar/ (Avatar, AvatarFallback, AvatarImage)
├── badge/ (Badge)
├── button/ (Button)
├── card/ (Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle)
├── dialog/ (Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger)
└── input/ (Input)
```

### Stores Operativos
```
src/lib/stores/
├── auth.store.ts (240 líneas) - Autenticación y roles
├── conversations.store.ts (340 líneas) - Gestión de conversaciones
├── messages.store.ts (528 líneas) - Gestión de mensajes
├── notifications.store.ts (102 líneas) - Notificaciones
├── presence.store.ts (59 líneas) - Presencia en tiempo real
├── typing.store.ts (117 líneas) - Indicadores de escritura
├── sidebar.store.ts (37 líneas) - Estado de sidebar
└── page.store.ts (32 líneas) - Estado de página
```

### Tokens de Diseño
```css
/* Colores principales */
--primary: #667eea (gradiente a #764ba2)
--background: #f8f9fa
--card-bg: white
--text-primary: #212529
--text-secondary: #6c757d
--border: #e9ecef

/* Tipografías */
--font-size-base: 0.875rem
--font-size-lg: 1rem
--font-size-xl: 1.25rem
--font-size-2xl: 2rem

/* Radii y sombras */
--border-radius: 8px, 12px
--shadow: 0 2px 4px rgba(0,0,0,0.05)
--shadow-hover: 0 4px 12px rgba(0,0,0,0.1)
```

### Puntos de Ruptura Identificados
- ❌ **Dark mode**: No implementado
- ❌ **Timezone**: No configurado (usa local)
- ❌ **i18n**: No implementado
- ❌ **Currency**: No configurado
- ✅ **SSR/CSR**: Funcionando correctamente
- ✅ **Responsive**: Implementado con media queries

---

## 🔧 INVENTARIO BACKEND (ENDPOINTS ACTUALES)

### Endpoints de Dashboard Existentes
```javascript
// src/routes/dashboard.js (179 líneas)
GET /api/dashboard/metrics
  - Rate limit: 10/min
  - Cache TTL: 5 min
  - Roles: admin, agent, viewer

GET /api/dashboard/messages/stats
  - Rate limit: 20/min
  - Cache TTL: 10 min
  - Roles: admin, agent, viewer

GET /api/dashboard/contacts/stats
  - Rate limit: 20/min
  - Cache TTL: 10 min
  - Roles: admin, agent, viewer

GET /api/dashboard/campaigns/stats
  - Rate limit: 20/min
  - Cache TTL: 10 min
  - Roles: admin, agent, viewer

GET /api/dashboard/recent-activity
  - Rate limit: 30/min
  - Cache TTL: 2 min
  - Roles: admin, agent, viewer
```

### Controlador de Dashboard
```javascript
// src/controllers/DashboardController.js (840 líneas)
class EnterpriseDashboardController {
  // Métricas generales
  static async getMetrics(req, res, next)
  static async getMessageStats(req, res, next)
  static async getContactStats(req, res, next)
  static async getCampaignStats(req, res, next)
  static async getRecentActivity(req, res, next)
  
  // Métricas de usuarios
  static async getUserActivityMetrics(userId, start, end)
  static async getAgentPerformanceMetrics(userId, start, end)
  
  // Caching y optimización
  static CACHE_TTL = { METRICS: 300, STATS: 600, TRENDS: 1800 }
  static RATE_LIMITS = { METRICS: 10, STATS: 20, EXPORT: 5 }
}
```

### Servicios de Soporte
```javascript
// Servicios disponibles
src/services/
├── CacheService.js (caching inteligente)
├── BatchService.js (procesamiento por lotes)
├── ShardingService.js (sharding de datos)
├── AIMetricsService.js (métricas de IA)
├── ReportService.js (generación de reportes)
└── MessageService.js (gestión de mensajes)
```

### Brechas Identificadas
- ❌ **Sentimiento**: No hay análisis de sentimiento
- ❌ **Tiempo de primera respuesta**: No calculado
- ❌ **Tasas de resolución**: No implementado
- ❌ **Ranking de agentes**: Básico, sin métricas avanzadas
- ❌ **Actividad por hora**: No granular
- ❌ **Insights de IA**: No implementado
- ❌ **Alertas automáticas**: No implementado

---

## 🎯 DISEÑO OBJETIVO (WIDGETS + REQUISITOS)

### 1. KPIs Principales (4 cards)
```typescript
interface DashboardKPI {
  title: string;
  value: number;
  change: number; // % vs período anterior
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'duration' | 'currency';
  icon: string;
}

// KPIs requeridos:
- Sentimiento promedio: 85% (+2.3%)
- Tiempo 1ª respuesta: 2.4min (-12%)
- Conversaciones resueltas: 94% (+1.8%)
- Ventas generadas: $12,450 (+8.5%)
```

### 2. Actividad del Día
```typescript
interface ActivityChart {
  data: Array<{
    hour: number;
    messages: number;
    conversations: number;
  }>;
  peakHour: number;
  vsYesterday: number; // % diferencia
  totalToday: number;
}
```

### 3. Ranking de Agentes
```typescript
interface AgentRanking {
  agents: Array<{
    id: string;
    name: string;
    avatar: string;
    metrics: {
      conversations: number;
      avgResponseTime: number;
      satisfaction: number;
      resolutionRate: number;
    };
    rank: number;
  }>;
  period: string;
}
```

### 4. Sentimiento (Donut + Breakdown)
```typescript
interface SentimentAnalysis {
  overall: {
    positive: number; // %
    neutral: number;  // %
    negative: number; // %
  };
  breakdown: Array<{
    category: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  trend: 'improving' | 'declining' | 'stable';
}
```

### 5. Temas/Alertas IA
```typescript
interface AIInsights {
  topics: Array<{
    name: string;
    frequency: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    trend: 'up' | 'down' | 'stable';
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: string;
    action?: string;
  }>;
}
```

### 6. Calendario Heatmap
```typescript
interface ActivityHeatmap {
  data: Array<{
    date: string;
    activity: number; // 0-100
    conversations: number;
    messages: number;
  }>;
  month: string;
  totalActivity: number;
}
```

### 7. Insights de IA
```typescript
interface AIRecommendations {
  summary: string;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    confidence: number; // 0-100
    impact: 'high' | 'medium' | 'low';
    tags: string[];
    action?: string;
  }>;
  lastUpdated: string;
}
```

---

## 📊 TABLA ACTUAL VS OBJETIVO

| Widget | Endpoint Actual | DTO Actual | DTO Objetivo | Gap | Acción |
|--------|----------------|------------|--------------|-----|---------|
| **KPIs** | `/dashboard/metrics` | `{ summary: { totalMessages, totalContacts } }` | `DashboardKPI[]` | ❌ Sin sentimiento, tiempo respuesta, resolución, ventas | 🔄 Adaptar + crear nuevos endpoints |
| **Actividad** | `/dashboard/recent-activity` | `{ activities: [] }` | `ActivityChart` | ❌ Sin granularidad por hora, comparación | 🔄 Adaptar + agregar granularidad |
| **Ranking** | `/dashboard/metrics` (básico) | `{ userActivity: { activeUsers } }` | `AgentRanking` | ❌ Sin métricas detalladas por agente | 🆕 Crear `/dashboard/agents/ranking` |
| **Sentimiento** | ❌ No existe | - | `SentimentAnalysis` | ❌ Completamente faltante | 🆕 Crear `/dashboard/sentiment` |
| **Temas/Alertas** | ❌ No existe | - | `AIInsights` | ❌ Completamente faltante | 🆕 Crear `/dashboard/ai/insights` |
| **Calendario** | ❌ No existe | - | `ActivityHeatmap` | ❌ Completamente faltante | 🆕 Crear `/dashboard/activity/heatmap` |
| **Insights IA** | ❌ No existe | - | `AIRecommendations` | ❌ Completamente faltante | 🆕 Crear `/dashboard/ai/recommendations` |

**Leyenda**: 🔄 Adaptar endpoint existente | 🆕 Crear nuevo endpoint

---

## 📝 CONTRATOS PROPUESTOS (TYPESCRIPT)

### Nuevos Endpoints Backend

#### 1. Sentimiento y Análisis
```typescript
// GET /api/dashboard/sentiment
interface SentimentResponse {
  success: boolean;
  data: {
    overall: {
      positive: number;
      neutral: number;
      negative: number;
    };
    breakdown: Array<{
      category: string;
      positive: number;
      neutral: number;
      negative: number;
    }>;
    trend: 'improving' | 'declining' | 'stable';
    period: {
      start: string;
      end: string;
    };
  };
}
```

#### 2. Ranking de Agentes
```typescript
// GET /api/dashboard/agents/ranking
interface AgentRankingResponse {
  success: boolean;
  data: {
    agents: Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string;
      role: string;
      metrics: {
        conversations: number;
        avgResponseTime: number; // minutos
        satisfaction: number; // 0-100
        resolutionRate: number; // 0-100
        messagesSent: number;
        activeHours: number;
      };
      rank: number;
      change: number; // vs período anterior
    }>;
    period: string;
    totalAgents: number;
  };
}
```

#### 3. Actividad por Hora
```typescript
// GET /api/dashboard/activity/hourly
interface HourlyActivityResponse {
  success: boolean;
  data: {
    today: Array<{
      hour: number;
      messages: number;
      conversations: number;
      responses: number;
    }>;
    yesterday: Array<{
      hour: number;
      messages: number;
      conversations: number;
      responses: number;
    }>;
    peakHour: number;
    vsYesterday: number; // % diferencia
    totalToday: {
      messages: number;
      conversations: number;
      responses: number;
    };
  };
}
```

#### 4. Insights de IA
```typescript
// GET /api/dashboard/ai/insights
interface AIInsightsResponse {
  success: boolean;
  data: {
    topics: Array<{
      name: string;
      frequency: number;
      sentiment: 'positive' | 'neutral' | 'negative';
      trend: 'up' | 'down' | 'stable';
      confidence: number;
    }>;
    alerts: Array<{
      id: string;
      type: 'warning' | 'error' | 'info';
      severity: 'low' | 'medium' | 'high';
      message: string;
      timestamp: string;
      action?: string;
      dismissed: boolean;
    }>;
    summary: {
      totalTopics: number;
      activeAlerts: number;
      lastAnalysis: string;
    };
  };
}
```

#### 5. Calendario Heatmap
```typescript
// GET /api/dashboard/activity/heatmap
interface HeatmapResponse {
  success: boolean;
  data: {
    month: string;
    data: Array<{
      date: string;
      activity: number; // 0-100
      conversations: number;
      messages: number;
      responses: number;
    }>;
    totalActivity: number;
    averageActivity: number;
    busiestDay: string;
  };
}
```

#### 6. Recomendaciones IA
```typescript
// GET /api/dashboard/ai/recommendations
interface AIRecommendationsResponse {
  success: boolean;
  data: {
    summary: string;
    recommendations: Array<{
      id: string;
      title: string;
      description: string;
      confidence: number; // 0-100
      impact: 'high' | 'medium' | 'low';
      tags: string[];
      action?: string;
      category: 'performance' | 'efficiency' | 'quality' | 'growth';
    }>;
    lastUpdated: string;
    totalRecommendations: number;
  };
}
```

### Frontend Types
```typescript
// src/lib/types/dashboard.ts
export interface DashboardState {
  kpis: DashboardKPI[];
  activity: ActivityChart;
  agentRanking: AgentRanking;
  sentiment: SentimentAnalysis;
  aiInsights: AIInsights;
  heatmap: ActivityHeatmap;
  recommendations: AIRecommendations;
  loading: boolean;
  error: string | null;
}

export interface DashboardFilters {
  period: '1d' | '7d' | '30d' | '90d';
  startDate?: string;
  endDate?: string;
  agents?: string[];
  categories?: string[];
}
```

---

## 🚀 PLAN POR FASES

### FASE 0: SCAFFOLDING (1 semana)
**Objetivo**: Crear estructura base con feature flag

#### Micro-tareas:
1. **Crear feature flag** en `environment.ts`
   ```typescript
   DASHBOARD_V2_ENABLED: import.meta.env.VITE_DASHBOARD_V2_ENABLED === 'true'
   ```

2. **Crear ruta paralela** `/dashboard-v2`
   ```
   src/routes/dashboard-v2/+page.svelte
   src/routes/dashboard-v2/+layout.svelte
   ```

3. **Crear store de dashboard V2**
   ```typescript
   src/lib/stores/dashboard-v2.store.ts
   ```

4. **Crear componentes base**
   ```
   src/lib/components/dashboard-v2/
   ├── KPICard.svelte
   ├── ActivityChart.svelte
   ├── AgentRanking.svelte
   ├── SentimentChart.svelte
   ├── AIInsights.svelte
   ├── ActivityHeatmap.svelte
   └── AIRecommendations.svelte
   ```

5. **Crear grid responsive**
   ```css
   .dashboard-v2-grid {
     display: grid;
     grid-template-columns: repeat(12, 1fr);
     gap: 1.5rem;
   }
   ```

6. **Implementar Skeletons**
   ```typescript
   src/lib/components/dashboard-v2/SkeletonCard.svelte
   ```

#### Criterios de "Done":
- ✅ Feature flag funcional
- ✅ Ruta `/dashboard-v2` accesible
- ✅ Grid responsive implementado
- ✅ Skeletons mostrando loading
- ✅ No afecta `/dashboard` existente

#### Riesgos:
- **Bajo**: Solo creación de archivos nuevos
- **Rollback**: Eliminar feature flag

---

### FASE 1: KPIs + Actividad (2 semanas)
**Objetivo**: Implementar KPIs principales y gráfico de actividad

#### Micro-tareas:
1. **Adaptar endpoint existente** `/dashboard/metrics`
   - Agregar sentimiento, tiempo respuesta, resolución, ventas
   - Mantener compatibilidad con endpoint actual

2. **Crear endpoint** `/dashboard/activity/hourly`
   - Datos por hora para hoy y ayer
   - Comparación y picos

3. **Implementar KPICard.svelte**
   - 4 cards con métricas principales
   - Indicadores de tendencia
   - Formateo de valores (%%, duración, moneda)

4. **Implementar ActivityChart.svelte**
   - Gráfico de barras por hora
   - Comparación vs ayer
   - Indicadores de pico

5. **Crear store methods**
   ```typescript
   loadKPIs(filters: DashboardFilters)
   loadActivity(filters: DashboardFilters)
   ```

#### Criterios de "Done":
- ✅ 4 KPIs mostrando datos reales
- ✅ Gráfico de actividad funcional
- ✅ Formateo correcto de valores
- ✅ Comparaciones vs período anterior
- ✅ Loading states y error handling

#### Riesgos:
- **Medio**: Modificación de endpoint existente
- **Rollback**: Revertir cambios en endpoint

---

### FASE 2: Ranking de Agentes (1 semana)
**Objetivo**: Implementar ranking detallado de agentes

#### Micro-tareas:
1. **Crear endpoint** `/dashboard/agents/ranking`
   - Métricas por agente
   - Ranking y cambios
   - Filtros por período

2. **Implementar AgentRanking.svelte**
   - Tabla con ranking
   - Métricas detalladas
   - Avatares y nombres

3. **Agregar al store**
   ```typescript
   loadAgentRanking(filters: DashboardFilters)
   ```

#### Criterios de "Done":
- ✅ Ranking funcional con datos reales
- ✅ Métricas detalladas por agente
- ✅ Indicadores de cambio
- ✅ Filtros por período

#### Riesgos:
- **Bajo**: Nuevo endpoint
- **Rollback**: Deshabilitar feature

---

### FASE 3: Sentimiento + Temas/Alertas IA (2 semanas)
**Objetivo**: Implementar análisis de sentimiento y insights de IA

#### Micro-tareas:
1. **Crear endpoint** `/dashboard/sentiment`
   - Análisis de sentimiento general
   - Breakdown por categorías
   - Tendencias

2. **Crear endpoint** `/dashboard/ai/insights`
   - Temas detectados
   - Alertas automáticas
   - Frecuencias y tendencias

3. **Implementar SentimentChart.svelte**
   - Donut chart de sentimiento
   - Breakdown detallado
   - Indicadores de tendencia

4. **Implementar AIInsights.svelte**
   - Lista de temas
   - Alertas con severidad
   - Acciones recomendadas

#### Criterios de "Done":
- ✅ Análisis de sentimiento funcional
- ✅ Temas detectados automáticamente
- ✅ Alertas con severidad
- ✅ Visualizaciones correctas

#### Riesgos:
- **Medio**: Nuevos endpoints de IA
- **Rollback**: Deshabilitar análisis de IA

---

### FASE 4: Calendario Heatmap (1 semana)
**Objetivo**: Implementar calendario de actividad mensual

#### Micro-tareas:
1. **Crear endpoint** `/dashboard/activity/heatmap`
   - Datos de actividad por día
   - Métricas mensuales
   - Días más ocupados

2. **Implementar ActivityHeatmap.svelte**
   - Calendario visual
   - Heatmap de actividad
   - Tooltips informativos

3. **Agregar al store**
   ```typescript
   loadHeatmap(month: string)
   ```

#### Criterios de "Done":
- ✅ Heatmap funcional
- ✅ Datos de actividad por día
- ✅ Navegación entre meses
- ✅ Tooltips informativos

#### Riesgos:
- **Bajo**: Nuevo endpoint
- **Rollback**: Deshabilitar feature

---

### FASE 5: Insights de IA (1 semana)
**Objetivo**: Implementar recomendaciones y resumen de IA

#### Micro-tareas:
1. **Crear endpoint** `/dashboard/ai/recommendations`
   - Recomendaciones automáticas
   - Resumen ejecutivo
   - Confianza y impacto

2. **Implementar AIRecommendations.svelte**
   - Lista de recomendaciones
   - Indicadores de confianza
   - Acciones sugeridas

3. **Agregar al store**
   ```typescript
   loadRecommendations()
   ```

#### Criterios de "Done":
- ✅ Recomendaciones funcionales
- ✅ Resumen ejecutivo
- ✅ Indicadores de confianza
- ✅ Acciones sugeridas

#### Riesgos:
- **Medio**: Nuevo endpoint de IA
- **Rollback**: Deshabilitar recomendaciones

---

## ✅ CHECKLIST "NO ROMPER NADA"

### Rutas y Navegación
- [ ] `/dashboard` existente intacto
- [ ] `/dashboard-v2` solo accesible con feature flag
- [ ] Navegación entre rutas funcional
- [ ] Breadcrumbs actualizados

### Autenticación y Roles
- [ ] Auth middleware aplicado a `/dashboard-v2`
- [ ] Roles y permisos respetados
- [ ] Redirección a login si no autenticado
- [ ] Logout funcional desde V2

### Caching y Performance
- [ ] Rate limiting respetado
- [ ] Cache TTL configurado
- [ ] No duplicar requests innecesarios
- [ ] Lazy loading de componentes

### SSR/CSR
- [ ] SSR funcional para SEO
- [ ] Hydration correcta
- [ ] No errores de hidratación
- [ ] Loading states apropiados

### Responsive y UX
- [ ] Grid responsive en móvil
- [ ] Sin scroll horizontal
- [ ] Touch targets apropiados
- [ ] Accesibilidad AA

### Timezone y Localización
- [ ] Fechas en timezone correcto
- [ ] Formateo de números localizado
- [ ] Moneda en formato correcto
- [ ] i18n preparado para futuro

### Testing
- [ ] Tests unitarios para nuevos componentes
- [ ] Tests de integración para endpoints
- [ ] Tests E2E para flujo completo
- [ ] Coverage mínimo 80%

### Monitoreo
- [ ] Logs apropiados
- [ ] Métricas de performance
- [ ] Error tracking
- [ ] Analytics de uso

---

## ⚠️ RIESGOS Y MITIGACIÓN

### Riesgos Técnicos

#### 1. Performance de Endpoints
**Riesgo**: Nuevos endpoints lentos
**Mitigación**: 
- Caching inteligente (TTL configurado)
- Rate limiting apropiado
- Paginación para datos grandes
- Progressive loading

#### 2. Compatibilidad de Datos
**Riesgo**: Cambios en DTOs rompen frontend
**Mitigación**:
- Versionado de APIs
- Mantener compatibilidad hacia atrás
- Feature flags por endpoint

#### 3. Análisis de IA
**Riesgo**: IA lenta o inexacta
**Mitigación**:
- Fallbacks a datos básicos
- Caching de resultados
- Indicadores de confianza
- Opción de deshabilitar

### Riesgos de Negocio

#### 1. Adopción de Usuarios
**Riesgo**: Usuarios no usan V2
**Mitigación**:
- A/B testing
- Feedback temprano
- Migración gradual
- Training y documentación

#### 2. Datos Incorrectos
**Riesgo**: Métricas incorrectas
**Mitigación**:
- Validación de datos
- Logs detallados
- Alertas automáticas
- Revisión manual

### Plan de Rollback
1. **Fase 0-1**: Eliminar feature flag
2. **Fase 2-3**: Deshabilitar endpoints nuevos
3. **Fase 4-5**: Revertir a dashboard original
4. **Completo**: Rollback de base de datos si necesario

---

## ❓ PREGUNTAS BLOQUEANTES

### Timezone y Localización
1. **¿Qué timezone usar para métricas?** UTC vs timezone del usuario
2. **¿Cómo manejar horarios de trabajo?** 9-18h vs 24h
3. **¿Formato de fechas preferido?** DD/MM/YYYY vs MM/DD/YYYY
4. **¿Soporte para múltiples idiomas?** i18n requerido

### Moneda y Formateo
1. **¿Moneda por defecto?** USD, EUR, local
2. **¿Formato de números?** 1,234.56 vs 1.234,56
3. **¿Redondeo de porcentajes?** 1 decimal vs 2 decimales
4. **¿Formato de duración?** 2.4min vs 2m 24s

### Límites y Configuración
1. **¿Límite de histórico?** 30 días vs 90 días vs 1 año
2. **¿TTL de caché por widget?** 5min vs 15min vs 1h
3. **¿Rate limiting por usuario?** 100/min vs 1000/min
4. **¿Límite de agentes en ranking?** Top 10 vs Top 50

### Funcionalidades Avanzadas
1. **¿Export de datos?** CSV, PDF, Excel
2. **¿WebSocket para updates?** Real-time vs polling
3. **¿Dark mode?** Requerido vs opcional
4. **¿Personalización?** Widgets configurables

### IA y Análisis
1. **¿Confianza mínima para insights?** 70% vs 80% vs 90%
2. **¿Frecuencia de análisis?** Cada hora vs cada día
3. **¿Retención de datos de IA?** 30 días vs 90 días
4. **¿Alertas automáticas?** Email vs push vs in-app

### Integración y APIs
1. **¿Webhooks para eventos?** Sí vs No
2. **¿API pública para partners?** Sí vs No
3. **¿Rate limiting por API key?** Sí vs No
4. **¿Documentación de API?** Swagger vs manual

---

## 📅 CRONOGRAMA ESTIMADO

| Fase | Duración | Fecha Inicio | Fecha Fin | Dependencias |
|------|----------|--------------|-----------|--------------|
| **Fase 0** | 1 semana | Semana 1 | Semana 1 | Ninguna |
| **Fase 1** | 2 semanas | Semana 2 | Semana 3 | Fase 0 |
| **Fase 2** | 1 semana | Semana 4 | Semana 4 | Fase 1 |
| **Fase 3** | 2 semanas | Semana 5 | Semana 6 | Fase 2 |
| **Fase 4** | 1 semana | Semana 7 | Semana 7 | Fase 3 |
| **Fase 5** | 1 semana | Semana 8 | Semana 8 | Fase 4 |

**Total**: 8 semanas (2 meses)

### Hitos Principales
- **Semana 1**: Scaffolding completo
- **Semana 3**: KPIs y actividad funcionales
- **Semana 4**: Ranking de agentes
- **Semana 6**: Sentimiento y alertas IA
- **Semana 7**: Calendario heatmap
- **Semana 8**: Insights de IA completos

### Criterios de Éxito
- ✅ Dashboard V2 funcional con feature flag
- ✅ Todos los widgets implementados
- ✅ Performance aceptable (<2s carga)
- ✅ Sin errores en producción
- ✅ Adopción >50% de usuarios activos

---

## 🎯 PRÓXIMOS PASOS

1. **Aprobación del plan** por stakeholders
2. **Resolución de preguntas bloqueantes**
3. **Configuración de feature flags**
4. **Inicio de Fase 0: Scaffolding**
5. **Setup de monitoreo y testing**

**Riesgo estimado**: **5%** (muy bajo)
**Impacto en producción**: **0%** (rutas paralelas)
**ROI esperado**: **Alto** (dashboard moderno y funcional)