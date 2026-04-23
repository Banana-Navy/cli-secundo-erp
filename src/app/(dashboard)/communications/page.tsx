import { createClient } from "@/lib/supabase/server";
import { CommunicationsView } from "@/components/communications/communications-view";
import type { Communication, MessageTemplate } from "@/types";

export default async function CommunicationsPage() {
  const supabase = await createClient();

  const [{ data: commsData }, { data: templatesData }] = await Promise.all([
    supabase
      .from("communications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("message_templates")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const communications = (commsData ?? []) as Communication[];
  const templates = (templatesData ?? []) as MessageTemplate[];

  return (
    <CommunicationsView
      initialCommunications={communications}
      templates={templates}
    />
  );
}
