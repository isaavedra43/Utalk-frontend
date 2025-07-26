// Layout principal del dashboard con sidebar y header
// Estructura base para todas las páginas autenticadas
import React, { useState } from 'react'
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

interface DashboardLayoutProps {
  children?: React.ReactNode
}

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

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>

              <Button variant="ghost" size="sm">
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
        {/* Sidebar Colapsible */}
        <aside className={`hidden md:block border-r bg-background transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="flex h-full flex-col">
            {/* Botón para colapsar/expandir */}
            <div className="flex justify-end p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0"
                title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>

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
                        ${sidebarCollapsed ? 'justify-center space-x-0' : ''}
                      `}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout 