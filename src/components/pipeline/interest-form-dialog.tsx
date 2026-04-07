"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Client,
  Property,
  InterestWithRelations,
  InterestStatus,
} from "@/types";
import { INTEREST_STATUS_LABELS } from "@/types";

interface InterestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interest?: InterestWithRelations | null;
  onSaved: () => void;
}

const STATUSES: InterestStatus[] = [
  "interesse",
  "visite_planifiee",
  "offre_faite",
  "refuse",
  "achete",
];

export function InterestFormDialog({
  open,
  onOpenChange,
  interest,
  onSaved,
}: InterestFormDialogProps) {
  const supabase = createClient();
  const isEditing = !!interest;

  const [clientId, setClientId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [status, setStatus] = useState<InterestStatus>("interesse");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [clients, setClients] = useState<
    Pick<Client, "id" | "first_name" | "last_name">[]
  >([]);
  const [properties, setProperties] = useState<
    Pick<Property, "id" | "title" | "reference">[]
  >([]);

  // Fetch clients and properties for dropdowns
  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
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
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (interest) {
      setClientId(interest.client_id);
      setPropertyId(interest.property_id);
      setStatus(interest.status);
      setNote(interest.notes ?? "");
    } else {
      setClientId("");
      setPropertyId("");
      setStatus("interesse");
      setNote("");
    }
  }, [interest, open]);

  const handleSubmit = async () => {
    if (!clientId || !propertyId) {
      toast.error("Veuillez sélectionner un client et un bien.");
      return;
    }

    setSaving(true);

    const payload = {
      client_id: clientId,
      property_id: propertyId,
      status,
      notes: note,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (isEditing) {
      ({ error } = await supabase
        .from("client_property_interests")
        .update(payload)
        .eq("id", interest.id));
    } else {
      ({ error } = await supabase
        .from("client_property_interests")
        .insert(payload));
    }

    setSaving(false);

    if (error) {
      toast.error(
        isEditing
          ? "Erreur lors de la mise à jour."
          : "Erreur lors de la création."
      );
    } else {
      toast.success(
        isEditing ? "Intérêt mis à jour." : "Intérêt créé avec succès."
      );
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'intérêt" : "Nouvel intérêt"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de cet intérêt client."
              : "Associez un client à un bien immobilier."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client */}
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.last_name} {c.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property */}
          <div className="space-y-2">
            <Label>Bien immobilier</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un bien" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                    {p.reference ? ` (${p.reference})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as InterestStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {INTEREST_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajouter une note..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving
              ? "Enregistrement..."
              : isEditing
                ? "Mettre à jour"
                : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
