/*
# Set Super Admin role for odimusic.office@gmail.com

The profile for odimusic.office@gmail.com was created before the auto-admin trigger
was added, so the role was never automatically set to 'admin'. This migration
updates it directly.
*/

UPDATE profiles
SET role = 'admin'
WHERE email = 'odimusic.office@gmail.com';
