-- ============================================================
-- ERP Secundo — Schema Fix Migration (for existing databases)
-- Aligns DB columns with TypeScript types
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ---------- Tasks: add completed_at ----------
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- ---------- Visits: add location, notes, agent_id; drop description ----------
ALTER TABLE visits ADD COLUMN IF NOT EXISTS location text DEFAULT '';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
-- Migrate existing description data to notes if description exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'description') THEN
    UPDATE visits SET notes = description WHERE (notes IS NULL OR notes = '') AND description IS NOT NULL AND description != '';
    ALTER TABLE visits DROP COLUMN description;
  END IF;
END $$;

-- ---------- Documents: rename file_path->file_url, mime_type->file_type, add notes/expires_at ----------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_path') THEN
    ALTER TABLE documents RENAME COLUMN file_path TO file_url;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'mime_type') THEN
    ALTER TABLE documents RENAME COLUMN mime_type TO file_type;
  END IF;
END $$;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- ---------- Notifications: rename link->href ----------
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'link') THEN
    ALTER TABLE notifications RENAME COLUMN link TO href;
  END IF;
END $$;

-- ---------- Secure execute_readonly_sql ----------
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
  -- Block dangerous SQL commands (using word boundaries to avoid false positives on column names like created_at, updated_at)
  IF lower(query) ~* '(insert\s+into|update\s+\w+\s+set|delete\s+from|\ydrop\y|\yalter\y|\ytruncate\y|\ygrant\y|\yrevoke\y|\ycopy\y)' THEN
    RAISE EXCEPTION 'Modification queries are not allowed';
  END IF;
  -- Execute in a read-only transaction to guarantee no side effects
  SET LOCAL transaction_read_only = on;
  EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (%s) t', query) INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
