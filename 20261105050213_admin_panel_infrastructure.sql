/*
# Admin panel infrastructure: email column, auto-admin trigger, site_content, user_requests, event_user_status

## 1. Profiles table changes
- Add `email` column (text, nullable) — synced from auth.users on insert
- Add a trigger that auto-sets role='admin' when the user's email is the Super Admin email

## 2. Site content table (new)
- `site_content` — single-row CMS table for homepage content
  - hero_title, hero_subtitle, hero_image_url, jet_image_url, about_legend
  - Seeded with a default row (id=1)

## 3. User requests table (new)
- `user_requests` — stores all types of user-submitted requests
  - type: 'event' | 'artist_submission' | 'vip_verification' | 'audition'
  - status: 'pending' | 'approved' | 'rejected' (default pending)
  - payload (jsonb), user_id, created_at

## 4. Event user status table (new)
- `event_user_status` — tracks saved/visited events per user

## Security
- RLS on all new tables
- site_content: readable by all, writable by admin only
- user_requests: owner-scoped CRUD + admin can read all
- event_user_status: owner-scoped CRUD
- Auto-admin trigger via SECURITY DEFINER function
*/

-- 1. Add email column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
GRANT UPDATE (username, avatar_url, bio, has_seen_vip_welcome, cover_url, email) ON profiles TO authenticated;

-- Auto-admin trigger: set role='admin' when email matches Super Admin
CREATE OR REPLACE FUNCTION public.auto_set_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'odimusic.office@gmail.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_auto_admin ON profiles;
CREATE TRIGGER profiles_auto_admin
  BEFORE INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_admin_role();

-- Sync email from auth.users on new profile insert
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  IF user_email IS NOT NULL AND NEW.email IS NULL THEN
    NEW.email := user_email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_email ON profiles;
CREATE TRIGGER profiles_sync_email
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();

-- Backfill emails for existing profiles
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;

-- 2. Site content table
CREATE TABLE IF NOT EXISTS site_content (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text NOT NULL DEFAULT 'DISCOVER THE SOUND',
  hero_subtitle text NOT NULL DEFAULT 'Studio without walls',
  hero_image_url text,
  jet_image_url text,
  about_legend text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON site_content TO anon, authenticated;
GRANT UPDATE ON site_content TO authenticated;

DROP POLICY IF EXISTS "read_site_content" ON site_content;
CREATE POLICY "read_site_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_site_content_admin" ON site_content;
CREATE POLICY "update_site_content_admin" ON site_content FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  );

INSERT INTO site_content (id, hero_title, hero_subtitle, about_legend)
VALUES (1, 'DISCOVER THE SOUND', 'Studio without walls', 'Three cities. One sound.')
ON CONFLICT (id) DO NOTHING;

-- 3. User requests table
CREATE TABLE IF NOT EXISTS user_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('event', 'artist_submission', 'vip_verification', 'audition')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_requests TO authenticated;

DROP POLICY IF EXISTS "select_own_requests" ON user_requests;
CREATE POLICY "select_own_requests" ON user_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_requests" ON user_requests;
CREATE POLICY "insert_own_requests" ON user_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_requests" ON user_requests;
CREATE POLICY "update_own_requests" ON user_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_requests" ON user_requests;
CREATE POLICY "delete_own_requests" ON user_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admin can see all requests
DROP POLICY IF EXISTS "admin_select_all_requests" ON user_requests;
CREATE POLICY "admin_select_all_requests" ON user_requests FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.email = 'odimusic.office@gmail.com')
    )
  );

-- 4. Event user status table
CREATE TABLE IF NOT EXISTS event_user_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id integer NOT NULL,
  saved boolean NOT NULL DEFAULT false,
  visited boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE event_user_status ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON event_user_status TO authenticated;

DROP POLICY IF EXISTS "select_own_event_status" ON event_user_status;
CREATE POLICY "select_own_event_status" ON event_user_status FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_event_status" ON event_user_status;
CREATE POLICY "insert_own_event_status" ON event_user_status FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_event_status" ON event_user_status;
CREATE POLICY "update_own_event_status" ON event_user_status FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_event_status" ON event_user_status;
CREATE POLICY "delete_own_event_status" ON event_user_status FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON user_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_requests_type ON user_requests(type);
CREATE INDEX IF NOT EXISTS idx_event_user_status_user ON event_user_status(user_id);

-- Grant service_role access (edge function uses it)
GRANT SELECT, INSERT, UPDATE, DELETE ON site_content, user_requests, event_user_status TO service_role;
GRANT SELECT, UPDATE ON profiles TO service_role;
