import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLists } from "@/lib/mailchimp/client";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const lists = await getLists();
    return NextResponse.json(lists);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
