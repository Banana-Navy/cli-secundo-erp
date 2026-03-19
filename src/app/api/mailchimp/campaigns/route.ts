import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAndSendCampaign } from "@/lib/mailchimp/client";
import { generateEmailHTML } from "@/lib/mailchimp/template";
import type { PropertyWithImages } from "@/types";

interface CampaignBody {
  propertyIds: string[];
  listId: string;
  subject: string;
  fromName: string;
  replyTo: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as CampaignBody;

  if (!body.propertyIds?.length || !body.listId || !body.subject) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalidId = body.propertyIds.find((id) => !UUID_REGEX.test(id));
  if (invalidId) {
    return NextResponse.json({ error: "Identifiant de bien invalide" }, { status: 400 });
  }

  // Fetch properties with images
  const { data: properties, error: fetchError } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .in("id", body.propertyIds);

  if (fetchError || !properties?.length) {
    return NextResponse.json({ error: "Impossible de récupérer les biens" }, { status: 500 });
  }

  // Generate HTML
  const htmlContent = generateEmailHTML(properties as PropertyWithImages[]);

  try {
    // Send via Mailchimp
    const result = await createAndSendCampaign({
      listId: body.listId,
      subject: body.subject,
      fromName: body.fromName || "Secundo",
      replyTo: body.replyTo || user.email || "",
      htmlContent,
    });

    // Save campaign record
    await supabase.from("campaigns").insert({
      mailchimp_campaign_id: result.id,
      subject: body.subject,
      property_ids: body.propertyIds,
      list_id: body.listId,
      status: "sent",
      sent_at: new Date().toISOString(),
      created_by: user.id,
    });

    return NextResponse.json({ success: true, campaignId: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur d'envoi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
