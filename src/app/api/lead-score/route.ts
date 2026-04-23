import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LeadTemperature } from "@/types";

function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 80) return "tres_chaud";
  if (score >= 60) return "chaud";
  if (score >= 40) return "tiede";
  if (score >= 20) return "neutre";
  return "froid";
}

async function computeScore(supabase: Awaited<ReturnType<typeof createClient>>, clientId: string) {
  const [contactsRes, visitsRes, interestsRes, clientRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, type, outcome, date")
      .eq("client_id", clientId),
    supabase
      .from("visits")
      .select("id, status")
      .eq("client_id", clientId),
    supabase
      .from("client_property_interests")
      .select("id, status")
      .eq("client_id", clientId),
    supabase
      .from("clients")
      .select("status, created_at")
      .eq("id", clientId)
      .single(),
  ]);

  const contacts = contactsRes.data ?? [];
  const visits = visitsRes.data ?? [];
  const interests = interestsRes.data ?? [];
  const client = clientRes.data;

  if (!client) return null;

  let score = 0;

  // Client status (max 10)
  if (client.status === "actif") score += 10;
  else if (client.status === "prospect") score += 5;

  // Contacts/interactions (max 20, 4 pts each up to 5)
  score += Math.min(contacts.length * 4, 20);

  // Outcome bonus (max 10) — positive outcomes boost score
  const positiveOutcomes = contacts.filter(
    (c: { outcome: string | null }) => c.outcome === "positif"
  ).length;
  const negativeOutcomes = contacts.filter(
    (c: { outcome: string | null }) => c.outcome === "negatif"
  ).length;
  score += Math.min(positiveOutcomes * 5, 10);
  score -= Math.min(negativeOutcomes * 3, 6);

  // Recent interaction bonus (max 5)
  if (contacts.length > 0) {
    const lastContact = contacts.reduce((latest, c) =>
      c.date > latest.date ? c : latest
    );
    const daysSinceLastContact = Math.floor(
      (Date.now() - new Date(lastContact.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastContact < 7) score += 5;
    else if (daysSinceLastContact < 30) score += 3;
    else if (daysSinceLastContact < 60) score += 1;
  }

  // Visits (max 25)
  const completedVisits = visits.filter(
    (v: { status: string }) => v.status === "effectuee"
  ).length;
  const plannedVisits = visits.filter(
    (v: { status: string }) => v.status === "planifiee" || v.status === "confirmee"
  ).length;
  score += Math.min(completedVisits * 10, 20);
  score += Math.min(plannedVisits * 5, 5);

  // Property interests (max 25)
  const offreInterests = interests.filter(
    (i: { status: string }) => i.status === "offre_faite"
  ).length;
  const visiteInterests = interests.filter(
    (i: { status: string }) => i.status === "visite_planifiee"
  ).length;
  const contacteInterests = interests.filter(
    (i: { status: string }) => i.status === "interesse"
  ).length;
  score += Math.min(offreInterests * 15, 15);
  score += Math.min(visiteInterests * 5, 5);
  score += Math.min(contacteInterests * 3, 5);

  // Recency bonus (max 5)
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreation < 7) score += 5;
  else if (daysSinceCreation < 30) score += 3;
  else if (daysSinceCreation < 90) score += 1;

  // Clamp 0–100
  score = Math.max(0, Math.min(score, 100));

  const temperature = scoreToTemperature(score);

  return {
    score,
    temperature,
    breakdown: {
      status: client.status,
      contacts: contacts.length,
      positiveOutcomes,
      negativeOutcomes,
      visits: visits.length,
      completedVisits,
      interests: interests.length,
      offreInterests,
      daysSinceCreation,
    },
  };
}

// GET — compute + save score for one client
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

    const result = await computeScore(supabase, clientId);
    if (!result) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    // Save score + temperature
    await supabase
      .from("clients")
      .update({
        lead_score: result.score,
        lead_temperature: result.temperature,
      })
      .eq("id", clientId);

    return NextResponse.json({ client_id: clientId, ...result });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — batch recalculate all clients
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .in("status", ["prospect", "actif"]);

    let updated = 0;
    for (const client of clients ?? []) {
      const result = await computeScore(supabase, client.id);
      if (result) {
        await supabase
          .from("clients")
          .update({
            lead_score: result.score,
            lead_temperature: result.temperature,
          })
          .eq("id", client.id);
        updated++;
      }
    }

    return NextResponse.json({ updated });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
