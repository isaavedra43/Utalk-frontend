import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import { Compass, ShieldAlert } from 'lucide-react';
import {
  ControlCenter,
  FleetVehicle,
  FleetViewMode,
  VehicleStatus,
} from '../types';

import 'leaflet/dist/leaflet.css';

const STATUS_COLORS: Record<VehicleStatus, string> = {
  en_ruta: '#2563eb',
  detenido: '#f97316',
  en_base: '#0f766e',
  mantenimiento: '#9333ea',
  alerta: '#dc2626',
};

const VIEW_BADGE: Record<FleetViewMode, { label: string; color: string }> = {
  operaciones: { label: 'Operación', color: '#2563eb' },
  seguridad: { label: 'Seguridad', color: '#f97316' },
  mantenimiento: { label: 'Mantenimiento', color: '#9333ea' },
  finanzas: { label: 'Finanzas', color: '#0f766e' },
};

const getVehicleIcon = (vehicle: FleetVehicle, isSelected: boolean): DivIcon => {
  const color = STATUS_COLORS[vehicle.status] || '#2563eb';
  const glow = isSelected ? `0 0 24px ${color}55` : '0 6px 16px rgba(15, 23, 42, 0.18)';

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif;">
      <div style="background: white; border-radius: 16px; padding: 8px 10px; border: 2px solid ${color}; box-shadow: ${glow}; min-width: 112px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 600; color: #0f172a;">${vehicle.code}</span>
          <span style="font-size: 11px; font-weight: 600; color: ${color}; background: ${color}15; padding: 2px 8px; border-radius: 9999px;">
            ${vehicle.status.replace('_', ' ')}
          </span>
        </div>
        <div style="margin-top: 6px; display:flex; justify-content: space-between; font-size: 11px; color: #475569;">
          <span>${vehicle.telemetry.speedKmH} km/h</span>
          <span>${vehicle.fuel.levelPercentage}% combustible</span>
        </div>
      </div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; border: 2px solid white; margin-top: 6px;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [160, 70],
    iconAnchor: [80, 62],
    popupAnchor: [0, -60],
  });
};

const SelectedVehicleFocus: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ lat, lng }, 8, { duration: 0.8 });
  }, [lat, lng, map]);

  return null;
};

interface FleetMapProps {
  vehicles: FleetVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  controlCenters: ControlCenter[];
  viewMode: FleetViewMode;
}

export const FleetMap: React.FC<FleetMapProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  controlCenters,
  viewMode,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsReady(true);
    }
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId],
  );

  const defaultCenter = useMemo(() => {
    if (selectedVehicle) {
      return { lat: selectedVehicle.location.lat, lng: selectedVehicle.location.lng };
    }

    if (vehicles.length === 0) {
      return { lat: 23.6345, lng: -102.5528 }; // Centro aproximado México
    }

    const latAvg = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lat, 0) / vehicles.length;
    const lngAvg = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lng, 0) / vehicles.length;

    return { lat: latAvg, lng: lngAvg };
  }, [vehicles, selectedVehicle]);

  if (!isReady) {
    return (
      <div className="h-[480px] lg:h-full bg-slate-100 rounded-3xl border border-slate-200 animate-pulse" />
    );
  }

  return (
    <div className="relative h-[480px] lg:h-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        minZoom={4}
        maxZoom={16}
        className="h-full w-full"
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CartoDB'
        />

        {selectedVehicle && (
          <SelectedVehicleFocus lat={selectedVehicle.location.lat} lng={selectedVehicle.location.lng} />
        )}

        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;
          const markerIcon = getVehicleIcon(vehicle, isSelected);

          const routePoints = vehicle.routeHistory.map((point) => [point.lat, point.lng]) as [number, number][];

          const polylineColor = STATUS_COLORS[vehicle.status] || '#1d4ed8';

          return (
            <React.Fragment key={vehicle.id}>
              {routePoints.length > 1 && (
                <Polyline
                  positions={routePoints}
                  pathOptions={{
                    color: polylineColor,
                    weight: vehicle.id === selectedVehicleId ? 4.5 : 3,
                    opacity: vehicle.id === selectedVehicleId ? 0.85 : 0.5,
                    dashArray: vehicle.status === 'alerta' ? '6 10' : undefined,
                  }}
                />
              )}

              {vehicle.activeShipments.map((shipment) => (
                <Polyline
                  key={shipment.id}
                  positions={shipment.checkpoints.map((leg) => [leg.lat, leg.lng]) as [number, number][]}
                  pathOptions={{
                    color: '#14b8a6',
                    weight: 2.4,
                    opacity: 0.6,
                    dashArray: '2 6',
                  }}
                />
              ))}

              <Marker
                position={[vehicle.location.lat, vehicle.location.lng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onSelectVehicle(vehicle.id),
                }}
              >
                <Popup className="rounded-xl">
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{vehicle.code}</p>
                        <p className="text-base font-semibold text-slate-900">{vehicle.alias}</p>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase"
                        style={{ backgroundColor: `${STATUS_COLORS[vehicle.status]}22`, color: STATUS_COLORS[vehicle.status] }}
                      >
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-200 p-2">
                        <p className="text-[11px] uppercase text-slate-500 font-semibold">Velocidad</p>
                        <p className="text-sm font-semibold text-slate-900">{vehicle.telemetry.speedKmH} km/h</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-2">
                        <p className="text-[11px] uppercase text-slate-500 font-semibold">Combustible</p>
                        <p className="text-sm font-semibold text-slate-900">{vehicle.fuel.levelPercentage}%</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                      <p className="text-[11px] uppercase text-slate-500 font-semibold mb-1">Operador</p>
                      <p className="text-sm font-medium text-slate-900">{vehicle.driver.name}</p>
                      <p className="text-xs text-slate-500">Última actualización {new Date(vehicle.lastUpdate).toLocaleTimeString('es-MX')}</p>
                    </div>
                  </div>
                </Popup>

                <Tooltip direction="top" offset={[0, -42]} opacity={1} permanent={false} className="!bg-slate-900 !text-white !rounded-full !px-3 !py-1 text-xs font-medium">
                  {vehicle.alias}
                </Tooltip>
              </Marker>
            </React.Fragment>
          );
        })}

        {controlCenters.map((center) => (
          <Circle
            key={center.id}
            center={[center.coordinates.lat, center.coordinates.lng]}
            radius={center.radiusMeters}
            pathOptions={{ color: '#0ea5e9', weight: 1.4, opacity: 0.45, fillOpacity: 0.12 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{center.name}</p>
                <p className="text-xs text-slate-500 capitalize">Tipo: {center.type.replace('_', ' ')}</p>
                <p className="text-xs text-slate-500">Radio: {Math.round(center.radiusMeters)} m</p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-3 w-64">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4 text-blue-500" />
          Leyenda de estatus
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-[11px] text-blue-700 flex items-start gap-2">
          <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Vista activa</p>
            <p className="capitalize">{VIEW_BADGE[viewMode].label}</p>
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            if (selectedVehicle) {
              onSelectVehicle(selectedVehicle.id);
            }
          }}
          className="rounded-xl bg-slate-900/90 text-white px-4 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900"
        >
          Centrar vehículo
        </button>
        <div className="rounded-xl bg-white/90 backdrop-blur p-2 border border-slate-200 text-[11px] text-slate-600">
          <p>
            {selectedVehicle
              ? `${selectedVehicle.alias} · ${selectedVehicle.location.city}`
              : 'Selecciona una unidad para ver detalles'}
          </p>
        </div>
      </div>
    </div>
  );
};
