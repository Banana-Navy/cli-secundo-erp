"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronsUpDown, Check, Search } from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyPopoverOpen, setPropertyPopoverOpen] = useState(false);

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
      entity_id: "",
      visit_type: "sur_site",
      assigned_agent_id: "",
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
          .order("reference"),
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
      setPropertySearch("");
      if (visit) {
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

  const filteredProperties = useMemo(() => {
    if (!propertySearch) return properties;
    const q = propertySearch.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.reference && p.reference.toLowerCase().includes(q))
    );
  }, [properties, propertySearch]);

  const selectedProperty = properties.find(
    (p) => p.id === form.watch("property_id")
  );

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
        toast.error("Erreur lors de la mise à jour.");
        return;
      }
      toast.success("Visite mise à jour.");
    } else {
      const { error } = await supabase.from("visits").insert(payload);

      if (error) {
        toast.error("Erreur lors de la création.");
        return;
      }
      toast.success("Visite créée.");
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
                    <FormLabel>Durée (min)</FormLabel>
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
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Aucun</SelectItem>
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

              {/* Property — searchable combobox */}
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bien</FormLabel>
                    <Popover
                      open={propertyPopoverOpen}
                      onOpenChange={setPropertyPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal h-9 px-3",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {selectedProperty
                                ? selectedProperty.reference
                                  ? `${selectedProperty.reference} — ${selectedProperty.title}`
                                  : selectedProperty.title
                                : "Aucun"}
                            </span>
                            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0" align="start">
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            placeholder="Rechercher un bien..."
                            value={propertySearch}
                            onChange={(e) => setPropertySearch(e.target.value)}
                            className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                          <button
                            type="button"
                            className={cn(
                              "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent",
                              !field.value && "bg-accent"
                            )}
                            onClick={() => {
                              field.onChange("");
                              setPropertyPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Aucun
                          </button>
                          {filteredProperties.map((prop) => (
                            <button
                              type="button"
                              key={prop.id}
                              className={cn(
                                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent",
                                field.value === prop.id && "bg-accent"
                              )}
                              onClick={() => {
                                field.onChange(prop.id);
                                setPropertyPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  field.value === prop.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">
                                {prop.reference
                                  ? `${prop.reference} — ${prop.title}`
                                  : prop.title}
                              </span>
                            </button>
                          ))}
                          {filteredProperties.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                              Aucun bien trouvé.
                            </p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
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
                    ? "Mettre à jour"
                    : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
