"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { propertySchema, type PropertySchemaType } from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "./image-upload";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_CONDITION_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_CATEGORY_LABELS,
  PUBLICATION_STATUS_LABELS,
  FEATURES_LABELS,
} from "@/types";
import type {
  Property,
  PropertyImage,
  PropertyType,
  PropertyCondition,
  PropertyStatus,
  PublicationStatus,
  Promoter,
  Entity,
} from "@/types";
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, Loader2, Plus, X, Youtube } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormStep = "edit" | "translate";

interface PropertyFormProps {
  property?: Property;
  images?: PropertyImage[];
}

export function PropertyForm({ property, images: initialImages }: PropertyFormProps) {
  const router = useRouter();
  const isEditing = !!property;
  const [images, setImages] = useState<PropertyImage[]>(initialImages ?? []);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(
    property?.id ?? null
  );
  const [step, setStep] = useState<FormStep>("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslatingNl, setIsTranslatingNl] = useState(false);
  const [isTranslatingEn, setIsTranslatingEn] = useState(false);
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("promoters").select("*").order("name"),
      supabase.from("entities").select("*").order("name"),
    ]).then(([{ data: p }, { data: e }]) => {
      setPromoters((p ?? []) as Promoter[]);
      setEntities((e ?? []) as Entity[]);
    });
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<PropertySchemaType>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(propertySchema) as any,
    defaultValues: property
      ? {
          title: property.title,
          description: property.description,
          price: property.price,
          surface: property.surface,
          rooms: property.rooms,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          property_type: property.property_type,
          condition: property.condition,
          status: property.status,
          location_city: property.location_city,
          location_region: property.location_region,
          location_address: property.location_address,
          latitude: property.latitude,
          longitude: property.longitude,
          features: property.features ?? {},
          year_built: property.year_built,
          energy_rating: property.energy_rating,
          reference: property.reference ?? "",
          title_nl: property.title_nl ?? "",
          title_en: property.title_en ?? "",
          description_nl: property.description_nl ?? "",
          description_en: property.description_en ?? "",
          slug_fr: property.slug_fr,
          slug_nl: property.slug_nl ?? "",
          slug_en: property.slug_en ?? "",
          published: property.published,
          client_id: property.client_id,
          entity_id: property.entity_id,
          promoter_id: property.promoter_id,
          category: property.category ?? "residentiel",
          youtube_urls: property.youtube_urls ?? [],
          publication_status: property.publication_status ?? "brouillon",
        }
      : {
          title: "",
          description: "",
          price: 0,
          surface: 0,
          rooms: 0,
          bedrooms: 0,
          bathrooms: 0,
          property_type: "appartement",
          condition: "bon_etat",
          status: "disponible",
          location_city: "",
          location_region: "",
          location_address: "",
          latitude: null,
          longitude: null,
          features: {},
          year_built: null,
          energy_rating: "",
          reference: "",
          title_nl: "",
          title_en: "",
          description_nl: "",
          description_en: "",
          slug_fr: "",
          slug_nl: "",
          slug_en: "",
          published: false,
          client_id: null,
          entity_id: null,
          promoter_id: null,
          category: "residentiel",
          youtube_urls: [],
          publication_status: "brouillon",
        },
  });

  const title = watch("title");
  const features = watch("features");
  const youtubeUrls = watch("youtube_urls") ?? [];

  function addYoutubeUrl() {
    const url = newYoutubeUrl.trim();
    if (!url) return;
    setValue("youtube_urls", [...youtubeUrls, url]);
    setNewYoutubeUrl("");
  }

  function removeYoutubeUrl(index: number) {
    setValue("youtube_urls", youtubeUrls.filter((_, i) => i !== index));
  }

  function handleTitleBlur() {
    const currentSlug = watch("slug_fr");
    if (!currentSlug && title) {
      setValue("slug_fr", slugify(title));
    }
  }

  function toggleFeature(key: string) {
    const current = features ?? {};
    setValue("features", { ...current, [key]: !current[key] });
  }

  // Auto-generate slug from title for NL/EN
  function updateSlugFromTitle(lang: "nl" | "en") {
    const t = watch(`title_${lang}`);
    if (t) {
      setValue(`slug_${lang}`, slugify(t));
    }
  }

  async function generateDescription() {
    setIsGenerating(true);
    try {
      const values = getValues();
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyData: {
            property_type: values.property_type,
            condition: values.condition,
            price: values.price,
            surface: values.surface,
            rooms: values.rooms,
            bedrooms: values.bedrooms,
            bathrooms: values.bathrooms,
            location_city: values.location_city,
            location_region: values.location_region,
            features: values.features,
            year_built: values.year_built,
            energy_rating: values.energy_rating,
            imageUrls: images.map((img) => img.url),
          },
        }),
      });
      const data = await res.json();
      if (data.description) {
        setValue("description", data.description);
        toast.success("Description générée");
      }
    } catch {
      toast.error("Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  }

  const translateField = useCallback(
    async (field: "title" | "description", to: "nl" | "en") => {
      const text = getValues(field);
      if (!text) return "";

      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: "fr", to }),
      });
      const data = await res.json();
      return data.translated ?? "";
    },
    [getValues]
  );

  async function translateLang(lang: "nl" | "en") {
    const setLoading = lang === "nl" ? setIsTranslatingNl : setIsTranslatingEn;
    setLoading(true);
    try {
      const [translatedTitle, translatedDesc] = await Promise.all([
        translateField("title", lang),
        translateField("description", lang),
      ]);
      setValue(`title_${lang}`, translatedTitle);
      setValue(`description_${lang}`, translatedDesc);
      if (translatedTitle) {
        setValue(`slug_${lang}`, slugify(translatedTitle));
      }
      toast.success(`Traduction ${lang.toUpperCase()} générée`);
    } catch {
      toast.error(`Erreur lors de la traduction ${lang.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  }

  async function goToTranslateStep() {
    // Validate the edit step fields first
    const valid = await trigger([
      "title",
      "price",
      "location_city",
      "slug_fr",
    ]);
    if (!valid) {
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return;
    }

    setStep("translate");

    // Auto-translate only if fields are empty (new property or first time)
    const values = getValues();
    if (!values.title_nl && !values.title_en && values.title) {
      translateLang("nl");
      translateLang("en");
    }
  }

  async function onSubmit(data: PropertySchemaType) {
    const supabase = createClient();

    // Convert empty strings to null for FK fields
    const payload = {
      ...data,
      promoter_id: data.promoter_id || null,
      entity_id: data.entity_id || null,
      client_id: data.client_id || null,
    };

    if (isEditing && property) {
      const { error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", property.id);
      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }
      toast.success("Bien mis à jour");
      router.push(`/biens/${property.id}`);
    } else {
      const { data: newProp, error } = await supabase
        .from("properties")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505") {
          toast.error("Ce slug ou cette référence est déjà utilisé(e)");
        } else {
          toast.error("Erreur lors de la création");
        }
        return;
      }
      setSavedPropertyId(newProp.id);
      toast.success("Bien créé");
      router.push(`/biens/${newProp.id}`);
    }
    router.refresh();
  }

  // ---------- Step: EDIT ----------
  if (step === "edit") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToTranslateStep();
        }}
        className="space-y-6"
      >
        {/* Section 1: Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                {...register("reference")}
                placeholder="SEC-0001"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Titre (FR) *</Label>
              <Input
                id="title"
                {...register("title")}
                onBlur={handleTitleBlur}
                placeholder="Villa avec vue mer à Alicante"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description (FR)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={isGenerating}
                  className="gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Générer par IA
                </Button>
              </div>
              <textarea
                id="description"
                rows={5}
                {...register("description")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-y"
                placeholder="Description détaillée du bien..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_type">Type de bien</Label>
              <select
                id="property_type"
                {...register("property_type")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
                  <option key={t} value={t}>
                    {PROPERTY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">État</Label>
              <select
                id="condition"
                {...register("condition")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {(Object.keys(PROPERTY_CONDITION_LABELS) as PropertyCondition[]).map((c) => (
                  <option key={c} value={c}>
                    {PROPERTY_CONDITION_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                {...register("category")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {Object.entries(PROPERTY_CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promoter_id">Promoteur</Label>
              <select
                id="promoter_id"
                {...register("promoter_id")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">— Aucun —</option>
                {promoters.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity_id">Entité</Label>
              <select
                id="entity_id"
                {...register("entity_id")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">— Aucune —</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Détails */}
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€) *</Label>
              <Input id="price" type="number" step="1000" {...register("price")} />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surface">Superficie (m²)</Label>
              <Input id="surface" type="number" step="0.5" {...register("surface")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Pièces</Label>
              <Input id="rooms" type="number" {...register("rooms")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Chambres</Label>
              <Input id="bedrooms" type="number" {...register("bedrooms")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Salles de bain</Label>
              <Input id="bathrooms" type="number" {...register("bathrooms")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_built">Année de construction</Label>
              <Input id="year_built" type="number" {...register("year_built")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy_rating">Classe énergétique</Label>
              <Input
                id="energy_rating"
                {...register("energy_rating")}
                placeholder="A, B, C..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location_address">Adresse</Label>
              <Input
                id="location_address"
                {...register("location_address")}
                placeholder="Calle de la Playa 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_city">Ville *</Label>
              <Input
                id="location_city"
                {...register("location_city")}
                placeholder="Alicante"
              />
              {errors.location_city && (
                <p className="text-sm text-destructive">{errors.location_city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_region">Région / Province</Label>
              <Input
                id="location_region"
                {...register("location_region")}
                placeholder="Costa Blanca"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register("latitude")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register("longitude")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Caractéristiques */}
        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(FEATURES_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                    features?.[key]
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!features?.[key]}
                    onChange={() => toggleFeature(key)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Photos */}
        {savedPropertyId && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                propertyId={savedPropertyId}
                images={images}
                onImagesChange={setImages}
              />
            </CardContent>
          </Card>
        )}

        {!savedPropertyId && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enregistrez d&apos;abord le bien pour pouvoir ajouter des photos.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section 6: Vidéos YouTube */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-4 w-4" /> Vidéos YouTube
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {youtubeUrls.length > 0 && (
              <div className="space-y-2">
                {youtubeUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={url} readOnly className="flex-1 text-sm" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeYoutubeUrl(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addYoutubeUrl();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addYoutubeUrl}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Publication */}
        <Card>
          <CardHeader>
            <CardTitle>Publication</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Statut commercial</Label>
              <select
                id="status"
                {...register("status")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {(Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PROPERTY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publication_status">Statut publication</Label>
              <select
                id="publication_status"
                {...register("publication_status")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {(Object.keys(PUBLICATION_STATUS_LABELS) as PublicationStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PUBLICATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug_fr">Slug FR *</Label>
              <Input id="slug_fr" {...register("slug_fr")} placeholder="villa-alicante-vue-mer" />
              {errors.slug_fr && (
                <p className="text-sm text-destructive">{errors.slug_fr.message}</p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("published")}
                  className="rounded border-input"
                />
                <span className="text-sm font-medium">Publié sur le site vitrine</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" className="gap-1.5">
            Suivant : Traductions
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    );
  }

  // ---------- Step: TRANSLATE ----------
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Traduction — Néerlandais (NL)</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => translateLang("nl")}
              disabled={isTranslatingNl}
              className="gap-1.5"
            >
              {isTranslatingNl ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Retraduire
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title_nl">Titre (NL)</Label>
            <Input
              id="title_nl"
              {...register("title_nl")}
              onBlur={() => updateSlugFromTitle("nl")}
              placeholder="Titre en néerlandais"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_nl">Description (NL)</Label>
            <textarea
              id="description_nl"
              rows={4}
              {...register("description_nl")}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-y"
              placeholder="Description en néerlandais..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug_nl">Slug NL</Label>
            <Input
              id="slug_nl"
              {...register("slug_nl")}
              placeholder="villa-alicante-zeezicht"
            />
            {errors.slug_nl && (
              <p className="text-sm text-destructive">{errors.slug_nl.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Traduction — Anglais (EN)</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => translateLang("en")}
              disabled={isTranslatingEn}
              className="gap-1.5"
            >
              {isTranslatingEn ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Retraduire
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title_en">Titre (EN)</Label>
            <Input
              id="title_en"
              {...register("title_en")}
              onBlur={() => updateSlugFromTitle("en")}
              placeholder="Title in English"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">Description (EN)</Label>
            <textarea
              id="description_en"
              rows={4}
              {...register("description_en")}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-y"
              placeholder="Description in English..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug_en">Slug EN</Label>
            <Input
              id="slug_en"
              {...register("slug_en")}
              placeholder="villa-alicante-sea-view"
            />
            {errors.slug_en && (
              <p className="text-sm text-destructive">{errors.slug_en.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("edit")}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting
            ? "Enregistrement..."
            : isEditing
            ? "Mettre à jour"
            : "Créer le bien"}
        </Button>
      </div>
    </form>
  );
}
