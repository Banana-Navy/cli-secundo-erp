import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const clientId = request.nextUrl.searchParams.get("client_id");
    if (!clientId) {
      return NextResponse.json({ error: "client_id requis" }, { status: 400 });
    }

    // Fetch data for scoring
    const [contactsRes, visitsRes, interestsRes, clientRes] = await Promise.all([
      supabase.from("contacts").select("id").eq("client_id", clientId),
      supabase.from("visits").select("id, status").eq("client_id", clientId),
      supabase.from("client_property_interests").select("id, status").eq("client_id", clientId),
      supabase.from("clients").select("status, created_at").eq("id", clientId).single(),
    ]);

    const contacts = contactsRes.data ?? [];
    const visits = visitsRes.data ?? [];
    const interests = interestsRes.data ?? [];
    const client = clientRes.data;

    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    let score = 0;

    // Client status (max 10)
    if (client.status === "actif") score += 10;
    else if (client.status === "prospect") score += 5;

    // Contacts/interactions (max 20, 4 pts each up to 5)
    score += Math.min(contacts.length * 4, 20);

    // Visits (max 30)
    const completedVisits = visits.filter((v: { status: string }) => v.status === "effectuee").length;
    const plannedVisits = visits.filter((v: { status: string }) => v.status === "planifiee" || v.status === "confirmee").length;
    score += Math.min(completedVisits * 10, 20);
    score += Math.min(plannedVisits * 5, 10);

    // Property interests (max 30)
    const offreInterests = interests.filter((i: { status: string }) => i.status === "offre").length;
    const visiteInterests = interests.filter((i: { status: string }) => i.status === "visite").length;
    const contacteInterests = interests.filter((i: { status: string }) => i.status === "contacte").length;
    score += Math.min(offreInterests * 15, 15);
    score += Math.min(visiteInterests * 8, 8);
    score += Math.min(contacteInterests * 4, 7);

    // Recency bonus (max 10)
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation < 7) score += 10;
    else if (daysSinceCreation < 30) score += 7;
    else if (daysSinceCreation < 90) score += 4;

    // Cap at 100
    score = Math.min(score, 100);

    return NextResponse.json({
      client_id: clientId,
      score,
      breakdown: {
        status: client.status,
        contacts: contacts.length,
        visits: visits.length,
        completedVisits,
        interests: interests.length,
        offreInterests,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
