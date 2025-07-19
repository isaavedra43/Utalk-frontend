// Tabla de contactos del CRM
// Vista tabular con columnas: Owner, Name, Email, Phone, Status, Last Message, Date/Time, IA Tag, Actions
import { useState } from 'react'
import { Edit, MessageCircle, Trash2, MoreHorizontal, Clock, Phone, Mail } from 'lucide-react'
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

interface ContactsTableProps {
  contacts: Contact[]
  selectedContacts: string[]
  onSelectContact: (contactId: string) => void
  onSelectAllContacts: (selected: boolean) => void
  onEditContact?: (contact: Contact) => void
  onDeleteContact?: (contact: Contact) => void
  onSendMessage?: (contact: Contact) => void
  className?: string
}

export function ContactsTable({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAllContacts,
  onEditContact,
  onDeleteContact,
  onSendMessage,
  className
}: ContactsTableProps) {
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)

  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const isPartiallySelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length

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

  const formatLastMessage = (message: string): string => {
    return message.length > 50 ? `${message.substring(0, 50)}...` : message
  }

  return (
    <Card className={clsx('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {/* Checkbox para seleccionar todos */}
              <th className="w-12 p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected
                    }}
                    onChange={(e) => onSelectAllContacts(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </th>

              <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Owner
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Contacto
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Estado
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Último Mensaje
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Actividad
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                IA Tag
              </th>
              <th className="text-right p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                Acciones
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {contacts.map((contact) => {
              const isSelected = selectedContacts.includes(contact.id)
              
              return (
                <tr 
                  key={contact.id}
                  className={clsx(
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  {/* Checkbox */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectContact(contact.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* Owner */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {contact.owner.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {contact.owner}
                      </span>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {contact.name}
                        </span>
                        <span className="text-lg">
                          {getChannelIcon(contact.channel)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      </div>
                      {contact.company && (
                        <div className="text-xs text-gray-400">
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="p-4">
                    <Badge className={clsx('text-xs', getStatusColor(contact.status))}>
                      {contact.status === 'active' && 'Activo'}
                      {contact.status === 'customer' && 'Cliente'}
                      {contact.status === 'prospect' && 'Prospecto'}
                      {contact.status === 'lead' && 'Lead'}
                      {contact.status === 'inactive' && 'Inactivo'}
                    </Badge>
                  </td>

                  {/* Último Mensaje */}
                  <td className="p-4 max-w-xs">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatLastMessage(contact.lastMessage)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-3 h-3" />
                        vía {contact.channel}
                      </div>
                    </div>
                  </td>

                  {/* Actividad */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatLastActivity(contact.lastActivity)}
                      </span>
                    </div>
                  </td>

                  {/* IA Tag */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {contact.iaTag}
                      </div>
                      <div className={clsx('text-xs font-medium', getIAPercentageColor(contact.iaPercentage))}>
                        {contact.iaPercentage}% confianza
                      </div>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendMessage?.(contact)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditContact?.(contact)}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowActionsMenu(
                            showActionsMenu === contact.id ? null : contact.id
                          )}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>

                        {/* Menú de acciones */}
                        {showActionsMenu === contact.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                            <div className="p-2 space-y-1">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm"
                                onClick={() => {
                                  onEditContact?.(contact)
                                  setShowActionsMenu(null)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar contacto
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm"
                                onClick={() => {
                                  onSendMessage?.(contact)
                                  setShowActionsMenu(null)
                                }}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Enviar mensaje
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  onDeleteContact?.(contact)
                                  setShowActionsMenu(null)
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
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con paginación */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando 1-{contacts.length} de {contacts.length} contactos
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página 1 de 1
            </span>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ContactsTable 