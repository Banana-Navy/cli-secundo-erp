import { z } from "zod/v4";

export const mailchimpSettingsSchema = z.object({
  mailchimp_api_key: z.string().min(1, "La clé API est requise"),
  mailchimp_server_prefix: z
    .string()
    .min(1, "Le préfixe serveur est requis")
    .regex(/^us\d+$/, "Format invalide (ex: us21)"),
});

export const analyticsSettingsSchema = z.object({
  ga_property_id: z
    .string()
    .min(1, "L'ID de propriété est requis")
    .regex(/^\d+$/, "L'ID doit être numérique"),
  ga_credentials_json: z.string().min(1, "Les credentials JSON sont requis"),
});

export type MailchimpSettingsData = z.infer<typeof mailchimpSettingsSchema>;
export type AnalyticsSettingsData = z.infer<typeof analyticsSettingsSchema>;
