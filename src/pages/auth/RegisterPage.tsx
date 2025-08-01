import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Registro de Usuario
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            El registro de usuarios está deshabilitado
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los usuarios son creados por administradores en el backend
              con los permisos y roles apropiados.
            </p>
            <Link to="/auth/login">
              <Button className="w-full">
                Volver al Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage 