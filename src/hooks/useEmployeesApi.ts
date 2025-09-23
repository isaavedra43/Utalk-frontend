import { useState, useEffect, useCallback } from 'react';
import { employeesApi, type Employee, type GetEmployeesResponse } from '../services/employeesApi';

// Hook para gestión de empleados
export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    expired: 0
  });

  const loadEmployees = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Hook useEmployees - Cargando empleados...', params);

      const response = await employeesApi.getEmployees({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        search: params.search,
        department: params.department,
        status: params.status,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      });

      // Manejar respuesta vacía correctamente
      if (response && response.employees) {
        console.log('✅ Hook useEmployees - Empleados encontrados:', response.employees.length);
        setEmployees(response.employees);
        setPagination(response.pagination);
        setSummary(response.summary);
      } else {
        console.log('⚠️ Hook useEmployees - No hay empleados en la respuesta');
        // Si no hay respuesta o employees es null/undefined, establecer arrays vacíos
        setEmployees([]);
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        });
        setSummary({
          total: 0,
          active: 0,
          inactive: 0,
          pending: 0,
          expired: 0
        });
      }
    } catch (err) {
      console.error('❌ Hook useEmployees - Error loading employees:', err);
      setError('Error al cargar los empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const createEmployee = async (employeeData: Partial<Employee>) => {
    try {
      const response = await employeesApi.createEmployee(employeeData);
      await loadEmployees(); // Recargar la lista
      return response;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await employeesApi.updateEmployee(id, updates);
      await loadEmployees(); // Recargar la lista
      return response;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const response = await employeesApi.deleteEmployee(id);
      await loadEmployees(); // Recargar la lista
      return response;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  };

  const importEmployees = async (file: File, options: {
    updateExisting: boolean;
    skipErrors: boolean;
    validateData: boolean;
  }) => {
    try {
      const response = await employeesApi.importEmployees(file, options);
      await loadEmployees(); // Recargar la lista
      return response;
    } catch (error) {
      console.error('Error importing employees:', error);
      throw error;
    }
  };

  const exportEmployees = async (params: {
    format: 'xlsx' | 'csv' | 'pdf';
    filters?: Record<string, any>;
    fields?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Iniciando exportación de empleados...', params);
      
      const result = await employeesApi.exportEmployees(params);
      
      console.log('✅ Exportación completada exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error exporting employees:', error);
      setError('Error al exportar empleados. Por favor, intenta de nuevo.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    pagination,
    summary,
    loadEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    exportEmployees,
    setPagination
  };
};

// Hook para datos específicos de un empleado
export const useEmployeeDetails = (employeeId: string) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [relatedData, setRelatedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployeeDetails = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployee(employeeId);
      setEmployee(response.employee);
      setRelatedData(response.relatedData);
    } catch (err) {
      console.error('Error loading employee details:', err);
      setError('Error al cargar los detalles del empleado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeDetails();
  }, [employeeId]);

  return {
    employee,
    relatedData,
    loading,
    error,
    reload: loadEmployeeDetails
  };
};

// Hook para nómina de empleado
export const useEmployeePayroll = (employeeId: string) => {
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayrollData = async (params: {
    year?: number;
    month?: number;
    week?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeePayroll(employeeId, params);
      setPayrollData(response);
    } catch (err) {
      console.error('Error loading payroll data:', err);
      setError('Error al cargar los datos de nómina.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadPayrollData({ year: new Date().getFullYear() });
    }
  }, [employeeId]);

  return {
    payrollData,
    loading,
    error,
    loadPayrollData
  };
};

// Hook para asistencia de empleado
export const useEmployeeAttendance = (employeeId: string) => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttendanceData = async (params: {
    startDate: string;
    endDate: string;
    includeWeekends?: boolean;
    includeHolidays?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeAttendance(employeeId, params);
      setAttendanceData(response);
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError('Error al cargar los datos de asistencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      loadAttendanceData({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        includeWeekends: false,
        includeHolidays: true
      });
    }
  }, [employeeId]);

  return {
    attendanceData,
    loading,
    error,
    loadAttendanceData
  };
};

