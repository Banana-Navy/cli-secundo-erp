import { z } from "zod/v4";

export const promoterSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  country: z.string(),
  website: z.string(),
  phone: z.string(),
  email: z.email("Email invalide").or(z.literal("")),
  contact_person: z.string(),
  notes: z.string(),
  entity_id: z.string().uuid().or(z.literal("")).nullable(),
});

export type PromoterSchemaType = z.infer<typeof promoterSchema>;
