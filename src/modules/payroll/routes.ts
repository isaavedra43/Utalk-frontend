// ===================================================================
// RUTAS DEL MÓDULO DE NÓMINA GENERAL
// ===================================================================

import { lazy } from 'react';

// Importación lazy de componentes para code-splitting
const PayrollGeneralView = lazy(() => import('./components/PayrollGeneralView'));

// Definición de rutas del módulo
export const payrollRoutes = [
  {
    path: '/payroll',
    name: 'Nómina General',
    component: PayrollGeneralView,
    exact: true,
    permissions: ['payroll.read'],
    meta: {
      title: 'Nómina General',
      description: 'Gestión de períodos de nómina y procesamiento masivo',
      breadcrumb: [
        { label: 'Inicio', path: '/' },
        { label: 'Nómina General', path: '/payroll' }
      ]
    }
  }
];

// Configuración de navegación
export const payrollNavigation = {
  label: 'Nómina General',
  path: '/payroll',
  icon: 'Calculator',
  permissions: ['payroll.read'],
  order: 60,
  children: []
};
