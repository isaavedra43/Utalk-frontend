// Sidebar de navegación izquierda con filtros y búsqueda
// Estilo similar a Chatwoot/Intercom con fondo oscuro
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Inbox, 
  Search, 
  Filter, 
  BarChart3, 
  Settings, 
  User, 
  MessageSquare,
  UserX,
  Tag,
  Users
} from 'lucide-react'
import { SidebarProps } from '../types'
import Avatar from './Avatar'

const navigationItems = [
  { icon: Inbox, label: 'Inbox', active: true },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Users, label: 'Team' },
  { icon: Settings, label: 'Settings' }
]

const filterTabs = [
  { key: 'all', label: 'Todas', count: 12 },
  { key: 'unassigned', label: 'Sin asignar', count: 3 },
  { key: 'tagged', label: 'Con etiqueta', count: 5 }
]

export function Sidebar({ onFilterChange, currentFilter }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilter.search || '')
  const [activeTab, setActiveTab] = useState('all')

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFilterChange({ ...currentFilter, search: value })
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    // Aplicar filtros según la pestaña seleccionada
    const newFilter = { ...currentFilter }
    
    switch (tab) {
      case 'unassigned':
        newFilter.assignedTo = undefined
        newFilter.status = 'open'
        break
      case 'tagged':
        newFilter.tags = ['priority'] // Ejemplo de filtro por tags
        break
      default:
        // 'all' - limpiar filtros específicos
        delete newFilter.assignedTo
        delete newFilter.tags
        break
    }
    
    onFilterChange(newFilter)
  }

  return (
    <div className="w-16 lg:w-64 bg-[#171e2a] text-white flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-700">
        <div className="hidden lg:flex items-center space-x-2">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">UTalk</span>
        </div>
        <div className="lg:hidden flex justify-center">
          <MessageSquare className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* Navegación principal */}
      <div className="flex-1">
        {/* Items de navegación */}
        <div className="py-4">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`
                w-full justify-start mb-1 px-4 py-2 h-auto
                ${item.active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}
                lg:justify-start justify-center
              `}
              title={item.label}
            >
              <item.icon className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Búsqueda y filtros - Solo visible en pantallas grandes */}
        <div className="hidden lg:block px-4 py-2 border-t border-gray-700">
          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Filtros rápidos */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">Filtros</span>
              </div>

              {/* Tabs de filtros */}
              <div className="space-y-1">
                {filterTabs.map((tab) => (
                  <Button
                    key={tab.key}
                    variant="ghost"
                    onClick={() => handleTabChange(tab.key)}
                    className={`
                      w-full justify-between px-3 py-2 h-auto text-sm
                      ${activeTab === tab.key 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      {tab.key === 'all' && <Inbox className="w-4 h-4" />}
                      {tab.key === 'unassigned' && <UserX className="w-4 h-4" />}
                      {tab.key === 'tagged' && <Tag className="w-4 h-4" />}
                      <span>{tab.label}</span>
                    </div>
                    
                    {tab.count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-gray-600 text-white text-xs"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usuario actual - Solo visible en pantallas grandes */}
      <div className="hidden lg:block p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar 
            name="Usuario Actual" 
            size="md" 
            isOnline={true}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Usuario Actual
            </p>
            <p className="text-xs text-gray-400">
              En línea
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Usuario móvil - Solo visible en pantallas pequeñas */}
      <div className="lg:hidden p-4 border-t border-gray-700 flex justify-center">
        <Avatar 
          name="Usuario Actual" 
          size="md" 
          isOnline={true}
        />
      </div>
    </div>
  )
}

export default Sidebar 