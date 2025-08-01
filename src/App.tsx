// Aplicación principal con routing y providers
// ✅ EMAIL-FIRST: Sin dependencias Firebase
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppRoutes } from '@/pages/AppRoutes'
import { validateEnvironment } from '@/lib/envValidator'

function App(): JSX.Element {
  // ✅ Validar solo variables necesarias para backend EMAIL-FIRST
  validateEnvironment()

  // ✅ CONFIGURACIÓN DEBUG: Solo para desarrollo
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log('🔧 DEBUG MODE ENABLED')
    console.log('📊 Environment Variables Status:')
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL || 'NO CONFIGURADA')
    console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL || 'NO CONFIGURADA')
    console.log('VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV || 'development')
    console.log('VITE_APP_NAME:', import.meta.env.VITE_APP_NAME || 'UTalk')
    console.log('VITE_APP_VERSION:', import.meta.env.VITE_APP_VERSION || '1.0.0')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  )
}

export default App