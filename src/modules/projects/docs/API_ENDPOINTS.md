# Documentación Completa de Endpoints del Backend - Módulo de Proyectos

## Tabla de Contenidos
- [Proyectos Base](#proyectos-base)
- [Tareas](#tareas)
- [Timeline y Fases](#timeline-y-fases)
- [Presupuesto y Gastos](#presupuesto-y-gastos)
- [Equipo y Recursos](#equipo-y-recursos)
- [Materiales e Inventario](#materiales-e-inventario)
- [Documentos](#documentos)
- [Calidad e Inspecciones](#calidad-e-inspecciones)
- [Riesgos](#riesgos)
- [Analíticas y Reportes](#analíticas-y-reportes)
- [Plantillas](#plantillas)
- [Automatizaciones](#automatizaciones)
- [Integraciones](#integraciones)
- [Custom Fields](#custom-fields)
- [Comunicación](#comunicación)
- [Permisos](#permisos)

---

## Proyectos Base

### Crear Proyecto
```
POST /api/projects
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "type": "construction|software|manufacturing|services|custom",
  "category": "string",
  "priority": "low|medium|high|critical",
  "clientId": "string",
  "startDate": "ISO date",
  "endDate": "ISO date",
  "budget": {
    "total": number,
    "currency": "string"
  },
  "owner": "string (user ID)",
  "managers": ["string"],
  "tags": ["string"],
  "customFields": {},
  "settings": {}
}
```
**Response:**
```json
{
  "success": true,
  "data": { Project },
  "message": "Proyecto creado exitosamente"
}
```

### Listar Proyectos
```
GET /api/projects?page=1&limit=20&status=active&type=construction
```
**Query Parameters:**
- `page` (number): Página actual
- `limit` (number): Items por página
- `search` (string): Búsqueda por nombre/código
- `status` (string[]): Filtrar por estado
- `type` (string[]): Filtrar por tipo
- `priority` (string[]): Filtrar por prioridad
- `owner` (string): Filtrar por propietario
- `tags` (string[]): Filtrar por etiquetas
- `isArchived` (boolean): Incluir archivados
- `isFavorite` (boolean): Solo favoritos
- `sortBy` (string): Campo para ordenar
- `sortOrder` (asc|desc): Orden

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [Project],
    "total": number,
    "page": number,
    "limit": number,
    "hasMore": boolean,
    "aggregations": {
      "byType": {},
      "byStatus": {},
      "byPriority": {}
    }
  }
}
```

### Obtener Proyecto
```
GET /api/projects/:id
```
**Response:**
```json
{
  "success": true,
  "data": { Project completo con todas las relaciones }
}
```

### Actualizar Proyecto
```
PUT /api/projects/:id
```
**Body:** Campos parciales del proyecto
**Response:** Proyecto actualizado

### Eliminar Proyecto
```
DELETE /api/projects/:id
```
**Response:**
```json
{
  "success": true,
  "message": "Proyecto eliminado exitosamente"
}
```

### Duplicar Proyecto
```
POST /api/projects/:id/duplicate
```
**Body:**
```json
{
  "includeTasks": boolean,
  "includeTeam": boolean,
  "includeBudget": boolean,
  "includeDocuments": boolean,
  "newName": "string"
}
```
**Response:** Nuevo proyecto creado

### Archivar Proyecto
```
POST /api/projects/:id/archive
```
**Body:**
```json
{
  "archive": boolean,
  "reason": "string"
}
```

### Estadísticas del Proyecto
```
GET /api/projects/:id/stats
```
**Response:** ProjectStats object

### Actividad del Proyecto
```
GET /api/projects/:id/activity?limit=50&offset=0
```
**Response:** Array de ProjectActivity

---

## Tareas

### Crear Tarea
```
POST /api/projects/:projectId/tasks
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "type": "milestone|phase|task|subtask|inspection|approval",
  "parentId": "string",
  "phaseId": "string",
  "assignedTo": ["string"],
  "owner": "string",
  "startDate": "ISO date",
  "dueDate": "ISO date",
  "estimatedHours": number,
  "priority": "low|medium|high|critical",
  "status": "not_started|in_progress|completed",
  "location": {
    "floor": "string",
    "zone": "string",
    "coordinates": { "lat": number, "lng": number }
  },
  "materials": [],
  "checklist": [],
  "customFields": {}
}
```

### Listar Tareas
```
GET /api/projects/:projectId/tasks
```
**Query Parameters:**
- Todos los filtros de TaskFilters

### Obtener Tarea
```
GET /api/projects/:projectId/tasks/:taskId
```

### Actualizar Tarea
```
PUT /api/projects/:projectId/tasks/:taskId
```

### Eliminar Tarea
```
DELETE /api/projects/:projectId/tasks/:taskId
```

### Crear Subtarea
```
POST /api/projects/:projectId/tasks/:taskId/subtasks
```

### Agregar Dependencia
```
POST /api/projects/:projectId/tasks/:taskId/dependencies
```
**Body:**
```json
{
  "predecessorId": "string (required)",
  "type": "finish_to_start|start_to_start|finish_to_finish|start_to_finish",
  "lag": number (días, puede ser negativo)
}
```

### Eliminar Dependencia
```
DELETE /api/projects/:projectId/tasks/:taskId/dependencies/:depId
```

### Ruta Crítica
```
GET /api/projects/:projectId/tasks/critical-path
```
**Response:**
```json
{
  "success": true,
  "data": {
    "path": [Task],
    "totalDuration": number,
    "bottlenecks": ["string"],
    "slackByTask": {}
  }
}
```

### Agregar Item a Checklist
```
POST /api/projects/:projectId/tasks/:taskId/checklist
```

### Actualizar Item de Checklist
```
PUT /api/projects/:projectId/tasks/:taskId/checklist/:itemId
```

### Subir Adjunto a Tarea
```
POST /api/projects/:projectId/tasks/:taskId/attachments
```
**Form Data:** file + metadata

### Agregar Comentario a Tarea
```
POST /api/projects/:projectId/tasks/:taskId/comments
```
**Body:**
```json
{
  "text": "string (required)",
  "mentions": ["string"],
  "attachments": ["string"],
  "replyTo": "string"
}
```

### Actualizar Progreso
```
PUT /api/projects/:projectId/tasks/:taskId/progress
```
**Body:**
```json
{
  "progress": number (0-100)
}
```

### Cambiar Estado
```
PUT /api/projects/:projectId/tasks/:taskId/status
```
**Body:**
```json
{
  "status": "string"
}
```

### Asignar Tarea
```
POST /api/projects/:projectId/tasks/:taskId/assign
```
**Body:**
```json
{
  "assignees": ["string"]
}
```

---

## Timeline y Fases

### Obtener Timeline
```
GET /api/projects/:id/timeline
```

### Actualizar Timeline
```
PUT /api/projects/:id/timeline
```

### Crear Fase
```
POST /api/projects/:id/phases
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "startDate": "ISO date",
  "endDate": "ISO date",
  "budgetAllocated": number,
  "requiresApproval": boolean,
  "predecessorIds": ["string"]
}
```

### Actualizar Fase
```
PUT /api/projects/:id/phases/:phaseId
```

### Eliminar Fase
```
DELETE /api/projects/:id/phases/:phaseId
```

### Crear Milestone
```
POST /api/projects/:id/milestones
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "date": "ISO date",
  "phaseId": "string",
  "criteria": ["string"],
  "requiresApproval": boolean,
  "critical": boolean
}
```

### Actualizar Milestone
```
PUT /api/projects/:id/milestones/:milestoneId
```

### Datos para Gantt
```
GET /api/projects/:id/gantt
```
**Query Parameters:** GanttViewConfig
**Response:** Datos formateados para renderizar Gantt

### Datos para Calendario
```
GET /api/projects/:id/calendar?start=2025-01-01&end=2025-12-31
```

### Crear Baseline
```
POST /api/projects/:id/baselines
```
**Body:**
```json
{
  "name": "string (required)",
  "description": "string"
}
```

### Análisis de Varianza
```
GET /api/projects/:id/timeline/variance?baselineId=xxx
```

### Recalcular Cronograma
```
POST /api/projects/:id/timeline/recalculate
```
**Response:** Timeline recalculado con nuevas fechas

---

## Presupuesto y Gastos

### Obtener Presupuesto
```
GET /api/projects/:id/budget
```

### Actualizar Presupuesto
```
PUT /api/projects/:id/budget
```

### Crear Categoría de Presupuesto
```
POST /api/projects/:id/budget/categories
```
**Body:**
```json
{
  "name": "string (required)",
  "budgeted": number,
  "parentId": "string",
  "alertThreshold": number
}
```

### Registrar Gasto
```
POST /api/projects/:id/expenses
```
**Body:**
```json
{
  "date": "ISO date",
  "category": "string (required)",
  "description": "string (required)",
  "amount": number (required),
  "currency": "string",
  "type": "material|labor|equipment|service|other",
  "providerId": "string",
  "employeeId": "string",
  "taskId": "string",
  "phaseId": "string",
  "budgetCategoryId": "string",
  "paymentMethod": "cash|check|transfer|card",
  "isRecurring": boolean,
  "receipts": ["string (URLs)"],
  "notes": "string"
}
```

### Listar Gastos
```
GET /api/projects/:id/expenses
```
**Query Parameters:**
- `category`, `status`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`

### Actualizar Gasto
```
PUT /api/projects/:id/expenses/:expenseId
```

### Eliminar Gasto
```
DELETE /api/projects/:id/expenses/:expenseId
```

### Aprobar Gasto
```
POST /api/projects/:id/expenses/:expenseId/approve
```
**Body:**
```json
{
  "comments": "string"
}
```

### Rechazar Gasto
```
POST /api/projects/:id/expenses/:expenseId/reject
```
**Body:**
```json
{
  "reason": "string (required)"
}
```

### Proyección Financiera
```
POST /api/projects/:id/budget/forecast
```
**Body:**
```json
{
  "includeRisks": boolean,
  "includeContingency": boolean,
  "horizon": number (días)
}
```
**Response:** BudgetForecast

### Análisis de Varianza Presupuestaria
```
GET /api/projects/:id/budget/variance
```
**Response:** BudgetVariance

### Flujo de Caja
```
GET /api/projects/:id/cashflow?startDate=xxx&endDate=xxx&interval=monthly
```
**Response:** Array de CashFlowProjection

### Crear Factura
```
POST /api/projects/:id/invoices
```
**Body:** Invoice object

### Listar Facturas
```
GET /api/projects/:id/invoices
```

### Resumen Financiero
```
GET /api/projects/:id/financial-summary
```
**Response:** FinancialSummary

---

## Equipo y Recursos

### Listar Miembros del Equipo
```
GET /api/projects/:id/team/members
```

### Agregar Miembro
```
POST /api/projects/:id/team/members
```
**Body:**
```json
{
  "employeeId": "string (required)",
  "role": "string (required)",
  "allocation": number (0-100),
  "hourlyRate": number,
  "startDate": "ISO date",
  "endDate": "ISO date"
}
```

### Actualizar Miembro
```
PUT /api/projects/:id/team/members/:memberId
```

### Remover Miembro
```
DELETE /api/projects/:id/team/members/:memberId
```

### Disponibilidad del Equipo
```
GET /api/projects/:id/team/availability?dateFrom=xxx&dateTo=xxx
```
**Response:** Array de EmployeeAvailability

### Carga de Trabajo
```
GET /api/projects/:id/team/workload
```
**Response:** Array de EmployeeWorkload

### Registrar Tiempo
```
POST /api/projects/:id/team/time-entries
```
**Body:**
```json
{
  "employeeId": "string (required)",
  "taskId": "string",
  "date": "ISO date (required)",
  "hours": number (required),
  "description": "string",
  "isOvertime": boolean,
  "billable": boolean
}
```

### Obtener Entradas de Tiempo
```
GET /api/projects/:id/team/time-entries
```

### Aprobar Entrada de Tiempo
```
POST /api/projects/:id/team/time-entries/:entryId/approve
```

### Crear Rol
```
POST /api/projects/:id/team/roles
```

### Sugerencias de Asignación (IA)
```
GET /api/projects/:id/team/suggestions?taskId=xxx&count=5
```
**Response:** Array de AssignmentSuggestion

### Exportar para Nómina
```
GET /api/projects/:id/team/payroll-export?periodStart=xxx&periodEnd=xxx&format=excel
```
**Response:** Archivo Excel/CSV con horas trabajadas

---

## Materiales e Inventario

### Listar Materiales
```
GET /api/projects/:id/materials
```

### Agregar Material
```
POST /api/projects/:id/materials
```
**Body:**
```json
{
  "name": "string (required)",
  "specification": "string",
  "category": "string",
  "unit": "string",
  "quantityPlanned": number,
  "unitCost": number,
  "preferredProviderId": "string",
  "minStock": number,
  "storageLocations": []
}
```

### Actualizar Material
```
PUT /api/projects/:id/materials/:materialId
```

### Eliminar Material
```
DELETE /api/projects/:id/materials/:materialId
```

### Crear Solicitud de Material
```
POST /api/projects/:id/materials/request
```
**Body:**
```json
{
  "materialName": "string (required)",
  "quantity": number (required),
  "unit": "string",
  "purpose": "string",
  "taskId": "string",
  "urgency": "low|medium|high|critical",
  "requiredDate": "ISO date",
  "estimatedCost": number
}
```

### Listar Solicitudes
```
GET /api/projects/:id/materials/requests
```

### Aprobar Solicitud
```
POST /api/projects/:id/materials/requests/:requestId/approve
```
**Body:**
```json
{
  "approvedCost": number
}
```

### Crear Orden de Compra
```
POST /api/projects/:id/purchase-orders
```

### Listar Órdenes de Compra
```
GET /api/projects/:id/purchase-orders
```

### Listar Entregas
```
GET /api/projects/:id/deliveries
```

### Recibir Entrega
```
POST /api/projects/:id/deliveries/:deliveryId/receive
```
**Body:**
```json
{
  "items": [
    {
      "materialId": "string",
      "deliveredQuantity": number,
      "acceptedQuantity": number,
      "rejectedQuantity": number,
      "notes": "string"
    }
  ],
  "inspectionNotes": "string",
  "photos": ["string (URLs)"],
  "signature": "string (base64)"
}
```

### Inventario del Proyecto
```
GET /api/projects/:id/materials/inventory
```
**Response:** MaterialsSummary

### Registrar Desperdicio
```
POST /api/projects/:id/materials/waste
```
**Body:**
```json
{
  "materialId": "string (required)",
  "quantity": number (required)",
  "reason": "damage|excess|obsolete|quality|theft|other",
  "description": "string",
  "preventable": boolean,
  "photos": ["string"]
}
```

### Reservar del Inventario Global
```
POST /api/projects/:id/materials/:materialId/reserve
```
**Body:**
```json
{
  "quantity": number
}
```

---

## Documentos

### Subir Documento
```
POST /api/projects/:id/documents
```
**Form Data:**
- `file`: File
- `metadata`: JSON string con folderId, category, tags, etc.

### Listar Documentos
```
GET /api/projects/:id/documents
```

### Obtener Documento
```
GET /api/projects/:id/documents/:docId
```

### Actualizar Documento
```
PUT /api/projects/:id/documents/:docId
```

### Eliminar Documento
```
DELETE /api/projects/:id/documents/:docId
```

### Nueva Versión
```
POST /api/projects/:id/documents/:docId/versions
```
**Form Data:**
- `file`: File
- `changeDescription`: string

### Historial de Versiones
```
GET /api/projects/:id/documents/:docId/versions
```

### Agregar Comentario
```
POST /api/projects/:id/documents/:docId/comments
```

### Solicitar Aprobación
```
POST /api/projects/:id/documents/:docId/approve
```
**Body:**
```json
{
  "approvers": ["string"],
  "workflowId": "string",
  "message": "string"
}
```

### Crear Carpeta
```
POST /api/projects/:id/folders
```

### Buscar Documentos
```
GET /api/projects/:id/documents/search?query=xxx
```

### Descargar Documento
```
GET /api/projects/:id/documents/:docId/download
```

---

## Calidad e Inspecciones

### Crear Inspección
```
POST /api/projects/:id/inspections
```

### Listar Inspecciones
```
GET /api/projects/:id/inspections
```

### Actualizar Inspección
```
PUT /api/projects/:id/inspections/:inspectionId
```

### Completar Inspección
```
POST /api/projects/:id/inspections/:inspectionId/complete
```

### Reportar No Conformidad
```
POST /api/projects/:id/quality/issues
```

### Listar No Conformidades
```
GET /api/projects/:id/quality/issues
```

### Crear Estándar de Calidad
```
POST /api/projects/:id/quality/standards
```

### Crear Auditoría
```
POST /api/projects/:id/quality/audits
```

### Resumen de Calidad
```
GET /api/projects/:id/quality/summary
```

### Subir Foto de Inspección
```
POST /api/projects/:id/inspections/:inspectionId/photos
```

---

## Riesgos

### Crear Riesgo
```
POST /api/projects/:id/risks
```

### Listar Riesgos
```
GET /api/projects/:id/risks
```

### Actualizar Riesgo
```
PUT /api/projects/:id/risks/:riskId
```

### Eliminar Riesgo
```
DELETE /api/projects/:id/risks/:riskId
```

### Plan de Respuesta
```
POST /api/projects/:id/risks/:riskId/response
```

### Matriz de Riesgos
```
GET /api/projects/:id/risks/matrix
```

### Análisis de Riesgos
```
GET /api/projects/:id/risks/analysis
```

### Reporte de Riesgos
```
GET /api/projects/:id/risks/report
```

### Marcar como Ocurrido
```
POST /api/projects/:id/risks/:riskId/occurred
```

---

## Analíticas y Reportes

### Dashboard Principal
```
GET /api/projects/:id/dashboard
```

### Métricas del Proyecto
```
GET /api/projects/:id/metrics
```

### Health Score
```
GET /api/projects/:id/health
```

### Generar Reporte
```
GET /api/projects/:id/reports/:type
```
Tipos: `status`, `financial`, `time`, `resource`, `quality`, `risk`, `executive`

### Crear Dashboard Personalizado
```
POST /api/projects/:id/dashboards
```

### Obtener Dashboard Personalizado
```
GET /api/projects/:id/dashboards/:dashboardId
```

### Predicciones con IA
```
GET /api/projects/:id/analytics/predictions
```

### Tendencias
```
GET /api/projects/:id/analytics/trends
```

### Exportar Reporte
```
GET /api/projects/:id/reports/:reportId/export/:format
```

### Programar Reporte
```
POST /api/projects/:id/reports/schedule
```

---

## Plantillas

### Listar Plantillas
```
GET /api/projects/templates
```

### Obtener Plantilla
```
GET /api/projects/templates/:templateId
```

### Crear Plantilla
```
POST /api/projects/templates
```

### Actualizar Plantilla
```
PUT /api/projects/templates/:templateId
```

### Eliminar Plantilla
```
DELETE /api/projects/templates/:templateId
```

### Marketplace
```
GET /api/projects/templates/marketplace
```

### Agregar Review
```
POST /api/projects/templates/:templateId/reviews
```

### Clonar Plantilla
```
POST /api/projects/templates/:templateId/clone
```

### Crear Proyecto desde Plantilla
```
POST /api/projects/from-template/:templateId
```

### Guardar Proyecto como Plantilla
```
POST /api/projects/:id/save-as-template
```

---

## Automatizaciones

### Listar Automatizaciones
```
GET /api/projects/:id/automations
```

### Crear Automatización
```
POST /api/projects/:id/automations
```

### Actualizar Automatización
```
PUT /api/projects/:id/automations/:automationId
```

### Eliminar Automatización
```
DELETE /api/projects/:id/automations/:automationId
```

### Probar Automatización
```
POST /api/projects/:id/automations/:automationId/test
```

### Logs de Ejecución
```
GET /api/projects/:id/automations/:automationId/logs
```

---

## Integraciones

### Empleados Disponibles (HR)
```
GET /api/projects/:id/integrations/hr/employees
```

### Asignar Empleado (HR)
```
POST /api/projects/:id/integrations/hr/assign
```

### Sincronizar Tiempo con Nómina
```
POST /api/projects/:id/integrations/hr/sync-time
```

### Materiales del Inventario
```
GET /api/projects/:id/integrations/inventory/materials
```

### Reservar Material (Inventario)
```
POST /api/projects/:id/integrations/inventory/reserve
```

### Transferir Material (Inventario)
```
POST /api/projects/:id/integrations/inventory/transfer
```

### Cotizaciones de Proveedores
```
GET /api/projects/:id/integrations/providers/quotes
```

### Crear PO en Proveedores
```
POST /api/projects/:id/integrations/providers/purchase-order
```

### Factura a Cliente
```
POST /api/projects/:id/integrations/clients/invoices
```

### Portal del Cliente
```
GET /api/projects/:id/integrations/clients/portal
```

### Configuración de Integraciones
```
GET /api/projects/:id/integrations/settings
PUT /api/projects/:id/integrations/settings
```

### Sincronizar Módulo
```
POST /api/projects/:id/integrations/sync
```

### Datos Compartidos
```
GET /api/projects/:id/integrations/shared-data
```

---

## Custom Fields

### Crear Custom Field
```
POST /api/projects/:id/custom-fields
```

### Listar Custom Fields
```
GET /api/projects/:id/custom-fields
```

### Actualizar Custom Field
```
PUT /api/projects/:id/custom-fields/:fieldId
```

### Eliminar Custom Field
```
DELETE /api/projects/:id/custom-fields/:fieldId
```

---

## Comunicación

### Agregar Comentario
```
POST /api/projects/:id/comments
```

### Listar Comentarios
```
GET /api/projects/:id/comments
```

### Crear Mención
```
POST /api/projects/:id/mentions
```

### Enviar Mensaje en Chat
```
POST /api/projects/:id/chat/messages
```

### Listar Aprobaciones
```
GET /api/projects/:id/approvals
```

### Responder Aprobación
```
POST /api/projects/:id/approvals/:approvalId/respond
```
**Body:**
```json
{
  "decision": "approved|rejected",
  "comments": "string"
}
```

---

## Permisos

### Obtener Permisos del Proyecto
```
GET /api/projects/:id/permissions
```

### Actualizar Permisos
```
PUT /api/projects/:id/permissions
```

### Crear Rol Personalizado
```
POST /api/projects/:id/roles
```

### Solicitar Acceso
```
POST /api/projects/:id/access-requests
```

### Aprobar/Rechazar Acceso
```
POST /api/projects/:id/access-requests/:requestId/respond
```

### Log de Auditoría
```
GET /api/projects/:id/audit-log?page=1&limit=100
```

---

## Notas Importantes para el Backend

### Validaciones Requeridas
1. **Fechas:** Validar que endDate > startDate
2. **Dependencias:** Detectar dependencias circulares
3. **Presupuesto:** Validar que gastos no excedan presupuesto (si está configurado)
4. **Permisos:** Validar permisos antes de cada operación
5. **Custom Fields:** Validar según las reglas definidas
6. **Archivos:** Escanear virus, validar tamaño y tipo

### Cálculos Automáticos
1. **Ruta Crítica:** Usar algoritmo CPM
2. **Cronograma:** Considerar calendario laboral, dependencias, recursos
3. **Presupuesto:** Calcular totales, varianza, forecast
4. **Progreso:** Calcular basado en tareas completadas
5. **Health Score:** Algoritmo de scoring basado en múltiples factores

### Notificaciones
- Enviar notificaciones según configuración del usuario
- Batch de notificaciones para evitar spam
- Respetar quiet hours
- Soportar múltiples canales (email, push, SMS, in-app)

### Performance
- Pagination obligatoria para listas grandes
- Cache de cálculos pesados
- Índices en campos frecuentemente filtrados
- Lazy loading de relaciones
- WebSockets para actualizaciones en tiempo real

### Seguridad
- Validar permisos en cada endpoint
- Rate limiting por usuario
- Sanitizar inputs
- Encriptar datos sensibles
- Logs de auditoría completos
- HTTPS obligatorio
- Tokens JWT con expiración

Este documento debe actualizarse conforme el backend implemente los endpoints.

