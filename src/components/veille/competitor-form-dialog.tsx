"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Competitor } from "@/types";

interface CompetitorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  competitor?: Competitor | null;
}

const FIELDS: {
  key: keyof Omit<Competitor, "id" | "created_at" | "updated_at">;
  label: string;
  placeholder: string;
  type?: "url" | "text";
}[] = [
  { key: "name", label: "Nom", placeholder: "Ex: Zap Invest" },
  {
    key: "website_url",
    label: "Site web",
    placeholder: "https://...",
    type: "url",
  },
  {
    key: "google_maps_url",
    label: "Google Maps",
    placeholder: "https://maps.google.com/...",
    type: "url",
  },
  {
    key: "facebook_url",
    label: "Facebook",
    placeholder: "https://facebook.com/...",
    type: "url",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    placeholder: "https://instagram.com/...",
    type: "url",
  },
  {
    key: "linkedin_url",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/...",
    type: "url",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    placeholder: "https://youtube.com/...",
    type: "url",
  },
  {
    key: "tiktok_url",
    label: "TikTok",
    placeholder: "https://tiktok.com/...",
    type: "url",
  },
];

export function CompetitorFormDialog({
  open,
  onOpenChange,
  onSaved,
  competitor,
}: CompetitorFormDialogProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    website_url: "",
    google_maps_url: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    tiktok_url: "",
    notes: "",
  });

  useEffect(() => {
    if (open && competitor) {
      setForm({
        name: competitor.name ?? "",
        website_url: competitor.website_url ?? "",
        google_maps_url: competitor.google_maps_url ?? "",
        facebook_url: competitor.facebook_url ?? "",
        instagram_url: competitor.instagram_url ?? "",
        linkedin_url: competitor.linkedin_url ?? "",
        youtube_url: competitor.youtube_url ?? "",
        tiktok_url: competitor.tiktok_url ?? "",
        notes: competitor.notes ?? "",
      });
    } else if (open) {
      setForm({
        name: "",
        website_url: "",
        google_maps_url: "",
        facebook_url: "",
        instagram_url: "",
        linkedin_url: "",
        youtube_url: "",
        tiktok_url: "",
        notes: "",
      });
    }
  }, [open, competitor]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom du concurrent est requis.");
      return;
    }

    setSaving(true);

    if (competitor) {
      const { error } = await supabase
        .from("competitors")
        .update(form)
        .eq("id", competitor.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour.");
      } else {
        toast.success("Concurrent mis à jour.");
        onOpenChange(false);
        onSaved();
      }
    } else {
      const { error } = await supabase.from("competitors").insert(form);

      if (error) {
        toast.error("Erreur lors de l'ajout.");
      } else {
        toast.success("Concurrent ajouté.");
        onOpenChange(false);
        onSaved();
      }
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {competitor ? "Modifier le concurrent" : "Ajouter un concurrent"}
          </DialogTitle>
          <DialogDescription>
            {competitor
              ? "Modifiez les informations du concurrent."
              : "Ajoutez un concurrent à surveiller."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                type={type ?? "text"}
                value={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Notes sur ce concurrent..."
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
              : competitor
                ? "Mettre à jour"
                : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
