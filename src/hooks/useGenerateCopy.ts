import { useState } from 'react';
import { logger } from '@/lib/logger';

interface GenerateCopyParams {
    title: string;
    location: string;
    date: string;
    time: string;
    isDemo?: boolean;
}

export function useGenerateCopy() {
    const [hasTitleBlurred, setHasTitleBlurred] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);

    const generateCopy = async ({ title, location, date, time, isDemo = false }: GenerateCopyParams) => {
        setIsGenerating(true);
        setGenerateError(null);
        setGeneratedText(null);

        try {
            const response = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    location,
                    date,
                    time,
                    isDemo,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate copy');
            }

            const data = await response.json();
            setGeneratedText(data.suggestion);
        } catch (err) {
            setGenerateError('Could not generate text. Please try again.');
            logger.error({ error: err }, 'AI Generate Copy Error');
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        hasTitleBlurred,
        setHasTitleBlurred,
        isGenerating,
        generatedText,
        setGeneratedText,
        generateError,
        generateCopy,
    };
}
