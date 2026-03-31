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

// ---------- Tasks ----------

export type TaskStatus = "a_faire" | "en_cours" | "termine" | "annule";
export type TaskPriority = "basse" | "normale" | "haute" | "urgente";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  client_id: string | null;
  property_id: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

// ---------- Visits (Agenda) ----------

export type VisitStatus = "planifiee" | "confirmee" | "effectuee" | "annulee";

export interface Visit {
  id: string;
  title: string;
  visit_date: string;
  duration_minutes: number;
  location: string;
  notes: string;
  status: VisitStatus;
  client_id: string | null;
  property_id: string | null;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitWithRelations extends Visit {
  clients: Pick<Client, "id" | "first_name" | "last_name"> | null;
  properties: Pick<Property, "id" | "title" | "reference"> | null;
}

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  planifiee: "Planifiée",
  confirmee: "Confirmée",
  effectuee: "Effectuée",
  annulee: "Annulée",
};

// ---------- Documents ----------

export interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  category: string;
  notes: string;
  client_id: string | null;
  property_id: string | null;
  expires_at: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ---------- Notifications ----------

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

// ---------- Pipeline (Client-Property Interests) ----------

export type InterestStatus = "nouveau" | "contacte" | "visite" | "offre" | "vendu";

export interface ClientPropertyInterest {
  id: string;
  client_id: string;
  property_id: string;
  status: InterestStatus;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface InterestWithRelations extends ClientPropertyInterest {
  clients: Pick<Client, "id" | "first_name" | "last_name" | "email" | "phone"> | null;
  properties: Pick<Property, "id" | "title" | "price" | "location_city" | "reference"> | null;
}

export const INTEREST_STATUS_LABELS: Record<InterestStatus, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  visite: "Visite",
  offre: "Offre",
  vendu: "Vendu",
};

// ---------- Spy Concurrent (Veille concurrentielle) ----------

export type SnapshotType =
  | "metadata"
  | "ranking"
  | "reviews"
  | "social"
  | "sitemap"
  | "seo"
  | "swot"
  | "youtube";

export interface Competitor {
  id: string;
  name: string;
  website_url: string;
  google_maps_url: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  tiktok_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitorSnapshot {
  id: string;
  competitor_id: string;
  snapshot_type: SnapshotType;
  data: Record<string, unknown>;
  created_at: string;
}

export interface SpyAlert {
  id: string;
  competitor_id: string;
  alert_type: string;
  metric: string;
  old_value: string;
  new_value: string;
  change_percent: number | null;
  message: string;
  read: boolean;
  created_at: string;
}

export const SNAPSHOT_TYPE_LABELS: Record<SnapshotType, string> = {
  metadata: "Métadonnées",
  ranking: "Classement",
  reviews: "Avis",
  social: "Réseaux sociaux",
  sitemap: "Sitemap",
  seo: "SEO",
  swot: "SWOT",
  youtube: "YouTube",
};
