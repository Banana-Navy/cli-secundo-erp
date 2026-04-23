import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Pencil, Globe, Phone, Mail, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_STATUS_LABELS } from "@/types";
import type { Promoter, Property } from "@/types";

export default async function PromoterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: promoter } = await supabase
    .from("promoters")
    .select("*")
    .eq("id", id)
    .single();

  if (!promoter) notFound();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, price, status, reference, location_city")
    .eq("promoter_id", id)
    .order("created_at", { ascending: false });

  const p = promoter as Promoter;
  const linkedProperties = (properties ?? []) as Property[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
          <p className="text-muted-foreground">
            {p.country} &bull; Créé le{" "}
            {format(new Date(p.created_at), "dd MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/promoteurs/${id}/modifier`}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.contact_person && (
              <div className="text-sm">
                <span className="text-muted-foreground">Contact :</span>{" "}
                {p.contact_person}
              </div>
            )}
            {p.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <a href={`tel:${p.phone}`} className="hover:underline">
                  {p.phone}
                </a>
              </div>
            )}
            {p.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <a href={`mailto:${p.email}`} className="hover:underline">
                  {p.email}
                </a>
              </div>
            )}
            {p.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="size-4 text-muted-foreground" />
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {p.website}
                </a>
              </div>
            )}
            {p.notes && (
              <div className="text-sm pt-2 border-t">
                <span className="text-muted-foreground">Notes :</span>{" "}
                {p.notes}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Biens liés ({linkedProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {linkedProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun bien associé à ce promoteur.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    href={`/biens/${prop.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{prop.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {prop.reference} &bull; {prop.location_city}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {PROPERTY_STATUS_LABELS[prop.status] ?? prop.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
