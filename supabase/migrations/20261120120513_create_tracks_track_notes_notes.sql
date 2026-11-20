/*
# Create tracks, track_notes, and notes tables

## 1. tracks table
User's music tracks uploaded from the Cloud page.
- id (uuid, PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid(), FK to auth.users)
- title (text, NOT NULL)
- artist (text, nullable)
- bpm (integer, nullable)
- key_signature (text, nullable)
- status (text: 'demo' | 'master' | 'released', default 'demo')
- starred (boolean, default false)
- lyrics (text, nullable)
- cover_url (text, nullable)
- file_url (text, nullable — public URL from tracks storage bucket)
- duration (integer, nullable — seconds)
- created_at (timestamptz, default now())

## 2. track_notes table
Timecoded notes attached to a track.
- id (uuid, PK)
- track_id (uuid, NOT NULL, FK to tracks ON DELETE CASCADE)
- timecode (integer, NOT NULL — seconds)
- text (text, NOT NULL)
- created_at (timestamptz, default now())

## 3. notes table
Rich-text notes (Notes page). Owner-scoped.
- id (uuid, PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid(), FK to auth.users)
- title (text, NOT NULL)
- content (text, nullable — HTML)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

## 4. Security
All three tables: authenticated-only, owner-scoped via auth.uid() = user_id.
track_notes scoped through parent tracks ownership via EXISTS subquery.
*/

-- ==================== tracks ====================
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text,
  bpm integer,
  key_signature text,
  status text NOT NULL DEFAULT 'demo',
  starred boolean NOT NULL DEFAULT false,
  lyrics text,
  cover_url text,
  file_url text,
  duration integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tracks TO authenticated;

CREATE INDEX IF NOT EXISTS tracks_user_id_idx ON tracks (user_id);

DROP POLICY IF EXISTS "select_own_tracks" ON tracks;
CREATE POLICY "select_own_tracks" ON tracks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tracks" ON tracks;
CREATE POLICY "insert_own_tracks" ON tracks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tracks" ON tracks;
CREATE POLICY "update_own_tracks" ON tracks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tracks" ON tracks;
CREATE POLICY "delete_own_tracks" ON tracks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ==================== track_notes ====================
CREATE TABLE IF NOT EXISTS track_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  timecode integer NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE track_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON track_notes TO authenticated;

CREATE INDEX IF NOT EXISTS track_notes_track_id_idx ON track_notes (track_id);

DROP POLICY IF EXISTS "select_own_track_notes" ON track_notes;
CREATE POLICY "select_own_track_notes" ON track_notes FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tracks WHERE tracks.id = track_notes.track_id AND tracks.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_track_notes" ON track_notes;
CREATE POLICY "insert_own_track_notes" ON track_notes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM tracks WHERE tracks.id = track_notes.track_id AND tracks.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_track_notes" ON track_notes;
CREATE POLICY "update_own_track_notes" ON track_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM tracks WHERE tracks.id = track_notes.track_id AND tracks.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM tracks WHERE tracks.id = track_notes.track_id AND tracks.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_track_notes" ON track_notes;
CREATE POLICY "delete_own_track_notes" ON track_notes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tracks WHERE tracks.id = track_notes.track_id AND tracks.user_id = auth.uid())
  );

-- ==================== notes ====================
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes (user_id);

DROP POLICY IF EXISTS "select_own_notes" ON notes;
CREATE POLICY "select_own_notes" ON notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notes" ON notes;
CREATE POLICY "insert_own_notes" ON notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notes" ON notes;
CREATE POLICY "update_own_notes" ON notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notes" ON notes;
CREATE POLICY "delete_own_notes" ON notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
