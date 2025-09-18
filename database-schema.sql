-- Database schema for Simple Evite application
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (standalone for NextAuth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- For NextAuth, we'll use a simpler approach since we don't have auth.uid()
-- Users can view all profiles (needed for app functionality)
CREATE POLICY "Users can view profiles" ON public.users
  FOR SELECT USING (true);

-- Only allow inserts and updates (handled by our API)
CREATE POLICY "API can manage users" ON public.users
  FOR ALL USING (true);

-- Designs table for reusable templates
CREATE TABLE IF NOT EXISTS public.designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Simplified policies for NextAuth
CREATE POLICY "Users can manage designs" ON public.designs
  FOR ALL USING (true);

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  share_token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Simplified policies for NextAuth
CREATE POLICY "Users can manage invitations" ON public.invitations
  FOR ALL USING (true);

-- RSVPs table
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  response TEXT CHECK (response IN ('yes', 'no', 'maybe')) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Simplified policies for NextAuth
CREATE POLICY "Anyone can manage RSVPs" ON public.rsvps
  FOR ALL USING (true);

-- Create storage bucket for design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Simplified storage policies for NextAuth
CREATE POLICY "Anyone can upload designs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'designs');

CREATE POLICY "Anyone can view design images" ON storage.objects
  FOR SELECT USING (bucket_id = 'designs');

CREATE POLICY "Anyone can delete design images" ON storage.objects
  FOR DELETE USING (bucket_id = 'designs');

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invitations updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
