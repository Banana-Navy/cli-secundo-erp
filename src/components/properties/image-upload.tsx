"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Upload, X, Star, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyImage } from "@/types";

interface ImageUploadProps {
  propertyId: string;
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
}

export function ImageUpload({ propertyId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const supabase = createClient();
    const newImages: PropertyImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        continue;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Format accepté : JPG, PNG ou WebP");
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${propertyId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(path, file);

      if (uploadError) {
        toast.error(`Erreur upload: ${file.name}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(path);

      const { data, error } = await supabase
        .from("property_images")
        .insert({
          property_id: propertyId,
          url: publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sort_order: images.length + i,
          is_cover: images.length === 0 && i === 0,
        })
        .select()
        .single();

      if (!error && data) {
        newImages.push(data as PropertyImage);
      }
    }

    onImagesChange([...images, ...newImages]);
    toast.success(`${newImages.length} image(s) ajoutée(s)`);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove(image: PropertyImage) {
    const supabase = createClient();

    // Delete from storage
    const urlParts = image.url.split("/property-images/");
    if (urlParts[1]) {
      await supabase.storage.from("property-images").remove([urlParts[1]]);
    }

    // Delete from DB
    const { error } = await supabase
      .from("property_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    const updated = images.filter((img) => img.id !== image.id);
    onImagesChange(updated);
    toast.success("Image supprimée");
  }

  async function handleSetCover(image: PropertyImage) {
    const supabase = createClient();

    // Unset all covers for this property
    await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", propertyId);

    // Set the new cover
    await supabase
      .from("property_images")
      .update({ is_cover: true })
      .eq("id", image.id);

    const updated = images.map((img) => ({
      ...img,
      is_cover: img.id === image.id,
    }));
    onImagesChange(updated);
    toast.success("Image de couverture définie");
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          {uploading ? "Upload en cours..." : "Cliquez ou glissez vos images ici"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG ou WebP (max 5 Mo)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          disabled={uploading}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border aspect-square"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover"
              />
              {image.is_cover && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Star className="h-3 w-3" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_cover && (
                  <Button
                    size="icon-xs"
                    variant="secondary"
                    onClick={() => handleSetCover(image)}
                    title="Définir comme couverture"
                    aria-label="Définir comme image de couverture"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="icon-xs"
                  variant="destructive"
                  onClick={() => handleRemove(image)}
                  title="Supprimer"
                  aria-label="Supprimer cette image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
