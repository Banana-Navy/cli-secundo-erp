"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client, Property } from "@/types";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "contrat", label: "Contrat" },
  { value: "facture", label: "Facture" },
  { value: "compromis", label: "Compromis" },
  { value: "acte", label: "Acte" },
  { value: "photo", label: "Photo" },
  { value: "plan", label: "Plan" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "autre", label: "Autre" },
];

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onSaved,
}: DocumentUploadDialogProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("autre");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [uploading, setUploading] = useState(false);

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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setName("");
      setCategory("autre");
      setNotes("");
      setClientId("");
      setPropertyId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !name) {
      // Auto-fill name from file name (without extension)
      const fileName = selected.name.replace(/\.[^/.]+$/, "");
      setName(fileName);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier.");
      return;
    }
    if (!name.trim()) {
      toast.error("Veuillez saisir un nom pour le document.");
      return;
    }

    setUploading(true);

    // Generate a unique path for storage
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${timestamp}_${sanitizedName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur lors du téléversement du fichier.");
      setUploading(false);
      return;
    }

    // Insert record in documents table
    const { error: dbError } = await supabase.from("documents").insert({
      name: name.trim(),
      file_url: filePath,
      file_type: file.type || "application/octet-stream",
      category,
      notes,
      client_id: clientId || null,
      property_id: propertyId || null,
    });

    setUploading(false);

    if (dbError) {
      toast.error("Erreur lors de l'enregistrement du document.");
      // Try to clean up the uploaded file
      await supabase.storage.from("documents").remove([filePath]);
    } else {
      toast.success("Document téléversé avec succès.");
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau document</DialogTitle>
          <DialogDescription>
            Téléversez un fichier et remplissez les informations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File input */}
          <div className="space-y-2">
            <Label>Fichier</Label>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer hover:border-primary/50",
                file ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload
                className={cn(
                  "h-8 w-8",
                  file ? "text-primary" : "text-muted-foreground"
                )}
              />
              {file ? (
                <p className="text-sm font-medium">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner un fichier
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du document"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes optionnelles..."
              rows={2}
            />
          </div>

          {/* Client (optional) */}
          <div className="space-y-2">
            <Label>
              Client{" "}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.last_name} {c.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property (optional) */}
          <div className="space-y-2">
            <Label>
              Bien immobilier{" "}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                    {p.reference ? ` (${p.reference})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Téléversement..." : "Téléverser"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
