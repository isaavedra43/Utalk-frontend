// Componente raíz de la aplicación
// Configuración de providers globales, routing y layout principal
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Providers y contextos globales
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Routing principal
import AppRoutes from '@/pages/AppRoutes'

// Sistema de logs y análisis
import '@/lib/logger' // Inicializar logs
import '@/lib/projectAnalyzer' // Inicializar análisis automático
import '@/lib/connectionTester' // ✅ Inicializar pruebas de conexión
import { printEnvironmentReport } from '@/lib/envValidator' // ✅ Validación de variables

// ✅ Validación de variables de entorno críticas
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'VITE_API_URL',
    'VITE_WS_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const missingVars: string[] = []
  
  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars)
    console.error('Please check your .env file or Vercel environment variables')
    return false
  }

  // ✅ Log de configuración exitosa (solo en dev)
  if (import.meta.env.DEV) {
    console.log('✅ Environment variables validated successfully', {
      apiUrl: import.meta.env.VITE_API_URL,
      wsUrl: import.meta.env.VITE_WS_URL,
      firebaseProject: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      firebaseDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    })
  }

  return true
}

// ✅ Ejecutar validación al importar App
if (!validateEnvironmentVariables()) {
  console.error('🚨 Critical: Environment variables missing. App may not function correctly.')
}

// ✅ Ejecutar reporte detallado en desarrollo
if (import.meta.env.DEV) {
  setTimeout(() => {
    printEnvironmentReport()
  }, 2000)
}

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="utalk-ui-theme">
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}

export default App 