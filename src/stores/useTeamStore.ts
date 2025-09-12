import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { 
  Employee, 
  TeamMember, 
  TeamFilters, 
  PerformanceMetrics, 
  CoachingPlan,
  EmployeeFilters,
  employeeToTeamMember
} from '../types/employee';
import employeeService from '../services/employeeService';

interface TeamStoreState {
  // Estado principal (alineado con backend)
  employees: Employee[];
  selectedEmployee: Employee | null;
  
  // Estado legacy (para compatibilidad con componentes existentes)
  teamData: any | null;
  members: TeamMember[];
  selectedMember: TeamMember | null;
  filters: TeamFilters;
  loading: boolean;
  error: string | null;
  
  // Stats calculadas
  stats: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    averagePerformance: number;
    totalExperience: number;
  };
  
  // Paginación
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TeamStore extends TeamStoreState {
  // ===== ACCIONES PRINCIPALES (ALINEADAS CON BACKEND) =====
  
  // Cargar empleados desde el backend
  loadEmployees: (filters?: EmployeeFilters) => Promise<void>;
  
  // Buscar empleados
  searchEmployees: (query: string, limit?: number) => Promise<void>;
  
  // Obtener empleado específico
  getEmployeeDetails: (id: string) => Promise<Employee | null>;
  
  // Crear empleado
  createEmployee: (employeeData: any) => Promise<Employee | null>;
  
  // Actualizar empleado
  updateEmployee: (id: string, updates: any) => Promise<Employee | null>;
  
  // Eliminar empleado
  deleteEmployee: (id: string) => Promise<boolean>;
  
  // Cargar estadísticas
  loadStats: () => Promise<void>;
  
  // ===== ACCIONES LEGACY (PARA COMPATIBILIDAD) =====
  
  setTeamData: (data: any | null) => void;
  setMembers: (members: TeamMember[]) => void;
  setSelectedMember: (member: TeamMember | null) => void;
  setFilters: (filters: TeamFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Operaciones CRUD legacy
  addMember: (member: TeamMember) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  removeMember: (id: string) => void;
  
  // Operaciones de performance
  updatePerformance: (memberId: string, performance: PerformanceMetrics) => void;
  updateCoachingPlan: (memberId: string, plan: CoachingPlan) => void;
  
  // Utilidades
  getMemberById: (id: string) => TeamMember | undefined;
  getFilteredMembers: () => TeamMember[];
  calculateStats: () => void;
  clearError: () => void;
  refreshTeam: () => void;
  
  // ===== UTILIDADES DE CONVERSIÓN =====
  
  // Sincronizar employees con members
  syncMembersFromEmployees: () => void;
}

export const useTeamStore = create<TeamStore>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // ===== ESTADO INICIAL =====
        
        // Estado principal
        employees: [],
        selectedEmployee: null,
        
        // Estado legacy
        teamData: null,
        members: [],
        selectedMember: null,
        filters: {
          search: '',
          department: '',
          status: '',
          role: '',
          skills: [],
          experience: { min: 0, max: 10 },
          performance: { min: 0, max: 100 },
          sortBy: 'name',
          sortOrder: 'asc'
        },
        loading: false,
        error: null,
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          onLeave: 0,
          averagePerformance: 0,
          totalExperience: 0
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        
        // ===== ACCIONES PRINCIPALES =====
        
        loadEmployees: async (filters = {}) => {
          try {
            set({ loading: true, error: null });
            
            const response = await employeeService.listEmployees(filters);
            
            if (response.success && response.data) {
              set({
                employees: response.data.employees,
                pagination: response.data.pagination,
                loading: false
              });
              
              // Sincronizar con members legacy
              get().syncMembersFromEmployees();
              get().calculateStats();
            } else {
              throw new Error('Error al cargar empleados');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Error al cargar empleados' 
            });
          }
        },
        
        searchEmployees: async (query, limit = 10) => {
          try {
            set({ loading: true, error: null });
            
            const response = await employeeService.searchEmployees(query, limit);
            
            if (response.success && response.data) {
              set({
                employees: response.data.employees,
                loading: false
              });
              
              get().syncMembersFromEmployees();
            } else {
              throw new Error('Error en la búsqueda');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Error en la búsqueda' 
            });
          }
        },
        
        getEmployeeDetails: async (id) => {
          try {
            set({ loading: true, error: null });
            
            const response = await employeeService.getEmployee(id);
            
            if (response.success && response.data) {
              const employee = response.data.employee;
              
              // Actualizar el empleado en la lista
              set(state => ({
                employees: state.employees.map(emp => 
                  emp.id === id ? employee : emp
                ),
                selectedEmployee: employee,
                loading: false
              }));
              
              get().syncMembersFromEmployees();
              return employee;
            } else {
              throw new Error('Empleado no encontrado');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Error al obtener empleado' 
            });
            return null;
          }
        },
        
        createEmployee: async (employeeData) => {
          try {
            set({ loading: true, error: null });
            
            const response = await employeeService.createEmployee(employeeData);
            
            if (response.success && response.data) {
              const newEmployee = response.data.employee;
              
              set(state => ({
                employees: [...state.employees, newEmployee],
                loading: false
              }));
              
              get().syncMembersFromEmployees();
              get().calculateStats();
              
              return newEmployee;
            } else {
              throw new Error(response.message || 'Error al crear empleado');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Error al crear empleado' 
            });
            return null;
          }
        },
        
        updateEmployee: async (id, updates) => {
          try {
            set({ loading: true, error: null });
            
            const response = await employeeService.updateEmployee(id, updates);
            
            if (response.success && response.data) {
              const updatedEmployee = response.data.employee;
              
              set(state => ({
                employees: state.employees.map(emp => 
                  emp.id === id ? updatedEmployee : emp
                ),
                selectedEmployee: state.selectedEmployee?.id === id ? updatedEmployee : state.selectedEmployee,
                loading: false
              }));
              
              get().syncMembersFromEmployees();
              get().calculateStats();
              
              return updatedEmployee;
            } else {
              throw new Error(response.message || 'Error al actualizar empleado');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Error al actualizar empleado' 
            });
            return null;
          }
        },
        
        deleteEmployee: async (id) => {
          try {
            set({ loading: true, error: null });
            
            const response = await employeeService.deleteEmployee(id);
            
            if (response.success) {
              set(state => ({
                employees: state.employees.filter(emp => emp.id !== id),
                selectedEmployee: state.selectedEmployee?.id === id ? null : state.selectedEmployee,
                loading: false
              }));
              
              get().syncMembersFromEmployees();
              get().calculateStats();
              
              return true;
            } else {
              throw new Error('Error al eliminar empleado');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Error al eliminar empleado' 
            });
            return false;
          }
        },
        
        loadStats: async () => {
          try {
            const response = await employeeService.getStats();
            
            if (response.success && response.data) {
              const { summary } = response.data;
              
              set({
                stats: {
                  total: summary.total,
                  active: summary.active,
                  inactive: summary.inactive,
                  onLeave: summary.on_leave,
                  averagePerformance: 0, // Se calculará localmente
                  totalExperience: 0 // Se calculará localmente
                }
              });
            }
          } catch (error: any) {
            console.error('Error al cargar estadísticas:', error);
          }
        },
        
        // ===== ACCIONES LEGACY =====
        
        setTeamData: (data) => set({ 
          teamData: data,
          loading: false,
          error: null 
        }),
        
        setMembers: (members) => {
          set({ members });
          get().calculateStats();
        },
        
        setSelectedMember: (member) => set({ selectedMember: member }),
        
        setFilters: (filters) => set({ filters }),
        
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ 
          error,
          loading: false 
        }),
        
        clearError: () => set({ error: null }),
        
        refreshTeam: () => {
          set({
            loading: true,
            error: null
          });
          // Recargar empleados
          get().loadEmployees();
        },
        
        addMember: (member) => {
          set(state => ({
            members: [...state.members, member]
          }));
          get().calculateStats();
        },
        
        updateMember: (id, updates) => {
          set(state => ({
            members: state.members.map(member =>
              member.id === id ? { ...member, ...updates } : member
            )
          }));
          get().calculateStats();
        },
        
        removeMember: (id) => {
          set(state => ({
            members: state.members.filter(member => member.id !== id),
            selectedMember: state.selectedMember?.id === id ? null : state.selectedMember
          }));
          get().calculateStats();
        },
        
        updatePerformance: (memberId, performance) => {
          get().updateMember(memberId, { performance });
        },
        
        updateCoachingPlan: (memberId, plan) => {
          get().updateMember(memberId, { coachingPlan: plan });
        },
        
        getMemberById: (id) => {
          return get().members.find(member => member.id === id);
        },
        
        getFilteredMembers: () => {
          const { members, filters } = get();
          
          return members.filter(member => {
            // Filtro por búsqueda
            if (filters.search && !member.name.toLowerCase().includes(filters.search.toLowerCase())) {
              return false;
            }
            
            // Filtro por estado
            if (filters.status && filters.status !== 'all' && member.status !== filters.status) {
              return false;
            }
            
            // Filtro por departamento
            if (filters.department && member.department !== filters.department) {
              return false;
            }
            
            // Filtro por rol
            if (filters.role && member.role !== filters.role) {
              return false;
            }
            
            return true;
          });
        },
        
        calculateStats: () => {
          const { employees, members } = get();
          
          // Usar employees si están disponibles, sino usar members legacy
          if (employees.length > 0) {
            // Cálculos basados en employees del backend
            const active = employees.filter(e => e.status === 'active').length;
            const inactive = employees.filter(e => e.status === 'inactive').length;
            const onLeave = employees.filter(e => e.status === 'on_leave').length;
            
            set({
              stats: {
                total: employees.length,
                active,
                inactive,
                onLeave,
                averagePerformance: 0, // Se calculará con datos de performance
                totalExperience: 0 // Se calculará con fechas de inicio
              }
            });
          } else {
            // Cálculos legacy
            const active = members.filter(m => m.status === 'active').length;
            const inactive = members.length - active;
            const averagePerformance = members.reduce((sum, m) => 
              sum + (m.performance?.rating || 0), 0
            ) / members.length || 0;
            
            set({
              stats: {
                total: members.length,
                active,
                inactive,
                onLeave: 0,
                averagePerformance: Math.round(averagePerformance * 100) / 100,
                totalExperience: 0
              }
            });
          }
        },
        
        // ===== UTILIDADES DE CONVERSIÓN =====
        
        syncMembersFromEmployees: () => {
          const { employees } = get();
          
          const members = employees.map(employee => employeeToTeamMember(employee));
          
          set({ members });
        }
      })
    ),
    { name: 'team-store' }
  )
); 