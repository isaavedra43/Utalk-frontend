// ===================================================================
// TABLA DE EMPLEADOS EN NÓMINA
// ===================================================================

import React, { useState } from 'react';
import { 
  User, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';

import { PayrollPeriod, PayrollEmployee } from '../../../types/payroll';
import { formatCurrency } from '../../../utils/payrollUtils';

interface Employee {
  id: string;
  employeeNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  position: {
    title: string;
    department: string;
  };
}

interface PayrollEmployeesTableProps {
  employees: Array<{
    employee: Employee;
    payroll: PayrollEmployee | null;
  }>;
  period?: PayrollPeriod;
  loading?: boolean;
}

const PayrollEmployeesTable: React.FC<PayrollEmployeesTableProps> = ({
  employees,
  period,
  loading = false
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Manejar selección de empleados
  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.employee.id));
    }
  };

  // Obtener estado de la nómina
  const getPayrollStatus = (payroll: PayrollEmployee | null) => {
    if (!payroll) return { status: 'pending', label: 'Pendiente', color: 'gray' };
    
    switch (payroll.status) {
      case 'calculated':
        return { status: 'calculated', label: 'Calculado', color: 'blue' };
      case 'approved':
        return { status: 'approved', label: 'Aprobado', color: 'green' };
      case 'paid':
        return { status: 'paid', label: 'Pagado', color: 'purple' };
      case 'error':
        return { status: 'error', label: 'Error', color: 'red' };
      default:
        return { status: 'pending', label: 'Pendiente', color: 'gray' };
    }
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'calculated':
        return <FileText className="w-4 h-4" />;
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'paid':
        return <DollarSign className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="overflow-hidden">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Acciones Masivas */}
      {selectedEmployees.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedEmployees.length} empleado{selectedEmployees.length > 1 ? 's' : ''} seleccionado{selectedEmployees.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50">
                <Check className="w-4 h-4 mr-1" />
                Aprobar Seleccionados
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50">
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerar
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50">
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === employees.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salario Bruto
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percepciones
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deducciones
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salario Neto
              </th>
              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(({ employee, payroll }) => {
              const payrollStatus = getPayrollStatus(payroll);
              
              return (
                <tr 
                  key={employee.id}
                  className={`hover:bg-gray-50 ${selectedEmployees.includes(employee.id) ? 'bg-blue-50' : ''}`}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  
                  {/* Empleado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.personalInfo.avatar ? (
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={employee.personalInfo.avatar} 
                            alt="" 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employeeNumber} • {employee.position.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Departamento */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position.department}
                  </td>
                  
                  {/* Salario Bruto */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payroll ? formatCurrency(payroll.grossSalary) : '-'}
                  </td>
                  
                  {/* Percepciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      {payroll ? formatCurrency(payroll.totalPerceptions) : '-'}
                    </div>
                  </td>
                  
                  {/* Deducciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      {payroll ? formatCurrency(payroll.totalDeductions) : '-'}
                    </div>
                  </td>
                  
                  {/* Salario Neto */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {payroll ? formatCurrency(payroll.netSalary) : '-'}
                  </td>
                  
                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${payrollStatus.color}-100 text-${payrollStatus.color}-800`}>
                      {getStatusIcon(payrollStatus.status)}
                      <span className="ml-1">{payrollStatus.label}</span>
                    </span>
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      {payroll && payroll.status === 'calculated' && (
                        <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {employees.length} empleados
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                Calculados: {employees.filter(emp => emp.payroll?.status === 'calculated').length}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                Aprobados: {employees.filter(emp => emp.payroll?.status === 'approved').length}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600">
                Pagados: {employees.filter(emp => emp.payroll?.status === 'paid').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollEmployeesTable;