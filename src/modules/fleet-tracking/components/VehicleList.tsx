import React from 'react';
import {
  Activity,
  AlertTriangle,
  Fuel,
  MapPin,
  Navigation,
  User,
} from 'lucide-react';
import { FleetVehicle, FleetViewMode } from '../types';

const STATUS_LABEL: Record<FleetVehicle['status'], string> = {
  en_ruta: 'En ruta',
  detenido: 'Detenido',
  en_base: 'En base operativa',
  mantenimiento: 'En mantenimiento',
  alerta: 'En alerta',
};

const STATUS_BADGE: Record<FleetVehicle['status'], string> = {
  en_ruta: 'bg-blue-50 text-blue-600',
  detenido: 'bg-amber-50 text-amber-600',
  en_base: 'bg-emerald-50 text-emerald-600',
  mantenimiento: 'bg-purple-50 text-purple-600',
  alerta: 'bg-red-50 text-red-600',
};

const riskColor: Record<FleetVehicle['riskLevel'], string> = {
  alto: 'bg-red-500/10 text-red-700 border border-red-200',
  medio: 'bg-amber-500/10 text-amber-700 border border-amber-200',
  bajo: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200',
};

interface VehicleListProps {
  vehicles: FleetVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  viewMode: FleetViewMode;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  viewMode,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Unidades monitoreadas</p>
            <h3 className="text-lg font-semibold text-gray-900">{vehicles.length} vehículos</h3>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Vista: <span className="font-semibold capitalize text-gray-700">{viewMode}</span></p>
            <p>Actualización: real-time</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-3 p-4">
          {vehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            const statusBadge = STATUS_BADGE[vehicle.status];

            return (
              <button
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle.id)}
                className={`w-full text-left rounded-2xl transition-all border p-4 flex flex-col gap-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100/60'
                    : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge}`}>
                        {STATUS_LABEL[vehicle.status]}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColor[vehicle.riskLevel]}`}>
                        Riesgo {vehicle.riskLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-gray-900">
                      {vehicle.alias}
                      <span className="ml-2 text-sm font-medium text-gray-500">{vehicle.code}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end text-xs text-gray-500">
                    <span>Última actualización</span>
                    <span className="font-semibold text-gray-700">
                      {new Date(vehicle.lastUpdate).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="line-clamp-2 leading-snug">
                      {vehicle.location.city}, {vehicle.location.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span className="leading-snug">{vehicle.driver.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-amber-500" />
                    <span>{vehicle.fuel.levelPercentage}% • {vehicle.fuel.autonomyKm} km autonomía</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span>{vehicle.telemetry.speedKmH} km/h • {vehicle.telemetry.drivingScore}/100 score</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-xs text-gray-600">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-700">Envíos activos</p>
                      {vehicle.activeShipments.length > 0 ? (
                        <ul className="mt-2 space-y-1.5">
                          {vehicle.activeShipments.map((shipment) => (
                            <li key={shipment.id} className="flex items-start gap-2">
                              <Navigation className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-[11px] font-semibold text-gray-700 uppercase">
                                  {shipment.client} · {shipment.status}
                                </p>
                                <p className="text-[11px] text-gray-500 leading-snug">
                                  {shipment.origin} → {shipment.destination}
                                </p>
                                <p className="text-[11px] text-gray-500 leading-snug">
                                  ETA {new Date(shipment.eta).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-[11px] text-gray-500">Sin asignaciones activas.</p>
                      )}
                    </div>
                    {vehicle.securityEvents.some((event) => !event.resolved) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 text-[11px] font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {vehicle.securityEvents.filter((event) => !event.resolved).length} alertas
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
