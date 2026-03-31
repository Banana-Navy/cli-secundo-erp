import { z } from "zod/v4";

export const taskSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string(),
  status: z.enum(["a_faire", "en_cours", "termine", "annule"]),
  priority: z.enum(["basse", "normale", "haute", "urgente"]),
  due_date: z.string().optional(),
  client_id: z.string().uuid().optional().or(z.literal("")),
  property_id: z.string().uuid().optional().or(z.literal("")),
});

export type TaskSchemaType = z.infer<typeof taskSchema>;
