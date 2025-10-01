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
  materialType: string;
  standardWidth: number;
  pieces: Piece[];
  totalLinearMeters: number;
  totalLength: number;
  status: 'in_progress' | 'completed' | 'exported';
  notes?: string;
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

