import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/types";
import { TachesView } from "@/components/tasks/taches-view";

export default async function TachesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const tasks = (data ?? []) as Task[];

  return <TachesView initialTasks={tasks} />;
}
