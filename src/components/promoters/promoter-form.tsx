"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useEntity } from "@/lib/hooks/use-entity";
import { toast } from "sonner";
import { promoterSchema, type PromoterSchemaType } from "@/lib/validations/promoter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Promoter } from "@/types";

interface PromoterFormProps {
  promoter?: Promoter;
}

export function PromoterForm({ promoter }: PromoterFormProps) {
  const router = useRouter();
  const isEditing = !!promoter;
  const { entities, activeEntity } = useEntity();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PromoterSchemaType>({
    resolver: zodResolver(promoterSchema),
    defaultValues: promoter
      ? {
          name: promoter.name,
          country: promoter.country,
          website: promoter.website,
          phone: promoter.phone,
          email: promoter.email,
          contact_person: promoter.contact_person,
          notes: promoter.notes,
          entity_id: promoter.entity_id,
        }
      : {
          name: "",
          country: "ES",
          website: "",
          phone: "",
          email: "",
          contact_person: "",
          notes: "",
          entity_id: activeEntity?.id ?? null,
        },
  });

  async function onSubmit(data: PromoterSchemaType) {
    const supabase = createClient();

    if (isEditing) {
      const { error } = await supabase
        .from("promoters")
        .update(data)
        .eq("id", promoter.id);
      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }
      toast.success("Promoteur mis à jour");
      router.push(`/promoteurs/${promoter.id}`);
    } else {
      const { data: newPromoter, error } = await supabase
        .from("promoters")
        .insert(data)
        .select("id")
        .single();
      if (error) {
        toast.error("Erreur lors de la création");
        return;
      }
      toast.success("Promoteur créé");
      router.push(`/promoteurs/${newPromoter.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du promoteur</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input id="country" {...register("country")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_person">Personne de contact</Label>
            <Input id="contact_person" {...register("contact_person")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input id="website" {...register("website")} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entity_id">Entité</Label>
            <select
              id="entity_id"
              {...register("entity_id")}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="">Aucune</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={3}
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
            : "Créer le promoteur"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
