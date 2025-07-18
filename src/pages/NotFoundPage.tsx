// Página de error 404 - Página no encontrada
// Diseño amigable con opciones de navegación
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-bold">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/dashboard">
              Volver al Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/auth/login">
              Ir al Login
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>¿Necesitas ayuda? Contacta al soporte técnico</p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage 