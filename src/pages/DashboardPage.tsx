// Página principal del dashboard con métricas y resumen
// Muestra KPIs, accesos rápidos y actividad reciente
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  // TODO: Implementar dashboard completo
  // - KPIs y métricas principales
  // - Gráficos y charts
  // - Actividad reciente
  // - Accesos rápidos
  // - Notificaciones importantes
  // - Estados de loading para datos

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu actividad
          </p>
        </div>
        <Button>Acción Rápida</Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contactos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campañas Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,230</div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campañas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 nuevas esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              +5% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Lista de actividad - Pendiente de implementación
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accesos rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                📞 Nuevo Contacto
              </Button>
              <Button variant="outline" className="justify-start">
                📧 Nueva Campaña
              </Button>
              <Button variant="outline" className="justify-start">
                📊 Ver Reportes
              </Button>
              <Button variant="outline" className="justify-start">
                👥 Gestionar Agentes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage 