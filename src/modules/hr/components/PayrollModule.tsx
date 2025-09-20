import React from 'react';
import GeneralPayrollView from './GeneralPayrollView';

interface PayrollModuleProps {
  employeeId?: string;
  employeeName?: string;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({ employeeId, employeeName }) => {
  // Si se proporciona un employeeId específico, mostrar vista individual
  if (employeeId) {
    // Aquí podrías importar y mostrar EmployeePayrollView
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Nómina de {employeeName || 'Empleado'}
          </h2>
          <p className="text-gray-600">
            Vista individual de nómina para empleado específico
          </p>
        </div>
      </div>
    );
  }

  // Vista general de nómina
  return <GeneralPayrollView />;
};