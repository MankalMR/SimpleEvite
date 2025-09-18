-- Database reset script for Simple Evite application
-- Run this FIRST if you already have tables, then run database-schema.sql
-- WARNING: This will delete all existing data!

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "API can manage users" ON public.users;

DROP POLICY IF EXISTS "Users can view own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can insert own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can update own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can delete own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can manage designs" ON public.designs;

DROP POLICY IF EXISTS "Users can view own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can insert own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can update own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can delete own invitations" ON public.invitations;
DROP POLICY IF EXISTS "Anyone can view invitations by share token" ON public.invitations;
DROP POLICY IF EXISTS "Users can manage invitations" ON public.invitations;

DROP POLICY IF EXISTS "Anyone can insert RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can view RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Invitation owners can delete RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Anyone can manage RSVPs" ON public.rsvps;

DROP POLICY IF EXISTS "Authenticated users can upload designs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view design images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own design images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload designs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete design images" ON storage.objects;

-- Drop triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.invitations;

-- Drop function
DROP FUNCTION IF EXISTS handle_updated_at();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.rsvps;
DROP TABLE IF EXISTS public.invitations;
DROP TABLE IF EXISTS public.designs;
DROP TABLE IF EXISTS public.users;

-- Remove storage bucket (optional - comment out if you want to keep uploaded files)
-- DELETE FROM storage.buckets WHERE id = 'designs';

NOTIFY pgrst, 'reload schema';
