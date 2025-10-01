// Types para el módulo de inventario

export interface Piece {
  id: string;
  number: number;
  length: number;
  standardWidth: number;
  linearMeters: number;
  createdAt: Date;
}

export interface Platform {
  id: string;
  platformNumber: string;
  receptionDate: Date;
  materialTypes: string[]; // Cambiado a array para múltiples materiales
  provider: string;
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
}

export interface MaterialOption {
  id: string;
  name: string;
  category?: string;
}

