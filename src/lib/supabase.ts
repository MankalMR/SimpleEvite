import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  created_at: string;
}

export interface Design {
  id: string;
  user_id: string;
  name: string;
  image_url: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  design_id?: string; // UUID that references either designs.id or default_templates.id
  share_token: string;
  created_at: string;
  updated_at: string;
  // Text overlay styling options
  text_overlay_style?: 'light' | 'dark' | 'vibrant' | 'muted' | 'elegant' | 'bold';
  text_position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  text_size?: 'small' | 'medium' | 'large' | 'extra-large';
  text_shadow?: boolean;
  text_background?: boolean;
  text_background_opacity?: number;
}

export interface RSVP {
  id: string;
  invitation_id: string;
  name: string;
  response: 'yes' | 'no' | 'maybe';
  comment?: string;
  created_at: string;
}

export interface DefaultTemplate {
  id: string;
  name: string;
  occasion: 'birthday' | 'christmas' | 'new-year' | 'thanksgiving' | 'diwali' | 'satyanarayan' | 'housewarming';
  theme: 'elegant' | 'vibrant' | 'modern';
  image_url: string;
  thumbnail_url?: string;
  description?: string;
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
