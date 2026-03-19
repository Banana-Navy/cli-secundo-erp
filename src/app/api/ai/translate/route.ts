import { NextRequest, NextResponse } from "next/server";
import { getTranslationService } from "@/lib/ai";
import type { Lang } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

const VALID_LANGS: Lang[] = ["fr", "nl", "en"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { text, from, to } = body as { text: string; from: Lang; to: Lang };

  if (!text || !from || !to) {
    return NextResponse.json(
      { error: "Les champs text, from et to sont requis" },
      { status: 400 }
    );
  }

  if (!VALID_LANGS.includes(from) || !VALID_LANGS.includes(to)) {
    return NextResponse.json(
      { error: "Langue invalide (fr, nl, en)" },
      { status: 400 }
    );
  }

  const service = getTranslationService();
  const translated = await service.translate(text, from, to);

  return NextResponse.json({ translated });
}
