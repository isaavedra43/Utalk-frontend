import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, FileText, Download, Calendar, Users, TrendingUp, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { employeesApi } from '../../../services/employeesApi';

export const PayrollModule: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekPayroll, setWeekPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Función para obtener el rango de la semana
  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para que la semana empiece en lunes
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { startOfWeek, endOfWeek };
  };

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para obtener el número de semana
  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  // Función para buscar nómina de la semana
  const searchWeekPayroll = async () => {
    if (!selectedDate) return;

    setLoading(true);

    try {
      const weekNumber = getWeekNumber(selectedDate);
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);

      const response = await employeesApi.getWeeklyPayroll({
        week: weekNumber,
        year: selectedDate.getFullYear()
      });

      setWeekPayroll(response);
    } catch (error) {
      console.error('Error al cargar nómina semanal:', error);
      // En caso de error, mostrar datos de ejemplo
      const weekNumber = getWeekNumber(selectedDate);
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);

      const mockPayroll = {
        weekNumber,
        startDate: startOfWeek,
        endDate: endOfWeek,
        totalEmployees: 247,
        totalCost: 600000,
        status: 'Aprobado',
        averagePerEmployee: 2429,
        details: [
          { employee: { personalInfo: { firstName: 'Ana', lastName: 'García' }, position: { title: 'Gerente de Marketing' } }, gross: 12000, net: 9500, deductions: 2500 },
          { employee: { personalInfo: { firstName: 'Juan', lastName: 'Pérez' }, position: { title: 'Director de Marketing' } }, gross: 15000, net: 11800, deductions: 3200 },
          { employee: { personalInfo: { firstName: 'María', lastName: 'López' }, position: { title: 'Administrador de RH' } }, gross: 10000, net: 7800, deductions: 2200 },
          { employee: { personalInfo: { firstName: 'Carlos', lastName: 'Rodríguez' }, position: { title: 'Director de RH' } }, gross: 18000, net: 14200, deductions: 3800 },
          { employee: { personalInfo: { firstName: 'Luis', lastName: 'Martínez' }, position: { title: 'Supervisor de Seguridad' } }, gross: 8000, net: 6200, deductions: 1800 }
        ]
      };

      setWeekPayroll(mockPayroll);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para buscar nómina cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      searchWeekPayroll();
    }
  }, [selectedDate]);

  // Navegación de semanas
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
  const weekNumber = getWeekNumber(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Módulo de Nómina</h2>
          <p className="text-gray-600">Gestión completa de nómina con catálogos fiscales MX</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Selector de Semana */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Seleccionar Semana de Nómina</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Fecha
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semana Seleccionada
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="text-sm font-medium text-gray-900">
                Semana {weekNumber} - {selectedDate.getFullYear()}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
              </div>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={searchWeekPayroll}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Buscando...' : 'Buscar Nómina'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resultados de Nómina de la Semana */}
      {weekPayroll && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nómina Semana {weekPayroll.weekNumber} - {weekPayroll.startDate.getFullYear()}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(weekPayroll.startDate)} - {formatDate(weekPayroll.endDate)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                weekPayroll.status === 'Aprobado' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {weekPayroll.status}
              </span>
              <button className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Eye className="h-4 w-4" />
                <span>Ver Detalles</span>
              </button>
            </div>
          </div>

          {/* Resumen de la semana */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Empleados</p>
                  <p className="text-2xl font-bold text-blue-900">{weekPayroll.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Costo Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${weekPayroll.totalCost.toLocaleString('es-MX')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Promedio por Empleado</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${Math.round(weekPayroll.totalCost / weekPayroll.totalEmployees).toLocaleString('es-MX')}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Detalles de empleados */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bruto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deducciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Neto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weekPayroll.details.map((employee: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.employee.personalInfo.firstName} {employee.employee.personalInfo.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${employee.gross.toLocaleString('es-MX')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">
                        -${employee.deductions.toLocaleString('es-MX')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${employee.net.toLocaleString('es-MX')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Ver Recibo
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Métricas de nómina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Periodos Activos</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Total MTD</p>
              <p className="text-2xl font-bold text-gray-900">$2.4M</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recibos Generados</p>
              <p className="text-2xl font-bold text-gray-900">741</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Payroll Run Wizard</h3>
              <p className="text-sm text-gray-500">Proceso completo de cálculo de nómina</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">1. Seleccionar Periodo</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">2. Simular con Diferencias</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">3. Ajustes Manuales</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">4. Aprobar & Cerrar</span>
              <span className="text-sm font-medium text-gray-900">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Simuladores</h3>
              <p className="text-sm text-gray-500">Análisis de impacto en cambios</p>
            </div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium text-gray-900">Cambio de Sueldo</div>
              <div className="text-sm text-gray-500">Impacto en SBC, IMSS, ISR, INFONAVIT</div>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium text-gray-900">Finiquito/Liquidación</div>
              <div className="text-sm text-gray-500">Cálculo de prestaciones y indemnizaciones</div>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-sm font-medium text-gray-900">Horas Extra</div>
              <div className="text-sm text-gray-500">Impacto en nómina y costos</div>
            </button>
          </div>
        </div>
      </div>

      {/* Catálogos fiscales */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catálogos Fiscales MX</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">UMA 2024</h4>
            <p className="text-sm text-gray-600">$103.74 diario</p>
            <p className="text-sm text-gray-600">$3,112.20 mensual</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">SMG 2024</h4>
            <p className="text-sm text-gray-600">$248.93 diario</p>
            <p className="text-sm text-gray-600">$7,467.90 mensual</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">ISR Tabla 2024</h4>
            <p className="text-sm text-gray-600">Actualizada</p>
            <p className="text-sm text-gray-600">Vigente desde enero</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">IMSS Cuotas</h4>
            <p className="text-sm text-gray-600">Empleado: 1.75%</p>
            <p className="text-sm text-gray-600">Patrón: 5.15%</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">INFONAVIT</h4>
            <p className="text-sm text-gray-600">VSM: 5%</p>
            <p className="text-sm text-gray-600">Cuota fija: $1,500</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Feriados DOF</h4>
            <p className="text-sm text-gray-600">15 días oficiales</p>
            <p className="text-sm text-gray-600">2024 actualizado</p>
          </div>
        </div>
      </div>

      {/* Periodos recientes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Periodos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Noviembre 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mensual</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,400,000</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Cerrado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Semana 47</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Semanal</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$600,000</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Aprobado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Ver</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
