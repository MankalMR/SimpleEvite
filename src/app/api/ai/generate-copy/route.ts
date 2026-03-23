import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, location, date, time } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    // Mock an external AI call returning a suggested description
    let suggestion = `Join us for ${title}!`;

    const details = [];
    if (date) {
      details.push(`on ${date}`);
    }
    if (time) {
      details.push(`at ${time}`);
    }
    if (location) {
      details.push(`at ${location}`);
    }

    if (details.length > 0) {
      suggestion += ` We're hosting it ${details.join(' ')}.`;
    }

    suggestion += " It's going to be a great time, and we'd love to see you there.";

    return NextResponse.json({ suggestion }, { status: 200 });
  } catch (error) {
    logger.error({ error }, 'Failed to generate copy');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
