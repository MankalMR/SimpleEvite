import pino from 'pino';

// Helper to determine if we are running in the browser
const isBrowser = typeof window !== 'undefined';

// Enable logs if NEXT_PUBLIC_ENABLE_DEBUG_LOGS is explicitly '1', or default to true for development.
// In a real production environment without this flag, you may want to default to 'info' or 'error'.
const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === '1';

const defaultLevel = isDebugEnabled ? 'debug' : 'info';

const loggerConfig = {
    level: defaultLevel,
    browser: {
        // In the browser, we use the standard console.log/warn/error so we get source maps
        // and objects that are expandable in Chrome DevTools instead of plain JSON strings.
        asObject: true,
    },
    // We intentionally do not configure 'transport' with 'pino-pretty' here.
    // In Next.js App Router, Pino transports use worker threads which fail to bundle
    // into the server chunks, causing "MODULE_NOT_FOUND worker.js" errors.
    // For pretty logs in local dev, pipe the Next.js output to pino-pretty instead:
    // npm run dev | npx pino-pretty
};

export const logger = pino(loggerConfig);
