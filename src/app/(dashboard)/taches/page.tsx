import { createClient } from "@/lib/supabase/server";
import type { TaskWithRelations } from "@/types";
import { TachesView } from "@/components/tasks/taches-view";

export default async function TachesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tasks")
    .select("*, clients(id, first_name, last_name), properties(id, title, reference)")
    .order("created_at", { ascending: false });

  const tasks = (data ?? []) as TaskWithRelations[];

  return <TachesView initialTasks={tasks} />;
}
