import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  ArrowLeft,
  Pencil,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CalendarClock,
  Thermometer,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractionTimeline } from "@/components/clients/interaction-timeline";
import {
  CLIENT_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_TEMPERATURE_LABELS,
  LEAD_TEMPERATURE_COLORS,
} from "@/types";
import type {
  Client,
  Contact,
  Property,
  ClientStatus,
  LeadTemperature,
  LeadSource,
} from "@/types";

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
    { data: nextTask },
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
    supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .eq("client_id", id)
      .in("status", ["a_faire", "en_cours"])
      .order("due_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!client) notFound();

  const c = client as Client;
  const contactList = (contacts ?? []) as Contact[];
  const propertyList = (properties ?? []) as Property[];
  const temperature = (c.lead_temperature ?? "neutre") as LeadTemperature;
  const source = (c.lead_source ?? "autre") as LeadSource;

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
              <Badge
                variant="secondary"
                className={LEAD_TEMPERATURE_COLORS[temperature]}
              >
                {LEAD_TEMPERATURE_LABELS[temperature]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {LEAD_SOURCE_LABELS[source]}
              {c.nationality ? ` \u2022 ${c.nationality}` : ""}
            </p>
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
          {/* Phone display (big) */}
          {c.phone && (
            <Card>
              <CardContent className="pt-6">
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-3 text-lg font-semibold hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  {c.phone}
                </a>
              </CardContent>
            </Card>
          )}

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
              {(c.address || c.city || c.country) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {[c.address, c.city, c.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {c.nationality && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{c.nationality}</span>
                </div>
              )}
              {c.referrer_name && (
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Apporteur : {c.referrer_name}</span>
                </div>
              )}
              {c.callback_date && (
                <div className="flex items-center gap-2 text-sm">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Rappel :{" "}
                    {format(new Date(c.callback_date), "dd MMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </span>
                </div>
              )}
              {c.regions_of_interest && c.regions_of_interest.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Régions d&apos;intérêt
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {c.regions_of_interest.map((r) => (
                      <Badge key={r} variant="outline" className="text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
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

          {/* Next task */}
          {nextTask && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Thermometer className="size-4" />
                  Prochaine tâche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href="/taches"
                  className="text-sm font-medium hover:underline"
                >
                  {nextTask.title}
                </Link>
                {nextTask.due_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Échéance :{" "}
                    {format(new Date(nextTask.due_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
