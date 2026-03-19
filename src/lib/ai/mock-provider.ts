import type {
  AITranslationService,
  AIDescriptionService,
  PropertyContext,
  Lang,
} from "./types";

const LANG_LABELS: Record<Lang, string> = {
  fr: "FR",
  nl: "NL",
  en: "EN",
};

export class MockTranslationService implements AITranslationService {
  async translate(text: string, _from: Lang, to: Lang): Promise<string> {
    // Simulate a small delay
    await new Promise((r) => setTimeout(r, 500));
    return `[${LANG_LABELS[to]}] ${text}`;
  }
}

export class MockDescriptionService implements AIDescriptionService {
  async generateDescription(context: PropertyContext): Promise<string> {
    await new Promise((r) => setTimeout(r, 800));

    const features = Object.entries(context.features)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ");

    return (
      `Magnifique ${context.property_type} de ${context.surface} m² situé à ${context.location_city}` +
      (context.location_region ? ` (${context.location_region})` : "") +
      `. Ce bien dispose de ${context.bedrooms} chambre(s) et ${context.bathrooms} salle(s) de bain` +
      ` pour un total de ${context.rooms} pièce(s).` +
      (features ? ` Équipements : ${features}.` : "") +
      (context.year_built ? ` Construit en ${context.year_built}.` : "") +
      ` Prix : ${context.price.toLocaleString("fr-BE")} €.`
    );
  }
}
