import { z } from "zod/v4";

export const clientSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.email("Email invalide").or(z.literal("")),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  notes: z.string(),
  status: z.enum(["prospect", "actif", "inactif"]),
  nationality: z.string(),
  lead_source: z.enum([
    "site_web", "publicite", "catalogue", "immoweb", "idealista",
    "bouche_a_oreille", "salon", "reseaux_sociaux", "apporteur_affaire", "autre",
  ]),
  lead_source_detail: z.string(),
  lead_temperature: z.enum(["froid", "tiede", "neutre", "chaud", "tres_chaud"]),
  referrer_name: z.string(),
  regions_of_interest: z.array(z.string()),
  callback_date: z.string(),
  utm_source: z.string(),
  utm_medium: z.string(),
  utm_campaign: z.string(),
  utm_content: z.string(),
  utm_term: z.string(),
  entity_ids: z.array(z.string()),
});

export type ClientSchemaType = z.infer<typeof clientSchema>;

export const contactSchema = z.object({
  client_id: z.string().uuid("Client invalide"),
  type: z.enum(["appel", "email", "visite", "note", "courrier", "sms", "whatsapp", "catalogue", "salon", "rdv"]),
  subject: z.string().min(1, "Le sujet est requis"),
  content: z.string(),
  date: z.string().min(1, "La date est requise"),
  duration_minutes: z.number().int().positive().nullable().optional(),
  outcome: z.enum(["positif", "neutre", "sans_reponse", "negatif", ""]).optional(),
});

export type ContactSchemaType = z.infer<typeof contactSchema>;
