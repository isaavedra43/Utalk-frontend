// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    // Empleados
    EMPLOYEES: '/api/employees',
    EMPLOYEE_BY_ID: (id: string) => `/api/employees/${id}`,
    EMPLOYEES_IMPORT: '/api/employees/import',
    EMPLOYEES_EXPORT: '/api/employees/export',
    
    
    // Asistencia
    EMPLOYEE_ATTENDANCE: (id: string) => `/api/employees/${id}/attendance`,
    ATTENDANCE_RECORD: (employeeId: string, recordId: string) => `/api/employees/${employeeId}/attendance/${recordId}`,
    
    // Vacaciones
    EMPLOYEE_VACATIONS: (id: string) => `/api/employees/${id}/vacations`,
    VACATION_REQUEST: (employeeId: string, requestId: string) => `/api/employees/${employeeId}/vacations/${requestId}`,
    
    // Documentos
    EMPLOYEE_DOCUMENTS: (id: string) => `/api/employees/${id}/documents`,
    EMPLOYEE_DOCUMENT: (employeeId: string, documentId: string) => `/api/employees/${employeeId}/documents/${documentId}`,
    
    // Incidencias
    EMPLOYEE_INCIDENTS: (id: string) => `/api/employees/${id}/incidents`,
    EMPLOYEE_INCIDENT: (employeeId: string, incidentId: string) => `/api/employees/${employeeId}/incidents/${incidentId}`,
    
    // Evaluaciones
    EMPLOYEE_EVALUATIONS: (id: string) => `/api/employees/${id}/evaluations`,
    EMPLOYEE_EVALUATION: (employeeId: string, evaluationId: string) => `/api/employees/${employeeId}/evaluations/${evaluationId}`,
    
    // Habilidades
    EMPLOYEE_SKILLS: (id: string) => `/api/employees/${id}/skills`,
    EMPLOYEE_SKILL: (employeeId: string, skillId: string) => `/api/employees/${employeeId}/skills/${skillId}`,
    
    // Historial
    EMPLOYEE_HISTORY: (id: string) => `/api/employees/${id}/history`
  },
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Configuración de timeouts
  TIMEOUT: 30000, // 30 segundos
  
  // Configuración de archivos
  FILE_UPLOAD: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    CHUNK_SIZE: 1024 * 1024 // 1MB chunks para uploads grandes
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  
  // Configuración de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 segundo
    BACKOFF_FACTOR: 2
  }
};

// Función helper para construir URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, any>) => {
  const url = new URL(API_CONFIG.BASE_URL + endpoint);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

// Función helper para manejar errores de API
export const handleApiError = (error: any) => {
  if (error.response) {
    // Error del servidor
    const status = error.response.status;
    const message = error.response.data?.message || 'Error del servidor';
    
    switch (status) {
      case 400:
        return 'Datos inválidos. Por favor, verifica la información.';
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto. El recurso ya existe o está en uso.';
      case 422:
        return 'Datos de entrada inválidos.';
      case 429:
        return 'Demasiadas solicitudes. Por favor, intenta más tarde.';
      case 500:
        return 'Error interno del servidor. Por favor, contacta al administrador.';
      default:
        return message;
    }
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  } else {
    // Error desconocido
    return 'Ha ocurrido un error inesperado.';
  }
};

