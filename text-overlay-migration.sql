-- Migration to add text overlay styling options to invitations table
-- Run this SQL in your Supabase SQL Editor

-- Add text overlay styling columns to invitations table
ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS text_overlay_style TEXT DEFAULT 'light' CHECK (text_overlay_style IN ('light', 'dark', 'vibrant', 'muted', 'elegant', 'bold')),
ADD COLUMN IF NOT EXISTS text_position TEXT DEFAULT 'center' CHECK (text_position IN ('center', 'top', 'bottom', 'left', 'right')),
ADD COLUMN IF NOT EXISTS text_size TEXT DEFAULT 'large' CHECK (text_size IN ('small', 'medium', 'large', 'extra-large')),
ADD COLUMN IF NOT EXISTS text_shadow BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS text_background BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS text_background_opacity DECIMAL(3,2) DEFAULT 0.3 CHECK (text_background_opacity >= 0 AND text_background_opacity <= 1);

-- Add comment to document the new columns
COMMENT ON COLUMN public.invitations.text_overlay_style IS 'Style theme for text overlay: light, dark, vibrant, muted, elegant, bold';
COMMENT ON COLUMN public.invitations.text_position IS 'Position of text overlay: center, top, bottom, left, right';
COMMENT ON COLUMN public.invitations.text_size IS 'Size of text overlay: small, medium, large, extra-large';
COMMENT ON COLUMN public.invitations.text_shadow IS 'Whether to apply text shadow for better readability';
COMMENT ON COLUMN public.invitations.text_background IS 'Whether to add a semi-transparent background behind text';
COMMENT ON COLUMN public.invitations.text_background_opacity IS 'Opacity of text background (0.0 to 1.0)';
