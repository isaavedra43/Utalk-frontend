import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateContact, useUpdateContact } from "@/hooks/useContacts";
import type { Contact, ContactFormData } from "@/types/api";
import { contactSchema } from "@/lib/schemas";

interface ContactFormProps {
    contact?: Contact | null;
    onSave: () => void;
    onCancel: () => void;
}

export function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: contact || {}
    });

    const createContact = useCreateContact();
    const updateContact = useUpdateContact();

    const onSubmit = (data: ContactFormData) => {
        if (contact) {
            updateContact.mutate({ id: contact.id, data }, {
                onSuccess: () => onSave()
            });
        } else {
            createContact.mutate(data, {
                onSuccess: () => onSave()
            });
        }
    };
    
    useEffect(() => {
        reset(contact || { name: '', email: '', phone: '' });
    }, [contact, reset]);

    const isLoading = createContact.isPending || updateContact.isPending;

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