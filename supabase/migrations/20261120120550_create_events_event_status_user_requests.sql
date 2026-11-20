/*
# Create events, event_user_status, and user_requests tables

## 1. events table
Map events displayed on the Map page. Seeded from the frontend mapEvents data.
- id (serial, PK — integer to match frontend MapEvent.id)
- title (text, NOT NULL)
- type (text, NOT NULL — 'perform'|'studio'|'shoot'|'collab'|'event'|'learn'|'cover_dance'|'safe_zone')
- sub_category (text, NOT NULL)
- city (text, NOT NULL)
- country (text, NOT NULL)
- date (text, NOT NULL — display string like "Nov 15, 2026")
- lat (double precision, NOT NULL)
- lng (double precision, NOT NULL)
- major (boolean, default false)
- description (text, nullable)
- image_url (text, nullable)
- is_safe_zone (boolean, default false)
- created_at (timestamptz, default now())

## 2. event_user_status table
Tracks saved/visited events per user.
- user_id (uuid, FK to auth.users)
- event_id (integer, FK to events)
- saved (boolean, default false)
- visited (boolean, default false)
- PK (user_id, event_id)

## 3. user_requests table
User-submitted requests (event suggestions, artist submissions, etc.).
- id (uuid, PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid(), FK to auth.users)
- type (text, NOT NULL — 'event'|'artist_submission'|'vip_verification'|'audition'|'support'|'artist'|'profile_edit')
- status (text, NOT NULL DEFAULT 'pending' — 'pending'|'approved'|'rejected'|'resolved')
- title (text, nullable — derived display title for ProfilePage)
- description (text, nullable — derived display description for ProfilePage)
- target_view (text, nullable — navigation target for ProfilePage)
- payload (jsonb, NOT NULL DEFAULT '{}' — structured data, e.g. event suggestion fields)
- created_at (timestamptz, default now())

## 4. Security
### events — public read (anon + authenticated), no writes from frontend
### event_user_status — owner-scoped CRUD via auth.uid() = user_id
### user_requests — owner-scoped SELECT/INSERT for users; admin reads all via edge function (service_role bypasses RLS)
*/

-- ==================== events ====================
CREATE TABLE IF NOT EXISTS events (
  id serial PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL,
  sub_category text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  date text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  major boolean NOT NULL DEFAULT false,
  description text,
  image_url text,
  is_safe_zone boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON events TO anon, authenticated;

DROP POLICY IF EXISTS "events_public_read" ON events;
CREATE POLICY "events_public_read" ON events FOR SELECT
  TO anon, authenticated USING (true);

-- Seed events from frontend mapEvents data
INSERT INTO events (id, title, type, sub_category, city, country, date, lat, lng, major, description, image_url, is_safe_zone) VALUES
  (1, 'ODI Showcase Night', 'perform', 'live_concert', 'Seoul', 'Korea', 'Nov 15, 2026', 37.5665, 126.978, true, 'Exclusive performance showcase featuring ODI LABS artists and special guests.', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  (2, 'Studio Session Vol. 3', 'studio', 'recording', 'Moscow', 'Russia', 'Nov 22, 2026', 55.7558, 37.6173, true, 'Open recording studio session with live production and mixing.', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  (3, 'Underground Beats', 'event', 'event', 'Tokyo', 'Japan', 'Dec 1, 2026', 35.6762, 139.6503, true, 'A full-day event spotlighting emerging electronic and hip-hop talent.', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  (4, 'Vocal Workshop', 'learn', 'learn', 'Busan', 'Korea', 'Dec 8, 2026', 35.1796, 129.0756, false, 'Hands-on vocal training workshop led by industry professionals.', NULL, false),
  (5, 'Producer Meetup', 'collab', 'collab', 'Saint Petersburg', 'Russia', 'Dec 14, 2026', 59.9311, 30.3609, false, 'Networking and beat-making session for local producers.', NULL, false),
  (6, 'ODI Arena Live', 'perform', 'live_concert', 'Los Angeles', 'USA', 'Jan 10, 2027', 34.0522, -118.2437, true, 'Large-scale live performance at a premier LA venue.', 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  (7, 'Mixing Masterclass', 'learn', 'learn', 'Berlin', 'Germany', 'Jan 18, 2027', 52.52, 13.405, false, 'Advanced mixing techniques masterclass with certified engineers.', NULL, false),
  (8, 'Music Video Shoot', 'shoot', 'music_video', 'Bangkok', 'Thailand', 'Jan 25, 2027', 13.7563, 100.5018, false, 'Professional music video shoot with full production crew.', 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  (9, 'Open Mic Fridays', 'perform', 'open_mic', 'Tokyo', 'Japan', 'Feb 7, 2027', 35.6762, 139.6503, false, 'Weekly open mic night for singers, rappers, and poets.', NULL, false),
  (10, 'Rehearsal Space Booking', 'studio', 'rehearsal', 'Seoul', 'Korea', 'Feb 14, 2027', 37.5665, 126.978, false, 'Booked rehearsal time with full backline and monitoring.', NULL, false),
  (11, 'Artist Photoshoot', 'shoot', 'photoshoot', 'Los Angeles', 'USA', 'Feb 20, 2027', 34.0522, -118.2437, false, 'Professional artist photoshoot with creative direction.', NULL, false),
  (12, 'K-Cover Dance Battle', 'cover_dance', 'cover_dance', 'Seoul', 'Korea', 'Mar 1, 2027', 37.5665, 126.978, true, 'Cover dance competition with prizes and guest judges.', 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=600', false),
  (101, 'Safe Zone — Seoul Studio', 'safe_zone', 'safe_zone', 'Seoul', 'Korea', 'Always open', 37.5700, 126.9850, false, 'VIP-only safe space with private studio access and refreshments.', NULL, true),
  (102, 'Safe Zone — Tokyo Lounge', 'safe_zone', 'safe_zone', 'Tokyo', 'Japan', 'Always open', 35.6800, 139.6700, false, 'VIP members only. Private lounge and meeting space.', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Reset the serial sequence to avoid collisions with seeded IDs
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));

-- ==================== event_user_status ====================
CREATE TABLE IF NOT EXISTS event_user_status (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  saved boolean NOT NULL DEFAULT false,
  visited boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, event_id)
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

-- ==================== user_requests ====================
CREATE TABLE IF NOT EXISTS user_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  title text,
  description text,
  target_view text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON user_requests TO authenticated;

CREATE INDEX IF NOT EXISTS user_requests_user_id_idx ON user_requests (user_id);

DROP POLICY IF EXISTS "select_own_requests" ON user_requests;
CREATE POLICY "select_own_requests" ON user_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_requests" ON user_requests;
CREATE POLICY "insert_own_requests" ON user_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_requests" ON user_requests;
CREATE POLICY "update_own_requests" ON user_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
