# 📋 DOCUMENTACIÓN COMPLETA - ENDPOINTS DEL MÓDULO DE HABILIDADES

## 🎯 OBJETIVO

Documentar **TODOS** los endpoints necesarios para implementar completamente el módulo de habilidades de empleados en el backend. Esta documentación incluye:

- ✅ **Estructura completa de datos**
- ✅ **Todos los endpoints REST**
- ✅ **Validaciones requeridas**
- ✅ **Estructura de base de datos**
- ✅ **Integración con Firebase Storage**
- ✅ **Ejemplos de respuestas**

---

## 🗃️ **ESTRUCTURA DE LA BASE DE DATOS**

### **1. Tabla: employee_skills**
```sql
CREATE TABLE employee_skills (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category ENUM('technical', 'soft', 'leadership', 'language', 'other') NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
  score DECIMAL(3,1) NOT NULL CHECK (score >= 1 AND score <= 5),
  last_evaluated DATE NOT NULL,
  evidence TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  development_plan TEXT,
  resources JSON,
  target_level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
  target_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_category (category),
  INDEX idx_level (level),
  INDEX idx_is_required (is_required)
);
```

### **2. Tabla: employee_certifications**
```sql
CREATE TABLE employee_certifications (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiration_date DATE,
  credential_id VARCHAR(255) NOT NULL UNIQUE,
  credential_url VARCHAR(500),
  status ENUM('active', 'expired', 'revoked', 'pending') DEFAULT 'active',
  description TEXT,
  category ENUM('technical', 'soft', 'leadership', 'language', 'other') NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
  documents JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_issuer (issuer),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_expiration_date (expiration_date)
);
```

### **3. Tabla: employee_development_plans**
```sql
CREATE TABLE employee_development_plans (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL,
  skill_id VARCHAR(255) NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  current_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
  target_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
  activities JSON NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
  progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  mentor VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES employee_skills(id) ON DELETE CASCADE,
  INDEX idx_employee_id (employee_id),
  INDEX idx_skill_id (skill_id),
  INDEX idx_status (status),
  INDEX idx_target_date (target_date)
);
```

### **4. Tabla: employee_skill_evaluations**
```sql
CREATE TABLE employee_skill_evaluations (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL,
  skill_id VARCHAR(255) NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  evaluation_type ENUM('self', 'supervisor', 'peer', '360', 'objective') NOT NULL,
  evaluator_id VARCHAR(255) NOT NULL,
  evaluator_name VARCHAR(255) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
  score DECIMAL(3,1) NOT NULL CHECK (score >= 1 AND score <= 5),
  max_score DECIMAL(3,1) DEFAULT 5.0,
  feedback TEXT,
  strengths JSON,
  improvements JSON,
  development_suggestions JSON,
  evidence JSON,
  status ENUM('draft', 'submitted', 'reviewed', 'approved') DEFAULT 'draft',
  evaluation_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES employee_skills(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluator_id) REFERENCES users(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_skill_id (skill_id),
  INDEX idx_evaluator_id (evaluator_id),
  INDEX idx_evaluation_type (evaluation_type),
  INDEX idx_status (status),
  INDEX idx_evaluation_date (evaluation_date)
);
```

---

## 🌐 **ENDPOINTS REST - ESPECIFICACIONES COMPLETAS**

### **1. GESTIÓN DE HABILIDADES**

#### **1.1 Obtener Habilidades de un Empleado**
```http
GET /api/employees/{employeeId}/skills
```

