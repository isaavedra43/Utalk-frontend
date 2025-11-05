import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BellRing,
  Download,
  Layers3,
  Menu,
  RefreshCcw,
  Satellite,
  ShieldCheck,
} from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';
import { FleetFiltersBar } from './components/FleetFiltersBar';
import { FleetMap } from './components/FleetMap';
import { VehicleList } from './components/VehicleList';
import { VehicleDetailPanel } from './components/VehicleDetailPanel';
import {
  complianceStatus,
  controlCenters,
  fleetSummary,
  fleetVehicles,
  upcomingEvents,
} from './data/mockFleetData';
import {
  FleetFilterState,
  FleetVehicle,
  FleetViewMode,
  FuelType,
  RiskLevel,
} from './types';

const DEFAULT_FILTERS: FleetFilterState = {
  statuses: ['en_ruta', 'detenido', 'en_base', 'mantenimiento', 'alerta'],
  fuelTypes: ['diesel', 'gasolina', 'gas_natural', 'hibrido', 'electrico'],
  riskLevels: ['alto', 'medio', 'bajo'],
  showAlertsOnly: false,
  showWithActiveShipmentsOnly: false,
  textSearch: '',
};

const filterBySearch = (vehicle: FleetVehicle, query: string) => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return (
    vehicle.alias.toLowerCase().includes(normalized) ||
    vehicle.code.toLowerCase().includes(normalized) ||
    vehicle.driver.name.toLowerCase().includes(normalized) ||
    vehicle.location.city.toLowerCase().includes(normalized) ||
    vehicle.location.state.toLowerCase().includes(normalized) ||
    vehicle.activeShipments.some((shipment) =>
      [shipment.client, shipment.origin, shipment.destination].some((field) =>
        field.toLowerCase().includes(normalized),
      ),
    )
  );
};

