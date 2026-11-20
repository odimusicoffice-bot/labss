/*
# Create profiles and site_content tables

## 1. profiles table
Stores user profile data linked to Supabase Auth. One row per user.
- id (uuid, PK, matches auth.users.id)
- username (text, the display name — aliased as "name" in frontend queries)
- email (text, copied from auth for admin user listing)
- role (text, single primary role: 'member' | 'artist' | 'vip' | 'admin', defaults to 'member')
- roles (text[], array of role badges for profile display)
- bio (text, nullable)
- avatar_url (text, nullable)
- cover_url (text, nullable)
- bonuses (integer, defaults to 0)
- created_at (timestamptz, defaults to now())

## 2. site_content table
Single-row table (id=1) for homepage content managed by admin panel.

## 3. Security
### profiles — owner-scoped CRUD via auth.uid() = id
### site_content — public read, authenticated update
*/

-- ==================== profiles ====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT '',
  email text,
  role text NOT NULL DEFAULT 'member',
  roles text[] NOT NULL DEFAULT ARRAY['member']::text[],
  bio text,
  avatar_url text,
  cover_url text,
  bonuses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- ==================== site_content ====================
CREATE TABLE IF NOT EXISTS site_content (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text NOT NULL DEFAULT 'DISCOVER THE SOUND',
  hero_subtitle text NOT NULL DEFAULT 'Studio without walls',
  hero_image_url text NOT NULL DEFAULT '',
  jet_image_url text NOT NULL DEFAULT '',
  about_legend text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_content_single_row CHECK (id = 1)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON site_content TO anon, authenticated;
GRANT UPDATE ON site_content TO authenticated;

DROP POLICY IF EXISTS "site_content_public_read" ON site_content;
CREATE POLICY "site_content_public_read" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_content_authed_update" ON site_content;
CREATE POLICY "site_content_authed_update" ON site_content FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

INSERT INTO site_content (id, hero_title, hero_subtitle, hero_image_url, jet_image_url, about_legend)
VALUES (
  1,
  'DISCOVER THE SOUND',
  'Studio without walls',
  'https://images.pexels.com/photos/19330423/pexels-photo-19330423.jpeg?auto=compress&cs=tinysrgb&h=1200&w=800',
  '/images/IMG_0004.jpeg',
  'Three cities. One sound.'
) ON CONFLICT (id) DO NOTHING;
