import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ClientViews } from "@/components/clients/client-views";
import type { Client } from "@/types";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const clients = (data ?? []) as Client[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            {clients.length} client{clients.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/clients/nouveau">
            <UserPlus className="h-4 w-4 mr-1" />
            Nouveau client
          </Link>
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Erreur lors du chargement des clients.
        </p>
      )}

      <ClientViews clients={clients} />
    </div>
  );
}
