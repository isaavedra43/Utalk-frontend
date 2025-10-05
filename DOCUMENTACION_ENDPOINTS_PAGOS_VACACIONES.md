# 📋 Documentación Completa - Endpoints Pagos de Vacaciones

## 🎯 Descripción General

Sistema completo para el cálculo, gestión y control de pagos de vacaciones según la **Ley Federal del Trabajo Mexicana**, incluyendo prima vacacional del 25% y control total de pagos realizados y pendientes.

---

## 📊 Endpoints de Cálculo de Pagos

### 1. Calcular Pago de Vacaciones
```http
POST /api/vacations/calculate-payment
```

**Descripción:** Calcula automáticamente el pago de vacaciones incluyendo prima vacacional según LFT.

**Request Body:**
```json
{
  "employeeId": "string",
  "vacationDays": "number",
  "dailySalary": "number (opcional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employeeId": "string",
    "employeeName": "string",
    "dailySalary": 500.00,
    "vacationDays": 12,
    "vacationAmount": 6000.00,
    "primaVacacional": 1500.00,
    "totalAmount": 7500.00,
    "breakdown": {
      "baseSalary": 6000.00,
      "primaVacacional": 1500.00,
      "total": 7500.00
    },
    "legalBasis": {
      "law": "Ley Federal del Trabajo",
      "article": "Artículo 80",
      "percentage": 25
    }
  }
}
```

---

## 💰 Endpoints de Gestión de Pagos

### 2. Obtener Resumen de Pagos de Empleado
```http
GET /api/vacations/payments/summary/{employeeId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPaid": 45000.00,
    "totalPending": 7500.00,
    "totalOwed": 52500.00,
    "paymentsCount": 6,
    "pendingCount": 1,
    "lastPaymentDate": "2024-01-15T00:00:00.000Z",
    "nextPaymentDue": "2024-02-01T00:00:00.000Z"
  }
}
```

### 3. Obtener Historial de Pagos de Empleado
```http
GET /api/vacations/payments/{employeeId}
```

**Query Parameters:**
- `status` (opcional): `pending | paid | cancelled`
- `startDate` (opcional): Fecha inicio filtro
- `endDate` (opcional): Fecha fin filtro

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "employeeId": "string",
      "vacationRequestId": "string",
      "paymentDate": "2024-01-15T00:00:00.000Z",
      "days": 12,
      "dailySalary": 500.00,
      "vacationAmount": 6000.00,
      "primaVacacional": 1500.00,
      "totalAmount": 7500.00,
      "status": "paid",
      "paymentMethod": "cash",
      "paymentReference": "REF-2024-001",
      "notes": "Pago realizado en efectivo",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### 4. Procesar Pago de Vacaciones
```http
POST /api/vacations/payments
```

**Request Body:**
```json
{
  "employeeId": "string",
  "vacationRequestId": "string",
  "days": 12,
  "dailySalary": 500.00,
  "paymentMethod": "cash | bank_transfer | payroll",
  "paymentReference": "string (opcional)",
  "notes": "string (opcional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "employeeId": "string",
    "vacationRequestId": "string",
    "paymentDate": "2024-01-15T00:00:00.000Z",
    "days": 12,
    "dailySalary": 500.00,
    "vacationAmount": 6000.00,
    "primaVacacional": 1500.00,
    "totalAmount": 7500.00,
    "status": "pending",
    "paymentMethod": "cash",
    "paymentReference": null,
    "notes": null,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### 5. Marcar Pago como Realizado
```http
PUT /api/vacations/payments/{paymentId}/mark-paid
```

**Request Body:**
```json
{
  "paymentReference": "string",
  "paymentMethod": "cash | bank_transfer | payroll",
  "status": "paid",
  "paymentDate": "2024-01-15T00:00:00.000Z"
}
```

### 6. Cancelar Pago
```http
PUT /api/vacations/payments/{paymentId}/cancel
```

**Request Body:**
```json
{
  "status": "cancelled",
  "notes": "string"
}
```

---

## 🏢 Endpoints de Gestión Empresarial

### 7. Obtener Todos los Pagos Pendientes
```http
GET /api/vacations/payments/pending
```

**Query Parameters:**
- `department` (opcional): Filtrar por departamento
- `employeeId` (opcional): Filtrar por empleado específico

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "employeeId": "string",
      "employeeName": "Juan Pérez",
      "employeeDepartment": "Ventas",
      "vacationRequestId": "string",
      "paymentDate": "2024-01-15T00:00:00.000Z",
      "days": 12,
      "dailySalary": 500.00,
      "vacationAmount": 6000.00,
      "primaVacacional": 1500.00,
      "totalAmount": 7500.00,
      "status": "pending",
      "paymentMethod": "cash",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### 8. Generar Reporte de Pagos
```http
POST /api/vacations/payments/report
```

**Request Body:**
```json
{
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T00:00:00.000Z",
  "status": "paid | pending | cancelled | all",
  "format": "excel | pdf",
  "department": "string (opcional)"
}
```

**Response:** Archivo binario (Excel/PDF)

---

## 📋 Endpoints de Información y Configuración

### 9. Obtener Configuración de Prima Vacacional
```http
GET /api/vacations/payments/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "primaVacacionalPercentage": 25,
    "legalBasis": {
      "law": "Ley Federal del Trabajo",
      "article": "Artículo 80",
      "description": "Los trabajadores tendrán derecho a una prima no menor del veinticinco por ciento sobre los salarios que les correspondan durante el período de vacaciones."
    },
    "paymentMethods": [
      "cash",
      "bank_transfer",
      "payroll"
    ],
    "defaultPaymentMethod": "payroll"
  }
}
```

### 10. Actualizar Configuración de Pagos
```http
PUT /api/vacations/payments/config
```

**Request Body:**
```json
{
  "primaVacacionalPercentage": 25,
  "defaultPaymentMethod": "payroll",
  "paymentMethods": ["cash", "bank_transfer", "payroll"]
}
```

---

## 📊 Endpoints de Análisis y Estadísticas

### 11. Obtener Estadísticas de Pagos por Período
```http
GET /api/vacations/payments/statistics
```

**Query Parameters:**
- `startDate`: Fecha inicio
- `endDate`: Fecha fin
- `department` (opcional): Filtrar por departamento
- `groupBy` (opcional): `month | quarter | year`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z"
    },
    "summary": {
      "totalPayments": 45,
      "totalAmount": 337500.00,
      "averagePayment": 7500.00,
      "totalPrimaVacacional": 84375.00
    },
    "byStatus": {
      "paid": {
        "count": 40,
        "amount": 300000.00
      },
      "pending": {
        "count": 4,
        "amount": 30000.00
      },
      "cancelled": {
        "count": 1,
        "amount": 7500.00
      }
    },
    "byMethod": {
      "cash": {
        "count": 15,
        "amount": 112500.00
      },
      "bank_transfer": {
        "count": 20,
        "amount": 150000.00
      },
      "payroll": {
        "count": 10,
        "amount": 75000.00
      }
    },
    "monthlyBreakdown": [
      {
        "month": "2024-01",
        "paymentsCount": 8,
        "totalAmount": 60000.00,
        "primaVacacional": 15000.00
      }
    ]
  }
}
```

