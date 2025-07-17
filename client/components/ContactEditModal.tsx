import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { logger } from '@/lib/utils';
import { Loader2, User, Phone, Mail, FileText, Save, X, Tag } from 'lucide-react'; // Añadido Tag
import type { Contact, ContactFormData } from '@/types/api';

interface ContactEditModalProps {
  contact?: Contact;
  conversationPhone?: string; // Para crear contacto desde conversación
  isOpen: boolean;
  onClose: () => void;
  onSave?: (contact: Contact) => void;
}

// ❌ ELIMINADO: statusOptions y channelOptions ya no existen en el contrato

export function ContactEditModal({
  contact,
  conversationPhone,
  isOpen,
  onClose,
  onSave
}: ContactEditModalProps) {
  const { hasPermission } = usePermissions();
  
  // 🔧 CORREGIDO: Usar hasPermission en lugar de propiedades específicas
  const canEditContacts = hasPermission('edit_contacts');
  const canCreateContacts = hasPermission('create_contacts');

  const queryClient = useQueryClient();
  const isEditing = !!contact;
  const isCreatingFromConversation = !!conversationPhone && !contact;

  // Verificar permisos
  const canProceed = isEditing ? canEditContacts : canCreateContacts;

  // 🟢 ESTADO ALINEADO CON CONTRATO: Solo campos válidos
  const [formData, setFormData] = useState<Partial<ContactFormData> & { notes?: string }>({
    name: '',
    email: '',
    phone: '',
    tags: [],
    notes: '' // Campo local, no se envía a la API directamente
  });

  const [tagInput, setTagInput] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Poblar formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      if (contact) {
        // Modo edición
        setFormData({
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          tags: contact.tags || [],
          notes: '' // Reseteado
        });
      } else if (conversationPhone) {
        // Crear desde conversación
        setFormData({
          name: conversationPhone,
          email: '',
          phone: conversationPhone,
          tags: [],
          notes: `Contacto creado desde conversación de ${conversationPhone}`
        });
      } else {
        // Nuevo contacto limpio
        setFormData({ name: '', email: '', phone: '', tags: [], notes: '' });
      }
      setErrors({});
      setTagInput('');
    }
  }, [isOpen, contact, conversationPhone]);

  // Mutación para guardar contacto
  const saveContactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      logger.api(isEditing ? 'Editando contacto' : 'Creando contacto', {
        contactId: contact?.id,
        phone: data.phone,
        name: data.name
      });

      if (isEditing && contact) {
        // Actualizar contacto existente
        return await api.put(`/contacts/${contact.id}`, data);
      } else {
        // Crear nuevo contacto
        return await api.post('/contacts', data);
      }
    },
    onSuccess: (savedContact: Contact) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      logger.api('✅ Contacto guardado exitosamente', {
        contactId: savedContact.id,
        operation: isEditing ? 'edit' : 'create'
      });

      toast({
        title: isEditing ? "Contacto actualizado" : "Contacto creado",
        description: `El contacto ${savedContact.name} ha sido ${isEditing ? 'actualizado' : 'creado'} exitosamente.`,
      });

      // Callback opcional
      onSave?.(savedContact);
      
      // Cerrar modal
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Error guardando contacto";
      
      logger.api('❌ Error guardando contacto', { error: errorMessage }, true);
      
      // Manejar errores de validación
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      
      toast({
        variant: "destructive",
        title: "Error guardando contacto",
        description: errorMessage,
      });
    },
  });

  // Validación del formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canProceed) {
      toast({
        variant: "destructive",
        title: "Sin permisos",
        description: "No tienes permisos para realizar esta acción.",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    saveContactMutation.mutate(formData);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🟢 Lógica para manejar tags
  const handleAddTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(tag => tag !== tagToRemove) }));
  };


  if (!canProceed) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-400" />
              Sin permisos
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">
            No tienes permisos para {isEditing ? 'editar' : 'crear'} contactos.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
            {isCreatingFromConversation && (
              <Badge variant="outline" className="ml-2">
                Desde Conversación
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar y Información Básica */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={contact?.avatarUrl} />
              <AvatarFallback className="bg-gray-700 text-gray-300 text-xl">
                {formData.name.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre completo del contacto"
                  className="bg-gray-800 border-gray-600 text-white"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@ejemplo.com"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono *
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+52 555 123 4567"
              className="bg-gray-800 border-gray-600 text-white"
              disabled={isCreatingFromConversation} // No editable si viene de conversación
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 🟢 NUEVO: Campo para gestionar Tags */}
          <div>
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Etiquetas
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Añadir etiqueta y presionar Enter"
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button type="button" onClick={handleAddTag}>Añadir</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 font-bold">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          {/* ❌ ELIMINADO: Selectores de Estado y Canal, y campo de Sección */}

          {/* Notas */}
          <div>
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas adicionales sobre el contacto..."
              className="bg-gray-800 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={saveContactMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={saveContactMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saveContactMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'} Contacto
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 