import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// import { Controller } from "react-hook-form"; // TODO: Usar cuando se implemente funcionalidad de Controller
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, X, Plus, Loader2, Save, User } from "lucide-react";
// import { cn } from "@/lib/utils"; // TODO: Usar cuando se implemente funcionalidad de cn
import { useCreateContact, useUpdateContact, useContactTags } from "@/hooks/useContacts";
import type { Contact, CreateContactRequest, UpdateContactRequest } from "@shared/api";

// Esquema de validación con Yup
const contactSchema = yup.object({
  firstName: yup
    .string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  
  lastName: yup
    .string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  
  email: yup
    .string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),
  
  phone: yup
    .string()
    .required("El teléfono es obligatorio")
    .matches(/^[+]?[\d\s\-()]+$/, "Formato de teléfono inválido")
    .min(10, "El teléfono debe tener al menos 10 dígitos"),
  
  company: yup
    .string()
    .max(100, "El nombre de la empresa no puede exceder 100 caracteres"),
  
  position: yup
    .string()
    .max(100, "El cargo no puede exceder 100 caracteres"),
  
  channel: yup
    .string()
    .oneOf(["whatsapp", "facebook", "instagram", "telegram", "email", "phone", "web"], "Canal inválido")
    .required("El canal es obligatorio"),
  
  status: yup
    .string()
    .oneOf(["lead", "customer", "inactive"], "Estado inválido")
    .required("El estado es obligatorio"),
  
  notes: yup
    .string()
    .max(1000, "Las notas no pueden exceder 1000 caracteres"),
  
  tags: yup
    .array()
    .of(yup.string())
    .max(10, "No se pueden agregar más de 10 etiquetas"),

  // Campos adicionales opcionales
  website: yup
    .string()
    .url("Debe ser una URL válida")
    .nullable(),
  
  address: yup
    .string()
    .max(200, "La dirección no puede exceder 200 caracteres"),
  
  city: yup
    .string()
    .max(50, "La ciudad no puede exceder 50 caracteres"),
  
  country: yup
    .string()
    .max(50, "El país no puede exceder 50 caracteres"),
  
  birthDate: yup
    .date()
    .nullable()
    .max(new Date(), "La fecha de nacimiento no puede ser futura"),
});

type ContactFormData = yup.InferType<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContactForm({ contact, isOpen, onClose, onSuccess }: ContactFormProps) {
  const [newTag, setNewTag] = useState("");
  const isEditing = !!contact;

  // Hooks de React Query
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const { data: availableTags } = useContactTags();

  // React Hook Form setup
  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      channel: "whatsapp",
      status: "lead",
      notes: "",
      tags: [],
      website: "",
      address: "",
      city: "",
      country: "",
      birthDate: null,
    },
  });

  // Rellenar formulario cuando se abre para edición
  useEffect(() => {
    if (isOpen && contact) {
      form.reset({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company || "",
        position: contact.position || "",
        channel: contact.channel,
        status: contact.status,
        notes: contact.notes || "",
        tags: contact.tags || [],
        website: contact.website || "",
        address: contact.address || "",
        city: contact.city || "",
        country: contact.country || "",
        birthDate: contact.birthDate ? new Date(contact.birthDate) : null,
      });
    } else if (isOpen) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        channel: "whatsapp",
        status: "lead",
        notes: "",
        tags: [],
        website: "",
        address: "",
        city: "",
        country: "",
        birthDate: null,
      });
    }
  }, [isOpen, contact, form]);

  // Función para manejar el envío del formulario
  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && contact) {
        // Actualizar contacto existente
        const updateData: UpdateContactRequest = {
          ...data,
          birthDate: data.birthDate?.toISOString(),
        };
        await updateMutation.mutateAsync({
          id: contact.id,
          data: updateData,
        });
      } else {
        // Crear nuevo contacto
        const createData: CreateContactRequest = {
          ...data,
          birthDate: data.birthDate?.toISOString(),
        };
        await createMutation.mutateAsync(createData);
      }

      // Resetear formulario y cerrar modal
      form.reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error al guardar contacto:", error);
    }
  };

  // Función para agregar nueva etiqueta
  const handleAddTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Función para eliminar etiqueta
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter((tag) => tag !== tagToRemove));
  };

  // Estados de loading
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const hasError = createMutation.isError || updateMutation.isError;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {isEditing ? "Editar Contacto" : "Nuevo Contacto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error general */}
            {hasError && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {errorMessage || "Error al guardar contacto. Inténtalo de nuevo."}
                </span>
              </div>
            )}

            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Juan"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Pérez"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="juan@ejemplo.com"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+52 55 1234 5678"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Información profesional */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Información Profesional
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Empresa S.A."
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Gerente de Ventas"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://www.empresa.com"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-gray-700" />

            {/* Estado y canal */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Configuración
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal de Contacto *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Selecciona canal..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="whatsapp" className="text-white">WhatsApp</SelectItem>
                          <SelectItem value="facebook" className="text-white">Facebook</SelectItem>
                          <SelectItem value="instagram" className="text-white">Instagram</SelectItem>
                          <SelectItem value="telegram" className="text-white">Telegram</SelectItem>
                          <SelectItem value="email" className="text-white">Email</SelectItem>
                          <SelectItem value="phone" className="text-white">Teléfono</SelectItem>
                          <SelectItem value="web" className="text-white">Sitio Web</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Selecciona estado..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="lead" className="text-white">Lead</SelectItem>
                          <SelectItem value="customer" className="text-white">Cliente</SelectItem>
                          <SelectItem value="inactive" className="text-white">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Ubicación
              </h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Av. Reforma 123, Col. Centro"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ciudad de México"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="México"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Etiquetas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Etiquetas
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta..."
                    className="bg-gray-800 border-gray-600 text-white flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Etiquetas actuales */}
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags").map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-900/30 text-blue-300 border border-blue-700/50"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Etiquetas sugeridas */}
                {availableTags && availableTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Etiquetas sugeridas:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableTags
                        .filter((tag) => !form.watch("tags").includes(tag))
                        .slice(0, 10)
                        .map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentTags = form.getValues("tags");
                              form.setValue("tags", [...currentTags, tag]);
                            }}
                            className="text-xs text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            + {tag}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Información adicional sobre el contacto..."
                      className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-600 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Actualizar" : "Crear"} Contacto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 