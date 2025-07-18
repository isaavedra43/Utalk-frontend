// Listado de contactos del CRM
// Consumirá los endpoints de contactos del backend
// Incluye filtros, búsqueda, paginación y acciones CRUD
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ContactListProps {
  // TODO: Definir props cuando se implemente
}

export function ContactList(_props: ContactListProps) {
  // TODO: Implementar lógica de contactos
  // - useQuery para obtener contactos
  // - Estados de loading/error
  // - Filtros y búsqueda
  // - Paginación
  // - Acciones de editar/eliminar

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Button>Nuevo Contacto</Button>
      </div>
      
      <Card className="p-4">
        <div className="flex space-x-4 mb-4">
          <Input placeholder="Buscar contactos..." className="max-w-sm" />
          {/* TODO: Añadir filtros adicionales */}
        </div>
        
        <div className="text-center py-8 text-muted-foreground">
          {/* TODO: Implementar tabla/grid de contactos */}
          Lista de contactos - Pendiente de implementación
        </div>
      </Card>
    </div>
  )
}

export default ContactList 