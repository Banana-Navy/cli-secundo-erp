"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { clientSchema, type ClientSchemaType } from "@/lib/validations/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Client } from "@/types";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          country: client.country,
          notes: client.notes,
          status: client.status,
        }
      : {
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          country: "Belgique",
          notes: "",
          status: "prospect",
        },
  });

  async function onSubmit(data: ClientSchemaType) {
    const supabase = createClient();

    if (isEditing) {
      const { error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", client.id);
      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }
      toast.success("Client mis à jour");
      router.push(`/clients/${client.id}`);
    } else {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert(data)
        .select("id")
        .single();
      if (error) {
        toast.error("Erreur lors de la création");
        return;
      }
      toast.success("Client créé");
      router.push(`/clients/${newClient.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom *</Label>
            <Input id="first_name" {...register("first_name")} />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Nom *</Label>
            <Input id="last_name" {...register("last_name")} />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adresse</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input id="country" {...register("country")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autres informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              {...register("status")}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="prospect">Prospect</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={4}
              {...register("notes")}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting
            ? "Enregistrement..."
            : isEditing
            ? "Mettre à jour"
            : "Créer le client"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
