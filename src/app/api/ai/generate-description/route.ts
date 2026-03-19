import { NextRequest, NextResponse } from "next/server";
import { getDescriptionService } from "@/lib/ai";
import type { PropertyContext } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyData } = body as { propertyData: PropertyContext };

  if (!propertyData) {
    return NextResponse.json(
      { error: "Le champ propertyData est requis" },
      { status: 400 }
    );
  }

  const service = getDescriptionService();
  const description = await service.generateDescription(propertyData);

  return NextResponse.json({ description });
}