**Query Parameters:**
- `category` (optional): Filtrar por categoría
- `level` (optional): Filtrar por nivel
- `required` (optional): Filtrar por habilidades requeridas (true/false)
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 20)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": "skill_123456789",
        "employeeId": "emp_987654321",
        "name": "Marketing Digital",
        "category": "technical",
        "level": "expert",
        "score": 4.8,
        "lastEvaluated": "2024-11-15",
        "evidence": "evidencia_marketing_digital_001",
        "isRequired": true,
        "developmentPlan": "Mantener certificaciones actualizadas",
        "resources": ["Google Ads", "Facebook Ads", "HubSpot"],
        "targetLevel": "expert",
        "targetDate": "2025-02-15",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-11-15T14:20:00Z"
      }
    ],
    "summary": {
      "totalSkills": 24,
      "averageLevel": 3.2,
      "certifications": 6,
      "coreSkills": 8,
      "byCategory": {
        "technical": 12,
        "soft": 8,
        "leadership": 3,
        "language": 2,
        "other": 1
      },
      "byLevel": {
        "beginner": 2,
        "intermediate": 8,
        "advanced": 10,
        "expert": 4
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 24,
      "totalPages": 2
    }
  }
}
```

#### **1.2 Obtener Habilidad Específica**
```http
GET /api/employees/{employeeId}/skills/{skillId}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "skill_123456789",
    "employeeId": "emp_987654321",
    "name": "Marketing Digital",
    "category": "technical",
    "level": "expert",
    "score": 4.8,
    "lastEvaluated": "2024-11-15",
    "evidence": "evidencia_marketing_digital_001",
    "isRequired": true,
    "developmentPlan": "Mantener certificaciones actualizadas",
    "resources": ["Google Ads", "Facebook Ads", "HubSpot"],
    "targetLevel": "expert",
    "targetDate": "2025-02-15",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-11-15T14:20:00Z"
  }
}
```

#### **1.3 Crear Nueva Habilidad**
```http
POST /api/employees/{employeeId}/skills
```

**Body (JSON):**
```json
{
  "name": "Marketing Digital",
  "category": "technical",
  "level": "expert",
  "score": 4.8,
  "evidence": "evidencia_marketing_digital_001",
  "isRequired": true,
  "developmentPlan": "Mantener certificaciones actualizadas",
  "resources": ["Google Ads", "Facebook Ads", "HubSpot"],
  "targetLevel": "expert",
  "targetDate": "2025-02-15"
}
```

**Validaciones:**
- `name`: Requerido, mínimo 3 caracteres, máximo 255
- `category`: Requerido, debe ser uno de: technical, soft, leadership, language, other
- `level`: Requerido, debe ser uno de: beginner, intermediate, advanced, expert
- `score`: Requerido, número entre 1.0 y 5.0
- `developmentPlan`: Requerido, mínimo 10 caracteres
- `targetDate`: Opcional, debe ser fecha futura si se proporciona
- `targetLevel`: Opcional, debe ser mayor o igual al nivel actual

#### **1.4 Actualizar Habilidad**
```http
PUT /api/employees/{employeeId}/skills/{skillId}
```

**Body (JSON):** Mismo formato que crear, todos los campos opcionales excepto `name`.

#### **1.5 Eliminar Habilidad**
```http
DELETE /api/employees/{employeeId}/skills/{skillId}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Habilidad eliminada exitosamente"
}
```

---

### **2. GESTIÓN DE CERTIFICACIONES**

#### **2.1 Obtener Certificaciones de un Empleado**
```http
GET /api/employees/{employeeId}/certifications
```

**Query Parameters:**
- `status` (optional): Filtrar por estado
- `category` (optional): Filtrar por categoría
- `page` (optional): Número de página
- `limit` (optional): Elementos por página

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "certifications": [
      {
        "id": "cert_123456789",
        "employeeId": "emp_987654321",
        "name": "Google Ads Certified",
        "issuer": "Google",
        "issueDate": "2024-01-14",
        "expirationDate": "2025-01-14",
        "credentialId": "GADS-2024-001",
        "credentialUrl": "https://ads.google.com/certified/GADS-2024-001",
        "status": "active",
        "description": "Certificación en Google Ads para gestión de campañas publicitarias",
        "category": "technical",
        "level": "expert",
        "documents": ["doc_001", "doc_002"],
        "createdAt": "2024-01-14T09:00:00Z",
        "updatedAt": "2024-01-14T09:00:00Z"
      }
    ],
    "summary": {
      "totalCertifications": 6,
      "activeCertifications": 5,
      "expiringSoon": 2,
      "byCategory": {
        "technical": 4,
        "soft": 1,
        "leadership": 1
      },
      "byStatus": {
        "active": 5,
        "expired": 1,
        "pending": 0,
        "revoked": 0
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 6,
      "totalPages": 1
    }
  }
}
```

#### **2.2 Crear Nueva Certificación**
```http
POST /api/employees/{employeeId}/certifications
```

