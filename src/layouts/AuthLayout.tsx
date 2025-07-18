// Layout para páginas de autenticación (login, registro)
// Diseño centrado con branding y formularios
import React from 'react'
import { Outlet } from 'react-router-dom'

interface AuthLayoutProps {
  children?: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  // TODO: Implementar layout de auth
  // - Diseño centrado y responsive
  // - Branding y logo
  // - Fondo atractivo
  // - Links entre login/registro

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-primary">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="text-4xl font-bold text-primary-foreground">UTalk</h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Plataforma profesional de comunicación empresarial
          </p>
          {/* TODO: Añadir más elementos de branding */}
        </div>
      </div>

      {/* Panel derecho - Formularios */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold">UTalk</h1>
          </div>

          {children || <Outlet />}
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 UTalk. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout 