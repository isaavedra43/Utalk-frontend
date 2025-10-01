// Datos mock para el módulo de inventario

import type { Provider, MaterialOption } from '../types';

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'prov-001',
    name: 'Mármoles del Norte',
    contact: 'Juan Pérez',
    phone: '+52 81 1234-5678'
  },
  {
    id: 'prov-002', 
    name: 'Canteras del Sur',
    contact: 'María González',
    phone: '+52 33 9876-5432'
  },
  {
    id: 'prov-003',
    name: 'Piedras Preciosas SA',
    contact: 'Carlos Rodríguez',
    phone: '+52 55 2468-1357'
  },
  {
    id: 'prov-004',
    name: 'Granitos y Mármoles',
    contact: 'Ana Martínez',
    phone: '+52 81 3691-2580'
  },
  {
    id: 'prov-005',
    name: 'Materiales de Construcción López',
    contact: 'Roberto López',
    phone: '+52 33 7410-9632'
  }
];

export const MOCK_MATERIALS: MaterialOption[] = [
  // Mármoles
  {
    id: 'mat-001',
    name: 'Mármol Blanco Carrara',
    category: 'Mármol'
  },
  {
    id: 'mat-002',
    name: 'Mármol Travertino',
    category: 'Mármol'
  },
  {
    id: 'mat-003',
    name: 'Mármol Negro Marquina',
    category: 'Mármol'
  },
  {
    id: 'mat-004',
    name: 'Mármol Crema Marfil',
    category: 'Mármol'
  },
  {
    id: 'mat-005',
    name: 'Mármol Rosa Portugués',
    category: 'Mármol'
  },
  
  // Granitos
  {
    id: 'mat-006',
    name: 'Granito Gris',
    category: 'Granito'
  },
  {
    id: 'mat-007',
    name: 'Granito Negro Absoluto',
    category: 'Granito'
  },
  {
    id: 'mat-008',
    name: 'Granito Blanco Dallas',
    category: 'Granito'
  },
  {
    id: 'mat-009',
    name: 'Granito Verde Ubatuba',
    category: 'Granito'
  },
  
  // Cuarzos
  {
    id: 'mat-010',
    name: 'Cuarzo Blanco',
    category: 'Cuarzo'
  },
  {
    id: 'mat-011',
    name: 'Cuarzo Gris',
    category: 'Cuarzo'
  },
  {
    id: 'mat-012',
    name: 'Cuarzo Negro',
    category: 'Cuarzo'
  },
  
  // Piedras Naturales
  {
    id: 'mat-013',
    name: 'Piedra Caliza',
    category: 'Piedra Natural'
  },
  {
    id: 'mat-014',
    name: 'Piedra Pizarra',
    category: 'Piedra Natural'
  },
  {
    id: 'mat-015',
    name: 'Piedra Basalto',
    category: 'Piedra Natural'
  },
  {
    id: 'mat-016',
    name: 'Piedra Onix',
    category: 'Piedra Natural'
  },
  
  // Otros
  {
    id: 'mat-017',
    name: 'Concreto Estampado',
    category: 'Otros'
  },
  {
    id: 'mat-018',
    name: 'Porcelanato',
    category: 'Otros'
  },
  {
    id: 'mat-019',
    name: 'Cerámica',
    category: 'Otros'
  }
];

// Función para obtener materiales por categoría
export const getMaterialsByCategory = () => {
  const categories: { [key: string]: MaterialOption[] } = {};
  
  MOCK_MATERIALS.forEach(material => {
    const category = material.category || 'Otros';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(material);
  });
  
  return categories;
};

// Función para buscar proveedores
export const searchProviders = (query: string): Provider[] => {
  if (!query.trim()) return MOCK_PROVIDERS;
  
  const lowercaseQuery = query.toLowerCase();
  return MOCK_PROVIDERS.filter(provider => 
    provider.name.toLowerCase().includes(lowercaseQuery) ||
    provider.contact?.toLowerCase().includes(lowercaseQuery)
  );
};

// Función para buscar materiales
export const searchMaterials = (query: string): MaterialOption[] => {
  if (!query.trim()) return MOCK_MATERIALS;
  
  const lowercaseQuery = query.toLowerCase();
  return MOCK_MATERIALS.filter(material => 
    material.name.toLowerCase().includes(lowercaseQuery) ||
    material.category?.toLowerCase().includes(lowercaseQuery)
  );
};
