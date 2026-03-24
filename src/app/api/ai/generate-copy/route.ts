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

// Call an external LLM API if the environment variable is present
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Write a short, engaging invitation description for an event titled "${title}".
${date ? `The event is on ${date}.` : ''}
${time ? `The event is at ${time}.` : ''}
${location ? `It will be held at ${location}.` : ''}
Keep it under 3 sentences and friendly.`;

        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
          }),
        });

        if (openAiResponse.ok) {
          const openAiData = await openAiResponse.json();
          if (openAiData.choices && openAiData.choices.length > 0) {
            const generatedText = openAiData.choices[0].message.content.trim();
            return NextResponse.json({ suggestion: generatedText }, { status: 200 });
          }
        } else {
          logger.warn({ status: openAiResponse.status }, 'OpenAI API request failed, falling back to mock');
        }
      } catch (err) {
        logger.error({ error: err }, 'Error calling OpenAI API, falling back to mock');
      }
    }

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
  } catch (error) {
    logger.error({ error }, 'Failed to generate copy');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
