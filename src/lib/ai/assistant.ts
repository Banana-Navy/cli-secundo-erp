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
  status: 'nouveau' | 'contacte' | 'visite' | 'offre' | 'vendu'
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
  const forbidden = /(insert|update|delete|drop|alter|create|truncate|grant|revoke)/i;
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
Règles importantes :
- "CA" ou "chiffre d'affaires" d'un client = somme des prix des biens vendus associés à ce client (properties.status = 'vendu' AND properties.client_id = clients.id).
- Génère UNIQUEMENT une requête SQL SELECT valide.
- TOUJOURS préfixer les colonnes avec le nom de table (ex: clients.id, properties.price) pour éviter les ambiguïtés dans les JOIN.
- TOUJOURS inclure la colonne id des entités principales dans le SELECT (ex: c.id, p.id) pour permettre la navigation.
- Utilise des alias de table courts (c, p, v, t...).
- Pour les prix, utilise numeric. Pour les dates, timestamptz.
- Limite à 50 résultats si pas de LIMIT explicite.
- Ne retourne QUE le SQL brut, sans explication, sans backticks, sans point-virgule final.`,
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

Règles de formatage :
- Réponds toujours en français, de manière concise et naturelle (comme un collègue).
- Formate les prix en euros avec séparateur de milliers (ex: 1 250 000 €) et les surfaces en m².
- Si les données sont vides, dis-le clairement.
- **N'utilise JAMAIS de tableaux markdown.** Utilise du texte simple, des listes à puces si nécessaire.
- Pour un seul résultat, fais une phrase directe (ex: "Le meilleur client est **Catherine Lemaire** avec 11 601 000 € de CA.").
- Pour plusieurs résultats (2-10), utilise une liste numérotée avec les infos clés sur chaque ligne.
- TOUJOURS ajouter des liens markdown vers l'ERP en utilisant les vrais UUID présents dans les résultats :
  - Client : [Prénom Nom](/clients/UUID-ICI)
  - Bien : [Titre ou Référence](/biens/UUID-ICI)
  Par exemple si les données contiennent id="abc-123", écris [Catherine Lemaire](/clients/abc-123).
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
