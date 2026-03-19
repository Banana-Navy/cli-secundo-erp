import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/properties/property-form";
import type { Property, PropertyImage } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModifierBienPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: property }, { data: images }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).single(),
    supabase
      .from("property_images")
      .select("*")
      .eq("property_id", id)
      .order("sort_order"),
  ]);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/biens/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Modifier : {(property as Property).title}
          </h1>
          <p className="text-muted-foreground">Modifier les informations du bien</p>
        </div>
      </div>

      <PropertyForm
        property={property as Property}
        images={(images ?? []) as PropertyImage[]}
      />
    </div>
  );
}
