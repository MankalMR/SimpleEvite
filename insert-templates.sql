-- Insert Template Data
-- Run this in Supabase SQL Editor after running the migration

-- Clear existing templates (optional)
-- DELETE FROM default_templates;

-- Birthday Templates
INSERT INTO default_templates (name, occasion, theme, image_url, thumbnail_url, description, tags, sort_order) VALUES
('Elegant Birthday Celebration', 'birthday', 'elegant',
 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&crop=center',
 'Sophisticated birthday invitation with gold accents',
 ARRAY['elegant', 'birthday', 'adult', 'formal', 'sophisticated'], 11),

('Fun Birthday Party', 'birthday', 'vibrant',
 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',
 'Colorful and playful birthday party invitation',
 ARRAY['vibrant', 'birthday', 'kids', 'colorful', 'fun'], 12),

('Modern Birthday Invite', 'birthday', 'modern',
 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop&crop=center',
 'Clean and contemporary birthday design',
 ARRAY['modern', 'birthday', 'minimalist', 'contemporary'], 13),

-- Christmas Templates
('Elegant Christmas Gathering', 'christmas', 'elegant',
 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop&crop=center',
 'Sophisticated Christmas celebration with gold and red',
 ARRAY['elegant', 'christmas', 'holiday', 'winter', 'formal', 'sophisticated'], 21),

('Festive Christmas Party', 'christmas', 'vibrant',
 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=300&fit=crop&crop=center',
 'Bright and cheerful Christmas party invitation',
 ARRAY['vibrant', 'christmas', 'holiday', 'winter', 'colorful', 'fun'], 22),

('Modern Christmas Event', 'christmas', 'modern',
 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&h=300&fit=crop&crop=center',
 'Contemporary Christmas design with clean lines',
 ARRAY['modern', 'christmas', 'holiday', 'winter', 'minimalist', 'contemporary'], 23),

-- New Year Templates
('Elegant New Year Gala', 'new-year', 'elegant',
 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=300&fit=crop&crop=center',
 'Glamorous New Year celebration with sparkles',
 ARRAY['elegant', 'new-year', 'party', 'celebration', 'formal', 'sophisticated'], 31),

('Vibrant New Year Bash', 'new-year', 'vibrant',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop&crop=center',
 'Energetic New Year party with fireworks',
 ARRAY['vibrant', 'new-year', 'party', 'celebration', 'colorful', 'fun'], 32),

('Modern New Year Celebration', 'new-year', 'modern',
 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=300&fit=crop&crop=center',
 'Sleek New Year design with geometric elements',
 ARRAY['modern', 'new-year', 'party', 'celebration', 'minimalist', 'contemporary'], 33),

-- Thanksgiving Templates
('Elegant Thanksgiving Dinner', 'thanksgiving', 'elegant',
 'https://images.unsplash.com/photo-1574972645531-6c1c9e65a6b2?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1574972645531-6c1c9e65a6b2?w=400&h=300&fit=crop&crop=center',
 'Warm and sophisticated Thanksgiving gathering',
 ARRAY['elegant', 'thanksgiving', 'family', 'autumn', 'formal', 'sophisticated'], 41),

('Festive Thanksgiving Feast', 'thanksgiving', 'vibrant',
 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=400&h=300&fit=crop&crop=center',
 'Colorful Thanksgiving celebration with harvest theme',
 ARRAY['vibrant', 'thanksgiving', 'family', 'autumn', 'colorful', 'fun'], 42),

('Modern Thanksgiving Gathering', 'thanksgiving', 'modern',
 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop&crop=center',
 'Contemporary Thanksgiving design with clean typography',
 ARRAY['modern', 'thanksgiving', 'family', 'autumn', 'minimalist', 'contemporary'], 43),

-- Diwali Templates
('Elegant Diwali Celebration', 'diwali', 'elegant',
 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&h=300&fit=crop&crop=center',
 'Traditional Diwali invitation with gold and deep colors',
 ARRAY['elegant', 'diwali', 'traditional', 'festival', 'formal', 'sophisticated'], 51),

('Vibrant Diwali Festival', 'diwali', 'vibrant',
 'https://images.unsplash.com/photo-1636372988464-1c6b5b0c1b7b?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1636372988464-1c6b5b0c1b7b?w=400&h=300&fit=crop&crop=center',
 'Bright and colorful Diwali celebration with diyas',
 ARRAY['vibrant', 'diwali', 'traditional', 'festival', 'colorful', 'fun'], 52),

('Modern Diwali Gathering', 'diwali', 'modern',
 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=400&h=300&fit=crop&crop=center',
 'Contemporary Diwali design with traditional elements',
 ARRAY['modern', 'diwali', 'traditional', 'festival', 'minimalist', 'contemporary'], 53),

-- Satyanarayan Templates
('Traditional Satyanarayan Puja', 'satyanarayan', 'elegant',
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
 'Sacred and elegant Satyanarayan Vratam invitation',
 ARRAY['elegant', 'satyanarayan', 'religious', 'traditional', 'formal', 'sophisticated'], 61),

('Devotional Satyanarayan Ceremony', 'satyanarayan', 'vibrant',
 'https://images.unsplash.com/photo-1583736904331-e77c5b5e8e8b?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1583736904331-e77c5b5e8e8b?w=400&h=300&fit=crop&crop=center',
 'Colorful and devotional Satyanarayan celebration',
 ARRAY['vibrant', 'satyanarayan', 'religious', 'traditional', 'colorful', 'fun'], 62),

('Modern Satyanarayan Invitation', 'satyanarayan', 'modern',
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
 'Contemporary design for Satyanarayan Vratam',
 ARRAY['modern', 'satyanarayan', 'religious', 'traditional', 'minimalist', 'contemporary'], 63),

-- Housewarming Templates
('Elegant Housewarming Party', 'housewarming', 'elegant',
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center',
 'Sophisticated housewarming celebration invitation',
 ARRAY['elegant', 'housewarming', 'home', 'celebration', 'formal', 'sophisticated'], 71),

('Warm Housewarming Gathering', 'housewarming', 'vibrant',
 'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=400&h=300&fit=crop&crop=center',
 'Welcoming and colorful housewarming party',
 ARRAY['vibrant', 'housewarming', 'home', 'celebration', 'colorful', 'fun'], 72),

('Modern Housewarming Event', 'housewarming', 'modern',
 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&crop=center',
 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop&crop=center',
 'Clean and contemporary housewarming design',
 ARRAY['modern', 'housewarming', 'home', 'celebration', 'minimalist', 'contemporary'], 73);

-- Verify the data
SELECT occasion, theme, name FROM default_templates ORDER BY sort_order;
