import { Spinner } from '@/components/spinner';

interface SmartCopySectionProps {
    hasTitleBlurred: boolean;
    title: string;
    isGenerating: boolean;
    generatedText: string | null;
    generateError: string | null;
    onGenerate: () => void;
    onDiscard: () => void;
    onApply: () => void;
}

export function SmartCopySection({
    hasTitleBlurred,
    title,
    isGenerating,
    generatedText,
    generateError,
    onGenerate,
    onDiscard,
    onApply,
}: SmartCopySectionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                    Description
                </label>
                {hasTitleBlurred && title.trim() !== '' && (
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isGenerating ? <Spinner className="w-4 h-4 mr-2" /> : "✨ "}
                        {isGenerating ? "Generating..." : "Generate with AI"}
                    </button>
                )}
            </div>

            {generateError && (
                <div className="mb-2 text-sm text-red-600">
                    {generateError}
                </div>
            )}

            {generatedText && (
                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <p className="text-sm text-indigo-900 mb-3 whitespace-pre-wrap">{generatedText}</p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onDiscard}
                            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            onClick={onApply}
                            className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Apply to Description
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
