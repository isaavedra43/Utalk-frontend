import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, DollarSign, Plus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { payrollApi, PayrollPeriod } from '../../../services/payrollApi';

export const PayrollGeneralModule: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState<PayrollPeriod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentPeriod = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando período actual de nómina...');
      const response = await payrollApi.getCurrentPeriod();
      setCurrentPeriod(response);
      console.log('✅ Período actual cargado:', response);
    } catch (error) {
      console.error('❌ Error cargando período actual:', error);
      setError('Token de autenticación no encontrado');
      setCurrentPeriod(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentPeriod();
  }, [loadCurrentPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando nómina general...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={loadCurrentPeriod}
          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nómina General</h1>
            <p className="text-gray-600">Gestiona períodos de nómina y procesa pagos masivos</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {currentPeriod ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentPeriod.name}</h2>
                <p className="text-gray-600">
                  {new Date(currentPeriod.startDate).toLocaleDateString('es-MX')} - {new Date(currentPeriod.endDate).toLocaleDateString('es-MX')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPeriod.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {currentPeriod.status === 'draft' ? 'Borrador' : 'Calculado'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{currentPeriod.summary?.totalEmployees || 0}</p>
                <p className="text-sm text-blue-700">Total Empleados</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">
                  ${(currentPeriod.summary?.totalPayroll || 0).toLocaleString('es-MX')}
                </p>
                <p className="text-sm text-green-700">Nómina Total</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {currentPeriod.summary?.employeesProcessed || 0}
                </p>
                <p className="text-sm text-purple-700">Procesados</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay período activo</h3>
              <p className="text-gray-600 mb-4">Los períodos se crean desde el backend</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};