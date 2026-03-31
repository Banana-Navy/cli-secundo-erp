import { z } from "zod/v4";

export const documentSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  category: z.enum(["contrat", "facture", "compromis", "acte", "photo", "plan", "diagnostic", "autre"]),
  notes: z.string(),
  client_id: z.string().uuid().optional().or(z.literal("")),
  property_id: z.string().uuid().optional().or(z.literal("")),
});

export type DocumentSchemaType = z.infer<typeof documentSchema>;
