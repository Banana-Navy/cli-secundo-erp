import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss/parser";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const articles = await fetchAllFeeds();
    return NextResponse.json(articles, {
      headers: { "Cache-Control": "public, max-age=900, stale-while-revalidate=1800" },
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer les flux RSS" },
      { status: 500 }
    );
  }
}
