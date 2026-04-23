import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PromoterTable } from "@/components/promoters/promoter-table";
import type { Promoter } from "@/types";

export default async function PromoteursPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("promoters")
    .select("*")
    .order("created_at", { ascending: false });

  const promoters = (data ?? []) as Promoter[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promoteurs</h1>
          <p className="text-muted-foreground">
            {promoters.length} promoteur{promoters.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/promoteurs/nouveau">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau promoteur
          </Link>
        </Button>
      </div>

      <PromoterTable promoters={promoters} />
    </div>
  );
}
