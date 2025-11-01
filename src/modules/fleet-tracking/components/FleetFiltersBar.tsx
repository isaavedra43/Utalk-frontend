import React from 'react';
import {
  AlertTriangle,
  Filter,
  Fuel,
  LineChart,
  Radar,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import {
  FleetFilterState,
  FleetViewMode,
  FuelType,
  RiskLevel,
  VehicleStatus,
} from '../types';

const STATUS_OPTIONS: { id: VehicleStatus; label: string }[] = [
  { id: 'en_ruta', label: 'En ruta' },
  { id: 'detenido', label: 'Detenido' },
  { id: 'en_base', label: 'En base' },
  { id: 'mantenimiento', label: 'Mantenimiento' },
  { id: 'alerta', label: 'Alerta' },
];

const FUEL_OPTIONS: { id: FuelType; label: string }[] = [
  { id: 'diesel', label: 'Diesel' },
  { id: 'gasolina', label: 'Gasolina' },
  { id: 'gas_natural', label: 'Gas Natural' },
  { id: 'hibrido', label: 'Híbrido' },
  { id: 'electrico', label: 'Eléctrico' },
];

const RISK_OPTIONS: { id: RiskLevel; label: string }[] = [
  { id: 'alto', label: 'Alto' },
  { id: 'medio', label: 'Medio' },
  { id: 'bajo', label: 'Bajo' },
];

const VIEW_OPTIONS: { id: FleetViewMode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'operaciones',
    label: 'Operaciones',
    description: 'Visión general de rutas, cargas y rendimiento',
    icon: <Radar className="h-4 w-4" />,
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    description: 'Alertas críticas, geocercas y protocolos',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    description: 'Recordatorios, talleres y diagnósticos',
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    description: 'Costos por vehículo, consumo y proyecciones',
    icon: <LineChart className="h-4 w-4" />,
  },
];

type ToggleableFilterKey = 'statuses' | 'fuelTypes' | 'riskLevels';

interface FleetFiltersBarProps {
  filters: FleetFilterState;
  onFiltersChange: (filters: FleetFilterState) => void;
  viewMode: FleetViewMode;
  onViewModeChange: (mode: FleetViewMode) => void;
}

export const FleetFiltersBar: React.FC<FleetFiltersBarProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}) => {
  const handleToggle = <K extends ToggleableFilterKey>(
    list: FleetFilterState[K],
    value: FleetFilterState[K][number],
    key: K,
  ) => {
    const isActive = list.includes(value);
    const updated = isActive ? list.filter((item) => item !== value) : [...list, value];

    onFiltersChange({
      ...filters,
      [key]: updated as FleetFilterState[K],
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[1.8fr_1fr] gap-4">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Filter className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Panel de control de flotilla</p>
                    <p className="text-sm text-gray-500">
                      Ajusta la vista para operaciones, seguridad y finanzas en tiempo real
                    </p>
                  </div>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.textSearch}
                    onChange={(event) =>
                      onFiltersChange({
                        ...filters,
                        textSearch: event.target.value,
                      })
                    }
                    placeholder="Buscar unidad, operador, cliente o envío"
                    className="w-full bg-gray-50 border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-sm rounded-2xl pl-10 py-2.5 text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-2">
                {VIEW_OPTIONS.map((option) => {
                  const isActive = option.id === viewMode;
                  return (
                    <button
                      key={option.id}
                      onClick={() => onViewModeChange(option.id)}
                      className={`flex flex-col items-start gap-1 rounded-2xl border p-3 transition-all text-left min-h-[90px] ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/60'
                      }`}
                    >
                      <span className={`flex items-center gap-2 text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {option.icon}
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 leading-snug">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 lg:p-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-blue-100 shadow-sm">
                <div className="mt-1">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Alertas críticas</p>
                  <p className="text-xs text-gray-500">Prioriza unidades con eventos de seguridad o botón de pánico.</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          showAlertsOnly: !filters.showAlertsOnly,
                        })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        filters.showAlertsOnly
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {filters.showAlertsOnly ? 'Filtrando alertas' : 'Incluir alertas'}
                    </button>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                <div className="mt-1">
                  <Fuel className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Viajes activos</p>
                  <p className="text-xs text-gray-500">Identifica unidades con asignación y ETA comprometida.</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          showWithActiveShipmentsOnly: !filters.showWithActiveShipmentsOnly,
                        })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        filters.showWithActiveShipmentsOnly
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {filters.showWithActiveShipmentsOnly ? 'Solo envíos activos' : 'Incluir envíos'}
                    </button>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="md:col-span-1 xl:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Radar className="h-3.5 w-3.5" />
            </span>
            Estado operativo
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isActive = filters.statuses.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleToggle(filters.statuses, option.id, 'statuses')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-1 xl:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Fuel className="h-3.5 w-3.5" />
            </span>
            Tipo de energía
          </p>
          <div className="flex flex-wrap gap-2">
            {FUEL_OPTIONS.map((option) => {
              const isActive = filters.fuelTypes.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleToggle(filters.fuelTypes, option.id, 'fuelTypes')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-1 xl:col-span-1 bg-white border border-gray-200 rounded-3xl shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
            Nivel de riesgo
          </p>
          <div className="flex flex-wrap gap-2">
            {RISK_OPTIONS.map((option) => {
              const isActive = filters.riskLevels.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleToggle(filters.riskLevels, option.id, 'riskLevels')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
