// Panel de KPIs y estadísticas del CRM
// Muestra métricas clave en tarjetas visuales alineadas al diseño UTalk
import { Clock, TrendingUp, UserX, DollarSign, Users, UserPlus, Activity, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockCRMStats, type CRMStats } from './mockContacts'
import clsx from 'clsx'

interface KPIStatsProps {
  stats?: CRMStats
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  badge?: {
    text: string
    variant: 'default' | 'success' | 'warning' | 'danger'
  }
  iconColor: string
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, badge, iconColor }: StatCardProps) => (
  <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className={clsx('p-2 rounded-lg', iconColor)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        {badge && (
          <Badge 
            variant={badge.variant === 'success' ? 'default' : 'secondary'}
            className={clsx(
              'text-xs',
              badge.variant === 'success' && 'bg-green-500 hover:bg-green-600',
              badge.variant === 'warning' && 'bg-yellow-500 hover:bg-yellow-600 text-black',
              badge.variant === 'danger' && 'bg-red-500 hover:bg-red-600'
            )}
          >
            {badge.text}
          </Badge>
        )}
        
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 text-sm',
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            <span className="font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
)

export function KPIStatsPanel({ stats = mockCRMStats, className }: KPIStatsProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {/* Título de la sección */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Métricas del CRM
        </h2>
        <Badge variant="outline" className="text-xs">
          Actualizado hace 5 min
        </Badge>
      </div>

      {/* Grid de KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Tiempo Promedio de Respuesta */}
        <StatCard
          title="Tiempo Promedio de Respuesta"
          value={stats.avgResponseTime}
          subtitle="Últimos 30 días"
          icon={Clock}
          iconColor="bg-blue-500"
          trend={{
            value: -12,
            isPositive: true,
            label: 'vs mes anterior'
          }}
          badge={{
            text: 'Excelente',
            variant: 'success'
          }}
        />

        {/* Tickets Cerrados */}
        <StatCard
          title="Tickets Cerrados"
          value={stats.closedTickets.toLocaleString()}
          subtitle="Este mes"
          icon={CheckCircle}
          iconColor="bg-green-500"
          trend={{
            value: 23,
            isPositive: true,
            label: 'vs mes anterior'
          }}
        />

        {/* Conversión a Venta */}
        <StatCard
          title="Conversión a Venta"
          value={`${stats.conversionRate}%`}
          subtitle="Tasa de conversión"
          icon={TrendingUp}
          iconColor="bg-purple-500"
          trend={{
            value: 8.5,
            isPositive: true,
            label: 'vs mes anterior'
          }}
          badge={{
            text: 'Meta: 65%',
            variant: 'success'
          }}
        />

        {/* Clientes Inactivos */}
        <StatCard
          title="Clientes Inactivos"
          value={stats.inactiveClients}
          subtitle="Requieren seguimiento"
          icon={UserX}
          iconColor="bg-red-500"
          trend={{
            value: -15,
            isPositive: true,
            label: 'vs mes anterior'
          }}
          badge={{
            text: 'Atención',
            variant: 'warning'
          }}
        />
      </div>

      {/* Grid de métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valor Promedio por Cliente */}
        <StatCard
          title="Valor Promedio por Cliente"
          value={`$${stats.avgClientValue.toLocaleString()}`}
          subtitle="MXN"
          icon={DollarSign}
          iconColor="bg-emerald-500"
          trend={{
            value: 18,
            isPositive: true,
            label: 'vs mes anterior'
          }}
        />

        {/* Total de Contactos */}
        <StatCard
          title="Total de Contactos"
          value={stats.totalContacts.toLocaleString()}
          subtitle="En base de datos"
          icon={Users}
          iconColor="bg-indigo-500"
        />

        {/* Contactos Activos */}
        <StatCard
          title="Contactos Activos"
          value={stats.activeContacts.toLocaleString()}
          subtitle={`${Math.round((stats.activeContacts / stats.totalContacts) * 100)}% del total`}
          icon={Activity}
          iconColor="bg-cyan-500"
          badge={{
            text: 'Saludable',
            variant: 'success'
          }}
        />

        {/* Nuevos Contactos */}
        <StatCard
          title="Nuevos Contactos"
          value={stats.newContactsThisMonth}
          subtitle="Este mes"
          icon={UserPlus}
          iconColor="bg-orange-500"
          trend={{
            value: 34,
            isPositive: true,
            label: 'vs mes anterior'
          }}
        />
      </div>

      {/* Resumen rápido */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Rendimiento General</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tu CRM está funcionando por encima del promedio con una tasa de conversión del {stats.conversionRate}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-600">
              Excelente
            </Badge>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default KPIStatsPanel 