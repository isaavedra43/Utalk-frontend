export type FuelType = 'diesel' | 'gasolina' | 'gas_natural' | 'hibrido' | 'electrico';

export type VehicleStatus =
  | 'en_ruta'
  | 'detenido'
  | 'en_base'
  | 'mantenimiento'
  | 'alerta';

export type RiskLevel = 'alto' | 'medio' | 'bajo';

export type SecurityTag =
  | 'panic_button'
  | 'desvio_ruta'
  | 'detencion_no_programada'
  | 'apertura_puerta'
  | 'geocerca';

export interface FleetCoordinate {
  lat: number;
  lng: number;
  timestamp: string;
  speedKmH?: number;
  heading?: number;
}

export interface TirePressure {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
}

export interface VehicleTelemetry {
  speedKmH: number;
  avgSpeedKmH: number;
  engineHours: number;
  odometerKm: number;
  coolantTempC: number;
  fuelLevelPercentage: number;
  batteryVoltage: number;
  loadKg: number;
  tirePressurePsi: TirePressure;
  harshEvents24h: number;
  drivingScore: number;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  rating: number;
  experienceYears: number;
  shift: 'matutino' | 'vespertino' | 'nocturno';
  assignedSince: string;
  certifications: string[];
}

export interface ShipmentLeg {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface VehicleShipment {
  id: string;
  type: 'última_milla' | 'línea_troncal' | 'cruce_frontera';
  client: string;
  origin: string;
  destination: string;
  eta: string;
  status: 'en_camino' | 'pendiente' | 'entregado' | 'incidencia';
  priority: 'alta' | 'media' | 'baja';
  cargo: {
    description: string;
    weightKg: number;
    pallets: number;
    valueUsd: number;
  };
  checkpoints: ShipmentLeg[];
}

export interface MaintenanceReminder {
  id: string;
  description: string;
  type: 'correctivo' | 'preventivo' | 'inspección';
  dueInKm: number;
  dueDate: string;
  priority: 'alta' | 'media' | 'baja';
  workshop?: string;
}

export interface ExpenseBreakdown {
  monthToDateUsd: number;
  lastMaintenanceUsd: number;
  fuelMonthUsd: number;
  tollsMonthUsd: number;
  averageCostPerKmUsd: number;
}

export interface SecurityEvent {
  id: string;
  type: SecurityTag;
  severity: RiskLevel;
  message: string;
  timestamp: string;
  resolved: boolean;
  actionTaken?: string;
}

export interface FuelProfile {
  type: FuelType;
  levelPercentage: number;
  autonomyKm: number;
  consumptionL100Km: number;
  refillInKm: number;
  efficiencyVsFleet: number;
}

export interface ControlCenter {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  radiusMeters: number;
  type: 'almacen' | 'planta' | 'puerto' | 'cliente_estratégico';
}

export interface FleetVehicle {
  id: string;
  code: string;
  alias: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: VehicleStatus;
  riskLevel: RiskLevel;
  tags: SecurityTag[];
  lastUpdate: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    address: string;
  };
  driver: DriverInfo;
  telemetry: VehicleTelemetry;
  fuel: FuelProfile;
  expenses: ExpenseBreakdown;
  maintenance: MaintenanceReminder[];
  activeShipments: VehicleShipment[];
  securityEvents: SecurityEvent[];
  routeHistory: FleetCoordinate[];
}

export interface FleetSummary {
  totalVehicles: number;
  onRoute: number;
  idle: number;
  maintenance: number;
  alerts: number;
  totalKmToday: number;
  totalFuelConsumptionL: number;
  averageCostPerKmUsd: number;
  emissionsKgCo2: number;
  predictedSavingsUsd: number;
  energyDistribution: {
    diesel: number;
    gasolina: number;
    gas_natural: number;
    hibrido: number;
    electrico: number;
  };
  safetyScore: number;
}

export interface ComplianceStatus {
  insuranceUpToDate: number;
  maintenanceOnSchedule: number;
  driversWithValidDocs: number;
  gpsSignalStable: number;
}

export interface FleetTimelineEvent {
  id: string;
  title: string;
  description: string;
  category: 'operaciones' | 'seguridad' | 'mantenimiento' | 'finanzas';
  timestamp: string;
  relatedVehicleId?: string;
  severity: RiskLevel;
}

export interface FleetFilterState {
  statuses: VehicleStatus[];
  fuelTypes: FuelType[];
  riskLevels: RiskLevel[];
  showAlertsOnly: boolean;
  showWithActiveShipmentsOnly: boolean;
  textSearch: string;
}

export type FleetViewMode = 'operaciones' | 'seguridad' | 'mantenimiento' | 'finanzas';
