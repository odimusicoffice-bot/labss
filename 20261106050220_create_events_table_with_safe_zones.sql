/*
# Create events table with Safe Zone RLS

## 1. Events table (new)
- Stores all map events including Safe Zones
- `is_safe_zone` boolean — marks VIP-only locations

## 2. RLS with Safe Zone protection
- All users (anon + authenticated) can read non-safe-zone events
- Only authenticated users with role 'vip' or 'admin' can read safe zone events
- Authenticated users can insert/update/delete non-safe-zone events
- Only admin can insert/update/delete safe zone events

## 3. Seed data
- Insert all current hardcoded events and safe zones

## 4. Profile roles
- Add 'vip' and 'artist' to the allowed role values
*/

CREATE TABLE IF NOT EXISTS events (
  id integer PRIMARY KEY,
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
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON events TO authenticated;

-- Non-safe-zone events: visible to everyone
DROP POLICY IF EXISTS "public_read_non_safe_events" ON events;
CREATE POLICY "public_read_non_safe_events" ON events FOR SELECT
  TO anon, authenticated
  USING (is_safe_zone = false);

-- Safe-zone events: visible only to vip and admin users
DROP POLICY IF EXISTS "vip_read_safe_events" ON events;
CREATE POLICY "vip_read_safe_events" ON events FOR SELECT
  TO authenticated
  USING (
    is_safe_zone = true
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vip', 'admin')
    )
  );

-- Authenticated users can insert non-safe-zone events; admin can insert safe zones
DROP POLICY IF EXISTS "insert_events" ON events;
CREATE POLICY "insert_events" ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    is_safe_zone = false
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update: non-safe-zone for authenticated, all for admin
DROP POLICY IF EXISTS "update_events" ON events;
CREATE POLICY "update_events" ON events FOR UPDATE
  TO authenticated
  USING (
    is_safe_zone = false
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    is_safe_zone = false
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Delete: non-safe-zone for authenticated, all for admin
DROP POLICY IF EXISTS "delete_events" ON events;
CREATE POLICY "delete_events" ON events FOR DELETE
  TO authenticated
  USING (
    is_safe_zone = false
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON events TO service_role;

-- Seed events
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

-- Update profiles role constraint to allow 'vip' and 'artist'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('member', 'artist', 'vip', 'admin'));
