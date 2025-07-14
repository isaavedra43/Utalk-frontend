# 🚀 **UNIK AI - Sistema Omnicanal Fullstack Enterprise**

## **📋 Descripción**

Sistema de mensajería empresarial omnicanal **100% funcional** con backend Node.js/Express y frontend React/Vite. Soporte para WhatsApp (Twilio), Facebook Messenger, Email y Webchat en tiempo real con **arquitectura enterprise**.

## **⚡ Deploy en Railway (1-Click Ready)**

### **🔧 Variables de Entorno Requeridas**

**Core Backend:**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-dominio.railway.app

# JWT Secrets (GENERAR PROPIOS)
JWT_SECRET=tu-super-secret-jwt-key-de-produccion-muy-largo-y-seguro-32-chars-min
JWT_REFRESH_SECRET=tu-super-secret-refresh-key-de-produccion-muy-largo-y-seguro-32-chars-min
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Firebase (Requerido):**
```env
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_COMPLETA\n-----END PRIVATE KEY-----\n"
```

**Twilio WhatsApp:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_twilio_auth_token_real
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_SECRET=tu_webhook_secret_de_twilio
```

**Base de Datos:**
```env
DATABASE_URL=mongodb://tu-mongo-connection-string
MONGODB_URI=mongodb://tu-mongo-connection-string
```

**Seguridad Enterprise:**
```env
BCRYPT_ROUNDS=12
SESSION_SECRET=tu-session-secret-de-produccion-32-chars-min
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
API_RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=10
```

### **📦 Deploy Automático**

Railway detecta automáticamente:
- ✅ **Build**: `npm run build` (frontend React → `/dist`)
- ✅ **Start**: `npm start` (Express serve frontend + APIs)
- ✅ **Validación**: Build validation automática
- ✅ **Health Check**: `/health` endpoint completo

```bash
git push origin main
# Railway auto-deploy ✨
```

### **🔍 Verificación Post-Deploy**

```bash
# Health check completo
curl https://tu-app.railway.app/health

# Frontend SPA
curl https://tu-app.railway.app/

# API Backend  
curl https://tu-app.railway.app/api/health

# Test SPA routing
curl https://tu-app.railway.app/dashboard
```

---

## **🛠️ Desarrollo Local**

### **Configuración Inicial**
```bash
# 1. Clonar proyecto
git clone <tu-repo>
cd Utalk-frontend

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
# Editar .env con credenciales de desarrollo

# 4. Build inicial
npm run build

# 5. Validar instalación
npm run health-check
```

### **Scripts Enterprise**
```bash
# 🔥 DESARROLLO
npm run dev              # Frontend + Backend concurrente
npm run dev:backend      # Solo backend (port 3000)
npm run dev:frontend     # Solo frontend (port 5173)

# 🏗️ BUILD & DEPLOY
npm run build           # Build completo con validación
npm run build:validate  # Validar integridad de build
npm run preview         # Test build localmente

# 🧪 TESTING & QUALITY
npm run test            # Test suite completa
npm run test:e2e        # Tests end-to-end
npm run test:coverage   # Coverage report
npm run lint            # Linting estricto
npm run security:audit  # Audit de seguridad

# 📋 MONITORING & HEALTH
npm run health-check    # Health check completo
npm run validate:env    # Validar variables de entorno
npm run logs            # Ver logs en tiempo real
npm run monitor         # Performance monitoring

