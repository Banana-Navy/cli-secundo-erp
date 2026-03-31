import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const competitorId = searchParams.get("competitor_id");

  let query = supabase
    .from("spy_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (competitorId) {
    query = query.eq("competitor_id", competitorId);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as { ids: string[] };

  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const { error } = await supabase
    .from("spy_alerts")
    .update({ read: true })
    .in("id", body.ids);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