const FleetTrackingModule: React.FC = () => {
  const { openMenu } = useMobileMenuContext();
  const [filters, setFilters] = useState<FleetFilterState>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<FleetViewMode>('operaciones');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(fleetVehicles[0]?.id ?? null);

  const filteredVehicles = useMemo(() => {
    return fleetVehicles.filter((vehicle) => {
      const matchesStatus = filters.statuses.includes(vehicle.status);
      const matchesFuel = filters.fuelTypes.includes(vehicle.fuel.type as FuelType);
      const matchesRisk = filters.riskLevels.includes(vehicle.riskLevel as RiskLevel);
      const matchesAlerts = filters.showAlertsOnly
        ? vehicle.securityEvents.some((event) => !event.resolved)
        : true;
      const matchesShipments = filters.showWithActiveShipmentsOnly ? vehicle.activeShipments.length > 0 : true;
      const matchesSearch = filterBySearch(vehicle, filters.textSearch);

      return matchesStatus && matchesFuel && matchesRisk && matchesAlerts && matchesShipments && matchesSearch;
    });
  }, [filters]);

  useEffect(() => {
    if (filteredVehicles.length === 0) {
      setSelectedVehicleId(null);
      return;
    }

    if (!selectedVehicleId && filteredVehicles.length > 0) {
      setSelectedVehicleId(filteredVehicles[0].id);
    }

    if (
      selectedVehicleId &&
      filteredVehicles.length > 0 &&
      !filteredVehicles.some((vehicle) => vehicle.id === selectedVehicleId)
    ) {
      setSelectedVehicleId(filteredVehicles[0].id);
    }
  }, [filteredVehicles, selectedVehicleId]);

  const selectedVehicle = useMemo(
    () => fleetVehicles.find((vehicle) => vehicle.id === selectedVehicleId) || null,
    [selectedVehicleId],
  );

  const totalAlerts = useMemo(
    () =>
      fleetVehicles.reduce(
        (count, vehicle) => count + vehicle.securityEvents.filter((event) => !event.resolved).length,
        0,
      ),
    [],
  );

  const activeShipments = useMemo(
    () =>
      fleetVehicles.reduce((sum, vehicle) => sum + vehicle.activeShipments.length, 0),
    [],
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Header móvil */}
      <div className="lg:hidden sticky top-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 shadow-sm"
              title="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase text-blue-500">Telemetría unificada</p>
              <h1 className="text-lg font-semibold text-gray-900">Rastreo de flotilla en tiempo real</h1>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            <Download className="h-4 w-4" />
            Reporte
          </button>
        </div>
      </div>

      {/* Contenedor con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="hidden lg:flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wide text-blue-500">Telemetría unificada · Seguridad avanzada</p>
            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-3xl font-semibold text-gray-900">Centro de rastreo de flotillas</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                <Satellite className="h-3.5 w-3.5" />
                12 satélites activos
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl">
              Visualiza unidades, combustible, operadores, envíos y alertas de seguridad en un tablero consolidado inspirado en
              plataformas líderes del mercado.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 shadow-sm">
              <RefreshCcw className="h-4 w-4" />
              Reiniciar vista
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Exportar reporte
            </button>
          </div>
        </header>

        {/* KPIs principales */}
        <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="rounded-3xl border border-blue-100 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-blue-500 font-semibold">Flotilla activa</p>
                <p className="text-2xl font-semibold text-gray-900">{fleetSummary.totalVehicles}</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{fleetSummary.onRoute} en ruta · {fleetSummary.maintenance} en mantenimiento</p>
          </article>

          <article className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-emerald-500 font-semibold">Eficiencia energética</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {fleetSummary.averageCostPerKmUsd.toFixed(2)} USD/km
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Consumo total {fleetSummary.totalFuelConsumptionL.toLocaleString()} L</p>
          </article>

          <article className="rounded-3xl border border-amber-100 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-amber-500 font-semibold">Alertas críticas</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAlerts}</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <BellRing className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Protocolos activos con monitoreo y Guardia Nacional</p>
          </article>

          <article className="rounded-3xl border border-purple-100 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-purple-500 font-semibold">Envíos comprometidos</p>
                <p className="text-2xl font-semibold text-gray-900">{activeShipments}</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Integrados con control de costos y mantenimiento</p>
          </article>
        </section>

        <FleetFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <section className="grid 2xl:grid-cols-[1.7fr_1fr] gap-6">
          <div className="space-y-6">
            <FleetMap
              vehicles={filteredVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              controlCenters={controlCenters}
              viewMode={viewMode}
            />
          </div>

          <div className="space-y-6">
            <VehicleList
              vehicles={filteredVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              viewMode={viewMode}
            />

            <aside className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Cumplimiento operativo</h3>
                  <p className="text-xs text-gray-500">Documentación y sensores de la flotilla</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Seguro vigente</p>
                  <p className="text-lg font-semibold text-gray-900">{complianceStatus.insuranceUpToDate}%</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Mantenimientos al día</p>
                  <p className="text-lg font-semibold text-gray-900">{complianceStatus.maintenanceOnSchedule}%</p>
                </div>
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Documentos de pilotos</p>
                  <p className="text-lg font-semibold text-gray-900">{complianceStatus.driversWithValidDocs}%</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Señal GPS estable</p>
                  <p className="text-lg font-semibold text-gray-900">{complianceStatus.gpsSignalStable}%</p>
                </div>
              </div>
            </aside>

            <aside className="rounded-3xl border border-blue-100 bg-blue-50/40 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-700">Próximas acciones coordinadas</h3>
                  <p className="text-xs text-blue-600">Agenda compartida con monitoreo y operaciones</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-blue-700">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="rounded-2xl bg-white/80 border border-blue-100 p-3">
                    <p className="font-semibold text-blue-800">{event.title}</p>
                    <p>{event.description}</p>
                    <p>{new Date(event.timestamp).toLocaleString('es-MX')}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <VehicleDetailPanel vehicle={selectedVehicle} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
};

export default FleetTrackingModule;
