
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'

interface SettingsProps {
  className?: string
}

export function Settings({ className }: SettingsProps): JSX.Element {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona la configuración de tu cuenta y aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil de Usuario */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Perfil de Usuario</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <Input placeholder="Tu nombre completo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Empresa</label>
              <Input placeholder="Nombre de tu empresa" />
            </div>
          </div>
        </Card>

        {/* Seguridad */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Seguridad</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Cambiar Contraseña
            </Button>
          </div>
        </Card>

        {/* Notificaciones */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones por email</span>
              <Badge variant="default">Activado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones push</span>
              <Badge variant="secondary">Desactivado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reportes semanales</span>
              <Badge variant="default">Activado</Badge>
            </div>
          </div>
        </Card>

        {/* Apariencia */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Apariencia</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tema</label>
              <select className="w-full p-2 border rounded-md">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Idioma</label>
              <select className="w-full p-2 border rounded-md">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Datos */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Datos</h3>
          </div>
          <div className="space-y-4">
            <Button variant="outline" size="sm" className="w-full">
              Exportar Datos
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Importar Datos
            </Button>
            <Button variant="destructive" size="sm" className="w-full">
              Eliminar Datos
            </Button>
          </div>
        </Card>

        {/* Integraciones */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold">Integraciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Calendar</span>
              <Badge variant="default">Conectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Slack</span>
              <Badge variant="secondary">Desconectado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Zapier</span>
              <Badge variant="default">Conectado</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}