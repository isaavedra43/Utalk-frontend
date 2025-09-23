// Servicio de empleados - COMPLETAMENTE ALINEADO CON BACKEND

import api from './api';
import {
  Employee,
  EmployeeListResponse,
  EmployeeDetailResponse,
  EmployeeSearchResponse,
  EmployeeStatsResponse,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
  PayrollResponse,
  PayrollData,
  AttendanceResponse,
  VacationResponse,
  VacationBalanceResponse,
  VacationRequestData,
  DocumentResponse,
  DocumentMetadata,
  OrgChartResponse,
  DeleteResponse,
  ClockResponse,
  APIResponse
} from '../types/employee';

class EmployeeService {
  private baseEndpoint = '/api/employees';
  private cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
  private readonly CACHE_DURATION = 30000; // 30 segundos

  // ===== MÉTODOS PRINCIPALES =====

  /**
   * Listar empleados con filtros y paginación - OPTIMIZADO CON CACHE
   */
  async listEmployees(filters: EmployeeFilters = {}): Promise<EmployeeListResponse> {
    const cacheKey = this.generateCacheKey('listEmployees', filters);
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🎯 Cache hit para listEmployees:', cacheKey);
      return cached.data;
    }

    // Si hay una petición en curso, esperar a que termine
    if (cached?.promise) {
      console.log('⏳ Esperando petición en curso para listEmployees');
      return await cached.promise;
    }

    // Realizar petición
    const promise = this.performListEmployeesRequest(filters);
    this.cache.set(cacheKey, { data: null, timestamp: Date.now(), promise });
    
