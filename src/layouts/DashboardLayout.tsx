// Layout principal del dashboard con sidebar y header
// Estructura base para todas las páginas autenticadas
import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Megaphone, 
  BookOpen, 
  Settings,
  Bell,
  Search,
  User
} from 'lucide-react'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

// Configuración de navegación principal
const navigationItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    description: 'Resumen y métricas'
  },
  {
    icon: MessageSquare,
    label: 'Mensajería',
    href: '/chat',
    description: 'Chat y conversaciones',
    badge: '12' // Mensajes sin leer
  },
  {
    icon: Users,
    label: 'CRM',
    href: '/crm',
    description: 'Gestión de contactos'
  },
  {
    icon: Megaphone,
    label: 'Campañas',
    href: '/campaigns',
    description: 'Marketing y promociones'
  },
  {
    icon: BookOpen,
    label: 'Conocimiento',
    href: '/knowledge',
    description: 'Base de conocimiento'
  },
  {
    icon: Settings,
    label: 'Configuración',
    href: '/settings',
    description: 'Ajustes del sistema'
  }
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">UTalk</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {/* Búsqueda global */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar en UTalk..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 text-sm border rounded-md bg-background"
                />
              </div>
            </div>

            {/* Notificaciones y usuario */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-background md:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 py-4">
              <nav className="space-y-1 px-3">
                {navigationItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout 