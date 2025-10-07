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

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: string;
  description?: string;
  url?: string; // URL del archivo en el servidor
}

export interface Carga {
  id: string;
  cargaNumber: string;
  receptionDate: Date;
  platformType: 'provider' | 'client';
  materialTypes: string[]; // Cambiado a array para múltiples materiales
  provider: string;
  providerId?: string; // ID del proveedor para sincronización con backend
  client?: string; // Nombre del cliente (cuando platformType es 'client')
  clientId?: string; // ID del cliente para sincronización con backend
  ticketNumber?: string;
  driver: string;
  standardWidth: number;
  pieces: Piece[];
  totalLinearMeters: number;
  totalLength: number;
  status: 'in_progress' | 'completed' | 'exported';
  notes?: string;
  createdBy?: string; // Usuario que creó la carga
  createdByName?: string; // Nombre del agente que creó la carga
  createdAt: Date;
  updatedAt: Date;
  needsSync?: boolean; // Marcar cargas que necesitan sincronización con backend
  evidence?: Evidence[]; // ✅ NUEVO: Evidencias adjuntas a la carga
}

export interface InventorySettings {
  defaultStandardWidth: number;
  autoSaveEnabled: boolean;
  showPieceNumbers: boolean;
}

export interface ExportData {
  carga: Carga;
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

// Alias para compatibilidad temporal
export type Platform = Carga;

