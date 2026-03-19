import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .or(`slug_fr.eq.${slug},slug_nl.eq.${slug},slug_en.eq.${slug}`)
    .eq("published", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
  }

  return NextResponse.json(
    { data },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
