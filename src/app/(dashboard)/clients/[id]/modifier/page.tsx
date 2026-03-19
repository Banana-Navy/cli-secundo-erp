import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";
import type { Client } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierClientPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("clients").select("*").eq("id", id).single();

  if (!data) notFound();

  const client = data as Client;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/clients/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Modifier {client.first_name} {client.last_name}
          </h1>
          <p className="text-muted-foreground">Modifier les informations du client</p>
        </div>
      </div>

      <ClientForm client={client} />
    </div>
  );
}
