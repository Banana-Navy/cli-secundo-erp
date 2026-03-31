import OpenAI from "openai";
import type {
  AITranslationService,
  AIDescriptionService,
  PropertyContext,
  Lang,
} from "./types";

const LANG_NAMES: Record<Lang, string> = {
  fr: "French",
  nl: "Dutch",
  en: "English",
};

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export class OpenAITranslationService implements AITranslationService {
  async translate(text: string, from: Lang, to: Lang): Promise<string> {
    if (!text.trim()) return "";
    const client = getClient();
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a professional real estate translator. Translate the following text from ${LANG_NAMES[from]} to ${LANG_NAMES[to]}. Keep the same tone, formatting and real estate terminology. Return only the translated text, nothing else.`,
        },
        { role: "user", content: text },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? text;
  }
}

export class OpenAIDescriptionService implements AIDescriptionService {
  async generateDescription(context: PropertyContext): Promise<string> {
    const client = getClient();
    const features = Object.entries(context.features)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ");

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Tu es un rédacteur immobilier professionnel. Rédige une description attrayante en français pour une annonce immobilière. Le texte doit être engageant, professionnel et mettre en valeur les points forts du bien. 3-4 paragraphes maximum.",
        },
        {
          role: "user",
          content: `Type: ${context.property_type}
État: ${context.condition}
Surface: ${context.surface} m²
Pièces: ${context.rooms} (${context.bedrooms} chambres, ${context.bathrooms} SDB)
Localisation: ${context.location_city}, ${context.location_region}
Prix: ${context.price.toLocaleString("fr-BE")} €
Année: ${context.year_built ?? "N/A"}
DPE: ${context.energy_rating || "N/A"}
Équipements: ${features || "Aucun spécifié"}`,
        },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }
}
