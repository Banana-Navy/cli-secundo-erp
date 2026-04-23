import { z } from "zod/v4";

export const visitSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  visit_date: z.string().min(1, "La date est requise"),
  duration_minutes: z.number().min(15, "Minimum 15 minutes").max(480),
  location: z.string(),
  notes: z.string(),
  status: z.enum(["planifiee", "confirmee", "effectuee", "annulee"]),
  client_id: z.string().uuid().optional().or(z.literal("")),
  property_id: z.string().uuid().optional().or(z.literal("")),
  entity_id: z.string().uuid().or(z.literal("")).optional(),
  visit_type: z.string().optional(),
  assigned_agent_id: z.string().uuid().or(z.literal("")).optional(),
});

export type VisitSchemaType = z.infer<typeof visitSchema>;
