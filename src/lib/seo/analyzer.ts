import type { Property, PropertyImage } from "@/types";

export interface SeoAnalysisResult {
  score: number;
  checks: SeoCheck[];
}

export interface SeoCheck {
  name: string;
  passed: boolean;
  message: string;
  weight: number;
}

export function analyzeSeo(
  property: Property,
  images: PropertyImage[]
): SeoAnalysisResult {
  const checks: SeoCheck[] = [];

  // Title length (30-70 chars ideal)
  const titleLen = property.title.length;
  checks.push({
    name: "title_length",
    passed: titleLen >= 30 && titleLen <= 70,
    message:
      titleLen < 30
        ? `Titre trop court (${titleLen}/30 min)`
        : titleLen > 70
        ? `Titre trop long (${titleLen}/70 max)`
        : `Titre de bonne longueur (${titleLen} caractères)`,
    weight: 15,
  });

  // Description length (100-300 chars ideal)
  const descLen = property.description.length;
  checks.push({
    name: "description_length",
    passed: descLen >= 100,
    message:
      descLen < 100
        ? `Description trop courte (${descLen}/100 min)`
        : `Description suffisamment détaillée (${descLen} caractères)`,
    weight: 20,
  });

  // Has images
  const imageCount = images.length;
  checks.push({
    name: "has_images",
    passed: imageCount >= 3,
    message:
      imageCount < 3
        ? `Manque de photos (${imageCount}/3 min)`
        : `${imageCount} photos ajoutées`,
    weight: 20,
  });

  // Has cover image
  const hasCover = images.some((img) => img.is_cover);
  checks.push({
    name: "has_cover",
    passed: hasCover,
    message: hasCover
      ? "Image de couverture définie"
      : "Aucune image de couverture",
    weight: 5,
  });

  // Has alt text on images
  const imagesWithAlt = images.filter((img) => img.alt && img.alt.trim().length > 0);
  checks.push({
    name: "image_alt",
    passed: imagesWithAlt.length === imageCount && imageCount > 0,
    message:
      imageCount === 0
        ? "Aucune image"
        : `${imagesWithAlt.length}/${imageCount} images avec texte alt`,
    weight: 10,
  });

  // Has price
  checks.push({
    name: "has_price",
    passed: property.price > 0,
    message: property.price > 0 ? "Prix défini" : "Prix manquant",
    weight: 10,
  });

  // Has location
  const hasLocation =
    property.location_city.length > 0 && property.location_region.length > 0;
  checks.push({
    name: "has_location",
    passed: hasLocation,
    message: hasLocation ? "Localisation complète" : "Ville ou région manquante",
    weight: 10,
  });

  // Has multilingual
  const hasNl = property.title_nl && property.title_nl.length > 0;
  const hasEn = property.title_en && property.title_en.length > 0;
  checks.push({
    name: "multilingual",
    passed: !!hasNl && !!hasEn,
    message:
      hasNl && hasEn
        ? "Traductions NL et EN disponibles"
        : `Traductions manquantes (${[!hasNl && "NL", !hasEn && "EN"].filter(Boolean).join(", ")})`,
    weight: 10,
  });

  // Calculate score
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earnedWeight = checks
    .filter((c) => c.passed)
    .reduce((sum, c) => sum + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  return { score, checks };
}
