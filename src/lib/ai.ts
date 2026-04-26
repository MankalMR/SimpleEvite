import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing from environment variables');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}
