import { useEffect, useState } from "react";
import { Users, Crown, UserCheck, UserX, Search, Plus, Shield, BarChart3, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logger } from "@/lib/utils";

/**
 * PÁGINA DE GESTIÓN DE EQUIPO - UTalk Frontend
 * 
 * ESTADO: 🚧 EN DESARROLLO - COMPONENTE PLACEHOLDER
 * 
 * FUNCIONALIDADES PLANIFICADAS:
 * - Lista completa de agentes y administradores
 * - Gestión de roles y permisos
 * - Métricas de performance por agente
 * - Asignación automática de conversaciones
 * - Horarios y disponibilidad
 * - Configuración de equipos/departamentos
 * - Supervisión en tiempo real
 * 
 * PRÓXIMOS PASOS:
 * 1. Integrar hooks useTeam y useAgentPerformance
 * 2. Implementar sistema de roles y permisos
 * 3. Agregar métricas detalladas por agente
 * 4. Implementar gestión de horarios
 * 5. Agregar dashboard de supervisión
 */
export function EquipoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  // Log de inicialización del componente
  useEffect(() => {
    logger.navigation('👥 [EQUIPO] Página de gestión de equipo inicializada', {
      searchTerm,
      selectedRole,
      selectedStatus,
      timestamp: new Date().toISOString(),
      component: 'EquipoPage'
    });

    // Simular carga de datos del equipo
    const teamLoadTimeout = setTimeout(() => {
      logger.navigation('👥 [EQUIPO] Datos del equipo cargados (simulado)', {
        totalAgents: 12,
        activeAgents: 8,
        adminUsers: 3
      });
    }, 1200);

    return () => clearTimeout(teamLoadTimeout);
  }, [searchTerm, selectedRole, selectedStatus]);

  const mockStats = {
    totalAgents: 12,
    activeAgents: 8,
    offlineAgents: 4,
    administrators: 3,
    avgResponseTime: 3.8,
    avgSatisfaction: 92
  };

  const mockRoles = [
    { name: 'Administrador', count: 3, color: 'bg-purple-600', icon: Crown },
    { name: 'Supervisor', count: 2, color: 'bg-blue-600', icon: Shield },
    { name: 'Agente Senior', count: 4, color: 'bg-green-600', icon: UserCheck },
    { name: 'Agente', count: 3, color: 'bg-yellow-600', icon: Users }
  ];

  const mockAgents = [
    { 
      name: 'Ana García', 
      role: 'Administrador', 
      status: 'online', 
      conversations: 23, 
      avgResponse: 2.1, 
      satisfaction: 98,
      avatar: '/avatars/ana.jpg'
    },
    { 
      name: 'Carlos López', 
      role: 'Agente Senior', 
      status: 'busy', 
      conversations: 18, 
      avgResponse: 3.2, 
      satisfaction: 94,
      avatar: '/avatars/carlos.jpg'
    },
    { 
      name: 'María Rodríguez', 
      role: 'Agente', 
      status: 'online', 
      conversations: 15, 
      avgResponse: 4.1, 
      satisfaction: 91,
      avatar: '/avatars/maria.jpg'
    },
    { 
      name: 'David Chen', 
      role: 'Supervisor', 
      status: 'offline', 
      conversations: 12, 
      avgResponse: 2.8, 
      satisfaction: 96,
      avatar: '/avatars/david.jpg'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="h-full bg-gray-950 text-white p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-400" />
              Gestión de Equipo
            </h1>
            <p className="text-gray-400 text-sm">
              🚧 Módulo en desarrollo - Vista placeholder
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reportes
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Roles
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invitar Agente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Agentes</p>
                  <p className="text-2xl font-bold text-white">{mockStats.totalAgents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En Línea</p>
                  <p className="text-2xl font-bold text-green-400">{mockStats.activeAgents}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Desconectados</p>
                  <p className="text-2xl font-bold text-gray-400">{mockStats.offlineAgents}</p>
                </div>
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Administradores</p>
                  <p className="text-2xl font-bold text-purple-400">{mockStats.administrators}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Resp. Promedio</p>
                  <p className="text-2xl font-bold text-blue-400">{mockStats.avgResponseTime}min</p>
                </div>
                <Badge variant="secondary">Tiempo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Satisfacción</p>
                  <p className="text-2xl font-bold text-green-400">{mockStats.avgSatisfaction}%</p>
                </div>
                <Badge className="bg-green-600">Excelente</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {mockRoles.map((role, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <role.icon className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">{role.name}</span>
                  </div>
                  <Badge className={role.color}>{role.count}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar agentes por nombre, email, rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="senior">Agente Senior</option>
            <option value="agente">Agente</option>
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="online">En línea</option>
            <option value="busy">Ocupado</option>
            <option value="offline">Desconectado</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team List Preview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipo de Agentes (Preview)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                  </div>
                  <div>
                    <p className="text-white font-medium">{agent.name}</p>
                    <p className="text-gray-400 text-sm">{agent.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{agent.conversations} conv.</p>
                  <p className="text-gray-400 text-xs">{getStatusLabel(agent.status)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Module Preview */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa del Módulo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-white">
                Sistema de Gestión de Equipo
              </h3>
              
              <p className="text-gray-400 max-w-md mx-auto">
                Plataforma completa para gestionar agentes, roles, permisos y 
                supervisar el rendimiento del equipo en tiempo real.
              </p>

              <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Funcionalidades Planeadas:</h4>
                  <ul className="text-sm text-gray-400 space-y-1 text-left">
                    <li>• Gestión completa de roles y permisos</li>
                    <li>• Métricas de performance por agente</li>
                    <li>• Asignación automática de conversaciones</li>
                    <li>• Configuración de horarios y disponibilidad</li>
                    <li>• Dashboard de supervisión en tiempo real</li>
                    <li>• Reportes de productividad</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 justify-center mt-6">
                <Button variant="outline" className="text-gray-400" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Métricas
                </Button>
                <Button variant="outline" className="text-gray-400" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Gestionar Permisos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 