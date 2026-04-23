import { z } from "zod/v4";

export const documentSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  category: z.enum([
    "contrat", "facture", "compromis", "acte", "photo", "plan",
    "diagnostic", "carte_identite", "justificatif", "preuve_paiement",
    "video", "catalogue", "autre",
  ]),
  notes: z.string(),
  client_id: z.string().uuid().optional().or(z.literal("")),
  property_id: z.string().uuid().optional().or(z.literal("")),
  entity_id: z.string().uuid().or(z.literal("")).optional(),
  amount: z.coerce.number().optional(),
  visibility: z.string().optional(),
  description: z.string().optional(),
});

export type DocumentSchemaType = z.infer<typeof documentSchema>;
