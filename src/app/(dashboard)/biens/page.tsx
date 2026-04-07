import { createClient } from "@/lib/supabase/server";
import type { PropertyWithImages } from "@/types";
import { BiensView } from "@/components/properties/biens-view";

export default async function BiensPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .order("created_at", { ascending: false });

  const properties = (data ?? []) as PropertyWithImages[];

  return <BiensView initialProperties={properties} />;
}