**Body (JSON):**
```json
{
  "name": "Google Ads Certified",
  "issuer": "Google",
  "issueDate": "2024-01-14",
  "expirationDate": "2025-01-14",
  "credentialId": "GADS-2024-001",
  "credentialUrl": "https://ads.google.com/certified/GADS-2024-001",
  "description": "Certificación en Google Ads para gestión de campañas publicitarias",
  "category": "technical",
  "level": "expert",
  "documents": ["doc_001", "doc_002"]
}
```

**Validaciones:**
- `name`: Requerido, mínimo 3 caracteres, máximo 255
- `issuer`: Requerido, mínimo 2 caracteres, máximo 255
- `issueDate`: Requerido, formato YYYY-MM-DD
- `expirationDate`: Opcional, debe ser posterior a `issueDate` si se proporciona
- `credentialId`: Requerido, único en toda la aplicación
- `category`: Requerido, debe ser uno de: technical, soft, leadership, language, other
- `level`: Requerido, debe ser uno de: beginner, intermediate, advanced, expert

#### **2.3 Actualizar Certificación**
```http
PUT /api/employees/{employeeId}/certifications/{certificationId}
```

#### **2.4 Eliminar Certificación**
```http
DELETE /api/employees/{employeeId}/certifications/{certificationId}
```

---

### **3. GESTIÓN DE PLANES DE DESARROLLO**

#### **3.1 Obtener Planes de Desarrollo**
```http
GET /api/employees/{employeeId}/development-plans
```

