import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { PayrollPeriod } from '../../../services/generalPayrollApi';

interface SimplePayrollSimulationViewProps {
  selectedPeriod: PayrollPeriod;
  onNext: (simulationData: any[]) => void;
  onBack: () => void;
}

const SimplePayrollSimulationView: React.FC<SimplePayrollSimulationViewProps> = ({ 
  selectedPeriod, 
  onNext, 
  onBack 
}) => {
  console.log('🎯 SimplePayrollSimulationView renderizando con período:', selectedPeriod);

  const handleNext = () => {
    console.log('➡️ Continuando a siguiente paso...');
    onNext([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulación de Nómina (Simple)</h1>
          <p className="text-gray-600 mt-1">
            Período: {selectedPeriod.period} ({selectedPeriod.startDate} - {selectedPeriod.endDate})
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continuar
          </button>
        </div>
      </div>

      {/* Contenido simple */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-green-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Vista de Simulación Simplificada</h2>
            <p className="text-gray-600 mt-2">
              Esta es una versión simplificada para probar la navegación.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Período ID: {selectedPeriod.id}
            </p>
            <p className="text-sm text-gray-500">
              Empleados: {selectedPeriod.employees}
            </p>
            <p className="text-sm text-gray-500">
              Costo Estimado: ${selectedPeriod.estimatedCost?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePayrollSimulationView;
