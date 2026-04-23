import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Zap,
  Globe,
  HardHat,
  Tag,
  Youtube,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { PropertyShare } from "@/components/properties/property-share";
import { SeoScoreCard } from "./seo-score-card";
import { ApprovalWorkflowCard } from "./approval-workflow-card";
import { getSetting } from "@/lib/settings";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_CONDITION_LABELS,
  PROPERTY_CATEGORY_LABELS,
  PUBLICATION_STATUS_LABELS,
  FEATURES_LABELS,
} from "@/types";
import { formatPrice } from "@/lib/format";
import { analyzeSeo } from "@/lib/seo/analyzer";
import type { PropertyFull, PropertyStatus, Promoter, PropertyImage } from "@/types";

function statusVariant(status: PropertyStatus) {
  switch (status) {
    case "disponible":
      return "default" as const;
    case "reserve":
      return "secondary" as const;
    case "vendu":
      return "outline" as const;
    case "retire":
      return "destructive" as const;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BienDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data }, websiteUrl] = await Promise.all([
    supabase
      .from("properties")
      .select("*, property_images(*)")
      .eq("id", id)
      .single(),
    getSetting("website_url"),
  ]);

  if (!data) notFound();

  const property = data as PropertyFull;

  // Fetch promoter if linked
  let promoter: Promoter | null = null;
  if (property.promoter_id) {
    const { data: pData } = await supabase
      .from("promoters")
      .select("*")
      .eq("id", property.promoter_id)
      .single();
    promoter = pData as Promoter | null;
  }

  const effectiveWebsiteUrl = property.published ? websiteUrl : null;
  const activeFeatures = Object.entries(property.features ?? {}).filter(
    ([, v]) => v
  );
  const seoAnalysis = analyzeSeo(property, (property.property_images ?? []) as PropertyImage[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/biens">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {property.reference && (
                <span className="text-sm font-mono text-muted-foreground">
                  {property.reference}
                </span>
              )}
              <h1 className="text-2xl font-bold tracking-tight">
                {property.title}
              </h1>
              <Badge variant={statusVariant(property.status)}>
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
              {property.published && (
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" /> Publié
                </Badge>
              )}
              {property.category && (
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" /> {PROPERTY_CATEGORY_LABELS[property.category] ?? property.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {PROPERTY_TYPE_LABELS[property.property_type]} — {PROPERTY_CONDITION_LABELS[property.condition]}
              {promoter && (
                <> — <Link href={`/promoteurs/${promoter.id}`} className="text-primary hover:underline">{promoter.name}</Link></>
              )}
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/biens/${property.id}/modifier`}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <PropertyGallery images={property.property_images ?? []} />

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="fr">
                <TabsList>
                  <TabsTrigger value="fr">FR</TabsTrigger>
                  <TabsTrigger value="nl">NL</TabsTrigger>
                  <TabsTrigger value="en">EN</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="mt-4">
                  <h3 className="font-semibold mb-2">{property.title}</h3>
                  {property.description ? (
                    <p className="text-sm whitespace-pre-wrap">{property.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune description.</p>
                  )}
                </TabsContent>
                <TabsContent value="nl" className="mt-4">
                  <h3 className="font-semibold mb-2">
                    {property.title_nl || <span className="text-muted-foreground italic">Pas de titre NL</span>}
                  </h3>
                  {property.description_nl ? (
                    <p className="text-sm whitespace-pre-wrap">{property.description_nl}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pas de description NL.</p>
                  )}
                </TabsContent>
                <TabsContent value="en" className="mt-4">
                  <h3 className="font-semibold mb-2">
                    {property.title_en || <span className="text-muted-foreground italic">No EN title</span>}
                  </h3>
                  {property.description_en ? (
                    <p className="text-sm whitespace-pre-wrap">{property.description_en}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No EN description.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {activeFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {activeFeatures.map(([key]) => (
                    <Badge key={key} variant="secondary">
                      {FEATURES_LABELS[key] ?? key}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">
                {formatPrice(property.price)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Maximize className="h-4 w-4" /> Superficie
                </span>
                <span className="font-medium">{property.surface} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="h-4 w-4" /> Chambres
                </span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Bath className="h-4 w-4" /> Salles de bain
                </span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pièces</span>
                <span className="font-medium">{property.rooms}</span>
              </div>
              {property.year_built && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Année
                  </span>
                  <span className="font-medium">{property.year_built}</span>
                </div>
              )}
              {property.energy_rating && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" /> Énergie
                  </span>
                  <span className="font-medium">{property.energy_rating}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {property.location_address && <p>{property.location_address}</p>}
              <p className="font-medium">
                {property.location_city}
                {property.location_region && `, ${property.location_region}`}
              </p>
            </CardContent>
          </Card>

          <ApprovalWorkflowCard
            propertyId={property.id}
            currentStatus={property.publication_status}
          />

          <SeoScoreCard analysis={seoAnalysis} />

          {promoter && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-4 w-4" /> Promoteur
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <Link href={`/promoteurs/${promoter.id}`} className="font-medium text-primary hover:underline">
                  {promoter.name}
                </Link>
                {promoter.contact_person && <p>{promoter.contact_person}</p>}
                {promoter.phone && <p>{promoter.phone}</p>}
              </CardContent>
            </Card>
          )}

          {property.published && (
            <PropertyShare
              websiteUrl={effectiveWebsiteUrl}
              slug={property.slug_fr}
              title={property.title}
              price={property.price}
              city={property.location_city}
            />
          )}
        </div>
      </div>

      {/* YouTube videos */}
      {property.youtube_urls && property.youtube_urls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-4 w-4" /> Vidéos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {property.youtube_urls.map((url, i) => {
                const videoId = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?/]+)/)?.[1];
                return videoId ? (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {url}
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
