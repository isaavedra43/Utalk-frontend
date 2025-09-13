import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, CheckCircle, AlertCircle, RefreshCw, Clock, Play, Eye, BarChart3, UserPlus, Calculator, TrendingUp } from 'lucide-react';

export const PayrollGeneralModule: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [periodEmployees, setPeriodEmployees] = useState<any[]>([]);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'stats'>('overview');

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token de autenticación no encontrado. Por favor, inicia sesión nuevamente.');
    }
    return token;
  };

  // Cargar período actual de nómina
  const loadCurrentPeriod = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando período actual de nómina...');
      
      const token = getAuthToken();
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
        // Cargar empleados del período si existe
        if (data.data?.id) {
          await loadPeriodEmployees(data.data.id);
        }
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

  // Cargar todos los empleados disponibles
  const loadAllEmployees = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('https://utalk-backend-production.up.railway.app/api/employees?page=1&limit=100', {
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
        setEmployees(data.data.employees || []);
        console.log('✅ Empleados cargados:', data.data.employees?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
    }
  };

  // Cargar empleados del período específico
  const loadPeriodEmployees = async (periodId: string) => {
    try {
      const token = getAuthToken();
      // TODO: Conectar con endpoint real del backend
      // const response = await fetch(`https://utalk-backend-production.up.railway.app/api/payroll-periods/${periodId}/employees`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Por ahora simulamos datos vacíos ya que el período no tiene empleados asignados
      setPeriodEmployees([]);
      console.log('ℹ️ Empleados del período cargados (vacío por ahora)');
    } catch (error) {
      console.error('❌ Error cargando empleados del período:', error);
    }
  };

  // Procesar nómina del período
  const processPayroll = async () => {
    if (!currentPeriod?.id) return;
    
    try {
      setProcessing(true);
      const token = getAuthToken();
      
      // TODO: Conectar con endpoint real del backend
      // const response = await fetch(`https://utalk-backend-production.up.railway.app/api/payroll-periods/${currentPeriod.id}/process`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     assignAllEmployees: true, // Asignar todos los empleados activos
      //     calculatePayroll: true    // Calcular nóminas automáticamente
      //   })
      // });

      console.log('🔄 Procesando nómina del período:', currentPeriod.id);
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Actualizar con respuesta real del backend
      console.log('✅ Nómina procesada exitosamente');
      setShowProcessModal(false);
      
      // Recargar datos
      await loadCurrentPeriod();
      
    } catch (error) {
      console.error('❌ Error procesando nómina:', error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadCurrentPeriod();
    loadAllEmployees();
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
            {currentPeriod && currentPeriod.status === 'draft' && (
              <button
                onClick={() => setShowProcessModal(true)}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                {processing ? 'Procesando...' : 'Procesar Nómina'}
              </button>
            )}
            <button
              onClick={() => {
                loadCurrentPeriod();
                loadAllEmployees();
              }}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        {currentPeriod && (
          <div className="mt-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Empleados ({periodEmployees.length})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Estadísticas
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6">
        {currentPeriod ? (
          <>
            {/* Tab: Resumen */}
            {activeTab === 'overview' && (
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
                      <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
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
            )}

            {/* Tab: Empleados */}
            {activeTab === 'employees' && (
              <div className="space-y-6">
                {/* Header de empleados */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Empleados del Período</h3>
                      <p className="text-gray-600">
                        Lista de empleados asignados al período "{currentPeriod.name}"
                      </p>
                    </div>
                    
                    {currentPeriod.status === 'draft' && periodEmployees.length === 0 && employees.length > 0 && (
                      <button
                        onClick={() => setShowProcessModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Asignar Empleados
                      </button>
                    )}
                  </div>
                  
                  {/* Resumen de empleados */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-900">{employees.length}</p>
                      <p className="text-xs text-blue-700">Disponibles</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-900">{periodEmployees.length}</p>
                      <p className="text-xs text-green-700">Asignados</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-lg font-bold text-yellow-900">{currentPeriod.summary?.employeesProcessed || 0}</p>
                      <p className="text-xs text-yellow-700">Procesados</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-900">{currentPeriod.summary?.employeesPaid || 0}</p>
                      <p className="text-xs text-purple-700">Pagados</p>
                    </div>
                  </div>
                </div>

                {/* Tabla de empleados */}
                <div className="bg-white rounded-lg shadow">
                  {periodEmployees.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Salario Base
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percepciones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Deducciones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Neto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {periodEmployees.map((employee, index) => (
                            <tr key={employee.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-gray-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{employee.employeeNumber}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${(employee.salary?.baseSalary || 0).toLocaleString('es-MX')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${(employee.payroll?.totalPerceptions || 0).toLocaleString('es-MX')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${(employee.payroll?.totalDeductions || 0).toLocaleString('es-MX')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${(employee.payroll?.netPay || 0).toLocaleString('es-MX')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  employee.payroll?.status === 'calculated' ? 'bg-blue-100 text-blue-800' :
                                  employee.payroll?.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  employee.payroll?.status === 'paid' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {employee.payroll?.status === 'calculated' ? 'Calculado' :
                                   employee.payroll?.status === 'approved' ? 'Aprobado' :
                                   employee.payroll?.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  <Calculator className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay empleados asignados
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Este período no tiene empleados asignados aún. 
                        {employees.length > 0 ? ' Puedes procesar la nómina para asignar automáticamente todos los empleados activos.' : ' Primero necesitas tener empleados registrados en el sistema.'}
                      </p>
                      {currentPeriod.status === 'draft' && employees.length > 0 && (
                        <button
                          onClick={() => setShowProcessModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Procesar Nómina
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Estadísticas */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Estadísticas generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {currentPeriod.summary?.totalEmployees || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Empleados Totales</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          ${(currentPeriod.summary?.totalPayroll || 0).toLocaleString('es-MX')}
                        </h3>
                        <p className="text-sm text-gray-600">Nómina Total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          ${(currentPeriod.summary?.averageSalary || 0).toLocaleString('es-MX')}
                        </h3>
                        <p className="text-sm text-gray-600">Salario Promedio</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {currentPeriod.summary?.employeesProcessed || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Procesados</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desglose detallado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Total Percepciones:</span>
                        <span className="font-medium text-green-600">
                          ${(currentPeriod.summary?.totalPerceptions || 0).toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Total Deducciones:</span>
                        <span className="font-medium text-red-600">
                          ${(currentPeriod.summary?.totalDeductions || 0).toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 font-semibold">
                        <span className="text-gray-900">Nómina Neta:</span>
                        <span className="text-blue-600">
                          ${((currentPeriod.summary?.totalPerceptions || 0) - (currentPeriod.summary?.totalDeductions || 0)).toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Procesamiento</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Pendientes:</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                          {(currentPeriod.summary?.employeesPending || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Aprobados:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {(currentPeriod.summary?.employeesApproved || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Pagados:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {(currentPeriod.summary?.employeesPaid || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del período */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Período</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Fecha de inicio:</span>
                      <p className="text-gray-900 mt-1">
                        {new Date(currentPeriod.startDate).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de fin:</span>
                      <p className="text-gray-900 mt-1">
                        {new Date(currentPeriod.endDate).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Duración:</span>
                      <p className="text-gray-900 mt-1">
                        {Math.ceil((new Date(currentPeriod.endDate).getTime() - new Date(currentPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24))} días
                      </p>
                    </div>
                    {currentPeriod.processedAt && (
                      <div>
                        <span className="font-medium text-gray-700">Procesado:</span>
                        <p className="text-gray-900 mt-1">
                          {new Date(currentPeriod.processedAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    )}
                    {currentPeriod.approvedAt && (
                      <div>
                        <span className="font-medium text-gray-700">Aprobado:</span>
                        <p className="text-gray-900 mt-1">
                          {new Date(currentPeriod.approvedAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    )}
                    {currentPeriod.paidAt && (
                      <div>
                        <span className="font-medium text-gray-700">Pagado:</span>
                        <p className="text-gray-900 mt-1">
                          {new Date(currentPeriod.paidAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
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

      {/* Modal de Procesamiento de Nómina */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Procesar Nómina</h3>
                  <p className="text-sm text-gray-600">Período: {currentPeriod?.name}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Esta acción realizará los siguientes procesos:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Asignar todos los empleados activos al período
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Calcular salarios base y proporcionales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Aplicar deducciones y percepciones
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Generar totales del período
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="font-medium">{employees.length} empleados</span>
                    <span className="ml-1">serán procesados</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-800 mt-1">
                    <Calculator className="w-4 h-4 mr-2" />
                    <span>Salario total estimado: ${employees.reduce((sum, emp) => sum + (emp.salary?.baseSalary || 0), 0).toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  disabled={processing}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPayroll}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Procesar Nómina
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};