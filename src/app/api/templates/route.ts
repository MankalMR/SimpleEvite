import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DefaultTemplate } from '@/lib/supabase';

// GET /api/templates - Get all active templates with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const occasion = searchParams.get('occasion');
    const theme = searchParams.get('theme');

    let query = supabaseAdmin
      .from('default_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Apply filters if provided
    if (occasion) {
      query = query.eq('occasion', occasion);
    }
    if (theme) {
      query = query.eq('theme', theme);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates: data || [] });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/templates - Create new template (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      occasion,
      theme,
      image_url,
      thumbnail_url,
      description,
      tags,
      sort_order
    } = body;

    // Validate required fields
    if (!name || !occasion || !theme || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: name, occasion, theme, image_url' },
        { status: 400 }
      );
    }

    // Validate occasion and theme values
    const validOccasions = ['birthday', 'christmas', 'new-year', 'thanksgiving', 'diwali', 'satyanarayan', 'housewarming'];
    const validThemes = ['elegant', 'vibrant', 'modern'];

    if (!validOccasions.includes(occasion)) {
      return NextResponse.json(
        { error: 'Invalid occasion. Must be one of: ' + validOccasions.join(', ') },
        { status: 400 }
      );
    }

    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be one of: ' + validThemes.join(', ') },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('default_templates')
      .insert({
        name,
        occasion,
        theme,
        image_url,
        thumbnail_url,
        description,
        tags: tags || [],
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
