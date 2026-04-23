import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createAdminClient } from "@/lib/supabase/admin";

const leadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email().or(z.literal("")).optional().default(""),
  phone: z.string().optional().default(""),
  property_id: z.string().uuid().optional(),
  entity_code: z.string().optional(),
  utm_source: z.string().optional().default(""),
  utm_medium: z.string().optional().default(""),
  utm_campaign: z.string().optional().default(""),
  utm_content: z.string().optional().default(""),
  utm_term: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const result = leadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.issues },
      { status: 400 }
    );
  }

  const { property_id, entity_code, ...clientData } = result.data;

  const supabase = createAdminClient();

  // Create the client
  const { data: newClient, error } = await supabase
    .from("clients")
    .insert({
      ...clientData,
      status: "prospect",
      lead_temperature: "neutre",
      lead_source: "site_web",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la création du lead" }, { status: 500 });
  }

  // Link to entity if entity_code provided
  if (entity_code) {
    const { data: entity } = await supabase
      .from("entities")
      .select("id")
      .eq("code", entity_code)
      .single();

    if (entity) {
      await supabase.from("client_entities").insert({
        client_id: newClient.id,
        entity_id: entity.id,
        client_role: "buyer",
      });
    }
  }

  // Link to property interest if property_id provided
  if (property_id) {
    await supabase.from("client_property_interests").insert({
      client_id: newClient.id,
      property_id,
      status: "interesse",
    });
  }

  return NextResponse.json({ id: newClient.id }, { status: 201 });
}
