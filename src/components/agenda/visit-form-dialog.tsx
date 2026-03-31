"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { visitSchema, type VisitSchemaType } from "@/lib/validations/visit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VISIT_STATUS_LABELS } from "@/types";
import type { VisitWithRelations, VisitStatus, Client, Property } from "@/types";

interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit?: VisitWithRelations | null;
  onSaved: () => void;
}

export function VisitFormDialog({
  open,
  onOpenChange,
  visit,
  onSaved,
}: VisitFormDialogProps) {
  const supabase = createClient();
  const [clients, setClients] = useState<Pick<Client, "id" | "first_name" | "last_name">[]>([]);
  const [properties, setProperties] = useState<Pick<Property, "id" | "title" | "reference">[]>([]);

  const form = useForm<VisitSchemaType>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      title: "",
      visit_date: "",
      duration_minutes: 60,
      location: "",
      notes: "",
      status: "planifiee",
      client_id: "",
      property_id: "",
    },
  });

  // Fetch clients and properties for dropdowns
  useEffect(() => {
    if (!open) return;

    async function fetchOptions() {
      const [clientsRes, propertiesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, first_name, last_name")
          .order("last_name"),
        supabase
          .from("properties")
          .select("id, title, reference")
          .order("title"),
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (propertiesRes.data) setProperties(propertiesRes.data);
    }

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (visit) {
        // Convert ISO date to datetime-local format
        const visitDate = visit.visit_date
          ? new Date(visit.visit_date).toISOString().slice(0, 16)
          : "";

        form.reset({
          title: visit.title,
          visit_date: visitDate,
          duration_minutes: visit.duration_minutes,
          location: visit.location ?? "",
          notes: visit.notes ?? "",
          status: visit.status,
          client_id: visit.client_id ?? "",
          property_id: visit.property_id ?? "",
        });
      } else {
        form.reset({
          title: "",
          visit_date: "",
          duration_minutes: 60,
          location: "",
          notes: "",
          status: "planifiee",
          client_id: "",
          property_id: "",
        });
      }
    }
  }, [open, visit, form]);

  async function onSubmit(values: VisitSchemaType) {
    const payload = {
      ...values,
      visit_date: new Date(values.visit_date).toISOString(),
      client_id: values.client_id || null,
      property_id: values.property_id || null,
    };

    if (visit) {
      const { error } = await supabase
        .from("visits")
        .update(payload)
        .eq("id", visit.id);

      if (error) {
        toast.error("Erreur lors de la mise a jour.");
        return;
      }
      toast.success("Visite mise a jour.");
    } else {
      const { error } = await supabase.from("visits").insert(payload);

      if (error) {
        toast.error("Erreur lors de la creation.");
        return;
      }
      toast.success("Visite creee.");
    }

    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {visit ? "Modifier la visite" : "Nouvelle visite"}
          </DialogTitle>
          <DialogDescription>
            {visit
              ? "Modifiez les informations de la visite."
              : "Planifiez une nouvelle visite."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la visite" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Duration row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date et heure</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duree (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        max={480}
                        step={15}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse ou lieu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.entries(VISIT_STATUS_LABELS) as [
                          VisitStatus,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client & Property row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.last_name} {client.first_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bien</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        {properties.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.reference ? `${prop.reference} — ` : ""}
                            {prop.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes (optionnel)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Enregistrement..."
                  : visit
                    ? "Mettre a jour"
                    : "Creer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
