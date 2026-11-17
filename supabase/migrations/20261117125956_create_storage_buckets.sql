/*
# Create storage buckets and RLS policies for Cloud, avatars, and site content

## Purpose
The Cloud page uploads audio files via `supabase.storage.from('tracks')`, but the
database currently has zero storage buckets and zero storage policies on
`storage.objects`. With RLS enabled and no policies, every storage operation is
denied — so uploads from the Cloud page fail. This migration creates the three
buckets the app needs and the policies that let authenticated users upload/read
their own files while keeping everything public for read access.

## Buckets created (all public, for getPublicUrl compatibility)
1. `tracks` — audio files uploaded from the Cloud page.
   - Allowed MIME types: MP3, WAV, AIFF, FLAC, OGG, M4A.
   - Max file size: 100 MB.
2. `avatars` — user avatar and cover images.
   - Allowed MIME types: JPEG, PNG, WebP, GIF.
   - Max file size: 5 MB.
3. `site-content` — homepage hero/JET images managed by admin panel.
   - Allowed MIME types: JPEG, PNG, WebP.
   - Max file size: 5 MB.

## Storage policies on storage.objects
### tracks bucket
- SELECT (read): public — anyone can read/play uploaded audio (anon + authenticated).
  The Cloud page uses getPublicUrl, so public read is required.
- INSERT (upload): authenticated only, first path segment must equal the user's id.
  The Cloud page uploads to `${user.id}/${timestamp}.${ext}`.
- UPDATE: authenticated only, own folder.
- DELETE: authenticated only, own folder.

### avatars bucket
- SELECT (read): public — profile pictures and covers are visible to everyone.
- INSERT (upload): authenticated only, own folder.
- UPDATE: authenticated only, own folder.
- DELETE: authenticated only, own folder.

### site-content bucket
- SELECT (read): public — homepage images are visible to everyone.
- INSERT (upload): authenticated only (admin edits homepage content).
- UPDATE: authenticated only.
- DELETE: authenticated only.

## Important notes
1. All three buckets are marked `public = true` so that `getPublicUrl()` returns
   a URL that works without authentication headers for reads.
2. Folder-scoped write policies use `(storage.foldername(name))[1] = auth.uid()::text`
   to ensure users can only write inside their own folder (first path segment).
3. The Cloud page already uploads to `${user.id}/...` so the folder-scoped policy
   matches the code without any frontend changes.
*/

-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('tracks', 'tracks', true, 104857600, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/aiff', 'audio/x-aiff', 'audio/flac', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('site-content', 'site-content', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. tracks bucket policies
DROP POLICY IF EXISTS "tracks_public_read" ON storage.objects;
CREATE POLICY "tracks_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'tracks');

DROP POLICY IF EXISTS "tracks_insert_own_folder" ON storage.objects;
CREATE POLICY "tracks_insert_own_folder" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'tracks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "tracks_update_own_folder" ON storage.objects;
CREATE POLICY "tracks_update_own_folder" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tracks' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'tracks' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "tracks_delete_own_folder" ON storage.objects;
CREATE POLICY "tracks_delete_own_folder" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'tracks' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. avatars bucket policies
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own_folder" ON storage.objects;
CREATE POLICY "avatars_insert_own_folder" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_update_own_folder" ON storage.objects;
CREATE POLICY "avatars_update_own_folder" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_delete_own_folder" ON storage.objects;
CREATE POLICY "avatars_delete_own_folder" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. site-content bucket policies
DROP POLICY IF EXISTS "site_content_public_read" ON storage.objects;
CREATE POLICY "site_content_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'site-content');

DROP POLICY IF EXISTS "site_content_insert_authed" ON storage.objects;
CREATE POLICY "site_content_insert_authed" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'site-content');

DROP POLICY IF EXISTS "site_content_update_authed" ON storage.objects;
CREATE POLICY "site_content_update_authed" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-content')
  WITH CHECK (bucket_id = 'site-content');

DROP POLICY IF EXISTS "site_content_delete_authed" ON storage.objects;
CREATE POLICY "site_content_delete_authed" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'site-content');
