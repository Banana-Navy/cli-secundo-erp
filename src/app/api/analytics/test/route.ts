import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { testAnalyticsConnection } from "@/lib/analytics/client";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const ok = await testAnalyticsConnection();
  if (ok) {
    return NextResponse.json({ connected: true });
  }
  return NextResponse.json({ connected: false, error: "Connexion échouée" }, { status: 400 });
}
