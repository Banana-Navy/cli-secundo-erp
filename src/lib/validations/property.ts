import { z } from "zod/v4";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugMessage =
  "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets";

export const propertySchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  surface: z.coerce.number().min(0, "La superficie doit être positive"),
  rooms: z.coerce.number().int().min(0, "Nombre de pièces invalide"),
  bedrooms: z.coerce.number().int().min(0, "Nombre de chambres invalide"),
  bathrooms: z.coerce.number().int().min(0, "Nombre de salles de bain invalide"),
  property_type: z.enum([
    "appartement",
    "maison",
    "villa",
    "terrain",
    "commercial",
  ]),
  condition: z.enum(["neuf", "bon_etat", "a_renover", "renove"]),
  status: z.enum(["disponible", "reserve", "vendu", "retire"]).default("disponible"),
  location_city: z.string().min(1, "La ville est requise"),
  location_region: z.string(),
  location_address: z.string(),
  latitude: z.coerce.number().nullable().default(null),
  longitude: z.coerce.number().nullable().default(null),
  features: z
    .record(z.string(), z.boolean())
    .default({}),
  year_built: z.coerce.number().int().nullable().default(null),
  energy_rating: z.string(),
  reference: z.string().default(""),
  title_nl: z.string().default(""),
  title_en: z.string().default(""),
  description_nl: z.string().default(""),
  description_en: z.string().default(""),
  slug_fr: z
    .string()
    .min(1, "Le slug FR est requis")
    .regex(slugRegex, slugMessage),
  slug_nl: z
    .string()
    .regex(slugRegex, slugMessage)
    .or(z.literal(""))
    .default(""),
  slug_en: z
    .string()
    .regex(slugRegex, slugMessage)
    .or(z.literal(""))
    .default(""),
  published: z.boolean().default(false),
  client_id: z.string().uuid().nullable().default(null),
  entity_id: z.string().uuid().nullable().default(null),
  promoter_id: z.string().uuid().nullable().default(null),
  category: z.string().default("residentiel"),
  youtube_urls: z.array(z.string()).default([]),
  publication_status: z.enum(["brouillon", "en_attente", "approuve", "refuse"]).default("brouillon"),
});

export type PropertySchemaType = z.infer<typeof propertySchema>;