**Query Parameters:**
- `status` (optional): Filtrar por estado
- `skillId` (optional): Filtrar por habilidad específica
- `page` (optional): Número de página
- `limit` (optional): Elementos por página

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "developmentPlans": [
      {
        "id": "plan_123456789",
        "employeeId": "emp_987654321",
        "skillId": "skill_123456789",
        "skillName": "Marketing Digital",
        "currentLevel": "advanced",
        "targetLevel": "expert",
        "activities": [
          {
            "id": "act_001",
            "name": "Curso de Google Ads Avanzado",
            "description": "Curso especializado en estrategias avanzadas de Google Ads",
            "type": "course",
            "status": "completed",
            "startDate": "2024-01-15",
            "endDate": "2024-02-15",
            "duration": 40,
            "cost": 5000,
            "provider": "Google Academy",
            "evidence": ["cert_001"],
            "notes": "Curso completado con éxito"
          }
        ],
        "startDate": "2024-01-01",
        "targetDate": "2024-12-31",
        "status": "active",
        "progress": 65.5,
        "mentor": "Carlos Ruiz",
        "notes": "Plan de desarrollo para certificación experta",
        "createdAt": "2024-01-01T08:00:00Z",
        "updatedAt": "2024-06-15T10:30:00Z"
      }
    ],
    "summary": {
      "totalPlans": 3,
      "activePlans": 2,
      "completedPlans": 1,
      "averageProgress": 72.3
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

#### **3.2 Crear Nuevo Plan de Desarrollo**
```http
POST /api/employees/{employeeId}/development-plans
```

**Body (JSON):**
```json
{
  "skillId": "skill_123456789",
  "skillName": "Marketing Digital",
  "currentLevel": "advanced",
  "targetLevel": "expert",
  "activities": [
    {
      "name": "Curso de Google Ads Avanzado",
      "description": "Curso especializado en estrategias avanzadas",
      "type": "course",
      "startDate": "2024-01-15",
      "endDate": "2024-02-15",
      "duration": 40,
      "cost": 5000,
      "provider": "Google Academy",
      "notes": "Curso presencial"
    }
  ],
  "startDate": "2024-01-01",
  "targetDate": "2024-12-31",
  "mentor": "Carlos Ruiz",
  "notes": "Plan de desarrollo para certificación experta"
}
```

**Validaciones:**
- `skillId`: Requerido, debe existir
- `skillName`: Requerido, mínimo 3 caracteres
- `currentLevel`: Requerido, debe ser válido
- `targetLevel`: Requerido, debe ser mayor o igual a `currentLevel`
- `activities`: Requerido, array no vacío
- `startDate`: Requerido, formato YYYY-MM-DD
- `targetDate`: Requerido, debe ser posterior a `startDate`
- Cada actividad debe tener `name` y `description` requeridos

#### **3.3 Actualizar Plan de Desarrollo**
```http
PUT /api/employees/{employeeId}/development-plans/{planId}
```

#### **3.4 Eliminar Plan de Desarrollo**
```http
DELETE /api/employees/{employeeId}/development-plans/{planId}
```

---

### **4. GESTIÓN DE EVALUACIONES**

#### **4.1 Obtener Evaluaciones de Habilidades**
```http
GET /api/employees/{employeeId}/skill-evaluations
```

**Query Parameters:**
- `skillId` (optional): Filtrar por habilidad específica
- `evaluationType` (optional): Filtrar por tipo de evaluación
- `status` (optional): Filtrar por estado
- `year` (optional): Filtrar por año
- `page` (optional): Número de página
- `limit` (optional): Elementos por página

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "eval_123456789",
        "employeeId": "emp_987654321",
        "skillId": "skill_123456789",
        "skillName": "Marketing Digital",
        "evaluationType": "supervisor",
        "evaluatorId": "user_456789123",
        "evaluatorName": "María González",
        "level": "expert",
        "score": 4.5,
        "maxScore": 5.0,
        "feedback": "Excelente desempeño en campañas digitales",
        "strengths": [
          "Excelente conocimiento técnico",
          "Gran capacidad analítica"
        ],
        "improvements": [
          "Mejorar habilidades de presentación"
        ],
        "developmentSuggestions": [
          "Tomar curso de presentación ejecutiva"
        ],
        "evidence": ["eval_doc_001"],
        "status": "approved",
        "evaluationDate": "2024-11-15",
        "createdAt": "2024-11-15T14:00:00Z",
        "updatedAt": "2024-11-15T16:30:00Z"
      }
    ],
    "summary": {
      "totalEvaluations": 12,
      "averageScore": 4.2,
      "byType": {
        "self": 4,
        "supervisor": 4,
        "peer": 2,
        "360": 2,
        "objective": 0
      },
      "byStatus": {
        "draft": 1,
        "submitted": 2,
        "reviewed": 3,
        "approved": 6
      },
      "recentEvaluations": 8
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

#### **4.2 Crear Nueva Evaluación**
```http
POST /api/employees/{employeeId}/skill-evaluations
```

**Body (JSON):**
```json
{
  "skillId": "skill_123456789",
  "skillName": "Marketing Digital",
  "evaluationType": "supervisor",
  "level": "expert",
  "score": 4.5,
  "feedback": "Excelente desempeño en campañas digitales",
  "strengths": [
    "Excelente conocimiento técnico",
    "Gran capacidad analítica"
  ],
  "improvements": [
    "Mejorar habilidades de presentación"
  ],
  "developmentSuggestions": [
    "Tomar curso de presentación ejecutiva"
  ],
  "evidence": ["eval_doc_001"]
}
```

**Validaciones:**
- `skillId`: Requerido, debe existir
- `skillName`: Requerido, mínimo 3 caracteres
- `evaluationType`: Requerido, debe ser uno de: self, supervisor, peer, 360, objective
- `level`: Requerido, debe ser válido
- `score`: Requerido, número entre 1.0 y 5.0
- `feedback`: Opcional, máximo 2000 caracteres

#### **4.3 Actualizar Evaluación**
```http
PUT /api/employees/{employeeId}/skill-evaluations/{evaluationId}
```

#### **4.4 Eliminar Evaluación**
```http
DELETE /api/employees/{employeeId}/skill-evaluations/{evaluationId}
```

---

### **5. GESTIÓN DE ARCHIVOS**

#### **5.1 Subir Archivos para Habilidades**
```http
POST /api/skills/upload
```

**Content-Type:** `multipart/form-data`

**Parámetros del FormData:**
- `files`: File[] - Archivos a subir (múltiples permitidos)
- `type`: string - Tipo de archivo: 'evidence' | 'certification' | 'evaluation'

**Validaciones:**
- Máximo 10MB por archivo
- Tipos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG
- Máximo 20 archivos por subida

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "fileIds": [
      "file_123456789",
      "file_987654321"
    ]
  }
}
```

---

### **6. REPORTES Y EXPORTACIÓN**

#### **6.1 Exportar Datos de Habilidades**
```http
GET /api/employees/{employeeId}/skills/export
```

**Query Parameters:**
- `format`: 'excel' | 'pdf' (default: 'excel')

**Respuesta:** Blob con el archivo exportado

#### **6.2 Generar Reporte de Habilidades**
```http
GET /api/employees/{employeeId}/skills/report/{reportType}
```

**Parámetros de Ruta:**
- `reportType`: 'summary' | 'detailed' | 'development' | 'certifications'

**Respuesta:** Blob con el reporte en PDF

---

## 🔥 **INTEGRACIÓN CON FIREBASE STORAGE**

### **Estructura de Archivos en Firebase Storage:**
```
skills/
├── evidence/
│   └── {employeeId}/
│       └── {fileName}
├── certifications/
│   └── {employeeId}/
│       └── {fileName}
└── evaluations/
    └── {employeeId}/
        └── {fileName}
