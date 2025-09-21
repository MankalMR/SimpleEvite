import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/templates/[id] - Get single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { data, error } = await supabaseAdmin
      .from('default_templates')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('Error fetching template:', error);
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Error in GET /api/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/templates/[id] - Update template (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('default_templates')
      .update(body)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Error in PUT /api/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/templates/[id] - Delete template (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { error } = await supabaseAdmin
      .from('default_templates')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
