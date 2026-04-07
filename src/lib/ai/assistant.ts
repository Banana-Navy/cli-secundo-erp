import OpenAI from "openai";

const DB_SCHEMA = `
Tables disponibles :
- clients (id, first_name, last_name, email, phone, address, city, country, notes, status, created_at, updated_at)
  status: 'prospect' | 'actif' | 'inactif'
- contacts (id, client_id, type, subject, content, date, created_by, created_at)
  type: 'appel' | 'email' | 'visite' | 'note'
- properties (id, title, description, price, surface, rooms, bedrooms, bathrooms, property_type, condition, status, location_city, location_region, location_address, features, year_built, energy_rating, reference, published, client_id, created_at, updated_at)
  property_type: 'appartement' | 'maison' | 'villa' | 'terrain' | 'commercial'
  condition: 'neuf' | 'bon_etat' | 'a_renover' | 'renove'
  status: 'disponible' | 'reserve' | 'vendu' | 'retire'
- property_images (id, property_id, url, alt, sort_order, is_cover, created_at)
- tasks (id, title, description, status, priority, due_date, assigned_to, client_id, property_id, completed_at, created_by, created_at, updated_at)
  status: 'a_faire' | 'en_cours' | 'termine' | 'annule'
  priority: 'basse' | 'normale' | 'haute' | 'urgente'
- visits (id, title, visit_date, duration_minutes, location, notes, status, client_id, property_id, agent_id, created_at, updated_at)
  status: 'planifiee' | 'confirmee' | 'effectuee' | 'annulee'
- documents (id, name, file_url, file_type, category, notes, client_id, property_id, expires_at, uploaded_by, created_at)
- notifications (id, user_id, type, title, message, href, read, created_at)
- client_property_interests (id, client_id, property_id, status, note, created_at, updated_at)
  status: 'interesse' | 'visite_planifiee' | 'offre_faite' | 'refuse' | 'achete'
- campaigns (id, mailchimp_campaign_id, subject, property_ids, list_id, status, sent_at, created_by, created_at)
- settings (key, value, encrypted, updated_at, updated_by)
`;

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function validateSQL(sql: string): { valid: boolean; error?: string } {
  const trimmed = sql.trim().toLowerCase();
  if (!trimmed.startsWith("select") && !trimmed.startsWith("with")) {
    return { valid: false, error: "Seules les requêtes SELECT sont autorisées" };
  }
  const forbidden = /\b(insert\s+into|update\s+\w+\s+set|delete\s+from|drop\s|alter\s|create\s|truncate\s|grant\s|revoke\s)\b/i;
  if (forbidden.test(sql)) {
    return { valid: false, error: "Requêtes de modification interdites" };
  }
  return { valid: true };
}

export async function generateSQL(question: string): Promise<string> {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `Tu es un expert SQL PostgreSQL pour un ERP immobilier belge.
${DB_SCHEMA}
Règles OBLIGATOIRES :
1. Génère UNIQUEMENT une requête SQL SELECT valide. Ne retourne QUE le SQL brut, sans explication, sans backticks, sans point-virgule final.
2. CRITIQUE — TOUJOURS inclure c.id (pour clients), p.id (pour properties), t.id (pour tasks), v.id (pour visits), d.id (pour documents) dans le SELECT. Sans l'id, l'interface ne peut pas créer de liens cliquables. C'est la règle la plus importante.
3. TOUJOURS préfixer les colonnes avec l'alias de table (ex: c.id, p.price) pour éviter les ambiguïtés dans les JOIN.
4. "CA" ou "chiffre d'affaires" d'un client = somme des prix des biens vendus associés à ce client (properties.status = 'vendu' AND properties.client_id = clients.id).
5. Utilise des alias de table courts (c, p, v, t, d...).
6. Pour les prix, utilise numeric. Pour les dates, timestamptz.
7. Limite à 50 résultats si pas de LIMIT explicite.`,
      },
      { role: "user", content: question },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateAnswer(
  question: string,
  sql: string,
  data: unknown
): Promise<string> {
  const client = getClient();
  const dataStr = JSON.stringify(data, null, 2);
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `Tu es GringoAI, l'assistant intelligent de l'ERP Secundo (immobilier en Espagne pour des Belges).

RÈGLE N°1 — LIENS CLIQUABLES (OBLIGATOIRE) :
Chaque nom de client, titre de bien, titre de tâche ou visite mentionné dans ta réponse DOIT être un lien markdown cliquable. Utilise les UUID (colonne "id") présents dans les données JSON.
- Client → [Prénom Nom](/clients/UUID)
- Bien → [Titre ou Référence](/biens/UUID)
- Tâche → [Titre](/taches) (pas de page individuelle)
Exemples concrets :
- Si les données contiennent {"id": "a1b2-c3d4", "first_name": "Marc", "last_name": "Vandenberghe"}, écris : [Marc Vandenberghe](/clients/a1b2-c3d4)
- Si les données contiennent {"id": "e5f6-g7h8", "title": "Villa Costa Blanca"}, écris : [Villa Costa Blanca](/biens/e5f6-g7h8)
NE JAMAIS écrire un nom sans lien. Si l'id est absent des données, écris le nom en **gras** sans lien.

Autres règles de formatage :
- Réponds en français, de manière concise et naturelle (comme un collègue).
- Formate les prix en euros avec séparateur de milliers (ex: 1 250 000 €) et les surfaces en m².
- Si les données sont vides, dis-le clairement.
- N'utilise JAMAIS de tableaux markdown. Utilise du texte simple, des listes à puces si nécessaire.
- Pour un seul résultat, fais une phrase directe.
- Pour plusieurs résultats (2-10), utilise une liste numérotée.
- Ne termine pas par "n'hésitez pas à demander" ou des formules bateau. Sois direct.`,
      },
      {
        role: "user",
        content: `Question: ${question}\n\nRequête SQL exécutée:\n${sql}\n\nRésultats:\n${dataStr}`,
      },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "Je n'ai pas pu générer de réponse.";
}
