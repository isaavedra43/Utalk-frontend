import type { Provider } from '../types';

/**
 * Exporta proveedores a formato CSV
 */
export const exportProvidersToCSV = (providers: Provider[]) => {
  if (providers.length === 0) {
    alert('No hay proveedores para exportar');
    return;
  }

  // Crear headers
  const headers = [
    'ID',
    'Nombre',
    'Contacto',
    'Teléfono',
    'Email',
    'Dirección',
    'Estado',
    'Materiales',
    'Notas',
    'Creado',
    'Actualizado'
  ];

  // Crear filas de datos
  const rows = providers.map(provider => [
    provider.id || '',
    provider.name || '',
    provider.contact || '',
    provider.phone || '',
    provider.email || '',
    provider.address || '',
    provider.isActive !== false ? 'Activo' : 'Inactivo',
    provider.materialIds?.join('; ') || '',
    provider.notes?.replace(/\n/g, ' ') || '',
    provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : '',
    provider.updatedAt ? new Date(provider.updatedAt).toLocaleDateString() : ''
  ]);

  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
