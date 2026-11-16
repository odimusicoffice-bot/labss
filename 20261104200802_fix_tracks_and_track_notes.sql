/*
# Fix tracks table, create track_notes table, and set up tracks storage bucket

## 1. Tracks table fixes
Add missing columns: artist, starred, lyrics, cover_url, duration, key_signature

## 2. Track notes table (new)
- track_notes: id, track_id, user_id, timecode, text, created_at
- RLS enabled, owner-scoped CRUD for authenticated users

## 3. Storage bucket "tracks"
- Public bucket for audio files
- Policies: public read, owner write/delete

## Security
- RLS on track_notes (owner-scoped via auth.uid())
- RLS on storage.objects for tracks bucket
- Grants to authenticated on track_notes
*/

-- 1. Add missing columns to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS artist text;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS starred boolean NOT NULL DEFAULT false;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyrics text;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS duration integer;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS key_signature text;

-- 2. Create track_notes table
CREATE TABLE IF NOT EXISTS track_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  timecode integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE track_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON track_notes TO authenticated;

DROP POLICY IF EXISTS "select_own_track_notes" ON track_notes;
CREATE POLICY "select_own_track_notes" ON track_notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_track_notes" ON track_notes;
CREATE POLICY "insert_own_track_notes" ON track_notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_track_notes" ON track_notes;
CREATE POLICY "update_own_track_notes" ON track_notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_track_notes" ON track_notes;
CREATE POLICY "delete_own_track_notes" ON track_notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 3. Create public tracks storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks', 'tracks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tracks bucket
DROP POLICY IF EXISTS "tracks_bucket_public_read" ON storage.objects;
CREATE POLICY "tracks_bucket_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'tracks');

DROP POLICY IF EXISTS "tracks_bucket_owner_insert" ON storage.objects;
CREATE POLICY "tracks_bucket_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tracks' AND auth.uid() = owner);

DROP POLICY IF EXISTS "tracks_bucket_owner_update" ON storage.objects;
CREATE POLICY "tracks_bucket_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'tracks' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'tracks' AND auth.uid() = owner);

DROP POLICY IF EXISTS "tracks_bucket_owner_delete" ON storage.objects;
CREATE POLICY "tracks_bucket_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'tracks' AND auth.uid() = owner);
