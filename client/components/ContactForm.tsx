import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateContact, useUpdateContact } from "@/hooks/useContacts";
import type { Contact, ContactFormData } from "@/types/api";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(5, "El teléfono es requerido"),
  status: z.enum(["new-lead", "hot-lead", "payment", "customer"]),
});

interface ContactFormProps {
    contact?: Contact | null;
    onSave: () => void;
    onCancel: () => void;
}

export function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: contact || { status: 'new-lead' }
    });

    const createContact = useCreateContact();
    const updateContact = useUpdateContact();

    const onSubmit = (data: ContactFormData) => {
        if (contact) {
            updateContact.mutate({ contactId: contact.id, data }, {
                onSuccess: () => onSave()
            });
        } else {
            createContact.mutate(data, {
                onSuccess: () => onSave()
            });
        }
    };
    
    useEffect(() => {
        reset(contact || { name: '', email: '', phone: '', status: 'new-lead' });
    }, [contact, reset]);

    const isLoading = createContact.isLoading || updateContact.isLoading;

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">{contact ? 'Editar Contacto' : 'Crear Contacto'}</h3>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div>
                        <label>Nombre</label>
                        <Input {...register("name")} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                     <div>
                        <label>Email</label>
                        <Input {...register("email")} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                     <div>
                        <label>Teléfono</label>
                        <Input {...register("phone")} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                     <div>
                        <label>Estado</label>
                        <select {...register("status")} className="w-full p-2 bg-gray-800 rounded">
                            <option value="new-lead">Nuevo Lead</option>
                            <option value="hot-lead">Hot Lead</option>
                            <option value="payment">Pago</option>
                            <option value="customer">Cliente</option>
                        </select>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Guardar'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
} 