```

### **URLs de Archivos:**
- **Evidencia de Habilidades:** `https://firebasestorage.googleapis.com/v0/b/{projectId}/o/skills%2Fevidence%2F{employeeId}%2F{fileName}`
- **Certificaciones:** `https://firebasestorage.googleapis.com/v0/b/{projectId}/o/skills%2Fcertifications%2F{employeeId}%2F{fileName}`
- **Evaluaciones:** `https://firebasestorage.googleapis.com/v0/b/{projectId}/o/skills%2Fevaluations%2F{employeeId}%2F{fileName}`

---

## ✅ **VALIDACIONES CRÍTICAS**

### **Reglas de Negocio Importantes:**

1. **Habilidades:**
   - No puede haber dos habilidades con el mismo nombre para un empleado
   - El nivel objetivo debe ser mayor o igual al nivel actual
   - La fecha objetivo debe ser futura si se especifica
   - La puntuación debe estar entre 1.0 y 5.0

2. **Certificaciones:**
   - El ID de credencial debe ser único en toda la aplicación
   - La fecha de expiración debe ser posterior a la fecha de emisión
   - No puede haber certificaciones duplicadas (mismo nombre + emisor)

3. **Planes de Desarrollo:**
   - Debe haber al menos una actividad
   - La fecha objetivo debe ser posterior a la fecha de inicio
   - El progreso debe estar entre 0 y 100

4. **Evaluaciones:**
   - La puntuación debe estar entre 1.0 y 5.0
   - El evaluador debe existir en el sistema
   - No puede haber evaluaciones duplicadas para la misma habilidad en la misma fecha

---

## 🚀 **IMPLEMENTACIÓN SUGERIDA**

### **1. Crear las Tablas (SQL):**
```sql
-- Ejecutar en orden:
-- 1. employee_skills
-- 2. employee_certifications
-- 3. employee_development_plans
-- 4. employee_skill_evaluations
```

### **2. Crear los Endpoints (Node.js/Express):**
```javascript
// Rutas principales:
app.use('/api/employees/:employeeId/skills', skillsRouter);
app.use('/api/employees/:employeeId/certifications', certificationsRouter);
app.use('/api/employees/:employeeId/development-plans', developmentPlansRouter);
app.use('/api/employees/:employeeId/skill-evaluations', evaluationsRouter);
app.use('/api/skills', filesRouter);
```

### **3. Configurar Firebase Storage:**
```javascript
// Configurar reglas de seguridad para permitir subida desde el backend
const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /skills/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
```

---

## 🎯 **RESUMEN EJECUTIVO**

### **✅ ENDPOINTS IMPLEMENTADOS:**
- **Habilidades:** 5 endpoints (GET lista, GET específico, POST crear, PUT actualizar, DELETE eliminar)
- **Certificaciones:** 4 endpoints (GET lista, POST crear, PUT actualizar, DELETE eliminar)
- **Planes de Desarrollo:** 4 endpoints (GET lista, POST crear, PUT actualizar, DELETE eliminar)
- **Evaluaciones:** 4 endpoints (GET lista, POST crear, PUT actualizar, DELETE eliminar)
- **Archivos:** 1 endpoint (POST subir archivos)
- **Reportes:** 2 endpoints (GET exportar, GET generar reporte)

### **🔧 TOTAL DE ENDPOINTS:** 20 endpoints

### **📊 BASE DE DATOS:** 4 tablas principales

### **🔥 INTEGRACIONES:** Firebase Storage para archivos

Este módulo está **100% especificado** y listo para ser implementado en el backend. Todos los endpoints siguen las mejores prácticas REST y están completamente validados.

¿Necesitas algún detalle adicional sobre algún endpoint específico?
