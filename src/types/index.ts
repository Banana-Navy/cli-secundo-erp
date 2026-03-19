// ============================================================
// ERP Secundo — Shared TypeScript types
// ============================================================

// ---------- Enums ----------

export type ClientStatus = "prospect" | "actif" | "inactif";

export type ContactType = "appel" | "email" | "visite" | "note";

export type PropertyType =
  | "appartement"
  | "maison"
  | "villa"
  | "terrain"
  | "commercial";

export type PropertyCondition =
  | "neuf"
  | "bon_etat"
  | "a_renover"
  | "renove";

export type PropertyStatus =
  | "disponible"
  | "reserve"
  | "vendu"
  | "retire";

export type Lang = "fr" | "nl" | "en";

// ---------- Database row types ----------

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  type: ContactType;
  subject: string;
  content: string;
  date: string;
  created_by: string;
  created_at: string;
}

export interface PropertyFeatures {
  piscine?: boolean;
  garage?: boolean;
  terrasse?: boolean;
  jardin?: boolean;
  climatisation?: boolean;
  chauffage?: boolean;
  ascenseur?: boolean;
  parking?: boolean;
  vue_mer?: boolean;
  meuble?: boolean;
  [key: string]: boolean | undefined;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  property_type: PropertyType;
  condition: PropertyCondition;
  status: PropertyStatus;
  location_city: string;
  location_region: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  features: PropertyFeatures;
  year_built: number | null;
  energy_rating: string;
  reference: string | null;
  title_nl: string;
  title_en: string;
  description_nl: string;
  description_en: string;
  slug_fr: string;
  slug_nl: string;
  slug_en: string;
  published: boolean;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

// ---------- Joined / extended types ----------

export interface PropertyWithImages extends Property {
  property_images: PropertyImage[];
}

export interface PropertyWithClient extends Property {
  clients: Pick<Client, "id" | "first_name" | "last_name"> | null;
}

export interface PropertyFull extends Property {
  property_images: PropertyImage[];
  clients: Pick<Client, "id" | "first_name" | "last_name"> | null;
}

export interface ClientWithContacts extends Client {
  contacts: Contact[];
}

export interface ClientWithProperties extends Client {
  properties: Property[];
}

// ---------- Form input types ----------

export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  status: ClientStatus;
}

export interface ContactFormData {
  client_id: string;
  type: ContactType;
  subject: string;
  content: string;
  date: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  property_type: PropertyType;
  condition: PropertyCondition;
  status: PropertyStatus;
  location_city: string;
  location_region: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  features: PropertyFeatures;
  year_built: number | null;
  energy_rating: string;
  reference: string;
  title_nl: string;
  title_en: string;
  description_nl: string;
  description_en: string;
  slug_fr: string;
  slug_nl: string;
  slug_en: string;
  published: boolean;
  client_id: string | null;
}

// ---------- API / Pagination ----------

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------- Dashboard ----------

export interface DashboardStats {
  totalProperties: number;
  propertiesSoldThisMonth: number;
  totalClients: number;
  newClientsThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: "property_added" | "property_sold" | "client_added" | "contact_added";
  title: string;
  description: string;
  created_at: string;
}

export interface MonthlySalesData {
  month: string;
  count: number;
  revenue: number;
}

export interface SalesPerformance {
  totalRevenue: number;
  avgSalePrice: number;
  avgDaysToSell: number;
  totalSold: number;
}

export interface ActionItem {
  id: string;
  type: "no_photos" | "stale" | "unpublished" | "inactive_client" | "long_reservation";
  title: string;
  description: string;
  href: string;
  count: number;
}

// ---------- Settings & Integrations ----------

export interface Setting {
  key: string;
  value: string;
  encrypted: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface Campaign {
  id: string;
  mailchimp_campaign_id: string | null;
  subject: string;
  property_ids: string[];
  list_id: string;
  status: string;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MailchimpList {
  id: string;
  name: string;
  member_count: number;
}

// ---------- RSS ----------

export interface RSSArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  thumbnail?: string;
}

// ---------- Analytics ----------

export interface AnalyticsData {
  pageViews: number;
  sessions: number;
  avgDuration: number;
  bounceRate: number;
  dailyPageViews: { date: string; views: number }[];
  topPages: AnalyticsTopPage[];
  trafficSources: TrafficSource[];
}

export interface AnalyticsTopPage {
  path: string;
  title: string;
  views: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

// ---------- Label maps (for display) ----------

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  prospect: "Prospect",
  actif: "Actif",
  inactif: "Inactif",
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  appel: "Appel",
  email: "Email",
  visite: "Visite",
  note: "Note",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  appartement: "Appartement",
  maison: "Maison",
  villa: "Villa",
  terrain: "Terrain",
  commercial: "Commercial",
};

export const PROPERTY_CONDITION_LABELS: Record<PropertyCondition, string> = {
  neuf: "Neuf",
  bon_etat: "Bon état",
  a_renover: "À rénover",
  renove: "Rénové",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: "Disponible",
  reserve: "Réservé",
  vendu: "Vendu",
  retire: "Retiré",
};

export const FEATURES_LABELS: Record<string, string> = {
  piscine: "Piscine",
  garage: "Garage",
  terrasse: "Terrasse",
  jardin: "Jardin",
  climatisation: "Climatisation",
  chauffage: "Chauffage",
  ascenseur: "Ascenseur",
  parking: "Parking",
  vue_mer: "Vue mer",
  meuble: "Meublé",
};
