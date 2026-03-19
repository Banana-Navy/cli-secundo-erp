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
