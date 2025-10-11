// ============================================================================
// FORMULARIO DE CREACIÓN DE REPORTE DE ASISTENCIA
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Zap,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { attendanceService } from '../attendanceService';
import { AttendanceReport, CreateAttendanceReportRequest } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AttendanceFormProps {
  report?: AttendanceReport | null;
  onSubmit: (data: CreateAttendanceReportRequest) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  report,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateAttendanceReportRequest>({
    date: new Date().toISOString().split('T')[0],
    employees: [],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [quickReportLoading, setQuickReportLoading] = useState(false);

  useEffect(() => {
    if (report) {
      setFormData({
        date: report.date,
        employees: [], // Se cargarán desde el servicio
        notes: report.notes || ''
      });
    }
  }, [report]);

  const handleQuickReport = async (template: 'normal' | 'weekend' | 'holiday') => {
    try {
      setQuickReportLoading(true);
      const quickReportData = await attendanceService.generateQuickReport(formData.date, template);
      setFormData(quickReportData);
    } catch (error) {
      console.error('Error generando reporte rápido:', error);
    } finally {
      setQuickReportLoading(false);
    }
  };

  const handleEmployeeStatusChange = (employeeId: string, status: any) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.map(emp =>
        emp.employeeId === employeeId ? { ...emp, status } : emp
      )
    }));
  };

  const handleEmployeeHoursChange = (employeeId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.map(emp =>
        emp.employeeId === employeeId ? { ...emp, [field]: value } : emp
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.employees.length === 0) {
      alert('Por favor genera o configura la asistencia de los empleados');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error guardando reporte:', error);
    } finally {
      setLoading(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha del Reporte</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre el reporte..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              <div className="space-y-4">
                {formData.employees.map((employee, index) => (
                  <div key={employee.employeeId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Empleado #{employee.employeeId}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Estado: <Badge className={getStatusColor(employee.status)}>
                            {employee.status}
                          </Badge>
                        </p>
                      </div>

                      <Select
                        value={employee.status}
                        onValueChange={(value) => handleEmployeeStatusChange(employee.employeeId, value)}
                      >
                        <SelectTrigger className="w-40">
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

                    {employee.status === 'present' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`clockIn-${employee.employeeId}`}>Hora de Entrada</Label>
                          <Input
                            id={`clockIn-${employee.employeeId}`}
                            type="time"
                            value={employee.clockIn || ''}
                            onChange={(e) => handleEmployeeHoursChange(employee.employeeId, 'clockIn', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`clockOut-${employee.employeeId}`}>Hora de Salida</Label>
                          <Input
                            id={`clockOut-${employee.employeeId}`}
                            type="time"
                            value={employee.clockOut || ''}
                            onChange={(e) => handleEmployeeHoursChange(employee.employeeId, 'clockOut', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`overtime-${employee.employeeId}`}>Horas Extra</Label>
                          <Input
                            id={`overtime-${employee.employeeId}`}
                            type="number"
                            min="0"
                            step="0.5"
                            value={employee.overtimeHours || ''}
                            onChange={(e) => handleEmployeeHoursChange(employee.employeeId, 'overtimeHours', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}

                    {employee.status === 'absent' && (
                      <div>
                        <Label htmlFor={`notes-${employee.employeeId}`}>Motivo de Ausencia</Label>
                        <Textarea
                          id={`notes-${employee.employeeId}`}
                          value={employee.notes || ''}
                          onChange={(e) => handleEmployeeHoursChange(employee.employeeId, 'notes', e.target.value)}
                          placeholder="Especifica el motivo de la ausencia..."
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loading || formData.employees.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {report ? 'Actualizar Reporte' : 'Crear Reporte'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
