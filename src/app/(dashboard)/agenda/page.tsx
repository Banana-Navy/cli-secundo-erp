import { startOfMonth, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { VisitWithRelations } from "@/types";
import { AgendaView } from "@/components/agenda/agenda-view";

export default async function AgendaPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();

  const { data } = await supabase
    .from("visits")
    .select(
      "*, clients(id, first_name, last_name), properties(id, title, reference)"
    )
    .gte("visit_date", monthStart)
    .lte("visit_date", monthEnd)
    .order("visit_date", { ascending: true });

  const visits = (data ?? []) as VisitWithRelations[];

  return <AgendaView initialVisits={visits} />;
}