// Hook para vacaciones de empleado
export const useEmployeeVacations = (employeeId: string) => {
  const [vacationsData, setVacationsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVacationsData = async (params: {
    year?: number;
    status?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeVacations(employeeId, params);
      setVacationsData(response);
    } catch (err) {
      console.error('Error loading vacations data:', err);
      setError('Error al cargar los datos de vacaciones.');
    } finally {
      setLoading(false);
    }
  };

  const createVacationRequest = async (requestData: {
    startDate: string;
    endDate: string;
    type: string;
    reason?: string;
  }) => {
    try {
      const response = await employeesApi.createVacationRequest(employeeId, requestData);
      await loadVacationsData(); // Recargar datos
      return response;
    } catch (error) {
      console.error('Error creating vacation request:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadVacationsData({ year: new Date().getFullYear() });
    }
  }, [employeeId]);

  return {
    vacationsData,
    loading,
    error,
    loadVacationsData,
    createVacationRequest
  };
};

// Hook para documentos de empleado
export const useEmployeeDocuments = (employeeId: string) => {
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentsData = async (params: {
    category?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeDocuments(employeeId, params);
      setDocumentsData(response);
    } catch (err) {
      console.error('Error loading documents data:', err);
      setError('Error al cargar los documentos.');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, metadata: {
    category: string;
    description?: string;
    tags?: string[];
    isConfidential?: boolean;
    expiresAt?: string;
  }) => {
    try {
      const response = await employeesApi.uploadDocument(employeeId, file, metadata);
      await loadDocumentsData(); // Recargar datos
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await employeesApi.deleteDocument(employeeId, documentId);
      await loadDocumentsData(); // Recargar datos
      return response;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadDocumentsData({ page: 1, limit: 20 });
    }
  }, [employeeId]);

  return {
    documentsData,
    loading,
    error,
    loadDocumentsData,
    uploadDocument,
    deleteDocument
  };
};

// Hook para incidencias de empleado
export const useEmployeeIncidents = (employeeId: string) => {
  const [incidentsData, setIncidentsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidentsData = async (params: {
    type?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeIncidents(employeeId, params);
      setIncidentsData(response);
    } catch (err) {
      console.error('Error loading incidents data:', err);
      setError('Error al cargar las incidencias.');
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incidentData: {
    type: string;
    severity: string;
    title: string;
    description: string;
    date: string;
    location: string;
    witnesses?: string[];
    attachments?: string[];
  }) => {
    try {
      const response = await employeesApi.createIncident(employeeId, incidentData);
      await loadIncidentsData(); // Recargar datos
      return response;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadIncidentsData({ page: 1, limit: 20 });
    }
  }, [employeeId]);

  return {
    incidentsData,
    loading,
    error,
    loadIncidentsData,
    createIncident
  };
};

// Hook para evaluaciones de empleado
export const useEmployeeEvaluations = (employeeId: string) => {
  const [evaluationsData, setEvaluationsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvaluationsData = async (params: {
    type?: string;
    status?: string;
    year?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeEvaluations(employeeId, params);
      setEvaluationsData(response);
    } catch (err) {
      console.error('Error loading evaluations data:', err);
      setError('Error al cargar las evaluaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadEvaluationsData({ year: new Date().getFullYear(), page: 1, limit: 20 });
    }
  }, [employeeId]);

  return {
    evaluationsData,
    loading,
    error,
    loadEvaluationsData
  };
};

// Hook para habilidades de empleado
export const useEmployeeSkills = (employeeId: string) => {
  const [skillsData, setSkillsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkillsData = async (params: {
    category?: string;
    level?: string;
    required?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeSkills(employeeId, params);
      setSkillsData(response);
    } catch (err) {
      console.error('Error loading skills data:', err);
      setError('Error al cargar las habilidades.');
    } finally {
      setLoading(false);
    }
  };

  const createSkill = async (skillData: {
    name: string;
    category: string;
    level: string;
    score: number;
    evidence: string;
    isRequired: boolean;
    developmentPlan: string;
    resources: string[];
    targetLevel?: string;
    targetDate?: string;
  }) => {
    try {
      const response = await employeesApi.createSkill(employeeId, skillData);
      await loadSkillsData(); // Recargar datos
      return response;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadSkillsData({ page: 1, limit: 20 });
    }
  }, [employeeId]);

  return {
    skillsData,
    loading,
    error,
    loadSkillsData,
    createSkill
  };
};

// Hook para historial de empleado
export const useEmployeeHistory = (employeeId: string) => {
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistoryData = async (params: {
    type?: string;
    module?: string;
    dateFrom?: string;
    dateTo?: string;
    changedBy?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployeeHistory(employeeId, params);
      setHistoryData(response);
    } catch (err) {
      console.error('Error loading history data:', err);
      setError('Error al cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadHistoryData({ page: 1, limit: 20 });
    }
  }, [employeeId]);

  return {
    historyData,
    loading,
    error,
    loadHistoryData
  };
};

// Hook para nómina semanal
export const useWeeklyPayroll = () => {
  const [weeklyPayroll, setWeeklyPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyPayroll = async (params: {
    week: number;
    year: number;
    department?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getWeeklyPayroll(params);
      setWeeklyPayroll(response);
    } catch (err) {
      console.error('Error loading weekly payroll:', err);
      setError('Error al cargar la nómina semanal.');
    } finally {
      setLoading(false);
    }
  };

  return {
    weeklyPayroll,
    loading,
    error,
    loadWeeklyPayroll
  };
};
