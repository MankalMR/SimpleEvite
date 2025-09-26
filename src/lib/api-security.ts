import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security';

/**
 * Security middleware for API routes
 */
export async function withSecurity(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: {
      limit: number;
      windowMs?: number;
    };
    allowedMethods?: string[];
  } = {}
) {
  const {
    requireAuth = false,
    rateLimit,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
  } = options;

  try {
    // Method validation
    if (!allowedMethods.includes(request.method || '')) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        {
          status: 405,
          headers: {
            'Allow': allowedMethods.join(', '),
          },
        }
      );
    }

    // Rate limiting
    if (rateLimit) {
      const clientIP = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

      const rateLimitResult = checkRateLimit(
        `${clientIP}:${request.nextUrl.pathname}`,
        rateLimit.limit,
        rateLimit.windowMs
      );

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': rateLimit.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = await handler(request);
      response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

      return response;
    }

    // Authentication check
    if (requireAuth) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Content-Type validation for POST/PUT requests
    if (['POST', 'PUT'].includes(request.method || '')) {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json(
          { error: 'Content-Type must be application/json' },
          { status: 400 }
        );
      }
    }

    return handler(request);
  } catch (error) {
    console.error('Security middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * CORS middleware for API routes
 */
export function withCORS(
  response: NextResponse,
  options: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  } = {}
) {
  const {
    origin = process.env.NEXT_PUBLIC_SITE_URL || '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = true,
  } = options;

  // Set CORS headers
  if (Array.isArray(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin.join(', '));
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));

  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

/**
 * Input validation middleware
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  validator: (data: unknown) => { isValid: boolean; errors: Record<string, string>; sanitizedData?: T }
): Promise<{ success: boolean; data?: T; errors?: Record<string, string> }> {
  try {
    const body = await request.json();
    const validation = validator(body);

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    return { success: true, data: validation.sanitizedData };
  } catch {
    return {
      success: false,
      errors: { body: 'Invalid JSON in request body' }
    };
  }
}

/**
 * Security headers for responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers that might not be covered by Next.js config
  response.headers.set('X-Request-ID', generateRequestId());
  response.headers.set('X-API-Version', '1.0');

  return response;
}

/**
 * Generate unique request ID for logging
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
  };

  // In production, send to monitoring service (e.g., Sentry, DataDog)
  console.warn('Security Event:', logEntry);
}

/**
 * Rate limiting presets for different API endpoints
 */
export const RATE_LIMIT_PRESETS = {
  STRICT: { limit: 10, windowMs: 60000 }, // 10 requests per minute
  NORMAL: { limit: 30, windowMs: 60000 }, // 30 requests per minute
  LENIENT: { limit: 100, windowMs: 60000 }, // 100 requests per minute
  RSVP: { limit: 5, windowMs: 60000 }, // 5 RSVP submissions per minute
  UPLOAD: { limit: 5, windowMs: 300000 }, // 5 uploads per 5 minutes
} as const;
