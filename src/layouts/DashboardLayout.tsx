// Layout principal del dashboard con sidebar y header
// Estructura base para todas las páginas autenticadas
import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  Home, 
  MessageSquare, 
  Users, 
  UserCheck, 
  Megaphone, 
  BookOpen, 
  Settings,
  Search,
  Bell,
  User,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useTheme } from '@/hooks/useTheme'

// Configuración de navegación principal
const navigationItems = [
  {
    icon: Home,
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
    icon: UserCheck,
    label: 'Agentes',
    href: '/agents',
    description: 'Gestión de agentes y performance'
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

export function DashboardLayout() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // ✅ AUTO-CERRADO DEL SIDEBAR AL NAVEGAR
  useEffect(() => {
    // Colapsar sidebar automáticamente cuando cambie la ruta
    // sidebarCollapsed = true significa COLAPSADO/CERRADO
    setSidebarCollapsed(true)
  }, [location.pathname])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                {!sidebarCollapsed && <span className="font-bold text-xl">UTalk</span>}
              </Link>
            </nav>
          </div>

          {/* Barra de búsqueda central */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en UTalk..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar - CORREGIDO: Íconos más pequeños y estéticos */}
        <aside className={`
          bg-background border-r transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}>
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-start mb-3"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="px-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${sidebarCollapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  {/* ✅ CORREGIDO: Íconos más pequeños y estéticos */}
                  <Icon className={`${sidebarCollapsed ? 'h-4 w-4' : 'h-4 w-4 mr-3'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="bg-primary-foreground text-primary text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className={`
          flex-1 overflow-hidden h-full
          ${location.pathname === '/chat' ? 'p-0' : 'p-6'}
        `}>
          {location.pathname === '/chat' ? (
            // Para el chat, ocupar toda la pantalla sin padding y con altura completa
            <div className="h-full w-full">
              <Outlet />
            </div>
          ) : (
            // Para otras páginas, mantener el padding normal
            <div className="h-full">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout 