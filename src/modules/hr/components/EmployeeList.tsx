import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  User,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';
import type { Employee, EmployeeFilter, EmployeeStatus } from '../../../types/hr';

interface EmployeeListProps {
  onSelectEmployee: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ onSelectEmployee }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EmployeeFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Datos mock para demostración
  const employees: Employee[] = [
    {
      id: '1',
      employeeNumber: 'EMP001',
      firstName: 'Ana',
      lastName: 'García',
      email: 'ana.garcia@empresa.com',
      phone: '+52 55 1234 5678',
      avatar: undefined,
      status: 'active',
      hireDate: new Date('2022-03-15'),
      personalInfo: {
        rfc: 'GARA920315MDF',
        curp: 'GARA920315MDFNNS01',
        nss: '12345678901',
        birthDate: new Date('1992-03-15'),
        gender: 'female',
        maritalStatus: 'single',
        address: {
          street: 'Av. Reforma',
          number: '123',
          neighborhood: 'Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06000',
          country: 'México'
        },
        emergencyContact: {
          name: 'María García',
          relationship: 'Madre',
          phone: '+52 55 9876 5432'
        },
        bankInfo: {
          bankName: 'BBVA',
          accountNumber: '0123456789',
          clabe: '012345678901234567',
          accountType: 'checking'
        }
      },
      position: {
        id: 'pos1',
        title: 'Gerente de Marketing',
        department: 'Marketing',
        level: 'Senior',
        reportsTo: 'CEO',
        jobDescription: 'Liderar estrategias de marketing digital',
        requirements: ['Licenciatura en Marketing', '5+ años experiencia'],
        skills: ['Marketing Digital', 'SEO', 'Analytics'],
        salaryRange: { min: 25000, max: 35000 }
      },
      location: {
        id: 'loc1',
        name: 'Oficina Central',
        address: {
          street: 'Av. Insurgentes',
          number: '456',
          neighborhood: 'Roma Norte',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06700',
          country: 'México'
        },
        timezone: 'America/Mexico_City',
        isRemote: false
      },
      contract: {
        id: 'con1',
        type: 'permanent',
        startDate: new Date('2022-03-15'),
        workingHours: 40,
        schedule: 'Lunes a Viernes 9:00-18:00',
        benefits: ['Seguro médico', 'Vales de despensa', 'Vacaciones'],
        clauses: ['Confidencialidad', 'No competencia']
      },
      salary: {
        baseSalary: 30000,
        currency: 'MXN',
        frequency: 'monthly',
        paymentMethod: 'bank_transfer',
        allowances: [
          { id: '1', name: 'Vales de despensa', amount: 2000, isTaxable: false, isImss: false, isInfonavit: false }
        ],
        deductions: [
          { id: '1', name: 'ISR', amount: 0, isPercentage: true, isVoluntary: false },
          { id: '2', name: 'IMSS', amount: 0, isPercentage: true, isVoluntary: false }
        ]
      },
      sbc: 32000,
      vacationBalance: 15,
      sickLeaveBalance: 5,
      metrics: {
        totalEarnings: 30000,
        totalDeductions: 4500,
        netPay: 25500,
        attendanceRate: 98.5,
        lateArrivals: 2,
        absences: 0,
        vacationDaysUsed: 5,
        vacationDaysRemaining: 15,
        overtimeHours: 8,
        overtimeAmount: 1200,
        incidentsCount: 0,
        incidentsLast30Days: 0,
        documentCompliance: 100,
        trainingCompletion: 95,
        performanceScore: 4.2,
        lastEvaluationDate: new Date('2024-10-15')
      },
      createdAt: new Date('2022-03-15'),
      updatedAt: new Date('2024-11-22'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      employeeNumber: 'EMP002',
      firstName: 'Carlos',
      lastName: 'López',
      email: 'carlos.lopez@empresa.com',
      phone: '+52 55 2345 6789',
      avatar: undefined,
      status: 'active',
      hireDate: new Date('2021-08-20'),
      personalInfo: {
        rfc: 'LOPC850820HDF',
        curp: 'LOPC850820HDFNNS02',
        nss: '23456789012',
        birthDate: new Date('1985-08-20'),
        gender: 'male',
        maritalStatus: 'married',
        address: {
          street: 'Calle Morelos',
          number: '789',
          neighborhood: 'Condesa',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06140',
          country: 'México'
        },
        emergencyContact: {
          name: 'Laura López',
          relationship: 'Esposa',
          phone: '+52 55 8765 4321'
        },
        bankInfo: {
          bankName: 'Santander',
          accountNumber: '1234567890',
          clabe: '123456789012345678',
          accountType: 'checking'
        }
      },
      position: {
        id: 'pos2',
        title: 'Desarrollador Senior',
        department: 'Tecnología',
        level: 'Senior',
        reportsTo: 'CTO',
        jobDescription: 'Desarrollo de aplicaciones web',
        requirements: ['Ingeniería en Sistemas', '3+ años experiencia'],
        skills: ['React', 'Node.js', 'TypeScript'],
        salaryRange: { min: 35000, max: 45000 }
      },
      location: {
        id: 'loc1',
        name: 'Oficina Central',
        address: {
          street: 'Av. Insurgentes',
          number: '456',
          neighborhood: 'Roma Norte',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06700',
          country: 'México'
        },
        timezone: 'America/Mexico_City',
        isRemote: true
      },
      contract: {
        id: 'con2',
        type: 'permanent',
        startDate: new Date('2021-08-20'),
        workingHours: 40,
        schedule: 'Lunes a Viernes 9:00-18:00',
        benefits: ['Seguro médico', 'Vales de despensa', 'Vacaciones'],
        clauses: ['Confidencialidad', 'No competencia']
      },
      salary: {
        baseSalary: 40000,
        currency: 'MXN',
        frequency: 'monthly',
        paymentMethod: 'bank_transfer',
        allowances: [
          { id: '1', name: 'Vales de despensa', amount: 2000, isTaxable: false, isImss: false, isInfonavit: false }
        ],
        deductions: [
          { id: '1', name: 'ISR', amount: 0, isPercentage: true, isVoluntary: false },
          { id: '2', name: 'IMSS', amount: 0, isPercentage: true, isVoluntary: false }
        ]
      },
      sbc: 42000,
      vacationBalance: 20,
      sickLeaveBalance: 3,
      metrics: {
        totalEarnings: 40000,
        totalDeductions: 6000,
        netPay: 34000,
        attendanceRate: 96.8,
        lateArrivals: 5,
        absences: 1,
        vacationDaysUsed: 10,
        vacationDaysRemaining: 20,
        overtimeHours: 12,
        overtimeAmount: 1800,
        incidentsCount: 1,
        incidentsLast30Days: 0,
        documentCompliance: 95,
        trainingCompletion: 100,
        performanceScore: 4.5,
        lastEvaluationDate: new Date('2024-09-20')
      },
      createdAt: new Date('2021-08-20'),
      updatedAt: new Date('2024-11-22'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '3',
      employeeNumber: 'EMP003',
      firstName: 'María',
      lastName: 'Rodríguez',
      email: 'maria.rodriguez@empresa.com',
      phone: '+52 55 3456 7890',
      avatar: undefined,
      status: 'active',
      hireDate: new Date('2023-01-10'),
      personalInfo: {
        rfc: 'ROMM900110MDF',
        curp: 'ROMM900110MDFNNS03',
        nss: '34567890123',
        birthDate: new Date('1990-01-10'),
        gender: 'female',
        maritalStatus: 'single',
        address: {
          street: 'Av. Chapultepec',
          number: '321',
          neighborhood: 'Polanco',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '11560',
          country: 'México'
        },
        emergencyContact: {
          name: 'José Rodríguez',
          relationship: 'Padre',
          phone: '+52 55 7654 3210'
        },
        bankInfo: {
          bankName: 'HSBC',
          accountNumber: '2345678901',
          clabe: '234567890123456789',
          accountType: 'checking'
        }
      },
      position: {
        id: 'pos3',
        title: 'Analista de Recursos Humanos',
        department: 'Recursos Humanos',
        level: 'Mid',
        reportsTo: 'Gerente RH',
        jobDescription: 'Análisis de datos de RRHH',
        requirements: ['Licenciatura en Psicología', '2+ años experiencia'],
        skills: ['Análisis de datos', 'Excel', 'Power BI'],
        salaryRange: { min: 20000, max: 28000 }
      },
      location: {
        id: 'loc1',
        name: 'Oficina Central',
        address: {
          street: 'Av. Insurgentes',
          number: '456',
          neighborhood: 'Roma Norte',
          city: 'Ciudad de México',
          state: 'CDMX',
          zipCode: '06700',
          country: 'México'
        },
        timezone: 'America/Mexico_City',
        isRemote: false
      },
      contract: {
        id: 'con3',
        type: 'permanent',
        startDate: new Date('2023-01-10'),
        workingHours: 40,
        schedule: 'Lunes a Viernes 9:00-18:00',
        benefits: ['Seguro médico', 'Vales de despensa', 'Vacaciones'],
        clauses: ['Confidencialidad', 'No competencia']
      },
      salary: {
        baseSalary: 24000,
        currency: 'MXN',
        frequency: 'monthly',
        paymentMethod: 'bank_transfer',
        allowances: [
          { id: '1', name: 'Vales de despensa', amount: 2000, isTaxable: false, isImss: false, isInfonavit: false }
        ],
        deductions: [
          { id: '1', name: 'ISR', amount: 0, isPercentage: true, isVoluntary: false },
          { id: '2', name: 'IMSS', amount: 0, isPercentage: true, isVoluntary: false }
        ]
      },
      sbc: 26000,
      vacationBalance: 10,
      sickLeaveBalance: 5,
      metrics: {
        totalEarnings: 24000,
        totalDeductions: 3600,
        netPay: 20400,
        attendanceRate: 99.2,
        lateArrivals: 1,
        absences: 0,
        vacationDaysUsed: 5,
        vacationDaysRemaining: 10,
        overtimeHours: 4,
        overtimeAmount: 600,
        incidentsCount: 0,
        incidentsLast30Days: 0,
        documentCompliance: 100,
        trainingCompletion: 90,
        performanceScore: 4.0,
        lastEvaluationDate: new Date('2024-08-15')
      },
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date('2024-11-22'),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = !searchQuery || 
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !filters.status || filters.status.includes(employee.status);
      const matchesDepartment = !filters.department || filters.department.includes(employee.position.department);
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchQuery, filters]);

  const getStatusIcon = (status: EmployeeStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'terminated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'on_leave':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: EmployeeStatus) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'terminated':
        return 'Terminado';
      case 'on_leave':
        return 'En licencia';
      default:
        return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value as EmployeeStatus] : undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="terminated">Terminado</option>
                <option value="on_leave">En licencia</option>
              </select>
              
              <select
                value={filters.department?.[0] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value ? [e.target.value] : undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los departamentos</option>
                <option value="Marketing">Marketing</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Ventas">Ventas</option>
                <option value="Finanzas">Finanzas</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredEmployees.length} empleados encontrados</span>
          {selectedEmployees.length > 0 && (
            <span>{selectedEmployees.length} seleccionados</span>
          )}
        </div>
      </div>

      {/* Lista de empleados */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                        } else {
                          setSelectedEmployees([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sueldo Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SBC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Vacaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incidencias 30d
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cumplimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees(prev => [...prev, employee.id]);
                          } else {
                            setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.employeeNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position.title}</div>
                      <div className="text-sm text-gray-500">{employee.position.level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{employee.position.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{employee.location.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(employee.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                          {getStatusText(employee.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{formatCurrency(employee.salary.baseSalary)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatCurrency(employee.sbc)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{formatDate(employee.hireDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{employee.vacationBalance} días</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {employee.metrics.incidentsLast30Days > 0 ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className="text-sm text-gray-900">{employee.metrics.incidentsLast30Days}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{employee.metrics.documentCompliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Documentos">
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Más opciones">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectEmployee(employee)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{employee.employeeNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(employee.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                    {getStatusText(employee.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Puesto</span>
                  <span className="text-sm font-medium text-gray-900">{employee.position.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Área</span>
                  <span className="text-sm font-medium text-gray-900">{employee.position.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sueldo Base</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(employee.salary.baseSalary)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SBC</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(employee.sbc)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vacaciones</span>
                  <span className="text-sm font-medium text-gray-900">{employee.vacationBalance} días</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cumplimiento</span>
                  <span className="text-sm font-medium text-gray-900">{employee.metrics.documentCompliance}%</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Ingreso: {formatDate(employee.hireDate)}</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
