// Vista de tarjetas (cards) para contactos del CRM
// Diseño tipo Kanban con cards responsivos organizados en grid
import { Edit, MessageCircle, Trash2, MoreHorizontal, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Contact, 
  getStatusColor, 
  getChannelIcon, 
  getIAPercentageColor 
} from './mockContacts'
import clsx from 'clsx'
import { useState } from 'react'

interface ContactsCardsProps {
  contacts: Contact[]
  selectedContacts: string[]
  onSelectContact: (contactId: string) => void
  onEditContact?: (contact: Contact) => void
  onDeleteContact?: (contact: Contact) => void
  onSendMessage?: (contact: Contact) => void
  className?: string
}

interface ContactCardProps {
  contact: Contact
  isSelected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSendMessage?: () => void
}

const ContactCard = ({ 
  contact, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onSendMessage 
}: ContactCardProps) => {
  const [showMenu, setShowMenu] = useState(false)

  const formatLastActivity = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Hace menos de 1h'
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })
  }

  return (
    <Card className={clsx(
      'p-4 hover:shadow-lg transition-all duration-200 cursor-pointer',
      isSelected && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
    )}>
      {/* Header con checkbox y menú */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-2xl">{getChannelIcon(contact.channel)}</span>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {/* Menú desplegable */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <div className="p-2 space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                    setShowMenu(false)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSendMessage?.()
                    setShowMenu(false)
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                    setShowMenu(false)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información del contacto */}
      <div className="space-y-3">
        {/* Nombre y estado */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white text-lg">
            {contact.name}
          </h3>
          <div className="flex items-center justify-between">
            <Badge className={clsx('text-xs', getStatusColor(contact.status))}>
              {contact.status === 'active' && 'Activo'}
              {contact.status === 'customer' && 'Cliente'}
              {contact.status === 'prospect' && 'Prospecto'}
              {contact.status === 'lead' && 'Lead'}
              {contact.status === 'inactive' && 'Inactivo'}
            </Badge>
            {contact.value > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <DollarSign className="w-3 h-3" />
                ${contact.value.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {contact.owner.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {contact.owner}
          </span>
        </div>

        {/* Información de contacto */}
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div>{contact.email}</div>
          <div>{contact.phone}</div>
          {contact.company && (
            <div className="text-xs text-gray-500">{contact.company}</div>
          )}
        </div>

        {/* Último mensaje */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
            {contact.lastMessage.length > 80 
              ? `${contact.lastMessage.substring(0, 80)}...` 
              : contact.lastMessage
            }
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            {formatLastActivity(contact.lastActivity)}
          </div>
        </div>

        {/* IA Tag */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {contact.iaTag}
            </div>
            <div className={clsx('text-xs font-medium', getIAPercentageColor(contact.iaPercentage))}>
              {contact.iaPercentage}% confianza
            </div>
          </div>
          
          {contact.conversions > 0 && (
            <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-3 h-3" />
              {contact.conversions} conversiones
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Botones de acción rápida */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSendMessage?.()
          }}
          className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Mensaje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}
          className="text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}

export function ContactsCards({
  contacts,
  selectedContacts,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onSendMessage,
  className
}: ContactsCardsProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header con información */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {contacts.length} contactos encontrados
        </div>
        {selectedContacts.length > 0 && (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            {selectedContacts.length} seleccionados
          </Badge>
        )}
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={selectedContacts.includes(contact.id)}
            onSelect={() => onSelectContact(contact.id)}
            onEdit={() => onEditContact?.(contact)}
            onDelete={() => onDeleteContact?.(contact)}
            onSendMessage={() => onSendMessage?.(contact)}
          />
        ))}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {contacts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron contactos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Intenta ajustar los filtros o agregar nuevos contactos
          </p>
        </div>
      )}

      {/* Footer con paginación (placeholder) */}
      {contacts.length > 0 && (
        <div className="flex items-center justify-center pt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
              Página 1 de 1
            </span>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactsCards 