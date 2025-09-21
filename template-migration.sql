-- Migration: Add default templates table
-- Run this in Supabase SQL Editor

-- Create default_templates table
CREATE TABLE IF NOT EXISTS default_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  occasion VARCHAR(100) NOT NULL, -- 'birthday', 'christmas', 'new-year', 'thanksgiving', 'diwali', 'satyanarayan', 'housewarming'
  theme VARCHAR(100) NOT NULL,    -- 'elegant', 'vibrant', 'modern'
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_default_templates_occasion ON default_templates(occasion);
CREATE INDEX IF NOT EXISTS idx_default_templates_theme ON default_templates(theme);
CREATE INDEX IF NOT EXISTS idx_default_templates_active ON default_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_default_templates_sort ON default_templates(sort_order);

-- Enable RLS (Row Level Security)
ALTER TABLE default_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (templates are public)
CREATE POLICY "Templates are viewable by everyone" ON default_templates
  FOR SELECT USING (is_active = true);

-- Create policy for admin write access (you'll need to adjust this based on your admin setup)
CREATE POLICY "Only admins can manage templates" ON default_templates
  FOR ALL USING (auth.jwt() ->> 'email' = 'your-admin-email@example.com');

-- Update the updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_default_templates_updated_at
    BEFORE UPDATE ON default_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();