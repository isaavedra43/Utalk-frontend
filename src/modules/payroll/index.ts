// ===================================================================
// ÍNDICE DEL MÓDULO DE NÓMINA GENERAL
// ===================================================================

// Componentes principales
export { default as PayrollGeneralView } from './components/PayrollGeneralView';
export { default as PayrollPeriodCard } from './components/PayrollPeriodCard';
export { default as PayrollEmployeesTable } from './components/PayrollEmployeesTable';
export { default as CreatePeriodModal } from './components/CreatePeriodModal';
export { default as PayrollStats } from './components/PayrollStats';
export { default as PayrollFilters } from './components/PayrollFilters';

// Rutas del módulo
export { payrollRoutes } from './routes';

// Configuración del módulo
export const payrollModuleConfig = {
  name: 'payroll',
  displayName: 'Nómina General',
  description: 'Gestión completa de períodos de nómina y procesamiento masivo',
  icon: 'Calculator',
  permissions: [
    'payroll.read',
    'payroll.write',
    'payroll.process',
    'payroll.approve',
    'payroll.export'
  ],
  routes: [
    {
      path: '/payroll',
      name: 'Nómina General',
      component: 'PayrollGeneralView'
    }
  ]
};
