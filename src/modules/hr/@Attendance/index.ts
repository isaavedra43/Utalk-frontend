// ============================================================================
// EXPORTACIONES DEL MÓDULO DE ASISTENCIA
// ============================================================================

export { default as AttendanceModule } from './AttendanceModule';
export { default as attendanceService } from './attendanceService';
export { useAttendance } from './hooks/useAttendance';
export { useAttendancePermissions } from './hooks/useAttendancePermissions';
export { useAttendanceDashboard } from './hooks/useAttendanceDashboard';
export { useAttendanceMetrics } from './hooks/useAttendanceMetrics';
export * from './types';
export * from './components/AttendanceList';
export * from './components/AttendanceDetail';
export * from './components/AttendanceForm';
export * from './components/AttendanceStats';
export { default as AttendanceDashboard } from './components/AttendanceDashboard';
