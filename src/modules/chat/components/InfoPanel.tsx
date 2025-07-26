// Panel de información del contacto y conversación
// Muestra detalles, tags, historial y opciones de edición
import { useState } from 'react'
import { Edit3, Save, X, Phone, Mail, Calendar, Tag, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { InfoPanelProps } from '../types'
import { Avatar } from './Avatar'
import { ChannelBadge } from './ChannelBadge'
import { useConversationData } from '../hooks/useConversationData'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function InfoPanel({
  conversationId,
  contact: initialContact,
  conversation: initialConversation,
  onUpdateContact,
  onUpdateConversation
}: InfoPanelProps) {
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isEditingConversation, setIsEditingConversation] = useState(false)
  const [editedContact, setEditedContact] = useState(initialContact)
  const [editedConversation, setEditedConversation] = useState(initialConversation)

  // ✅ Obtener datos reales de la conversación
  const { conversation: conversationData, isLoading } = useConversationData(conversationId)
  
  // Usar datos del hook si están disponibles, sino usar props
  const contact = conversationData?.contact || initialContact
  const conversation = conversationData || initialConversation

  const handleSaveContact = () => {
    if (editedContact && onUpdateContact) {
      onUpdateContact(editedContact)
      setIsEditingContact(false)
    }
  }

  const handleCancelEditContact = () => {
    setEditedContact(contact)
    setIsEditingContact(false)
  }

  const handleSaveConversation = () => {
    if (editedConversation && onUpdateConversation) {
      onUpdateConversation(editedConversation)
      setIsEditingConversation(false)
    }
  }

  const handleCancelEditConversation = () => {
    setEditedConversation(conversation)
    setIsEditingConversation(false)
  }

  const formatLastActivity = (date: Date) => {
    try {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  if (isLoading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!contact && !conversation) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">ℹ️</div>
          <p>Selecciona una conversación para ver detalles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Información
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Contact Information */}
        {contact && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Contacto</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingContact(!isEditingContact)}
              >
                {isEditingContact ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Avatar y nombre */}
            <div className="flex items-center space-x-3">
              <Avatar
                src={contact.avatar}
                name={contact.name}
                size="xl"
                isOnline={contact.isOnline}
                channel={conversation?.channel}
              />
              <div className="flex-1">
                {isEditingContact ? (
                  <Input
                    value={editedContact?.name || ''}
                    onChange={(e) => setEditedContact((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del contacto"
                  />
                ) : (
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {contact.name || 'Sin nombre'}
                  </h3>
                )}
                {conversation?.channel && (
                  <ChannelBadge channel={conversation.channel} size="sm" />
                )}
              </div>
            </div>

            {/* Información de contacto */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                {isEditingContact ? (
                  <Input
                    value={editedContact?.phone || ''}
                    onChange={(e) => setEditedContact((prev: any) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Teléfono"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {contact.phone || 'Sin teléfono'}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                {isEditingContact ? (
                  <Input
                    value={editedContact?.email || ''}
                    onChange={(e) => setEditedContact((prev: any) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                  />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {contact.email || 'Sin email'}
                  </span>
                )}
              </div>

              {contact.lastSeen && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Última actividad: {formatLastActivity(contact.lastSeen)}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {contact.tags && contact.tags.length > 0 ? (
                  contact.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sin tags</span>
                )}
              </div>
            </div>

            {/* Botones de acción para contacto */}
            {isEditingContact && (
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveContact}>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEditContact}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Conversation Information */}
        {conversation && (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Conversación</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingConversation(!isEditingConversation)}
              >
                {isEditingConversation ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</span>
                <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'}>
                  {conversation.status === 'open' ? 'Abierta' : 
                   conversation.status === 'closed' ? 'Cerrada' : 
                   conversation.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad</span>
                <Badge variant={conversation.priority === 'high' ? 'destructive' : 'outline'}>
                  {conversation.priority === 'high' ? 'Alta' :
                   conversation.priority === 'medium' ? 'Media' : 'Baja'}
                </Badge>
              </div>

              {conversation.assignedTo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Asignado a</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {conversation.assignedTo.name}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Creada: {formatLastActivity(conversation.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensajes</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {conversation.messageCount || 0} total
                </span>
              </div>
            </div>

            {/* Información adicional */}
            {conversation.metadata?.customFields && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Información adicional</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Información personalizada disponible</p>
                </div>
              </div>
            )}

            {/* Botones de acción para conversación */}
            {isEditingConversation && (
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveConversation}>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEditConversation}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 