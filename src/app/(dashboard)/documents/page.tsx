import { createClient } from "@/lib/supabase/server";
import type { Document as DocumentRow } from "@/types";
import { DocumentsView } from "@/components/documents/documents-view";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  const documents = (data ?? []) as DocumentRow[];

  return <DocumentsView initialDocuments={documents} />;
}
