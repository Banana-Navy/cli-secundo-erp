import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Building2, Mail, Phone, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractionTimeline } from "@/components/clients/interaction-timeline";
import { CLIENT_STATUS_LABELS } from "@/types";
import type { Client, Contact, Property, ClientStatus } from "@/types";

function statusVariant(status: ClientStatus) {
  switch (status) {
    case "actif":
      return "default" as const;
    case "prospect":
      return "secondary" as const;
    case "inactif":
      return "outline" as const;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: client },
    { data: contacts },
    { data: properties },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("contacts")
      .select("*")
      .eq("client_id", id)
      .order("date", { ascending: false }),
    supabase
      .from("properties")
      .select("id, title, status, price, location_city")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  const c = client as Client;
  const contactList = (contacts ?? []) as Contact[];
  const propertyList = (properties ?? []) as Property[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {c.first_name} {c.last_name}
              </h1>
              <Badge variant={statusVariant(c.status)}>
                {CLIENT_STATUS_LABELS[c.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">Fiche client</p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/clients/${c.id}/modifier`}>
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {c.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${c.email}`} className="hover:underline">
                    {c.email}
                  </a>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${c.phone}`} className="hover:underline">
                    {c.phone}
                  </a>
                </div>
              )}
              {(c.address || c.city || c.country) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {[c.address, c.city, c.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {c.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {c.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <InteractionTimeline contacts={contactList} clientId={c.id} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Biens associés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {propertyList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun bien associé.</p>
            ) : (
              <div className="space-y-3">
                {propertyList.map((p) => (
                  <Link
                    key={p.id}
                    href={`/biens/${p.id}`}
                    className="block rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <p className="text-sm font-medium">{p.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {p.location_city}
                      </span>
                      <span className="text-sm font-semibold">
                        {new Intl.NumberFormat("fr-BE", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        }).format(p.price)}
                      </span>
                    </div>
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
