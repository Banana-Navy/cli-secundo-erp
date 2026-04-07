import { createClient } from "@/lib/supabase/server";
import type { InterestWithRelations } from "@/types";
import { PipelineView } from "@/components/pipeline/pipeline-view";

export default async function PipelinePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("client_property_interests")
    .select(
      "*, clients(id, first_name, last_name, email, phone), properties(id, title, price, location_city, reference)"
    )
    .order("created_at", { ascending: false });

  const interests = (data ?? []) as InterestWithRelations[];

  return <PipelineView initialInterests={interests} />;
}
