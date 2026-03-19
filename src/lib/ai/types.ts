export type Lang = "fr" | "nl" | "en";

export interface PropertyContext {
  property_type: string;
  condition: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  location_city: string;
  location_region: string;
  features: Record<string, boolean | undefined>;
  year_built: number | null;
  energy_rating: string;
  imageUrls: string[];
}

export interface AITranslationService {
  translate(text: string, from: Lang, to: Lang): Promise<string>;
}

export interface AIDescriptionService {
  generateDescription(context: PropertyContext): Promise<string>;
}
