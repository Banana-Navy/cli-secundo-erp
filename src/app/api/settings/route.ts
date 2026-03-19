import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MASKED_KEYS = ["mailchimp_api_key", "ga_credentials_json"];
const VALID_KEYS = ["website_url", "mailchimp_api_key", "mailchimp_server_prefix", "ga_property_id", "ga_credentials_json"];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data, error } = await supabase.from("settings").select("key, value, encrypted, updated_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const masked = (data ?? []).map((s) => ({
    ...s,
    value: MASKED_KEYS.includes(s.key) && s.value
      ? s.value.slice(0, 4) + "••••" + s.value.slice(-4)
      : s.value,
  }));

  return NextResponse.json(masked);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json() as { key: string; value: string }[];

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const invalidKey = body.find(({ key }) => !VALID_KEYS.includes(key));
  if (invalidKey) {
    return NextResponse.json({ error: "Clé de paramètre invalide" }, { status: 400 });
  }

  for (const { key, value } of body) {
    const { error } = await supabase.from("settings").upsert(
      {
        key,
        value,
        encrypted: MASKED_KEYS.includes(key),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: "key" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
