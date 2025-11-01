# Módulo de Rastreo de Flotilla en Tiempo Real

## Visión general

El nuevo módulo `FleetTrackingModule` ofrece un tablero integral para supervisar la flotilla con datos simulados que replican las mejores prácticas de plataformas líderes. El enfoque es 100 % frontend, ideal para validar diseño y UX antes de integrar APIs reales.

- **Mapa interactivo (Leaflet + React-Leaflet):** visualización de unidades, rutas recientes, geocercas y centros de control.
- **Panel maestro-detalle:** listado filtrable de vehículos, ficha individual con telemetría, seguridad, mantenimiento y costos.
- **Filtros avanzados:** estatus operativo, tipo de energía, riesgo, alertas activas, búsqueda de operadores/envíos.
- **KPIs ejecutivos:** indicadores de flotilla, consumo energético, alertas críticas y envíos en curso.

## Componentes clave

- `FleetTrackingModule.tsx`: orquesta KPIs, filtros, mapa y paneles.
- `components/FleetFiltersBar.tsx`: filtros dinámicos y modos de vista (operaciones, seguridad, mantenimiento, finanzas).
- `components/FleetMap.tsx`: mapa con rutas, checkpoints y pop-ups enriquecidos.
- `components/VehicleList.tsx`: listado maestro con indicadores de riesgo, autonomía y envíos activos.
- `components/VehicleDetailPanel.tsx`: detalle completo con tabs segmentados.
- `data/mockFleetData.ts`: dataset estático para pruebas (vehículos, resumen, centros de control, eventos).
- `types.ts`: tipado exhaustivo para garantizar consistencia y escalabilidad.

## Integración en la app

- Nueva ruta protegida `'/fleet-tracking/*'` con lazy loading.
- Acceso desde el menú lateral y el menú móvil con ícono `Truck` de Lucide.
- Permisos temporales habilitados en `useModulePermissions` para facilitar QA.

## Dependencias

Instalar las nuevas librerías con:

```bash
npm install leaflet react-leaflet @types/leaflet
```

El CSS de Leaflet se importa directamente en `FleetMap.tsx` (`import 'leaflet/dist/leaflet.css';`).

## Próximos pasos sugeridos

- Sustituir los datos mock por endpoints en tiempo real (telemetría, seguridad, mantenimiento, costos).
- Conectar los controles de vista (`FleetViewMode`) con layouts/datasets específicos según la necesidad del negocio.
- Implementar pruebas E2E que validen filtros, pop-ups y tabs, especialmente cuando existan roles distintos.
- Revisar límites de cuota y caching cuando se integre con proveedores de mapas en producción.

Con esta base visual se cubre el diseño completo del módulo, listo para recibir datos reales y reglas de negocio avanzadas.
