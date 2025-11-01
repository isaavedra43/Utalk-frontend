import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Fuel,
  Gauge,
  MapPin,
  Navigation,
  ShieldCheck,
  ShieldPlus,
  Timer,
  Wrench,
} from 'lucide-react';
import { FleetVehicle, FleetViewMode } from '../types';

type DetailTab = 'resumen' | 'seguridad' | 'mantenimiento' | 'finanzas';

interface VehicleDetailPanelProps {
  vehicle: FleetVehicle | null;
  viewMode: FleetViewMode;
}

const TABS: { id: DetailTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'resumen',
    label: 'Resumen en vivo',
    icon: <Gauge className="h-4 w-4" />,
    description: 'Telemetría, ruta y conductor',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: <ShieldCheck className="h-4 w-4" />,
    description: 'Alertas críticas y protocolos',
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    icon: <Wrench className="h-4 w-4" />,
    description: 'Servicios programados y sensores',
  },
  {
    id: 'finanzas',
    label: 'Costos',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Gastos, consumo y presupuesto',
  },
];

const DEFAULT_TAB_BY_VIEW: Record<FleetViewMode, DetailTab> = {
  operaciones: 'resumen',
  seguridad: 'seguridad',
  mantenimiento: 'mantenimiento',
  finanzas: 'finanzas',
};

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({ vehicle, viewMode }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('resumen');

  useEffect(() => {
    setActiveTab(DEFAULT_TAB_BY_VIEW[viewMode]);
  }, [viewMode]);

  useEffect(() => {
    // Volver al resumen al cambiar de unidad
    setActiveTab(DEFAULT_TAB_BY_VIEW[viewMode]);
  }, [vehicle?.id, viewMode]);

  const openAlerts = useMemo(
    () => vehicle?.securityEvents.filter((event) => !event.resolved) || [],
    [vehicle?.securityEvents],
  );

  if (!vehicle) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center text-gray-500">
        <p className="text-lg font-semibold text-gray-700 mb-2">Selecciona una unidad</p>
        <p className="text-sm">
          Elige un vehículo de la lista para visualizar telemetría, rutas, alertas de seguridad, costos y mantenimientos en
          tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">Unidad seleccionada</p>
            <h2 className="text-xl font-semibold text-gray-900">{vehicle.alias}</h2>
            <p className="text-sm text-gray-500">
              {vehicle.brand} {vehicle.model} · Placas {vehicle.plate}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 space-y-1">
            <p>
              Estatus:{' '}
              <span className="font-semibold text-gray-700 capitalize">{vehicle.status.replace('_', ' ')}</span>
            </p>
            <p>
              Riesgo:{' '}
              <span className="font-semibold text-gray-700 capitalize">{vehicle.riskLevel}</span>
            </p>
            <p className="flex items-center gap-1 justify-end">
              <CalendarDays className="h-3.5 w-3.5" />
              Última actualización{' '}
              {new Date(vehicle.lastUpdate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
            <p className="text-[11px] uppercase text-blue-600 font-semibold">Telemetría en vivo</p>
            <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.speedKmH} km/h</p>
            <p className="text-xs text-gray-500">Velocidad instantánea</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
            <p className="text-[11px] uppercase text-emerald-600 font-semibold">Combustible</p>
            <p className="text-lg font-semibold text-gray-900">{vehicle.fuel.levelPercentage}%</p>
            <p className="text-xs text-gray-500">Autonomía {vehicle.fuel.autonomyKm} km</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3">
            <p className="text-[11px] uppercase text-purple-600 font-semibold">Carga útil</p>
            <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.loadKg.toLocaleString()} kg</p>
            <p className="text-xs text-gray-500">Operador {vehicle.driver.name}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
            <p className="text-[11px] uppercase text-amber-600 font-semibold">Alertas abiertas</p>
            <p className="text-lg font-semibold text-gray-900">{openAlerts.length}</p>
            <p className="text-xs text-gray-500">Eventos de seguridad pendientes</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50/80">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm transition-all border ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                  : 'border-transparent text-gray-600 hover:border-blue-200 hover:bg-blue-50/60'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                <span className="font-semibold">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === 'resumen' && (
          <div className="space-y-5">
            <section className="grid md:grid-cols-2 gap-4">
              <article className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Telemetría inteligente</h3>
                    <p className="text-xs text-gray-500">Sensores y hábitos de conducción</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                    <p className="text-[11px] uppercase text-blue-600 font-semibold">Velocidad promedio</p>
                    <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.avgSpeedKmH} km/h</p>
                    <p className="text-xs text-gray-500">Últimas 24 h</p>
                  </div>
                  <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3">
                    <p className="text-[11px] uppercase text-purple-600 font-semibold">Horas motor</p>
                    <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.engineHours.toLocaleString()} h</p>
                    <p className="text-xs text-gray-500">Acumulado</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <p className="text-[11px] uppercase text-emerald-600 font-semibold">Presión neumáticos</p>
                    <p className="text-sm font-semibold text-gray-900">FL {vehicle.telemetry.tirePressurePsi.frontLeft} psi · FR {vehicle.telemetry.tirePressurePsi.frontRight} psi</p>
                    <p className="text-xs text-gray-500">Traseros {vehicle.telemetry.tirePressurePsi.rearLeft}/{vehicle.telemetry.tirePressurePsi.rearRight} psi</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
                    <p className="text-[11px] uppercase text-amber-600 font-semibold">Eventos críticos</p>
                    <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.harshEvents24h}</p>
                    <p className="text-xs text-gray-500">En las últimas 24 h</p>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Operador asignado</h3>
                    <p className="text-xs text-gray-500">Turno {vehicle.driver.shift}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-sm font-semibold text-gray-900">{vehicle.driver.name}</p>
                  <p className="text-xs text-gray-500">Experiencia {vehicle.driver.experienceYears} años · Rating {vehicle.driver.rating}/5</p>
                  <p className="text-xs text-gray-500">Contacto {vehicle.driver.phone}</p>
                  <p className="text-xs text-gray-500">Certificaciones: {vehicle.driver.certifications.join(', ')}</p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-gray-600 space-y-1.5">
                  <p className="font-semibold text-gray-800">Ruta estimada</p>
                  {vehicle.activeShipments.length > 0 ? (
                    vehicle.activeShipments.map((shipment) => (
                      <div key={shipment.id} className="flex items-start gap-2">
                        <Navigation className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-gray-800 font-semibold text-[11px] uppercase">
                            {shipment.origin} → {shipment.destination}
                          </p>
                          <p className="text-[11px] text-gray-500">ETA {new Date(shipment.eta).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[11px] text-gray-500">Prioridad {shipment.priority}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No hay envíos activos para esta unidad.</p>
                  )}
                </div>
              </article>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-slate-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Línea de tiempo de últimos eventos</h3>
                    <p className="text-xs text-gray-500">Upsell de seguridad, mantenimiento y operaciones</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {vehicle.securityEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3 flex items-start gap-3 text-xs">
                    <ShieldPlus className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">{event.message}</p>
                      <p className="text-[11px] text-gray-500">
                        {new Date(event.timestamp).toLocaleString('es-MX')} · Severidad {event.severity}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {event.resolved ? `Resuelto: ${event.actionTaken}` : 'En seguimiento con centro de monitoreo'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'seguridad' && (
          <div className="space-y-5">
            <section className="rounded-3xl border border-red-200 bg-red-50/80 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-600">Alertas activas</h3>
                  <p className="text-xs text-red-500">
                    Protocolos de seguridad y seguimiento con Guardia Nacional y centros de monitoreo
                  </p>
                  <div className="mt-3 space-y-2">
                    {openAlerts.length > 0 ? (
                      openAlerts.map((event) => (
                        <div key={event.id} className="rounded-2xl bg-white/70 border border-red-200 p-3 text-xs text-red-700">
                          <p className="font-semibold">{event.message}</p>
                          <p>{new Date(event.timestamp).toLocaleString('es-MX')}</p>
                          <p>Acción requerida: Escalamiento a monitoreo estratégico</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-red-600">Sin alertas activas en este momento.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Checklist de seguridad</h3>
                  <p className="text-xs text-gray-500">Integridad de puertas, sensores y geocercas</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="font-semibold text-gray-800">Botón de pánico</p>
                  <p>{vehicle.tags.includes('panic_button') ? 'Equipado y monitoreado' : 'Sin reportes activos'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="font-semibold text-gray-800">Geocercas</p>
                  <p>{vehicle.tags.includes('geocerca') ? 'Ruta trazada con checkpoints críticos' : 'Ruta monitoreada estándar'}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="font-semibold text-gray-800">Aperturas de puerta</p>
                  <p>
                    {vehicle.tags.includes('apertura_puerta')
                      ? 'Se requiere inspección inmediata'
                      : 'Sin anomalías registradas'}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="font-semibold text-gray-800">Detenciones</p>
                  <p>
                    {vehicle.tags.includes('detencion_no_programada')
                      ? 'Validación en progreso con monitoreo'
                      : 'Solo detenciones planificadas'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'mantenimiento' && (
          <div className="space-y-5">
            <section className="rounded-3xl border border-purple-200 bg-purple-50/80 p-4">
              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-700">Mantenimientos programados</h3>
                  <p className="text-xs text-purple-600">Calendario preventivo y correctivo integrado con talleres certificados</p>
                  <div className="mt-3 space-y-2">
                    {vehicle.maintenance.map((maintenance) => (
                      <div key={maintenance.id} className="rounded-2xl bg-white/80 border border-purple-200 p-3 text-xs text-gray-700">
                        <p className="font-semibold text-gray-800">{maintenance.description}</p>
                        <p>Tipo {maintenance.type}</p>
                        <p>Prioridad {maintenance.priority}</p>
                        <p>En {maintenance.dueInKm.toLocaleString()} km · Fecha {new Date(maintenance.dueDate).toLocaleDateString('es-MX')}</p>
                        {maintenance.workshop && <p>Taller sugerido: {maintenance.workshop}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Sensores críticos</h3>
                  <p className="text-xs text-gray-500">Revisión rápida de parámetros operativos</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Temperatura motor</p>
                  <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.coolantTempC}°C</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Batería</p>
                  <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.batteryVoltage} V</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Odometría</p>
                  <p className="text-lg font-semibold text-gray-900">{vehicle.telemetry.odometerKm.toLocaleString()} km</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Consumo estimado</p>
                  <p className="text-lg font-semibold text-gray-900">{vehicle.fuel.consumptionL100Km} L/100 km</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'finanzas' && (
          <div className="space-y-5">
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex items-start gap-3">
                <Fuel className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-emerald-700">Eficiencia energética</h3>
                  <p className="text-xs text-emerald-600">Comparativo vs flotilla y recomendaciones</p>
                  <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs text-gray-700">
                    <div className="rounded-2xl bg-white/80 border border-emerald-200 p-3">
                      <p className="font-semibold text-gray-800">Autonomía</p>
                      <p>{vehicle.fuel.autonomyKm} km disponibles</p>
                      <p>Reabastecimiento en {vehicle.fuel.refillInKm} km</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 border border-emerald-200 p-3">
                      <p className="font-semibold text-gray-800">Eficiencia</p>
                      <p>{vehicle.fuel.efficiencyVsFleet}% vs flotilla</p>
                      <p>Consumo {vehicle.fuel.consumptionL100Km} L/100 km</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 text-sm text-gray-600">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Detalle de gastos</h3>
                  <p className="text-xs text-gray-500">Costos operativos asociados a la unidad</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Mes en curso</p>
                  <p className="text-lg font-semibold text-gray-900">${vehicle.expenses.monthToDateUsd.toLocaleString()} USD</p>
                  <p className="text-xs text-gray-500">Incluye combustible, casetas y viáticos</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Último mantenimiento</p>
                  <p className="text-lg font-semibold text-gray-900">${vehicle.expenses.lastMaintenanceUsd.toLocaleString()} USD</p>
                  <p className="text-xs text-gray-500">Costo por intervención</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Combustible mes</p>
                  <p className="text-lg font-semibold text-gray-900">${vehicle.expenses.fuelMonthUsd.toLocaleString()} USD</p>
                  <p className="text-xs text-gray-500">Costo unitario promedio</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xs font-semibold text-gray-800">Costo por km</p>
                  <p className="text-lg font-semibold text-gray-900">${vehicle.expenses.averageCostPerKmUsd.toFixed(2)} USD/km</p>
                  <p className="text-xs text-gray-500">Objetivo &lt; 0.95 USD/km</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
