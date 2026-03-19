import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmailHTML } from "@/lib/mailchimp/template";
import type { PropertyWithImages } from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { propertyIds } = (await request.json()) as { propertyIds: string[] };

  if (!propertyIds?.length) {
    return NextResponse.json({ error: "Aucun bien sélectionné" }, { status: 400 });
  }

  if (propertyIds.length > 50) {
    return NextResponse.json({ error: "Maximum 50 biens par campagne" }, { status: 400 });
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .in("id", propertyIds);

  if (!properties?.length) {
    return NextResponse.json({ error: "Biens non trouvés" }, { status: 404 });
  }

  const html = generateEmailHTML(properties as PropertyWithImages[]);
  return NextResponse.json({ html });
}
