// Componente principal del módulo CRM de UTalk
// Integra todos los subcomponentes: KPIs, filtros, tabla/tarjetas, toolbar
import { useState, useMemo } from 'react'
import { Contact } from './mockContacts'
import KPIStatsPanel from './KPIStatsPanel'
import CRMToolbar, { type CRMViewMode } from './CRMToolbar'
import ContactsTable from './ContactsTable'
import ContactsCards from './ContactsCards'
import CRMLeftSidebar, { type CRMFilters } from './CRMLeftSidebar'


export function CRM() {
  // Estados del CRM
  const [viewMode, setViewMode] = useState<CRMViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<CRMFilters>({
    search: '',
    status: [],
    channel: [],
    owner: [],
    dateRange: '',
    tags: []
  })

  // Filtrar contactos basado en los filtros aplicados
  const filteredContacts = useMemo(() => {
    let result = [...[]]

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.owner.toLowerCase().includes(query)
      )
    }

    // Filtro por estado
    if (filters.status && filters.status.length > 0) {
      result = result.filter(contact => filters.status.includes(contact.status))
    }

    // Filtro por canal
    if (filters.channel && filters.channel.length > 0) {
      result = result.filter(contact => filters.channel.includes(contact.channel))
    }

    // Filtro por owner
    if (filters.owner && filters.owner.length > 0) {
      result = result.filter(contact => filters.owner.includes(contact.owner))
    }

    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(contact =>
        filters.tags.some(tag => contact.tags.includes(tag))
      )
    }

    // Filtro por rango de fechas (simplificado)
    if (filters.dateRange) {
      // TODO: Implementar filtro de fechas más complejo
    }

    return result
  }, [searchQuery, filters])

  // Handlers para acciones de contactos
  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAllContacts = (selected: boolean) => {
    setSelectedContacts(selected ? filteredContacts.map(c => c.id) : [])
  }

  const handleNewContact = () => {
    console.log('Crear nuevo contacto')
    // TODO: Implementar modal de nuevo contacto
  }

  const handleEditContact = (contact: Contact) => {
    console.log('Editar contacto:', contact)
    // TODO: Implementar modal de edición
  }

  const handleDeleteContact = (contact: Contact) => {
    console.log('Eliminar contacto:', contact)
    // TODO: Implementar confirmación y eliminación
  }

  const handleExportCSV = () => {
    console.log('Exportar CSV de contactos filtrados')
    // TODO: Implementar exportación a CSV
  }

  // Combinar la búsqueda del toolbar con los filtros
  const handleToolbarSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFiltersChange = (newFilters: CRMFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Panel de KPIs (fijo en la parte superior) */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <KPIStatsPanel />
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <CRMToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={handleToolbarSearch}
          onNewContact={handleNewContact}
          onExportCSV={handleExportCSV}
          onShowFilters={() => setShowFilters(!showFilters)}
          selectedCount={selectedContacts.length}
          totalCount={filteredContacts.length}
        />
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar de filtros (colapsible) */}
        {showFilters && (
          <div className="hidden lg:block flex-shrink-0">
            <CRMLeftSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={() => setFilters({
                search: '',
                status: [],
                channel: [],
                owner: [],
                dateRange: '',
                tags: []
              })}
            />
          </div>
        )}

        {/* Panel principal de contactos con scroll */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Vista condicional: tabla o tarjetas */}
            {viewMode === 'table' ? (
              <ContactsTable
                contacts={filteredContacts}
                selectedContacts={selectedContacts}
                onSelectContact={handleSelectContact}
                onSelectAllContacts={handleSelectAllContacts}
                onEditContact={handleEditContact}
                onDeleteContact={handleDeleteContact}
              />
            ) : (
              <ContactsCards
                contacts={filteredContacts}
                onContactClick={(contact) => handleSelectContact(contact.id)}
                onEditContact={handleEditContact}
              />
            )}

            {/* Mensaje cuando no hay resultados */}
            {filteredContacts.length === 0 && (searchQuery || Object.values(filters).some(f => f !== 'all' && f !== undefined)) && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.071-2.33M8 12V8a4 4 0 118 0v4M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No se encontraron contactos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No hay contactos que coincidan con los filtros aplicados
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilters({
                        search: '',
                        status: [],
                        channel: [],
                        owner: [],
                        dateRange: '',
                        tags: []
                      })
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                  <span className="text-gray-400">o</span>
                  <button
                    onClick={handleNewContact}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Agregar nuevo contacto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para filtros en mobile */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-full overflow-y-auto">
              <CRMLeftSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={() => setFilters({
                  search: '',
                  status: [],
                  channel: [],
                  owner: [],
                  dateRange: '',
                  tags: []
                })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CRM