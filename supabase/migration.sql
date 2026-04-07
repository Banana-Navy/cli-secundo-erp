-- ============================================================
-- ERP Secundo — Database Migration (idempotent)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ---------- Enums ----------

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('prospect', 'actif', 'inactif');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_type AS ENUM ('appel', 'email', 'visite', 'note');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('appartement', 'maison', 'villa', 'terrain', 'commercial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_condition AS ENUM ('neuf', 'bon_etat', 'a_renover', 'renove');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('disponible', 'reserve', 'vendu', 'retire');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------- Clients ----------

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  country text DEFAULT 'Belgique',
  notes text DEFAULT '',
  status client_status NOT NULL DEFAULT 'prospect',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Contacts (interactions) ----------

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type contact_type NOT NULL DEFAULT 'note',
  subject text NOT NULL DEFAULT '',
  content text DEFAULT '',
  date timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Properties ----------

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  surface numeric NOT NULL DEFAULT 0,
  rooms integer NOT NULL DEFAULT 0,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  property_type property_type NOT NULL DEFAULT 'appartement',
  condition property_condition NOT NULL DEFAULT 'bon_etat',
  status property_status NOT NULL DEFAULT 'disponible',
  location_city text DEFAULT '',
  location_region text DEFAULT '',
  location_address text DEFAULT '',
  latitude numeric,
  longitude numeric,
  features jsonb NOT NULL DEFAULT '{}',
  year_built integer,
  energy_rating text DEFAULT '',
  slug text UNIQUE NOT NULL,
  published boolean NOT NULL DEFAULT false,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Property Images ----------

CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Indexes ----------

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_date ON contacts(date DESC);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_client_id ON properties(client_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON property_images(property_id, sort_order);

-- ---------- Updated_at triggers ----------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- Row Level Security ----------

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users full access on clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users full access on contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users full access on properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users full access on property_images" ON property_images;
DROP POLICY IF EXISTS "Public read published properties" ON properties;
DROP POLICY IF EXISTS "Public read images of published properties" ON property_images;

-- Authenticated users can do everything (single-tenant ERP)
CREATE POLICY "Authenticated users full access on clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access on contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access on properties"
  ON properties FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access on property_images"
  ON property_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public read access for published properties (API publique)
CREATE POLICY "Public read published properties"
  ON properties FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Public read images of published properties"
  ON property_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.published = true
    )
  );

-- ---------- Storage Bucket ----------

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

-- ============================================================
-- Multilingual properties + reference
-- ============================================================

-- Reference unique (ex: SEC-0001)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS reference text UNIQUE;

-- Multilingual title/description (FR is the existing title/description columns)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS title_nl text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS title_en text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_nl text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_en text DEFAULT '';

-- Rename slug → slug_fr (preserves existing UNIQUE constraint)
ALTER TABLE properties RENAME COLUMN slug TO slug_fr;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug_nl text UNIQUE DEFAULT NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug_en text UNIQUE DEFAULT NULL;

-- Indexes for new slugs and reference
CREATE INDEX IF NOT EXISTS idx_properties_slug_fr ON properties(slug_fr);
CREATE INDEX IF NOT EXISTS idx_properties_slug_nl ON properties(slug_nl);
CREATE INDEX IF NOT EXISTS idx_properties_slug_en ON properties(slug_en);
CREATE INDEX IF NOT EXISTS idx_properties_reference ON properties(reference);

-- ============================================================
-- Settings & Campaigns (for integrations)
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  encrypted boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mailchimp_campaign_id text,
  subject text NOT NULL DEFAULT '',
  property_ids uuid[] NOT NULL DEFAULT '{}',
  list_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for settings & campaigns
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access on settings" ON settings;
CREATE POLICY "Authenticated users full access on settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on campaigns" ON campaigns;
CREATE POLICY "Authenticated users full access on campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- ============================================================
-- Tasks, Visits, Documents, Notifications, Pipeline
-- ============================================================

