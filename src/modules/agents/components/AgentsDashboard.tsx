// Dashboard principal de agentes IA
// Versión simplificada sin dependencias de chat
import { useAgents } from '../hooks/useAgents'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function AgentsDashboard() {
  // ✅ HOOKS PRINCIPALES
  const {
    agents,
    loading,
    error

  } = useAgents()

  if (loading) {return <LoadingSpinner />}
  if (error) {return <div className="text-red-500">Error: {error}</div>}

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard de Agentes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus agentes IA y su rendimiento
        </p>
      </div>

      {/* KPIs básicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Agentes</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {agents.length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Activos</h3>
          <p className="text-2xl font-bold text-green-600">
            {agents.filter(a => a.isActive).length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">En línea</h3>
          <p className="text-2xl font-bold text-blue-600">
            {agents.filter(a => a.isOnline).length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Tickets Resueltos</h3>
          <p className="text-2xl font-bold text-purple-600">
            {agents.reduce(() => 0, 0)}
          </p>
        </Card>
      </div>

      {/* Lista de agentes */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Lista de Agentes</h2>
          <Button>Nuevo Agente</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {}}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {agent.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {agent.firstName} {agent.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {agent.title}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  agent.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  agent.isOnline ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
            </Card>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay agentes configurados aún
          </div>
        )}
      </Card>
    </div>
  )
}