### 12. Obtener Proyección de Pagos Futuros
```http
GET /api/vacations/payments/projection
```

**Query Parameters:**
- `months`: Número de meses a proyectar (default: 6)

**Response:**
```json
{
  "success": true,
  "data": {
    "projectionPeriod": "6 meses",
    "estimatedPayments": [
      {
        "month": "2024-02",
        "estimatedCount": 12,
        "estimatedAmount": 90000.00,
        "estimatedPrimaVacacional": 22500.00
      }
    ],
    "totalProjected": {
      "count": 72,
      "amount": 540000.00,
      "primaVacacional": 135000.00
    }
  }
}
```

---

## 🔄 Endpoints de Integración

### 13. Sincronizar con Sistema de Nómina
```http
POST /api/vacations/payments/sync-payroll
```

**Request Body:**
```json
{
  "payrollPeriod": "2024-01",
  "paymentMethod": "payroll"
}
```

### 14. Exportar para Contabilidad
```http
GET /api/vacations/payments/accounting-export
```

**Query Parameters:**
- `startDate`: Fecha inicio
- `endDate`: Fecha fin
- `format`: `csv | xml | json`

**Response:** Archivo con formato contable

---

## 🛡️ Validaciones y Reglas de Negocio

### Validaciones de Entrada:
1. **employeeId**: Requerido, debe existir en sistema
2. **vacationDays**: Debe ser > 0 y ≤ días disponibles
3. **dailySalary**: Debe ser > 0
4. **paymentMethod**: Debe ser uno de los valores permitidos
5. **paymentReference**: Requerido para pagos marcados como realizados

### Reglas de Cálculo:
1. **Prima Vacacional**: Siempre 25% según LFT Artículo 80
2. **Salario de Vacaciones**: dailySalary × vacationDays
3. **Total**: Salario de Vacaciones + Prima Vacacional
4. **Días de Vacaciones**: Según antigüedad (LFT Artículo 76)

### Estados de Pago:
- **pending**: Pago calculado pero no realizado
- **paid**: Pago realizado y confirmado
- **cancelled**: Pago cancelado con motivo

---

## 📱 Componentes Frontend Implementados

### 1. VacationPaymentCalculator
- Cálculo automático de pagos
- Visualización de desglose
- Integración con solicitudes de vacaciones

### 2. VacationPaymentHistory
- Historial completo de pagos
- Gestión de estados
- Resumen financiero

### 3. VacationsPaymentsTab
- Gestión empresarial de pagos
- Reportes y estadísticas
- Control de pagos pendientes

---

## 🎯 Funcionalidades Principales

### ✅ Cálculo Automático
- Cálculo según Ley Federal del Trabajo
- Prima vacacional del 25%
- Desglose detallado de montos

### ✅ Control de Pagos
- Seguimiento de pagos realizados
- Gestión de pagos pendientes
- Control de adeudos

### ✅ Reportes y Análisis
- Reportes por período
- Estadísticas detalladas
- Proyecciones futuras

### ✅ Integración
- Sincronización con nómina
- Exportación contable
- Múltiples métodos de pago

### ✅ Cumplimiento Legal
- Base en LFT Artículo 80
- Documentación legal
- Configuración flexible

---

## 🚀 Beneficios del Sistema

1. **Automatización Completa**: Cálculo automático según LFT
2. **Control Total**: Seguimiento de todos los pagos
3. **Cumplimiento Legal**: Base en legislación mexicana
4. **Eficiencia**: Reducción de errores manuales
5. **Transparencia**: Visibilidad completa de pagos
6. **Integración**: Conecta con sistemas existentes
7. **Reportes**: Análisis detallado y proyecciones
8. **Flexibilidad**: Múltiples métodos de pago

---

## 📋 Próximos Pasos para Backend

1. **Implementar endpoints** según documentación
2. **Crear tablas** para pagos de vacaciones
3. **Validaciones** según reglas de negocio
4. **Integración** con sistema de empleados
5. **Reportes** con librerías de exportación
6. **Pruebas** exhaustivas de cálculos
7. **Documentación** de API para desarrolladores

¡El sistema está listo para implementación completa! 🎉
