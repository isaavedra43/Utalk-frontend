// Panel de información del cliente con detalles de contacto y conversación
// Lado derecho del chat con datos del usuario
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Phone, 
  Tag,
  Edit,
  Save,
  X,
  Clock,
  MessageSquare,
  Star,
  UserCheck,
  UserX
} from 'lucide-react'
import { InfoPanelProps } from '../types'
import Avatar from './Avatar'
import ChannelBadge from './ChannelBadge'

export function InfoPanel({
  contact,
  conversation,
  onUpdateContact,
  onUpdateConversation
}: InfoPanelProps) {
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [editedContact, setEditedContact] = useState(contact)

  const handleSaveContact = () => {
    if (editedContact && contact) {
      onUpdateContact(contact.id, editedContact)
      setIsEditingContact(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedContact(contact)
    setIsEditingContact(false)
  }

  const handleAssignConversation = () => {
    if (conversation) {
      // TODO: Implementar lógica de asignación
      onUpdateConversation(conversation.id, { 
        assignedTo: { 
          id: 'current-user', 
          name: 'Usuario Actual',
          role: 'agent', // ✅ Campo requerido por estructura canónica
          avatar: undefined
        }
      })
    }
  }

  const handleUnassignConversation = () => {
    if (conversation) {
      onUpdateConversation(conversation.id, { assignedTo: undefined })
    }
  }

  if (!contact) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <User className="w-12 h-12 mb-3" />
          <h3 className="text-sm font-medium mb-1">Info del Cliente</h3>
          <p className="text-xs text-center">
            Selecciona una conversación para ver información del cliente
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Info del Cliente
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingContact(!isEditingContact)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isEditingContact ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Información principal del contacto */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <Avatar 
                src={contact.avatar}
                name={contact.name}
                size="xl"
                isOnline={contact.isOnline}
                channel={contact.channel}
              />
              <div className="mt-3">
                {isEditingContact ? (
                                     <Input
                     value={editedContact?.name || ''}
                     onChange={(e) => setEditedContact(prev => prev ? {...prev, name: e.target.value} : undefined)}
                     className="text-center font-medium"
                   />
                ) : (
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {contact.name}
                  </h3>
                )}
                
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <ChannelBadge channel={contact.channel} size="sm" />
                  <div className={`w-2 h-2 rounded-full ${contact.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-500">
                    {contact.isOnline ? 'En línea' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Datos de contacto */}
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {isEditingContact ? (
                                     <Input
                     type="email"
                     value={editedContact?.email || ''}
                     onChange={(e) => setEditedContact(prev => prev ? {...prev, email: e.target.value} : undefined)}
                     placeholder="email@ejemplo.com"
                     className="text-sm"
                   />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {contact.email || 'Sin email'}
                  </span>
                )}
              </div>

              {/* Teléfono */}
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {isEditingContact ? (
                                     <Input
                     type="tel"
                     value={editedContact?.phone || ''}
                     onChange={(e) => setEditedContact(prev => prev ? {...prev, phone: e.target.value} : undefined)}
                     placeholder="+1234567890"
                     className="text-sm"
                   />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {contact.phone || 'Sin teléfono'}
                  </span>
                )}
              </div>

              {/* Última vez en línea */}
              {contact.lastSeen && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Último: {new Date(contact.lastSeen).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            {/* Botones de acción para edición */}
            {isEditingContact && (
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={handleSaveContact}
                  size="sm"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  size="sm"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags del contacto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contact.tags.length === 0 ? (
              <p className="text-xs text-gray-500">Sin etiquetas</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de la conversación */}
        {conversation && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estado:</span>
                <Badge 
                  variant={conversation.status === 'open' ? 'default' : 
                          conversation.status === 'closed' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {conversation.status === 'open' ? 'Abierta' :
                   conversation.status === 'closed' ? 'Cerrada' : 
                   conversation.status === 'pending' ? 'Pendiente' : 'Asignada'}
                </Badge>
              </div>

              {/* Asignación */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Asignado a:</span>
                {conversation.assignedTo ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{conversation.assignedTo.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUnassignConversation}
                      className="h-5 w-5 p-0"
                    >
                      <UserX className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAssignConversation}
                    className="h-6 px-2 text-xs"
                  >
                    <UserCheck className="w-3 h-3 mr-1" />
                    Asignar
                  </Button>
                )}
              </div>

              {/* Prioridad */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Prioridad:</span>
                <div className="flex items-center space-x-1">
                  {conversation.priority === 'high' && <Star className="w-3 h-3 text-red-500" />}
                  {conversation.priority === 'medium' && <Star className="w-3 h-3 text-yellow-500" />}
                  {conversation.priority === 'low' && <Star className="w-3 h-3 text-gray-400" />}
                  <span className="text-xs capitalize">{conversation.priority}</span>
                </div>
              </div>

              {/* Mensajes no leídos */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">No leídos:</span>
                <Badge 
                  variant={conversation.unreadCount > 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {conversation.unreadCount}
                </Badge>
              </div>

              {/* Fecha de creación */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Creada:</span>
                <span className="text-xs">
                  {new Date(conversation.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campos personalizados */}
        {contact.customFields && Object.keys(contact.customFields).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Información adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(contact.customFields).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-xs text-gray-500 capitalize">{key}:</span>
                    <span className="text-xs">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default InfoPanel 