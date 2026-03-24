import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getGeminiClient } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, location, date, time, isDemo } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    if (isDemo) {
      // Mock an external AI call returning a suggested description (Fallback)
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
    }

    // Call Gemini API if the environment variable is present
    if (!process.env.GEMINI_API_KEY) {
      logger.error('GEMINI_API_KEY is missing. Failing silently.');
      return NextResponse.json({ error: 'AI generation not configured.' }, { status: 500 });
    }

    try {
      const prompt = `Write a short, engaging invitation description for an event titled "${title}". ${date ? `The event is on ${date}.` : ''} ${time ? `The event is at ${time}.` : ''} ${location ? `It will be held at ${location}.` : ''} Keep it under 3 sentences and friendly.`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
        contents: prompt,
      });

      if (response && response.text) {
        return NextResponse.json({ suggestion: response.text.trim() }, { status: 200 });
      } else {
        logger.error('Unexpected Gemini SDK response structure');
        return NextResponse.json({ error: 'Failed to parse generated copy.' }, { status: 500 });
      }
    } catch (err) {
      logger.error({ error: err }, 'Error calling Gemini API');
      return NextResponse.json({ error: 'Failed to generate copy.' }, { status: 500 });
    }
  } catch (error) {
    logger.error({ error }, 'Failed to generate copy');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
