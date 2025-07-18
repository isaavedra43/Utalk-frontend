// Formulario para crear/editar contactos
// Usa React Hook Form + Zod para validación
// Se conecta con el servicio de contactos
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ContactFormProps {
  contactId?: string // Si se pasa, es edición
  onSuccess?: () => void
  onCancel?: () => void
}

export function ContactForm({ contactId, onSuccess: _onSuccess, onCancel }: ContactFormProps) {
  // TODO: Implementar formulario
  // - useForm de react-hook-form
  // - Validación con contactSchema de @/lib/validations
  // - useMutation para crear/actualizar
  // - Manejo de estados de loading/error
  // - Campos: nombre, apellido, email, teléfono, empresa, etc.

  const isEditing = Boolean(contactId)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input placeholder="Nombre del contacto" />
            </div>
            <div>
              <label className="text-sm font-medium">Apellido</label>
              <Input placeholder="Apellido del contacto" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="email@ejemplo.com" />
          </div>
          
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input placeholder="+34 123 456 789" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Empresa</label>
              <Input placeholder="Nombre de la empresa" />
            </div>
            <div>
              <label className="text-sm font-medium">Cargo</label>
              <Input placeholder="Cargo o posición" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Notas</label>
            <textarea 
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Actualizar' : 'Crear'} Contacto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ContactForm 