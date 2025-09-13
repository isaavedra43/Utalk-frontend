import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, CheckCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';

export const PayrollGeneralModule: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentPeriod = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando período actual de nómina...');
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticación no encontrado. Por favor, inicia sesión nuevamente.');
      }
      
      const response = await fetch('https://utalk-backend-production.up.railway.app/api/payroll-periods/current', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentPeriod(data.data);
        console.log('✅ Período actual cargado:', data.data);
      } else {
        setCurrentPeriod(null);
        console.log('ℹ️ No hay período activo:', data.message);
      }
    } catch (error) {
      console.error('❌ Error cargando período actual:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setCurrentPeriod(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentPeriod();
  }, []);

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nómina General</h1>
            <p className="text-gray-600">Gestiona períodos de nómina y procesa pagos masivos</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadCurrentPeriod}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6">
        {currentPeriod ? (
          <div className="space-y-6">
            {/* Información del período actual */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentPeriod.name}</h2>
                  <p className="text-gray-600">
                    {new Date(currentPeriod.startDate).toLocaleDateString('es-MX')} - {new Date(currentPeriod.endDate).toLocaleDateString('es-MX')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Frecuencia: {currentPeriod.frequency === 'weekly' ? 'Semanal' : 
                                currentPeriod.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentPeriod.status === 'draft' && <Clock className="w-5 h-5 text-gray-600" />}
                  {currentPeriod.status === 'calculated' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                  {currentPeriod.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {currentPeriod.status === 'paid' && <DollarSign className="w-5 h-5 text-purple-600" />}
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentPeriod.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    currentPeriod.status === 'calculated' ? 'bg-blue-100 text-blue-800' :
                    currentPeriod.status === 'approved' ? 'bg-green-100 text-green-800' :
                    currentPeriod.status === 'paid' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {currentPeriod.status === 'draft' ? 'Borrador' :
                     currentPeriod.status === 'calculated' ? 'Calculado' :
                     currentPeriod.status === 'approved' ? 'Aprobado' :
                     currentPeriod.status === 'paid' ? 'Pagado' : 
                     currentPeriod.status === 'closed' ? 'Cerrado' : `Estado: ${currentPeriod.status}`}
                  </span>
                </div>
              </div>

              {/* Estadísticas del período */}
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

            {/* Información adicional */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Período</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID del Período:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">{currentPeriod.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className="ml-2 text-gray-900">{currentPeriod.status}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Frecuencia:</span>
                  <span className="ml-2 text-gray-900">{currentPeriod.frequency}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Creado:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(currentPeriod.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
                {currentPeriod.updatedAt && (
                  <div>
                    <span className="font-medium text-gray-700">Actualizado:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(currentPeriod.updatedAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Configuraciones del período */}
              {currentPeriod.configurations && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Configuraciones</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-2 ${currentPeriod.configurations.calculateTaxes ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Calcular impuestos</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-2 ${currentPeriod.configurations.includeOvertime ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Incluir horas extras</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-2 ${currentPeriod.configurations.applyAbsenceDeductions ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Deducciones por faltas</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-2 ${currentPeriod.configurations.includeLoans ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Incluir préstamos</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay período activo</h3>
              <p className="text-gray-600 mb-4">
                No se encontró un período de nómina activo. Los períodos se crean desde el backend.
              </p>
              <button
                onClick={loadCurrentPeriod}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar nuevamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};