// Página de registro - Funcionalidad no disponible en UTalk
// Los usuarios son creados por administradores en Firebase Console
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Registro No Disponible</CardTitle>
        <p className="text-muted-foreground">
          Los usuarios son creados por administradores del sistema
        </p>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">¿Necesitas acceso a UTalk?</h3>
            <p className="text-sm text-muted-foreground">
              Los administradores del sistema crean cuentas de usuario directamente 
              en Firebase Console con los permisos y roles apropiados.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Para solicitar acceso:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Contacta a tu administrador de sistema</li>
              <li>• Proporciona tu email corporativo</li>
              <li>• Especifica el rol que necesitas (admin/agent/viewer)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/auth/login">
              Ir al Login
            </Link>
          </Button>
          
          <p className="text-xs text-muted-foreground">
            ¿Ya tienes una cuenta? Inicia sesión con tus credenciales
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default RegisterPage 