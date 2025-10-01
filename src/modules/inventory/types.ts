// Types para el módulo de inventario

export interface Piece {
  id: string;
  number: number;
  length: number;
  standardWidth: number;
  linearMeters: number;
  material: string; // Material específico de esta pieza
  createdAt: Date;
}

export interface Platform {
  id: string;
  platformNumber: string;
  receptionDate: Date;
  materialTypes: string[]; // Cambiado a array para múltiples materiales
  provider: string;
  providerId?: string; // ID del proveedor para sincronización con backend
  driver: string;
  standardWidth: number;
  pieces: Piece[];
  totalLinearMeters: number;
  totalLength: number;
  status: 'in_progress' | 'completed' | 'exported';
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventorySettings {
  defaultStandardWidth: number;
  autoSaveEnabled: boolean;
  showPieceNumbers: boolean;
}

export interface ExportData {
  platform: Platform;
  exportDate: Date;
  exportedBy?: string;
}

export interface Provider {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  materialIds: string[]; // IDs de los materiales que maneja este proveedor
}

export interface MaterialOption {
  id: string;
  name: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  providerIds: string[]; // IDs de los proveedores que manejan este material
}

export interface ModuleConfiguration {
  providers: Provider[];
  materials: MaterialOption[];
  settings: {
    defaultStandardWidth: number;
    autoSaveEnabled: boolean;
    showPieceNumbers: boolean;
    allowMultipleMaterials: boolean;
    requireMaterialSelection: boolean;
    defaultMaterialCategories: string[];
  };
  lastUpdated: Date;
}

