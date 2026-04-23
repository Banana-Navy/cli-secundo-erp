"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useEntity } from "@/lib/hooks/use-entity";
import { toast } from "sonner";
import { clientSchema, type ClientSchemaType } from "@/lib/validations/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import {
  LEAD_SOURCE_LABELS,
  LEAD_TEMPERATURE_LABELS,
  SPANISH_REGIONS,
} from "@/types";
import type { Client, LeadSource, LeadTemperature } from "@/types";

interface ClientFormProps {
  client?: Client;
  clientEntityIds?: string[];
}

export function ClientForm({ client, clientEntityIds = [] }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!client;
  const { entities, activeEntity } = useEntity();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          nationality: client.nationality ?? "",
          lead_source: client.lead_source ?? "autre",
          lead_source_detail: client.lead_source_detail ?? "",
          lead_temperature: client.lead_temperature ?? "neutre",
          referrer_name: client.referrer_name ?? "",
          regions_of_interest: client.regions_of_interest ?? [],
          callback_date: client.callback_date
            ? client.callback_date.slice(0, 16)
            : "",
          utm_source: client.utm_source ?? "",
          utm_medium: client.utm_medium ?? "",
          utm_campaign: client.utm_campaign ?? "",
          utm_content: client.utm_content ?? "",
          utm_term: client.utm_term ?? "",
          entity_ids: clientEntityIds,
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
          nationality: "",
          lead_source: "autre",
          lead_source_detail: "",
          lead_temperature: "neutre",
          referrer_name: "",
          regions_of_interest: [],
          callback_date: "",
          utm_source: "",
          utm_medium: "",
          utm_campaign: "",
          utm_content: "",
          utm_term: "",
          entity_ids: activeEntity ? [activeEntity.id] : [],
        },
  });

  const selectedRegions = watch("regions_of_interest") ?? [];
  const selectedEntityIds = watch("entity_ids") ?? [];

  function toggleRegion(region: string) {
    const current = selectedRegions;
    const next = current.includes(region)
      ? current.filter((r) => r !== region)
      : [...current, region];
    setValue("regions_of_interest", next);
  }

  function toggleEntity(entityId: string) {
    const current = selectedEntityIds;
    const next = current.includes(entityId)
      ? current.filter((id) => id !== entityId)
      : [...current, entityId];
    setValue("entity_ids", next);
  }

  async function onSubmit(data: ClientSchemaType) {
    const supabase = createClient();

    const { entity_ids, callback_date, ...clientData } = data;
    const submitData = {
      ...clientData,
      callback_date: callback_date || null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("clients")
        .update(submitData)
        .eq("id", client.id);
      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }

      // Update client_entities
      await supabase
        .from("client_entities")
        .delete()
        .eq("client_id", client.id);
      if (entity_ids && entity_ids.length > 0) {
        await supabase.from("client_entities").insert(
          entity_ids.map((eid) => ({
            client_id: client.id,
            entity_id: eid,
            client_role: "buyer" as const,
          }))
        );
      }

      toast.success("Client mis à jour");
      router.push(`/clients/${client.id}`);
    } else {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert(submitData)
        .select("id")
        .single();
      if (error) {
        toast.error("Erreur lors de la création");
        return;
      }

      // Create client_entities
      if (entity_ids && entity_ids.length > 0) {
        await supabase.from("client_entities").insert(
          entity_ids.map((eid) => ({
            client_id: newClient.id,
            entity_id: eid,
            client_role: "buyer" as const,
          }))
        );
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
            <Input id="phone" {...register("phone")} placeholder="+32 470 17 46 41" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationalité</Label>
            <Input id="nationality" {...register("nationality")} placeholder="Belge" />
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
          <CardTitle>Lead & Source</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lead_temperature">Température</Label>
            <select
              id="lead_temperature"
              {...register("lead_temperature")}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {(Object.entries(LEAD_TEMPERATURE_LABELS) as [LeadTemperature, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead_source">Source</Label>
            <select
              id="lead_source"
              {...register("lead_source")}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {(Object.entries(LEAD_SOURCE_LABELS) as [LeadSource, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead_source_detail">Détail source</Label>
            <Input
              id="lead_source_detail"
              {...register("lead_source_detail")}
              placeholder="Précisions sur la source..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referrer_name">Apporteur d&apos;affaire</Label>
            <Input
              id="referrer_name"
              {...register("referrer_name")}
              placeholder="Nom de l'apporteur..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback_date">Date de rappel</Label>
            <Input
              id="callback_date"
              type="datetime-local"
              {...register("callback_date")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking UTM</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="utm_source">Source</Label>
            <Input
              id="utm_source"
              {...register("utm_source")}
              placeholder="google, facebook, mailchimp"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utm_medium">Medium</Label>
            <Input
              id="utm_medium"
              {...register("utm_medium")}
              placeholder="cpc, email, social"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utm_campaign">Campagne</Label>
            <Input
              id="utm_campaign"
              {...register("utm_campaign")}
              placeholder="costa_sol_avril_2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utm_content">Contenu</Label>
            <Input
              id="utm_content"
              {...register("utm_content")}
              placeholder="banner_villa, btn_brochure"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utm_term">Terme</Label>
            <Input
              id="utm_term"
              {...register("utm_term")}
              placeholder="villa espagne prix"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Régions d&apos;intérêt (Espagne)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SPANISH_REGIONS.map((region) => {
              const isSelected = selectedRegions.includes(region);
              return (
                <Badge
                  key={region}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleRegion(region)}
                >
                  {region}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entities.map((entity) => {
                const isSelected = selectedEntityIds.includes(entity.id);
                return (
                  <Badge
                    key={entity.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer select-none gap-1.5"
                    onClick={() => toggleEntity(entity.id)}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entity.color || "var(--primary)" }}
                    />
                    {entity.name}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