# 🧹 MAINTENANCE
npm run clean           # Limpiar builds y cache
npm run clean:all       # Reset completo
```

---

## **🏗️ Arquitectura Enterprise**

### **Flujo de Requests Optimizado**
```
Railway Domain → Express Server
                      ↓
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
Static Files      /api/*           SPA Routes
(gzip, cache)   (rate limited)    (React Router)
    ↓                 ↓                 ↓
express.static   API Endpoints    index.html
(optimizado)    (CORS enabled)   (fallback SPA)
```

### **Build Process Robusto**
```
npm run build
    ↓
prebuild: rimraf dist (limpieza)
    ↓  
vite build: client/ → dist/ (React optimizado)
    ↓
build:validate: validar integridad
    ↓
🎯 Deploy Ready
```

### **Seguridad Multicapa**
- ✅ **CORS** configurado específicamente para APIs
- ✅ **Rate Limiting** diferenciado (general, API, auth)
- ✅ **Helmet** security headers
- ✅ **Upload Validation** con magic bytes
- ✅ **JWT** con refresh tokens
- ✅ **Error Handling** sin información sensible

---

## **🚀 Funcionalidades Enterprise**

### **Backend Robusto**
- ✅ **APIs REST** completas con validación
- ✅ **Autenticación JWT** con refresh automático
- ✅ **WhatsApp Integration** (Twilio)
- ✅ **Rate Limiting** inteligente 
- ✅ **Upload Security** (magic bytes + MIME validation)
- ✅ **Graceful Shutdown** handling
- ✅ **Logging Estructurado** con rotación
- ✅ **Health Checks** multi-nivel
- ✅ **Error Boundaries** robustos

### **Frontend Optimizado**
- ✅ **React + TypeScript** con Vite
- ✅ **SPA Routing** perfecto (no 404s)
- ✅ **Estado Global** con React Query
- ✅ **UI Enterprise** con shadcn/ui
- ✅ **Real-time** polling inteligente
- ✅ **Error Handling** user-friendly
- ✅ **Performance** optimizado (code splitting)
- ✅ **No Console.log** en producción

### **Integración Fullstack**
- ✅ **Monorepo** real con build unificado
- ✅ **Express Static** serving optimizado
- ✅ **SPA Fallback** universal (todos los métodos HTTP)
- ✅ **API Routing** con 404 correcto
- ✅ **CORS** solo donde se necesita
- ✅ **Gzip Compression** automática
- ✅ **Cache Headers** inteligentes
- ✅ **Frontend Cache** con TTL

---

## **🔧 Scripts de Utilidad Enterprise**

### **Validación de Build**
```bash
npm run build:validate
# Valida:
# - Existencia de archivos críticos
# - Tamaños mínimos
# - Estructura correcta
# - Referencias hardcoded
```

### **Health Check Completo**
```bash
npm run health-check
# Verifica:
# - Backend health endpoint
# - API endpoints funcionando
# - Frontend serving correctamente  
# - SPA routing funcionando
# - Manejo correcto de 404s
# - Archivos locales presentes
```

### **Limpieza de Logs**
```bash
node scripts/cleanLogs.js
# Automáticamente:
# - Reemplaza console.log con logging condicional
# - Solo logs en desarrollo
# - Producción limpia
```

---

## **⚙️ Configuración Avanzada**

### **Rate Limiting Personalizado**
```env
# General (frontend + assets)
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# APIs específicas
API_RATE_LIMIT_MAX_REQUESTS=100
API_RATE_LIMIT_WINDOW_MS=900000

# Autenticación (más restrictivo)
AUTH_RATE_LIMIT_MAX_REQUESTS=10
AUTH_RATE_LIMIT_WINDOW_MS=900000
```

### **Upload Security**
```env
MAX_FILE_SIZE=10485760          # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,txt,csv
UPLOAD_DESTINATION=./uploads
TEMP_DIRECTORY=./temp
```

### **Logging Enterprise**
```env
LOG_LEVEL=info                  # debug|info|warn|error
LOG_TO_FILE=true
LOG_DIRECTORY=./logs
```

---

## **🚨 Monitoring & Alertas**

### **Health Endpoints**
```bash
GET /health              # Health check completo
GET /api/health          # Solo backend API
```

**Response Example:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "used": 45,
    "total": 128,
    "external": 12
  },
  "services": {
    "backend": "running",
    "frontend": "available",
    "database": "connected",
    "cache": "ok"
  }
}
```

### **Error Monitoring**
- ✅ **Structured Logging** con Winston
- ✅ **Error Boundaries** en React
- ✅ **API Error Handling** consistente
- ✅ **No Stack Traces** en producción
- ✅ **Request Tracing** con IDs únicos

---

## **🔍 Troubleshooting Enterprise**

### **Frontend No Carga**
```bash
# 1. Verificar build
npm run build:validate
ls -la dist/

# 2. Verificar servidor
curl http://localhost:3000/health

# 3. Verificar variables
npm run validate:env
```

### **APIs Fallan**
```bash
# 1. Health check específico
curl http://localhost:3000/api/health

# 2. Verificar CORS
curl -H "Origin: https://tu-dominio.com" \
     http://localhost:3000/api/health

# 3. Verificar rate limiting
curl -v http://localhost:3000/api/health
```

### **CORS Issues**
```bash
# Verificar configuración
echo $CORS_ORIGIN

# Test desde navegador
fetch('/api/health').then(r => r.json()).then(console.log)
```

### **Performance Issues**
```bash
# Monitoring con clinic
npm run monitor

# Memory profiling
npm run flame

# Load testing
npm run load-test
```

---

## **📊 Metrics & KPIs**

### **Performance Targets**
- ⚡ **Frontend Load**: < 2s
- ⚡ **API Response**: < 200ms  
- ⚡ **Build Time**: < 60s
- ⚡ **Memory Usage**: < 256MB
- ⚡ **CPU Usage**: < 80%

### **Reliability Targets**
- 🎯 **Uptime**: 99.9%
- 🎯 **Error Rate**: < 0.1%
- 🎯 **Build Success**: 99%
- 🎯 **Health Check**: 100%

---

## **🎯 Enterprise Checklist**

### **✅ Funcionalidad**
- [x] Frontend React funcional
- [x] Backend APIs completas
- [x] Autenticación JWT
- [x] Upload de archivos seguro
- [x] WhatsApp integration
- [x] Real-time messaging
- [x] Error handling robusto

### **✅ Seguridad**
- [x] CORS configurado correctamente
- [x] Rate limiting implementado
- [x] Input validation completa
- [x] File validation con magic bytes
- [x] No console.log en producción
- [x] Error messages seguros
- [x] Helmet security headers

### **✅ Performance**
- [x] Gzip compression
- [x] Static file caching
- [x] Code splitting
- [x] Asset optimization
- [x] Database indexing
- [x] Memory management

### **✅ Observabilidad**
- [x] Health checks multi-nivel
- [x] Structured logging
- [x] Error tracking
- [x] Performance monitoring
- [x] Request tracing
- [x] Metrics collection

### **✅ Deployment**
- [x] Railway one-click deploy
- [x] Build validation automática
- [x] Environment validation
- [x] Zero-downtime deployment
- [x] Rollback capability
- [x] Health check verification

---

## **🎉 LISTO PARA ENTERPRISE**

**Sistema completamente funcional con:**

- 🏢 **Enterprise Architecture** escalable y robusta
- 🔒 **Security** multi-capa con best practices
- ⚡ **Performance** optimizado para producción
- 📊 **Monitoring** completo con health checks
- 🚀 **Deploy** automatizado en Railway
- 📖 **Documentation** completa y detallada

**🎯 DEPLOY READY - Zero configuration, máxima funcionalidad** 