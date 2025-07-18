// Layout principal del dashboard con sidebar y header
// Estructura base para todas las páginas autenticadas
import React from 'react'
import { Outlet } from 'react-router-dom'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // TODO: Implementar layout completo
  // - Sidebar con navegación
  // - Header con user menu y notificaciones
  // - Breadcrumbs
  // - Responsive design
  // - Estados de loading

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {/* TODO: Implementar navegación */}
              <span>UTalk</span>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {/* TODO: Búsqueda global, notificaciones, user menu */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <span className="text-sm text-muted-foreground">Header - Pendiente</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-background md:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 py-4">
              {/* TODO: Implementar menú de navegación */}
              <nav className="space-y-2 px-3">
                <div className="text-sm text-muted-foreground">Sidebar - Pendiente</div>
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