-- ---------- New Enums ----------

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('a_faire', 'en_cours', 'termine', 'annule');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('basse', 'normale', 'haute', 'urgente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('planifiee', 'confirmee', 'effectuee', 'annulee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE interest_status AS ENUM ('interesse', 'visite_planifiee', 'offre_faite', 'refuse', 'achete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------- Tasks ----------

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  status task_status NOT NULL DEFAULT 'a_faire',
  priority task_priority NOT NULL DEFAULT 'normale',
  due_date timestamptz,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_property_id ON tasks(property_id);

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- Visits (Agenda) ----------

CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  visit_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status visit_status NOT NULL DEFAULT 'planifiee',
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_client_id ON visits(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_property_id ON visits(property_id);

DROP TRIGGER IF EXISTS visits_updated_at ON visits;
CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- Documents ----------

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  file_path text NOT NULL DEFAULT '',
  file_size integer NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  category text DEFAULT 'autre',
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- ---------- Notifications ----------

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  message text DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ---------- Client-Property Interests (Pipeline) ----------

CREATE TABLE IF NOT EXISTS client_property_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status interest_status NOT NULL DEFAULT 'interesse',
  notes text DEFAULT '',
  score integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_client_id ON client_property_interests(client_id);
CREATE INDEX IF NOT EXISTS idx_interests_property_id ON client_property_interests(property_id);
CREATE INDEX IF NOT EXISTS idx_interests_status ON client_property_interests(status);

DROP TRIGGER IF EXISTS interests_updated_at ON client_property_interests;
CREATE TRIGGER interests_updated_at
  BEFORE UPDATE ON client_property_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- RLS for new tables ----------

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_property_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access on tasks" ON tasks;
CREATE POLICY "Authenticated users full access on tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on visits" ON visits;
CREATE POLICY "Authenticated users full access on visits"
  ON visits FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on documents" ON documents;
CREATE POLICY "Authenticated users full access on documents"
  ON documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on interests" ON client_property_interests;
CREATE POLICY "Authenticated users full access on interests"
  ON client_property_interests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ---------- RPC for GringoAI readonly queries ----------

CREATE OR REPLACE FUNCTION execute_readonly_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only allow SELECT statements
  IF NOT (trim(lower(query)) ~* '^(select|with)') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  -- Block dangerous keywords
  IF lower(query) ~* '(insert|update|delete|drop|alter|create|truncate|grant|revoke)' THEN
    RAISE EXCEPTION 'Modification queries are not allowed';
  END IF;
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- ---------- Documents Storage Bucket ----------

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can read documents" ON storage.objects;
CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- ============================================================
-- Spy Concurrent (Veille concurrentielle)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE snapshot_type AS ENUM ('metadata', 'ranking', 'reviews', 'social', 'sitemap', 'seo', 'swot');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------- Competitors ----------

CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  website_url text DEFAULT '',
  google_maps_url text DEFAULT '',
  facebook_url text DEFAULT '',
  instagram_url text DEFAULT '',
  linkedin_url text DEFAULT '',
  youtube_url text DEFAULT '',
  tiktok_url text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_name ON competitors(name);

DROP TRIGGER IF EXISTS competitors_updated_at ON competitors;
CREATE TRIGGER competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------- Competitor Snapshots ----------

CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  snapshot_type snapshot_type NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_competitor_id ON competitor_snapshots(competitor_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_type ON competitor_snapshots(snapshot_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON competitor_snapshots(created_at DESC);

-- ---------- Spy Alerts ----------

CREATE TABLE IF NOT EXISTS spy_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  alert_type text NOT NULL DEFAULT '',
  metric text NOT NULL DEFAULT '',
  old_value text DEFAULT '',
  new_value text DEFAULT '',
  change_percent numeric,
  message text DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spy_alerts_competitor_id ON spy_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_spy_alerts_read ON spy_alerts(read);
CREATE INDEX IF NOT EXISTS idx_spy_alerts_created_at ON spy_alerts(created_at DESC);

-- ---------- RLS for Spy Concurrent ----------

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spy_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access on competitors" ON competitors;
CREATE POLICY "Authenticated users full access on competitors"
  ON competitors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on competitor_snapshots" ON competitor_snapshots;
CREATE POLICY "Authenticated users full access on competitor_snapshots"
  ON competitor_snapshots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access on spy_alerts" ON spy_alerts;
CREATE POLICY "Authenticated users full access on spy_alerts"
  ON spy_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add 'youtube' to snapshot_type enum (idempotent)
DO $$ BEGIN
  ALTER TYPE snapshot_type ADD VALUE IF NOT EXISTS 'youtube';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Client Action Tracking Enhancements
-- ============================================================

-- Enrichir la table contacts avec durée et résultat
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS outcome text DEFAULT '';

-- Tracker les changements d'étape dans le pipeline
ALTER TABLE client_property_interests
  ADD COLUMN IF NOT EXISTS stage_changed_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_interests_stage_changed_at
  ON client_property_interests(stage_changed_at);
