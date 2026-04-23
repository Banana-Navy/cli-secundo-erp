import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PromoterForm } from "@/components/promoters/promoter-form";
import type { Promoter } from "@/types";

export default async function ModifierPromoterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("promoters")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const promoter = data as Promoter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifier : {promoter.name}
        </h1>
        <p className="text-muted-foreground">
          Modifier les informations du promoteur
        </p>
      </div>
      <PromoterForm promoter={promoter} />
    </div>
  );
}
