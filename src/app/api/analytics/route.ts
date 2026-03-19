import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAnalyticsData } from "@/lib/analytics/client";
import { generateDemoAnalytics } from "@/lib/analytics/demo";

function jsonWithCache(body: object) {
  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" },
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const period = request.nextUrl.searchParams.get("period") === "30d" ? "30d" : "7d";

  try {
    // Try real GA4 data first
    const data = await fetchAnalyticsData(period);
    if (data) {
      return jsonWithCache({ ...data, demo: false });
    }

    // Fall back to demo data based on real properties
    const demo = await generateDemoAnalytics(period);
    return jsonWithCache({ ...demo, demo: true });
  } catch (err) {
    // If GA fails, still return demo data
    try {
      const demo = await generateDemoAnalytics(period);
      return jsonWithCache({ ...demo, demo: true });
    } catch {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
