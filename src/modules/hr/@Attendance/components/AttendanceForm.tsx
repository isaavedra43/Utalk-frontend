// ============================================================================
// FORMULARIO DE CREACIÓN DE REPORTE DE ASISTENCIA
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { attendanceService } from '../attendanceService';
import { AttendanceReport, CreateAttendanceReportRequest, QuickReportResponse } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Tipo para los empleados en el formulario
type EmployeeFormData = CreateAttendanceReportRequest['employees'][0];

// Función utilitaria para manejar fechas correctamente (evitar problemas de zona horaria)
const formatDateForAPI = (dateInput: string | Date): string => {
  let date: Date;
  
  if (typeof dateInput === 'string') {
    // Si es string, crear fecha en zona horaria local
    const [year, month, day] = dateInput.split('-').map(Number);
    date = new Date(year, month - 1, day); // month es 0-indexado
  } else {
    date = dateInput;
  }
  
  // Formatear como YYYY-MM-DD en zona horaria local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Función para obtener la fecha actual en formato YYYY-MM-DD (zona horaria local)
const getTodayDate = (): string => {
  const today = new Date();
  return formatDateForAPI(today);
};

interface AttendanceFormProps {
  report?: AttendanceReport | null;
  onSubmit: (data: CreateAttendanceReportRequest) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  report,
  onSubmit,
  onCancel
}: AttendanceFormProps) => {
  const [formData, setFormData] = useState<CreateAttendanceReportRequest>({
    date: getTodayDate(), // ✅ Usar función que maneja zona horaria correctamente
    employees: [],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [quickReportLoading, setQuickReportLoading] = useState(false);
  const [employeesData, setEmployeesData] = useState<Array<{
    id: string;
    employeeNumber?: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
  }>>([]); // Para almacenar datos completos de empleados

  // Función para cargar datos completos de empleados
  const loadEmployeesData = async () => {
    try {
      console.log('🔍 AttendanceForm - Cargando datos de empleados...');
      const response = await attendanceService.getEmployees();
      if (response?.data?.employees) {
        setEmployeesData(response.data.employees);
        console.log('✅ AttendanceForm - Datos de empleados cargados:', response.data.employees.length);
      }
    } catch (error) {
      console.error('❌ AttendanceForm - Error cargando empleados:', error);
    }
  };

  // Función para obtener el nombre completo de un empleado
  const getEmployeeFullName = (employeeId: string): string => {
    const employee = employeesData.find((emp: { id: string; personalInfo?: { firstName?: string; lastName?: string } }) => emp.id === employeeId);
    if (employee?.personalInfo) {
      const firstName = employee.personalInfo.firstName || '';
      const lastName = employee.personalInfo.lastName || '';
      return `${firstName} ${lastName}`.trim();
    }
    return `Empleado ${employeeId.slice(0, 8)}`;
  };

  // Función para verificar si un empleado está en vacaciones (TODO: Integrar con módulo de vacaciones)
  const isEmployeeOnVacation = async (employeeId: string, date: string): Promise<boolean> => {
    try {
      // TODO: Implementar consulta al módulo de vacaciones
      // Por ahora retornamos false (no en vacaciones)
      console.log('🔍 AttendanceForm - Verificando vacaciones para:', employeeId, 'en fecha:', date);
      return false;
    } catch (error) {
      console.error('❌ AttendanceForm - Error verificando vacaciones:', error);
      return false;
    }
  };

  // Cargar datos de empleados al montar el componente
  useEffect(() => {
    loadEmployeesData();
  }, []);

  // Monitorear cambios en formData
  useEffect(() => {
    console.log('🔍 FormData cambió:', {
      date: formData.date,
      employeesLength: formData.employees?.length || 0,
      employees: formData.employees,
      notes: formData.notes
    });
  }, [formData]);

  useEffect(() => {
    let isMounted = true;

    if (report) {
      if (isMounted) {
        setFormData({
          date: report.date,
          employees: [], // Se cargarán desde el servicio
          notes: report.notes || ''
        });
      }
    } else {
      // Si es un nuevo reporte, generar automáticamente con plantilla normal
      // para que todos los empleados aparezcan como presentes con horarios pre-llenados
      const generateInitialReport = async () => {
        try {
          console.log('🔄 Generando reporte inicial...');
          if (isMounted) {
            setQuickReportLoading(true);
          }
          
          const todayDate = getTodayDate(); // ✅ Usar función que maneja zona horaria correctamente
          console.log('🔍 Fecha para reporte:', todayDate);
          
          const quickReportData = await attendanceService.generateQuickReport(todayDate, 'normal');
          
          if (!isMounted) {
            console.log('⚠️ Componente desmontado, cancelando actualización');
            return;
          }

          console.log('✅ Reporte inicial generado:', quickReportData);

          // Validar y limpiar los datos antes de establecerlos
          const employeesData = quickReportData.data.employees || [];
          console.log('🔍 Empleados extraídos:', employeesData);
          
          const cleanedEmployees = await Promise.all(
            employeesData.map(async (emp: QuickReportResponse['data']['employees'][0]): Promise<EmployeeFormData> => {
              // Verificar si está en vacaciones
              const onVacation = await isEmployeeOnVacation(emp.employeeId, todayDate);
              
              return {
                employeeId: emp.employeeId,
                status: onVacation ? 'vacation' : 'present', // ✅ PRESENTE por defecto, VACACIONES si corresponde
                clockIn: emp.clockIn || '09:00',
                clockOut: emp.clockOut || '18:00',
                totalHours: emp.totalHours || 8,
                overtimeHours: 0, // ✅ SIEMPRE 0 por defecto (no usar datos del backend)
                breakHours: emp.breakHours || 60,
                notes: emp.notes || ''
              };
            })
          );

          const newFormData = {
            date: todayDate,
            employees: cleanedEmployees,
            notes: quickReportData.data.notes || ''
          };

          console.log('🔍 Estableciendo formData:', newFormData);
          
          if (isMounted) {
            setFormData(newFormData);
            console.log('✅ setFormData ejecutado exitosamente');
          }
        } catch (error) {
          if (!isMounted) {
            return;
          }
          
          // Solo loggear errores reales, no objetos vacíos
          if (error && typeof error === 'object' && Object.keys(error).length > 0) {
            console.error('❌ Error generando reporte inicial:', error);
          }
          
          // Establecer datos por defecto si falla la generación
          if (isMounted) {
            setFormData({
              date: new Date().toISOString().split('T')[0],
              employees: [],
              notes: ''
            });
          }
        } finally {
          if (isMounted) {
            setQuickReportLoading(false);
          }
        }
      };

      generateInitialReport();
    }

    // Cleanup function para evitar actualizaciones de estado en componente desmontado
    return () => {
      isMounted = false;
    };
  }, [report]);

  const handleQuickReport = async (template: 'normal' | 'weekend' | 'holiday') => {
    let isMounted = true;
    
    try {
      if (isMounted) {
        setQuickReportLoading(true);
      }
      
      // ✅ Formatear fecha correctamente antes de enviar al backend
      const formattedDate = formatDateForAPI(formData.date);
      console.log('🔍 Fecha formateada para reporte rápido:', formattedDate);
      
      const quickReportData = await attendanceService.generateQuickReport(formattedDate, template);

      if (!isMounted) {
        console.log('⚠️ Componente desmontado, cancelando actualización de reporte rápido');
        return;
      }

      // Validar y limpiar los datos antes de establecerlos
      const employeesData = quickReportData.data.employees || [];
      const cleanedEmployees = await Promise.all(
        employeesData.map(async (emp: QuickReportResponse['data']['employees'][0]): Promise<EmployeeFormData> => {
          // Verificar si está en vacaciones
          const onVacation = await isEmployeeOnVacation(emp.employeeId, formData.date);
          
          return {
            employeeId: emp.employeeId,
            status: onVacation ? 'vacation' : 'present', // ✅ PRESENTE por defecto, VACACIONES si corresponde
            clockIn: emp.clockIn || '09:00',
            clockOut: emp.clockOut || '18:00',
            totalHours: emp.totalHours || 8,
            overtimeHours: 0, // ✅ SIEMPRE 0 por defecto (no usar datos del backend)
            breakHours: emp.breakHours || 60,
            notes: emp.notes || ''
          };
        })
      );

      if (isMounted) {
        setFormData({
          date: quickReportData.data.date,
          employees: cleanedEmployees,
          notes: quickReportData.data.notes || ''
        });
      }
    } catch (error) {
      if (!isMounted) {
        return;
      }
      
      // Solo loggear errores reales, no objetos vacíos
      if (error && typeof error === 'object' && Object.keys(error).length > 0 && error instanceof Error) {
        console.error('Error generando reporte rápido:', error);
      } else if (error && typeof error === 'string') {
        console.error('Error generando reporte rápido:', error);
      }
    } finally {
      if (isMounted) {
        setQuickReportLoading(false);
      }
      isMounted = false;
    }
  };

  const handleEmployeeStatusChange = (employeeId: string, status: string) => {
    setFormData((prev: CreateAttendanceReportRequest) => ({
      ...prev,
      employees: prev.employees.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, status } : emp
      )
    }));
  };

  const handleEmployeeHoursChange = (employeeId: string, field: string, value: string) => {
    setFormData((prev: CreateAttendanceReportRequest) => ({
      ...prev,
      employees: prev.employees.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, [field]: value } : emp
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isMounted = true;

    console.log('🔍 Enviando formulario:', {
      formData,
      employeesLength: formData.employees?.length || 0,
      hasEmployees: formData.employees && formData.employees.length > 0
    });

    if (!formData.employees || formData.employees.length === 0) {
      alert('Por favor genera o configura la asistencia de los empleados');
      return;
    }

    try {
      if (isMounted) {
        setLoading(true);
      }
      
      // ✅ Formatear fecha correctamente antes de enviar
      const formattedFormData = {
        ...formData,
        date: formatDateForAPI(formData.date)
      };
      
      console.log('🔍 Datos formateados para envío:', {
        fechaOriginal: formData.date,
        fechaFormateada: formattedFormData.date
      });
      
      await onSubmit(formattedFormData);
      
      if (isMounted) {
        console.log('✅ Reporte enviado exitosamente');
      }
    } catch (error) {
      if (!isMounted) {
        return;
      }
      
      // Solo loggear errores reales, no objetos vacíos
      if (error && typeof error === 'object' && Object.keys(error).length > 0 && error instanceof Error) {
        console.error('Error guardando reporte:', error);
        alert(`Error al guardar el reporte: ${error.message}`);
      } else if (error && typeof error === 'string') {
        console.error('Error guardando reporte:', error);
        alert(`Error al guardar el reporte: ${error}`);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
      isMounted = false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick_leave': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {report ? 'Editar Reporte' : 'Nuevo Reporte de Asistencia'}
            </h1>
            <p className="text-gray-600">
              {report ? `Editando reporte del ${formData.date}` : `Crear reporte para ${formData.date}`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Información del Reporte</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Fecha del Reporte</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const inputDate = e.target.value;
                      const formattedDate = formatDateForAPI(inputDate);
                      console.log('🔍 Cambio de fecha:', { inputDate, formattedDate });
                      setFormData((prev: CreateAttendanceReportRequest) => ({ ...prev, date: formattedDate }));
                    }}
                    required
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickReport('normal')}
                    disabled={quickReportLoading}
                    className="w-full"
                  >
                    {quickReportLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Regenerar para esta fecha
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre el reporte..."
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: CreateAttendanceReportRequest) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Generar Reporte Rápido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickReport('normal')}
                disabled={quickReportLoading}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Día Normal
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickReport('weekend')}
                disabled={quickReportLoading}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Fin de Semana
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickReport('holiday')}
                disabled={quickReportLoading}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Día Festivo
              </Button>
            </div>

            {quickReportLoading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Generando plantilla...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employees Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Asistencia de Empleados</span>
              </span>
              <Badge variant="outline">
                {formData.employees.length} empleados
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.employees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No hay empleados configurados. Usa los botones de arriba para generar una plantilla.
                </p>
              </div>
            ) : (
              <>
                {/* Mensaje informativo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Reporte Pre-configurado</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Todos los empleados están marcados como <strong>presentes</strong> con horarios estándar (9:00 AM - 6:00 PM). 
                        Solo edita los casos excepcionales y guarda el reporte.
                      </p>
                    </div>
                  </div>
                </div>
              <div className="space-y-4">
                {(() => {
                  console.log('🔍 Renderizando empleados:', {
                    employees: formData.employees,
                    length: formData.employees?.length,
                    hasEmployees: formData.employees && formData.employees.length > 0
                  });
                  return formData.employees && formData.employees.length > 0 ? (
                    formData.employees.map((employee: EmployeeFormData) => (
                    <div key={employee.employeeId} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {getEmployeeFullName(employee.employeeId)}
                            </h4>
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            ID: {employee.employeeId.slice(0, 8)}
                          </p>
                        </div>

                        <div className="ml-4">
                          <Select
                            value={employee.status}
                            onValueChange={(value) => handleEmployeeStatusChange(employee.employeeId, value)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Presente</SelectItem>
                              <SelectItem value="absent">Ausente</SelectItem>
                              <SelectItem value="late">Tarde</SelectItem>
                              <SelectItem value="vacation">Vacaciones</SelectItem>
                              <SelectItem value="sick_leave">Enfermedad</SelectItem>
                              <SelectItem value="personal_leave">Permiso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                    {employee.status === 'present' && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Horarios de Trabajo</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`clockIn-${employee.employeeId}`} className="text-sm font-medium text-gray-600">
                              Hora de Entrada
                            </Label>
                            <Input
                              id={`clockIn-${employee.employeeId}`}
                              type="time"
                              value={employee.clockIn || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmployeeHoursChange(employee.employeeId, 'clockIn', e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`clockOut-${employee.employeeId}`} className="text-sm font-medium text-gray-600">
                              Hora de Salida
                            </Label>
                            <Input
                              id={`clockOut-${employee.employeeId}`}
                              type="time"
                              value={employee.clockOut || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmployeeHoursChange(employee.employeeId, 'clockOut', e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`overtime-${employee.employeeId}`} className="text-sm font-medium text-gray-600">
                              Horas Extra
                            </Label>
                            <Input
                              id={`overtime-${employee.employeeId}`}
                              type="number"
                              min="0"
                              step="0.5"
                              value={employee.overtimeHours || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmployeeHoursChange(employee.employeeId, 'overtimeHours', e.target.value)}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {employee.status === 'absent' && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-red-700 mb-3">Motivo de Ausencia</h5>
                        <div>
                          <Label htmlFor={`notes-${employee.employeeId}`} className="text-sm font-medium text-gray-600">
                            Especifica el motivo
                          </Label>
                          <Textarea
                            id={`notes-${employee.employeeId}`}
                            value={employee.notes || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEmployeeHoursChange(employee.employeeId, 'notes', e.target.value)}
                            placeholder="Especifica el motivo de la ausencia..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay empleados para mostrar en el reporte.</p>
                      <div className="text-sm text-gray-400 mt-2 space-y-1">
                        <p>Empleados en formData: {formData.employees?.length || 0}</p>
                        <p>FormData completo: {JSON.stringify(formData, null, 2)}</p>
                        <p>Estado loading: {quickReportLoading ? 'Cargando...' : 'Listo'}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600">
                {formData.employees.length > 0 ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {formData.employees.length} empleados configurados
                  </span>
                ) : (
                  <span className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                    Agrega empleados antes de crear el reporte
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="px-6"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={loading || formData.employees.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {report ? 'Actualizar Reporte' : 'Crear Reporte'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