    try {
      const result = await promise;
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      this.cleanOldCache();
      return result;
    } catch (error) {
      this.cache.delete(cacheKey);
      throw error;
    }
  }

  private async performListEmployeesRequest(filters: EmployeeFilters): Promise<EmployeeListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.level) params.append('level', filters.level);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
    
    console.log('🌐 Realizando petición real a API de empleados:', filters);
    const response = await api.get(endpoint);
    return response.data;
  }

  /**
   * Buscar empleados
   */
  async searchEmployees(query: string, limit: number = 10): Promise<EmployeeSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    const response = await api.get(`${this.baseEndpoint}/search?${params}`);
    return response.data;
  }

  /**
   * Obtener empleado específico con datos relacionados
   */
  async getEmployee(id: string): Promise<EmployeeDetailResponse> {
    const response = await api.get(`${this.baseEndpoint}/${id}`);
    return response.data;
  }

  /**
   * Crear nuevo empleado
   */
  async createEmployee(employeeData: CreateEmployeeData): Promise<APIResponse<{ employee: Employee }>> {
    const response = await api.post(this.baseEndpoint, employeeData);
    return response.data;
  }

  /**
   * Actualizar empleado existente
   */
  async updateEmployee(id: string, updateData: UpdateEmployeeData): Promise<APIResponse<{ employee: Employee }>> {
    const response = await api.put(`${this.baseEndpoint}/${id}`, updateData);
    return response.data;
  }

  /**
   * Eliminar empleado (soft delete)
   */
  async deleteEmployee(id: string): Promise<DeleteResponse> {
    const response = await api.delete(`${this.baseEndpoint}/${id}`);
    return response.data;
  }

  // ===== MÉTODOS DE ESTADÍSTICAS =====

  /**
   * Obtener estadísticas generales de empleados
   */
  async getStats(): Promise<EmployeeStatsResponse> {
    const response = await api.get(`${this.baseEndpoint}/stats`);
    return response.data;
  }

  /**
   * Obtener organigrama
   */
  async getOrgChart(department?: string): Promise<OrgChartResponse> {
    const params = department ? `?department=${encodeURIComponent(department)}` : '';
    const response = await api.get(`${this.baseEndpoint}/org-chart${params}`);
    return response.data;
  }

  // ===== MÉTODOS DE NÓMINA =====

  /**
   * Obtener nómina del empleado
   */
  async getPayroll(employeeId: string): Promise<PayrollResponse> {
    const response = await api.get(`${this.baseEndpoint}/${employeeId}/payroll`);
    return response.data;
  }

  /**
   * Crear período de nómina
   */
  async createPayrollPeriod(employeeId: string, payrollData: PayrollData): Promise<APIResponse> {
    const response = await api.post(`${this.baseEndpoint}/${employeeId}/payroll`, payrollData);
    return response.data;
  }

  // ===== MÉTODOS DE ASISTENCIA =====

  /**
   * Obtener asistencia del empleado
   */
  async getAttendance(employeeId: string): Promise<AttendanceResponse> {
    const response = await api.get(`${this.baseEndpoint}/${employeeId}/attendance`);
    return response.data;
  }

  /**
   * Registrar entrada (clock in)
   */
  async clockIn(employeeId: string): Promise<ClockResponse> {
    const response = await api.post(`${this.baseEndpoint}/${employeeId}/attendance/clock-in`);
    return response.data;
  }

  /**
   * Registrar salida (clock out)
   */
  async clockOut(employeeId: string): Promise<ClockResponse> {
    const response = await api.post(`${this.baseEndpoint}/${employeeId}/attendance/clock-out`);
    return response.data;
  }

  // ===== MÉTODOS DE VACACIONES =====

  /**
   * Obtener vacaciones del empleado
   */
  async getVacations(employeeId: string): Promise<VacationResponse> {
    const response = await api.get(`${this.baseEndpoint}/${employeeId}/vacations`);
    return response.data;
  }

  /**
   * Solicitar vacaciones
   */
  async requestVacation(employeeId: string, vacationData: VacationRequestData): Promise<APIResponse> {
    const response = await api.post(`${this.baseEndpoint}/${employeeId}/vacations`, vacationData);
    return response.data;
  }

  /**
   * Obtener balance de vacaciones
   */
  async getVacationBalance(employeeId: string): Promise<VacationBalanceResponse> {
    const response = await api.get(`${this.baseEndpoint}/${employeeId}/vacations/balance`);
    return response.data;
  }

  /**
   * Aprobar/rechazar solicitud de vacaciones
   */
  async updateVacationStatus(employeeId: string, vacationId: string, status: 'approved' | 'rejected', reason?: string): Promise<APIResponse> {
    const response = await api.put(`${this.baseEndpoint}/${employeeId}/vacations/${vacationId}`, {
      status,
      reason
    });
    return response.data;
  }

  // ===== MÉTODOS DE DOCUMENTOS =====

  /**
   * Obtener documentos del empleado
   */
  async getDocuments(employeeId: string): Promise<DocumentResponse> {
    const response = await api.get(`${this.baseEndpoint}/${employeeId}/documents`);
    return response.data;
  }

  /**
   * Subir documento
   */
  async uploadDocument(employeeId: string, file: File, metadata: DocumentMetadata): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Agregar metadatos
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post(`${this.baseEndpoint}/${employeeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(employeeId: string, documentId: string): Promise<APIResponse> {
    const response = await api.delete(`${this.baseEndpoint}/${employeeId}/documents/${documentId}`);
    return response.data;
  }

  /**
   * Descargar documento
   */
  async downloadDocument(employeeId: string, documentId: string): Promise<Blob> {
    const response = await api.get(`${this.baseEndpoint}/${employeeId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Validar permisos HR para una acción específica
   */
  validateHRPermission(action: 'create' | 'read' | 'update' | 'delete' | 'viewPayroll' | 'viewAttendance' | 'viewDocuments' | 'approveVacations', userRole?: string): boolean {
    // Implementar lógica de validación de permisos según el rol
    const userTokenData = this.getUserTokenData();
    
    if (!userTokenData || !userTokenData.hrRole) {
      return false;
    }

    const { hrRole, role } = userTokenData;

    // HR_ADMIN tiene acceso completo
    if (hrRole === 'HR_ADMIN') {
      return true;
    }

    // HR_MANAGER tiene acceso limitado
    if (hrRole === 'HR_MANAGER') {
      const restrictedActions = ['delete'];
      return !restrictedActions.includes(action);
    }

    // HR_USER tiene acceso básico
    if (hrRole === 'HR_USER') {
      const allowedActions = ['read', 'viewAttendance'];
      return allowedActions.includes(action);
    }

    // EMPLOYEE solo puede ver sus propios datos
    if (role === 'EMPLOYEE') {
      const allowedActions = ['read'];
      return allowedActions.includes(action);
    }

    return false;
  }

  /**
   * Obtener datos del token del usuario actual
   */
  private getUserTokenData(): any {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      // Decodificar JWT (simplificado - en producción usar una librería)
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Manejar errores de API de manera consistente
   */
  private handleAPIError(error: any): never {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data?.error || 'Datos inválidos');
        case 401:
          throw new Error('Usuario no autenticado');
        case 403:
          throw new Error(data?.error || 'Acceso denegado');
        case 404:
          throw new Error(data?.error || 'Empleado no encontrado');
        case 500:
          throw new Error('Error interno del servidor');
        default:
          throw new Error(data?.error || 'Error desconocido');
      }
    } else if (error.request) {
      throw new Error('Error de conexión con el servidor');
    } else {
      throw new Error(error.message || 'Error desconocido');
    }
  }

  // ===== MÉTODOS DE COMPATIBILIDAD CON COMPONENTES EXISTENTES =====

  /**
   * Listar miembros del equipo (compatibilidad con componentes existentes)
   */
  async listTeamMembers(filters: any = {}): Promise<any> {
    // Convertir filtros del formato antiguo al nuevo
    const employeeFilters: EmployeeFilters = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      search: filters.search,
      department: filters.department,
      status: filters.status === 'all' ? undefined : filters.status
    };

    const response = await this.listEmployees(employeeFilters);
    
    // Convertir respuesta al formato esperado por los componentes existentes
    return {
      data: {
        agents: response.data.employees.map((employee: Employee) => ({
          ...employee,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          email: employee.personalInfo.email,
          role: employee.position.title,
          isActive: employee.status === 'active'
        })),
        pagination: response.data.pagination,
        summary: {
          total: response.data.summary.total,
          active: response.data.summary.active,
          inactive: response.data.summary.inactive
        }
      },
      success: response.success
    };
  }

  /**
   * Crear agente (compatibilidad con componentes existentes)
   */
  async createAgent(agentData: any): Promise<any> {
    // Convertir datos del formato antiguo al nuevo
    const employeeData: CreateEmployeeData = {
      personalInfo: {
        firstName: agentData.name.split(' ')[0] || agentData.name,
        lastName: agentData.name.split(' ').slice(1).join(' ') || '',
        email: agentData.email,
        phone: agentData.phone || '',
        dateOfBirth: '1990-01-01', // Valor por defecto
        gender: 'M', // Valor por defecto
        maritalStatus: 'soltero', // Valor por defecto
        nationality: 'Mexicana', // Valor por defecto
        rfc: '', // Se debe llenar
        curp: '', // Se debe llenar
        address: {
          street: '',
          city: 'Ciudad de México',
          state: 'CDMX',
          country: 'México',
          postalCode: '01000'
        }
      },
      position: {
        title: agentData.role || 'Agente',
        department: 'Atención al Cliente',
        level: 'Junior',
        jobDescription: 'Atención al cliente y soporte',
        startDate: new Date().toISOString().split('T')[0]
      },
      location: {
        office: 'Oficina Central',
        address: 'Av. Reforma 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        postalCode: '06600',
        timezone: 'America/Mexico_City'
      },
      contract: {
        type: 'permanent',
        startDate: new Date().toISOString().split('T')[0],
        salary: 25000,
        currency: 'MXN',
        workingDays: 'Lunes a Viernes',
        workingHoursRange: '09:00-18:00',
        benefits: ['seguro médico']
      }
    };

    return this.createEmployee(employeeData);
  }

  /**
   * Actualizar agente (compatibilidad con componentes existentes)
   */
  async updateAgent(id: string, agentData: any): Promise<any> {
    const updateData: UpdateEmployeeData = {
      personalInfo: {
        firstName: agentData.name?.split(' ')[0],
        lastName: agentData.name?.split(' ').slice(1).join(' '),
        email: agentData.email,
        phone: agentData.phone
      },
      position: {
        title: agentData.role
      },
      status: agentData.isActive ? 'active' : 'inactive'
    };

    return this.updateEmployee(id, updateData);
  }
}

// Crear instancia singleton del servicio
const employeeService = new EmployeeService();

export default employeeService;
export { EmployeeService };
