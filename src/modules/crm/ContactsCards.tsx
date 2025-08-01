// Componente para mostrar contactos en formato de tarjetas
import { Contact } from './mockContacts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Building, Calendar } from 'lucide-react'

interface ContactsCardsProps {
  contacts: Contact[]
  onContactClick?: (contact: Contact) => void
  onEditContact?: (contact: Contact) => void
}

export default function ContactsCards({ 
  contacts, 
  onContactClick, 
  onEditContact 
}: ContactsCardsProps) {
  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChannelIcon = (channel: Contact['channel']) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'linkedin': return <Building className="h-4 w-4" />
      case 'website': return <Building className="h-4 w-4" />
      case 'referral': return <Building className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact) => (
        <Card 
          key={contact.id} 
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onContactClick?.(contact)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {contact.firstName} {contact.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contact.position} en {contact.company}
              </p>
            </div>
            <Badge className={getStatusColor(contact.status)}>
              {contact.status}
            </Badge>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              {contact.email}
            </div>
            {contact.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                {contact.phone}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Building className="h-4 w-4 mr-2" />
              {contact.company}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Última actividad: {formatDate(contact.lastActivity)}
            </div>
            <div className="flex items-center">
              {getChannelIcon(contact.channel)}
            </div>
          </div>

          {contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {contact.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
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

          {contact.value && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor:
              </span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(contact.value)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Probabilidad: {contact.probability ? `${Math.round(contact.probability * 100)}%` : 'N/A'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEditContact?.(contact)
              }}
            >
              Editar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 